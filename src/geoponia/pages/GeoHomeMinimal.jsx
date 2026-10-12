import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Footer from '../components/Footer'
import MinimalChapter from '../components/minimal/MinimalChapter'
import MoonGlyph from '../components/MoonGlyph'
import StyleSwitcher from '../components/StyleSwitcher'
import { minimalTheme } from '../config/minimal.config'
import { toCssVars } from '../config/cssVars'
import { CALENDAR_YEAR, chapters, site } from '../data/chapters'
import { useMoonToday } from '../lib/useMoonToday'

// Main page, "minimal" style: plain typography, lots of space, quiet greyscale images.
export default function GeoHomeMinimal() {
  const { hash } = useLocation()
  const moon = useMoonToday()

  useEffect(() => {
    document.title = `${site.title} · Λιτή εκδοχή`
  }, [])
  useEffect(() => {
    if (hash) document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView()
    else window.scrollTo(0, 0)
  }, [hash])

  return (
    <div style={toCssVars(minimalTheme)} className="min-h-dvh bg-(--geo-page) font-(family-name:--geo-font-body) text-(--geo-ink-soft) antialiased">
      <div className="mx-auto max-w-(--geo-size-max-width) px-(--geo-gap-page-mobile) sm:px-(--geo-gap-page)">
        <header className="pb-(--geo-gap-section) pt-8">
          <div className="flex flex-wrap items-center justify-between gap-3 text-[13px]">
            <span className="text-(--geo-ink)">{site.title}</span>
            <StyleSwitcher />
          </div>

          <h1 className="mt-24 max-w-[14ch] text-[48px] font-light leading-[1.05] tracking-[-0.02em] text-(--geo-ink) sm:text-[76px]">
            Η Σελήνη στον κήπο και στο χωράφι.
          </h1>
          <div className="mt-10 grid gap-8 border-t border-(--geo-rule) pt-6 md:grid-cols-[var(--geo-size-side-column)_1fr]">
            <div className="flex items-center gap-3 text-[13px]">
              <MoonGlyph fraction={moon.phase.fraction} waxing={moon.phase.waxing} size={22} title={moon.name} />
              <span>
                <span className="block text-(--geo-ink)">{moon.name}</span>
                <span className="text-(--geo-muted)">
                  {Math.round(moon.phase.fraction * 100)}% · {moon.ascending ? 'ανοδική' : 'καθοδική'}
                </span>
              </span>
            </div>
            <p className="max-w-[60ch] text-[16px] leading-relaxed">{site.subtitle}</p>
          </div>

          {/* Chapter list */}
          <nav aria-label="Κεφάλαια" className="mt-16 md:ml-[var(--geo-size-side-column)] md:pl-8">
            <ol className="columns-1 gap-8 text-[14px] sm:columns-2">
              {chapters.map((c) => (
                <li key={c.id} className="break-inside-avoid border-t border-(--geo-rule)">
                  <a href={`#${c.id}`} className="flex gap-4 py-2 text-(--geo-ink) hover:text-(--geo-accent)">
                    <span className="tabular-nums text-(--geo-muted)">{c.number}</span>
                    {c.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </header>

        <main className="flex flex-col gap-(--geo-gap-section)">
          {chapters.map((chapter) => (
            <MinimalChapter key={chapter.id} chapter={chapter} year={CALENDAR_YEAR} />
          ))}
        </main>
        <Footer />
      </div>
    </div>
  )
}
