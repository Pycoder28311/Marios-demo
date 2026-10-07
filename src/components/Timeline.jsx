import { useMemo, useRef, useState } from 'react'
import { LuPause, LuPlay } from 'react-icons/lu'
import { colorAt } from '../lib/field'
import { PhaseIcon } from '../lib/icons'
import { PHASES, SHORT_MONTHS, inkOf, isActive, spanLabel, timelineLanes, typeOf } from '../lib/phases'

const LANE_H = 20

function Lane({ segments, progress, n, selected, onSelect }) {
  return (
    <div className="relative" style={{ height: LANE_H }}>
      {segments.map((seg) => {
        const phase = PHASES[seg.id]
        const { color } = typeOf(phase)
        const on = isActive(phase, progress, n)
        const isSel = selected === seg.id
        return (
          <button
            key={`${seg.id}-${seg.start}`}
            type="button"
            onClick={() => onSelect(seg.id)}
            title={`${phase.phase} · ${phase.crop} (${spanLabel(phase.months)})`}
            className={`absolute top-0.5 flex h-4 items-center gap-1 overflow-hidden rounded-[2px] pl-1 pr-1.5 text-left transition-opacity duration-500 hover:opacity-100 ${
              isSel ? 'ring-1 ring-sky-400' : ''
            }`}
            style={{
              left: `calc(${(seg.start / n) * 100}% + 1px)`,
              width: `calc(${((seg.end - seg.start) / n) * 100}% - 2px)`,
              background: `${color}${on ? '38' : '1a'}`,
              borderLeft: `2px solid ${color}`,
              opacity: on || isSel ? 1 : 0.5,
            }}
          >
            <PhaseIcon name={phase.icon} className="h-3 w-3 shrink-0" style={{ color: inkOf(color) }} />
            {seg.label && (
              <span className="truncate text-[10px] font-medium leading-none text-ink/90">
                {phase.crop} · {phase.phase}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

// The line is the whole year: each month owns an equal stretch of it. Crop phases sit in
// lanes above and below it. The circle shows the current moment and can be dragged.
// compact (phones): no phase lanes, just the line with the moving circle.
export default function Timeline({ months, means, progress, onSeek, playing, onTogglePlay, period, selected, onSelect, compact = false }) {
  const track = useRef(null)
  const [dragging, setDragging] = useState(false)
  const n = months.length
  const peak = Math.max(...means, 1)
  const current = Math.floor(progress) % n

  const { segments, laneCount } = useMemo(() => timelineLanes(n), [n])
  const above = Math.ceil(laneCount / 2)
  const lane = (l) => segments.filter((s) => s.lane === l)

  const pct = (progress / n) * 100
  // Smooth jumps when a month is clicked; follow the pointer/animation directly otherwise.
  const slide = playing || dragging ? '' : 'left 450ms ease-out, width 450ms ease-out'

  const seekTo = (clientX) => {
    const { left, width } = track.current.getBoundingClientRect()
    onSeek(Math.min(n - 0.001, Math.max(0, ((clientX - left) / width) * n)))
  }

  return (
    <div className={`flex items-center border-t border-ink/10 bg-surface/95 ${compact ? 'gap-3 px-3 py-1.5' : 'gap-4 px-4 py-2'}`}>
      <button
        onClick={onTogglePlay}
        className={`flex shrink-0 items-center justify-center rounded-md bg-ink text-surface transition hover:bg-ink/85 ${compact ? 'h-9 w-9' : 'h-10 w-10'}`}
        aria-label={playing ? 'Παύση' : 'Αναπαραγωγή'}
        title={playing ? 'Παύση (κενό)' : 'Αναπαραγωγή (κενό)'}
      >
        {playing ? <LuPause className="h-[18px] w-[18px] fill-current" /> : <LuPlay className="ml-0.5 h-[18px] w-[18px] fill-current" />}
      </button>

      <div className={`min-w-0 flex-1 px-1 ${compact ? '' : 'overflow-x-auto'}`}>
        <div className={`relative ${compact ? '' : 'min-w-[640px]'}`}>
          {/* Phases above the line (nearest lane closest to the line) */}
          {!compact && Array.from({ length: above }, (_, i) => above - 1 - i).map((l) => (
            <Lane key={l} segments={lane(l)} progress={progress} n={n} selected={selected} onSelect={onSelect} />
          ))}

          {/* The year line with the draggable circle */}
          <div
            ref={track}
            role="slider"
            aria-label="Μήνας"
            aria-valuemin={0}
            aria-valuemax={n - 1}
            aria-valuenow={current}
            aria-valuetext={months[current]}
            className={`relative h-7 touch-none select-none ${dragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            onPointerDown={(e) => {
              setDragging(true)
              e.currentTarget.setPointerCapture(e.pointerId)
              seekTo(e.clientX)
            }}
            onPointerMove={(e) => dragging && seekTo(e.clientX)}
            onPointerUp={() => setDragging(false)}
            onPointerCancel={() => setDragging(false)}
          >
            <div className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-ink/15" />
            <div className="absolute left-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-sky-400" style={{ width: `${pct}%`, transition: slide }} />
            {Array.from({ length: n + 1 }, (_, i) => (
              <div
                key={i}
                className={`absolute top-1/2 h-2.5 w-px -translate-y-1/2 ${(i / n) * 100 <= pct ? 'bg-sky-400' : 'bg-faint'}`}
                style={{ left: `${(i / n) * 100}%` }}
              />
            ))}
            <div
              className={`pointer-events-none absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white shadow-[0_0_0_4px_rgba(56,189,248,0.35),0_2px_8px_rgba(0,0,0,0.6)] transition-[width,height] ${
                dragging ? 'h-6 w-6' : 'h-5 w-5'
              }`}
              style={{ left: `${pct}%`, background: colorAt(means[current] / peak), transition: [slide, 'background-color 800ms'].filter(Boolean).join(', ') }}
            />
          </div>

          {/* Phases below the line */}
          {!compact && Array.from({ length: laneCount - above }, (_, i) => above + i).map((l) => (
            <Lane key={l} segments={lane(l)} progress={progress} n={n} selected={selected} onSelect={onSelect} />
          ))}

          {/* Month labels, centred in their stretch */}
          <div className={`relative ${compact ? 'mt-0.5 h-4' : 'mt-1 h-7'}`}>
            {months.map((name, i) => (
              <button
                key={i}
                onClick={() => onSeek(i + 0.5, true)}
                className="absolute top-0 flex -translate-x-1/2 flex-col items-center whitespace-nowrap leading-tight"
                style={{ left: `${((i + 0.5) / n) * 100}%` }}
              >
                <span className={`font-medium ${compact ? 'text-[9px]' : 'text-[11px]'} ${i === current ? 'text-ink' : 'text-muted hover:text-ink-2'}`}>
                  {n === 12 ? SHORT_MONTHS[i] : name}
                </span>
                {!compact && (
                  <span className={`text-[10px] tabular-nums ${i === current ? 'text-accent-ink' : 'text-faint'}`}>
                    {Math.round(means[i]).toLocaleString('el-GR')} mm
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="hidden shrink-0 flex-col justify-center text-right sm:flex">
        <span className="text-lg font-semibold tabular-nums tracking-tight text-ink">{period}</span>
        <span className="text-[11px] text-muted">μέσος όρος ξηράς</span>
      </div>
    </div>
  )
}
