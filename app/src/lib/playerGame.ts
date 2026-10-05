import { computeRanks } from '@shared/ranking';
import type { Player, PlayerId, PlayerResult, PublicSession } from '@shared/types';

// Pourquoi une réponse n'a pas été enregistrée : trop tard (définitif) ou erreur réseau (réessai possible).
export type AnswerRefusal = 'tooLate' | 'failed';

// Réponse libre : texte saisi ; blind test « both » : titre dans value, artiste dans artist.
export interface FreeText {
  value: string;
  artist?: string;
}

// Réponse donnée : index d'une proposition (Choix multiples) ou texte saisi (Réponse libre).
export type GivenAnswer = number | FreeText;

export function isFreeText(given: GivenAnswer | null): given is FreeText {
  return typeof given === 'object' && given !== null;
}

// Réponse du joueur à la question courante, vue de son téléphone.
export type AnswerState =
  | { kind: 'idle' }
  // Appui fait, écriture en cours : boutons et champs déjà désactivés.
  | { kind: 'sending'; given: GivenAnswer }
  // given vaut null si la réponse a été envoyée avant un rechargement de la page et que l'appareil
  // ne l'a pas gardée : answeredBy dit qu'on a répondu, mais answers (lisible par l'hôte seul) ne dit pas quoi.
  | { kind: 'sent'; given: GivenAnswer | null }
  | { kind: 'refused'; given: GivenAnswer; reason: AnswerRefusal };

export const IDLE_ANSWER: AnswerState = { kind: 'idle' };

// La base fait foi : si answeredBy indique une réponse, elle est envoyée, quel que soit l'état local.
export function effectiveAnswer(session: PublicSession, uid: PlayerId, local: AnswerState): AnswerState {
  const hasAnswered = session.answeredBy?.[session.currentIndex]?.[uid] === true;
  if (!hasAnswered) return local;
  const given = local.kind === 'sending' || local.kind === 'sent' ? local.given : null;
  return { kind: 'sent', given };
}

// Résultat du joueur à la question révélée ; undefined s'il n'a pas répondu.
export function myResult(session: PublicSession, uid: PlayerId): PlayerResult | undefined {
  return session.reveal?.results?.[uid];
}

// partial : blind test « both » à moitié juste (titre ou artiste).
export type RevealOutcome = 'correct' | 'partial' | 'wrong' | 'noAnswer';

export function revealOutcome(result: PlayerResult | undefined): RevealOutcome {
  if (!result) return 'noAnswer';
  if (result.correct) return 'correct';
  return result.partial ? 'partial' : 'wrong';
}

// Rang avant la question révélée : scores actuels moins les points qu'elle a rapportés,
// classés avec la même règle d'égalités que l'hôte (shared/ranking). Aucun champ en plus.
export function previousRank(session: PublicSession, uid: PlayerId): number | undefined {
  const results = session.reveal?.results ?? {};
  const previousScores = Object.fromEntries(
    Object.entries(session.players).map(([id, player]) => [id, (player.score ?? 0) - (results[id]?.points ?? 0)]),
  );
  return computeRanks(previousScores)[uid];
}

// Position de la bonne réponse parmi les propositions (pour sa lettre et sa couleur).
export function correctChoiceIndex(session: PublicSession): number | undefined {
  const index = session.currentQuestion?.options?.indexOf(session.reveal?.correctAnswer ?? '');
  return index === undefined || index < 0 ? undefined : index;
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

