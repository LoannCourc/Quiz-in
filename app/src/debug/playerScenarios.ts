import { QUESTION_DURATION_S, REVEAL_DURATION_S, SCORES_DURATION_S, STARTING_DURATION_S } from '@shared/constants';
import type { Player, PlayerId, PlayerResult, PublicQuestion, PublicSession, Reveal } from '@shared/types';

import { IDLE_ANSWER, type AnswerState, type FreeText } from '@/lib/playerGame';

// Données factices de l'écran /debug/player (développement uniquement), du même type que la
// vraie session : les écrans testés dans la démo sont exactement ceux de la partie.
// Les valeurs reprennent la maquette docs/design/plateau-mobile.png pour pouvoir comparer.

export const DEMO_UID: PlayerId = 'me';
export const DEMO_CODE = 'K7TM';

export type ScenarioId =
  | 'lobby'
  | 'starting'
  | 'questionShort'
  | 'questionLong'
  | 'questionUrgent'
  | 'questionMax'
  | 'questionOneLong'
  | 'answerSent'
  | 'answerRefused'
  | 'answerNetworkError'
  | 'revealCorrect'
  | 'revealWrong'
  | 'revealNoAnswer'
  | 'revealOneLong'
  | 'revealAwaiting'
  | 'scoresAwaiting'
  | 'revealSuspense'
  | 'freeQuestion'
  | 'freeQuestionTitle'
  | 'freeQuestionBoth'
  | 'freeSent'
  | 'freeRevealCorrect'
  | 'freeRevealWrong'
  | 'freeRevealPartial'
  | 'scores'
  | 'scoresAnnounce'
  | 'paused'
  | 'ended';

export const SCENARIO_LABELS: Record<ScenarioId, string> = {
  lobby: 'Lobby',
  starting: 'Démarrage',
  questionShort: 'Question courte',
  questionLong: 'Question longue',
  questionUrgent: 'Chrono presque fini',
  questionMax: 'Question maximale',
  questionOneLong: 'Une proposition de 80 caractères',
  answerSent: 'Réponse envoyée',
  answerRefused: 'Réponse refusée',
  answerNetworkError: 'Réseau coupé',
  revealCorrect: 'Bonne réponse',
  revealWrong: 'Mauvaise réponse',
  revealNoAnswer: 'Pas de réponse',
  revealOneLong: 'Révélation, une proposition de 80 caractères',
  revealAwaiting: 'Pas à pas : attente de l’hôte',
  scoresAwaiting: 'Pas à pas : classement en attente',
  revealSuspense: 'Suspense : révélation sans rang',
  freeQuestion: 'Réponse libre : question',
  freeQuestionTitle: 'Réponse libre : blind test, titre',
  freeQuestionBoth: 'Réponse libre : blind test, titre et artiste',
  freeSent: 'Réponse libre : réponse envoyée',
  freeRevealCorrect: 'Réponse libre : bonne réponse',
  freeRevealWrong: 'Réponse libre : mauvaise réponse',
  freeRevealPartial: 'Réponse libre : à moitié (titre et artiste)',
  scores: 'Classement',
  scoresAnnounce: 'Annonce question suivante',
  paused: 'Pause',
  ended: 'Fin',
};

export function isScenarioId(value: string | undefined): value is ScenarioId {
  return value !== undefined && value in SCENARIO_LABELS;
}

export interface Scenario {
  session: PublicSession;
  answer: AnswerState;
}

function player(name: string, avatar: string, score: number, rank: number, connected = true): Player {
  return { name, avatar, score, rank, connected };
}

// Scores après la question 3 : Léa 1re, moi 2e (1 242 → 1 410), égalité Noé/Sam au 5e rang.
const PLAYERS_AFTER: Record<PlayerId, Player> = {
  lea: player('Léa', '🦊', 1480, 1),
  [DEMO_UID]: player('Moi', '🐸', 1410, 2),
  tom: player('Tom', '🐙', 1295, 3),
  ines: player('Inès', '🐼', 1250, 4),
  noe: player('Noé', '🦖', 980, 5),
  sam: player('Sam', '🦄', 980, 5, false),
};

// Résultats de la question 3 : avant elle, j'étais 4e avec 1 242 points.
const RESULTS: Record<PlayerId, PlayerResult> = {
  lea: { correct: true, points: 100 },
  [DEMO_UID]: { correct: true, points: 168 },
  tom: { correct: false, points: 0 },
  noe: { correct: true, points: 120 },
  sam: { correct: false, points: 0 },
};

// Scores avant la révélation (pendant la question) : mes 1 242 points de la maquette.
const PLAYERS_BEFORE: Record<PlayerId, Player> = Object.fromEntries(
  Object.entries(PLAYERS_AFTER).map(([id, entry]) => [id, { ...entry, score: entry.score - (RESULTS[id]?.points ?? 0) }]),
);

const SHORT_QUESTION: PublicQuestion = {
  text: 'Quelle est la capitale de l’Australie ?',
  options: ['Sydney', 'Canberra', 'Melbourne', 'Perth'],
  difficulty: 2,
  timeLimit: QUESTION_DURATION_S.choice,
};

// Propositions de 60 caractères : elles doivent passer à la ligne sans déborder.
const LONG_QUESTION: PublicQuestion = {
  text: 'Quel texte fondateur a proclamé que « les hommes naissent et demeurent libres et égaux en droits » ?',
  options: [
    'La Déclaration des droits de l’homme et du citoyen de 1789 !',
    'Le traité de Versailles signé après la Grande Guerre de 1918',
    'L’édit de Nantes promulgué par le roi Henri IV en avril 1598',
    'La Constitution de la Cinquième République, adoptée en 1958.',
  ],
  difficulty: 3,
  timeLimit: QUESTION_DURATION_S.choice,
};

// Pire cas de la spec : énoncé de près de 140 caractères et propositions de 60 caractères.
const MAX_QUESTION: PublicQuestion = {
  ...LONG_QUESTION,
  text: 'Quel texte adopté par l’Assemblée nationale constituante le 26 août 1789 affirme que « les hommes naissent et demeurent libres et égaux » ?',
};

// Une proposition de 80 caractères parmi trois courtes : les quatre prennent la taille de la plus longue.
const ONE_LONG_QUESTION: PublicQuestion = {
  ...SHORT_QUESTION,
  options: ['Sydney', 'Canberra', 'Melbourne, grande ville du Victoria, capitale fédérale provisoire de 1901 à 1927', 'Perth'],
};

// Réponse libre (maquettes S1 et S2) : pas de propositions publiées ; blind test : ce qu'il faut écrire.
const FREE_SETTINGS = { answerMode: 'free' as const, speedBonus: true, control: false, teams: false };
const FREE_QUESTION: PublicQuestion = {
  text: 'Qui a perdu la bataille de Waterloo en 1815 ?',
  difficulty: 2,
  timeLimit: QUESTION_DURATION_S.free,
};
const blindTestQuestion = (ask: PublicQuestion['ask']): PublicQuestion => ({
  text: ask === 'both' ? 'Quel est ce morceau ?' : 'Quel est ce titre ?',
  difficulty: 1,
  timeLimit: QUESTION_DURATION_S.free,
  ask,
});

const REVEAL: Reveal = {
  correctAnswer: 'Canberra',
  explanation: 'Canberra a été construite pour départager Sydney et Melbourne.',
  stats: { choiceCounts: [2, 3, 1, 0] },
  results: RESULTS,
};

function baseSession(now: number, players: Record<PlayerId, Player>): PublicSession {
  return {
    hostUid: 'lea',
    quizId: 'demo',
    status: 'lobby',
    settings: { answerMode: 'choice', speedBonus: true, control: false, teams: false },
    currentIndex: 2,
    questionCount: 10,
    phaseStartedAt: now,
    phaseEndsAt: 0,
    players,
  };
}

// Phase démarrée maintenant (ou il y a elapsedS secondes) et durant durationS secondes.
function phase(now: number, durationS: number, elapsedS = 0) {
  const phaseStartedAt = now - elapsedS * 1000;
  return { phaseStartedAt, phaseEndsAt: phaseStartedAt + durationS * 1000 };
}

function questionScenario(now: number, question: PublicQuestion, elapsedS = 0): PublicSession {
  return {
    ...baseSession(now, PLAYERS_BEFORE),
    status: 'question',
    currentQuestion: question,
    ...phase(now, question.timeLimit, elapsedS),
  };
}

// Révélation où mon résultat est remplacé (ou retiré si myResult est undefined).
function revealScenario(now: number, myResult: PlayerResult | undefined): PublicSession {
  const { [DEMO_UID]: _mine, ...others } = RESULTS;
  const results = myResult ? { ...others, [DEMO_UID]: myResult } : others;
  const myScore = PLAYERS_BEFORE[DEMO_UID].score + (myResult?.points ?? 0);
  // Sans les 168 points, je reste 4e (derrière Léa, Tom et Inès).
  const players = myResult?.correct
    ? PLAYERS_AFTER
    : { ...PLAYERS_AFTER, [DEMO_UID]: { ...PLAYERS_AFTER[DEMO_UID], score: myScore, rank: 4 } };
  return {
    ...baseSession(now, players),
    status: 'reveal',
    currentQuestion: SHORT_QUESTION,
    reveal: { ...REVEAL, results },
    ...phase(now, REVEAL_DURATION_S.choice),
  };
}

function freeQuestionScenario(now: number, question: PublicQuestion): PublicSession {
  return { ...questionScenario(now, question, 8), settings: FREE_SETTINGS };
}

// Révélation en Réponse libre : mon résultat et ce que j'avais tapé (gardé sur l'appareil).
function freeRevealScenario(now: number, myResult: PlayerResult, given: FreeText, both = false): Scenario {
  const session = revealScenario(now, myResult);
  const reveal: Reveal = both
    ? {
        ...session.reveal!,
        correctAnswer: "(I Can't Get No) Satisfaction – The Rolling Stones",
        explanation: undefined,
        music: { title: "(I Can't Get No) Satisfaction", artist: 'The Rolling Stones', source: 'deezer' },
        stats: {},
      }
    : { ...session.reveal!, correctAnswer: 'Napoléon Ier', explanation: 'Napoléon est battu le 18 juin 1815.', stats: {} };
  return {
    session: { ...session, settings: FREE_SETTINGS, currentQuestion: both ? blindTestQuestion('both') : FREE_QUESTION, reveal },
    answer: { kind: 'sent', given },
  };
}

// Construit le scénario au moment où on le choisit, pour que les chronos partent de « maintenant ».
export function buildScenario(id: ScenarioId, now: number): Scenario {
  const idle = (session: PublicSession): Scenario => ({ session, answer: IDLE_ANSWER });

  switch (id) {
    case 'lobby':
      return idle(baseSession(now, PLAYERS_BEFORE));
    case 'starting':
      return idle({ ...baseSession(now, PLAYERS_BEFORE), status: 'starting', currentIndex: 0, ...phase(now, STARTING_DURATION_S) });
    case 'questionShort':
      return idle(questionScenario(now, SHORT_QUESTION, 8));
    case 'questionLong':
      return idle(questionScenario(now, LONG_QUESTION));
    case 'questionMax':
      return idle(questionScenario(now, MAX_QUESTION));
    case 'questionOneLong':
      return idle(questionScenario(now, ONE_LONG_QUESTION));
    case 'questionUrgent':
      return idle(questionScenario(now, SHORT_QUESTION, SHORT_QUESTION.timeLimit - 4));
    case 'answerSent':
      return {
        // 4 des 5 joueurs connectés ont répondu (Sam est déconnecté, Inès n'a pas encore répondu).
        session: { ...questionScenario(now, SHORT_QUESTION, 8), answeredBy: { 2: { lea: true, tom: true, noe: true, [DEMO_UID]: true } } },
        answer: { kind: 'sent', given: 1 },
      };
    case 'answerRefused':
      return {
        session: questionScenario(now, SHORT_QUESTION, SHORT_QUESTION.timeLimit),
        answer: { kind: 'refused', given: 2, reason: 'tooLate' },
      };
    case 'answerNetworkError':
      return {
        session: questionScenario(now, SHORT_QUESTION, 8),
        answer: { kind: 'refused', given: 0, reason: 'failed' },
      };
    case 'revealCorrect':
      return idle(revealScenario(now, RESULTS[DEMO_UID]));
    case 'revealAwaiting': {
      // Pas à pas : révélation sans fin programmée, en attente de « Question suivante ».
      const reveal = revealScenario(now, RESULTS[DEMO_UID]);
      return idle({ ...reveal, settings: { ...reveal.settings, stepByStep: true }, phaseEndsAt: 0 });
    }
    case 'revealOneLong':
      return idle({ ...revealScenario(now, RESULTS[DEMO_UID]), currentQuestion: ONE_LONG_QUESTION });
    case 'revealWrong':
      return idle(revealScenario(now, { correct: false, points: 0 }));
    case 'revealNoAnswer':
      return idle(revealScenario(now, undefined));
    case 'scores':
      return idle({ ...baseSession(now, PLAYERS_AFTER), status: 'scores', reveal: REVEAL, ...phase(now, SCORES_DURATION_S) });
    case 'freeQuestion':
      return idle(freeQuestionScenario(now, FREE_QUESTION));
    case 'freeQuestionTitle':
      return idle(freeQuestionScenario(now, blindTestQuestion('title')));
    case 'freeQuestionBoth':
      return idle(freeQuestionScenario(now, blindTestQuestion('both')));
    case 'freeSent':
      return {
        session: { ...freeQuestionScenario(now, FREE_QUESTION), answeredBy: { 2: { lea: true, tom: true, [DEMO_UID]: true } } },
        answer: { kind: 'sent', given: { value: 'Napoléon' } },
      };
    case 'freeRevealCorrect':
      return freeRevealScenario(now, { correct: true, points: 168 }, { value: 'Napoléon' });
    case 'freeRevealWrong':
      return freeRevealScenario(now, { correct: false, points: 0 }, { value: 'Wellington' });
    case 'freeRevealPartial':
      return freeRevealScenario(
        now,
        { correct: false, partial: true, parts: { title: true, artist: false }, points: 60 },
        { value: 'Satisfaction', artist: 'Rolling' },
        true,
      );
    case 'revealSuspense': {
      // Suspense : points gagnés, mais ni rang ni étape Classement.
      const reveal = revealScenario(now, RESULTS[DEMO_UID]);
      return idle({ ...reveal, settings: { ...reveal.settings, suspense: true } });
    }
    case 'scoresAwaiting': {
      // Pas à pas : classement sans fin programmée, en attente de « Question suivante ».
      const scores = baseSession(now, PLAYERS_AFTER);
      return idle({ ...scores, status: 'scores', reveal: REVEAL, settings: { ...scores.settings, stepByStep: true }, phaseStartedAt: now, phaseEndsAt: 0 });
    }
    case 'scoresAnnounce':
      // Dernières secondes du classement : annonce de la question suivante.
      return idle({
        ...baseSession(now, PLAYERS_AFTER),
        status: 'scores',
        reveal: REVEAL,
        ...phase(now, SCORES_DURATION_S, SCORES_DURATION_S - 1.5),
      });
    case 'paused':
      return idle({ ...baseSession(now, PLAYERS_BEFORE), status: 'paused', pausedFrom: 'question', remainingMs: 12_000 });
    case 'ended':
      return idle({ ...baseSession(now, PLAYERS_AFTER), status: 'ended' });
  }
}
