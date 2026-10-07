import { useMemo } from 'react'
import { LuMaximize2 } from 'react-icons/lu'
import data from '../data/rainfall-greece-average.json'
import { stats } from '../lib/field'
import { PHASES, SHORT_MONTHS, spanLabel } from '../lib/phases'

const nf = (v) => Math.round(v).toLocaleString('el-GR')
const WIKI = 'https://el.wikipedia.org/wiki/'

// Annual totals (mm) read from the gridded data at a few places (nearest 5′ cell).
const PLACES = [
  ['Κέρκυρα', 39.62, 19.92, 'Ιόνια Νησιά'],
  ['Ιωάννινα', 39.66, 20.85, 'Ήπειρος'],
  ['Ηράκλειο', 35.34, 25.13, 'Κρήτη'],
  ['Θεσσαλονίκη', 40.64, 22.94, 'Κεντρική Μακεδονία'],
  ['Λάρισα', 39.64, 22.42, 'Θεσσαλία'],
  ['Νάξος', 37.1, 25.38, 'Κυκλάδες'],
  ['Αθήνα', 37.98, 23.73, 'Αττική'],
]

const H2 = ({ id, children }) => (
  <h2 id={id} className="mb-3 mt-8 scroll-mt-4 border-b border-ink/20 pb-1 font-serif text-[26px] leading-tight text-ink">
    {children}
  </h2>
)
const A = ({ href, children }) => (
  <a href={href} target="_blank" rel="noreferrer" className="text-link hover:underline">
    {children}
  </a>
)
const Ref = ({ n }) => (
  <sup className="text-[11px]">
    <a href={`#ref-${n}`} className="text-link hover:underline">
      [{n}]
    </a>
  </sup>
)

// Wikipedia-style figure: a framed thumbnail with caption; clicking opens the interactive map.
function MapThumb({ onOpen }) {
  return (
    <figure className="mb-4 w-full rounded-[2px] border border-ink/15 bg-ink/[0.03] p-1.5 sm:float-right sm:ml-6 sm:w-[300px]">
      <button onClick={onOpen} className="group relative block w-full overflow-hidden" aria-label="Άνοιγμα διαδραστικού χάρτη βροχόπτωσης">
        <img
          src={`${import.meta.env.BASE_URL}map-preview.jpg`}
          alt="Χάρτης μέσης βροχόπτωσης Ιανουαρίου στην Ελλάδα με ισοϋέτιες καμπύλες, σε δορυφορικό υπόβαθρο"
          className="block w-full transition duration-300 group-hover:brightness-90"
        />
        <span className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
          <span className="flex items-center gap-2 rounded-[3px] bg-black/70 px-3 py-1.5 text-xs font-medium text-white">
            <LuMaximize2 className="h-3.5 w-3.5" />
            Διαδραστικός χάρτης
          </span>
        </span>
        <span className="absolute bottom-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-[2px] bg-black/60 text-white group-hover:opacity-0">
          <LuMaximize2 className="h-3.5 w-3.5" />
        </span>
      </button>
      <figcaption className="px-0.5 pb-0.5 pt-1.5 text-[12.5px] leading-snug text-ink-3">
        Μέση βροχόπτωση Ιανουαρίου (1970–2000) με ισοϋέτιες καμπύλες ανά 25 mm.{' '}
        <button onClick={onOpen} className="text-link hover:underline">
          Άνοιγμα διαδραστικού χάρτη
        </button>{' '}
        με όλους τους μήνες και τα στάδια των καλλιεργειών.
      </figcaption>
    </figure>
  )
}

export default function Article({ onOpenMap }) {
  const monthly = useMemo(() => data.months.map((m) => stats(m.values)), [])
  const annual = monthly.reduce((a, s) => a + s.mean, 0)
  const places = useMemo(() => {
    const { grid } = data
    return PLACES.map(([name, lat, lon, region]) => {
      const r = Math.round((grid.north - lat) / grid.step)
      const c = Math.round((lon - grid.west) / grid.step)
      const months = data.months.map((m) => m.values[r]?.[c])
      return { name, region, months, total: months.every((v) => v != null) ? months.reduce((a, b) => a + b, 0) : null }
    }).filter((p) => p.total != null)
  }, [])

  const toc = [
    ['general', 'Γενικά χαρακτηριστικά'],
    ['spatial', 'Χωρική κατανομή'],
    ['seasonal', 'Εποχική κατανομή'],
    ['agriculture', 'Βροχόπτωση και γεωργία'],
    ['data', 'Δεδομένα και μέθοδοι'],
    ['see-also', 'Δείτε επίσης'],
    ['references', 'Παραπομπές'],
  ]

  return (
    <article className="mx-auto max-w-[960px] px-5 pb-20 pt-10 text-[15px] leading-[1.65] text-ink-2 sm:px-8">
      <h1 className="border-b border-ink/20 pb-1 font-serif text-[30px] leading-tight text-ink sm:text-[34px]">Βροχόπτωση στην Ελλάδα</h1>
      <p className="mb-5 mt-1.5 text-[13px] text-muted">Από τη Βικιπαίδεια, την ελεύθερη εγκυκλοπαίδεια</p>

      <p className="mb-3">
        Η <b className="text-ink">βροχόπτωση στην Ελλάδα</b> χαρακτηρίζεται από έντονη εποχικότητα και μεγάλες διαφορές από περιοχή σε περιοχή,
        όπως είναι τυπικό για το <A href={`${WIKI}Μεσογειακό_κλίμα`}>μεσογειακό κλίμα</A>. Περίπου τα τρία τέταρτα της ετήσιας βροχής πέφτουν
        από τον Οκτώβριο έως τον Μάρτιο, ενώ τα καλοκαίρια είναι ξηρά. Η δυτική Ελλάδα, που δέχεται πρώτη τα υγρά αέρια ρεύματα από το
        Ιόνιο, είναι σημαντικά πιο βροχερή από τα ανατολικά πεδινά και τα νησιά του Αιγαίου.<Ref n={1} />
      </p>
      <p className="mb-5">
        Με βάση τους μέσους όρους της περιόδου 1970–2000, η μέση ετήσια βροχόπτωση στην ξηρά της χώρας είναι περίπου {nf(annual)} mm, με τιμές
        που κυμαίνονται από λιγότερο από 400 mm στην Αττική έως πάνω από 1.400 mm στα βουνά της Ηπείρου.<Ref n={2} /> Η κατανομή αυτή
        επηρεάζει άμεσα τη γεωργία, καθώς ο κύκλος των καλλιεργειών προσαρμόζεται στις βροχές του χειμώνα και στην ξηρασία του
        καλοκαιριού.
      </p>

      {/* Contents box */}
      <nav aria-label="Περιεχόμενα" className="mb-6 inline-block min-w-[240px] rounded-[2px] border border-ink/15 bg-ink/[0.03] px-4 py-3 text-[14px]">
        <div className="mb-1.5 text-center font-semibold text-ink">Περιεχόμενα</div>
        <ol className="space-y-0.5">
          {toc.map(([id, label], i) => (
            <li key={id}>
              <span className="mr-2 text-muted">{i + 1}</span>
              <a href={`#${id}`} className="text-link hover:underline">
                {label}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <H2 id="general">Γενικά χαρακτηριστικά</H2>
      <p className="mb-3">
        Το κλίμα της Ελλάδας είναι κατά κύριο λόγο μεσογειακό, με ήπιους και υγρούς χειμώνες και θερμά, ξηρά καλοκαίρια.
        <Ref n={1} /> Οι βροχές οφείλονται κυρίως στα βαρομετρικά χαμηλά που διασχίζουν τη Μεσόγειο από τα δυτικά τον χειμώνα. Το καλοκαίρι η
        περιοχή βρίσκεται υπό την επίδραση υποτροπικών αντικυκλώνων και οι βροχές περιορίζονται σε τοπικές καταιγίδες, κυρίως στα ορεινά.
      </p>
      <p className="mb-3">
        Καθοριστικό ρόλο παίζει το ανάγλυφο. Η οροσειρά της Πίνδου εμποδίζει τις υγρές αέριες μάζες που κινούνται από τα δυτικά, με
        αποτέλεσμα τις έντονες βροχές στις προσήνεμες δυτικές πλαγιές και τη «σκιά βροχής» στα ανατολικά, όπου βρίσκονται η Θεσσαλία, η
        Αττική και μεγάλο μέρος της Μακεδονίας.
      </p>

      <H2 id="spatial">Χωρική κατανομή</H2>
      <MapThumb onOpen={onOpenMap} />
      <p className="mb-3">
        Οι μεγαλύτερες ετήσιες ποσότητες καταγράφονται στην Ήπειρο, στα Ιόνια νησιά και στα δυτικά ορεινά της Πελοποννήσου και της Στερεάς
        Ελλάδας. Στα δυτικά της χώρας (γεωγραφικό μήκος έως 21,5° Α) η μέση ετήσια βροχόπτωση ξεπερνά τα 900 mm, ενώ στα ανατολικά
        (πέρα από τις 23,3° Α) είναι περίπου τα μισά, γύρω στα 500 mm.<Ref n={2} />
      </p>
      <p className="mb-3">
        Οι ξηρότερες περιοχές είναι η Αττική, οι Κυκλάδες, η ανατολική Κρήτη και τα πεδινά της Θεσσαλίας, όπου η ετήσια βροχή συχνά δεν
        φτάνει τα 450 mm. Αντίθετα, τα ψηλά βουνά της Κρήτης δέχονται τον χειμώνα ποσότητες που θυμίζουν τη δυτική Ελλάδα, όπως φαίνεται στις
        κλειστές ισοϋέτιες καμπύλες πάνω από τα Λευκά Όρη, τον Ψηλορείτη και τη Δίκτη.
      </p>

      <table className="my-4 w-full max-w-[560px] border-collapse text-[13.5px]">
        <caption className="mb-1.5 text-left text-[13px] font-semibold text-ink">Ετήσια βροχόπτωση σε επιλεγμένες περιοχές (mm)<Ref n={2} /></caption>
        <thead>
          <tr className="bg-ink/[0.06] text-ink">
            <th className="border border-ink/20 px-2.5 py-1 text-left font-semibold">Περιοχή</th>
            <th className="border border-ink/20 px-2.5 py-1 text-left font-semibold">Διαμέρισμα</th>
            <th className="border border-ink/20 px-2.5 py-1 text-right font-semibold">Ετήσια</th>
            <th className="border border-ink/20 px-2.5 py-1 text-right font-semibold">Δεκ–Φεβ</th>
            <th className="border border-ink/20 px-2.5 py-1 text-right font-semibold">Ιουν–Αυγ</th>
          </tr>
        </thead>
        <tbody className="tabular-nums">
          {[...places]
            .sort((a, b) => b.total - a.total)
            .map((p) => (
              <tr key={p.name}>
                <td className="border border-ink/20 px-2.5 py-1">{p.name}</td>
                <td className="border border-ink/20 px-2.5 py-1 text-muted">{p.region}</td>
                <td className="border border-ink/20 px-2.5 py-1 text-right font-medium text-ink">{nf(p.total)}</td>
                <td className="border border-ink/20 px-2.5 py-1 text-right">{nf(p.months[11] + p.months[0] + p.months[1])}</td>
                <td className="border border-ink/20 px-2.5 py-1 text-right">{nf(p.months[5] + p.months[6] + p.months[7])}</td>
              </tr>
            ))}
        </tbody>
      </table>
      <p className="mb-3 text-[13px] text-muted">
        Οι τιμές προέρχονται από το πλέγμα WorldClim (κελιά περίπου 9 km) και όχι από μετρήσεις μετεωρολογικών σταθμών· σε ορεινές περιοχές
        μπορεί να διαφέρουν σημαντικά από τις τοπικές μετρήσεις.
      </p>

      <H2 id="seasonal">Εποχική κατανομή</H2>
      <p className="mb-3">
        Ο πιο βροχερός μήνας κατά μέσο όρο είναι ο Δεκέμβριος, ακολουθούμενος από τον Νοέμβριο και τον Ιανουάριο. Από τον Απρίλιο οι βροχές
        μειώνονται σταδιακά και το διάστημα Ιουνίου–Αυγούστου συγκεντρώνει μόλις το 9% περίπου της ετήσιας ποσότητας. Οι πρώτες
        φθινοπωρινές βροχές τον Οκτώβριο σηματοδοτούν την αρχή της νέας γεωργικής χρονιάς για τα χειμερινά σιτηρά.<Ref n={2} />
      </p>
      <div className="my-4 overflow-x-auto">
        <table className="w-full min-w-[620px] border-collapse text-[13px] tabular-nums">
          <caption className="mb-1.5 text-left text-[13px] font-semibold text-ink">Μέση μηνιαία βροχόπτωση στην ξηρά της Ελλάδας, 1970–2000 (mm)</caption>
          <thead>
            <tr className="bg-ink/[0.06] text-ink">
              <th className="border border-ink/20 px-1.5 py-1 text-left font-semibold">Μήνας</th>
              {SHORT_MONTHS.map((m) => (
                <th key={m} className="border border-ink/20 px-1.5 py-1 text-right font-semibold">
                  {m}
                </th>
              ))}
              <th className="border border-ink/20 px-1.5 py-1 text-right font-semibold">Έτος</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Μέση', (s) => s.mean],
              ['Ελάχ.', (s) => s.min],
              ['Μέγ.', (s) => s.max],
            ].map(([label, get]) => (
              <tr key={label}>
                <th className="border border-ink/20 px-1.5 py-1 text-left font-semibold text-ink">{label}</th>
                {monthly.map((s, i) => (
                  <td key={i} className="border border-ink/20 px-1.5 py-1 text-right">
                    {nf(get(s))}
                  </td>
                ))}
                <td className="border border-ink/20 px-1.5 py-1 text-right font-medium text-ink">{label === 'Μέση' ? nf(annual) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <H2 id="agriculture">Βροχόπτωση και γεωργία</H2>
      <p className="mb-3">
        Η ελληνική γεωργία έχει προσαρμοστεί στον ρυθμό των βροχών. Τα χειμερινά σιτηρά, όπως το <A href={`${WIKI}Σιτάρι`}>σιτάρι</A>,
        σπέρνονται με τις πρώτες φθινοπωρινές βροχές και αναπτύσσονται τον χειμώνα, ώστε να συγκομιστούν πριν από την καλοκαιρινή ξηρασία.
        Οι ανοιξιάτικες καλλιέργειες, όπως το <A href={`${WIKI}Καλαμπόκι`}>καλαμπόκι</A>, το <A href={`${WIKI}Βαμβάκι`}>βαμβάκι</A> και η{' '}
        <A href={`${WIKI}Τομάτα`}>τομάτα</A>, ολοκληρώνουν τον κύκλο τους τους ξηρούς μήνες και βασίζονται στην άρδευση.
      </p>
      <p className="mb-3">
        Τα πολυετή δέντρα έχουν τον δικό τους ρυθμό: η <A href={`${WIKI}Αμυγδαλιά`}>αμυγδαλιά</A> ανθίζει ήδη τον Φεβρουάριο, η{' '}
        <A href={`${WIKI}Ελιά`}>ελιά</A> τον Μάιο, ενώ τα πορτοκάλια και οι ελιές συγκομίζονται μέσα στον υγρό χειμώνα. Ο διαδραστικός χάρτης
        παρουσιάζει τα κύρια στάδια μαζί με τη βροχόπτωση κάθε μήνα:
      </p>
      <ul className="mb-3 ml-6 list-disc space-y-0.5">
        {PHASES.filter((p) => ['Σιτάρι', 'Ελιά', 'Βαμβάκι', 'Αμπέλι'].includes(p.crop)).map((p, i) => (
          <li key={i}>
            <b className="font-medium text-ink">
              {p.crop} – {p.phase.toLowerCase()}
            </b>{' '}
            ({spanLabel(p.months)}): {p.note}.
          </li>
        ))}
      </ul>
      <p className="mb-3">
        <button onClick={onOpenMap} className="text-link hover:underline">
          Άνοιγμα του διαδραστικού χάρτη
        </button>{' '}
        για όλους τους μήνες και όλες τις καλλιέργειες.
      </p>

      <H2 id="data">Δεδομένα και μέθοδοι</H2>
      <p className="mb-3">
        Οι τιμές βροχόπτωσης του άρθρου και του χάρτη προέρχονται από τη βάση <A href="https://www.worldclim.org/data/worldclim21.html">WorldClim 2.1</A>,
        που παρέχει μηνιαίους κλιματικούς μέσους όρους της περιόδου 1970–2000 σε πλέγμα 5 λεπτών της μοίρας (περίπου 9 km).<Ref n={2} /> Τα
        όρια της χώρας προέρχονται από το <A href="https://www.naturalearthdata.com/">Natural Earth</A>.<Ref n={3} /> Οι ισοϋέτιες καμπύλες
        υπολογίζονται από το πλέγμα με παρεμβολή και οι στατιστικές αφορούν μόνο τα κελιά της ξηράς.
      </p>

      <H2 id="see-also">Δείτε επίσης</H2>
      <ul className="mb-3 ml-6 list-disc space-y-0.5">
        <li>
          <A href={`${WIKI}Κλίμα_της_Ελλάδας`}>Κλίμα της Ελλάδας</A>
        </li>
        <li>
          <A href={`${WIKI}Μεσογειακό_κλίμα`}>Μεσογειακό κλίμα</A>
        </li>
        <li>
          <A href={`${WIKI}Πίνδος`}>Πίνδος</A>
        </li>
      </ul>

      <H2 id="references">Παραπομπές</H2>
      <ol className="ml-6 list-decimal space-y-1 text-[13.5px]">
        <li id="ref-1">
          «<A href={`${WIKI}Κλίμα_της_Ελλάδας`}>Κλίμα της Ελλάδας</A>». Βικιπαίδεια.
        </li>
        <li id="ref-2">
          Fick, S. E.; Hijmans, R. J. (2017). «WorldClim 2: new 1-km spatial resolution climate surfaces for global land areas».{' '}
          <i>International Journal of Climatology</i> 37 (12): 4302–4315.{' '}
          <A href="https://doi.org/10.1002/joc.5086">doi:10.1002/joc.5086</A>.
        </li>
        <li id="ref-3">
          <A href="https://www.naturalearthdata.com/">Natural Earth</A>, Admin 0 – Countries, κλίμακα 1:10m (κοινό κτήμα).
        </li>
      </ol>
    </article>
  )
}
