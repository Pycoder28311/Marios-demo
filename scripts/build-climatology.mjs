// Builds the average-month rainfall dataset used by the map.
//
//   npm run data
//
// - Greece outline: Natural Earth 10m admin-0 countries (public domain)
// - Precipitation: WorldClim 2.1 monthly averages 1970–2000, 5 arc-minute (~9 km) grid
//   (Fick & Hijmans 2017, https://www.worldclim.org/data/worldclim21.html)
//
// Only grid cells on Greek land keep a value; everything else is null.

import { unzipSync } from 'fflate'
import { fromArrayBuffer } from 'geotiff'
import { writeFile } from 'node:fs/promises'

const WC_URL = 'https://geodata.ucdavis.edu/climate/worldclim/2_1/base/wc2.1_5m_prec.zip'
const NE_URL =
  'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_0_countries.geojson'
const OUT_DIR = new URL('../src/data/', import.meta.url)
const MONTHS = ['Ιανουάριος', 'Φεβρουάριος', 'Μάρτιος', 'Απρίλιος', 'Μάιος', 'Ιούνιος', 'Ιούλιος', 'Αύγουστος', 'Σεπτέμβριος', 'Οκτώβριος', 'Νοέμβριος', 'Δεκέμβριος']

const round = (n, d = 4) => Math.round(n * 10 ** d) / 10 ** d

// --- Greece outline ----------------------------------------------------------
console.log('Downloading Natural Earth countries…')
const world = await (await fetch(NE_URL)).json()
const ne = world.features.find((f) => f.properties.ISO_A3 === 'GRC').geometry
const greece = {
  type: 'Feature',
  properties: { name: 'Ελλάδα', source: 'Natural Earth 1:10m' },
  geometry: {
    type: 'MultiPolygon',
    coordinates: (ne.type === 'Polygon' ? [ne.coordinates] : ne.coordinates).map((poly) =>
      poly.map((ring) => ring.map(([x, y]) => [round(x), round(y)])),
    ),
  },
}

// Polygons with their bounding boxes, for a fast point-in-country test.
const polys = greece.geometry.coordinates.map((poly) => {
  const xs = poly[0].map((p) => p[0])
  const ys = poly[0].map((p) => p[1])
  return { poly, minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) }
})
function inRing(x, y, ring) {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]
    const [xj, yj] = ring[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}
const inGreece = (x, y) =>
  polys.some(
    (p) => x >= p.minX && x <= p.maxX && y >= p.minY && y <= p.maxY && inRing(x, y, p.poly[0]) && !p.poly.slice(1).some((h) => inRing(x, y, h)),
  )

// --- WorldClim -----------------------------------------------------------------
console.log('Downloading WorldClim 2.1 precipitation (≈23 MB)…')
const zip = unzipSync(new Uint8Array(await (await fetch(WC_URL)).arrayBuffer()))

const minX = Math.min(...polys.map((p) => p.minX))
const maxX = Math.max(...polys.map((p) => p.maxX))
const minY = Math.min(...polys.map((p) => p.minY))
const maxY = Math.max(...polys.map((p) => p.maxY))

let grid
const months = []
for (let m = 1; m <= 12; m++) {
  const name = Object.keys(zip).find((k) => k.endsWith(`_prec_${String(m).padStart(2, '0')}.tif`))
  const bytes = zip[name]
  const image = await (await fromArrayBuffer(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength))).getImage()
  const [originX, originY] = image.getOrigin()
  const [resX, resY] = image.getResolution() // resY is negative
  const step = resX
  const noData = image.getGDALNoData()

  // Pixel window covering Greece with a small margin.
  const c0 = Math.floor((minX - 0.25 - originX) / step)
  const c1 = Math.ceil((maxX + 0.25 - originX) / step)
  const r0 = Math.floor((originY - (maxY + 0.25)) / -resY)
  const r1 = Math.ceil((originY - (minY - 0.25)) / -resY)
  const [raster] = await image.readRasters({ window: [c0, r0, c1, r1] })
  const cols = c1 - c0
  const rows = r1 - r0

  // Cell centres.
  grid ??= {
    north: round(originY + (r0 + 0.5) * resY, 6),
    south: round(originY + (r1 - 0.5) * resY, 6),
    west: round(originX + (c0 + 0.5) * step, 6),
    east: round(originX + (c1 - 0.5) * step, 6),
    step: round(step, 8),
    rows,
    cols,
  }

  const h = step / 2
  const values = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => {
      const v = raster[r * cols + c]
      if (v == null || v === noData || v < -1e30 || !Number.isFinite(v)) return null
      const lat = grid.north - r * step
      const lon = grid.west + c * step
      const onLand = [[0, 0], [h, 0], [-h, 0], [0, h], [0, -h]].some(([dy, dx]) => inGreece(lon + dx, lat + dy))
      return onLand ? Math.round(v * 10) / 10 : null
    }),
  )
  months.push({ name: MONTHS[m - 1], values })
  console.log(`  ${MONTHS[m - 1]} ✓`)
}

const dataset = {
  title: 'Μέση μηνιαία βροχόπτωση – Ελλάδα',
  units: 'mm',
  period: '1970–2000',
  source: 'WorldClim 2.1 (Fick & Hijmans, 2017) – μέσοι όροι 1970–2000, ανάλυση 5′',
  grid,
  months,
}

// Pretty-print with one grid row per line so the file is easy to edit by hand.
const ROW = '__ROW__'
const pretty = JSON.stringify(
  { ...dataset, months: dataset.months.map((m) => ({ ...m, values: m.values.map((row) => ROW + JSON.stringify(row)) })) },
  null,
  2,
).replace(new RegExp(`"${ROW}(.*?)"`, 'g'), '$1')

await writeFile(new URL('greece.geo.json', OUT_DIR), JSON.stringify(greece))
await writeFile(new URL('rainfall-greece-average.json', OUT_DIR), pretty + '\n')
console.log('Done.', grid)
