import type { GameStatus, PlayerId, PublicSession } from '@shared/types';
import { onValue, ref, type Unsubscribe } from 'firebase/database';
import { useEffect, useState } from 'react';

import { toErrorMessage } from '@/lib/errors';
import { db, ensureSignedIn } from '@/lib/firebase';
import type { LobbyPlayers } from '@/lib/joinGame';

export type PlayerSessionState =
  | { kind: 'loading' }
  | { kind: 'notFound' }
  | { kind: 'error'; detail: string }
  | { kind: 'ready'; uid: PlayerId; status: GameStatus; players: LobbyPlayers; session: PublicSession };

// Champs lisibles par un joueur : tous sauf answers (réservé à l'hôte). Les règles interdisent
// de lire sessions/{code} d'un bloc : on s'abonne à chaque champ séparément, comme la TV.
const PUBLIC_FIELDS = [
  'hostUid',
  'quizId',
  'status',
  'settings',
  'currentIndex',
  'phaseStartedAt',
  'phaseEndsAt',
  'pausedFrom',
  'remainingMs',
  'currentQuestion',
  'reveal',
  'players',
  'answeredBy',
] as const satisfies readonly (keyof PublicSession)[];

type PublicField = (typeof PUBLIC_FIELDS)[number];
type FieldValues = Partial<Record<PublicField, unknown>>;

function toState(uid: PlayerId, values: FieldValues, received: Set<PublicField>): PlayerSessionState {
  // On attend la première valeur de chaque champ pour ne pas afficher une session incomplète.
  if (received.size < PUBLIC_FIELDS.length) return { kind: 'loading' };
  // status est toujours écrit par l'hôte : s'il manque, la partie n'existe pas.
  if (values.status == null) return { kind: 'notFound' };
  // Forme garantie par les règles de validation de la base (database.rules.json).
  const raw = values as PublicSession;
  // La base ne stocke pas les objets vides : players et reveal.stats peuvent manquer.
  const players = raw.players ?? {};
  const reveal = raw.reveal && { ...raw.reveal, stats: raw.reveal.stats ?? {} };
  const session: PublicSession = { ...raw, players, reveal };
  return { kind: 'ready', uid, status: session.status, players, session };
}

// Connexion anonyme, puis abonnement en temps réel aux champs publics de la partie.
// Jamais la session d'un bloc (refusé par les règles), ni questions ni answers.
export function usePlayerSession(code: string): PlayerSessionState {
  const [state, setState] = useState<PlayerSessionState>({ kind: 'loading' });

  useEffect(() => {
    let unsubscribers: Unsubscribe[] = [];
    let isActive = true;
    const values: FieldValues = {};
    const received = new Set<PublicField>();
    const onError = (error: unknown) => setState({ kind: 'error', detail: toErrorMessage(error) });

    ensureSignedIn()
      .then((user) => {
        if (!isActive) return;
        unsubscribers = PUBLIC_FIELDS.map((field) =>
          onValue(
            ref(db, `sessions/${code}/${field}`),
            (snapshot) => {
              values[field] = snapshot.val() ?? undefined;
              received.add(field);
              setState(toState(user.uid, values, received));
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
