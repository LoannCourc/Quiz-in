// Relecture d'un lot de blind tests : pour chaque morceau, l'artiste, ses fans sur Deezer (nb_fan) à la date
// du jour, l'extrait et les paroles, d'après l'API publique Deezer ; puis les 5 morceaux à écouter en priorité.
// Usage (depuis content/) : npm run music:fans -- <lot> <quizId> [<quizId>…]
// Écrit seulement docs/relecture-lot-bt-<lot>.md : nb_fan change avec le temps, il n'entre jamais dans le
// contenu publié ni dans music-check. Un blind test « Impossible » exige moins de IMPOSSIBLE_MAX_FANS fans par
// artiste le jour de la vérification (relancer le script pour revérifier).
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { contentDir, quizzesDir, readMusicCheck, type SourceMusic } from './musicCheck'

export const IMPOSSIBLE_MAX_FANS = 800
const API_URL = 'https://api.deezer.com'
// L'API limite à 50 requêtes par 5 s.
const PAUSE_MS = 150
const PRIORITY_COUNT = 5
const LEVEL_LABELS: Record<string, string> = { easy: 'Facile', medium: 'Moyen', hard: 'Difficile', impossible: 'Impossible' }
const GENRE_LABELS: Record<string, string> = { pop: 'Pop', rock: 'Rock', rap: 'Rap', chanson: 'Chanson', discoFunk: 'Disco/Funk', electro: 'Électro' }
// Titres d'un mot très courant : le même titre existe chez beaucoup d'artistes (risque de mauvais extrait).
const GENERIC_TITLE = /^(love|home|hello|sorry|stay|run|fire|alone|forever|tonight|dreams?|angel|baby|crazy|heaven|paradise|freedom|believe|desire|summer|music|dance|jump|one|help|faith|hope|time|you|me)$/i
const OTHER_VERSION = /\b(live|remix|mix|edit|version|acoustic|unplugged)/i
// Morceaux risqués au plus dans la liste à écouter : le reste est un échantillon des autres blind tests.
const RISKY_MAX = 3

interface SourceQuiz {
  id: string
  title: string
  genre?: string
  decade?: number | 'all'
  level?: string
  questions: { id: string; music?: SourceMusic }[]
}

interface TrackReview {
  quiz: SourceQuiz
  questionId: string
  music: SourceMusic
  trackId: string
  album: string
  verifiedBy: string
  previewAvailable: boolean
  explicit: boolean
  artistId: number | null
  fans: number | null
  homonyms: number
}

async function get<T>(path: string): Promise<T> {
  await new Promise((resolve) => setTimeout(resolve, PAUSE_MS))
  const response = await fetch(`${API_URL}${path}`)
  const body = (await response.json()) as T & { error?: unknown }
  if (body.error) throw new Error(`Erreur de l'API Deezer (${path}) : ${JSON.stringify(body.error)}`)
  return body
}

async function review(quiz: SourceQuiz): Promise<TrackReview[]> {
  const check = readMusicCheck(quiz.id)
  if (!check) throw new Error(`${quiz.id} : lancer d'abord npm run music:lookup -- ${quiz.id}`)
  const reviews: TrackReview[] = []
  for (const question of quiz.questions) {
    const entry = check.tracks.find((track) => track.questionId === question.id)
    if (!question.music || !entry?.found) throw new Error(`${quiz.id}/${question.id} : morceau introuvable dans music-check`)
    const track = await get<{ readable: boolean; preview: string; explicit_lyrics: boolean; explicit_content_lyrics: number; artist: { id: number } }>(
      `/track/${entry.found.id}`,
    )
    const artist = await get<{ nb_fan: number; name: string }>(`/artist/${track.artist.id}`)
    const sameName = await get<{ data: { name: string }[] }>(`/search/artist?q=${encodeURIComponent(`"${artist.name}"`)}&limit=25`)
    reviews.push({
      quiz,
      questionId: question.id,
      music: question.music,
      trackId: entry.found.id,
      album: entry.found.album,
      verifiedBy: entry.verified ? (entry.verifiedBy ?? 'listened') : 'non vérifié',
      previewAvailable: track.readable && track.preview.startsWith('https://'),
      explicit: track.explicit_lyrics || [1, 4].includes(track.explicit_content_lyrics),
      artistId: track.artist.id,
      fans: artist.nb_fan,
      homonyms: sameName.data.filter((candidate) => candidate.name.toLowerCase() === artist.name.toLowerCase()).length,
    })
  }
  return reviews
}

// Orthographe affichée à l'écran, et celle de Deezer entre parenthèses quand elle diffère.
function shownArtist(music: SourceMusic): string {
  return music.displayArtist ? `${music.displayArtist} (Deezer : ${music.artist})` : music.artist
}

function shownTitle(music: SourceMusic): string {
  return music.displayTitle ? `${music.displayTitle} (Deezer : ${music.title})` : music.title
}

// Risques d'un mauvais extrait : artiste homonyme, titre très générique, album d'une autre version.
function risks(track: TrackReview): string[] {
  const found: string[] = []
  if (track.homonyms > 1) found.push(`${track.homonyms} artistes « ${track.music.artist} » sur Deezer`)
  if (GENERIC_TITLE.test(track.music.title)) found.push('titre très générique')
  if (OTHER_VERSION.test(track.album)) found.push(`album « ${track.album} »`)
  return found
}

// 5 morceaux à écouter : les plus risqués d'abord (RISKY_MAX au plus), puis un morceau de chaque blind test pas
// encore représenté.
function priorities(tracks: TrackReview[]): { track: TrackReview; reason: string }[] {
  const risky = tracks
    .map((track) => ({ track, reasons: risks(track) }))
    .filter(({ reasons }) => reasons.length > 0)
    .sort((a, b) => b.reasons.length - a.reasons.length)
    .map(({ track, reasons }) => ({ track, reason: reasons.join(', ') }))
  const chosen = risky.slice(0, RISKY_MAX)
  for (const track of tracks) {
    if (chosen.length >= PRIORITY_COUNT) break
    if (chosen.some((item) => item.track.quiz === track.quiz)) continue
    chosen.push({ track, reason: 'échantillon de ce blind test' })
  }
  for (const track of tracks) {
    if (chosen.length >= PRIORITY_COUNT) break
    if (!chosen.some((item) => item.track === track)) chosen.push({ track, reason: 'échantillon' })
  }
  return chosen
}

function fansCheck(track: TrackReview): string {
  if (track.fans === null) return '?'
  const fans = track.fans.toLocaleString('fr-FR')
  if (track.quiz.level !== 'impossible') return fans
  return track.fans < IMPOSSIBLE_MAX_FANS ? `${fans} ✓` : `**${fans} ✗ (≥ ${IMPOSSIBLE_MAX_FANS})**`
}

function toMarkdown(lot: string, quizzes: SourceQuiz[], tracks: TrackReview[], date: string): string {
  const link = (track: TrackReview) => `https://www.deezer.com/track/${track.trackId}`
  const lines = [
    `# Relecture du lot BT-${lot} : ${quizzes.length} blind tests`,
    '',
    `Vérification Deezer du ${date} (\`npm run music:fans -- ${lot} ${quizzes.map((quiz) => quiz.id).join(' ')}\`). Fans (nb_fan) à cette date ;`,
    `ils changent avec le temps et ne sont jamais publiés. « Impossible » : chaque artiste a moins de ${IMPOSSIBLE_MAX_FANS} fans le jour de la`,
    'vérification. Morceaux cochés par `npm run music:verify` (« auto ») : artiste et titre identiques à Deezer, version',
    'originale, extrait présent, paroles non explicites, extrait qui tient dans le minuteur. Après écoute, passer',
    '`verifiedBy` à `"listened"` dans `content/music-check/<quizId>.json`.',
    '',
    `## À écouter en priorité (${PRIORITY_COUNT})`,
    '',
    ...priorities(tracks).map(
      ({ track, reason }) => `- \`${track.quiz.id}/${track.questionId}\` ${shownArtist(track.music)} — ${shownTitle(track.music)} (${reason}) : <${link(track)}>`,
    ),
    '',
    '## Les blind tests',
    '',
    '| Blind test | Identifiant | Genre | Décennie | Niveau |',
    '|---|---|---|---|---|',
    ...quizzes.map(
      (quiz) =>
        `| ${quiz.title} | \`${quiz.id}\` | ${GENRE_LABELS[quiz.genre ?? ''] ?? '?'} | ${quiz.decade === 'all' ? 'toutes époques' : `${quiz.decade ?? '?'}`} | ${LEVEL_LABELS[quiz.level ?? ''] ?? '?'} |`,
    ),
    '',
  ]
  for (const quiz of quizzes) {
    lines.push(`## ${quiz.title} (\`${quiz.id}\`)`, '')
    lines.push('| Question | Id Deezer | Artiste | Titre | Genre | Niveau | Fans (nb_fan) | Vérifié le | Extrait | Explicite | Vérifié par |')
    lines.push('|---|---|---|---|---|---|---|---|---|---|---|')
    for (const track of tracks.filter((item) => item.quiz === quiz)) {
      lines.push(
        `| ${track.questionId} | [${track.trackId}](${link(track)}) | ${shownArtist(track.music)} | ${shownTitle(track.music)} | ${GENRE_LABELS[quiz.genre ?? ''] ?? '?'} | ${LEVEL_LABELS[quiz.level ?? ''] ?? '?'} | ${fansCheck(track)} | ${date} | ${track.previewAvailable ? 'oui' : '**non**'} | ${track.explicit ? '**oui**' : 'non'} | ${track.verifiedBy} |`,
      )
    }
    lines.push('')
  }
  return `${lines.join('\n')}\n`
}

async function main() {
  const [lot, ...quizIds] = process.argv.slice(2)
  if (!lot || quizIds.length === 0) throw new Error('Usage : npm run music:fans -- <lot> <quizId> [<quizId>…]')
  const quizzes = quizIds.map((quizId) => JSON.parse(readFileSync(join(quizzesDir, `${quizId}.json`), 'utf8')) as SourceQuiz)
  const tracks: TrackReview[] = []
  for (const quiz of quizzes) tracks.push(...(await review(quiz)))
  const date = new Date().toISOString().slice(0, 10)
  const path = join(contentDir, '..', 'docs', `relecture-lot-bt-${lot.toLowerCase()}.md`)
  writeFileSync(path, toMarkdown(lot, quizzes, tracks, date))
  const problems = tracks.filter(
    (track) => !track.previewAvailable || track.explicit || (track.quiz.level === 'impossible' && (track.fans ?? Infinity) >= IMPOSSIBLE_MAX_FANS),
  )
  for (const track of problems) console.log(`✗ ${track.quiz.id}/${track.questionId} ${shownArtist(track.music)} — ${shownTitle(track.music)} : extrait, paroles ou fans hors règle`)
  console.log(`${path} écrit : ${tracks.length} morceaux, ${problems.length} à remplacer.`)
  if (problems.length > 0) process.exitCode = 1
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
