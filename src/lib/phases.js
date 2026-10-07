import calendar from '../data/crop-calendar.json'

export const PHASES = calendar.phases

export const SHORT_MONTHS = ['Ιαν', 'Φεβ', 'Μαρ', 'Απρ', 'Μαΐ', 'Ιουν', 'Ιουλ', 'Αυγ', 'Σεπ', 'Οκτ', 'Νοε', 'Δεκ']

export const TYPES = {
  sowing: { label: 'Σπορά', color: '#7cb87a' },
  growth: { label: 'Ανάπτυξη', color: '#a9c46c' },
  flowering: { label: 'Ανθοφορία', color: '#d49ac0' },
  harvest: { label: 'Συγκομιδή', color: '#dcae52' },
  leaves: { label: 'Φύλλωμα', color: '#d98a4a' },
  pruning: { label: 'Κλάδεμα', color: '#9aa6b2' },
}
export const typeOf = (phase) => TYPES[phase.type] ?? TYPES.growth
// Phase colour for text/icons: darkened in the light theme so it stays readable (see --tint-text).
export const inkOf = (color) => `color-mix(in oklab, ${color} var(--tint-text), black)`

// A phase is shown from a little after its first month starts until a little before its
// last month ends, so changes happen symmetrically around each month boundary:
// the outgoing card fades out just before the boundary, the incoming one just after.
export const EDGE = 0.12 // in months

export function isActive(phase, progress, months = 12) {
  const start = phase.months[0] - 1
  const x = (((progress - start) % months) + months) % months
  return x >= EDGE && x < phase.months.length - EDGE
}

export const spanLabel = (months) =>
  months.length === 1
    ? SHORT_MONTHS[months[0] - 1]
    : `${SHORT_MONTHS[months[0] - 1]} – ${SHORT_MONTHS[months[months.length - 1] - 1]}`

export const imageSrc = (path) => (/^https?:/.test(path) ? path : `${import.meta.env.BASE_URL}${path}`)

// Timeline segments: ranges that wrap past December are split in two. Each segment gets
// a lane so segments in the same lane never overlap.
export function timelineLanes(months = 12) {
  const segments = []
  PHASES.forEach((phase, id) => {
    const start = phase.months[0] - 1
    const end = start + phase.months.length
    if (end <= months) segments.push({ id, start, end, head: true, label: true })
    else {
      // Wrapped past December: the longer piece carries the label.
      const tail = end - months
      segments.push({ id, start, end: months, head: true, label: months - start >= tail })
      segments.push({ id, start: 0, end: tail, head: false, label: months - start < tail })
    }
  })
  // Lanes are assigned per phase (both halves of a wrapped phase share one lane).
  const lanes = [] // lane -> segments
  const overlaps = (a, b) => a.start < b.end && b.start < a.end
  const order = [...new Set(segments.filter((s) => s.head).sort((a, b) => a.start - b.start).map((s) => s.id))]
  for (const id of order) {
    const own = segments.filter((s) => s.id === id)
    let lane = lanes.findIndex((taken) => !taken.some((t) => own.some((s) => overlaps(s, t))))
    if (lane === -1) lane = lanes.push([]) - 1
    lanes[lane].push(...own)
    own.forEach((s) => (s.lane = lane))
  }
  return { segments, laneCount: lanes.length }
}
