// Design tokens for the image-rich main page (/geoponia/v3): dark, colourful, photo-led.
// Same keys as the other styles, plus a colour per chapter band and the hero photos.

export const magazineTheme = {
  colors: {
    page: '#0d1613', // deep night green
    surface: '#15221d',
    surfaceAlt: '#1c2c26',
    ink: '#f4efe2',
    inkSoft: '#d5cfbf',
    muted: '#9ca69d',
    rule: 'rgba(244, 239, 226, 0.14)',
    accent: '#e0a845', // harvest amber
    accentSoft: 'rgba(224, 168, 69, 0.16)',
    brass: '#e0a845',
    moon: '#f1e8c9',
    moonDark: '#26342e',
    onImage: '#ffffff',
    imageShade: 'rgba(6, 12, 10, 0.88)', // bottom of photo gradients
    heroDivider: 'linear-gradient(90deg, #b8742a 0%, #e0a845 35%, #f2cf7a 50%, #e0a845 65%, #b8742a 100%)', // thick bar under the hero
  },

  radius: {
    none: '0px',
    sm: '4px',
    md: '10px',
    lg: '16px',
    round: '999px',
  },

  gap: {
    page: '40px',
    pageMobile: '16px',
    section: '0px', // chapters are full-width colour bands
    band: '88px', // vertical padding inside a band
    row: '22px',
    card: '22px',
    tight: '10px',
  },

  font: {
    heading: '"Noto Serif", "Georgia", serif',
    body: '"Inter", ui-sans-serif, system-ui, sans-serif',
    data: '"Inter", ui-sans-serif, system-ui, sans-serif',
  },

  size: {
    maxWidth: '1280px',
    heroHeight: '88vh',
    heroMinHeight: '620px',
    featureHeight: '520px',
    rowCardHeight: '440px',
    scrollCardWidth: '300px',
    monthCardWidth: '280px',
    monthCardHeight: '380px',
    heroDivider: '10px', // thickness of the bar under the hero
    bandFade: '200px', // how far each chapter band fades in from the previous colour
  },

  shadow: {
    card: '0 24px 48px -24px rgba(0, 0, 0, 0.7)',
    cardHover: '0 30px 60px -24px rgba(0, 0, 0, 0.85)',
  },

  motion: {
    duration: '350ms',
  },
}

// Background colour of each chapter band (in order; repeats if there are more chapters).
export const chapterBands = ['#13211b', '#141a2b', '#21180f', '#101d24', '#1b2113', '#1f1416', '#121a17']

// Photos in the hero: the large background and the small collage beside the title.
export const heroImages = {
  background: 'geoponia/night-farm.jpg',
  collage: ['geoponia/full-moon.jpg', 'geoponia/harvest.jpg', 'geoponia/seedling.jpg'],
}

// A photo behind each month card (files from the crop calendar in public/crops).
export const monthImages = [
  'crops/pruning.jpg',
  'crops/almond_blossom.jpg',
  'crops/leaf_out.jpg',
  'crops/corn_sowing.jpg',
  'crops/cherry_harvest.jpg',
  'crops/wheat_harvest.jpg',
  'crops/tomato_harvest.jpg',
  'crops/peach_harvest.jpg',
  'crops/grape_harvest.jpg',
  'crops/wheat_sowing.jpg',
  'crops/olive_harvest.jpg',
  'crops/orange_harvest.jpg',
]
