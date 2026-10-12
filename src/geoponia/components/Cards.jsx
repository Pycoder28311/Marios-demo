import { useMemo } from 'react'
import { LuArrowRight, LuClock3 } from 'react-icons/lu'
import { Link } from 'react-router-dom'
import { formatDayTime, lunarPhases, moonPhase } from '../lib/astro'
import { geoImage } from '../lib/images'
import Figure from './Figure'
import MoonGlyph from './MoonGlyph'

const href = (slug) => `/geoponia/${slug}`

const Meta = ({ children }) => <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-(--geo-muted)">{children}</div>

const ReadTime = ({ minutes }) =>
  minutes ? (
    <span className="inline-flex items-center gap-1 tabular-nums">
      <LuClock3 className="h-3.5 w-3.5" aria-hidden /> {minutes} λεπτά
    </span>
  ) : null

const cardBase =
  'group relative block overflow-hidden rounded-(--geo-radius-md) bg-(--geo-surface) shadow-(--geo-shadow-card) ring-1 ring-(--geo-rule) transition-shadow duration-(--geo-motion-duration) hover:shadow-(--geo-shadow-card-hover) focus-visible:outline-2 focus-visible:outline-(--geo-accent)'

// Big horizontal card: image on one side, abstract and contents on the other.
export function FeatureCard({ item, chapter, index, figure }) {
  return (
    <Link
      to={href(item.slug)}
      className={`${cardBase} grid md:min-h-(--geo-size-feature-min-height) md:grid-cols-[var(--geo-size-feature-image)_1fr]`}
    >
      <Figure file={item.image} className="p-3 pb-2 md:p-4" imgClassName="aspect-[16/10] md:aspect-auto transition-transform duration-500 group-hover:scale-[1.02]" number={figure} caption={item.caption} />
      <div className="flex flex-col gap-(--geo-gap-tight) p-(--geo-gap-card) md:py-8 md:pl-4 md:pr-10">
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-(--geo-accent)">
          Κεφ. {chapter.number} · Άρθρο {Number(chapter.number)}.{index + 1}
          {item.level && <span className="ml-2 font-medium text-(--geo-muted)">· {item.level}</span>}
        </div>
        <h3 className="font-(family-name:--geo-font-heading) text-[26px] leading-tight text-(--geo-ink) md:text-[30px]">{item.title}</h3>
        <p className="max-w-[60ch] text-[15px] leading-relaxed text-(--geo-ink-soft)">{item.excerpt}</p>
        {item.points && (
          <ol className="mt-2 grid gap-1 border-t border-(--geo-rule) pt-3 text-[13.5px] text-(--geo-ink-soft) sm:grid-cols-3 sm:gap-4">
            {item.points.map((p, i) => (
              <li key={p} className="flex gap-2">
                <span className="font-(family-name:--geo-font-heading) text-(--geo-brass) tabular-nums">{i + 1}.</span>
                {p}
              </li>
            ))}
          </ol>
        )}
        <div className="mt-auto flex items-center justify-between pt-4">
          <Meta>
            <ReadTime minutes={item.readTime} />
          </Meta>
          <span className="inline-flex items-center gap-1.5 text-[14px] font-medium text-(--geo-accent)">
            Διαβάστε το άρθρο <LuArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </span>
        </div>
      </div>
    </Link>
  )
}

// Card for chapters shown side by side.
export function RowCard({ item, figure }) {
  return (
    <Link to={href(item.slug)} className={`${cardBase} flex flex-col`}>
      <Figure
        file={item.image}
        className="p-3 pb-0"
        style={{ height: 'calc(var(--geo-size-row-card-image) + 40px)' }}
        imgClassName="transition-transform duration-500 group-hover:scale-[1.03]"
        number={figure}
        caption={item.caption}
      />
      <div className="flex flex-1 flex-col gap-(--geo-gap-tight) p-(--geo-gap-card) pt-3">
        {item.tag && <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-(--geo-brass)">{item.tag}</div>}
        <h3 className="font-(family-name:--geo-font-heading) text-[20px] leading-snug text-(--geo-ink)">
          {item.title}
          {item.featured && (
            <span className="ml-2 inline-block translate-y-[-2px] rounded-(--geo-radius-sm) bg-(--geo-accent) px-1.5 py-0.5 align-middle font-(family-name:--geo-font-body) text-[10px] font-semibold uppercase tracking-wider text-(--geo-on-image)">
              Πλήρες άρθρο
            </span>
          )}
        </h3>
        <p className="text-[14px] leading-relaxed text-(--geo-ink-soft)">{item.excerpt}</p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <Meta>
            <ReadTime minutes={item.readTime} />
          </Meta>
          <LuArrowRight className="h-4 w-4 text-(--geo-accent) transition-transform group-hover:translate-x-0.5" aria-hidden />
        </div>
      </div>
    </Link>
  )
}

// Small card for the scrolling "tips" row.
export function TipCard({ item, chapter, index }) {
  return (
    <Link to={href(item.slug)} className={`${cardBase} flex h-full flex-col`}>
      <div className="h-32 overflow-hidden bg-(--geo-surface-alt)">
        <img src={geoImage(item.image)} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <div className="text-[11px] font-semibold tabular-nums tracking-[0.12em] text-(--geo-brass)">
          ΣΗΜΕΙΩΣΗ {Number(chapter.number)}.{index + 1}
        </div>
        <h3 className="font-(family-name:--geo-font-heading) text-[17px] leading-snug text-(--geo-ink)">{item.title}</h3>
        <p className="text-[13px] leading-relaxed text-(--geo-ink-soft)">{item.excerpt}</p>
      </div>
    </Link>
  )
}

// Monthly table card: moon phases of the month (computed) and the season's main tasks.
export function MonthCard({ item, year }) {
  const phases = useMemo(() => lunarPhases(new Date(Date.UTC(year, item.month, 1)), new Date(Date.UTC(year, item.month + 1, 1) - 1)), [year, item.month])
  return (
    <Link to={href(item.slug)} className={`${cardBase} flex h-full flex-col`}>
      <div className="flex items-baseline justify-between border-b border-(--geo-rule) bg-(--geo-surface-alt) px-4 py-3">
        <h3 className="font-(family-name:--geo-font-heading) text-[19px] text-(--geo-ink)">{item.title}</h3>
        <span className="font-(family-name:--geo-font-heading) text-[22px] tabular-nums text-(--geo-brass)">{String(item.month + 1).padStart(2, '0')}</span>
      </div>
      <table className="mx-4 mt-3 text-[12.5px] text-(--geo-ink-soft)">
        <caption className="sr-only">Φάσεις της Σελήνης, {item.title} {year}</caption>
        <tbody>
          {phases.map((p) => {
            const { fraction, waxing } = moonPhase(p.date)
            return (
              <tr key={p.date.getTime()}>
                <td className="w-6 py-1 pr-2 align-middle">
                  <MoonGlyph fraction={fraction} waxing={waxing} size={16} />
                </td>
                <td className="py-1 pr-2">{p.type === 'new' ? 'Νέα σελήνη' : 'Πανσέληνος'}</td>
                <td className="py-1 text-right tabular-nums text-(--geo-ink)">{formatDayTime(p.date)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <div className="mx-4 mt-3 border-t border-dashed border-(--geo-rule) pt-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-(--geo-muted)">Εργασίες</div>
      <ul className="mx-4 mb-4 mt-1 space-y-1 text-[13px] leading-snug text-(--geo-ink-soft)">
        {item.tasks.map((t) => (
          <li key={t} className="flex gap-2">
            <span className="mt-[7px] h-1 w-1 shrink-0 rounded-(--geo-radius-round) bg-(--geo-accent)" />
            {t}
          </li>
        ))}
      </ul>
    </Link>
  )
}
