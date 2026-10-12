import AnodikiKathodiki from './AnodikiKathodiki'

// Articles with a full text: slug → body component and its table of contents.
export const articles = {
  'anodiki-kathodiki-selini': {
    Body: AnodikiKathodiki,
    updated: '12 Οκτωβρίου 2026',
    toc: [
      ['ti-metra', 'Τι μετρά η απόκλιση'],
      ['tis-epomenes-meres', 'Οι επόμενες 28 ημέρες'],
      ['oxi-fasi', 'Ανοδική δεν σημαίνει αύξουσα'],
      ['paradosi', 'Η παραδοσιακή πρακτική'],
      ['erevna', 'Τι γνωρίζουμε από την έρευνα'],
      ['praktika', 'Πρακτικός οδηγός'],
    ],
  },
}
