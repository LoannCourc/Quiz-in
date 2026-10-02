import { SCORES_TOP_COUNT } from '@shared/constants';
import type { Player, PlayerId, PlayerResult, PublicSession } from '@shared/types';

// Pourquoi une réponse n'a pas été enregistrée : trop tard (définitif) ou erreur réseau (réessai possible).
export type AnswerRefusal = 'tooLate' | 'failed';

// Réponse du joueur à la question courante, vue de son téléphone.
export type AnswerState =
  | { kind: 'idle' }
  // Appui fait, écriture en cours : boutons déjà désactivés.
  | { kind: 'sending'; choice: number }
  // choice vaut null si la réponse a été envoyée avant un rechargement de la page : answeredBy
  // dit qu'on a répondu, mais answers (lisible par l'hôte seul) ne dit pas quoi.
  | { kind: 'sent'; choice: number | null }
  | { kind: 'refused'; choice: number; reason: AnswerRefusal };

export const IDLE_ANSWER: AnswerState = { kind: 'idle' };

// La base fait foi : si answeredBy indique une réponse, elle est envoyée, quel que soit l'état local.
export function effectiveAnswer(session: PublicSession, uid: PlayerId, local: AnswerState): AnswerState {
  const hasAnswered = session.answeredBy?.[session.currentIndex]?.[uid] === true;
  if (!hasAnswered) return local;
  const choice = local.kind === 'sending' || local.kind === 'sent' ? local.choice : null;
  return { kind: 'sent', choice };
}

// Résultat du joueur à la question révélée ; undefined s'il n'a pas répondu.
export function myResult(session: PublicSession, uid: PlayerId): PlayerResult | undefined {
  return session.reveal?.results?.[uid];
}

export interface RankedPlayer extends Player {
  id: PlayerId;
}

// Rangs calculés par l'hôte (égalités comprises) ; ici, on trie seulement pour l'affichage.
export function rankedPlayers(players: Record<PlayerId, Player>): RankedPlayer[] {
  return Object.entries(players)
    .map(([id, player]) => ({ id, ...player, score: player.score ?? 0, rank: player.rank ?? 1 }))
    .sort((a, b) => a.rank - b.rank || a.name.localeCompare(b.name, 'fr'));
}

// Classement intermédiaire : les premiers, plus le joueur lui-même s'il n'en fait pas partie.
export function topWithMe(ranked: RankedPlayer[], uid: PlayerId): RankedPlayer[] {
  const top = ranked.slice(0, SCORES_TOP_COUNT);
  const me = ranked.find((player) => player.id === uid);
  return me && !top.includes(me) ? [...top, me] : top;
}
