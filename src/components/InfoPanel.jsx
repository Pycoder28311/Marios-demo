import { LuArrowUpRight, LuBookOpen, LuCalendarDays, LuExternalLink, LuX } from 'react-icons/lu'
import wiki from '../data/wiki.json'
import { colorAt } from '../lib/field'
import { PhaseIcon } from '../lib/icons'
import { PHASES, SHORT_MONTHS, imageSrc, inkOf, spanLabel, typeOf } from '../lib/phases'

const nf = (v) => Math.round(v).toLocaleString('el-GR')

// Encyclopedia excerpt for the phase: lead + sections (the phase's own section first).
function WikiExcerpt({ article, first }) {
  const sections = [...article.sections].sort((a, b) => (b.title === first) - (a.title === first))
  return (
    <section className="border-t border-ink/10 pt-4">
      <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
        <LuBookOpen className="h-3.5 w-3.5" />
        Από τη Βικιπαίδεια
      </div>
      <h3 className="mb-2 border-b border-ink/15 pb-1 font-serif text-[22px] leading-tight text-ink">{article.title}</h3>
      <div className="space-y-2.5 text-[13.5px] leading-relaxed text-ink-3">
        {article.lead.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        {sections.map((sec) => (
          <div key={sec.title} className="space-y-2.5 pt-1.5">
            <h4 className="border-b border-ink/10 pb-0.5 font-serif text-[16.5px] text-ink">{sec.title}</h4>
            {sec.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        ))}
      </div>
      <a
        href={article.url}
        target="_blank"
        rel="noreferrer"
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-[4px] py-2 text-sm font-medium text-ink ring-1 ring-ink/20 hover:bg-ink/[0.06]"
      >
        Δες περισσότερα
        <LuArrowUpRight className="h-4 w-4" />
      </a>
      <p className="mt-2 text-[11px] leading-snug text-faint">
        Κείμενο από το άρθρο «{article.title}» της{' '}
        <a href={article.url} target="_blank" rel="noreferrer" className="underline hover:text-ink-3">
          Βικιπαίδειας
        </a>
        , άδεια CC BY-SA 4.0 (αποσπάσματα).
      </p>
    </section>
  )
}

// Details of one crop phase: photo, description, the rainfall of its months and the
// other phases of the same crop.
export default function InfoPanel({ id, means, onClose, onSelect, onJump }) {
  const phase = PHASES[id]
  if (!phase) return null
  const { color, label } = typeOf(phase)
  const peak = Math.max(...means, 1)
  const rain = phase.months.map((m) => means[m - 1])
  const total = rain.reduce((a, b) => a + b, 0)
  const related = PHASES.map((p, i) => ({ p, i })).filter(({ p, i }) => p.crop === phase.crop && i !== id)

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="relative h-52 shrink-0 overflow-hidden bg-raised">
        {phase.image && <img key={phase.image} src={imageSrc(phase.image)} alt={`${phase.crop} – ${phase.phase}`} className="animate-slide-up-in h-full w-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
        <button
          onClick={onClose}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-[4px] bg-black/55 text-white/85 backdrop-blur hover:bg-black/75 hover:text-white"
          aria-label="Κλείσιμο"
          title="Κλείσιμο (Esc)"
        >
          <LuX className="h-4 w-4" />
        </button>
        <div className="absolute bottom-3 left-4 right-4">
          {/* Caption over the photo: always light text on a dark gradient, in both themes */}
          <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color }}>
            <PhaseIcon name={phase.icon} className="h-4 w-4" />
            {label} · {spanLabel(phase.months)}
          </div>
          <h2 className="text-xl font-semibold leading-tight tracking-tight text-white">{phase.phase}</h2>
          <div className="text-sm text-white/75">{phase.crop}</div>
        </div>
      </div>

      <div className="space-y-5 px-4 py-4 text-sm text-ink-3">
        {phase.note && <p className="font-medium text-ink">{phase.note}</p>}
        {phase.details && <p className="leading-relaxed">{phase.details}</p>}

        <section>
          <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Βροχόπτωση περιόδου</h3>
          <div className="flex items-end gap-2">
            {phase.months.map((m, i) => (
              <button
                key={m}
                onClick={() => onJump(m - 1)}
                className="flex flex-1 flex-col items-center gap-1 rounded-[3px] py-1 hover:bg-ink/5"
                title="Μετάβαση στον μήνα"
              >
                <span className="text-[11px] tabular-nums text-ink-2">{nf(rain[i])}</span>
                <div className="flex h-16 w-full items-end justify-center">
                  <div className="w-6 rounded-t-[2px]" style={{ height: `${Math.max(6, (rain[i] / peak) * 100)}%`, background: colorAt(rain[i] / peak) }} />
                </div>
                <span className="text-[11px] text-muted">{SHORT_MONTHS[m - 1]}</span>
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted">
            Σύνολο περιόδου: <span className="font-semibold text-ink-2">{nf(total)} mm</span> (μέσος όρος ξηράς 1970–2000)
          </p>
        </section>

        {wiki[phase.wiki] && <WikiExcerpt article={wiki[phase.wiki]} first={phase.wikiSection} />}

        {related.length > 0 && (
          <section>
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Άλλα στάδια · {phase.crop}</h3>
            <div className="flex flex-wrap gap-2">
              {related.map(({ p, i }) => (
                <button
                  key={i}
                  onClick={() => onSelect(i)}
                  className="flex items-center gap-1.5 rounded-[3px] bg-ink/[0.06] px-2.5 py-1 text-xs text-ink-2 hover:bg-ink/[0.12]"
                >
                  <PhaseIcon name={p.icon} className="h-3.5 w-3.5" style={{ color: inkOf(typeOf(p).color) }} />
                  {p.phase}
                  <span className="text-faint">{spanLabel(p.months)}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        <button
          onClick={() => onJump(phase.months[0] - 1)}
          className="flex w-full items-center justify-center gap-2 rounded-[4px] bg-ink py-2 font-medium text-surface hover:bg-ink/85"
        >
          <LuCalendarDays className="h-4 w-4" />
          Εμφάνιση στον χάρτη ({SHORT_MONTHS[phase.months[0] - 1]})
        </button>

        {phase.credit && (
          <p className="text-[11px] text-faint">
            Φωτογραφία:{' '}
            {phase.source ? (
              <a href={phase.source} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline hover:text-ink-3">
                {phase.credit}
                <LuExternalLink className="h-3 w-3" />
              </a>
            ) : (
              phase.credit
            )}
          </p>
        )}
      </div>
    </div>
  )
}
