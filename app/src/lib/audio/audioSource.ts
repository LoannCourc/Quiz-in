import type { AudioSourceId, MusicTrack } from '@shared/types';

import { deezerSource } from './deezerSource';

// Source audio interchangeable du blind test : seule l'app de l'hôte l'interroge, puis publie
// l'adresse obtenue dans la session (la TV ne connaît que cette adresse). Changer de source =
// écrire un nouvel AudioSource et l'ajouter à AUDIO_SOURCE_IMPLEMENTATIONS.

// Adresse temporaire d'un extrait et son heure d'expiration (horloge de l'appareil, en ms).
export interface ResolvedAudio {
  url: string;
  expiresAt: number;
}

export interface AudioSource {
  resolve(track: MusicTrack): Promise<ResolvedAudio>;
}

// Morceau introuvable, retiré ou sans extrait, ou source injoignable.
export class AudioUnavailableError extends Error {}

const AUDIO_SOURCE_IMPLEMENTATIONS: Record<AudioSourceId, AudioSource> = {
  deezer: deezerSource,
};

export function resolveAudio(track: MusicTrack): Promise<ResolvedAudio> {
  return AUDIO_SOURCE_IMPLEMENTATIONS[track.source].resolve(track);
}
