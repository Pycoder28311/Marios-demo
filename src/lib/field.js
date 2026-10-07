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
// Render the field into a canvas laid out in Web Mercator, optionally clipped to land.
export function renderField({ values, grid, domain, feature, clip, width = 1100 }) {
  const yTop = toMercY(grid.north)
  const yBottom = toMercY(grid.south)
  const lonSpan = grid.east - grid.west
  const radSpan = (lonSpan * Math.PI) / 180
  const height = Math.round((width * (yTop - yBottom)) / radSpan)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  const img = ctx.createImageData(width, height)
  const [lo, hi] = domain
  const span = hi - lo || 1

  for (let y = 0; y < height; y++) {
    const lat = fromMercY(yTop - ((y + 0.5) / height) * (yTop - yBottom))
    for (let x = 0; x < width; x++) {
      const lon = grid.west + ((x + 0.5) / width) * lonSpan
      const v = sample(values, grid, lat, lon)
      if (v == null) continue
      const t = Math.min(1, Math.max(0, (v - lo) / span))
      const li = Math.round(t * (LUT_SIZE - 1)) * 3
      const i = (y * width + x) * 4
      img.data[i] = LUT[li]
      img.data[i + 1] = LUT[li + 1]
      img.data[i + 2] = LUT[li + 2]
      img.data[i + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)

  if (clip && feature) {
    const px = (lon) => ((lon - grid.west) / lonSpan) * width
    const py = (lat) => ((yTop - toMercY(lat)) / (yTop - yBottom)) * height
    ctx.globalCompositeOperation = 'destination-in'
    ctx.beginPath()
    for (const poly of feature.geometry.coordinates)
      for (const ring of poly) {
        ring.forEach(([lon, lat], i) => (i ? ctx.lineTo(px(lon), py(lat)) : ctx.moveTo(px(lon), py(lat))))
        ctx.closePath()
      }
    ctx.fill('evenodd')
    ctx.globalCompositeOperation = 'source-over'
  }
  return canvas
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
