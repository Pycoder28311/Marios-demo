import { LuMoon, LuSun } from 'react-icons/lu'

export default function ThemeToggle({ theme, onToggle, className = '' }) {
  const next = theme === 'dark' ? 'Φωτεινό θέμα' : 'Σκοτεινό θέμα'
  return (
    <button
      onClick={onToggle}
      className={`flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-ink/10 hover:text-ink ${className}`}
      aria-label={next}
      title={next}
    >
      {theme === 'dark' ? <LuSun className="h-[18px] w-[18px]" /> : <LuMoon className="h-[18px] w-[18px]" />}
    </button>
  )
}
