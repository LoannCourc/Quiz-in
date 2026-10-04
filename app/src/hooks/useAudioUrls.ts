import { AUDIO_URL_MIN_VALIDITY_MS, AUDIO_URL_REFRESH_INTERVAL_MS } from '@shared/constants';
import { selectGameQuestions, type AudioUrls } from '@shared/hostEngine';
import type { Question } from '@shared/types';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { resolveAudio, type ResolvedAudio } from '@/lib/audio/audioSource';

// none : pas de blind test (ou interrupteur coupé). loading : premières adresses en cours.
// ready : toutes les adresses sont là. missing : au moins un extrait introuvable ou source injoignable.
export type AudioUrlsStatus = 'none' | 'loading' | 'ready' | 'missing';

export interface GameAudioUrls {
  urls: AudioUrls;
  status: AudioUrlsStatus;
  // Nouvel essai immédiat des extraits manquants ou bientôt expirés.
  retry: () => void;
}

// Blind test, côté hôte : récupère auprès de la source audio l'adresse de chaque extrait de la partie,
// dès le salon, puis la renouvelle avant qu'elle expire (Deezer : environ 15 min). Toute adresse publiée
// garde ainsi au moins AUDIO_URL_MIN_VALIDITY_MS de validité, quelle que soit la durée des pauses.
export function useAudioUrls(questions: readonly Question[] | null, isEnabled: boolean): GameAudioUrls {
  const [resolved, setResolved] = useState<Record<string, ResolvedAudio>>({});
  const [failedIds, setFailedIds] = useState<readonly string[]>([]);
  const inFlight = useRef(new Set<string>());
  const tracks = useMemo(
    () => (isEnabled && questions ? selectGameQuestions(questions).filter((question) => question.music) : []),
    [questions, isEnabled],
  );

  // Demande une adresse pour chaque extrait absent ou qui expire bientôt (jamais deux fois en même temps).
  const refresh = useCallback(() => {
    const now = Date.now();
    for (const { id, music } of tracks) {
      const current = resolved[id];
      const isFresh = current !== undefined && current.expiresAt - now > AUDIO_URL_MIN_VALIDITY_MS;
      if (!music || isFresh || inFlight.current.has(id)) continue;
      inFlight.current.add(id);
      resolveAudio(music)
        .then((audio) => {
          setResolved((previous) => ({ ...previous, [id]: audio }));
          setFailedIds((previous) => previous.filter((failed) => failed !== id));
        })
        .catch((error: unknown) => {
          // L'ancienne adresse reste utilisable tant qu'elle n'a pas expiré.
          console.warn('[audio] Extrait indisponible', id, error);
          setFailedIds((previous) => (previous.includes(id) ? previous : [...previous, id]));
        })
        .finally(() => inFlight.current.delete(id));
    }
  }, [tracks, resolved]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, AUDIO_URL_REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refresh]);

  // Recalculé seulement quand une adresse change : la republier n'a lieu qu'à ce moment-là.
  const urls = useMemo(
    () => Object.fromEntries(Object.entries(resolved).map(([id, audio]) => [id, audio.url])) as AudioUrls,
    [resolved],
  );
  const isComplete = tracks.every((question) => urls[question.id] !== undefined);
  const status: AudioUrlsStatus =
    tracks.length === 0 ? 'none' : isComplete ? 'ready' : failedIds.length > 0 ? 'missing' : 'loading';

  return { urls, status, retry: refresh };
}
