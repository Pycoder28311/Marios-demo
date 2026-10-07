import L from 'leaflet'

const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

// Google satellite imagery via the official Map Tiles API
// (https://developers.google.com/maps/documentation/tile/2d-tiles-overview).
async function googleSatellite(key) {
  const res = await fetch(`https://tile.googleapis.com/v1/createSession?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mapType: 'satellite', language: 'el-GR', region: 'GR' }),
  })
  if (!res.ok) throw new Error(`αποτυχία σύνδεσης με Google Map Tiles (HTTP ${res.status})`)
  const { session } = await res.json()
  return L.tileLayer(`https://tile.googleapis.com/v1/2dtiles/{z}/{x}/{y}?session=${session}&key=${key}`, {
    maxZoom: 20,
    attribution: `Εικόνες &copy;${new Date().getFullYear()} Google`,
  })
}

function esriSatellite() {
  return L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19,
    attribution: 'Εικόνες &copy; Esri, Maxar, Earthstar Geographics',
  })
}

// Resolves to { layer, provider, warning? }. Falls back to Esri imagery when no
// Google key is configured or the Google session cannot be created.
export async function createSatelliteLayer() {
  if (GOOGLE_KEY) {
    try {
      return { layer: await googleSatellite(GOOGLE_KEY), provider: 'Google' }
    } catch (err) {
      return { layer: esriSatellite(), provider: 'Esri', warning: err.message }
    }
  }
  return { layer: esriSatellite(), provider: 'Esri', warning: 'δεν έχει οριστεί VITE_GOOGLE_MAPS_API_KEY' }
}
