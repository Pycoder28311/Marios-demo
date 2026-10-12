import { useMemo } from 'react'
import { LuArrowUpRight } from 'react-icons/lu'
import { Link } from 'react-router-dom'
import { formatDay, lunarPhases, moonPhase } from '../../lib/astro'
import { geoImage } from '../../lib/images'
import MoonGlyph from '../MoonGlyph'

const href = (slug) => `/geoponia/${slug}`

// Image that stays grey (config: motion.imageFilter) until its card is hovered or focused.
const QuietImage = ({ file, className = '' }) => (
  <div className={`overflow-hidden rounded-(--geo-radius-md) bg-(--geo-surface-alt) ${className}`}>
    <img
      src={geoImage(file)}
      alt=""
      loading="lazy"
      className="h-full w-full object-cover transition duration-(--geo-motion-duration) [filter:var(--geo-motion-image-filter)] group-hover:filter-none group-focus-visible:filter-none"
    />
  </div>
)

const linkBase = 'group block focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-(--geo-ink)'

function FeatureItem({ item }) {
  return (
    <Link to={href(item.slug)} className={`${linkBase} grid gap-6 border-t border-(--geo-rule) pt-6 md:grid-cols-[var(--geo-size-feature-image)_1fr]`}>
      <QuietImage file={item.image} className="aspect-[4/3]" />
      <div className="flex flex-col">
        <h3 className="text-[26px] font-light leading-snug tracking-tight text-(--geo-ink) group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">
          {item.title}
        </h3>
        <p className="mt-3 max-w-[56ch] text-[15px] leading-relaxed">{item.excerpt}</p>
        <div className="mt-auto flex items-center gap-1 pt-6 text-[13px] text-(--geo-muted)">
          {item.readTime} λεπτά · Διαβάστε <LuArrowUpRight className="h-3.5 w-3.5 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
        </div>
      </div>
    </Link>
  )
}

function RowItem({ item }) {
  return (
    <Link to={href(item.slug)} className={`${linkBase} flex flex-col`}>
      <QuietImage file={item.image} className="aspect-(--geo-size-row-card-image)" />
      <h3 className="mt-3 text-[16px] font-normal leading-snug text-(--geo-ink) group-hover:underline group-hover:underline-offset-4">{item.title}</h3>
      <p className="mt-1 text-[13.5px] leading-relaxed text-(--geo-muted)">{item.excerpt}</p>
    </Link>
  )
}

function TipItem({ item, index }) {
  return (
    <Link to={href(item.slug)} className={`${linkBase} flex h-full flex-col border-l border-(--geo-rule) pl-5`}>
      <span className="text-[12px] tabular-nums text-(--geo-muted)">{String(index + 1).padStart(2, '0')}</span>
      <h3 className="mt-2 text-[16px] leading-snug text-(--geo-ink) group-hover:underline group-hover:underline-offset-4">{item.title}</h3>
      <p className="mt-2 text-[13.5px] leading-relaxed text-(--geo-muted)">{item.excerpt}</p>
    </Link>
  )
}

function MonthItem({ item, year }) {
  const phases = useMemo(() => lunarPhases(new Date(Date.UTC(year, item.month, 1)), new Date(Date.UTC(year, item.month + 1, 1) - 1)), [year, item.month])
  return (
    <Link to={href(item.slug)} className={`${linkBase} flex h-full flex-col border-l border-(--geo-rule) pl-5`}>
      <span className="text-[12px] tabular-nums text-(--geo-muted)">{String(item.month + 1).padStart(2, '0')}</span>
      <h3 className="mt-1 text-[16px] text-(--geo-ink) group-hover:underline group-hover:underline-offset-4">{item.title}</h3>
      <ul className="mt-3 space-y-1.5 text-[13px] tabular-nums">
        {phases.map((p) => {
          const { fraction, waxing } = moonPhase(p.date)
          return (
            <li key={p.date.getTime()} className="flex items-center gap-2">
              <MoonGlyph fraction={fraction} waxing={waxing} size={12} title={p.type === 'new' ? 'Νέα σελήνη' : 'Πανσέληνος'} />
              {formatDay(p.date)}
            </li>
          )
        })}
      </ul>
      <p className="mt-3 text-[12.5px] leading-relaxed text-(--geo-muted)">{item.tasks.join(' · ')}</p>
    </Link>
  )
}

// A chapter: title in a narrow (sticky) column, items on the right in the chapter's layout.
export default function MinimalChapter({ chapter, year }) {
  const { layout, items, kind } = chapter
  return (
    <section id={chapter.id} aria-labelledby={`${chapter.id}-title`} className="grid scroll-mt-8 gap-8 md:grid-cols-[var(--geo-size-side-column)_1fr]">
      <header className="md:sticky md:top-8 md:self-start">
        <div className="text-[12px] tabular-nums text-(--geo-muted)">{chapter.number}</div>
        <h2 id={`${chapter.id}-title`} className="mt-1 text-[20px] font-normal leading-snug text-(--geo-ink)">
          {chapter.title}
        </h2>
        <p className="mt-2 text-[13px] leading-relaxed text-(--geo-muted)">{chapter.description}</p>
      </header>

      <div className="min-w-0">
        {layout === 'feature' && (
          <div className="flex flex-col gap-(--geo-gap-row)">
            {items.map((item) => (
              <FeatureItem key={item.slug} item={item} />
            ))}
          </div>
        )}
        {layout === 'row' && (
          <div className="grid gap-x-(--geo-gap-row) gap-y-10" style={{ gridTemplateColumns: `repeat(auto-fill, minmax(min(100%, ${items.length >= 4 ? '170px' : '220px'}), 1fr))` }}>
            {items.map((item) => (
              <RowItem key={item.slug} item={item} />
            ))}
          </div>
        )}
        {layout === 'scroll' && (
          <ul className="flex snap-x gap-(--geo-gap-row) overflow-x-auto pb-3 [scrollbar-width:thin]" aria-label={chapter.title}>
            {items.map((item, i) => (
              <li key={item.slug} className="shrink-0 snap-start" style={{ width: kind === 'month' ? 'var(--geo-size-month-card-width)' : 'var(--geo-size-scroll-card-width)' }}>
                {kind === 'month' ? <MonthItem item={item} year={year} /> : <TipItem item={item} index={i} />}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
