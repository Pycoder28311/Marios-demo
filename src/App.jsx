import { useEffect, useState } from 'react'
import Article from './components/Article'
import RainExplorer from './components/RainExplorer'
import { useTheme } from './lib/theme'

function Modal({ onClose, children }) {
  // Lock page scroll while open.
  useEffect(() => {
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = overflow
    }
  }, [])

  return (
    <div
      className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/60 p-0 backdrop-blur-sm sm:p-5"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Βροχόπτωση και αγροτικός κύκλος"
        className="relative h-full w-full max-w-[1680px] overflow-hidden bg-surface shadow-2xl ring-1 ring-ink/10 sm:max-h-[1040px] sm:rounded-lg"
      >
        {children}
      </div>
    </div>
  )
}

// An encyclopedia-style article; its map figure opens the interactive map in a modal.
function App() {
  const [open, setOpen] = useState(false)
  const [theme, toggleTheme] = useTheme()

  return (
    <div className="min-h-dvh bg-surface">
      <Article onOpenMap={() => setOpen(true)} />

      {open && (
        <Modal onClose={() => setOpen(false)}>
          <RainExplorer onClose={() => setOpen(false)} theme={theme} onToggleTheme={toggleTheme} />
        </Modal>
      )}
    </div>
  )
}

export default App
