import type { GameStatus, PlayerId } from '@shared/types';
import { onValue, ref, type Unsubscribe } from 'firebase/database';
import { useEffect, useState } from 'react';

import { toErrorMessage } from '@/lib/errors';
import { db, ensureSignedIn } from '@/lib/firebase';
import type { LobbyPlayers } from '@/lib/joinGame';

export type PlayerSessionState =
  | { kind: 'loading' }
  | { kind: 'notFound' }
  | { kind: 'error'; detail: string }
  | { kind: 'ready'; uid: PlayerId; status: GameStatus; players: LobbyPlayers };

interface Fields {
  status?: GameStatus | null;
  players?: LobbyPlayers | null;
}

function toState(uid: PlayerId, fields: Fields): PlayerSessionState {
  if (fields.status === undefined || fields.players === undefined) return { kind: 'loading' };
  // status est toujours écrit par l'hôte : s'il manque, la partie n'existe pas.
  if (fields.status === null) return { kind: 'notFound' };
  // La base ne stocke pas les objets vides : players manque tant que personne n'a rejoint.
  return { kind: 'ready', uid, status: fields.status, players: fields.players ?? {} };
}

// Connexion anonyme, puis abonnement en temps réel aux seuls champs utiles au joueur.
// Jamais la session d'un bloc (refusé par les règles), ni questions ni answers.
export function usePlayerSession(code: string): PlayerSessionState {
  const [state, setState] = useState<PlayerSessionState>({ kind: 'loading' });

  useEffect(() => {
    let unsubscribers: Unsubscribe[] = [];
    let isActive = true;
    const fields: Fields = {};
    const onError = (error: unknown) => setState({ kind: 'error', detail: toErrorMessage(error) });

    ensureSignedIn()
      .then((user) => {
        if (!isActive) return;
        unsubscribers = (['status', 'players'] as const).map((field) =>
          onValue(
            ref(db, `sessions/${code}/${field}`),
            (snapshot) => {
              fields[field] = snapshot.val();
              setState(toState(user.uid, fields));
            },
            onError,
          ),
        );
      })
      .catch((error: unknown) => {
        if (isActive) onError(error);
      });

    return () => {
      isActive = false;
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [code]);

  return state;
}
