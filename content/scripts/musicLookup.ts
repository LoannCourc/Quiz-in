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
  questions: { id: string; music?: SourceMusic }[]
}

interface DeezerSearchTrack {
  id: number
  title: string
  readable: boolean
  preview: string
  duration: number
  link: string
  artist: { name: string }
  album: { title: string }
}

const SEARCH_URL = 'https://api.deezer.com/search'
const ALTERNATIVES = 3
// L'API limite à 50 requêtes par 5 s : une pause courte entre deux recherches suffit.
const PAUSE_MS = 250

function toFound(track: DeezerSearchTrack): FoundTrack {
  return {
    id: String(track.id),
    title: track.title,
    artist: track.artist.name,
    album: track.album.title,
    durationS: track.duration,
    previewAvailable: track.readable && track.preview.startsWith('https://'),
    link: track.link,
  }
}

async function search(query: string): Promise<DeezerSearchTrack[]> {
  const response = await fetch(`${SEARCH_URL}?q=${encodeURIComponent(query)}&limit=10`)
  const body = (await response.json()) as { data?: DeezerSearchTrack[]; error?: unknown }
  if (body.error) throw new Error(`Erreur de l'API Deezer : ${JSON.stringify(body.error)}`)
  return body.data ?? []
}

// Recherche précise (artiste et titre), puis large si rien n'est trouvé. Le premier résultat avec
// un extrait disponible est proposé ; les suivants sont gardés comme alternatives.
async function lookUp(music: SourceMusic): Promise<{ found: FoundTrack | null; alternatives: FoundTrack[] }> {
  let results = await search(`artist:"${music.artist}" track:"${music.title}"`)
  if (results.length === 0) results = await search(`${music.artist} ${music.title}`)
  const candidates = results.map(toFound)
  const found = candidates.find((track) => track.previewAvailable) ?? null
  const alternatives = candidates.filter((track) => track !== found).slice(0, ALTERNATIVES)
  return { found, alternatives }
}

function trackLine(track: FoundTrack): string {
  const preview = track.previewAvailable ? 'extrait disponible' : '**pas d’extrait**'
  return `${track.artist} — ${track.title} (album « ${track.album} », ${track.durationS} s, ${preview}) : ${track.link}`
}

function toMarkdown(quiz: SourceQuiz, check: MusicCheckFile): string {
  const lines = [
    `# Contrôle des morceaux : ${quiz.title}`,
    '',
    `Recherche Deezer du ${check.lookedUpAt}. Pour chaque morceau : ouvrir le lien, écouter, vérifier que c'est`,
    'la bonne version (pas un remix, une reprise ni un karaoké), puis passer `verified` à `true` dans',
    `\`${quiz.id}.json\`. Si une alternative est meilleure, la copier dans \`found\` avant de cocher.`,
    'Ensuite : `npm run build`, qui refuse tout morceau non vérifié.',
    '',
  ]
  check.tracks.forEach((entry, index) => {
    const status = entry.verified ? '✅ vérifié' : '⬜ à vérifier'
    lines.push(`## ${index + 1}. ${entry.query.artist} — ${entry.query.title} (${entry.questionId}) ${status}`)
    lines.push('')
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
