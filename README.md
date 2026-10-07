# Greece Rain Map

Average monthly rain-intensity (precipitation) map of Greece over satellite imagery, with
isohyet contours, a High/Low legend and a month timeline. UI in Greek.
React + Vite + Tailwind CSS + Leaflet.

```bash
npm install
npm run dev
```

## Satellite imagery

- **Google** – copy `.env.example` to `.env.local` and set `VITE_GOOGLE_MAPS_API_KEY`
  (the key needs the *Map Tiles API* enabled). Imagery is loaded through Google's official 2D Tiles API.
- **Fallback** – without a key, Esri World Imagery is used.

## Data

`src/data/rainfall-greece-average.json` – average monthly precipitation (mm) for 1970–2000 from
WorldClim 2.1 (Fick & Hijmans, 2017) on a 5 arc-minute (~9 km) grid. Only cells on Greek land have
a value; the rest are `null`.

- `grid` – bounds (cell centres), step and size. `months[i].values` is `rows × cols`,
  row 0 = north, column 0 = west. `months[i].name` is the label shown in the UI.
- Edit the file directly to change the data; the dev server reloads automatically.
- Rebuild from source: `npm run data` (downloads WorldClim + Natural Earth and overwrites the file).

Greece outline: Natural Earth 1:10m (`src/data/greece.geo.json`).

## Crop phases

`src/data/crop-calendar.json` – the crop stages shown over the map (months, text, emoji, photo).
Photos are resized thumbnails from Wikimedia Commons in `public/crops/`; authors and licenses are
listed in `public/crops/CREDITS.md` and shown on the map for the cards currently visible.
