// Low-precision positions of the Moon and the Sun (Astronomical Almanac formulas,
// ≈0.3° for the Moon), enough for calendar dates of phases and of the Moon's highest and
// lowest declination. All times are JavaScript Dates (UTC internally).

const RAD = Math.PI / 180
const sin = (deg) => Math.sin(deg * RAD)
const cos = (deg) => Math.cos(deg * RAD)
const norm = (deg) => ((deg % 360) + 360) % 360

const julian = (date) => date.getTime() / 86400000 + 2440587.5

// Ecliptic longitude/latitude of the Moon, degrees.
export function moonEcliptic(date) {
  const T = (julian(date) - 2451545) / 36525
  const lon =
    218.32 +
    481267.881 * T +
    6.29 * sin(135.0 + 477198.87 * T) -
    1.27 * sin(259.3 - 413335.36 * T) +
    0.66 * sin(235.7 + 890534.22 * T) +
    0.21 * sin(269.9 + 954397.74 * T) -
    0.19 * sin(357.5 + 35999.05 * T) -
    0.11 * sin(186.5 + 966404.03 * T)
  const lat =
    5.13 * sin(93.3 + 483202.03 * T) + 0.28 * sin(228.2 + 960400.87 * T) - 0.28 * sin(318.3 + 6003.18 * T) - 0.17 * sin(217.6 - 407332.2 * T)
  return { lon: norm(lon), lat }
}

export function sunLongitude(date) {
  const n = julian(date) - 2451545
  const L = 280.46 + 0.9856474 * n
  const g = 357.528 + 0.9856003 * n
  return norm(L + 1.915 * sin(g) + 0.02 * sin(2 * g))
}

// Declination of the Moon (degrees): how high it stands relative to the celestial equator.
// Rising day by day = "ascending Moon", falling = "descending Moon".
export function moonDeclination(date) {
  const T = (julian(date) - 2451545) / 36525
  const eps = 23.4393 - 0.013 * T
  const { lon, lat } = moonEcliptic(date)
  return Math.asin(sin(lat) * cos(eps) + cos(lat) * sin(eps) * sin(lon)) / RAD
}

// Moon–Sun elongation, 0 = new moon, 180 = full moon.
export const elongation = (date) => norm(moonEcliptic(date).lon - sunLongitude(date))

// Illuminated fraction and whether it is waxing (for drawing the phase).
export function moonPhase(date) {
  const e = elongation(date)
  return { fraction: (1 - cos(e)) / 2, waxing: e < 180, elongation: e }
}

const HOUR = 3600000

// Times when f(t) crosses `target` (mod 360) going upwards, between start and end.
function crossings(f, target, start, end, step = 6 * HOUR) {
  const out = []
  const rel = (t) => norm(f(new Date(t)) - target + 180) - 180 // −180…180, 0 at target
  let t0 = start.getTime()
  let v0 = rel(t0)
  for (let t1 = t0 + step; t1 <= end.getTime() + step; t1 += step) {
    const v1 = rel(t1)
    if (v0 < 0 && v1 >= 0 && v1 - v0 < 90) {
      let a = t0
      let b = t1
      while (b - a > 60000) {
        const m = (a + b) / 2
        if (rel(m) < 0) a = m
        else b = m
      }
      const when = new Date((a + b) / 2)
      if (when >= start && when <= end) out.push(when)
    }
    t0 = t1
    v0 = v1
  }
  return out
}

// New and full moons in [start, end].
export function lunarPhases(start, end) {
  return [
    ...crossings(elongation, 0, start, end).map((date) => ({ type: 'new', date })),
    ...crossings(elongation, 180, start, end).map((date) => ({ type: 'full', date })),
  ].sort((a, b) => a.date - b.date)
}

// Declination sampled every `stepHours` over `days`, plus its turning points
// (highest = ascending phase ends, lowest = descending phase ends).
export function declinationSeries(start, days, stepHours = 2) {
  const points = []
  for (let h = 0; h <= days * 24; h += stepHours) {
    const date = new Date(start.getTime() + h * HOUR)
    points.push({ date, dec: moonDeclination(date) })
  }
  const turns = []
  for (let i = 1; i < points.length - 1; i++) {
    const [a, b, c] = [points[i - 1].dec, points[i].dec, points[i + 1].dec]
    if (b > a && b >= c) turns.push({ type: 'max', ...points[i] })
    if (b < a && b <= c) turns.push({ type: 'min', ...points[i] })
  }
  return { points, turns }
}

const fmt = (opts) => new Intl.DateTimeFormat('el-GR', { timeZone: 'Europe/Athens', hourCycle: 'h23', ...opts })
export const formatDay = (date) => fmt({ day: 'numeric', month: 'short' }).format(date)
export const formatDayTime = (date) => fmt({ day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(date)
export const formatWeekday = (date) => fmt({ weekday: 'short', day: 'numeric', month: 'short' }).format(date)
