import { useEffect, useMemo, useState } from 'react'
import { LuCloudRain, LuSlidersHorizontal, LuX } from 'react-icons/lu'
import greece from '../data/greece.geo.json'
import data from '../data/rainfall-greece-average.json'
import { fillGaps, landMask, niceStep, stats } from '../lib/field'
import { useIsMobile, useIsNarrow } from '../lib/useMediaQuery'
import CropPhases from './CropPhases'
import InfoPanel from './InfoPanel'
import Legend from './Legend'
import RainMap from './RainMap'
import ThemeToggle from './ThemeToggle'
import Timeline from './Timeline'

const { grid } = data
const MONTH_MS = 3200 // playback speed: time per month
const nf = (v, digits = 1) => v.toLocaleString('el-GR', { maximumFractionDigits: digits, minimumFractionDigits: digits })

// Rainfall map + crop calendar: map with crop-phase cards, timeline and info sidebar.
export default function RainExplorer({ onClose, theme, onToggleTheme }) {
  const [progress, setProgress] = useState(0.5) // position on the year line, in months
  const [playing, setPlaying] = useState(false)
  const [selected, setSelected] = useState(null) // crop phase shown in the sidebar (null = closed)
  const [panelPhase, setPanelPhase] = useState(null) // keeps the content while the sidebar slides shut
  const [hover, setHover] = useState(null)
  const [scale, setScale] = useState('month')
  const [showContours, setShowContours] = useState(true)
  const [opacity, setOpacity] = useState(0.8)
  const [basemap, setBasemap] = useState(null)
  const [map, setMap] = useState(null)
  const [showSettings, setShowSettings] = useState(false) // phones: map controls folded away
  const isMobile = useIsMobile()
  const isNarrow = useIsNarrow()

  const monthCount = data.months.length
  const month = Math.floor(progress) % monthCount
  const raw = data.months[month].values
  const mask = useMemo(() => landMask(raw), [raw])
  const values = useMemo(() => fillGaps(raw), [raw])

  const monthStats = useMemo(() => data.months.map((m) => stats(m.values)), [])
  const means = useMemo(() => monthStats.map((s) => s.mean), [monthStats])
  const domain = useMemo(() => {
    if (scale === 'month') return [monthStats[month].min, monthStats[month].max]
    return [Math.min(...monthStats.map((s) => s.min)), Math.max(...monthStats.map((s) => s.max))]
  }, [scale, monthStats, month])
  const contourStep = niceStep(domain[1] - domain[0])

  // Playback: the position moves continuously along the year.
  useEffect(() => {
    if (!playing) return
    let frame
    let last = performance.now()
    const tick = (t) => {
      const dt = t - last // read before the (deferred) state updater runs
      last = t
      setProgress((p) => (p + dt / MONTH_MS) % monthCount)
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [playing, monthCount])

  const seek = (p) => {
    setPlaying(false)
    setProgress(((p % monthCount) + monthCount) % monthCount)
  }
  const select = (id) => {
    setSelected(id)
    setPanelPhase(id)
    setPlaying(false)
  }

  // Keyboard: ← → step, space play/pause, Esc closes the sidebar, then the window.
  useEffect(() => {
    const onKey = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return
      if (e.key === 'Escape') return selected != null ? setSelected(null) : onClose?.()
      if (e.key === 'ArrowRight') setProgress((p) => ((Math.floor(p) + 1) % monthCount) + 0.5)
      else if (e.key === 'ArrowLeft') setProgress((p) => ((Math.floor(p) - 1 + monthCount) % monthCount) + 0.5)
      else if (e.key === ' ') {
        e.preventDefault()
        setPlaying((p) => !p)
      } else return
      if (e.key !== ' ') setPlaying(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [monthCount, selected, onClose])

  return (
    <div className="flex h-full w-full flex-col bg-surface text-ink">
      {/* Header */}
      <header className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-ink/10 bg-surface px-3 py-2 sm:px-4 sm:py-2.5">
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:flex-none">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-sky-500/15 text-accent-ink">
            <LuCloudRain className="h-[18px] w-[18px]" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-[14px] font-semibold tracking-tight text-ink sm:text-[15px]">
              {isMobile ? 'Βροχόπτωση · Ελλάδα' : 'Βροχόπτωση και αγροτικός κύκλος · Ελλάδα'}
            </h1>
            <p className="truncate text-[11px] text-muted">
              {isMobile
                ? `${data.months[month].name} · μέσοι όροι ${data.period}`
                : `Μέση μηνιαία βροχόπτωση ${data.period} (${data.units}) · ισοϋέτιες ανά ${contourStep} ${data.units}`}
            </p>
          </div>
          {isMobile && (
            <div className="flex shrink-0 items-center">
              <button
                onClick={() => setShowSettings((v) => !v)}
                className={`flex h-8 w-8 items-center justify-center rounded-md hover:bg-ink/10 ${showSettings ? 'bg-ink/10 text-ink' : 'text-muted'}`}
                aria-label="Ρυθμίσεις χάρτη"
                aria-expanded={showSettings}
              >
                <LuSlidersHorizontal className="h-[18px] w-[18px]" />
              </button>
              {onToggleTheme && <ThemeToggle theme={theme} onToggle={onToggleTheme} />}
              {onClose && (
                <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-ink/10 hover:text-ink" aria-label="Κλείσιμο">
                  <LuX className="h-5 w-5" />
                </button>
              )}
            </div>
          )}
        </div>

        <div
          className={`flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-ink-3 ${isMobile ? (showSettings ? 'w-full justify-between pb-1' : 'hidden') : 'ml-auto'}`}
        >
          <div className="flex overflow-hidden rounded-[4px] ring-1 ring-ink/15" role="group" aria-label="Κλίμακα χρωμάτων">
            {[
              ['month', 'Κλίμακα μήνα'],
              ['year', 'Κλίμακα έτους'],
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setScale(key)}
                className={`px-2.5 py-1 font-medium ${scale === key ? 'bg-ink text-surface' : 'text-ink-3 hover:bg-ink/10'}`}
              >
                {label}
              </button>
            ))}
          </div>
          <label className="flex cursor-pointer select-none items-center gap-2">
            <input type="checkbox" checked={showContours} onChange={(e) => setShowContours(e.target.checked)} className="accent-sky-400" />
            Ισοϋέτιες
          </label>
          <label className="flex items-center gap-2">
            Αδιαφάνεια
            <input type="range" min="0.1" max="1" step="0.05" value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} className="w-20 accent-sky-400" />
          </label>
          {isMobile && (
            <p className="w-full text-[10px] leading-snug text-faint">
              Πηγή: {data.source}. Φωτογραφίες: Wikimedia Commons (δημιουργός και άδεια σε κάθε στάδιο).
            </p>
          )}
          {!isMobile && onToggleTheme && <ThemeToggle theme={theme} onToggle={onToggleTheme} />}
          {!isMobile && onClose && (
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-ink/10 hover:text-ink"
              aria-label="Κλείσιμο"
              title="Κλείσιμο (Esc)"
            >
              <LuX className="h-5 w-5" />
            </button>
          )}
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1">
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="relative min-h-0 flex-1">
            <RainMap
              values={values}
              mask={mask}
              grid={grid}
              domain={domain}
              feature={greece}
              contourStep={contourStep}
              showContours={showContours}
              opacity={opacity}
              onHover={setHover}
              onProvider={setBasemap}
              onMap={setMap}
            />

            <CropPhases
              progress={progress}
              map={map}
              feature={greece}
              layoutKey={`${basemap?.warning ?? ''}|${showSettings}`}
              selected={selected}
              onSelect={select}
              minimizable={isMobile}
            />

            {basemap?.warning && (
              <div data-obstacle className="absolute left-3 top-3 z-[1000] max-w-[calc(100%-5rem)] rounded-[4px] bg-surface/85 px-2.5 py-1.5 text-[10px] text-warn sm:text-[11px]">
                {isNarrow ? (
                  'Εικόνες Esri (χωρίς κλειδί Google)'
                ) : (
                  <>
                    Εικόνες Esri – {basemap.warning}. Ορίστε το στο <code>.env.local</code> για δορυφορικές εικόνες Google.
                  </>
                )}
              </div>
            )}

            <div data-obstacle className="absolute bottom-7 right-2 z-[1000] sm:bottom-8 sm:right-3">
              <Legend domain={domain} units={data.units} month={data.months[month].name} mean={monthStats[month].mean} compact={isMobile} />
            </div>

            {hover && hover.value != null && (
              <div className="pointer-events-none absolute bottom-10 left-3 z-[1000] rounded-[4px] bg-surface/85 px-2.5 py-1.5 text-xs tabular-nums text-ink-2">
                {nf(hover.lat, 2)}° Β {nf(hover.lon, 2)}° Α ·{' '}
                <span className="font-semibold text-ink">
                  {nf(hover.value)} {data.units}
                </span>
              </div>
            )}

            <div
              data-obstacle
              className="pointer-events-none absolute bottom-1 left-1/2 z-[1000] hidden max-w-[95%] -translate-x-1/2 truncate whitespace-nowrap text-[10px] text-white/60 sm:block"
            >
              Πηγή: {data.source}
            </div>
          </div>

          <Timeline
            months={data.months.map((m) => m.name)}
            means={means}
            progress={progress}
            onSeek={seek}
            playing={playing}
            onTogglePlay={() => setPlaying((p) => !p)}
            period={data.period}
            selected={selected}
            onSelect={select}
            compact={isMobile}
          />
        </div>

        {isNarrow ? (
          <>
            {/* Phones & tablets: a bottom sheet that slides up from below over a dimmed map */}
            <div
              className={`absolute inset-0 z-[1990] bg-black/40 transition-opacity duration-300 ${selected != null ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
              onClick={() => setSelected(null)}
            />
            <div
              aria-hidden={selected == null}
              className={`absolute inset-x-0 bottom-0 z-[2000] mx-auto h-[80%] max-w-2xl overflow-hidden rounded-t-xl bg-surface shadow-[0_-12px_40px_rgba(0,0,0,0.5)] transition-transform duration-300 ease-out ${
                selected != null ? 'translate-y-0' : 'translate-y-full'
              }`}
            >
              <div className="pointer-events-none absolute left-1/2 top-2 z-10 h-1 w-10 -translate-x-1/2 rounded-full bg-white/70" />
              {panelPhase != null && (
                <InfoPanel id={panelPhase} means={means} onClose={() => setSelected(null)} onSelect={select} onJump={(m) => seek(m + 0.5)} />
              )}
            </div>
          </>
        ) : (
          /* Sidebar: slides in from the right and pushes the map aside */
          <aside
            aria-hidden={selected == null}
            className={`z-[2000] shrink-0 overflow-hidden bg-surface transition-[width] duration-300 ease-out ${selected != null ? 'border-l border-ink/10' : ''}`}
            style={{ width: selected != null ? 380 : 0 }}
          >
            <div className="h-full w-[380px]">
              {panelPhase != null && (
                <InfoPanel id={panelPhase} means={means} onClose={() => setSelected(null)} onSelect={select} onJump={(m) => seek(m + 0.5)} />
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}
