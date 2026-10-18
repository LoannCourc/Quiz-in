import { hostScreenFailure } from '@shared/hostEngine';
import type { Session } from '@shared/types';
import { useEffect, useState } from 'react';

import type { GameUnavailableKind } from '@/components/ui/GameUnavailable';
import { strings } from '@/constants/strings';
import { ensureSignedIn } from '@/lib/firebase';
import { readHostedGame, READ_TIMEOUT_MS, withTimeout } from '@/lib/readHostedGame';

import type { LiveValue } from './useLiveValue';

// Chargement de la partie de l'hôte : au-delà, « Connexion impossible » (jamais un chargement sans fin).
const HOST_LOADING_TIMEOUT_MS = 10_000;

export type HostScreenProblem = { kind: GameUnavailableKind; reference: string };

const texts = strings.gameUnavailable;

// Écran de l'hôte (« Reprendre la partie », lien) qui ne peut pas lire sa partie. null : rien à signaler
// (chargement en cours, partie lue, ou partie supprimée pendant l'absence, déjà affichée à part).
// Lecture refusée : les champs publics disent si la partie est introuvable ou d'un autre hôte (« gone »)
// ou si c'est un doute (« connection » : réseau, refus passager au relancement).
export function useHostScreenProblem(code: string, live: LiveValue<Session>): HostScreenProblem | null {
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [refused, setRefused] = useState<HostScreenProblem | null>(null);
  const isLoading = live.kind === 'loading';
  const isRefused = live.kind === 'error';
  // Refus des règles, ou autre échec (connexion anonyme, réseau).
  const failure = live.kind === 'error' && /permission/i.test(live.detail) ? texts.readRefused : texts.networkError;

  useEffect(() => {
    if (!isLoading) return;
    const timer = setTimeout(() => setIsTimedOut(true), HOST_LOADING_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [isLoading]);

  useEffect(() => {
    if (!isRefused) return;
    let isActive = true;
    Promise.all([withTimeout(ensureSignedIn(), READ_TIMEOUT_MS), readHostedGame(code)])
      .then(([user, read]) => {
        if (!isActive) return;
        const kind = hostScreenFailure(read, user.uid);
        const cause = read.kind === 'missing' ? texts.missing : read.kind === 'found' && kind === 'gone' ? texts.otherHost : null;
        setRefused({ kind, reference: cause ? `${failure} · ${cause}` : failure });
      })
      .catch(() => {
        if (isActive) setRefused({ kind: 'connection', reference: failure });
      });
    return () => {
      isActive = false;
    };
  }, [code, isRefused, failure]);

  if (live.kind === 'loading') return isTimedOut ? { kind: 'connection', reference: texts.timeout(HOST_LOADING_TIMEOUT_MS / 1000) } : null;
  if (live.kind === 'error') return refused;
  if (live.value === null && !live.wasRemoved) return { kind: 'gone', reference: texts.missing };
  return null;
}
