// Recherche des morceaux d'un blind test dans l'API Deezer, une seule fois, à la construction du contenu.
// Usage (depuis content/) : npm run music:lookup -- <quizId>
// Écrit music-check/<quizId>.json (à vérifier puis à cocher) et music-check/<quizId>.md (lecture).
// Un morceau déjà vérifié dont l'artiste et le titre n'ont pas changé est conservé tel quel.
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import {
  quizzesDir,
  readMusicCheck,
  sameQuery,
  writeMusicCheck,
  type FoundTrack,
  type MusicCheckEntry,
  type MusicCheckFile,
  type SourceMusic,
} from './musicCheck'

interface SourceQuiz {
  id: string
  title: string
  gameType?: string
  questions: { id: string; text: string; music?: SourceMusic }[]
}

interface DeezerSearchTrack {
  id: number
  title: string
  readable: boolean
  preview: string
  duration: number
  link: string
  rank: number
  explicit_lyrics: boolean
  // 0 non explicite, 1 explicite, 2 inconnu, 3 version épurée, 4 partiellement explicite, 5 partiellement
  // inconnu, 6 sans avis, 7 partiellement sans avis.
  explicit_content_lyrics: number
  artist: { name: string }
  album: { title: string }
}

const SEARCH_URL = 'https://api.deezer.com/search'
const ALTERNATIVES = 3
// L'API limite à 50 requêtes par 5 s : une pause courte entre deux recherches suffit.
const PAUSE_MS = 250
// Niveaux de explicit_content_lyrics refusés (public familial) : explicite, partiellement explicite.
const EXPLICIT_CONTENT_LEVELS = [1, 4]

function toFound(track: DeezerSearchTrack): FoundTrack {
  return {
    id: String(track.id),
    title: track.title,
    artist: track.artist.name,
    album: track.album.title,
    durationS: track.duration,
    previewAvailable: track.readable && track.preview.startsWith('https://'),
    link: track.link,
    explicit: track.explicit_lyrics || EXPLICIT_CONTENT_LEVELS.includes(track.explicit_content_lyrics),
    rank: track.rank,
  }
}

async function search(query: string): Promise<DeezerSearchTrack[]> {
  const response = await fetch(`${SEARCH_URL}?q=${encodeURIComponent(query)}&limit=50`)
  const body = (await response.json()) as { data?: DeezerSearchTrack[]; error?: unknown }
  if (body.error) throw new Error(`Erreur de l'API Deezer : ${JSON.stringify(body.error)}`)
  return body.data ?? []
}

// Versions à éviter dans un blind test : on veut l'enregistrement original. « 7" Mix » et « Original »
// désignent au contraire la version du single.
const OTHER_VERSION =
  /\b(live|acoustic|acoustique|karaoke|cover|instrumental|unplugged|demo|reprise|reloaded|rework|club)\b|\b(re-?mix|mix)|re-?record|réenregistr/i
const ORIGINAL_VERSION = /\boriginal\b|7["”] ?mix/i

function isOriginal(track: FoundTrack): boolean {
  if (ORIGINAL_VERSION.test(track.title)) return true
  return !OTHER_VERSION.test(track.title) && !OTHER_VERSION.test(track.album)
}

function simplified(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

// Titre sans ses précisions : « Hey Jude (Remastered 2015) » → « hey jude ».
function baseTitle(title: string): string {
  return simplified(title.replace(/\s*[([].*?[)\]]/g, '').replace(/\s+-\s+.*$/, ''))
}

// Ordre de préférence : le bon artiste, puis le titre exact (à défaut, le titre cité dans un titre plus
// long), puis une version originale ; à égalité, la plus écoutée (popularité Deezer).
function score(track: FoundTrack, music: SourceMusic): number {
  const artist = simplified(track.artist)
  const wanted = simplified(music.artist)
  const sameArtist = artist.includes(wanted) || wanted.includes(artist)
  const exactTitle = baseTitle(track.title) === baseTitle(music.title)
  const titleScore = exactTitle ? 2 : simplified(track.title).includes(baseTitle(music.title)) ? 1 : 0
  return (sameArtist ? 4 : 0) + titleScore + (isOriginal(track) ? 1 : 0)
}

function isBetter(track: FoundTrack, best: FoundTrack, music: SourceMusic): boolean {
  const difference = score(track, music) - score(best, music)
  return difference > 0 || (difference === 0 && (track.rank ?? 0) > (best.rank ?? 0))
}

// Recherche précise (artiste et titre) et recherche large, réunies : la version originale n'est pas
// toujours dans les résultats de la première. Parmi les résultats avec un extrait disponible et sans
// paroles explicites, le meilleur est proposé ; les autres sont gardés comme alternatives.
async function lookUp(music: SourceMusic): Promise<{ found: FoundTrack | null; alternatives: FoundTrack[] }> {
  const precise = await search(`artist:"${music.artist}" track:"${music.title}"`)
  await new Promise((resolve) => setTimeout(resolve, PAUSE_MS))
  // Sans ponctuation : « Whenever, Wherever » ne trouve pas la version studio, « Whenever Wherever » si.
  const broad = await search(`${music.artist} ${music.title}`.replace(/[,!?]/g, ' '))
  const byId = new Map([...precise, ...broad].map((track) => [track.id, toFound(track)]))
  const candidates = [...byId.values()]
  const playable = candidates.filter((track) => track.previewAvailable && !track.explicit)
  const found = playable.reduce<FoundTrack | null>((best, track) => (!best || isBetter(track, best, music) ? track : best), null)
  const alternatives = candidates
    .filter((track) => track !== found)
    .sort((a, b) => score(b, music) - score(a, music))
    .slice(0, ALTERNATIVES)
  return { found, alternatives }
}

function trackLine(track: FoundTrack): string {
  const preview = track.previewAvailable ? 'extrait disponible' : '**pas d’extrait**'
  const explicit = track.explicit ? ', **paroles explicites**' : ''
  const rank = track.rank === undefined ? '' : `, popularité ${track.rank.toLocaleString('fr-FR')}`
  return `${track.artist} — ${track.title} (album « ${track.album} », ${track.durationS} s, ${preview}${explicit}${rank}) : ${track.link}`
}

function toMarkdown(quiz: SourceQuiz, check: MusicCheckFile): string {
  const lines = [
    `# Contrôle des morceaux : ${quiz.title}`,
    '',
    `Recherche Deezer du ${check.lookedUpAt}. Pour chaque morceau : ouvrir le lien, écouter, vérifier que c'est`,
    'la bonne version (pas un remix, une reprise ni un karaoké) et le passage joué (startS), puis passer `verified` à `true` dans',
    `\`${quiz.id}.json\`. Si une alternative est meilleure, la copier dans \`found\` avant de cocher.`,
    'Ensuite : `npm run build`, qui refuse tout morceau non vérifié.',
    '',
  ]
  check.tracks.forEach((entry, index) => {
    const status = entry.verified ? '✅ vérifié' : '⬜ à vérifier'
    const question = quiz.questions.find((candidate) => candidate.id === entry.questionId)
    lines.push(`## ${index + 1}. ${entry.query.artist} — ${entry.query.title} (${entry.questionId}) ${status}`)
    lines.push('')
    lines.push(`- Question : « ${question?.text ?? '?'} », extrait à partir de ${question?.music?.startS ?? 0} s (startS, à ajuster à l'écoute)`)
    lines.push(entry.found ? `- Proposé : ${trackLine(entry.found)}` : '- **Aucun morceau avec extrait trouvé.**')
    entry.alternatives.forEach((track) => lines.push(`- Alternative : ${trackLine(track)}`))
    lines.push('')
  })
  return `${lines.join('\n')}\n`
}

async function main() {
  const quizId = process.argv[2]
  if (!quizId) throw new Error('Usage : npm run music:lookup -- <quizId>')
  const quiz = JSON.parse(readFileSync(join(quizzesDir, `${quizId}.json`), 'utf8')) as SourceQuiz
  if (quiz.gameType !== 'blindTest') throw new Error(`${quizId} n'est pas un blind test (gameType)`)

  const previous = readMusicCheck(quizId)
  const tracks: MusicCheckEntry[] = []
  for (const question of quiz.questions) {
    if (!question.music) throw new Error(`${question.id} : champ music manquant`)
    const kept = previous?.tracks.find((entry) => entry.questionId === question.id)
    if (kept?.verified && sameQuery(kept, question.music)) {
      tracks.push(kept)
      continue
    }
    const { found, alternatives } = await lookUp(question.music)
    const query = { artist: question.music.artist, title: question.music.title }
    tracks.push({ questionId: question.id, query, found, alternatives, verified: false })
    console.log(`${found ? '✓' : '✗'} ${query.artist} — ${query.title}${found ? ` → ${found.id}` : ' : introuvable'}`)
    await new Promise((resolve) => setTimeout(resolve, PAUSE_MS))
  }

  const check: MusicCheckFile = { quizId, source: 'deezer', lookedUpAt: new Date().toISOString().slice(0, 10), tracks }
  writeMusicCheck(check, toMarkdown(quiz, check))
  const toVerify = tracks.filter((entry) => !entry.verified).length
  console.log(`music-check/${quizId}.json et .md écrits : ${toVerify} morceau(x) à vérifier.`)
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
