// Musiques de la TV (spec 17) : manifeste des fichiers fournis par le développeur, déposés dans
// receiver/public/music/ (jamais versionnés : dépôt public, licences de tiers). Sans import : lu aussi
// par vite.config.ts (avertissements du build).

export type MusicTrackId = 'waiting' | 'game' | 'writing' | 'vote' | 'final'

export interface MusicTrack {
  file: string
  // Volume relatif, dans le canal musique (1 : volume du fichier).
  volume: number
  // Boucle à l'échantillon près, ou jouée une seule fois.
  loop: boolean
  // Démarre net, à une heure précise (arrivée sur l'écran de fin, après le roulement de tambour en
  // Suspense), au lieu d'un fondu enchaîné.
  cue?: boolean
  // Boucle sur le début du fichier seulement, jusqu'à cet instant (s) : la fin du fichier ne raccorde pas
  // avec son début. Raccord adouci par un court fondu enchaîné (shared/loopSeam.ts).
  loopEndS?: number
}

export const MUSIC_TRACKS: Record<MusicTrackId, MusicTrack> = {
  // Salon et tirage des équipes.
  waiting: { file: 'Waiting_sound.ogg', volume: 1, loop: true },
  // Question, révélation et classement d'un quiz à choix multiples (volume bas) ; révélation et classement d'un blind test.
  game: { file: 'Salon_music.ogg', volume: 0.5, loop: true },
  // Écriture du Bluff ; question, révélation et classement en saisie libre (Contrôle compris).
  writing: { file: 'Bluffecriture_sound.ogg', volume: 0.8, loop: true },
  // Vote, révélation et classement du Bluff.
  vote: { file: 'Bluffvote_sound.ogg', volume: 0.8, loop: true },
  // Écran de fin : démarre à l'arrivée du podium, puis boucle tant que l'écran est affiché. Le fichier
  // (16,7 s) répète deux phrases musicales de 4,17 s et finit par un fondu : boucle sur les 8,348 premières
  // secondes, là où la 3e phrase reprend la 1re (corrélation 0,95 au raccord).
  final: { file: 'Findepartie_sound.ogg', volume: 1, loop: true, cue: true, loopEndS: 8.348 },
}

export const MUSIC_TRACK_IDS = Object.keys(MUSIC_TRACKS) as readonly MusicTrackId[]

// Dossier des fichiers, relatif au site de la TV.
export const MUSIC_DIRECTORY = 'music/'

// Limites (spec 17) : au-delà, le build de la TV avertit sans bloquer.
export const MUSIC_FILE_MAX_BYTES = 1.5 * 1024 * 1024
export const MUSIC_TOTAL_MAX_BYTES = 5 * 1024 * 1024
