import { formatWeekday } from '../lib/astro'
import { useMoonToday } from '../lib/useMoonToday'
import MoonGlyph from './MoonGlyph'
import StyleSwitcher from './StyleSwitcher'

const nf1 = (v) => v.toLocaleString('el-GR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const nf2 = (v) => v.toLocaleString('el-GR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

// The Moon right now: phase, illumination, declination and ascending/descending (computed).
function MoonToday() {
  const { now, phase, name, dec, ascending, nextTurn } = useMoonToday()

  return (
    <div className="flex gap-4 rounded-(--geo-radius-md) bg-(--geo-surface) p-4 ring-1 ring-(--geo-rule)">
      <MoonGlyph fraction={phase.fraction} waxing={phase.waxing} size={56} title={name} />
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-0.5 text-[13px]">
        <dt className="col-span-2 mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-(--geo-muted)">Σελήνη σήμερα · {formatWeekday(now)}</dt>
        <dt className="text-(--geo-muted)">Φάση</dt>
        <dd className="text-(--geo-ink)">{name}</dd>
        <dt className="text-(--geo-muted)">Φωτισμένο</dt>
        <dd className="tabular-nums text-(--geo-ink)">{Math.round(phase.fraction * 100)}%</dd>
        <dt className="text-(--geo-muted)">Απόκλιση</dt>
        <dd className="tabular-nums text-(--geo-ink)">
          {dec >= 0 ? '+' : '−'}
          {nf1(Math.abs(dec))}° · <span className="font-medium text-(--geo-accent)">{ascending ? 'ανοδική' : 'καθοδική'}</span>
        </dd>
        {nextTurn && (
          <>
            <dt className="text-(--geo-muted)">Αλλαγή</dt>
            <dd className="text-(--geo-ink)">{formatWeekday(nextTurn.date)}</dd>
          </>
        )}
      </dl>
    </div>
  )
}

export default function Masthead({ site, cycles }) {
  return (
    <header className="pb-10 pt-8">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-(--geo-ink) pb-2 text-[12px] font-medium uppercase tracking-[0.16em] text-(--geo-muted)">
        <span>Σημειώσεις γεωπονίας</span>
        <span>{site.edition}</span>
      </div>
      <StyleSwitcher className="mt-2" />

      <div className="grid gap-8 pt-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <h1 className="font-(family-name:--geo-font-heading) text-[44px] leading-[1.05] tracking-tight text-(--geo-ink) sm:text-[64px]">{site.title}</h1>
          <p className="mt-4 max-w-[62ch] text-[17px] leading-relaxed text-(--geo-ink-soft)">{site.subtitle}</p>
        </div>
        <MoonToday />
      </div>

      {/* The Moon's cycles as a small data table */}
      <dl className="mt-10 grid grid-cols-2 border-y border-(--geo-rule) sm:grid-cols-3 lg:grid-cols-5">
        {cycles.map((c, i) => (
          <div key={c.name} className={`px-0 py-4 sm:px-4 ${i ? 'lg:border-l lg:border-(--geo-rule)' : 'lg:pl-0'}`}>
            <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-(--geo-muted)">{c.name} μήνας</dt>
            <dd className="mt-1 font-(family-name:--geo-font-heading) text-[26px] tabular-nums text-(--geo-ink)">
              {nf2(c.value)} <span className="font-(family-name:--geo-font-body) text-[13px] text-(--geo-muted)">ημ.</span>
            </dd>
            <dd className="text-[12px] text-(--geo-muted)">{c.note}</dd>
          </div>
        ))}
      </dl>
    </header>
  )
}
