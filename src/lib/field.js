import { contours } from 'd3-contour'
import { interpolateRgbBasis } from 'd3-interpolate'

// Low → high, modelled on classic isohyet maps (dry orange → wet deep blue).
export const RAMP = ['#b3541e', '#e07b26', '#f1b434', '#f3e04f', '#a8d158', '#4fb564', '#21a39a', '#2477b8', '#2a4aa0', '#1e2a6e']
const interpolate = interpolateRgbBasis(RAMP)

export function colorAt(t) {
  return interpolate(Math.min(1, Math.max(0, t)))
}

// Precomputed RGB lookup table – much faster than parsing strings per pixel.
const LUT_SIZE = 256
const LUT = (() => {
  const lut = new Uint8ClampedArray(LUT_SIZE * 3)
  for (let i = 0; i < LUT_SIZE; i++) {
    const [r, g, b] = interpolate(i / (LUT_SIZE - 1)).match(/\d+/g).map(Number)
    lut.set([r, g, b], i * 3)
  }
  return lut
})()

// ---------------------------------------------------------------------------
// Web Mercator helpers (Leaflet's default CRS) so the overlay lines up exactly.
const toMercY = (lat) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360))
const fromMercY = (y) => ((2 * Math.atan(Math.exp(y)) - Math.PI / 2) * 180) / Math.PI

// ---------------------------------------------------------------------------
// Bilinear sample of a grid (row 0 = north, col 0 = west). Nulls are ignored.
export function sample(values, grid, lat, lon) {
  const fr = (grid.north - lat) / grid.step
  const fc = (lon - grid.west) / grid.step
  if (fr < 0 || fc < 0 || fr > grid.rows - 1 || fc > grid.cols - 1) return null
  const r0 = Math.min(Math.floor(fr), grid.rows - 2)
  const c0 = Math.min(Math.floor(fc), grid.cols - 2)
  const dr = fr - r0
  const dc = fc - c0
  let sum = 0
  let wsum = 0
  for (const [r, c, w] of [
    [r0, c0, (1 - dr) * (1 - dc)],
    [r0, c0 + 1, (1 - dr) * dc],
    [r0 + 1, c0, dr * (1 - dc)],
    [r0 + 1, c0 + 1, dr * dc],
  ]) {
    const v = values[r]?.[c]
    if (v == null || !Number.isFinite(v)) continue
    sum += v * w
    wsum += w
  }
  return wsum > 0 ? sum / wsum : null
}

export function nearestCell(grid, lat, lon) {
  const r = Math.round((grid.north - lat) / grid.step)
  const c = Math.round((lon - grid.west) / grid.step)
  if (r < 0 || c < 0 || r >= grid.rows || c >= grid.cols) return null
  return { r, c, lat: grid.north - r * grid.step, lon: grid.west + c * grid.step }
}

// ---------------------------------------------------------------------------
// Cells holding data are Greek land; everything else is null.
export function landMask(values) {
  return values.map((row) => row.map((v) => v != null && Number.isFinite(v)))
}

// Grows the field outwards into empty cells (neighbour average), so the colouring
// reaches the coastline and the smallest islands instead of stopping at cell centres.
export function fillGaps(values, passes = 4) {
  let cur = values
  for (let p = 0; p < passes; p++) {
    cur = cur.map((row, r) =>
      row.map((v, c) => {
        if (v != null) return v
        let sum = 0
        let n = 0
        for (let dr = -1; dr <= 1; dr++)
          for (let dc = -1; dc <= 1; dc++) {
            const w = cur[r + dr]?.[c + dc]
            if (w != null) {
              sum += w
              n++
            }
          }
        return n ? sum / n : null
      }),
    )
  }
  return cur
}

export function stats(values, mask) {
  let min = Infinity
  let max = -Infinity
  let sum = 0
  let n = 0
  values.forEach((row, r) =>
    row.forEach((v, c) => {
      if (v == null || !Number.isFinite(v) || (mask && !mask[r][c])) return
      min = Math.min(min, v)
      max = Math.max(max, v)
      sum += v
      n++
    }),
  )
  return n ? { min, max, mean: sum / n } : { min: 0, max: 0, mean: 0 }
}

// ---------------------------------------------------------------------------
// Intermediate frames: a month's value sits in the middle of its stretch of the year
// (position m + 0.5); in between, the two neighbouring months are blended linearly.
export function blendMonths(months, pos) {
  const n = months.length
  const x = pos - 0.5
  const a = ((Math.floor(x) % n) + n) % n
  const b = (a + 1) % n
  const t = x - Math.floor(x)
  if (t < 1e-4) return months[a]
  if (t > 1 - 1e-4) return months[b]
  const A = months[a]
  const B = months[b]
  return A.map((row, r) => row.map((v, c) => (v == null || B[r][c] == null ? null : v + (B[r][c] - v) * t)))
}

// Same blend for per-month statistics ({ min, max, mean }).
export function blendStats(monthStats, pos) {
  const n = monthStats.length
  const x = pos - 0.5
  const a = ((Math.floor(x) % n) + n) % n
  const b = (a + 1) % n
  const t = x - Math.floor(x)
  const mix = (k) => monthStats[a][k] + (monthStats[b][k] - monthStats[a][k]) * t
  return { min: mix('min'), max: mix('max'), mean: mix('mean') }
}

// ---------------------------------------------------------------------------
// Fast field renderer for animation. Everything that does not depend on the values is
// precomputed once: which land pixels are drawn (clipped to the country, anti-aliased),
// and for each pixel the grid cells and bilinear weights it reads. A frame is then one
// pass over the land pixels. The canvas is laid out in Web Mercator so it lines up.
//   template – any month's (gap-filled) values; only its null pattern is used
export function createFieldRenderer({ grid, template, feature, width = 1100 }) {
  const yTop = toMercY(grid.north)
  const yBottom = toMercY(grid.south)
  const lonSpan = grid.east - grid.west
  const height = Math.round((width * (yTop - yBottom)) / ((lonSpan * Math.PI) / 180))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')

  // Land coverage (alpha) from the country outline.
  const maskCanvas = document.createElement('canvas')
  maskCanvas.width = width
  maskCanvas.height = height
  const mctx = maskCanvas.getContext('2d', { willReadFrequently: true })
  const px = (lon) => ((lon - grid.west) / lonSpan) * width
  const py = (lat) => ((yTop - toMercY(lat)) / (yTop - yBottom)) * height
  mctx.beginPath()
  for (const poly of feature.geometry.coordinates)
    for (const ring of poly) {
      ring.forEach(([lon, lat], i) => (i ? mctx.lineTo(px(lon), py(lat)) : mctx.moveTo(px(lon), py(lat))))
      mctx.closePath()
    }
  mctx.fillStyle = '#fff'
  mctx.fill('evenodd')
  const coverage = mctx.getImageData(0, 0, width, height).data

  // Per land pixel: up to 4 cell indices + normalised bilinear weights (nulls skipped).
  const pix = []
  const idx = []
  const wts = []
  const alpha = []
  const has = (r, c) => template[r]?.[c] != null
  for (let y = 0; y < height; y++) {
    const lat = fromMercY(yTop - ((y + 0.5) / height) * (yTop - yBottom))
    const fr = (grid.north - lat) / grid.step
    if (fr < 0 || fr > grid.rows - 1) continue
    const r0 = Math.min(Math.floor(fr), grid.rows - 2)
    const dr = fr - r0
    for (let x = 0; x < width; x++) {
      const a = coverage[(y * width + x) * 4 + 3]
      if (!a) continue
      const fc = (((x + 0.5) / width) * lonSpan) / grid.step
      if (fc < 0 || fc > grid.cols - 1) continue
      const c0 = Math.min(Math.floor(fc), grid.cols - 2)
      const dc = fc - c0
      const cand = [
        [r0, c0, (1 - dr) * (1 - dc)],
        [r0, c0 + 1, (1 - dr) * dc],
        [r0 + 1, c0, dr * (1 - dc)],
        [r0 + 1, c0 + 1, dr * dc],
      ].filter(([r, c, w]) => w > 0 && has(r, c))
      const sum = cand.reduce((s, k) => s + k[2], 0)
      if (!sum) continue
      pix.push((y * width + x) * 4)
      alpha.push(a)
      for (let k = 0; k < 4; k++) {
        idx.push(cand[k] ? cand[k][0] * grid.cols + cand[k][1] : 0)
        wts.push(cand[k] ? cand[k][2] / sum : 0)
      }
    }
  }
  const P = Int32Array.from(pix)
  const I = Int32Array.from(idx)
  const Wt = Float32Array.from(wts)
  const Al = Uint8Array.from(alpha)
  const img = ctx.createImageData(width, height)
  const flat = new Float32Array(grid.rows * grid.cols)

  function render(values, domain) {
    for (let r = 0; r < grid.rows; r++) {
      const row = values[r]
      for (let c = 0; c < grid.cols; c++) flat[r * grid.cols + c] = row[c] ?? 0
    }
    const [lo, hi] = domain
    const scale = (LUT_SIZE - 1) / (hi - lo || 1)
    const d = img.data
    for (let n = 0, k = 0; n < P.length; n++, k += 4) {
      const v = flat[I[k]] * Wt[k] + flat[I[k + 1]] * Wt[k + 1] + flat[I[k + 2]] * Wt[k + 2] + flat[I[k + 3]] * Wt[k + 3]
      const li = Math.max(0, Math.min(LUT_SIZE - 1, Math.round((v - lo) * scale))) * 3
      const o = P[n]
      d[o] = LUT[li]
      d[o + 1] = LUT[li + 1]
      d[o + 2] = LUT[li + 2]
      d[o + 3] = Al[n]
    }
    ctx.putImageData(img, 0, 0)
  }

  return { canvas, render }
}

// ---------------------------------------------------------------------------
// Isohyet lines.
export function niceStep(range, target = 9) {
  const raw = range / target
  const steps = [1, 2, 5, 10, 20, 25, 50, 100, 200]
  return steps.find((s) => s >= raw) ?? 500
}

// Returns polylines in [lat, lon] with their value. Grid borders are cut away so only
// real isolines remain.
export function isolines(values, grid, step, mask, factor = 2) {
  const w = (grid.cols - 1) * factor + 1
  const h = (grid.rows - 1) * factor + 1
  const fine = new Float64Array(w * h)
  let min = Infinity
  let max = -Infinity
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const v = sample(values, grid, grid.north - (y / factor) * grid.step, grid.west + (x / factor) * grid.step)
      const val = v ?? NaN
      fine[y * w + x] = val
      if (Number.isFinite(val)) {
        min = Math.min(min, val)
        max = Math.max(max, val)
      }
    }
  if (!Number.isFinite(min)) return []
  const thresholds = []
  for (let t = Math.ceil(min / step) * step; t <= max; t += step) if (t > 0) thresholds.push(t)

  const toLatLng = ([x, y]) => [grid.north - ((y - 0.5) / factor) * grid.step, grid.west + ((x - 0.5) / factor) * grid.step]
  const onBorder = ([x, y]) => x <= 0.5 || y <= 0.5 || x >= w - 0.5 || y >= h - 0.5
  // Lines are only drawn where the nearest cell is land.
  const offLand = ([x, y]) => !mask[Math.round((y - 0.5) / factor)]?.[Math.round((x - 0.5) / factor)]

  const lines = []
  for (const mp of contours().size([w, h]).thresholds(thresholds)(Array.from(fine))) {
    for (const poly of mp.coordinates)
      for (const ring of poly) {
        let current = []
        for (const pt of ring) {
          if (onBorder(pt) || offLand(pt)) {
            if (current.length > 1) lines.push({ value: mp.value, points: current })
            current = []
          } else current.push(toLatLng(pt))
        }
        if (current.length > 1) lines.push({ value: mp.value, points: current })
      }
  }
  return lines
}
