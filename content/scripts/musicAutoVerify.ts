// Vérification automatique des morceaux d'un blind test, après npm run music:lookup.
// Usage (depuis content/) : npm run music:verify -- <quizId> [<quizId>…]
// Un morceau est coché (verified: true, verifiedBy: "auto") seulement si TOUS les contrôles passent :
// artiste et titre identiques à ceux affichés par Deezer, version originale (ni live, ni remix…), extrait
// disponible, paroles non explicites, extrait qui tient dans le minuteur. Sinon, la raison est affichée et le
// morceau est à remplacer. Un morceau écouté par Loann porte verifiedBy: "listened" (à écrire à la main).
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { fitsBlindTestTimer } from '../../shared/quizValidation'
import { quizzesDir, readMusicCheck, sameQuery, writeMusicCheck, type FoundTrack, type SourceMusic } from './musicCheck'

interface SourceQuiz {
  id: string
  gameType?: string
  questions: { id: string; timeLimit?: number; music?: SourceMusic }[]
}

// Apostrophes et espaces typographiques ramenés à leur forme simple ; la casse compte (« telle qu'affichée »).
function displayed(text: string): string {
  return text.replace(/[’‘`´]/g, "'").replace(/\s+/g, ' ').trim()
}

// Précisions acceptées après le titre, une ou plusieurs : même enregistrement (artiste invité, remasterisation,
// version du single, bande originale d'un film), jamais une autre version (live, remix…).
const SAME_RECORDING_PART =
  /(\s*[([]\s*(feat\.? [^)\]]+|with [^)\]]+|(\d{4} )?remaster(ed)?( \d{4})?( version)?|single version|(original )?radio edit|original( mix| version)?|mono|stereo|version (mono|stéréo|stereo)|7" (mix|version)|from [^)\]]*(soundtrack|motion picture)[^)\]]*)\s*[)\]]|\s+-\s+((\d{4} )?remaster(ed)?( \d{4})?|single version|radio edit|mono|stereo))\s*$/i

// Titre affiché sans ses précisions de même enregistrement, retirées de la fin une à une.
function recordingTitle(title: string): string {
  let rest = title
  while (SAME_RECORDING_PART.test(rest)) rest = rest.replace(SAME_RECORDING_PART, '')
  return rest
}

const OTHER_VERSION = /\b(live|acoustic|acoustique|karaoke|cover|instrumental|unplugged|demo|reprise|remix|mix|rework|club|edit)\b/i

// Raison du refus, ou null si le morceau passe tous les contrôles.
export function autoCheckFailure(music: SourceMusic, found: FoundTrack | null, timeLimit?: number): string | null {
  if (!found) return 'aucun morceau trouvé'
  if (!found.previewAvailable) return 'pas d’extrait'
  if (found.explicit) return 'paroles explicites'
  if (displayed(found.artist) !== displayed(music.artist)) return `artiste affiché par Deezer : « ${found.artist} »`
  if (displayed(recordingTitle(found.title)) !== displayed(music.title)) return `titre affiché par Deezer : « ${found.title} »`
  if (OTHER_VERSION.test(found.album) && !/remaster/i.test(found.album)) return `album d'une autre version : « ${found.album} »`
  if (!fitsBlindTestTimer({ startS: music.startS ?? 0 }, timeLimit)) return 'extrait trop court pour le minuteur (startS)'
  return null
}

function verifyQuiz(quizId: string): number {
  const quiz = JSON.parse(readFileSync(join(quizzesDir, `${quizId}.json`), 'utf8')) as SourceQuiz
  if (quiz.gameType !== 'blindTest') throw new Error(`${quizId} n'est pas un blind test`)
  const check = readMusicCheck(quizId)
  if (!check) throw new Error(`${quizId} : lancer d'abord npm run music:lookup -- ${quizId}`)
  let failures = 0
  for (const question of quiz.questions) {
    const entry = check.tracks.find((track) => track.questionId === question.id)
    if (!question.music || !entry || !sameQuery(entry, question.music)) {
      console.log(`✗ ${quizId}/${question.id} : relancer npm run music:lookup -- ${quizId}`)
      failures += 1
      continue
    }
    if (entry.verified) continue
    const failure = autoCheckFailure(question.music, entry.found, question.timeLimit)
    if (failure) {
      console.log(`✗ ${quizId}/${question.id} ${question.music.artist} — ${question.music.title} : ${failure}`)
      failures += 1
    } else {
      entry.verified = true
      entry.verifiedBy = 'auto'
    }
  }
  const markdown = readFileSync(join(quizzesDir, '..', 'music-check', `${quizId}.md`), 'utf8')
  writeMusicCheck(check, markdown)
  console.log(`${quizId} : ${quiz.questions.length - failures}/${quiz.questions.length} morceaux vérifiés.`)
  return failures
}

const quizIds = process.argv.slice(2)
if (quizIds.length === 0) {
  console.error('Usage : npm run music:verify -- <quizId> [<quizId>…]')
  process.exit(1)
}
const failures = quizIds.reduce((total, quizId) => total + verifyQuiz(quizId), 0)
if (failures > 0) process.exitCode = 1
