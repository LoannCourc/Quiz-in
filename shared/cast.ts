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
