import { useRef } from 'react'
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu'

// Horizontally scrolling row with previous/next buttons.
export default function ScrollRow({ children, label, cardWidth }) {
  const ref = useRef(null)
  const scroll = (dir) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.8, behavior: 'smooth' })
  const btn =
    'flex h-9 w-9 items-center justify-center rounded-(--geo-radius-round) bg-(--geo-surface) text-(--geo-ink) ring-1 ring-(--geo-rule) hover:bg-(--geo-surface-alt) focus-visible:outline-2 focus-visible:outline-(--geo-accent)'
  return (
    <div>
      <div className="mb-3 flex justify-end gap-2">
        <button className={btn} onClick={() => scroll(-1)} aria-label={`Προηγούμενα: ${label}`}>
          <LuChevronLeft className="h-4 w-4" />
        </button>
        <button className={btn} onClick={() => scroll(1)} aria-label={`Επόμενα: ${label}`}>
          <LuChevronRight className="h-4 w-4" />
        </button>
      </div>
      <ul
        ref={ref}
        className="-mx-(--geo-gap-page-mobile) flex snap-x snap-mandatory scroll-px-(--geo-gap-page-mobile) gap-(--geo-gap-row) overflow-x-auto px-(--geo-gap-page-mobile) pb-4 sm:mx-0 sm:scroll-px-0 sm:px-0 [scrollbar-width:thin]"
        aria-label={label}
      >
        {children.map((child, i) => (
          <li key={i} className="shrink-0 snap-start" style={{ width: cardWidth }}>
            {child}
          </li>
        ))}
      </ul>
    </div>
  )
}
