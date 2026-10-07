import { useEffect, useState } from 'react'

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = () => setMatches(mql.matches)
    onChange()
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])
  return matches
}

// Phones: below Tailwind's `sm` breakpoint.
export const useIsMobile = () => useMediaQuery('(max-width: 639px)')

// Phones and tablets: below Tailwind's `lg` breakpoint (info opens as a bottom sheet).
export const useIsNarrow = () => useMediaQuery('(max-width: 1023px)')
