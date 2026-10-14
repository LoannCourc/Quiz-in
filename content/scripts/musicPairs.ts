// Blind test, choix multiples « Titre – Artiste » : complète chaque proposition par sa moitié manquante
// (l'artiste d'un titre, ou un titre connu d'un artiste), d'après l'API Deezer.
// Usage (depuis content/) : npm run music:pairs -- <quizId> [--apply]
// Sans --apply : brouillon music-check/<quizId>-pairs.json (à relire et corriger à la main : époque, artiste
// d'origine) et sa version lisible .md. Avec --apply : réécrit les propositions du quiz d'après ce fichier
// relu, au format « Titre – Artiste » (la bonne proposition d'après son champ music, jamais d'après Deezer).
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { TRACK_OPTION_SEPARATOR, trackOptionParts } from '../../shared/trackOption'
import { quizzesDir } from './musicCheck'

interface PairQuestion {
  id: string
  ask?: string
  options: string[]
  correctIndex: number
  music?: { title: string; artist: string }
}

interface PairQuiz {
  id: string
  title: string
  gameType?: string
  questions: PairQuestion[]
}

interface DeezerTrack {
  title_short: string
  rank: number
  artist: { name: string }
}

const SEARCH_URL = 'https://api.deezer.com/search'
const PAUSE_MS = 250
// Reprises, karaokés et compilations : jamais l'artiste d'origine.
const NOT_ORIGINAL_ARTIST = /karaoke|tribute|cover|hits|orchestra|band of|the [0-9]+s|various|in the style|made famous/i
const OTHER_VERSION = /\b(live|acoustic|remix|mix|edit|instrumental|karaoke|version|remaster)/i

async function search(query: string): Promise<DeezerTrack[]> {
  await new Promise((resolve) => setTimeout(resolve, PAUSE_MS))
  const response = await fetch(`${SEARCH_URL}?q=${encodeURIComponent(query)}&limit=25`)
  const body = (await response.json()) as { data?: DeezerTrack[]; error?: unknown }
  if (body.error) throw new Error(`Erreur de l'API Deezer : ${JSON.stringify(body.error)}`)
  return body.data ?? []
}

function simplified(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

// Artiste d'origine d'un titre : le plus écouté parmi les résultats au titre identique, hors reprises.
async function artistOf(title: string): Promise<string | null> {
  const results = await search(`track:"${title}"`)
  const candidates = results
    .filter((track) => simplified(track.title_short) === simplified(title) && !NOT_ORIGINAL_ARTIST.test(track.artist.name))
    .sort((a, b) => b.rank - a.rank)
  return candidates[0]?.artist.name ?? null
}

// Titre le plus écouté d'un artiste (classement Deezer de l'artiste), hors titres déjà pris dans le quiz.
// L'époque n'est pas garantie : à relire.
async function titleOf(artist: string, taken: ReadonlySet<string>): Promise<string | null> {
  await new Promise((resolve) => setTimeout(resolve, PAUSE_MS))
  const found = (await (await fetch(`${SEARCH_URL}/artist?q=${encodeURIComponent(artist)}&limit=5`)).json()) as { data?: { id: number; name: string }[] }
  const match = found.data?.find((candidate) => simplified(candidate.name) === simplified(artist))
  if (!match) return null
  await new Promise((resolve) => setTimeout(resolve, PAUSE_MS))
  const top = (await (await fetch(`https://api.deezer.com/artist/${match.id}/top?limit=10`)).json()) as { data?: DeezerTrack[] }
  const titles = (top.data ?? []).map((track) => track.title_short).filter((title) => !OTHER_VERSION.test(title) && !taken.has(simplified(title)))
  return titles[0] ?? null
}

interface Pair {
  questionId: string
  index: number
  before: string
  after: string | null
  isCorrect: boolean
}

async function pairsOf(quiz: PairQuiz): Promise<Pair[]> {
  // Titres du quiz (bonnes réponses) : un titre proposé pour un mauvais artiste ne doit pas les reprendre.
  const taken = new Set(quiz.questions.flatMap((question) => (question.music ? [simplified(question.music.title)] : [])))
  const pairs: Pair[] = []
  for (const question of quiz.questions) {
    if (!question.music || (question.ask !== 'title' && question.ask !== 'artist')) continue
    for (const [index, option] of question.options.entries()) {
      if (trackOptionParts(option).artist !== null) continue
      const isCorrect = index === question.correctIndex
      let after: string | null
      if (question.ask === 'title') {
        const artist = isCorrect ? question.music.artist : await artistOf(option)
        after = artist && `${option}${TRACK_OPTION_SEPARATOR}${artist}`
      } else {
        const title = isCorrect ? question.music.title : await titleOf(option, taken)
        if (title && !isCorrect) taken.add(simplified(title))
        after = title && `${title}${TRACK_OPTION_SEPARATOR}${option}`
      }
      pairs.push({ questionId: question.id, index, before: option, after, isCorrect })
    }
  }
  return pairs
}

function toMarkdown(quiz: PairQuiz, pairs: Pair[]): string {
  const lines = [`# Propositions « Titre – Artiste » : ${quiz.title}`, '', 'Moitié ajoutée d’après Deezer (la bonne proposition d’après le champ music). À relire.', '']
  for (const pair of pairs) {
    const mark = pair.isCorrect ? ' (bonne réponse)' : ''
    lines.push(`- ${pair.questionId} ${'ABCD'[pair.index]}${mark} : ${pair.before} → ${pair.after ?? '**introuvable : à compléter à la main**'}`)
  }
  return lines.join('\n') + '\n'
}

async function main() {
  const [quizId, flag] = process.argv.slice(2)
  if (!quizId) throw new Error('Usage : npm run music:pairs -- <quizId> [--apply]')
  const path = join(quizzesDir, `${quizId}.json`)
  const quiz = JSON.parse(readFileSync(path, 'utf8')) as PairQuiz
  if (quiz.gameType !== 'blindTest') throw new Error(`${quizId} n'est pas un blind test`)
  const draftPath = join(quizzesDir, '..', 'music-check', `${quizId}-pairs.json`)
  if (flag !== '--apply') {
    if (existsSync(draftPath)) throw new Error(`${draftPath} existe déjà (relu ?) : le supprimer pour refaire la recherche`)
    const pairs = await pairsOf(quiz)
    writeFileSync(draftPath, JSON.stringify(pairs, null, 2) + '\n')
    writeFileSync(draftPath.replace(/\.json$/, '.md'), toMarkdown(quiz, pairs))
    console.log(`${quizId} : ${pairs.length} propositions, ${pairs.filter((pair) => pair.after === null).length} introuvables`)
    return
  }
  const pairs = JSON.parse(readFileSync(draftPath, 'utf8')) as Pair[]
  writeFileSync(draftPath.replace(/\.json$/, '.md'), toMarkdown(quiz, pairs))
  const missing = pairs.filter((pair) => pair.after === null)
  if (missing.length > 0) throw new Error('Propositions introuvables : compléter le fichier à la main avant --apply')
  for (const pair of pairs) {
    const question = quiz.questions.find((candidate) => candidate.id === pair.questionId)
    if (question && pair.after) question.options[pair.index] = pair.after
  }
  // Seule la ligne « options » de chaque question change (fichier écrit à la main, style compact gardé).
  let text = readFileSync(path, 'utf8')
  for (const question of quiz.questions) {
    const start = text.indexOf(`"id": "${question.id}"`)
    const optionsAt = text.indexOf('"options": [', start)
    const end = text.indexOf(']', optionsAt)
    if (start < 0 || optionsAt < 0 || end < 0) throw new Error(`Propositions de ${question.id} introuvables dans le fichier`)
    const line = `"options": [${question.options.map((option) => JSON.stringify(option)).join(', ')}`
    text = text.slice(0, optionsAt) + line + text.slice(end)
  }
  writeFileSync(path, text)
  console.log(`${quizId} : propositions réécrites`)
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
