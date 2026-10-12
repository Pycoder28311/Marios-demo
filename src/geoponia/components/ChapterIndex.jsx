// Table of contents of the chapters (anchor links to each row).
export default function ChapterIndex({ chapters }) {
  return (
    <nav aria-label="Κεφάλαια" className="mb-(--geo-gap-section)">
      <h2 className="mb-3 text-[12px] font-semibold uppercase tracking-[0.16em] text-(--geo-muted)">Περιεχόμενα</h2>
      <ol className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-4">
        {chapters.map((c) => (
          <li key={c.id} className="border-t border-(--geo-rule)">
            <a
              href={`#${c.id}`}
              className="flex items-baseline gap-3 py-2.5 text-[15px] text-(--geo-ink) hover:text-(--geo-accent) focus-visible:outline-2 focus-visible:outline-(--geo-accent)"
            >
              <span className="font-(family-name:--geo-font-heading) tabular-nums text-(--geo-brass)">{c.number}</span>
              <span className="flex-1">{c.title}</span>
              <span className="text-[12px] tabular-nums text-(--geo-muted)">{c.items.length}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
