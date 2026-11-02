// Refonte des blind tests (lot BT-8) : choisit les 150 bonnes réponses (candidats, réserves, puis découverte par
// l'API), vérifie chaque morceau chez Deezer, choisit les leurres, puis écrit content/quizzes/blind-test/<id>.json,
// content/music-check/<id>.json et .cache/report.json (données du rapport).
// Usage (depuis la racine) : node scripts/blind-tests/generate.mjs [<testId>…]
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { gameTypeDir, quizPath } from '../../content/scripts/quizFiles.mjs'
import { TESTS } from './catalogue.mjs'
import { EXCLUDED_CORRECT, EXCLUDED_DECOYS, LEVEL_EXCEPTIONS, RELEASED_DECOYS } from './exclusions.mjs'
import { deezer, editions, isOriginalTitle, measure, norm } from './deezer.mjs'
import { artistEra, buildPool, firstYear, sameLang, titleLang, trackYear } from './pool.mjs'

const here = new URL('.', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')
const root = join(here, '..', '..')
const TODAY = '2026-11-01'
const LOT = 'BT-8'
// Lot 2 et suivants : lot et date d'ajout propres au test (catalogueLot2.mjs).
const lotOf = (test) => test.lot ?? LOT
// Nouveautés (« i4 » de Jeff Mills, « Mirror signal » d'Andy Stott, sortis 3 jours avant la mesure) : Deezer leur donne
// un rang provisoire de 100 000 et les place haut dans le top de l'artiste ; leur mesure n'a pas de sens. Refusées comme
// bonnes réponses : rang provisoire, ou édition de moins d'un mois dont l'ISRC est de la même année (vraie nouveauté).
// Une réédition récente garde l'ISRC de l'enregistrement d'origine, plus ancien : gardée.
const RECENT_RELEASE_MS = 30 * 24 * 3600 * 1000
const PROVISIONAL_RANK = 100000

// Année d'un ISRC (CC-XXX-AA-NNNNN : AA = année d'attribution) ; null si illisible.
function isrcYear(isrc) {
  const match = /^[A-Z]{2}[A-Z0-9]{3}(\d{2})\d{5}$/.exec(isrc ?? '')
  if (!match) return null
  const short = Number(match[1])
  return short <= 30 ? 2000 + short : 1900 + short
}

function noveltyFailure(m) {
  if (m.trackRank === PROVISIONAL_RANK) return `rang provisoire de ${PROVISIONAL_RANK} (nouveauté)`
  if (!m.releaseDate || Date.now() - Date.parse(m.releaseDate) >= RECENT_RELEASE_MS) return null
  const recorded = isrcYear(m.isrc)
  if (recorded !== null && recorded < Number(m.releaseDate.slice(0, 4))) return null
  return `sortie le ${m.releaseDate}, il y a moins d’un mois, ISRC de ${recorded ?? 'année inconnue'} (nouveauté)`
}
const addedAtOf = (test) => test.addedAt ?? TODAY
// --patch : retouche des tests demandés (voir chooseCorrect et writeTest) au lieu d'une génération complète.
const PATCH = process.argv.includes('--patch')
// --decoys-only (avec --patch) : bonnes réponses gardées telles quelles, jamais remesurées ni remplacées ; seuls les
// leurres de RELEASED_DECOYS (exclusions.mjs) sont remplacés, à la même place.
const DECOYS_ONLY = process.argv.includes('--decoys-only')
// --replace-listed (avec --patch) : seules les bonnes réponses de test.replaceCorrect sont remplacées (réserves du
// catalogue d'abord) ; toutes les autres questions sont gardées telles quelles, leurres compris.
const REPLACE_LISTED = process.argv.includes('--replace-listed')
const ONLY = process.argv.slice(2).filter((arg) => !arg.startsWith('--'))

const SLOTS = {
  easy: Array(10).fill('F'),
  impossible: Array(10).fill('I'),
  mixed: ['F', 'F', 'M', 'M', 'M', 'D', 'D', 'D', 'I', 'I'],
}
const DIFFICULTY = { F: 1, M: 2, D: 3, I: 4 }

// Playlists Deezer de l'époque ou du genre de chaque test (réservoir des remplacements et des leurres).
const PLAYLISTS = {
  'annees-80-facile': ['tubes années 80', '80s hits'],
  'annees-80-mixte': ['tubes années 80', '80s hits', '80s one hit wonders', 'années 80 oubliées'],
  'annees-90-facile': ['tubes années 90', '90s hits'],
  'annees-90-mixte': ['tubes années 90', '90s hits', 'eurodance 90', '90s one hit wonders'],
  'annees-2000-facile': ['tubes années 2000', '2000s hits'],
  'annees-2000-mixte': ['tubes années 2000', '2000s hits', '2000s one hit wonders', '2000s indie pop'],
  'annees-2010-facile': ['tubes années 2010', '2010s hits'],
  'annees-2010-mixte': ['tubes années 2010', '2010s hits', '2010s indie pop', '2010s indie folk'],
  'chanson-francaise-classiques': ['chanson française classique', 'chansons françaises années 60 70', 'les plus grandes chansons françaises', 'chansons françaises incontournables', 'variété française années 60', 'chanson française années 50', 'yéyé', 'chanson française rive gauche', 'grands interprètes chanson française'],
  'chanson-francaise-mixte': ['chanson française années 70', 'variété française années 70 80', 'chanson française années 60'],
  'chanson-francaise-impossible': ['chanson française nouvelle scène', 'chanson française alternative', 'chanson française festive'],
  'chansons-de-fete-facile': ['chansons de fête', 'soirée mariage', 'bal populaire', 'chansons à boire'],
  'rap-francais-facile': ['rap français classiques', 'rap fr hits', 'rap français années 2000'],
  'rap-francais-mixte': ['rap français', 'rap fr pépites', 'rap français années 2000'],
  'rap-francais-impossible': ['rap fr pépites', 'rap français underground', 'nouvelle scène rap fr'],
}

// Écritures acceptées en plus en réponse libre (surnoms, noms courts).
const ARTIST_ALIASES = {
  'Maître Gims': ['Gims'],
  GIMS: ['Maître Gims'],
  '13 Organisé': ['Jul', '13 Organise'],
  'P!nk': ['Pink'],
  'Wham!': ['Wham'],
  'a-ha': ['aha'],
  'Dr. Alban': ['Dr Alban', 'Docteur Alban'],
  'Scatman John': ['Scatman'],
  'Red Hot Chili Peppers': ['Red Hot', 'RHCP'],
  'The Black Eyed Peas': ['Black Eyed Peas', 'BEP'],
  'Édith Piaf': ['Piaf'],
  'Jacques Brel': ['Brel'],
  'Georges Brassens': ['Brassens'],
  'Charles Aznavour': ['Aznavour'],
  'Claude François': ['Cloclo'],
  'Michael Jackson': ['MJ'],
  'Johnny Hallyday': ['Johnny'],
  'Serge Gainsbourg': ['Gainsbourg'],
  'Lilly Wood and The Prick': ['Lilly Wood'],
  '2Pac': ['Tupac'],
  'The Notorious B.I.G.': ['Biggie', 'Notorious BIG'],
  'JAY-Z': ['Jay Z'],
}

// Précisions de titre qui désignent le même enregistrement (retirées du titre affiché).
const SAME_RECORDING = /\s*[([]\s*(feat\.?|ft\.?|with |(\d{4} )?(digital )?remaster|remasteris|album version|single (version|edit)|(original )?radio (edit|version)|original( mix| version)?|7["”] (mix|version)|video edit|mono|stereo|version (mono|st[ée]r[ée]o)|(spanish|english|french|espa[ñn]ol) version|\d{4} version|g[ée]n[ée]rique|bande originale|de ["“]|\S+ vs\.? |(music |theme )?from [^)\]]+)[^)\]]*[)\]]\s*|\s+-\s+((\d{4} )?remaster(ed)?( \d{4})?|single version|radio edit|mono|stereo)\s*$/gi

export function recordingTitle(title) {
  let rest = title
  let previous
  do {
    previous = rest
    rest = rest.replace(SAME_RECORDING, ' ').replace(/\s+/g, ' ').trim()
  } while (rest !== previous)
  return rest
}

// Casse lisible : un titre ou un nom tout en capitales (ou tout en minuscules) de plus de 4 lettres passe en casse
// de phrase (« ADRÉNALINE » → « Adrénaline ») ; les sigles courts restent (« IAM », « PNL »).
function readable(text, isName) {
  const letters = text.replace(/[^\p{L}]/gu, '')
  const allUpper = letters.length > 4 && letters === letters.toUpperCase()
  const allLower = letters.length > 4 && letters === letters.toLowerCase()
  if (!allUpper && !allLower) return text
  const lower = text.toLowerCase()
  if (isName) return lower.replace(/(^|[\s-])(\p{L})/gu, (_, sep, letter) => sep + letter.toUpperCase())
  return lower.charAt(0).toUpperCase() + lower.slice(1)
}

// Titre d'un leurre, sans aucune mention de version, de film ou d'invité entre parenthèses (« (2015 Paisley Park
// Remaster) », « (From the Film "Pretty Woman") », « (en duo avec Gauvain Sers) »).
const VERSION_NOTE = /\s*[([][^)\]]*(remaster|feat|ft\.|radio|single|version|from|with|avec|duo|bonus|extrait|bande originale|soundtrack|mono|stereo|edit|mix|original|live|cut|recorded|reloaded|recording|clean|explicit|dirty|g[ée]n[ée]rique|de ["“]|con [A-ZÁÉÍÓÚ])[^)\]]*[)\]]|\s*[([]\d{4}[)\]]|\s+-\s+.*(remaster|version|edit|mix).*$/gi
const decoyTitle = (title) => title.replace(VERSION_NOTE, '').replace(/\s+(feat\.?|ft\.)\s.*$/i, '').replace(/\s+/g, ' ').trim()

// Textes affichables : lettres latines (les polices des écrans n'ont pas le coréen ni les symboles rares) et rien
// de grossier (mots courants, comparés en mots entiers).
const DISPLAYABLE = /^[\p{Script=Latin}\d\s'’!?.,:;&()\-–+/%"“”«»…$€#°*]+$/u
const COARSE = /\b(fuck\w*|nique|niquer|p[ée]tasses?|bitch\w*|nigga\w*|merde|salopes?|putes?|encul\w*|couilles?|chattes?|connards?|b[aâ]tards?|cul|pussy|horny|(super)?hoes|ass|putain|chier|cons)\b|\*\*/i

function displayable(artist, title) {
  const text = `${artist} ${title}`
  return DISPLAYABLE.test(text) && !COARSE.test(text)
}

const listed = (list, artist, title) =>
  list.some(([a, t]) => norm(a) === norm(artist) && (norm(t) === norm(recordingTitle(title)) || norm(t) === norm(decoyTitle(title))))

// Genre : un blind test de rap ne prend que des morceaux d'albums classés « Rap/Hip Hop » chez Deezer (Tryo,
// Stromae, Tove Lo arrivaient par les playlists).
// Lot 2 : même contrôle pour le rock et l'électro (« Replay – Iyaz » arrivait dans le rock par une playlist).
const GENRE_NAMES = { rap: /rap|hip ?hop/i, rock: /rock|metal|alternative|blues/i, electro: /electro|dance|house|techno/i }
// lang : langue de la question ; une langue autre que celle du test (rock français dans les hymnes anglais) n'est pas
// contrôlée : Deezer range Bashung ou Louise Attaque en « Variété » ou « Pop ».
async function inGenre(test, trackId, lang = test.lang) {
  // deezerGenre : genre Deezer propre au test (lot 3 : RnB, reggae, jazz, classique… rangés en « pop » dans le contenu).
  const wanted = test.deezerGenre ?? GENRE_NAMES[test.genre]
  if (!wanted || (test.genre !== 'rap' && lang !== test.lang)) return true
  const { album } = await trackYear(trackId)
  return (album?.genres?.data ?? []).some((genre) => wanted.test(genre.name))
}

// Écart d'époque toléré entre une bonne réponse et ses leurres dans un test « toutes époques » (années de première
// sortie).
const ALL_ERA_GAP = { chanson: 15, rap: 8 }
// Classiques de la chanson française (de Piaf à Renaud) : leurres sortis avant 1986.
const TEST_MAX_YEAR = { 'chanson-francaise-classiques': 1985 }
// Classiques de la chanson : trop peu de « Facile » mesurés (les artistes anciens ont peu de fans Deezer) ; leurres
// « Difficile » acceptés s'ils sont le 1er ou le 2e titre de leur artiste (son tube : « Tombe la neige », « Toulouse »).
const SIGNATURE_HIT_DECOYS = new Set(['chanson-francaise-classiques', 'chansons-de-fete-facile', 'annees-60-facile'])
// Tests à thème (levelExempt, décision du 2 novembre 2026) : leurres choisis à la main dans le thème (decoyList), sans
// condition de niveau : la mesure Deezer juge l'interprète d'un générique ou d'une version française, pas l'œuvre.
// decoyLevels : niveaux de leurres acceptés en plus pour un niveau visé, propres à un test (« Rock français » : leurres
// « Facile » pour les questions « Moyen », les titres « Moyen » de rock français étant ceux des groupes déjà en bonnes réponses).
const decoyLevelFits = (test, entry, target) => (test.levelExempt && entry.source === 'liste manuelle') || entry.level === target || (test.decoyLevels?.[target] ?? []).includes(entry.level) || (SIGNATURE_HIT_DECOYS.has(test.id) && target === 'F' && entry.level === 'D' && entry.position <= 2)

// Artistes d'un test : au plus maxPerArtist propositions par artiste (1 par défaut ; 2 pour les génériques, où un même
// chanteur a souvent interprété plusieurs génériques cultes). has() : plafond atteint.
class ArtistCount {
  constructor(cap = 1) {
    this.cap = cap
    this.counts = new Map()
  }
  add(key) {
    this.counts.set(key, (this.counts.get(key) ?? 0) + 1)
  }
  has(key) {
    return (this.counts.get(key) ?? 0) >= this.cap
  }
}

const keyOf = (artist, title) => `${norm(artist)}|${norm(recordingTitle(title))}`

// Hasard reproductible (positions de la bonne réponse).
function seeded(seed) {
  let h = 2166136261
  for (const char of seed) h = Math.imul(h ^ char.charCodeAt(0), 16777619)
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    return ((h ^= h >>> 16) >>> 0) / 4294967296
  }
}

function shuffled(items, random) {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

// era : années propres au test (« Variété française des années 80-90 », rap US de 1988 à 2018).
const windowOf = (test) => test.era ?? (test.decade === 'all' ? null : [test.decade, test.decade + 9])

// Morceau de la bonne époque : année de sortie dans la décennie, ou réédition plus tardive d'un artiste apparu à
// cette époque (un titre des années 80 vendu sur une compilation de 2009).
// maxCareerYears : un artiste dont le premier disque est plus ancien que la décennie de plus de ce nombre d'années est
// refusé (« Me And Bobby McGee », 1970, daté 2010 par une réédition).
async function inEra(test, trackId, artistId, artist, title, maxCareerYears = 25) {
  const window = windowOf(test)
  if (!window) return true
  const era = await artistEra(artistId)
  if (era !== null && era < window[0] - maxCareerYears) return false
  const year = await firstYear(artist, title, trackId)
  if (year !== null) return year >= window[0] && year <= window[1]
  return era !== null && era >= window[0] - 6 && era <= window[1]
}

// Langue chantée attendue d'une bonne réponse du catalogue, ou du test.
const langOf = (test, row) => row?.[3] ?? test.lang

// impossibleArtists : bonnes réponses des tests « Impossible » (jamais bonnes réponses ailleurs, règle du build) ;
// namedArtists : artistes proposés dans les autres tests (jamais pris par la découverte d'un test « Impossible »).
const used = { correctKeys: new Set(), impossibleArtists: new Set(), allTracks: new Set(), frozenDecoys: new Set(), frozenTestDecoys: new Set(), testCorrectTitles: new Set(), correctArtists: new Set(), correctTitles: new Set() }
const namedArtists = new Set(TESTS.filter((t) => t.level !== 'impossible').flatMap((t) => [...t.candidates, ...t.reserves].map((row) => norm(row[1]))))
const report = {}

function acceptable(test, m, target, testArtists, origin = 'catalogue') {
  if (!m.found) return 'introuvable chez Deezer (enregistrement studio original avec extrait, ni remix ni version refaite)'
  if (!m.preview) return 'pas d’extrait'
  const novelty = noveltyFailure(m)
  if (novelty) return novelty
  if (listed(EXCLUDED_CORRECT, m.deezerArtist, m.deezerTitle) || listed(test.excludedCorrect ?? [], m.deezerArtist, m.deezerTitle)) return 'exclu à la relecture'
  // Artistes exclus d'un test (hors thème, homonymes) : ni leurres ni bonnes réponses.
  if ((test.excludedDecoyArtists ?? []).some((name) => norm(name) === norm(m.deezerArtist))) return 'artiste exclu de ce test'
  if (!displayable(m.deezerArtist, recordingTitle(m.deezerTitle))) return 'caractères absents des polices ou titre grossier'
  if (m.explicit && test.genre !== 'rap') return 'paroles explicites (refusées hors rap)'
  // Tests à thème : exception de niveau pour les titres du catalogue (candidats et réserves choisis à la main).
  const exempt = test.levelExempt && (origin === 'catalogue' || origin === 'gardé')
  if (m.level !== target && !exempt && !listed(LEVEL_EXCEPTIONS[test.id] ?? [], m.deezerArtist, m.deezerTitle)) return `niveau mesuré ${m.level ?? 'non classé'} (fans ${m.nbFan}, position ${m.position}, rang ${m.rank})`
  if (used.correctKeys.has(keyOf(m.deezerArtist, m.deezerTitle))) return 'morceau déjà bonne réponse d’un autre test'
  // Même titre, tous artistes confondus, déjà bonne réponse ailleurs : reprise possible (« Play That Funky Music » de
  // Vanilla Ice et de Wild Cherry).
  if (used.correctTitles.has(norm(recordingTitle(m.deezerTitle)))) return 'titre déjà bonne réponse d’un autre test (autre artiste : reprise possible)'
  // strictHard : « Difficile » = titre 1 ou 2 de l'artiste (définition de la demande), sans l'équivalence par le rang.
  if (test.strictHard && target === 'D' && m.position > 2) return `position ${m.position} : pas le titre 1 ou 2 de l’artiste`
  // Règle du build : une mauvaise proposition n'est jamais la bonne réponse d'un autre blind test.
  if (used.frozenDecoys.has(keyOf(m.deezerArtist, m.deezerTitle))) return 'morceau déjà leurre d’un test existant'
  if (testArtists.has(norm(m.deezerArtist))) return 'artiste déjà présent dans ce test'
  // Même morceau sous un autre nom d'artiste (« Take Five » de The Dave Brubeck Quartet et de Dave Brubeck).
  if (used.testCorrectTitles.has(norm(recordingTitle(m.deezerTitle)))) return 'titre déjà bonne réponse dans ce test'
  if (used.impossibleArtists.has(norm(m.deezerArtist))) return 'artiste déjà bonne réponse d’un test « Impossible »'
  if (test.level === 'impossible' && used.correctArtists.has(norm(m.deezerArtist))) return 'artiste déjà bonne réponse d’un autre blind test (règle du build)'
  if (test.level === 'impossible' && origin !== 'catalogue' && namedArtists.has(norm(m.deezerArtist))) return 'artiste proposé dans un autre test'
  return null
}

// Artiste de départ (lot 4, tous niveaux depuis « Rock français ») : premier titre de son top 50 Deezer dans la zone du
// niveau visé (Facile : top 5 ; Moyen et Impossible : position 6 ou plus ; Difficile : son titre 1 ou 2), qui passe le
// test (niveau mesuré, extrait, règles du lot) ; rien si l'artiste est introuvable ou si aucun titre ne passe.
const PICK_ZONE = { F: [0, 5], M: [5, 50], D: [0, 2], I: [5, 50] }

async function pickFromArtist(test, name, target, testArtists, slot, rejected) {
  const search = await deezer(`/search/artist?q=${encodeURIComponent(name)}&limit=5`)
  // Homonymes (« Lunatic », 39 fans, pour le duo de Booba) : le plus suivi d'abord.
  const artist = (search.data ?? []).filter((a) => norm(a.name) === norm(name)).sort((a, b) => b.nb_fan - a.nb_fan)[0]
  if (!artist) {
    rejected.push({ slot, target, artist: name, title: '(titre à choisir)', reason: 'artiste de départ introuvable chez Deezer' })
    return null
  }
  const top = (await deezer(`/artist/${artist.id}/top?limit=50`)).data ?? []
  const seen = new Set()
  let lastFailure = null
  // Titres de l'artiste lui-même : son top contient aussi des morceaux crédités à d'autres (« Kyo Itachi » chez X-Men).
  for (const track of top.slice(...PICK_ZONE[target])) {
    if (track.artist.id !== artist.id || !isOriginalTitle(track.title) || seen.has(norm(track.title))) continue
    seen.add(norm(track.title))
    const m = await measureWithLevel(track.artist.name, track.title)
    const failure = acceptable(test, m, target, testArtists)
    if (!failure) return m
    lastFailure = failure
  }
  rejected.push({ slot, target, artist: name, title: '(titre à choisir)', reason: `artiste de départ : aucun titre de sa zone (positions ${PICK_ZONE[target][0] + 1} à ${PICK_ZONE[target][1]}) ne passe (${artist.nb_fan ?? '?'} fans ; dernier refus : ${lastFailure ?? 'aucun titre'})` })
  return null
}

async function measureWithLevel(artist, title) {
  const m = await measure(artist, title)
  if (!m.found) return m
  const { measuredLevel } = await import('./levels.mjs')
  return { ...m, level: measuredLevel(m) }
}

// Mesure d'un morceau du réservoir, au même format que measure().
async function measurePoolEntry(entry) {
  const all = await editions(entry.artist, entry.title)
  const track = all.find((t) => !t.explicit_lyrics) ?? all[0]
  if (!track) return { found: false }
  return measureWithLevel(track.artist.name, track.title)
}

// existing : en retouche, le test tel qu'il est ; une question dont la bonne réponse reste valable (même niveau mesuré,
// mêmes règles) est gardée ; seules les autres sont remplacées, comme un candidat refusé.
async function chooseCorrect(test, pool, existing = null) {
  const slots = SLOTS[test.level]
  const chosen = []
  const replacements = []
  const rejected = []
  const testArtists = new ArtistCount(test.maxPerArtist)
  const reserves = [...test.reserves]
  used.testCorrectTitles = new Set()
  // Artistes proposés dans ce test (candidats, réserves) : jamais pris par la découverte, ils ont leur place plus loin.
  const namedInTest = new Set([...test.candidates, ...test.reserves].map((row) => norm(row[1])))
  const take = (m, target, origin, lang) => {
    chosen.push({ ...m, target, origin, lang })
    testArtists.add(norm(m.deezerArtist))
    used.correctKeys.add(keyOf(m.deezerArtist, m.deezerTitle))
    used.testCorrectTitles.add(norm(recordingTitle(m.deezerTitle)))
    used.correctTitles.add(norm(recordingTitle(m.deezerTitle)))
  }
  // Retouche : bonnes réponses déjà en place (gardées plus loin) jamais reprises par la découverte d'une autre place.
  const existingKeys = new Set((existing?.questions ?? []).map((question) => keyOf(question.music.artist, question.music.title)))
  const existingArtists = new Set((existing?.questions ?? []).map((question) => norm(question.music.artist)))
  // Retouche : les artistes des leurres déjà en place ne deviennent pas bonnes réponses (un artiste par test).
  for (const question of existing?.questions ?? []) {
    question.options.forEach((option, index) => {
      if (index !== question.correctIndex) testArtists.add(norm(option.slice(option.lastIndexOf(' – ') + 3)))
    })
  }
  for (let index = 0; index < slots.length; index++) {
    const target = slots[index]
    const row = test.candidates[index]
    const kept = existing?.questions[index]
    let previous = row ? (row[2] ? `${row[1]} – ${row[2]}` : `${row[1]} (artiste de départ)`) : null
    if (kept) {
      previous = kept.options[kept.correctIndex]
      const m = await measureWithLevel(kept.music.artist, kept.music.title)
      const failure = !m.found ? 'introuvable chez Deezer' : REPLACE_LISTED
        ? (listed(test.replaceCorrect ?? [], kept.music.artist, kept.music.title) ? 'retiré à la relecture (hors thème)' : null)
        : DECOYS_ONLY ? null : acceptable(test, m, target, testArtists)
      if (!failure) {
        take(m, target, 'gardé', row && row[0] === target ? langOf(test, row) : test.lang)
        chosen.at(-1).keep = kept
        continue
      }
      rejected.push({ slot: index + 1, target, artist: kept.music.artist, title: kept.music.title, reason: failure, measures: m })
    } else if (row && row[0] === target) {
      if (row[2]) {
        const m = await measureWithLevel(row[1], row[2])
        const failure = acceptable(test, m, target, testArtists)
        if (!failure) {
          take(m, target, 'candidat', langOf(test, row))
          continue
        }
        rejected.push({ slot: index + 1, target, artist: row[1], title: row[2], reason: failure, measures: m })
      }
      if (!row[2] || target === 'I') {
        const picked = await pickFromArtist(test, row[1], target, testArtists, index + 1, rejected)
        if (picked) {
          take(picked, target, 'artiste de départ', langOf(test, row))
          if (row[2]) replacements.push({ slot: index + 1, replaced: previous, by: `${picked.deezerArtist} – ${picked.deezerTitle}`, origin: 'artiste de départ, autre titre' })
          continue
        }
      }
    }
    let done = false
    // Réserve d'un artiste proposé plus loin dans le test : jamais prise ici (elle bloquerait son candidat).
    const laterArtists = new Set(test.candidates.slice(index + 1).map((r) => norm(r[1])))
    const fits = (r) => r[0] === target && !laterArtists.has(norm(r[1]))
    while (!done && reserves.some(fits)) {
      const reserve = reserves.splice(reserves.findIndex(fits), 1)[0]
      // Réserve sans titre (artiste seulement) : titre choisi chez l'artiste.
      if (!reserve[2]) {
        const picked = await pickFromArtist(test, reserve[1], target, testArtists, index + 1, rejected)
        if (!picked) continue
        take(picked, target, 'réserve (artiste)', langOf(test, reserve))
        if (previous) replacements.push({ slot: index + 1, replaced: previous, by: `${picked.deezerArtist} – ${picked.deezerTitle}`, origin: 'réserve (artiste)' })
        done = true
        continue
      }
      const m = await measureWithLevel(reserve[1], reserve[2])
      const failure = acceptable(test, m, target, testArtists)
      if (failure) {
        rejected.push({ slot: index + 1, target, artist: reserve[1], title: reserve[2], reason: `réserve : ${failure}`, measures: m })
        continue
      }
      take(m, target, 'réserve', langOf(test, reserve))
      if (previous) replacements.push({ slot: index + 1, replaced: previous, by: `${m.deezerArtist} – ${m.deezerTitle}`, origin: 'réserve' })
      done = true
    }
    if (done || test.noDiscovery) {
      if (!done) chosen.push({ found: false, target, origin: 'aucun remplaçant trouvé' })
      continue
    }
    // Découverte : morceaux du réservoir à ce niveau, dans la langue et l'époque du test (playlists d'abord).
    const lang = row ? langOf(test, row) : test.lang
    const candidates = pool
      .filter((e) => e.level === target && e.preview && (!e.explicit || test.genre === 'rap') && decoyLang(e.title, lang) && !testArtists.has(norm(e.artist)) && !namedInTest.has(norm(e.artist)) && !used.correctKeys.has(keyOf(e.artist, e.title)) && !existingKeys.has(keyOf(e.artist, e.title)) && !existingArtists.has(norm(e.artist)))
      .sort((a, b) => (a.source.startsWith('playlist') ? 0 : 1) - (b.source.startsWith('playlist') ? 0 : 1) || b.rank - a.rank)
    for (const entry of candidates) {
      if (!displayable(entry.artist, entry.title) || listed(EXCLUDED_CORRECT, entry.artist, entry.title)) continue
      if (!(await inEra(test, entry.trackId, entry.artistId, entry.artist, entry.title, 15))) continue
      if (!(await inGenre(test, entry.trackId, lang))) continue
      const m = await measurePoolEntry(entry)
      if (acceptable(test, m, target, testArtists, 'découverte')) continue
      take(m, target, `découverte (${entry.source})`, lang)
      replacements.push({ slot: index + 1, replaced: previous, by: `${m.deezerArtist} – ${m.deezerTitle}`, origin: `découverte, ${entry.source}` })
      done = true
      break
    }
    if (!done) chosen.push({ found: false, target, origin: 'aucun remplaçant trouvé' })
  }
  if (test.level === 'impossible') for (const c of chosen.filter((c) => c.found)) used.impossibleArtists.add(norm(c.deezerArtist))
  return { chosen, replacements, rejected }
}

// Langue d'un leurre : un titre visiblement dans la langue de la question (français, espagnol), ou pour l'anglais
// et les autres langues, un titre qui n'est visiblement ni français ni espagnol.
function decoyLang(title, lang) {
  // 'any' : titres d'œuvres classiques, en plusieurs langues selon l'enregistrement.
  if (lang === 'any') return true
  const guess = titleLang(title)
  if (lang === 'fr' || lang === 'es') return guess === lang
  if (lang === 'de') return guess === 'de' || guess === null
  return guess !== 'fr' && guess !== 'es' && guess !== 'de'
}

// Leurres d'une question : même niveau, même langue, même époque, artistes et titres jamais vus dans le test.
// near : { year, gap } : leurre sorti à gap années au plus de year (remplacement d'un leurre rendu, même époque).
async function chooseDecoys(test, pool, correct, testArtists, testTitles, count = 3, near = null) {
  const relatedIds = new Set(((await deezer(`/artist/${correct.artistId}/related?limit=25`)).data ?? []).map((a) => a.id))
  const correctYear = !windowOf(test) ? await firstYear(correct.deezerArtist, correct.deezerTitle, correct.trackId) : null
  const candidates = pool
    .filter((e) => decoyLevelFits(test, e, correct.target) && (e.lang ? e.lang === correct.lang : decoyLang(e.title, correct.lang)) && isOriginalTitle(e.title))
    .filter((e) => displayable(e.artist, decoyTitle(e.title)) && !listed(EXCLUDED_DECOYS, e.artist, e.title) && !listed(test.excludedDecoys ?? [], e.artist, e.title) && !(test.excludedDecoyArtists ?? []).some((name) => norm(name) === norm(e.artist)) && (!e.explicit || test.genre === 'rap'))
    .filter((e) => !testArtists.has(norm(e.artist)) && !testTitles.has(norm(recordingTitle(e.title))) && !used.correctKeys.has(keyOf(e.artist, e.title)) && !used.frozenTestDecoys.has(keyOf(e.artist, e.title)))
    .sort((a, b) => (relatedIds.has(a.artistId) ? 0 : 1) - (relatedIds.has(b.artistId) ? 0 : 1) || (used.allTracks.has(keyOf(a.artist, a.title)) ? 1 : 0) - (used.allTracks.has(keyOf(b.artist, b.title)) ? 1 : 0) || Math.abs(Math.log(a.rank + 1) - Math.log(correct.rank + 1)) - Math.abs(Math.log(b.rank + 1) - Math.log(correct.rank + 1)))
  const decoys = []
  for (const entry of candidates) {
    if (decoys.length === count) break
    if (decoys.some((d) => norm(d.artist) === norm(entry.artist))) continue
    if (near?.year) {
      const year = await firstYear(entry.artist, entry.title, entry.trackId)
      if (year === null || Math.abs(year - near.year) > near.gap) continue
    }
    // Liste manuelle (chansons de fête, toutes époques par nature) : pas de contrôle d'époque.
    if (entry.source === 'liste manuelle') {
      // rien
    } else if (!windowOf(test)) {
      const year = await firstYear(entry.artist, entry.title, entry.trackId)
      const maxYear = TEST_MAX_YEAR[test.id]
      if (maxYear !== undefined ? year === null || year > maxYear : correctYear !== null && year !== null && Math.abs(year - correctYear) > (test.eraGap ?? ALL_ERA_GAP[test.genre] ?? 15)) continue
    } else if (!(await inEra(test, entry.trackId, entry.artistId, entry.artist, entry.title))) continue
    if (!(await inGenre(test, entry.trackId, correct.lang))) continue
    decoys.push(entry)
  }
  return decoys
}

async function foundTrack(m) {
  const { track, album } = await trackYear(m.trackId)
  return {
    id: String(m.trackId),
    title: track.title,
    artist: track.artist.name,
    album: album?.title ?? track.album?.title ?? '',
    durationS: track.duration,
    previewAvailable: Boolean(track.preview),
    link: track.link,
    explicit: Boolean(track.explicit_lyrics),
    rank: track.rank,
  }
}

const option = (title, artist) => `${title} – ${artist}`

// Retouche d'une question gardée : propositions, ordre et morceau vérifié inchangés ; dans une question « Impossible »,
// un leurre qui n'est plus « Impossible » à la mesure (plafond de fans) est remplacé à la même place.
async function keepQuestion(test, pool, correct, testArtists, testTitles, questions, checks, existingCheck) {
  const kept = correct.keep
  const options = [...kept.options]
  const decoyReport = []
  for (const [index, text] of kept.options.entries()) {
    if (index === kept.correctIndex) continue
    const at = text.lastIndexOf(' – ')
    const m = await measureWithLevel(text.slice(at + 3), text.slice(0, at))
    const released = listed(RELEASED_DECOYS, text.slice(at + 3), text.slice(0, at))
    const fits = REPLACE_LISTED || !released && (!m.found || correct.target !== 'I' || decoyLevelFits(test, { level: m.level, position: m.position }, correct.target))
    if (fits) {
      decoyReport.push({ artist: text.slice(at + 3), title: text.slice(0, at), level: m.level, nbFan: m.nbFan, position: m.position, rank: m.rank, source: 'gardé' })
      continue
    }
    const near = released && m.found ? { year: await firstYear(m.deezerArtist, m.deezerTitle, m.trackId), gap: 8 } : null
    const [replacement] = await chooseDecoys(test, pool, correct, testArtists, testTitles, 1, near)
    if (!replacement) throw new Error(`${kept.id} : aucun leurre pour remplacer « ${text} »`)
    testArtists.add(norm(replacement.artist))
    testTitles.add(norm(recordingTitle(replacement.title)))
    options[index] = option(readable(decoyTitle(replacement.title), false), readable(replacement.artist.trim(), true))
    console.log(`  ${kept.id} : leurre « ${text} » (${released ? 'rendu à un autre test' : `${m.nbFan} fans, mesuré ${m.level ?? 'non classé'}`}) → « ${options[index]} »`)
    decoyReport.push({ artist: replacement.artist, title: recordingTitle(replacement.title), level: replacement.level, nbFan: replacement.nbFan, position: replacement.position, rank: replacement.rank, source: replacement.source, replaced: text })
  }
  questions.push({ ...kept, options })
  // Morceau vérifié : même piste qu'à la génération (mesure en cache), recochée ensuite par npm run music:verify.
  checks.push({ questionId: kept.id, query: { artist: kept.music.artist, title: kept.music.title }, found: await foundTrack(correct), alternatives: [], verified: false })
  const shown = kept.options[kept.correctIndex]
  const at = shown.lastIndexOf(' – ')
  report[test.id].questions.push({ id: kept.id, target: correct.target, artist: shown.slice(at + 3), title: shown.slice(0, at), nbFan: correct.nbFan, position: correct.position, topPosition: correct.topPosition, rankPosition: correct.rankPosition, rank: correct.rank, preview: correct.preview, explicit: correct.explicit, origin: 'gardé', decoys: decoyReport })
}

async function buildTest(test) {
  console.log(`\n=== ${test.id}`)
  const seedIds = []
  for (const name of [...test.candidates.map((c) => c[1]), ...(test.seeds ?? [])]) {
    const search = await deezer(`/search/artist?q=${encodeURIComponent(name)}&limit=5`)
    const artist = (search.data ?? []).find((a) => norm(a.name) === norm(name))
    if (artist) seedIds.push(artist.id)
  }
  const fullPool = await buildPool({ playlistQueries: PLAYLISTS[test.id] ?? test.playlists, seedArtistIds: seedIds, includeSeeds: Boolean(test.seedTracks) })
  const pool = test.themed ? fullPool.filter((entry) => entry.source.startsWith('playlist')) : fullPool
  console.log(`réservoir : ${pool.length} morceaux (${['F', 'M', 'D', 'I'].map((l) => `${l} ${pool.filter((e) => e.level === l).length}`).join(', ')})`)
  const existingPath = quizPath(test.id)
  const existing = PATCH && existingPath ? JSON.parse(readFileSync(existingPath, 'utf8')) : null
  const existingCheck = existing ? JSON.parse(readFileSync(join(root, 'content/music-check', `${test.id}.json`), 'utf8')) : null
  const { chosen, replacements, rejected } = await chooseCorrect(test, pool, existing)
  // Leurres choisis à la main (decoyList du catalogue) : mesurés, puis seule source de leurres du test.
  let decoyPool = null
  if (test.decoyList) {
    decoyPool = []
    for (const [artist, title, lang] of test.decoyList) {
      const m = await measureWithLevel(artist, title)
      if (!m.found) {
        console.log(`✗ leurre de la liste introuvable : ${artist} – ${title}`)
        continue
      }
      decoyPool.push({ artistId: m.artistId, artist: m.deezerArtist, title: m.deezerTitle, trackId: m.trackId, rank: m.rank, nbFan: m.nbFan, position: m.position, level: m.level, preview: m.preview, explicit: m.explicit, source: 'liste manuelle', lang })
    }
  }
  report[test.id] = { chosen, replacements, rejected, questions: [] }
  if (chosen.some((c) => !c.found)) {
    console.log(`✗ ${test.id} : ${chosen.filter((c) => !c.found).length} place(s) sans morceau`)
    return { test, chosen, pool, decoyPool, existingCheck, existing }
  }
  return { test, chosen, pool, decoyPool, existingCheck, existing }
}

async function writeTest({ test, chosen, pool, decoyPool, existingCheck, existing }) {
  if (chosen.some((c) => !c.found)) return
  const testArtists = new ArtistCount(test.maxPerArtist)
  for (const c of chosen) testArtists.add(norm(c.deezerArtist))
  const testTitles = new Set(chosen.map((c) => norm(recordingTitle(c.deezerTitle))))
  // Retouche : les leurres des questions gardées restent dans le test (ni artiste ni titre repris ailleurs).
  for (const correct of chosen.filter((c) => c.keep)) {
    correct.keep.options.forEach((option, index) => {
      if (index === correct.keep.correctIndex) return
      const at = option.lastIndexOf(' – ')
      testArtists.add(norm(option.slice(at + 3)))
      testTitles.add(norm(option.slice(0, at)))
    })
  }
  const random = seeded(test.id)
  const positions = shuffled([0, 1, 2, 3, 0, 1, 2, 3, ...shuffled([0, 1, 2, 3], random).slice(0, 2)], random)
  const questions = []
  const checks = []
  for (const [index, correct] of chosen.entries()) {
    const id = `${test.prefix}-${String(index + 1).padStart(2, '0')}`
    if (correct.keep) {
      await keepQuestion(test, decoyPool ?? pool, correct, testArtists, testTitles, questions, checks, existingCheck)
      continue
    }
    const decoys = await chooseDecoys(test, decoyPool ?? pool, correct, testArtists, testTitles)
    for (const d of decoys) {
      testArtists.add(norm(d.artist))
      testTitles.add(norm(recordingTitle(d.title)))
      used.allTracks.add(keyOf(d.artist, d.title))
      used.frozenDecoys.add(keyOf(d.artist, d.title))
    }
    const title = recordingTitle(correct.deezerTitle)
    const artist = correct.deezerArtist
    // Titre et artiste du catalogue (candidat, réserve) : leur orthographe si Deezer écrit la même chose autrement
    // (« Ça plane pour moi » pour « Ca Plane Pour Moi ») ; sinon celle de Deezer, en casse lisible.
    const fromCatalogue = correct.origin === 'candidat' || correct.origin === 'réserve'
    const catalogueTitle = test.displayTitles?.[correct.title] ?? recordingTitle(correct.title)
    const displayTitle = fromCatalogue && norm(correct.title) === norm(title) ? catalogueTitle : readable(title, false)
    const displayArtist = fromCatalogue && norm(correct.artist) === norm(artist) ? correct.artist : readable(artist, true)
    const ask = index % 2 === 0 ? 'title' : 'artist'
    const others = decoys.map((d) => option(readable(decoyTitle(d.title), false), readable(d.artist.trim(), true)))
    const correctIndex = positions[index]
    const options = [...others]
    options.splice(correctIndex, 0, option(displayTitle, displayArtist))
    const music = { artist, title }
    if (displayTitle !== title) music.displayTitle = displayTitle
    if (displayArtist !== artist) music.displayArtist = displayArtist
    const aliases = ARTIST_ALIASES[artist] ?? ARTIST_ALIASES[displayArtist]
    const own = Object.entries(test.aliases ?? {}).find(([key]) => norm(key) === norm(displayTitle))?.[1]
    const artistAliases = [...(aliases ?? []), ...(own?.artist ?? [])]
    if (artistAliases.length) music.artistAliases = artistAliases
    if (own?.title?.length) music.titleAliases = own.title
    questions.push({
      id,
      text: ask === 'title' ? 'Quel est ce titre ?' : 'Quel artiste ?',
      ask,
      options,
      correctIndex,
      acceptedAnswers: [ask === 'title' ? displayTitle : displayArtist],
      difficulty: DIFFICULTY[correct.target],
      music,
    })
    checks.push({ questionId: id, query: { artist, title }, found: await foundTrack(correct), alternatives: [], verified: false })
    report[test.id].questions.push({ id, target: correct.target, artist: displayArtist, title: displayTitle, nbFan: correct.nbFan, position: correct.position, topPosition: correct.topPosition, rankPosition: correct.rankPosition, rank: correct.rank, preview: correct.preview, explicit: correct.explicit, origin: correct.origin, decoys: decoys.map((d) => ({ artist: d.artist, title: recordingTitle(d.title), level: d.level, nbFan: d.nbFan, position: d.position, rank: d.rank, source: d.source })) })
    if (decoys.length < 3) console.log(`✗ ${id} : ${decoys.length} leurre(s) seulement`)
  }
  // Test incomplet (leurres manquants) : jamais écrit, le build refuserait tout le contenu.
  if (questions.some((question) => question.options.length < 4)) {
    report[test.id].incomplete = true
    for (const file of [quizPath(test.id) ?? '', join(root, 'content/music-check', `${test.id}.json`), join(root, 'content/music-check', `${test.id}.md`)]) {
      if (existsSync(file)) unlinkSync(file)
    }
    console.log(`✗ ${test.id} non écrit : leurres manquants`)
    return
  }
  const quiz = {
    id: test.id,
    gameType: 'blindTest',
    title: test.title,
    theme: 'Musique',
    description: test.description,
    audience: test.level === 'impossible' ? 'experts' : 'all',
    poster: test.poster,
    icon: test.icon,
    genre: test.genre,
    decade: test.decade,
    level: test.level,
    addedAt: existing?.addedAt ?? addedAtOf(test),
    ...(test.featuredRank && { featuredRank: test.featuredRank }),
    reviewStatus: existing?.reviewStatus ?? `provisoire, morceaux vérifiés automatiquement (lot ${lotOf(test)})`,
    questions,
  }
  // Fichier existant réécrit à sa place ; nouveau blind test : content/quizzes/blind-test/.
  mkdirSync(gameTypeDir('blindTest'), { recursive: true })
  writeFileSync(quizPath(test.id) ?? join(gameTypeDir('blindTest'), `${test.id}.json`),`${JSON.stringify(quiz, null, 2)}\n`)
  writeFileSync(join(root, 'content/music-check', `${test.id}.json`), `${JSON.stringify({ quizId: test.id, source: 'deezer', lookedUpAt: TODAY, tracks: checks }, null, 2)}\n`)
  const md = [`# ${test.title} (${test.id})`, '', '| Question | Morceau | Piste Deezer | Extrait |', '|---|---|---|---|', ...checks.map((c) => `| ${c.questionId} | ${c.query.artist} – ${c.query.title} | [${c.found.title}](${c.found.link}) | ${c.found.previewAvailable ? 'oui' : 'non'} |`)]
  writeFileSync(join(root, 'content/music-check', `${test.id}.md`), `${md.join('\n')}\n`)
  console.log(`✓ ${test.id} écrit`)
}

// Blind test figé (content/frozen-blind-tests.json, freeze.mjs) : jamais reconstruit ni réécrit ; ses bonnes réponses et
// ses leurres sont seulement relus, pour qu'aucun autre test ne les reprenne.
const frozenPath = join(root, 'content/frozen-blind-tests.json')
const FROZEN = new Set(existsSync(frozenPath) ? Object.keys(JSON.parse(readFileSync(frozenPath, 'utf8')).hashes) : [])

function registerFrozen(test) {
  const quiz = JSON.parse(readFileSync(quizPath(test.id), 'utf8'))
  for (const question of quiz.questions) {
    used.correctKeys.add(keyOf(question.music.artist, question.music.title))
    used.correctArtists.add(norm(question.music.artist))
    used.correctTitles.add(norm(recordingTitle(question.music.title)))
    if (quiz.level === 'impossible') used.impossibleArtists.add(norm(question.music.artist))
    question.options.forEach((option, index) => {
      const at = option.lastIndexOf(' – ')
      if (index !== question.correctIndex) {
        used.allTracks.add(keyOf(option.slice(at + 3), option.slice(0, at)))
        used.frozenDecoys.add(keyOf(option.slice(at + 3), option.slice(0, at)))
        // Lot 3 : les leurres des tests figés ne sont jamais repris comme leurres ailleurs.
        if (FROZEN.has(test.id)) used.frozenTestDecoys.add(keyOf(option.slice(at + 3), option.slice(0, at)))
      }
    })
  }
}

// Leurres rendus : jamais repris comme leurres de remplacement (ils deviennent bonnes réponses ailleurs).
if (DECOYS_ONLY) for (const [artist, title] of RELEASED_DECOYS) used.correctKeys.add(keyOf(artist, title))
mkdirSync(join(here, '.cache'), { recursive: true })
const reportPath = join(here, '.cache', 'report.json')
Object.assign(report, existsSync(reportPath) ? JSON.parse(readFileSync(reportPath, 'utf8')) : {})
const tests = TESTS.filter((t) => !FROZEN.has(t.id) && (ONLY.length === 0 || ONLY.includes(t.id)))
// Tests existants qu'on ne regénère pas (figés, ou hors de la liste demandée) : relus comme les figés.
for (const test of TESTS.filter((t) => !tests.includes(t) && quizPath(t.id))) registerFrozen(test)
console.log(`Figés (relus, jamais réécrits) : ${FROZEN.size} ; à générer : ${tests.map((t) => t.id).join(', ') || 'aucun'}`)
// Les « Impossible » d'abord : leurs artistes ne doivent pas être bonnes réponses ailleurs dans la refonte.
const ordered = [...tests.filter((t) => t.level === 'impossible'), ...tests.filter((t) => t.level !== 'impossible')]
for (const test of ordered) {
  await writeTest(await buildTest(test))
  writeFileSync(reportPath, JSON.stringify(report, null, 2))
}
console.log('\nRapport : scripts/blind-tests/.cache/report.json')
