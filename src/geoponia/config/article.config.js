// Design tokens for the article page (/geoponia/:slug). Same mechanism as the main page:
// values become CSS custom properties via toCssVars.

import { scientificTheme } from './scientific.config'

export const articleTheme = {
  ...scientificTheme,

  colors: {
    ...scientificTheme.colors,
    panel: 'rgba(251, 250, 246, 0.86)', // see-through text panel over the background photo
    panelBorder: 'rgba(255, 255, 255, 0.55)',
    backdropTint: 'rgba(10, 16, 22, 0.35)', // darkens the background photo
    bannerTint: 'rgba(8, 12, 16, 0.55)', // darkens the banner photo under the title
  },

  article: {
    bannerHeight: '58vh',
    bannerMinHeight: '380px',
    panelWidth: '820px',
    panelPadding: '56px',
    panelPaddingMobile: '22px',
    panelBlur: '14px',
    panelOverlap: '120px', // how far the panel rises over the banner
    bodySize: '17px',
    bodyLeading: '1.75',
  },
}

// Photos used by the article page (files in public/geoponia).
export const articleImages = {
  banner: 'moon-mountain.jpg',
  backdrop: 'night-farm.jpg',
}
