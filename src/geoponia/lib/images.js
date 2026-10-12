import calendar from '../../data/crop-calendar.json'
import credits from '../data/credits.json'

// URL of a photo in public/geoponia, and its author/licence record.
export const geoImage = (file) => `${import.meta.env.BASE_URL}geoponia/${file}`
export const creditFor = (file) => credits[file.replace(/\.jpg$/, '')]

// Any file under public/ (e.g. 'crops/pruning.jpg').
export const publicImage = (path) => `${import.meta.env.BASE_URL}${path}`

// Credit of a crop-calendar photo, as { author, license, source }.
export function cropCredit(path) {
  const phase = calendar.phases.find((p) => p.image === path)
  if (!phase?.credit) return null
  const [author, license] = phase.credit.split(' · ')
  return { author, license, source: phase.source }
}
