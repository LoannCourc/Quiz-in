// Client de l'API publique Deezer pour la refonte des blind tests : cache disque (scripts/blind-tests/.cache/,
// ignoré par Git) et 40 requêtes au plus par 5 s (limite Deezer : 50).
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { join } from 'node:path'

const here = new URL('.', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')
const cacheDir = join(here, '.cache')
mkdirSync(cacheDir, { recursive: true })

const WINDOW_MS = 5000
const MAX_PER_WINDOW = 40
const sent = []
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function throttle() {
  for (;;) {
    const now = Date.now()
    while (sent.length && now - sent[0] > WINDOW_MS) sent.shift()
    if (sent.length < MAX_PER_WINDOW) return void sent.push(now)
    await sleep(WINDOW_MS - (now - sent[0]) + 20)
  }
}

export async function deezer(path) {
  const file = join(cacheDir, `${createHash('sha1').update(path).digest('hex')}.json`)
  if (existsSync(file)) return JSON.parse(readFileSync(file, 'utf8'))
  for (let attempt = 0; attempt < 5; attempt++) {
    await throttle()
    const response = await fetch(`https://api.deezer.com${path}`)
    const data = await response.json()
    // Quota dépassé (code 4) : attendre et recommencer.
    if (data?.error?.code === 4) { await sleep(WINDOW_MS); continue }
    // Recherche vide : parfois passagère chez Deezer, jamais gardée en cache.
    const isEmptySearch = path.startsWith('/search') && !data?.data?.length
    if (!data?.error && !isEmptySearch) writeFileSync(file, JSON.stringify(data))
    return data
  }
  throw new Error(`Deezer : quota dépassé pour ${path}`)
}

// Comparaison sans accents, casse, ponctuation ni précision entre parenthèses ou après « - » (version).
export function norm(text) {
  return text
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[([].*?[)\]]/g, ' ')
    .replace(/\s[-–]\s.*$/, ' ')
    .replace(/&/g, ' et ')
    // « Benny Goodman and His Orchestra » = « Benny Goodman & His Orchestra ».
    .replace(/\band\b/g, ' et ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/^(the|les|le|la|l) /, '')
    .trim()
}

// Mots qui trahissent une autre version que l'enregistrement studio original.
const NOT_ORIGINAL = /\b(live|remix|mix|karaok|instrumental|acoustic|acoustique|cover|reprise|version|edit|remaster|demo|session|unplugged|piano|orchestr|en public|en concert|medley|sped|slowed|tribute|re-?record(ed)?|reloaded|radio|cut|extended|club|dj|bonus|rework|redux|megamix|rmx|mixed|mashup)\b/i

// wanted : titre cherché ; ses propres mots ne comptent pas (« Live Is Life » n'est pas une version live).
export function isOriginalTitle(title, wanted = '') {
  const rest = wanted && title.toLowerCase().startsWith(wanted.toLowerCase()) ? title.slice(wanted.length) : title
  return !NOT_ORIGINAL.test(rest.replace(/\b(radio edit|remaster(ed)?( \d{4})?|\d{4} remaster(ed)?|original mix|video edit|7["”] mix)\b/gi, ''))
}

// Piste studio de cet artiste (artiste principal) avec extrait, la plus écoutée parmi les résultats de recherche.
// Éditions studio de ce morceau (artiste principal, titre, extrait), toutes recherches confondues.
export async function editions(artist, title) {
  // Recherche sans la parenthèse aussi : « Scatman John Scatman (Ski-Ba-Bop-Ba-Dop-Bop) » ne trouve rien chez Deezer.
  const bare = title.replace(/\s*[([].*?[)\]]/g, '').trim()
  // Variante sans apostrophe : « Laura Mayne L' air Du Vent » ne trouve rien chez Deezer, « Laura Mayne L air du vent » oui.
  const plain = bare.replace(/['’]/g, ' ').replace(/\s+/g, ' ')
  const queries = [`artist:"${artist}" track:"${title}"`, `${artist} ${title}`, ...(bare !== title ? [`${artist} ${bare}`] : []), ...(plain !== bare ? [`${artist} ${plain}`] : [])]
  const wantedArtist = norm(artist)
  const wantedTitle = norm(title)
  const found = new Map()
  for (const query of queries) {
    const result = await deezer(`/search?q=${encodeURIComponent(query)}&limit=50`)
    for (const track of result.data ?? []) {
      if (norm(track.artist.name) === wantedArtist && norm(track.title) === wantedTitle && track.preview && isOriginalTitle(track.title, title) && !otherAfterDash(track.title, title) && !OTHER_VERSION_ALBUM.test(track.album?.title ?? '')) found.set(track.id, track)
    }
  }
  return [...found.values()].sort((a, b) => b.rank - a.rank)
}

// Album d'une autre version (« The Weatherman LP (Instrumental) », « Le meilleur du live à l'Olympia ») : jamais
// retenu, même si le titre de la piste est propre. « Remixes » toléré : les EP de singles (« Call On Me (Remixes) »,
// « Premier Gaou, The Remixes ») contiennent aussi la version d'origine, seule édition chez Deezer.
const OTHER_VERSION_ALBUM = /\b(instrumental|live|karaok|unplugged|acoustic|en public|en concert|cover)\b/i

// Suite après « - » absente du titre demandé et qui n'est pas une mention de version : un autre morceau (« Star Wars -
// Duel Of The Fates » pour « Star Wars (Main Title) » : norm() ignore ce qui suit « - »).
function otherAfterDash(found, wanted) {
  const dash = /\s[-–]\s(.*)$/.exec(found)
  return Boolean(dash) && !/\s[-–]\s/.test(wanted) && !/remaster|version|edit|mono|stereo|from|soundtrack|live/i.test(dash[1])
}

// Précision entre parenthèses (ou après « - ») absente du titre demandé : « Blue (Da Ba Dee) (DJ Ponte Ice Pop Radio) »
// pour « Blue (Da Ba Dee) », « Happy (From "Despicable Me 2") » pour « Happy ». Un artiste invité ne compte pas.
export function extraNote(found, wanted) {
  const notes = (text) => (text.match(/[([][^)\]]*[)\]]|\s-\s.*$/g) ?? []).map((note) => norm(note.replace(/[()[\]]/g, ' ')))
  const wantedNotes = notes(wanted)
  return notes(found).some((note) => note && !/^(feat|ft|with|avec)\b/.test(note) && !wantedNotes.includes(note))
}

// Précision sans effet sur l'enregistrement : film d'origine, remasterisation, version single ou album.
const SAME_RECORDING_NOTE = /\b(from|soundtrack|g[ée]n[ée]rique|motion picture|bande originale|remaster(ed)?|remasteris|single version|album version|original version|mono|stereo)\b/i

// Coupe du single d'origine, sans nom de remixeur : « Blue (Da Ba Dee) (Video Edit) », « What Is Love (7” Mix) ».
const SINGLE_CUT_NOTE = /[([]\s*(video edit|radio edit|single edit|7["”] (mix|version))\s*[)\]]/i

// Piste retenue : une édition au titre propre, ou dont la précision ne change pas l'enregistrement (film d'origine,
// remasterisation, coupe du single) ; jamais un remix ni une version refaite (« Hannover Rmx », « Tod Terry's TNT
// Radio Edit '99 »). Non explicite d'abord, puis la plus écoutée : un homonyme qui a recopié le titre nu (« Céline
// Dion », 739 fans) passe après l'édition officielle « (Love Theme from "Titanic") ». Aucune : null.
export async function findTrack(artist, title) {
  const sameRecording = (track) =>
    !extraNote(track.title, title) ||
    (SAME_RECORDING_NOTE.test(track.title) && !/\b(rmx|remix|radio edit|mix)\b/i.test(track.title)) ||
    !extraNote(track.title.replace(SINGLE_CUT_NOTE, ''), title)
  const all = (await editions(artist, title)).filter(sameRecording)
  return [...all].sort((a, b) => Number(a.explicit_lyrics) - Number(b.explicit_lyrics) || b.rank - a.rank)[0] ?? null
}

// Position du titre chez l'artiste. Le « top » Deezer d'un artiste suit l'écoute récente, pas la notoriété : « Toxic »
// (rang 972 750) n'est pas dans le top 50 de Britney Spears, « Papaoutai » y est 38e. On garde donc les titres de ce
// top 50 (dédoublonnés, meilleur rang de leurs éditions), on y ajoute le morceau mesuré avec son meilleur rang, et
// la position par rang est celle du morceau quand ces titres sont classés par rang (1 = le plus écouté).
// position retenue : la meilleure des deux (brute dans le top Deezer, ou par rang) ; elle classe les 12 références
// (« La vie qu'on mène » : 2e du top de Ninho mais 7e par rang ; « Toxic » : absent du top mais 1er par rang).
export async function topEntry(artistId, title, trackRank) {
  const top = await deezer(`/artist/${artistId}/top?limit=50`)
  const best = new Map()
  const order = []
  for (const track of top.data ?? []) {
    const key = norm(track.title)
    if (!best.has(key)) order.push(key)
    best.set(key, Math.max(best.get(key) ?? 0, track.rank))
  }
  const key = norm(title)
  const rank = Math.max(best.get(key) ?? 0, trackRank)
  best.set(key, rank)
  const rankPosition = [...best.values()].filter((other) => other > rank).length + 1
  const index = order.indexOf(key)
  const topPosition = index === -1 ? null : index + 1
  return { position: Math.min(topPosition ?? Infinity, rankPosition), topPosition, rankPosition, rank }
}

// Mesures d'un morceau : piste trouvée, fans de l'artiste, position dans son top, rang de la piste.
export async function measure(artist, title) {
  const track = await findTrack(artist, title)
  if (!track) return { artist, title, found: false }
  const [artistInfo, full] = await Promise.all([deezer(`/artist/${track.artist.id}`), deezer(`/track/${track.id}`)])
  return {
    artist,
    title,
    found: true,
    trackId: track.id,
    deezerTitle: track.title,
    deezerArtist: track.artist.name,
    artistId: track.artist.id,
    nbFan: artistInfo.nb_fan,
    ...(await topEntry(track.artist.id, track.title, Math.max(full.rank ?? 0, track.rank ?? 0))),
    preview: Boolean(full.preview || track.preview),
    explicit: Boolean(full.explicit_lyrics),
    // Date de sortie de la piste chez Deezer (refus des pistes de moins d'un mois : rang provisoire de 100 000).
    releaseDate: full.release_date ?? null,
    // Code ISRC : son année est celle de l'enregistrement d'origine, gardée par les rééditions.
    isrc: full.isrc ?? null,
    trackRank: full.rank ?? null,
  }
}
