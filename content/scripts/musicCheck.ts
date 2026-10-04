// Fichiers de contrôle des morceaux de blind test (content/music-check/<quizId>.json) : pour chaque
// question, le morceau trouvé chez Deezer par npm run music:lookup, et la case « verified » que le
// développeur passe à true après avoir écouté le morceau. npm run build n'utilise que les morceaux vérifiés :
// aucun identifiant n'entre dans la base sans cette vérification.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

export const contentDir = join(dirname(fileURLToPath(import.meta.url)), '..')
export const quizzesDir = join(contentDir, 'quizzes')
export const musicCheckDir = join(contentDir, 'music-check')

// Morceau tel qu'il est écrit dans le fichier source d'un blind test (sans identifiant).
export interface SourceMusic {
  artist: string
  title: string
  startS?: number
  durationS?: number
}

export interface FoundTrack {
  id: string
  title: string
  artist: string
  album: string
  durationS: number
  previewAvailable: boolean
  link: string
}

export interface MusicCheckEntry {
  questionId: string
  query: { artist: string; title: string }
  // Morceau proposé ; on peut le remplacer à la main par une des alternatives avant de vérifier.
  found: FoundTrack | null
  alternatives: FoundTrack[]
  verified: boolean
}

export interface MusicCheckFile {
  quizId: string
  source: 'deezer'
  lookedUpAt: string
  tracks: MusicCheckEntry[]
}

export function musicCheckPath(quizId: string): string {
  return join(musicCheckDir, `${quizId}.json`)
}

export function readMusicCheck(quizId: string): MusicCheckFile | null {
  const path = musicCheckPath(quizId)
  return existsSync(path) ? (JSON.parse(readFileSync(path, 'utf8')) as MusicCheckFile) : null
}

export function writeMusicCheck(check: MusicCheckFile, markdown: string): void {
  mkdirSync(musicCheckDir, { recursive: true })
  writeFileSync(musicCheckPath(check.quizId), `${JSON.stringify(check, null, 2)}\n`)
  writeFileSync(join(musicCheckDir, `${check.quizId}.md`), markdown)
}

// Même requête qu'au moment de la recherche : si l'artiste ou le titre change dans la source, il faut
// relancer la recherche et vérifier de nouveau.
export function sameQuery(entry: MusicCheckEntry, music: SourceMusic): boolean {
  return entry.query.artist === music.artist && entry.query.title === music.title
}
