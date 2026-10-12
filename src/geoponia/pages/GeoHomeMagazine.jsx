import { useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import Footer from '../components/Footer'
import MagazineChapter from '../components/magazine/MagazineChapter'
import MagazineHero from '../components/magazine/MagazineHero'
import { toCssVars } from '../config/cssVars'
import { chapterBands, magazineTheme, monthImages } from '../config/magazine.config'
import { CALENDAR_YEAR, chapters, site } from '../data/chapters'
import { cropCredit } from '../lib/images'

// Main page, image-rich style: dark palette, photo hero, chapters as coloured bands.
export default function GeoHomeMagazine() {
  const { hash } = useLocation()
  useEffect(() => {
    document.title = `${site.title} · Εικονογραφημένη εκδοχή`
  }, [])
  useEffect(() => {
    if (hash) document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView()
    else window.scrollTo(0, 0)
  }, [hash])

  // The month cards use crop-calendar photos; credit them too.
  const extraCredits = useMemo(() => monthImages.map(cropCredit).filter(Boolean), [])
  const featured = chapters.flatMap((c) => c.items).find((i) => i.featured)

  return (
    <div style={toCssVars(magazineTheme)} className="min-h-dvh bg-(--geo-page) font-(family-name:--geo-font-body) text-(--geo-ink-soft) antialiased">
      <MagazineHero site={site} firstChapterId={chapters[0].id} featuredSlug={featured?.slug} />
      {/* Thick bar between the hero and the chapters */}
      <div aria-hidden className="h-(--geo-size-hero-divider) bg-(image:--geo-hero-divider) shadow-[0_0_40px_rgba(224,168,69,0.35)]" />
      <main>
        {chapters.map((chapter, i) => {
          const band = (k) => chapterBands[k % chapterBands.length]
          const last = i === chapters.length - 1
          return (
            <MagazineChapter
              key={chapter.id}
              chapter={chapter}
              band={band(i)}
              from={i ? band(i - 1) : 'var(--geo-page)'}
              to={last ? 'var(--geo-page)' : undefined}
              year={CALENDAR_YEAR}
            />
          )
        })}
      </main>
      <div className="mx-auto max-w-(--geo-size-max-width) px-(--geo-gap-page-mobile) sm:px-(--geo-gap-page)">
        <Footer extraCredits={extraCredits} />
      </div>
    </div>
  )
}
