import { useMemo, useState } from 'react'
import { declinationSeries, moonDeclination, moonPhase } from './astro'

export const phaseName = ({ fraction, waxing }) =>
  fraction < 0.03 ? 'Νέα σελήνη' : fraction > 0.97 ? 'Πανσέληνος' : `${waxing ? 'Αύξουσα' : 'Φθίνουσα'} ${fraction < 0.5 ? 'μηνοειδής' : 'αμφίκυρτη'}`

// The Moon right now (fixed for the life of the page): phase, declination, whether it is
// ascending, and the next ascending/descending change.
export function useMoonToday() {
  const [now] = useState(() => new Date())
  return useMemo(() => {
    const phase = moonPhase(now)
    const dec = moonDeclination(now)
    return {
      now,
      phase,
      name: phaseName(phase),
      dec,
      ascending: moonDeclination(new Date(now.getTime() + 3600000)) > dec,
      nextTurn: declinationSeries(now, 15).turns[0],
    }
  }, [now])
}

// Phase of the Moon at noon for each of the next `days` days.
export function useComingDays(days = 8) {
  const [start] = useState(() => {
    const d = new Date()
    d.setHours(12, 0, 0, 0)
    return d
  })
  return useMemo(() => Array.from({ length: days }, (_, i) => new Date(start.getTime() + i * 86400000)).map((date) => ({ date, ...moonPhase(date) })), [start, days])
}
