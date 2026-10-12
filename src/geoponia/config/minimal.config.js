// Design tokens for the "minimal" main page (/geoponia/v2). Same keys as the other
// styles, so shared components (moon glyph, footer, style switcher) work unchanged.

export const minimalTheme = {
  colors: {
    page: '#fbfbf9',
    surface: '#ffffff',
    surfaceAlt: '#f1f1ed',
    ink: '#121412',
    inkSoft: '#3d413d',
    muted: '#8b8f8a',
    rule: '#e4e4df',
    accent: '#2f5d46',
    accentSoft: '#eef3ef',
    brass: '#8b8f8a', // minimal style keeps numbers grey
    moon: '#d9d6cb',
    moonDark: '#3d413d',
    onImage: '#ffffff',
  },

  radius: {
    none: '0px',
    sm: '0px',
    md: '0px', // square images and blocks
    lg: '2px',
    round: '999px',
  },

  gap: {
    page: '56px',
    pageMobile: '20px',
    section: '96px', // generous space between chapters
    row: '36px',
    card: '0px',
    tight: '8px',
  },

  font: {
    heading: '"Inter", ui-sans-serif, system-ui, sans-serif',
    body: '"Inter", ui-sans-serif, system-ui, sans-serif',
    data: '"Inter", ui-sans-serif, system-ui, sans-serif',
  },

  size: {
    maxWidth: '1180px',
    sideColumn: '220px', // chapter title column
    featureImage: '42%',
    rowCardImage: '4 / 3', // aspect ratio
    scrollCardWidth: '240px',
    monthCardWidth: '170px',
  },

  shadow: {
    card: 'none',
    cardHover: 'none',
  },

  motion: {
    duration: '300ms',
    imageFilter: 'grayscale(1)', // images are grey until hovered
  },
}
