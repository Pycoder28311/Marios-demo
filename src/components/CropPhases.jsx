import { useEffect, useMemo, useRef, useState } from 'react'
import { LuMinus } from 'react-icons/lu'
import { PhaseIcon } from '../lib/icons'
import { buildOccupancy, cardSize, findSpot, isFree, pushIntoView } from '../lib/placement'
import { PHASES, imageSrc, inkOf, isActive, spanLabel, typeOf } from '../lib/phases'

const FADE_MS = 600 // fade in / fade out
const ANCHOR_MS = 2500 // how long a vanished card's spot stays reserved for the next card
const NUDGE = [40, 80] // px a new card is shifted from the spot of the one it replaces (each axis)

const CHIP = 36 // size of a minimized card (phones)

function Card({ phase, size, x, y, visible, delay, selected, onClick, minimizable, minimized, onToggleMinimize }) {
  // Mount hidden and switch on a frame later so new cards fade in instead of popping up.
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    let inner
    const outer = requestAnimationFrame(() => (inner = requestAnimationFrame(() => setMounted(true))))
    return () => {
      cancelAnimationFrame(outer)
      cancelAnimationFrame(inner)
    }
  }, [])
  const on = visible && mounted
  const wait = on ? delay : 0

  const { color } = typeOf(phase)
  const { variant, w, h } = size
  const mini = minimizable && minimized
  // A minimized card shrinks into a round icon button at its top-right corner.
  const activate = mini ? onToggleMinimize : onClick

  return (
    <div
      role="button"
      tabIndex={visible ? 0 : -1}
      onClick={activate}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          activate()
        }
      }}
      aria-hidden={!visible}
      aria-label={mini ? `Επαναφορά: ${phase.phase} · ${phase.crop}` : `${phase.phase} · ${phase.crop}`}
      className={`group absolute flex items-stretch overflow-hidden bg-surface/[0.88] text-left shadow-[0_6px_20px_rgba(0,0,0,0.45)] backdrop-blur-sm outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
        selected && !mini ? 'ring-2 ring-sky-400' : 'hover:ring-1 hover:ring-ink/35'
      } ${on ? 'pointer-events-auto cursor-pointer' : 'pointer-events-none'}`}
      style={{
        left: mini ? x + w - CHIP : x,
        top: y,
        width: mini ? CHIP : w,
        height: mini ? CHIP : h,
        borderRadius: mini ? CHIP / 2 : 3,
        boxShadow: mini ? `0 4px 14px rgba(0,0,0,0.45), inset 0 0 0 2px ${color}` : undefined,
        opacity: on ? 1 : 0,
        transform: `translateY(${on ? 0 : 8}px) scale(${on ? 1 : 0.96})`,
        transition: `opacity ${FADE_MS}ms ease ${wait}ms, transform ${FADE_MS}ms ease ${wait}ms, left 450ms ease, top 450ms ease, width 300ms ease, height 300ms ease, border-radius 300ms ease`,
      }}
    >
      {mini ? (
        <span className="flex h-full w-full items-center justify-center" style={{ color: inkOf(color) }}>
          <PhaseIcon name={phase.icon} className="h-[18px] w-[18px]" />
        </span>
      ) : (
        <>
          <div className="relative shrink-0 overflow-hidden" style={{ width: h }}>
            {phase.image ? (
              <img src={imageSrc(phase.image)} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" draggable={false} />
            ) : (
              <div className="h-full w-full" style={{ background: `${color}26` }} />
            )}
            <span
              className={`absolute bottom-1 right-1 flex items-center justify-center rounded-[3px] bg-surface/85 ${variant === 'compact' ? 'h-4 w-4' : 'h-6 w-6'}`}
              style={{ color: inkOf(color) }}
            >
              <PhaseIcon name={phase.icon} className={variant === 'compact' ? 'h-2.5 w-2.5' : 'h-3.5 w-3.5'} />
            </span>
            <span className="absolute inset-y-0 right-0 w-[3px]" style={{ background: color }} />
          </div>
          <div className={`flex min-w-0 flex-1 flex-col justify-center ${variant === 'compact' ? 'px-2' : 'px-3'} ${minimizable ? 'pr-6' : ''}`}>
            <div className={`truncate font-semibold uppercase tracking-[0.08em] ${variant === 'compact' ? 'text-[8px]' : 'text-[10px]'}`} style={{ color: inkOf(color) }}>
              {spanLabel(phase.months)} · {phase.crop}
            </div>
            <div className={`truncate font-semibold leading-tight text-ink ${variant === 'compact' ? 'text-[11px]' : variant === 'medium' ? 'text-[13px]' : 'text-sm'}`}>
              {phase.phase}
            </div>
            {variant !== 'compact' && phase.note && (
              <div className={`mt-0.5 text-[11px] leading-snug text-ink-3 ${variant === 'full' ? 'line-clamp-2' : 'truncate'}`}>{phase.note}</div>
            )}
          </div>
          {minimizable && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onToggleMinimize()
              }}
              className="absolute right-0.5 top-0.5 flex h-6 w-6 items-center justify-center rounded-[3px] text-muted hover:bg-ink/10 hover:text-ink"
              aria-label="Ελαχιστοποίηση"
              title="Ελαχιστοποίηση"
            >
              <LuMinus className="h-3.5 w-3.5" />
            </button>
          )}
        </>
      )}
    </div>
  )
}

// Crop-phase cards over the map, driven by the continuous timeline position. A phase
// appears a little after its first month starts and disappears a little before its last
// month ends. A new card takes over the spot of one that just vanished (shifted 40–80 px),
// or a random free spot; spots keep clear of the country, UI panels, edges and other cards.
// minimizable (phones): each card gets a minimize button that turns it into an icon chip.
export default function CropPhases({ progress, map, feature, layoutKey, selected, onSelect, minimizable = false }) {
  const root = useRef(null)
  const [cards, setCards] = useState([]) // { id, x, y, visible, hiddenAt, delay, anchorFree }
  const [size, setSize] = useState(() => cardSize(window.innerWidth))
  const [view, setView] = useState({ W: 0, H: 0 }) // current size of the map area
  const [minimized, setMinimized] = useState(() => new Set()) // phase ids shown as icon chips
  const toggleMinimized = (id) =>
    setMinimized((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  // Track the visible map area (it shrinks while the sidebar is open).
  useEffect(() => {
    const ro = new ResizeObserver(([entry]) => setView({ W: entry.contentRect.width, H: entry.contentRect.height }))
    ro.observe(root.current)
    return () => ro.disconnect()
  }, [])
  // Cards keep their home spot (x, y); this only shifts the ones that would be cut off.
  const shown = useMemo(() => pushIntoView(cards, size, view.W, view.H), [cards, size, view])

  // Only re-layout when the set of active phases changes, not on every animation frame.
  const activeKey = PHASES.flatMap((p, id) => (isActive(p, progress) ? [id] : [])).join(',')
  const active = useMemo(() => new Set(activeKey ? activeKey.split(',').map(Number) : []), [activeKey])

  useEffect(() => {
    if (!map) return

    // viewChanged: the user dragged or zoomed the map. Only then may visible cards move;
    // resizing (window, sidebar) never moves them.
    const layout = (viewChanged = false) => {
      const { x: W, y: H } = map.getSize()
      if (!W || !H) return
      const s = cardSize(window.innerWidth)
      const small = s.variant === 'compact'
      const opts = { edge: Math.max(small ? 10 : 20, Math.min(W, H) * 0.04), minGap: small ? 12 : 28 }
      const occ = buildOccupancy(map, feature, root.current.parentElement, small ? 4 : 10)
      const now = performance.now()
      setSize(s)

      setCards((prev) => {
        const rect = (c) => ({ x: c.x, y: c.y, w: s.w, h: s.h })
        const stillFading = (c) => now - c.hiddenAt < FADE_MS

        // Outgoing cards fade out in place; recently vanished ones keep their spot reserved.
        const gone = prev
          .filter((c) => !active.has(c.id) && (c.visible || now - c.hiddenAt < ANCHOR_MS))
          .map((c) => (c.visible ? { ...c, visible: false, hiddenAt: now, anchorFree: true } : { ...c }))
        const next = [...gone]

        // Visible cards stay put for every month of their range. Only after the map view
        // changed is a card moved, and only if its spot is no longer free.
        const staying = prev.filter((c) => active.has(c.id) && c.visible)
        const moved = []
        for (const c of staying) {
          const others = [...next.filter((o) => o.visible || stillFading(o)), ...staying.filter((o) => o !== c)].map(rect)
          if (!viewChanged || isFree(occ, rect(c), others, opts)) next.push(c)
          else moved.push(c.id)
        }

        // New cards take over a vanished card's spot, preferring the same crop's previous phase.
        const cropOf = (id) => PHASES[id].crop
        const anchors = () => next.filter((c) => !c.visible && c.anchorFree)
        const hasCropAnchor = (id) => anchors().some((a) => cropOf(a.id) === cropOf(id))
        const nudge = ([lo, hi]) => (Math.random() < 0.5 ? -1 : 1) * (lo + Math.random() * (hi - lo))
        const takeAnchor = (id) => {
          const settled = next.filter((c) => c.visible).map(rect)
          const order = anchors().sort((a, b) => (cropOf(b.id) === cropOf(id)) - (cropOf(a.id) === cropOf(id)))
          // The wanted 40–80 px shift first, then a slightly wider one if that spot is blocked.
          for (const range of [NUDGE, [NUDGE[0] / 2, NUDGE[1] * 1.6]])
            for (const a of order)
              for (let t = 0; t < 60; t++) {
                const r = { x: a.x + nudge(range), y: a.y + nudge(range), w: s.w, h: s.h }
                if (isFree(occ, r, settled, opts)) {
                  a.anchorFree = false
                  // If the replaced card is still fading out (e.g. after a jump), wait for it.
                  return { ...r, delay: Math.max(0, FADE_MS - (now - a.hiddenAt)) }
                }
              }
          return null
        }

        const incoming = [...active]
          .filter((id) => !staying.some((c) => c.id === id))
          .sort((a, b) => hasCropAnchor(b) - hasCropAnchor(a))
        for (const id of [...incoming, ...moved]) {
          const isMove = moved.includes(id)
          const spot =
            (!isMove && takeAnchor(id)) || findSpot(occ, s, next.filter((o) => o.visible || stillFading(o)).map(rect), opts)
          const ghost = next.findIndex((c) => c.id === id && !c.visible)
          if (ghost !== -1) next.splice(ghost, 1) // this same card's own reserved spot
          next.push({ id, x: Math.round(spot.x), y: Math.round(spot.y), visible: true, hiddenAt: 0, delay: spot.delay ?? 0, anchorFree: false })
        }
        return next
      })
    }

    let frame = requestAnimationFrame(() => layout())
    const relayout = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => layout(true))
    }
    // Card size follows the window; positions stay.
    const onWindowResize = () => setSize(cardSize(window.innerWidth))
    map.on('dragend zoomend', relayout)
    window.addEventListener('resize', onWindowResize)
    return () => {
      cancelAnimationFrame(frame)
      map.off('dragend zoomend', relayout)
      window.removeEventListener('resize', onWindowResize)
    }
  }, [active, map, feature, layoutKey])

  const credits = cards.filter((c) => c.visible && PHASES[c.id].credit).map((c) => PHASES[c.id].credit.split(' · Wikimedia')[0])

  return (
    <div ref={root} className="pointer-events-none absolute inset-0 z-[900] overflow-hidden">
      {cards.map((c) => (
        <Card
          key={c.id}
          phase={PHASES[c.id]}
          size={size}
          x={shown.get(c.id)?.x ?? c.x}
          y={shown.get(c.id)?.y ?? c.y}
          visible={c.visible}
          delay={c.delay}
          selected={selected === c.id}
          onClick={() => onSelect(c.id)}
          minimizable={minimizable}
          minimized={minimized.has(c.id)}
          onToggleMinimize={() => toggleMinimized(c.id)}
        />
      ))}
      <div data-obstacle className="absolute bottom-5 left-1/2 hidden w-[min(90%,900px)] -translate-x-1/2 truncate text-center text-[9px] text-white/45 sm:block">
        {credits.length > 0 && `Φωτογραφίες (Wikimedia Commons): ${credits.join(' · ')}`}
      </div>
    </div>
  )
}
