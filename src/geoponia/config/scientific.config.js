// Design tokens for the "scientific" main page (/geoponia).
// Change any value here and every component on the page follows: they read these as CSS
// custom properties (see toCssVars) – e.g. colors.accent → var(--geo-accent).

export const scientificTheme = {
  colors: {
    page: '#f4f2ec', // paper background
    surface: '#fbfaf6', // cards
    surfaceAlt: '#ece9df', // bands, table headers
    ink: '#18211c', // headings, primary text
    inkSoft: '#36413a', // body text
    muted: '#6b746d', // captions, meta
    rule: '#d5d1c4', // hairlines, borders
    accent: '#2f5d46', // links, chapter numbers (deep field green)
    accentSoft: '#dfe8e1', // accent backgrounds
    brass: '#8a6d2f', // astronomical data, figure labels
    moon: '#c9c3ae', // moon glyph (lit part)
    moonDark: '#2b3530', // moon glyph (dark part)
    onImage: '#ffffff', // text over photos
  },

  radius: {
    none: '0px',
    sm: '2px', // tags, small buttons
    md: '4px', // cards, images
    lg: '8px', // large panels
    round: '999px', // pills, glyphs
  },

  gap: {
    page: '40px', // horizontal page padding (desktop)
    pageMobile: '18px', // horizontal page padding (phones)
    section: '72px', // between chapters
    row: '28px', // between cards in a chapter
    card: '20px', // inside cards
    tight: '10px', // small groups (meta, tags)
  },

  font: {
    heading: '"Noto Serif", "Georgia", "Times New Roman", serif',
    body: '"Inter", ui-sans-serif, system-ui, sans-serif',
    data: '"Inter", ui-sans-serif, system-ui, sans-serif', // numbers use tabular figures
  },

  size: {
    maxWidth: '1240px', // content width
    featureImage: '46%', // image share of the big horizontal cards
    featureMinHeight: '320px',
    rowCardImage: '200px', // image height of cards shown in a row
    scrollCardWidth: '260px', // width of cards in scrolling rows
    monthCardWidth: '230px',
  },

  shadow: {
    card: '0 1px 0 rgba(24, 33, 28, 0.04), 0 10px 28px -18px rgba(24, 33, 28, 0.35)',
    cardHover: '0 1px 0 rgba(24, 33, 28, 0.06), 0 18px 36px -18px rgba(24, 33, 28, 0.45)',
  },

  motion: {
    duration: '220ms',
  },
}
