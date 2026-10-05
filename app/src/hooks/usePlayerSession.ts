import type { GameStatus, PlayerId, PublicSession } from '@shared/types';
import { onValue, ref, type Unsubscribe } from 'firebase/database';
import { useEffect, useState } from 'react';

import { toErrorMessage } from '@/lib/errors';
import { db, ensureSignedIn } from '@/lib/firebase';
import type { LobbyPlayers } from '@/lib/joinGame';

export type PlayerSessionState =
  | { kind: 'loading' }
  // wasRemoved : la partie existait puis a été supprimée (l'hôte a quitté).
  | { kind: 'notFound'; wasRemoved: boolean }
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
  'questionCount',
  'phaseStartedAt',
  'phaseEndsAt',
  'pausedFrom',
  'remainingMs',
  'hostLeftAt',
  'currentQuestion',
  'reveal',
  'players',
  'answeredBy',
  // Groupe : classement des équipes et points d'équipe de chaque question (règles à déployer avant).
  'teams',
  'teamPoints',
] as const satisfies readonly (keyof PublicSession)[];

type PublicField = (typeof PUBLIC_FIELDS)[number];

// Au-delà, on remplace l'écran de chargement par un message d'erreur.
const LOADING_TIMEOUT_MS = 10_000;
type FieldValues = Partial<Record<PublicField, unknown>>;

function toState(uid: PlayerId, values: FieldValues, received: Set<PublicField>): PlayerSessionState {
  // On attend la première valeur de chaque champ pour ne pas afficher une session incomplète.
  if (received.size < PUBLIC_FIELDS.length) return { kind: 'loading' };
  // status est toujours écrit par l'hôte : s'il manque, la partie n'existe pas.
  if (values.status == null) return { kind: 'notFound', wasRemoved: false };
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
    // Une fois en erreur, on y reste : les champs reçus ensuite ne doivent pas remettre
    // l'écran en chargement (c'est ce qui masquait un refus de lecture).
    let hasFailed = false;
    // Vrai dès que la partie a été vue : sa disparition ensuite signifie « supprimée par l'hôte ».
    let hasSeenGame = false;
    const values: FieldValues = {};
    const received = new Set<PublicField>();

    const fail = (detail: string, error?: unknown) => {
      if (!isActive || hasFailed) return;
      hasFailed = true;
      clearTimeout(timeoutId);
      console.error(`[join] Impossible de rejoindre la partie ${code} : ${detail}`, error ?? '');
      setState({ kind: 'error', detail });
    };

    const timeoutId = setTimeout(() => {
      const missing = PUBLIC_FIELDS.filter((field) => !received.has(field));
      fail(`délai de ${LOADING_TIMEOUT_MS / 1000} s dépassé, champs sans réponse : ${missing.join(', ') || 'aucun'}`);
    }, LOADING_TIMEOUT_MS);

    ensureSignedIn()
      .then((user) => {
        if (!isActive) return;
        unsubscribers = PUBLIC_FIELDS.map((field) =>
          onValue(
            ref(db, `sessions/${code}/${field}`),
            (snapshot) => {
              if (hasFailed) return;
              values[field] = snapshot.val() ?? undefined;
              received.add(field);
              const state = toState(user.uid, values, received);
              if (state.kind === 'ready') hasSeenGame = true;
              const next = state.kind === 'notFound' ? { ...state, wasRemoved: hasSeenGame } : state;
              if (next.kind !== 'loading') clearTimeout(timeoutId);
              setState(next);
            },
            (error) => fail(`lecture refusée : ${field} (${toErrorMessage(error)})`, error),
          ),
        );
      })
      .catch((error: unknown) => fail(`connexion anonyme échouée (${toErrorMessage(error)})`, error));

    return () => {
      isActive = false;
      clearTimeout(timeoutId);
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [code]);

  return state;
}
