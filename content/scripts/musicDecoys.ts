// Contrôle des mauvaises propositions des blind tests : chaque « Titre – Artiste » proposé doit exister chez
// Deezer (même artiste, même titre, sans casse, accents ni article), dans une version ni live ni remix et non
// explicite. Usage (depuis content/) : npm run music:decoys [-- <quizId> …] (sans argument : tous les blind
// tests). Résultats gardés dans music-check/decoys.json (une recherche par proposition, jamais refaite) ;
// supprimer une entrée pour la rechercher de nouveau. Code de sortie 1 s'il en manque.
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { normalizeAnswer } from '../../shared/answerMatching'
import { trackOptionParts } from '../../shared/trackOption'
import { musicCheckDir, quizzesDir } from './musicCheck'

interface DecoyCheck {
  // Morceau Deezer qui correspond, ou null si aucun.
  id: string | null
  artist?: string
  title?: string
  checkedAt: string
}

interface DeezerTrack {
  id: number
  title: string
  explicit_lyrics: boolean
  explicit_content_lyrics: number
  artist: { name: string }
  album: { title: string }
}

const CACHE_PATH = join(musicCheckDir, 'decoys.json')
const PAUSE_MS = 220
const OTHER_VERSION = /\b(live|remix|mix|karaoke|cover|instrumental|acoustic|acoustique|reprise)\b/i

function compact(text: string): string {
  return normalizeAnswer(text).replace(/ /g, '')
}

// Titre sans précisions entre parenthèses ni après un tiret (« Hey Jude (Remastered) » → « hey jude »).
function baseTitle(title: string): string {
  return compact(title.replace(/\s*[([].*?[)\]]/g, '').replace(/\s+-\s+.*$/, ''))
}

function sameArtist(found: string, wanted: string): boolean {
  const a = compact(found)
  const b = compact(wanted)
  return a === b || a.startsWith(b) || b.startsWith(a)
}

async function search(query: string): Promise<DeezerTrack[]> {
  await new Promise((resolve) => setTimeout(resolve, PAUSE_MS))
  const response = await fetch(`https://api.deezer.com/search?limit=50&q=${encodeURIComponent(query)}`)
  const body = (await response.json()) as { data?: DeezerTrack[]; error?: unknown }
  if (body.error) throw new Error(`Erreur de l'API Deezer : ${JSON.stringify(body.error)}`)
  return body.data ?? []
}

async function check(option: string): Promise<DecoyCheck> {
  const { title, artist } = trackOptionParts(option)
  const checkedAt = new Date().toISOString().slice(0, 10)
  if (!artist) return { id: null, checkedAt }
  const rows = await search(`${artist} ${title}`.replace(/[,!?]/g, ' '))
  const match = rows.find(
    (row) =>
      sameArtist(row.artist.name, artist) &&
      baseTitle(row.title) === baseTitle(title) &&
      !OTHER_VERSION.test(row.title) &&
      !OTHER_VERSION.test(row.album.title) &&
      !row.explicit_lyrics &&
      ![1, 4].includes(row.explicit_content_lyrics),
  )
  return match ? { id: String(match.id), artist: match.artist.name, title: match.title, checkedAt } : { id: null, checkedAt }
}

async function main() {
  const wanted = process.argv.slice(2)
  const cache: Record<string, DecoyCheck> = existsSync(CACHE_PATH) ? JSON.parse(readFileSync(CACHE_PATH, 'utf8')) : {}
  const files = readdirSync(quizzesDir).filter((name) => name.endsWith('.json'))
  const missing: string[] = []
  let checked = 0
  for (const file of files) {
    const quiz = JSON.parse(readFileSync(join(quizzesDir, file), 'utf8')) as {
      id: string
      gameType?: string
      questions: { id: string; options: string[]; correctIndex: number }[]
    }
    if (quiz.gameType !== 'blindTest' || (wanted.length > 0 && !wanted.includes(quiz.id))) continue
    for (const question of quiz.questions) {
      for (const [index, option] of question.options.entries()) {
        if (index === question.correctIndex) continue
        if (!cache[option]) {
          cache[option] = await check(option)
          checked += 1
          if (checked % 25 === 0) writeFileSync(CACHE_PATH, `${JSON.stringify(cache, null, 1)}\n`)
        }
        if (!cache[option].id) missing.push(`${quiz.id}/${question.id} : « ${option} »`)
      }
    }
  }
  const sorted = Object.fromEntries(Object.entries(cache).sort(([a], [b]) => a.localeCompare(b, 'fr')))
  writeFileSync(CACHE_PATH, `${JSON.stringify(sorted, null, 1)}\n`)
  for (const line of missing) console.log(`✗ ${line} : introuvable chez Deezer (ou seulement live, remix ou explicite)`)
  console.log(`${checked} proposition(s) recherchée(s), ${missing.length} introuvable(s).`)
  if (missing.length > 0) process.exitCode = 1
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
