// A Moon drawn at a given illuminated fraction (0 = new, 1 = full); lit on the right while
// waxing, on the left while waning (northern-hemisphere view).
export default function MoonGlyph({ fraction, waxing = true, size = 18, title }) {
  const r = size / 2 - 0.75
  const c = size / 2
  const f = Math.min(1, Math.max(0, fraction))
  const rx = Math.abs(1 - 2 * f) * r // half-width of the terminator ellipse
  const top = `${c} ${c - r}`
  const bottom = `${c} ${c + r}`
  // Lit limb (semicircle), then back along the terminator.
  const path = waxing
    ? `M ${top} A ${r} ${r} 0 0 1 ${bottom} A ${rx} ${r} 0 0 ${f < 0.5 ? 0 : 1} ${top} Z`
    : `M ${top} A ${r} ${r} 0 0 0 ${bottom} A ${rx} ${r} 0 0 ${f < 0.5 ? 1 : 0} ${top} Z`

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <circle cx={c} cy={c} r={r} fill="var(--geo-moon-dark)" stroke="var(--geo-rule)" strokeWidth="0.75" />
      {f > 0.01 && <path d={f > 0.99 ? `M ${top} A ${r} ${r} 0 1 1 ${bottom} A ${r} ${r} 0 1 1 ${top} Z` : path} fill="var(--geo-moon)" />}
    </svg>
  )
}
