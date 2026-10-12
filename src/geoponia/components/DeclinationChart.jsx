import { useMemo } from 'react'
import { declinationSeries, formatDay } from '../lib/astro'

const W = 720
const H = 270
const PAD = { l: 44, r: 16, t: 26, b: 34 }
const DEG = 30 // y axis ±30°
const nf1 = (v) => v.toLocaleString('el-GR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

// The Moon's declination over the coming days (computed), with ascending periods shaded in
// the accent colour and descending periods in brass; turning points are labelled.
export default function DeclinationChart({ start, days = 28 }) {
  const { points, turns } = useMemo(() => declinationSeries(start, days, 2), [start, days])
  const x = (date) => PAD.l + ((date - start) / (days * 86400000)) * (W - PAD.l - PAD.r)
  const y = (dec) => PAD.t + ((DEG - dec) / (2 * DEG)) * (H - PAD.t - PAD.b)

  // Ascending/descending stretches between turning points.
  const bounds = [start, ...turns.map((t) => t.date), new Date(start.getTime() + days * 86400000)]
  const stretches = bounds.slice(0, -1).map((from, i) => {
    const to = bounds[i + 1]
    const mid = new Date((from.getTime() + to.getTime()) / 2)
    const a = points.find((p) => p.date >= mid) ?? points.at(-1)
    const b = points.find((p) => p.date >= new Date(mid.getTime() + 7200000)) ?? points.at(-1)
    return { from, to, ascending: b.dec >= a.dec }
  })
  const path = points.map((p, i) => `${i ? 'L' : 'M'}${x(p.date).toFixed(1)},${y(p.dec).toFixed(1)}`).join('')
  const weeks = Array.from({ length: Math.floor(days / 7) + 1 }, (_, i) => new Date(start.getTime() + i * 7 * 86400000))

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Απόκλιση της Σελήνης τις επόμενες ημέρες">
      {stretches.map((s, i) => (
        <g key={i}>
          <rect
            x={x(s.from)}
            y={PAD.t}
            width={Math.max(0, x(s.to) - x(s.from))}
            height={H - PAD.t - PAD.b}
            fill={s.ascending ? 'var(--geo-accent)' : 'var(--geo-brass)'}
            opacity="0.1"
          />
          {x(s.to) - x(s.from) > 70 && (
            <text
              x={(x(s.from) + x(s.to)) / 2}
              y={PAD.t - 9}
              textAnchor="middle"
              fontSize="11"
              fontWeight="600"
              letterSpacing="0.08em"
              fill={s.ascending ? 'var(--geo-accent)' : 'var(--geo-brass)'}
            >
              {s.ascending ? 'ΑΝΟΔΙΚΗ' : 'ΚΑΘΟΔΙΚΗ'}
            </text>
          )}
        </g>
      ))}

      {/* Axes and grid */}
      {[-30, -15, 0, 15, 30].map((d) => (
        <g key={d}>
          <line x1={PAD.l} x2={W - PAD.r} y1={y(d)} y2={y(d)} stroke="var(--geo-rule)" strokeDasharray={d ? '2 4' : undefined} />
          <text x={PAD.l - 8} y={y(d) + 4} textAnchor="end" fontSize="11" fill="var(--geo-muted)">
            {d > 0 ? `+${d}°` : d < 0 ? `−${-d}°` : '0°'}
          </text>
        </g>
      ))}
      <text x={W - PAD.r} y={y(0) - 5} textAnchor="end" fontSize="10.5" fill="var(--geo-muted)">
        ουράνιος ισημερινός
      </text>
      {weeks.map((d, i) => (
        <g key={i}>
          <line x1={x(d)} x2={x(d)} y1={H - PAD.b} y2={H - PAD.b + 5} stroke="var(--geo-muted)" />
          <text x={x(d)} y={H - PAD.b + 18} textAnchor={i ? 'middle' : 'start'} fontSize="11" fill="var(--geo-muted)">
            {i ? formatDay(d) : 'σήμερα'}
          </text>
        </g>
      ))}

      <path d={path} fill="none" stroke="var(--geo-ink)" strokeWidth="2" />

      {turns.map((t) => (
        <g key={t.date.getTime()}>
          <circle cx={x(t.date)} cy={y(t.dec)} r="4" fill="var(--geo-surface)" stroke="var(--geo-ink)" strokeWidth="1.5" />
          <text x={x(t.date)} y={y(t.dec) + (t.type === 'max' ? -10 : 18)} textAnchor="middle" fontSize="11" fill="var(--geo-ink)">
            {t.dec > 0 ? '+' : '−'}
            {nf1(Math.abs(t.dec))}° · {formatDay(t.date)}
          </text>
        </g>
      ))}
      <circle cx={x(start)} cy={y(points[0].dec)} r="4.5" fill="var(--geo-accent)" />
    </svg>
  )
}
