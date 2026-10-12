import { useMemo, useState } from 'react'
import { LuCheck, LuMinus } from 'react-icons/lu'
import DeclinationChart from '../components/DeclinationChart'
import { declinationSeries, formatWeekday } from '../lib/astro'

const nf1 = (v) => v.toLocaleString('el-GR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

const H2 = ({ id, children }) => (
  <h2 id={id} className="mb-3 mt-12 scroll-mt-6 font-(family-name:--geo-font-heading) text-[26px] leading-tight text-(--geo-ink)">
    {children}
  </h2>
)
const P = ({ children }) => <p className="mb-4">{children}</p>

// Traditional allocation of work (as described in lunar planting calendars).
const WORK = [
  ['Σπορά', true, false],
  ['Συγκομιδή καρπών και φρούτων', true, false],
  ['Εμβολιασμοί, συλλογή εμβολίων', true, false],
  ['Φύτευση και μεταφύτευση', false, true],
  ['Κλάδεμα', false, true],
  ['Συγκομιδή ριζών και κονδύλων', false, true],
  ['Λίπανση, κομπόστ, κατεργασία εδάφους', false, true],
]

export default function AnodikiKathodiki() {
  // The current hour, fixed for the life of the page.
  const [today] = useState(() => {
    const d = new Date()
    d.setMinutes(0, 0, 0)
    return d
  })
  const { turns } = useMemo(() => declinationSeries(today, 56, 1), [today])

  return (
    <>
      <p className="mb-6 font-(family-name:--geo-font-heading) text-[21px] leading-relaxed text-(--geo-ink)">
        Στα σεληνιακά ημερολόγια καλλιεργειών οι όροι «ανοδική» και «καθοδική» σελήνη εμφανίζονται σχεδόν σε κάθε σελίδα. Δεν περιγράφουν τις
        φάσεις, αλλά κάτι λιγότερο γνωστό: πόσο ψηλά ανεβαίνει η Σελήνη στον ουρανό από μέρα σε μέρα.
      </p>

      {/* Key facts */}
      <aside aria-label="Με μια ματιά" className="mb-8 grid gap-px overflow-hidden rounded-(--geo-radius-md) bg-(--geo-rule) ring-1 ring-(--geo-rule) sm:grid-cols-4">
        {[
          ['Κύκλος', '27,32 ημ.', 'τροπικός μήνας'],
          ['Κάθε φάση', '≈ 13,7 ημ.', 'μισός κύκλος'],
          ['Μέγεθος', 'απόκλιση δ', 'βόρεια/νότια'],
          ['Εύρος', '±18,3° – ±28,6°', 'κύκλος 18,6 ετών'],
        ].map(([k, v, n]) => (
          <div key={k} className="bg-(--geo-surface) px-4 py-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-(--geo-muted)">{k}</div>
            <div className="mt-0.5 font-(family-name:--geo-font-heading) text-[19px] tabular-nums text-(--geo-ink)">{v}</div>
            <div className="text-[12px] text-(--geo-muted)">{n}</div>
          </div>
        ))}
      </aside>

      <H2 id="ti-metra">Τι μετρά η απόκλιση</H2>
      <P>
        Η <b className="text-(--geo-ink)">απόκλιση</b> (δ) είναι η γωνιακή απόσταση ενός ουράνιου σώματος βόρεια ή νότια από τον ουράνιο ισημερινό,
        κάτι σαν το «γεωγραφικό πλάτος» του ουρανού. Ο Ήλιος την αλλάζει αργά μέσα στο έτος, από −23,4° στο χειμερινό ηλιοστάσιο έως +23,4° στο
        θερινό. Γι' αυτό τον χειμώνα μεσουρανεί χαμηλά και το καλοκαίρι ψηλά.
      </P>
      <P>
        Η Σελήνη κάνει την ίδια διαδρομή, όμως σε έναν μήνα: σε περίπου 27,3 ημέρες, τον <b className="text-(--geo-ink)">τροπικό μήνα</b>, περνά από
        τη νοτιότερη στη βορειότερη θέση της και πίσω. Όσο η απόκλισή της αυξάνεται, από την Ελλάδα τη βλέπουμε να μεσουρανεί κάθε βράδυ λίγο
        ψηλότερα. Αυτή είναι η <b className="text-(--geo-ink)">ανοδική σελήνη</b>. Όταν η απόκλιση μειώνεται, η Σελήνη χαμηλώνει μέρα με τη μέρα:
        είναι η <b className="text-(--geo-ink)">καθοδική σελήνη</b>.
      </P>
      <P>
        Το εύρος της διαδρομής δεν είναι σταθερό. Επειδή η τροχιά της Σελήνης έχει κλίση περίπου 5,1° ως προς την εκλειπτική και οι δεσμοί της
        περιστρέφονται με περίοδο 18,6 ετών, η μέγιστη απόκλιση κυμαίνεται από ±18,3° έως ±28,6°. Τα έτη 2024–2025 ήταν κοντά στο μέγιστο, γι'
        αυτό σήμερα οι ακραίες τιμές πλησιάζουν ακόμη τις 28°.
      </P>

      <H2 id="tis-epomenes-meres">Οι επόμενες 28 ημέρες</H2>
      <figure className="mb-6 rounded-(--geo-radius-md) bg-(--geo-surface) p-4 ring-1 ring-(--geo-rule)">
        <DeclinationChart start={today} days={28} />
        <figcaption className="mt-2 text-[12.5px] leading-snug text-(--geo-muted)">
          <span className="mr-1 font-semibold text-(--geo-brass)">Εικ. 1</span>
          Απόκλιση της Σελήνης από σήμερα και για 28 ημέρες, υπολογισμένη με προσεγγιστικούς τύπους του <i>Astronomical Almanac</i>. Με πράσινο οι
          ανοδικές περίοδοι, με ώχρα οι καθοδικές.
        </figcaption>
      </figure>

      <table className="mb-4 w-full border-collapse text-[14.5px]">
        <caption className="mb-2 text-left text-[13px] font-semibold text-(--geo-ink)">Πίνακας 1. Επόμενες αλλαγές (ώρα Ελλάδας)</caption>
        <thead>
          <tr className="border-b border-(--geo-ink) text-left text-[12px] uppercase tracking-[0.1em] text-(--geo-muted)">
            <th className="py-2 pr-4 font-semibold">Ημερομηνία</th>
            <th className="py-2 pr-4 font-semibold">Σημείο</th>
            <th className="py-2 pr-4 text-right font-semibold">Απόκλιση</th>
            <th className="py-2 font-semibold">Ξεκινά</th>
          </tr>
        </thead>
        <tbody>
          {turns.slice(0, 4).map((t) => (
            <tr key={t.date.getTime()} className="border-b border-(--geo-rule)">
              <td className="py-2 pr-4 tabular-nums text-(--geo-ink)">{formatWeekday(t.date)}</td>
              <td className="py-2 pr-4">{t.type === 'max' ? 'Βορειότερη θέση' : 'Νοτιότερη θέση'}</td>
              <td className="py-2 pr-4 text-right tabular-nums">
                {t.dec > 0 ? '+' : '−'}
                {nf1(Math.abs(t.dec))}°
              </td>
              <td className={`py-2 font-medium ${t.type === 'max' ? 'text-(--geo-brass)' : 'text-(--geo-accent)'}`}>
                {t.type === 'max' ? 'Καθοδική' : 'Ανοδική'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <H2 id="oxi-fasi">Ανοδική δεν σημαίνει αύξουσα</H2>
      <P>
        Η πιο συχνή σύγχυση είναι ανάμεσα στην ανοδική σελήνη και στην <b className="text-(--geo-ink)">αύξουσα</b>, δηλαδή στο διάστημα από τη νέα
        σελήνη ως την πανσέληνο. Οι φάσεις ακολουθούν τον συνοδικό μήνα των 29,53 ημερών, που εξαρτάται από τη θέση της Σελήνης ως προς τον Ήλιο.
        Η απόκλιση ακολουθεί τον τροπικό μήνα των 27,32 ημερών.
      </P>
      <P>
        Επειδή οι δύο κύκλοι έχουν διαφορά περίπου 2,2 ημερών, ολισθαίνουν ο ένας ως προς τον άλλο. Μέσα σε ένα έτος συναντάμε όλους τους
        συνδυασμούς: αύξουσα και ανοδική, αύξουσα και καθοδική, φθίνουσα και ανοδική, φθίνουσα και καθοδική. Γι' αυτό τα ημερολόγια τα
        σημειώνουν ξεχωριστά.
      </P>

      <H2 id="paradosi">Η παραδοσιακή πρακτική</H2>
      <P>
        Στη γεωργική παράδοση, και ιδιαίτερα στα βιοδυναμικά ημερολόγια, η ανοδική σελήνη παρομοιάζεται με την άνοιξη: οι χυμοί «ανεβαίνουν» προς
        το υπέργειο τμήμα του φυτού. Η καθοδική παρομοιάζεται με το φθινόπωρο: οι χυμοί «κατεβαίνουν» προς τις ρίζες. Με αυτό το σκεπτικό οι
        εργασίες κατανέμονται όπως στον πίνακα.
      </P>
      <table className="mb-6 w-full border-collapse text-[14.5px]">
        <caption className="mb-2 text-left text-[13px] font-semibold text-(--geo-ink)">Πίνακας 2. Εργασίες κατά την παράδοση</caption>
        <thead>
          <tr className="border-b border-(--geo-ink) text-[12px] uppercase tracking-[0.1em] text-(--geo-muted)">
            <th className="py-2 pr-4 text-left font-semibold">Εργασία</th>
            <th className="w-28 py-2 font-semibold text-(--geo-accent)">Ανοδική</th>
            <th className="w-28 py-2 font-semibold text-(--geo-brass)">Καθοδική</th>
          </tr>
        </thead>
        <tbody>
          {WORK.map(([task, up, down]) => (
            <tr key={task} className="border-b border-(--geo-rule)">
              <td className="py-2 pr-4 text-(--geo-ink)">{task}</td>
              {[up, down].map((on, i) => (
                <td key={i} className="py-2 text-center">
                  {on ? (
                    <LuCheck className={`mx-auto h-4 w-4 ${i ? 'text-(--geo-brass)' : 'text-(--geo-accent)'}`} aria-label="ναι" />
                  ) : (
                    <LuMinus className="mx-auto h-4 w-4 text-(--geo-rule)" aria-label="όχι" />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <P>
        Πολλά ημερολόγια προσθέτουν και δεύτερο κριτήριο, τον αστερισμό μπροστά στον οποίο βρίσκεται η Σελήνη. Έτσι προκύπτουν οι «ημέρες ρίζας,
        φύλλου, άνθους και καρπού». Συνήθως αποφεύγουν επίσης τις ημέρες κοντά στους σεληνιακούς δεσμούς και στο περίγειο.
      </P>

      <H2 id="erevna">Τι γνωρίζουμε από την έρευνα</H2>
      <div className="mb-4 border-l-[3px] border-(--geo-accent) bg-(--geo-accent-soft) px-4 py-3 text-[15px]">
        <P>
          Οι κύκλοι της Σελήνης είναι ακριβώς μετρήσιμοι. Η επίδρασή τους στις καλλιέργειες όμως δεν έχει τεκμηριωθεί με συνέπεια. Οι περισσότερες
          ελεγχόμενες δοκιμές σποράς και συγκομιδής δεν έχουν δείξει σταθερές διαφορές που να αποδίδονται στη Σελήνη. Οι παλιρροϊκές δυνάμεις
          της πάνω σε ένα φυτό είναι ασήμαντες σε σχέση με τη θερμοκρασία, την υγρασία του εδάφους και το φως.
        </P>
        <p>
          Το σεληνιακό ημερολόγιο λειτουργεί καλύτερα ως πλαίσιο οργάνωσης των εργασιών, όχι ως υποκατάστατο της παρατήρησης του καιρού και του
          εδάφους.
        </p>
      </div>

      <H2 id="praktika">Πρακτικός οδηγός</H2>
      <ol className="mb-6 space-y-3">
        {[
          ['Βρείτε τη φάση της ημέρας', 'Χρησιμοποιήστε ένα σεληνιακό ημερολόγιο ή τον Πίνακα 1. Η αλλαγή γίνεται στη βορειότερη και στη νοτιότερη θέση της Σελήνης.'],
          ['Βάλτε τον καιρό πρώτα', 'Μια «κατάλληλη» ημέρα με παγετό, καύσωνα ή λασπωμένο έδαφος δεν είναι κατάλληλη. Μεταθέστε την εργασία στην επόμενη ευκαιρία.'],
          ['Ομαδοποιήστε τις εργασίες', 'Μεταφυτεύσεις, κλαδέματα και λιπάνσεις στις καθοδικές ημέρες· σπορές και συγκομιδές καρπών στις ανοδικές.'],
          ['Κρατήστε σημειώσεις', 'Καταγράψτε ημερομηνία, φάση, καιρό και αποτέλεσμα. Μετά από δύο σεζόν θα έχετε τα δικά σας συγκριτικά δεδομένα.'],
        ].map(([title, text], i) => (
          <li key={title} className="grid grid-cols-[36px_1fr] gap-2">
            <span className="font-(family-name:--geo-font-heading) text-[22px] leading-none tabular-nums text-(--geo-brass)">{i + 1}</span>
            <span>
              <b className="text-(--geo-ink)">{title}.</b> {text}
            </span>
          </li>
        ))}
      </ol>
      <P>
        <b className="text-(--geo-ink)">Νότιο ημισφαίριο.</b> Η απόκλιση μεταβάλλεται με τον ίδιο τρόπο σε όλη τη Γη. Στο νότιο ημισφαίριο όμως η
        αυξανόμενη απόκλιση σημαίνει ότι η Σελήνη χαμηλώνει στον ουρανό, γι' αυτό τα τοπικά ημερολόγια αντιστρέφουν τους όρους.
      </P>

      {/* Definitions */}
      <dl className="mt-10 grid gap-4 rounded-(--geo-radius-md) bg-(--geo-surface) p-5 text-[14px] ring-1 ring-(--geo-rule) sm:grid-cols-2">
        <dt className="col-span-full text-[11px] font-semibold uppercase tracking-[0.14em] text-(--geo-muted)">Ορισμοί</dt>
        {[
          ['Απόκλιση (δ)', 'Γωνιακή απόσταση από τον ουράνιο ισημερινό, θετική προς βορρά.'],
          ['Τροπικός μήνας', 'Χρόνος για να επανέλθει η Σελήνη στο ίδιο σημείο ως προς το εαρινό ισημερινό σημείο, 27,32 ημέρες.'],
          ['Συνοδικός μήνας', 'Χρόνος από νέα σε νέα σελήνη, 29,53 ημέρες.'],
          ['Σεληνιακοί δεσμοί', 'Τα δύο σημεία όπου η τροχιά της Σελήνης τέμνει την εκλειπτική· περιστρέφονται με περίοδο 18,6 ετών.'],
        ].map(([term, def]) => (
          <div key={term}>
            <dt className="font-(family-name:--geo-font-heading) text-(--geo-ink)">{term}</dt>
            <dd className="text-(--geo-ink-soft)">{def}</dd>
          </div>
        ))}
      </dl>

      <h2 className="mb-2 mt-10 font-(family-name:--geo-font-heading) text-[20px] text-(--geo-ink)">Βιβλιογραφία</h2>
      <ol className="list-decimal space-y-1 pl-5 text-[14px] text-(--geo-ink-soft)">
        <li>Meeus, J. (1998). <i>Astronomical Algorithms</i>, 2η έκδ. Willmann-Bell.</li>
        <li>
          U.S. Naval Observatory & HM Nautical Almanac Office. <i>The Astronomical Almanac</i>, ενότητα «Low-precision formulae for the Moon».
        </li>
        <li>Thun, M. & Thun, M. K. <i>Aussaattage</i> (ετήσιο βιοδυναμικό ημερολόγιο σποράς).</li>
      </ol>
    </>
  )
}
