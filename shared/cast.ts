import { TV_DRAW_SCALE } from './drawing/palette'
import { isValidRoomCode, normalizeRoomCode } from './roomCode'

// Canal de messages personnalisé entre l'app de l'hôte (émetteur Cast) et la TV (récepteur).
// Le récepteur enregistré dans la console Cast n'a pas de code dans son URL : l'hôte l'envoie ici.
export const CAST_NAMESPACE = 'urn:x-cast:com.herocorp.quizin'

// Seul message de l'hôte vers la TV : « affiche la partie CODE ». Renvoyé à chaque (re)connexion.
export interface CastShowGameMessage {
  code: string
}

// Code de salle normalisé et valide contenu dans un message reçu, ou null (message ignoré).
export function readCastRoomCode(data: unknown): string | null {
  if (typeof data !== 'object' || data === null || !('code' in data)) return null
  const { code } = data
  if (typeof code !== 'string') return null
  const normalized = normalizeRoomCode(code)
  return isValidRoomCode(normalized) ? normalized : null
}

// Récepteur personnalisé enregistré dans la console Cast (URL https://quiz-in-7dbd6.web.app/).
// Même valeur dans app.json (receiverAppId du plugin react-native-google-cast).
export const CAST_RECEIVER_APP_ID = 'AA4E97E3'

// Diagnostic du son (outil de test cast-sender.html) : « joue cet extrait ». La TV le lit avec le
// lecteur des blind tests et affiche si la lecture démarre sans geste de l'utilisateur.
export interface CastAudioTestMessage {
  audioTest: string
}

// Adresse https contenue dans un message de test du son, ou null (message ignoré).
export function readCastAudioTest(data: unknown): string | null {
  if (typeof data !== 'object' || data === null || !('audioTest' in data)) return null
  const { audioTest } = data
  return typeof audioTest === 'string' && audioTest.startsWith('https://') ? audioTest : null
}

// Test du son de la TV (spec 17, outil cast-sender.html) : « effects » joue chaque effet synthétisé ;
// un chemin de music/ (fichier déployé avec la TV) ou une adresse https est décodé puis joué en boucle.
export interface CastSoundTestMessage {
  soundTest: string
}

const SOUND_TEST_FILE = /^music\/[\w.-]+\.(ogg|oga|m4a|aac|mp3)$/

// Cible du test contenue dans un message, ou null (message ignoré).
export function readCastSoundTest(data: unknown): string | null {
  if (typeof data !== 'object' || data === null || !('soundTest' in data)) return null
  const { soundTest } = data
  if (typeof soundTest !== 'string') return null
  const target = soundTest.trim()
  return target === 'effects' || SOUND_TEST_FILE.test(target) || target.startsWith('https://') ? target : null
}

// Panneau de mesures de la TV (plan de fiabilité, outil cast-sender.html) : allumé ou éteint.
export interface CastPerfMessage {
  perf: boolean
}

// Valeur demandée, ou null (message ignoré).
export function readCastPerf(data: unknown): boolean | null {
  if (typeof data !== 'object' || data === null || !('perf' in data)) return null
  const { perf } = data
  return typeof perf === 'boolean' ? perf : null
}

// Panneau de mesures : musique coupée sur la TV (false) ou rendue au réglage de l'hôte (true).
export interface CastPerfMusicMessage {
  perfMusic: boolean
}

export function readCastPerfMusic(data: unknown): boolean | null {
  if (typeof data !== 'object' || data === null || !('perfMusic' in data)) return null
  const { perfMusic } = data
  return typeof perfMusic === 'boolean' ? perfMusic : null
}

// Banc d'essai du dessin (Dessine-moi, lot 1, outil cast-sender.html) : la TV rejoue un dessin enregistré
// en boucle, panneau de mesures affiché. true : canvas de la TV (TV_DRAW_SCALE) ; un nombre : son échelle
// (1, 1,5 ou 2).
export interface CastDrawBenchMessage {
  drawBench: boolean | number
}

export const DRAW_BENCH_SCALES: readonly number[] = [1, 1.5, 2]

// Échelle demandée, ou null (message ignoré, ou false : retour à l'attente).
export function readCastDrawBench(data: unknown): number | null {
  if (typeof data !== 'object' || data === null || !('drawBench' in data)) return null
  const { drawBench } = data
  if (drawBench === true) return TV_DRAW_SCALE
  return typeof drawBench === 'number' && DRAW_BENCH_SCALES.includes(drawBench) ? drawBench : null
}
