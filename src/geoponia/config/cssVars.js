// Flattens a theme into CSS custom properties: colors.accent → --geo-accent,
// radius.md → --geo-radius-md, gap.row → --geo-gap-row, ...
export function toCssVars(theme) {
  const vars = {}
  for (const [group, values] of Object.entries(theme))
    for (const [key, value] of Object.entries(values)) {
      const name = key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)
      vars[group === 'colors' ? `--geo-${name}` : `--geo-${group}-${name}`] = value
    }
  return vars
}
