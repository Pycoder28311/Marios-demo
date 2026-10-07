// Fetches the Greek Wikipedia texts shown in the info sidebar.
//
//   npm run wiki
//
// Writes src/data/wiki.json: per article its lead and a few selected sections (plain
// text, trimmed). Text from Wikipedia is licensed CC BY-SA 4.0; the sidebar credits it
// and links to the article.

import { writeFile } from 'node:fs/promises'

// Article -> sections to keep (in this order). Which article/section a crop phase uses is
// set by `wiki` / `wikiSection` in src/data/crop-calendar.json.
const ARTICLES = {
  Σιτάρι: ['Περιγραφή', 'Οικολογικές απαιτήσεις', 'Ιστορία'],
  Καλαμπόκι: ['Χαρακτηριστικά', 'Χρήσεις', 'Παραγωγή'],
  Τομάτα: ['Ο καρπός', 'Χρήσεις'],
  Βαμβάκι: ['Χαρακτηριστικά', 'Κλίμα, έδαφος, σπορά, λίπανση', 'Συγκομιδή-Εκκόκκιση'],
  Πορτοκαλιά: ['Χαρακτηριστικά', 'Καλλιέργεια'],
  Ελιά: ['Η συγκομιδή της ελιάς', 'Είδη και ποικιλίες', 'Ιστορία'],
  Αμπέλι: ['Κλάδεμα', 'Τρύγος', 'Μορφολογία-Πολλαπλασιασμός'],
  Φυλλοβόλα: ['Λειτουργία', 'Φυλλοβόλα ξυλώδη φυτά'],
  Κερασιά: ['Χαρακτηριστικά', 'Καλλιέργεια', 'Παραγωγή'],
  Αμυγδαλιά: ['Καλλιέργεια', 'Άνθη', 'Ιστορία'],
  Ροδακινιά: ['Περιγραφή', 'Καλλιέργεια στην Ελλάδα', 'Συγκομιδή'],
}

const MAX_PARAGRAPHS = 3
const MAX_CHARS = 1100

const clean = (s) =>
  s
    .replace(/[‎‏]/g, '')
    .replace(/\s+([,.;:])/g, '$1')
    .replace(/\(\s*\)/g, '')
    .replace(/[ \t]+/g, ' ')
    .trim()

// Keep whole paragraphs up to a length budget; cut an overlong paragraph at a sentence end.
function trimParagraphs(text) {
  const paras = text
    .split(/\n+/)
    .map(clean)
    .filter((p) => p.length > 40)
  const out = []
  let used = 0
  for (const p of paras.slice(0, MAX_PARAGRAPHS)) {
    if (used + p.length <= MAX_CHARS) {
      out.push(p)
      used += p.length
      continue
    }
    const room = MAX_CHARS - used
    const cut = p.slice(0, room).lastIndexOf('. ')
    if (cut > 120) out.push(p.slice(0, cut + 1))
    break
  }
  return out
}

// Split a plain-text extract (exsectionformat=wiki) into lead + {heading: text}.
function splitSections(extract) {
  const parts = extract.split(/^(==+)\s*(.+?)\s*\1\s*$/m)
  const lead = parts[0]
  const sections = {}
  for (let i = 1; i < parts.length; i += 3) sections[parts[i + 1]] = parts[i + 2] ?? ''
  return { lead, sections }
}

const out = {}
for (const [title, wanted] of Object.entries(ARTICLES)) {
  const u = new URL('https://el.wikipedia.org/w/api.php')
  Object.entries({ action: 'query', format: 'json', redirects: '1', prop: 'extracts|info', inprop: 'url', explaintext: '1', exsectionformat: 'wiki', titles: title }).forEach(
    ([k, v]) => u.searchParams.set(k, v),
  )
  let json
  for (let attempt = 0; !json; attempt++) {
    const res = await fetch(u, { headers: { 'User-Agent': 'RainMapDemo/1.0 (educational demo)' } })
    if (res.ok && res.headers.get('content-type')?.includes('json')) json = await res.json()
    else if (attempt < 5) await new Promise((r) => setTimeout(r, 3000 * (attempt + 1))) // rate limited – back off
    else throw new Error(`Wikipedia request failed (HTTP ${res.status})`)
  }
  const page = Object.values(json.query.pages)[0]
  if (page.missing !== undefined) throw new Error(`Missing article: ${title}`)
  const { lead, sections } = splitSections(page.extract)
  out[title] = {
    title: page.title,
    url: page.fullurl,
    lead: trimParagraphs(lead),
    sections: wanted
      .filter((name) => sections[name] != null)
      .map((name) => ({ title: name, paragraphs: trimParagraphs(sections[name]) }))
      .filter((s) => s.paragraphs.length),
  }
  console.log(`${title}: lead ${out[title].lead.length} ¶, sections ${out[title].sections.map((s) => s.title).join(', ')}`)
  await new Promise((r) => setTimeout(r, 1500))
}

await writeFile(new URL('../src/data/wiki.json', import.meta.url), JSON.stringify(out, null, 2) + '\n')
console.log('Done.')
