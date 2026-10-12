import { LuArrowDown, LuArrowRight } from 'react-icons/lu'
import { Link } from 'react-router-dom'
import { heroImages } from '../../config/magazine.config'
import { formatWeekday } from '../../lib/astro'
import { publicImage } from '../../lib/images'
import { useComingDays, useMoonToday } from '../../lib/useMoonToday'
import MoonGlyph from '../MoonGlyph'
import StyleSwitcher from '../StyleSwitcher'

const nf1 = (v) => v.toLocaleString('el-GR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

// Full-height photo banner with the title, a photo collage, today's Moon and the next nights.
export default function MagazineHero({ site, firstChapterId, featuredSlug }) {
  const moon = useMoonToday()
  const days = useComingDays(8)
  const [big, small1, small2] = heroImages.collage

  return (
    <header className="relative isolate flex min-h-[max(var(--geo-size-hero-height),var(--geo-size-hero-min-height))] flex-col overflow-hidden">
      <img src={publicImage(heroImages.background)} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,var(--geo-page)_0%,color-mix(in_oklab,var(--geo-page)_80%,transparent)_45%,transparent_100%)]" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-t from-(--geo-page) to-transparent" />

      <div className="mx-auto flex w-full max-w-(--geo-size-max-width) flex-1 flex-col px-(--geo-gap-page-mobile) sm:px-(--geo-gap-page)">
        <div className="flex flex-wrap items-center justify-between gap-3 py-6">
          <span className="font-(family-name:--geo-font-heading) text-[18px] text-(--geo-ink)">{site.title}</span>
          <StyleSwitcher />
        </div>

        <div className="grid flex-1 items-center gap-12 py-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-(--geo-radius-round) bg-(--geo-accent-soft) px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.14em] text-(--geo-accent)">
              <MoonGlyph fraction={moon.phase.fraction} waxing={moon.phase.waxing} size={14} />
              {site.edition}
            </span>
            <h1 className="mt-6 font-(family-name:--geo-font-heading) text-[46px] leading-[1.02] tracking-tight text-(--geo-ink) sm:text-[84px]">
              Καλλιεργώντας
              <br />
              <span className="italic text-(--geo-accent)">με τη Σελήνη</span>
            </h1>
            <p className="mt-6 max-w-[54ch] text-[17px] leading-relaxed text-(--geo-ink-soft)">{site.subtitle}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={`#${firstChapterId}`}
                className="inline-flex items-center gap-2 rounded-(--geo-radius-round) bg-(--geo-accent) px-5 py-3 text-[14px] font-semibold text-(--geo-page) hover:brightness-110"
              >
                Ξεκινήστε από τη θεωρία <LuArrowDown className="h-4 w-4" />
              </a>
              <Link
                to={`/geoponia/${featuredSlug}`}
                className="inline-flex items-center gap-2 rounded-(--geo-radius-round) px-5 py-3 text-[14px] font-semibold text-(--geo-ink) ring-1 ring-(--geo-rule) hover:bg-(--geo-accent-soft)"
              >
                Ανοδική και καθοδική σελήνη <LuArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Collage + today's Moon */}
          <div className="relative hidden h-[460px] lg:block">
            <div className="grid h-full grid-cols-[1.3fr_1fr] grid-rows-2 gap-3">
              {[big, small1, small2].map((src, i) => (
                <img
                  key={src}
                  src={publicImage(src)}
                  alt=""
                  className={`h-full w-full rounded-(--geo-radius-lg) object-cover shadow-(--geo-shadow-card) ${i === 0 ? 'row-span-2' : ''}`}
                />
              ))}
            </div>
            <div className="absolute -bottom-6 -left-8 w-64 rounded-(--geo-radius-lg) bg-[color-mix(in_oklab,var(--geo-surface)_75%,transparent)] p-4 shadow-(--geo-shadow-card) ring-1 ring-(--geo-rule) backdrop-blur-md">
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-(--geo-muted)">Σελήνη σήμερα</div>
              <div className="mt-2 flex items-center gap-3">
                <MoonGlyph fraction={moon.phase.fraction} waxing={moon.phase.waxing} size={44} title={moon.name} />
                <div className="text-[13px]">
                  <div className="font-semibold text-(--geo-ink)">{moon.name}</div>
                  <div className="tabular-nums text-(--geo-ink-soft)">
                    {Math.round(moon.phase.fraction * 100)}% · {moon.dec >= 0 ? '+' : '−'}
                    {nf1(Math.abs(moon.dec))}°
                  </div>
                  <div className="font-medium text-(--geo-accent)">{moon.ascending ? 'Ανοδική' : 'Καθοδική'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* The next nights */}
        <div className="mb-10 overflow-x-auto rounded-(--geo-radius-lg) bg-[color-mix(in_oklab,var(--geo-surface)_70%,transparent)] ring-1 ring-(--geo-rule) backdrop-blur-md">
          <ol className="flex min-w-[640px] divide-x divide-(--geo-rule)" aria-label="Η Σελήνη τις επόμενες νύχτες">
            {days.map((d, i) => (
              <li key={d.date.getTime()} className="flex flex-1 flex-col items-center gap-2 px-2 py-4 text-center">
                <span className={`text-[11px] uppercase tracking-[0.1em] ${i ? 'text-(--geo-muted)' : 'font-semibold text-(--geo-accent)'}`}>
                  {i ? formatWeekday(d.date) : 'Απόψε'}
                </span>
                <MoonGlyph fraction={d.fraction} waxing={d.waxing} size={30} title={`${Math.round(d.fraction * 100)}%`} />
                <span className="text-[12px] tabular-nums text-(--geo-ink-soft)">{Math.round(d.fraction * 100)}%</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </header>
  )
}
