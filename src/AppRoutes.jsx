import { Suspense, lazy } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

// Each page loads only its own code (the map page pulls in Leaflet and the data).
const App = lazy(() => import('./App.jsx'))
const GeoHome = lazy(() => import('./geoponia/pages/GeoHome.jsx'))
const GeoHomeMinimal = lazy(() => import('./geoponia/pages/GeoHomeMinimal.jsx'))
const GeoHomeMagazine = lazy(() => import('./geoponia/pages/GeoHomeMagazine.jsx'))
const GeoArticle = lazy(() => import('./geoponia/pages/GeoArticle.jsx'))

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/geoponia" element={<GeoHome />} />
          <Route path="/geoponia/v2" element={<GeoHomeMinimal />} />
          <Route path="/geoponia/v3" element={<GeoHomeMagazine />} />
          <Route path="/geoponia/:slug" element={<GeoArticle />} />
          <Route path="*" element={<App />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
