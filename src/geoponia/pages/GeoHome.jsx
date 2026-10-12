import { useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import ChapterIndex from '../components/ChapterIndex'
import ChapterSection from '../components/ChapterSection'
import Footer from '../components/Footer'
import Masthead from '../components/Masthead'
import { toCssVars } from '../config/cssVars'
import { scientificTheme } from '../config/scientific.config'
import { CALENDAR_YEAR, chapters, lunarCycles, site } from '../data/chapters'

// Main page, "scientific" style: masthead, contents, one row per chapter.
export default function GeoHome() {
  const { hash } = useLocation()
  useEffect(() => {
    document.title = site.title
  }, [])
  // Links like /geoponia#astrikos-kyklos jump to that chapter.
  useEffect(() => {
    if (hash) document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView()
    else window.scrollTo(0, 0)
  }, [hash])

  // Journal-style figure numbers for the cards that show captioned images.
  const figures = useMemo(() => {
    let n = 0
    const out = {}
    for (const c of chapters) if (c.layout !== 'scroll') for (const item of c.items) out[item.slug] = ++n
    return out
  }, [])

  return (
    <div style={toCssVars(scientificTheme)} className="min-h-dvh bg-(--geo-page) font-(family-name:--geo-font-body) text-(--geo-ink-soft) antialiased">
      <div className="mx-auto max-w-(--geo-size-max-width) px-(--geo-gap-page-mobile) sm:px-(--geo-gap-page)">
        <Masthead site={site} cycles={lunarCycles} />
        <ChapterIndex chapters={chapters} />
        <main className="flex flex-col gap-(--geo-gap-section)">
          {chapters.map((chapter) => (
            <ChapterSection key={chapter.id} chapter={chapter} figures={figures} year={CALENDAR_YEAR} />
          ))}
        </main>
        <Footer />
      </div>
    </div>
  )
}
