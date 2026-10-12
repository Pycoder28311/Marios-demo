import { useEffect } from 'react'
import { LuArrowLeft, LuArrowRight, LuClock3 } from 'react-icons/lu'
import { Link, useParams } from 'react-router-dom'
import { articleImages, articleTheme } from '../config/article.config'
import { toCssVars } from '../config/cssVars'
import { articles } from '../content'
import { itemsBySlug, site } from '../data/chapters'
import { creditFor, geoImage } from '../lib/images'

// Article page: photo banner on top, a fixed background photo, and the text in a
// see-through (frosted) panel that rises over the banner.
export default function GeoArticle() {
  const { slug } = useParams()
  const item = itemsBySlug[slug]
  const full = articles[slug]
  const bannerFile = item?.image ?? articleImages.banner
  const banner = creditFor(bannerFile)

  useEffect(() => {
    document.title = item ? `${item.title} · ${site.title}` : site.title
    window.scrollTo(0, 0)
  }, [item, slug])

  // Neighbours in the same chapter.
  const siblings = item?.chapter.items ?? []
  const at = siblings.findIndex((s) => s.slug === slug)
  const prev = siblings[at - 1]
  const next = siblings[at + 1]

  return (
    <div style={toCssVars(articleTheme)} className="relative min-h-dvh font-(family-name:--geo-font-body) text-(--geo-ink-soft) antialiased">
      {/* Background photo behind the text panel */}
      <div className="fixed inset-0 -z-10" aria-hidden>
        <img src={geoImage(articleImages.backdrop)} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-(--geo-backdrop-tint)" />
      </div>

      {/* Banner */}
      <header className="relative flex min-h-[max(var(--geo-article-banner-height),var(--geo-article-banner-min-height))] items-end overflow-hidden pt-24">
        <img src={geoImage(bannerFile)} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-(--geo-banner-tint) via-(--geo-banner-tint) to-transparent" />
        <div className="relative mx-auto w-full max-w-(--geo-article-panel-width) px-(--geo-article-panel-padding-mobile) pb-[calc(var(--geo-article-panel-overlap)+32px)] text-(--geo-on-image) sm:px-0">
          <nav aria-label="Διαδρομή" className="mb-4 text-[13px] text-white/80">
            <Link to="/geoponia" className="hover:text-white hover:underline">
              {site.title}
            </Link>
            {item && (
              <>
                <span className="mx-2 text-white/50">/</span>
                <Link to={`/geoponia#${item.chapter.id}`} className="hover:text-white hover:underline">
                  Κεφ. {item.chapter.number} · {item.chapter.title}
                </Link>
              </>
            )}
          </nav>
          <h1 className="font-(family-name:--geo-font-heading) text-[36px] leading-[1.1] tracking-tight sm:text-[52px]">{item?.title ?? 'Το άρθρο δεν βρέθηκε'}</h1>
          {item?.excerpt && <p className="mt-3 max-w-[60ch] text-[17px] leading-relaxed text-white/85">{item.excerpt}</p>}
          {item && (
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-white/75">
              {item.readTime && (
                <span className="inline-flex items-center gap-1.5">
                  <LuClock3 className="h-3.5 w-3.5" aria-hidden /> {item.readTime} λεπτά ανάγνωσης
                </span>
              )}
              {full?.updated && <span>Ενημέρωση: {full.updated}</span>}
            </div>
          )}
        </div>
      </header>

      {/* Text panel */}
      <main className="relative mx-auto -mt-(--geo-article-panel-overlap) mb-16 max-w-(--geo-article-panel-width) px-3 sm:px-0">
        <article className="rounded-(--geo-radius-lg) border border-(--geo-panel-border) bg-(--geo-panel) p-(--geo-article-panel-padding-mobile) text-(length:--geo-article-body-size) leading-(--geo-article-body-leading) shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)] backdrop-blur-(--geo-article-panel-blur) sm:p-(--geo-article-panel-padding)">
          {full ? (
            <>
              <nav aria-label="Σε αυτό το άρθρο" className="mb-8 border-y border-(--geo-rule) py-3 text-[14px]">
                <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-(--geo-muted)">Σε αυτό το άρθρο</div>
                <ol className="grid gap-x-6 gap-y-0.5 sm:grid-cols-2">
                  {full.toc.map(([id, label], i) => (
                    <li key={id}>
                      <a href={`#${id}`} className="text-(--geo-accent) hover:underline">
                        <span className="mr-1.5 tabular-nums text-(--geo-brass)">{i + 1}.</span>
                        {label}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
              <full.Body />
            </>
          ) : item ? (
            <div className="py-6 text-center">
              <p className="font-(family-name:--geo-font-heading) text-[22px] text-(--geo-ink)">Το πλήρες κείμενο ετοιμάζεται.</p>
              <p className="mx-auto mt-2 max-w-[48ch] text-[15px]">
                Στο μεταξύ, διαβάστε το άρθρο{' '}
                <Link to="/geoponia/anodiki-kathodiki-selini" className="text-(--geo-accent) hover:underline">
                  «Ανοδική και καθοδική σελήνη»
                </Link>
                .
              </p>
            </div>
          ) : (
            <p className="py-6 text-center">
              Η σελίδα δεν υπάρχει.{' '}
              <Link to="/geoponia" className="text-(--geo-accent) hover:underline">
                Επιστροφή στα περιεχόμενα
              </Link>
            </p>
          )}

          {/* Previous / next in the chapter */}
          {(prev || next) && (
            <nav aria-label="Άλλα άρθρα του κεφαλαίου" className="mt-12 grid gap-3 border-t border-(--geo-rule) pt-6 text-[14px] sm:grid-cols-2">
              {prev ? (
                <Link to={`/geoponia/${prev.slug}`} className="group rounded-(--geo-radius-md) p-3 ring-1 ring-(--geo-rule) hover:bg-(--geo-surface)">
                  <span className="flex items-center gap-1 text-[12px] text-(--geo-muted)">
                    <LuArrowLeft className="h-3.5 w-3.5" /> Προηγούμενο
                  </span>
                  <span className="font-(family-name:--geo-font-heading) text-(--geo-ink)">{prev.title}</span>
                </Link>
              ) : (
                <span />
              )}
              {next && (
                <Link to={`/geoponia/${next.slug}`} className="group rounded-(--geo-radius-md) p-3 text-right ring-1 ring-(--geo-rule) hover:bg-(--geo-surface)">
                  <span className="flex items-center justify-end gap-1 text-[12px] text-(--geo-muted)">
                    Επόμενο <LuArrowRight className="h-3.5 w-3.5" />
                  </span>
                  <span className="font-(family-name:--geo-font-heading) text-(--geo-ink)">{next.title}</span>
                </Link>
              )}
            </nav>
          )}
        </article>

        {banner && (
          <p className="mt-3 px-1 text-[11px] text-white/70">
            Φωτογραφίες: {banner.author} ({banner.license}) · {creditFor(articleImages.backdrop)?.author} ({creditFor(articleImages.backdrop)?.license}),
            Wikimedia Commons.
          </p>
        )}
      </main>
    </div>
  )
}
