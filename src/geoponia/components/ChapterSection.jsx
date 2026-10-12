import { FeatureCard, MonthCard, RowCard, TipCard } from './Cards'
import ScrollRow from './ScrollRow'

// One chapter = one row of the page. The chapter's `layout` decides how its items are shown.
export default function ChapterSection({ chapter, figures, year }) {
  const { layout, items } = chapter
  const count = `${items.length} ${chapter.kind === 'month' ? 'πίνακες' : chapter.kind === 'tip' ? 'σημειώσεις' : items.length === 1 ? 'άρθρο' : 'άρθρα'}`

  return (
    <section id={chapter.id} aria-labelledby={`${chapter.id}-title`} className="scroll-mt-6">
      <header className="mb-(--geo-gap-row) grid gap-x-8 gap-y-2 border-t border-(--geo-ink) pt-4 md:grid-cols-[120px_1fr_auto]">
        <div className="font-(family-name:--geo-font-heading) text-[44px] leading-none tabular-nums text-(--geo-brass)">{chapter.number}</div>
        <div>
          <h2 id={`${chapter.id}-title`} className="font-(family-name:--geo-font-heading) text-[28px] leading-tight text-(--geo-ink) md:text-[32px]">
            {chapter.title}
          </h2>
          <p className="mt-1 max-w-[70ch] text-[15px] leading-relaxed text-(--geo-ink-soft)">{chapter.description}</p>
        </div>
        <div className="self-end text-[12px] font-medium uppercase tracking-[0.12em] text-(--geo-muted) md:text-right">{count}</div>
      </header>

      {layout === 'feature' && (
        <div className="flex flex-col gap-(--geo-gap-row)">
          {items.map((item, i) => (
            <FeatureCard key={item.slug} item={item} chapter={chapter} index={i} figure={figures[item.slug]} />
          ))}
        </div>
      )}

      {layout === 'row' && (
        <div
          className="grid gap-(--geo-gap-row)"
          style={{ gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${items.length >= 4 ? '230px' : '280px'}), 1fr))` }}
        >
          {items.map((item) => (
            <RowCard key={item.slug} item={item} figure={figures[item.slug]} />
          ))}
        </div>
      )}

      {layout === 'scroll' && (
        <ScrollRow label={chapter.title} cardWidth={chapter.kind === 'month' ? 'var(--geo-size-month-card-width)' : 'var(--geo-size-scroll-card-width)'}>
          {items.map((item, i) =>
            chapter.kind === 'month' ? <MonthCard key={item.slug} item={item} year={year} /> : <TipCard key={item.slug} item={item} chapter={chapter} index={i} />,
          )}
        </ScrollRow>
      )}
    </section>
  )
}
