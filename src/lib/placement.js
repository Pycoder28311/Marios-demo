// Picks random on-screen spots for overlay cards that avoid the country, the UI panels,
// the screen edges and each other.

const CELL = 8 // occupancy-grid resolution in px

// Card size per window width (not map width, so opening the sidebar doesn't resize cards).
export function cardSize(width) {
  if (width >= 1150) return { variant: 'full', w: 290, h: 92 }
  if (width >= 740) return { variant: 'medium', w: 250, h: 70 }
  return { variant: 'compact', w: 176, h: 50 }
}

// Rasterises everything cards must not cover into a coarse grid.
//   map      – Leaflet map (country is projected with its current view)
//   feature  – GeoJSON MultiPolygon of the country
//   root     – element whose [data-obstacle] descendants and Leaflet controls are avoided
export function buildOccupancy(map, feature, root, pad) {
  const { x: W, y: H } = map.getSize()
  const cols = Math.ceil(W / CELL)
  const rows = Math.ceil(H / CELL)
  const canvas = document.createElement('canvas')
  canvas.width = cols
  canvas.height = rows
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  ctx.scale(1 / CELL, 1 / CELL)

  // Country, grown by `pad` px via a thick stroke so small islands get a margin too.
  ctx.beginPath()
  for (const poly of feature.geometry.coordinates)
    for (const ring of poly) {
      ring.forEach(([lon, lat], i) => {
        const p = map.latLngToContainerPoint([lat, lon])
        if (i) ctx.lineTo(p.x, p.y)
        else ctx.moveTo(p.x, p.y)
      })
      ctx.closePath()
    }
  ctx.fillStyle = '#000'
  ctx.strokeStyle = '#000'
  ctx.lineJoin = 'round'
  ctx.lineWidth = pad * 2
  ctx.fill('evenodd')
  ctx.stroke()

  // UI panels.
  const base = root.getBoundingClientRect()
  for (const el of root.querySelectorAll('[data-obstacle], .leaflet-control')) {
    const r = el.getBoundingClientRect()
    if (!r.width || !r.height) continue
    ctx.fillRect(r.left - base.left - pad, r.top - base.top - pad, r.width + pad * 2, r.height + pad * 2)
  }

  const alpha = ctx.getImageData(0, 0, cols, rows).data
  const blocked = new Uint8Array(cols * rows)
  for (let i = 0; i < blocked.length; i++) blocked[i] = alpha[i * 4 + 3] > 0 ? 1 : 0
  return { W, H, cols, rows, blocked }
}

// Number of blocked cells under a rect (0 = completely free).
function blockedCount(occ, x, y, w, h) {
  let n = 0
  const c0 = Math.max(0, Math.floor(x / CELL))
  const c1 = Math.min(occ.cols - 1, Math.floor((x + w) / CELL))
  const r0 = Math.max(0, Math.floor(y / CELL))
  const r1 = Math.min(occ.rows - 1, Math.floor((y + h) / CELL))
  for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) n += occ.blocked[r * occ.cols + c]
  return n
}

// Empty space between two rects (0 when they overlap).
function gap(a, b) {
  const dx = Math.max(a.x, b.x) - Math.min(a.x + a.w, b.x + b.w)
  const dy = Math.max(a.y, b.y) - Math.min(a.y + a.h, b.y + b.h)
  return Math.max(0, dx, dy)
}

export function isFree(occ, rect, others, { edge, minGap }) {
  return (
    rect.x >= edge &&
    rect.y >= edge &&
    rect.x + rect.w <= occ.W - edge &&
    rect.y + rect.h <= occ.H - edge &&
    blockedCount(occ, rect.x, rect.y, rect.w, rect.h) === 0 &&
    others.every((o) => gap(rect, o) >= minGap)
  )
}

// Random free spot; if none exists (e.g. a small screen) the least-bad candidate.
export function findSpot(occ, size, others, opts, tries = 500) {
  const { edge, minGap } = opts
  const spanX = Math.max(0, occ.W - 2 * edge - size.w)
  const spanY = Math.max(0, occ.H - 2 * edge - size.h)
  let best = null
  let bestScore = Infinity
  for (let i = 0; i < tries; i++) {
    const rect = { x: edge + Math.random() * spanX, y: edge + Math.random() * spanY, w: size.w, h: size.h }
    if (isFree(occ, rect, others, opts)) return rect
    const crowding = others.reduce((s, o) => s + Math.max(0, minGap - gap(rect, o)), 0)
    const score = blockedCount(occ, rect.x, rect.y, rect.w, rect.h) + crowding * 4
    if (score < bestScore) {
      bestScore = score
      best = rect
    }
  }
  return best
}

// Display positions for cards whose home spot is (partly) outside the current view, e.g.
// while the sidebar is open: they are pushed just enough to be fully visible, and moved
// below/above another card if the push makes them overlap. Cards that fit keep their home
// spot, and everything returns home once there is room again.
export function pushIntoView(cards, size, W, H, { edge = 12, gap = 12 } = {}) {
  const out = new Map()
  if (!W || !H) return out
  const { w, h } = size
  const clampX = (x) => Math.max(edge, Math.min(x, W - w - edge))
  const clampY = (y) => Math.max(edge, Math.min(y, H - h - edge))
  const hits = (a, b) => a.x < b.x + w + gap && b.x < a.x + w + gap && a.y < b.y + h + gap && b.y < a.y + h + gap

  const placed = []
  // Cards that fit stay put and are placed first, so pushed cards move around them.
  const fits = (c) => clampX(c.x) === c.x && clampY(c.y) === c.y
  const order = [...cards].sort((a, b) => fits(b) - fits(a) || a.y - b.y)
  for (const c of order) {
    if (!c.visible || fits(c)) {
      out.set(c.id, { x: c.x, y: c.y })
      if (c.visible) placed.push({ x: c.x, y: c.y })
      continue
    }
    let p = { x: clampX(c.x), y: clampY(c.y) }
    for (let i = 0; i < placed.length * 2 && placed.some((o) => hits(p, o)); i++) {
      const o = placed.find((q) => hits(p, q))
      const below = o.y + h + gap
      const above = o.y - h - gap
      p = { x: p.x, y: below + h + edge <= H ? below : above >= edge ? above : p.y }
      if (p.y === o.y) break
    }
    out.set(c.id, p)
    placed.push(p)
  }
  return out
}
