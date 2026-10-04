import { deezerPreviewExpiresAt } from '@shared/audioPlayback';
import type { MusicTrack } from '@shared/types';

import { AudioUnavailableError, type AudioSource } from './audioSource';

// Previews de 30 s de l'API publique Deezer (usage gratuit et non commercial, mention de Deezer).
// L'API n'autorise pas les appels depuis un navigateur (pas de CORS) : appelée depuis l'app native
// de l'hôte seulement. L'adresse renvoyée expire environ 15 min après l'appel.
const DEEZER_TRACK_URL = 'https://api.deezer.com/track/';
// Si l'adresse ne contient pas d'expiration lisible : durée prudente.
const FALLBACK_VALIDITY_MS = 10 * 60_000;

interface DeezerTrackResponse {
  readable?: boolean;
  preview?: string;
  error?: unknown;
}

export const deezerSource: AudioSource = {
  async resolve(track: MusicTrack) {
    let body: DeezerTrackResponse;
    try {
      const response = await fetch(`${DEEZER_TRACK_URL}${encodeURIComponent(track.id)}`);
      body = (await response.json()) as DeezerTrackResponse;
    } catch (error) {
      throw new AudioUnavailableError(`Deezer injoignable (${String(error)})`);
    }
    // L'API répond 200 même en cas d'erreur, avec un champ « error ».
    if (body.error || !body.readable || !body.preview?.startsWith('https://')) {
      throw new AudioUnavailableError(`Morceau Deezer ${track.id} sans extrait disponible`);
    }
    return { url: body.preview, expiresAt: deezerPreviewExpiresAt(body.preview) ?? Date.now() + FALLBACK_VALIDITY_MS };
  },
};
