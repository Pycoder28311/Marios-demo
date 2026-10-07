import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useMemo, useRef, useState } from 'react'
import { createSatelliteLayer } from '../lib/basemap'
import { isolines, nearestCell, renderField, sample } from '../lib/field'

// `values` should already be gap-filled; `mask` marks the cells that are land.
export default function RainMap({ values, mask, grid, domain, feature, contourStep, showContours, opacity, onHover, onProvider, onMap }) {
  const el = useRef(null)
  const map = useRef(null)
  const layers = useRef({})
  const [ready, setReady] = useState(false)

  // Latest props for Leaflet event handlers.
  const live = useRef({})
  live.current = { values, mask, grid, onHover }

  // --- map + basemap (once) ---------------------------------------------------
  useEffect(() => {
    // trackResize off: the ResizeObserver below handles resizes without re-centring.
    const m = L.map(el.current, { zoomControl: false, trackResize: false, zoomSnap: 0.25, minZoom: 5, maxZoom: 13 })
    m.fitBounds([
      [34.8, 19.4],
      [41.8, 28.2],
    ])
    m.attributionControl.setPrefix(false) // hide the "Leaflet" link; imagery credit stays
    L.control.zoom({ position: 'topright', zoomInTitle: 'Μεγέθυνση', zoomOutTitle: 'Σμίκρυνση' }).addTo(m)
    L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(m)
    m.createPane('rain').style.zIndex = 410
    m.createPane('lines').style.zIndex = 420
    map.current = m

    let cancelled = false
    createSatelliteLayer().then(({ layer, provider, warning }) => {
      if (cancelled) return
      layer.addTo(m)
      onProvider?.({ provider, warning })
    })

    m.on('mousemove', (e) => {
      const { values, mask, grid, onHover } = live.current
      const { lat, lng: lon } = e.latlng
      const cell = nearestCell(grid, lat, lon)
      onHover?.(cell && mask[cell.r][cell.c] ? { lat, lon, value: sample(values, grid, lat, lon) } : null)
    })
    m.on('mouseout', () => live.current.onHover?.(null))
    // Keep Leaflet in sync when the container is resized (window resize, sidebar opening).
    // pan: false keeps the top-left fixed, so the map and the cards on it don't shift.
    const resize = new ResizeObserver(() => m.invalidateSize({ pan: false }))
    resize.observe(el.current)
    setReady(true)
    onMap?.(m)

    return () => {
      cancelled = true
      resize.disconnect()
      m.remove()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // --- country outline -------------------------------------------------------
  useEffect(() => {
    if (!ready || !feature) return
    const outline = L.geoJSON(feature, {
      pane: 'lines',
      interactive: false,
      style: { color: '#ffffff', weight: 1, opacity: 0.7, fill: false },
    }).addTo(map.current)
    return () => outline.remove()
  }, [ready, feature])

  // --- rainfall raster -------------------------------------------------------
  const imageUrl = useMemo(
    () => renderField({ values, grid, domain, feature, clip: true }).toDataURL(),
    [values, grid, domain, feature],
  )
  useEffect(() => {
    if (!ready) return
    const bounds = [
      [grid.south, grid.west],
      [grid.north, grid.east],
    ]
    if (!layers.current.image) {
      layers.current.image = L.imageOverlay(imageUrl, bounds, { pane: 'rain', opacity, interactive: false }).addTo(map.current)
    } else {
      layers.current.image.setUrl(imageUrl)
      layers.current.image.setBounds(L.latLngBounds(bounds))
    }
  }, [ready, imageUrl, grid, opacity])
  useEffect(() => {
    layers.current.image?.setOpacity(opacity)
  }, [opacity])

  // --- isohyets --------------------------------------------------------------
  const lines = useMemo(() => (showContours ? isolines(values, grid, contourStep, mask) : []), [values, mask, grid, contourStep, showContours])
  useEffect(() => {
    if (!ready) return
    const group = L.layerGroup().addTo(map.current)
    for (const line of lines) {
      L.polyline(line.points, { pane: 'lines', color: '#0b0f14', weight: 1.1, opacity: 0.85, interactive: false, smoothFactor: 0.5 }).addTo(group)
      // Label only lines long enough to read, at their midpoint.
      if (line.points.length >= 30) {
        const mid = line.points[Math.floor(line.points.length / 2)]
        L.marker(mid, {
          pane: 'lines',
          interactive: false,
          icon: L.divIcon({ className: 'isohyet-label', html: `<span>${line.value}</span>`, iconSize: null }),
        }).addTo(group)
      }
    }
    return () => group.remove()
  }, [ready, lines])

  return <div ref={el} className="h-full w-full bg-surface" />
}
