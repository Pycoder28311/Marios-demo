import { useMemo } from 'react'
import { LuArrowRight, LuClock3 } from 'react-icons/lu'
import { Link } from 'react-router-dom'
import { monthImages } from '../../config/magazine.config'
import { formatDayTime, lunarPhases, moonPhase } from '../../lib/astro'
import { geoImage, publicImage } from '../../lib/images'
import MoonGlyph from '../MoonGlyph'
import ScrollRow from '../ScrollRow'

const href = (slug) => `/geoponia/${slug}`

const Chip = ({ children, strong }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-(--geo-radius-round) px-2.5 py-1 text-[11.5px] font-medium backdrop-blur-sm ${
      strong ? 'bg-(--geo-accent) text-(--geo-page)' : 'bg-white/12 text-white/90 ring-1 ring-white/20'
    }`}
  >
    {children}
  </span>
)

const cardBase =
  'group relative block overflow-hidden rounded-(--geo-radius-lg) shadow-(--geo-shadow-card) transition-shadow duration-(--geo-motion-duration) hover:shadow-(--geo-shadow-card-hover) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--geo-accent)'

const Photo = ({ src }) => (
  <img src={src} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
)

// Wide photo with the text overlaid on one side (alternating).
function FeatureCard({ item, chapter, index }) {
  const right = index % 2 === 1
  return (
    <Link to={href(item.slug)} className={`${cardBase} flex min-h-(--geo-size-feature-height) items-end md:items-center`}>
      <Photo src={geoImage(item.image)} />
      <div
        className={`absolute inset-0 ${
          right
            ? 'bg-[linear-gradient(270deg,var(--geo-image-shade)_0%,var(--geo-image-shade)_38%,transparent_80%)]'
            : 'bg-[linear-gradient(90deg,var(--geo-image-shade)_0%,var(--geo-image-shade)_38%,transparent_80%)]'
        } max-md:bg-[linear-gradient(0deg,var(--geo-image-shade)_45%,transparent_95%)]`}
      />
      <div className={`relative max-w-xl p-7 text-white md:p-12 ${right ? 'md:ml-auto' : ''}`}>
        <div className="flex flex-wrap gap-2">
          <Chip strong>
            Κεφ. {chapter.number} · {index + 1}
          </Chip>
          {item.level && <Chip>{item.level}</Chip>}
          <Chip>
            <LuClock3 className="h-3.5 w-3.5" /> {item.readTime} λεπτά
          </Chip>
        </div>
        <h3 className="mt-4 font-(family-name:--geo-font-heading) text-[30px] leading-tight md:text-[42px]">{item.title}</h3>
        <p className="mt-3 text-[15.5px] leading-relaxed text-white/85">{item.excerpt}</p>
        {item.points && (
          <ul className="mt-5 flex flex-wrap gap-2">
            {item.points.map((p) => (
              <Chip key={p}>{p}</Chip>
            ))}
          </ul>
        )}
        <span className="mt-6 inline-flex items-center gap-2 text-[14px] font-semibold text-(--geo-accent)">
          Διαβάστε το άρθρο <LuArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  )
}

// Tall photo card, text over a dark gradient at the bottom.
function RowCard({ item }) {
  return (
    <Link to={href(item.slug)} className={`${cardBase} flex h-(--geo-size-row-card-height) flex-col justify-end`}>
      <Photo src={geoImage(item.image)} />
      <div className="absolute inset-0 bg-[linear-gradient(0deg,var(--geo-image-shade)_10%,transparent_65%)]" />
      <div className="relative p-(--geo-gap-card) text-white">
        <div className="flex flex-wrap gap-2">
          {item.featured && <Chip strong>Πλήρες άρθρο</Chip>}
          {item.tag && <Chip>{item.tag}</Chip>}
        </div>
        <h3 className="mt-3 font-(family-name:--geo-font-heading) text-[24px] leading-snug">{item.title}</h3>
        <p className="mt-2 line-clamp-3 text-[14px] leading-relaxed text-white/80">{item.excerpt}</p>
        <div className="mt-3 flex items-center justify-between text-[12.5px] text-white/70">
          <span className="inline-flex items-center gap-1.5">
            <LuClock3 className="h-3.5 w-3.5" /> {item.readTime} λεπτά
          </span>
          <LuArrowRight className="h-4 w-4 text-(--geo-accent) transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  )
}

function TipCard({ item, index }) {
  return (
    <Link to={href(item.slug)} className={`${cardBase} flex h-full flex-col bg-(--geo-surface)`}>
      <div className="relative h-44 overflow-hidden">
        <Photo src={geoImage(item.image)} />
        <span className="absolute left-3 top-3 rounded-(--geo-radius-round) bg-(--geo-accent) px-2.5 py-0.5 text-[12px] font-semibold tabular-nums text-(--geo-page)">
          #{index + 1}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="font-(family-name:--geo-font-heading) text-[19px] leading-snug text-(--geo-ink)">{item.title}</h3>
        <p className="text-[13.5px] leading-relaxed text-(--geo-ink-soft)">{item.excerpt}</p>
      </div>
    </Link>
  )
}

function MonthCard({ item, year }) {
  const phases = useMemo(() => lunarPhases(new Date(Date.UTC(year, item.month, 1)), new Date(Date.UTC(year, item.month + 1, 1) - 1)), [year, item.month])
  return (
    <Link to={href(item.slug)} className={`${cardBase} flex h-(--geo-size-month-card-height) flex-col justify-between`}>
      <Photo src={publicImage(monthImages[item.month])} />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.25)_0%,var(--geo-image-shade)_70%)]" />
      <div className="relative flex items-start justify-between p-5 text-white">
        <span className="font-(family-name:--geo-font-heading) text-[52px] leading-none tabular-nums text-white/90">{String(item.month + 1).padStart(2, '0')}</span>
        <Chip>{year}</Chip>
      </div>
      <div className="relative p-5 text-white">
        <h3 className="font-(family-name:--geo-font-heading) text-[26px]">{item.title}</h3>
        <ul className="mt-3 space-y-1.5 text-[13px]">
          {phases.map((p) => {
            const { fraction, waxing } = moonPhase(p.date)
            return (
              <li key={p.date.getTime()} className="flex items-center gap-2">
                <MoonGlyph fraction={fraction} waxing={waxing} size={16} />
                <span className="text-white/75">{p.type === 'new' ? 'Νέα σελήνη' : 'Πανσέληνος'}</span>
                <span className="ml-auto tabular-nums">{formatDayTime(p.date)}</span>
              </li>
            )
          })}
        </ul>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {item.tasks.map((t) => (
            <Chip key={t}>{t}</Chip>
          ))}
        </div>
      </div>
    </Link>
  )
}

// A chapter as a full-width colour band with a faded photo behind its title. Its top edge
// fades in from the previous band's colour (`from`), and the last band fades out (`to`).
export default function MagazineChapter({ chapter, band, from, to, year }) {
  const { layout, items, kind } = chapter
  const cover = items.find((i) => i.image)?.image

  return (
    <section
      id={chapter.id}
      aria-labelledby={`${chapter.id}-title`}
      className="relative isolate overflow-hidden py-(--geo-gap-band)"
      style={{
        background: `linear-gradient(180deg, ${from ?? band} 0px, ${band} var(--geo-size-band-fade)${
          to ? `, ${band} calc(100% - var(--geo-size-band-fade)), ${to} 100%` : ''
        })`,
      }}
    >
      {cover && (
        <img
          src={geoImage(cover)}
          alt=""
          className="absolute right-0 top-0 -z-10 h-[420px] w-full max-w-3xl object-cover opacity-25 [mask-image:linear-gradient(to_left,black_20%,transparent),linear-gradient(to_bottom,transparent_0%,black_40%,transparent_100%)] [mask-composite:intersect]"
        />
      )}
      <div className="mx-auto max-w-(--geo-size-max-width) px-(--geo-gap-page-mobile) sm:px-(--geo-gap-page)">
        <header className="mb-12">
          <div className="flex items-center gap-4">
            <span className="font-(family-name:--geo-font-heading) text-[64px] leading-none tabular-nums text-(--geo-accent) md:text-[88px]">{chapter.number}</span>
            <span className="h-px flex-1 bg-(--geo-rule)" />
            <span className="rounded-(--geo-radius-round) px-3 py-1 text-[12px] font-medium text-(--geo-muted) ring-1 ring-(--geo-rule)">{items.length}</span>
          </div>
          <h2 id={`${chapter.id}-title`} className="mt-4 max-w-3xl font-(family-name:--geo-font-heading) text-[36px] leading-tight text-(--geo-ink) md:text-[48px]">
            {chapter.title}
          </h2>
          <p className="mt-3 max-w-3xl text-[16.5px] leading-relaxed text-(--geo-ink-soft)">{chapter.description}</p>
        </header>

        {layout === 'feature' && (
          <div className="flex flex-col gap-(--geo-gap-row)">
            {items.map((item, i) => (
              <FeatureCard key={item.slug} item={item} chapter={chapter} index={i} />
            ))}
          </div>
        )}
        {layout === 'row' && (
          <div className="grid gap-(--geo-gap-row)" style={{ gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${items.length >= 4 ? '240px' : '300px'}), 1fr))` }}>
            {items.map((item) => (
              <RowCard key={item.slug} item={item} />
            ))}
          </div>
        )}
        {layout === 'scroll' && (
          <ScrollRow label={chapter.title} cardWidth={kind === 'month' ? 'var(--geo-size-month-card-width)' : 'var(--geo-size-scroll-card-width)'}>
            {items.map((item, i) => (kind === 'month' ? <MonthCard key={item.slug} item={item} year={year} /> : <TipCard key={item.slug} item={item} index={i} />))}
          </ScrollRow>
        )}
      </div>
    </section>
  )
}
