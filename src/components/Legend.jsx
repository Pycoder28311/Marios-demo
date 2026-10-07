import { RAMP } from '../lib/field'

const fmt = (v) => v.toLocaleString('el-GR', { maximumFractionDigits: 1 })

export default function Legend({ domain, units, month, mean, compact = false }) {
  // Phones: a slim horizontal bar.
  if (compact)
    return (
      <div className="w-36 rounded-[4px] bg-surface/[0.9] px-2 py-1.5 text-[10px] text-ink-2 shadow-[0_6px_20px_rgba(0,0,0,0.45)]">
        <div className="mb-1 flex justify-between">
          <span className="font-semibold text-ink">{month}</span>
          <span className="text-muted">{units}</span>
        </div>
        <div className="h-2 rounded-[2px]" style={{ background: `linear-gradient(to right, ${RAMP.join(',')})` }} />
        <div className="mt-0.5 flex justify-between tabular-nums">
          <span>{fmt(domain[0])}</span>
          <span className="text-muted">μέση {fmt(mean)}</span>
          <span>{fmt(domain[1])}</span>
        </div>
      </div>
    )

  return (
    <div className="w-40 rounded-[4px] bg-surface/[0.88] p-3 text-xs text-ink-2 shadow-[0_6px_20px_rgba(0,0,0,0.45)] backdrop-blur-sm">
      <div className="mb-2 font-semibold tracking-wide text-ink">
        {month} <span className="font-normal text-muted">· {units}</span>
      </div>
      <div className="flex gap-3">
        <div className="h-32 w-3.5 rounded-[2px]" style={{ background: `linear-gradient(to top, ${RAMP.join(',')})` }} />
        <div className="flex flex-col justify-between py-0.5">
          <span>
            <span className="text-muted">Υψηλή :</span> {fmt(domain[1])}
          </span>
          <span className="text-muted">
            μέση <span className="text-ink-2">{fmt(mean)}</span>
          </span>
          <span>
            <span className="text-muted">Χαμηλή :</span> {fmt(domain[0])}
          </span>
        </div>
      </div>
    </div>
  )
}
