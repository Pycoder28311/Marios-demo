import { NavLink } from 'react-router-dom'

const STYLES = [
  ['/geoponia', 'Επιστημονική'],
  ['/geoponia/v2', 'Λιτή'],
  ['/geoponia/v3', 'Εικονογραφημένη'],
]

// Links between the three versions of the main page.
export default function StyleSwitcher({ className = '' }) {
  return (
    <nav aria-label="Εκδοχές σελίδας" className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] ${className}`}>
      <span className="text-(--geo-muted)">Εκδοχή:</span>
      {STYLES.map(([to, label]) => (
        <NavLink
          key={to}
          to={to}
          end
          className={({ isActive }) =>
            isActive ? 'font-semibold text-(--geo-ink) underline decoration-(--geo-accent) decoration-2 underline-offset-4' : 'text-(--geo-muted) hover:text-(--geo-ink)'
          }
        >
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
