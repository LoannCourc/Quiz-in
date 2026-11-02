// Réservoir de morceaux d'un blind test, pour les remplacements et les leurres : playlists Deezer de l'époque ou du
// genre, et titres des artistes liés (/artist/{id}/related) aux artistes du test. Chaque morceau est mesuré
// (fans, position, rang) et classé par niveau ; langue chantée devinée d'après le titre ; époque d'après les dates.
import { deezer, isOriginalTitle, norm, topEntry } from './deezer.mjs'
import { measuredLevel } from './levels.mjs'

// Langue d'un titre d'après ses mots (null : impossible à dire, « Toxic », « Hendaye »).
const LANG_WORDS = {
  fr: /\b(le|la|les|un|une|des|du|de|et|je|tu|il|elle|on|nous|vous|ils|pas|que|qui|mon|ma|mes|ton|ta|tes|son|sa|ses|est|c'est|au|aux|sur|pour|avec|dans|ce|cette|moi|toi|plus|tout|toujours|jamais|quand|comme|amour|coeur|vie|nuit|jour|petit|petite|chanson|monde|rien|ça)\b|\b[ldjtmsnc]'/,
  en: /\b(the|you|me|my|your|love|i|i'm|it|it's|is|of|to|in|on|be|we|all|don't|can't|no|baby|girl|boy|night|time|get|got|just|what|when|this|that|like|with|for|up|down|go|come|heart|dance|feel|want|need|let|tonight|world|life|man|woman|yeah|oh)\b/,
  es: /\b(el|los|las|mi|tu|te|yo|amor|corazón|quiero|vida|bailar|noche|mujer|loca|loco|para|con|por|una|despacito|qué)\b/,
  de: /\b(der|die|das|und|nicht|ich|du|mein|dein|ist|nur|ein|eine|nit|do|herz|liebe|blech)\b/,
}

export function titleLang(title) {
  const text = ` ${title.normalize('NFC').toLowerCase().replace(/[’]/g, "'")} `
  if (/[éèêàùçœâîôû]/.test(text) && !LANG_WORDS.es.test(text)) return 'fr'
  const scores = Object.entries(LANG_WORDS).map(([lang, words]) => [lang, (text.match(new RegExp(words.source, 'g')) ?? []).length])
  scores.sort((a, b) => b[1] - a[1])
  if (scores[0][1] === 0 || scores[0][1] === scores[1][1]) return null
  return scores[0][0]
}

export function sameLang(title, lang) {
  const guess = titleLang(title)
  return guess === null || guess === lang
}

const yearOf = (date) => (date && date !== '0000-00-00' ? Number(date.slice(0, 4)) : null)

// Année d'un ISRC (CC-XXX-AA-NNNNN : AA = année d'attribution, conservée par les rééditions).
function isrcYear(isrc) {
  const match = /^[A-Z]{2}[A-Z0-9]{3}(\d{2})\d{5}$/.exec(isrc ?? '')
  if (!match) return null
  const short = Number(match[1])
  const year = short <= 30 ? 2000 + short : 1900 + short
  // Années aberrantes (ISRC mal saisis : « 1938 » pour un titre de 1979) : ignorées.
  return year >= 1950 ? year : null
}

// Année de première sortie d'un morceau : la plus ancienne entre ses éditions (année de l'ISRC, de la piste, de
// l'album). Les dates Deezer sont celles des rééditions numériques (« Dream On », 1973, y est daté 2011 au plus tôt) ;
// l'ISRC garde l'année de l'enregistrement d'origine. Toutes ces années sont postérieures ou égales à la vraie : la plus
// petite est la meilleure estimation.
export async function firstYear(artist, title, fallbackTrackId) {
  const { editions } = await import('./deezer.mjs')
  const ids = [fallbackTrackId, ...(await editions(artist, title)).slice(0, 6).map((t) => t.id)].filter(Boolean)
  const years = []
  for (const id of new Set(ids)) {
    const { year, track } = await trackYear(id)
    if (year) years.push(year)
    const fromIsrc = isrcYear(track.isrc)
    if (fromIsrc) years.push(fromIsrc)
  }
  return years.length ? Math.min(...years) : null
}

// Année de sortie d'une piste : la plus ancienne entre la piste et son album.
export async function trackYear(trackId) {
  const track = await deezer(`/track/${trackId}`)
  const album = track.album?.id ? await deezer(`/album/${track.album.id}`) : null
  const years = [yearOf(track.release_date), yearOf(album?.release_date)].filter((year) => year)
  return { year: years.length ? Math.min(...years) : null, track, album }
}

// Début de carrière d'un artiste : année de son plus ancien album, single ou EP chez Deezer.
export async function artistEra(artistId) {
  const albums = await deezer(`/artist/${artistId}/albums?limit=100`)
  const years = (albums.data ?? []).map((album) => yearOf(album.release_date)).filter((year) => year)
  return years.length ? Math.min(...years) : null
}

const artists = new Map()
export async function artistInfo(artistId) {
  if (!artists.has(artistId)) artists.set(artistId, await deezer(`/artist/${artistId}`))
  return artists.get(artistId)
}

// Morceau du réservoir : mesures et niveau (sans appel /track : la piste détaillée n'est lue qu'au besoin).
async function poolEntry(artistId, artistName, title, rank, trackId, source) {
  const info = await artistInfo(artistId)
  const entry = await topEntry(artistId, title, rank)
  const m = { nbFan: info.nb_fan ?? 0, position: entry.position, rank: entry.rank }
  return { artistId, artist: artistName, title, trackId, rank: entry.rank, nbFan: m.nbFan, position: entry.position, level: measuredLevel(m), source }
}

// Réservoir d'un test : playlists (requêtes) et artistes liés aux artistes de départ (seedArtistIds).
// includeSeeds : titres des artistes de départ eux-mêmes en plus de ceux des artistes proches (« Rock français »).
export async function buildPool({ playlistQueries, seedArtistIds, includeSeeds = false, playlistsPerQuery = 2, tracksPerPlaylist = 100, relatedPerSeed = 10, topPerArtist = 25 }) {
  const raw = new Map()
  const add = (track, source) => {
    if (!track?.artist?.id || !track.title || !isOriginalTitle(track.title)) return
    const key = `${norm(track.artist.name)}|${norm(track.title)}`
    const known = raw.get(key)
    if (!known || track.rank > known.track.rank) raw.set(key, { track, source: known?.source ?? source })
  }
  for (const query of playlistQueries) {
    const playlists = await deezer(`/search/playlist?q=${encodeURIComponent(query)}&limit=${playlistsPerQuery}`)
    for (const playlist of playlists.data ?? []) {
      const tracks = await deezer(`/playlist/${playlist.id}/tracks?limit=${tracksPerPlaylist}`)
      for (const track of tracks.data ?? []) add(track, `playlist « ${playlist.title} »`)
    }
  }
  const relatedIds = new Set(includeSeeds ? seedArtistIds : [])
  for (const seed of seedArtistIds) {
    const related = await deezer(`/artist/${seed}/related?limit=${relatedPerSeed}`)
    for (const artist of related.data ?? []) relatedIds.add(artist.id)
  }
  for (const artistId of relatedIds) {
    const top = await deezer(`/artist/${artistId}/top?limit=50`)
    for (const track of (top.data ?? []).slice(0, topPerArtist)) add(track, 'artiste lié')
  }
  const entries = []
  for (const { track, source } of raw.values()) {
    entries.push({ ...(await poolEntry(track.artist.id, track.artist.name, track.title, track.rank, track.id, source)), explicit: Boolean(track.explicit_lyrics), preview: Boolean(track.preview), relatedSeed: relatedIds.has(track.artist.id) })
  }
  return entries
}
