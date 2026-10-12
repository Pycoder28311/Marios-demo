import { Link } from 'react-router-dom'
import credits from '../data/credits.json'
import StyleSwitcher from './StyleSwitcher'

// Note on sources and the photo credits (authors and licences are required by most of them).
// extraCredits: [{ author, license, source }] for photos from outside public/geoponia.
export default function Footer({ extraCredits = [] }) {
  return (
    <footer className="mt-(--geo-gap-section) border-t border-(--geo-ink) py-8 text-[12.5px] leading-relaxed text-(--geo-muted)">
      <div className="grid gap-8 md:grid-cols-[1fr_2fr]">
        <div>
          <p className="font-(family-name:--geo-font-heading) text-[16px] text-(--geo-ink)">Σημείωση</p>
          <p className="mt-1">
            Οι αστρονομικοί κύκλοι και οι ημερομηνίες των φάσεων υπολογίζονται με προσεγγιστικούς τύπους (ακρίβεια λίγων λεπτών, ώρα Ελλάδας). Οι
            γεωργικοί κανόνες που συνδέονται με τη Σελήνη παρουσιάζονται ως παραδοσιακή πρακτική· η επιστημονική τεκμηρίωσή τους είναι
            περιορισμένη.
          </p>
          <Link to="/" className="mt-3 inline-block text-(--geo-accent) underline-offset-2 hover:underline">
            Χάρτης βροχόπτωσης της Ελλάδας →
          </Link>
          <StyleSwitcher className="mt-4" />
        </div>
        <div>
          <p className="font-(family-name:--geo-font-heading) text-[16px] text-(--geo-ink)">Φωτογραφίες (Wikimedia Commons)</p>
          <ul className="mt-1 columns-1 gap-6 sm:columns-2">
            {[...Object.values(credits), ...extraCredits].map((c) => (
              <li key={c.source} className="break-inside-avoid">
                <a href={c.source} target="_blank" rel="noreferrer" className="hover:text-(--geo-ink) hover:underline">
                  {c.author}
                </a>{' '}
                · {c.license}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
