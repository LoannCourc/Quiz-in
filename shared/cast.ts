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
