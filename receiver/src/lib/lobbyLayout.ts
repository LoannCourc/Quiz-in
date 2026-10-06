// Salon de la TV : le QR code et le code restent fixes, les joueurs s'adaptent à la place restante.
// Densité selon le nombre de joueurs affichés (connectés ou non) : avatars, pseudos et colonnes plus
// petits quand ils sont nombreux, pour que les 20 tiennent sans rien couper (pseudos de 12 caractères).
export type LobbyDensity = 'roomy' | 'dense' | 'packed'

const ROOMY_MAX = 8
const DENSE_MAX = 12

export function lobbyDensity(playerCount: number): LobbyDensity {
  if (playerCount <= ROOMY_MAX) return 'roomy'
  return playerCount <= DENSE_MAX ? 'dense' : 'packed'
}
