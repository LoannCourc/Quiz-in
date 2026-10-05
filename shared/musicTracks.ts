// Musiques de la TV (spec 17) : manifeste des fichiers fournis par le développeur, déposés dans
// receiver/public/music/ (jamais versionnés : dépôt public, licences de tiers). Sans import : lu aussi
// par vite.config.ts (avertissements du build).

export type MusicTrackId = 'waiting' | 'game' | 'writing' | 'vote' | 'ranking' | 'final'

export interface MusicTrack {
  file: string
  // Volume relatif, dans le canal musique (1 : volume du fichier).
  volume: number
  // Boucle à l'échantillon près, ou jingle joué une seule fois.
  loop: boolean
}

export const MUSIC_TRACKS: Record<MusicTrackId, MusicTrack> = {
  // Salon et tirage des équipes.
  waiting: { file: 'Waiting_sound.ogg', volume: 1, loop: true },
  // Question et révélation d'un quiz à choix multiples (volume bas).
  game: { file: 'Salon_music.ogg', volume: 0.5, loop: true },
  // Écriture du Bluff, question et révélation en saisie libre (Contrôle compris).
  writing: { file: 'Bluffecriture_sound.ogg', volume: 0.8, loop: true },
  // Vote et révélation du Bluff.
  vote: { file: 'Bluffvote_sound.ogg', volume: 0.8, loop: true },
  // Classement entre les questions : une fois.
  ranking: { file: 'Classement_sound.ogg', volume: 1, loop: false },
  // Classement final : une fois.
  final: { file: 'Findepartie_sound.ogg', volume: 1, loop: false },
}

export const MUSIC_TRACK_IDS = Object.keys(MUSIC_TRACKS) as readonly MusicTrackId[]

// Dossier des fichiers, relatif au site de la TV.
export const MUSIC_DIRECTORY = 'music/'

// Limites (spec 17) : au-delà, le build de la TV avertit sans bloquer.
export const MUSIC_FILE_MAX_BYTES = 1.5 * 1024 * 1024
export const MUSIC_TOTAL_MAX_BYTES = 5 * 1024 * 1024
