import { QUESTION_DURATION_S, REVEAL_DURATION_S, SCORES_DURATION_S, STARTING_DURATION_S } from '@shared/constants';
import type { Player, PlayerId, PublicQuestion, PublicSession, Reveal } from '@shared/types';

import { IDLE_ANSWER, type AnswerState } from '@/lib/playerGame';

// Données factices de l'écran /debug/player (développement uniquement), du même type que la
// vraie session : les écrans testés dans la démo sont exactement ceux de la partie.

export const DEMO_UID: PlayerId = 'me';

export type ScenarioId =
  | 'starting'
  | 'questionShort'
  | 'questionLong'
  | 'questionUrgent'
  | 'answerSent'
  | 'answerRefused'
  | 'revealCorrect'
  | 'revealWrong'
  | 'revealNoAnswer'
  | 'scores'
  | 'paused'
  | 'ended';

export const SCENARIO_LABELS: Record<ScenarioId, string> = {
  starting: 'Démarrage',
  questionShort: 'Question courte',
  questionLong: 'Question longue',
  questionUrgent: 'Chrono presque fini',
  answerSent: 'Réponse envoyée',
  answerRefused: 'Réponse refusée',
  revealCorrect: 'Bonne réponse',
  revealWrong: 'Mauvaise réponse',
  revealNoAnswer: 'Pas de réponse',
  scores: 'Classement',
  paused: 'Pause',
  ended: 'Fin',
};

export interface Scenario {
  session: PublicSession;
  answer: AnswerState;
}

// Égalités (deux 2e, deux 4e) et « moi » hors du top 5, pour tester l'ajout en fin de liste.
const PLAYERS: Record<PlayerId, Player> = {
  a: { name: 'Léa', avatar: '🦊', score: 480, rank: 1, connected: true },
  b: { name: 'Hugo', avatar: '🐼', score: 350, rank: 2, connected: true },
  c: { name: 'Mamie Jo', avatar: '🦉', score: 350, rank: 2, connected: true },
  d: { name: 'Tom', avatar: '🐻', score: 200, rank: 4, connected: true },
  e: { name: 'Inès', avatar: '🐱', score: 200, rank: 4, connected: false },
  [DEMO_UID]: { name: 'Moi', avatar: '🐸', score: 150, rank: 6, connected: true },
  g: { name: 'Papa', avatar: '🐶', score: 0, rank: 7, connected: true },
};

const SHORT_QUESTION: PublicQuestion = {
  text: 'Quelle planète est la plus proche du Soleil ?',
  options: ['Mars', 'Mercure', 'Vénus', 'La Terre'],
  difficulty: 1,
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

const REVEAL: Reveal = {
  correctAnswer: 'Mercure',
  explanation: 'Mercure orbite à environ 58 millions de km du Soleil.',
  stats: { choiceCounts: [1, 4, 1, 0] },
  results: {
    a: { correct: true, points: 180 },
    [DEMO_UID]: { correct: true, points: 150 },
  },
};

function baseSession(now: number): PublicSession {
  return {
    hostUid: 'a',
    quizId: 'demo',
    status: 'lobby',
    settings: { answerMode: 'choice', speedBonus: true, control: false, teams: false },
    currentIndex: 2,
    phaseStartedAt: now,
    phaseEndsAt: 0,
    players: PLAYERS,
  };
}

// Phase démarrée maintenant (ou il y a elapsedS secondes) et durant durationS secondes.
function phase(now: number, durationS: number, elapsedS = 0) {
  const phaseStartedAt = now - elapsedS * 1000;
  return { phaseStartedAt, phaseEndsAt: phaseStartedAt + durationS * 1000 };
}

function questionScenario(now: number, question: PublicQuestion, elapsedS = 0): PublicSession {
  return { ...baseSession(now), status: 'question', currentQuestion: question, ...phase(now, question.timeLimit, elapsedS) };
}

function revealScenario(now: number, results: Reveal['results']): PublicSession {
  return {
    ...baseSession(now),
    status: 'reveal',
    currentQuestion: SHORT_QUESTION,
    reveal: { ...REVEAL, results },
    ...phase(now, REVEAL_DURATION_S.choice),
  };
}

// Construit le scénario au moment où on le choisit, pour que les chronos partent de « maintenant ».
export function buildScenario(id: ScenarioId, now: number): Scenario {
  const idle = (session: PublicSession): Scenario => ({ session, answer: IDLE_ANSWER });
  const { [DEMO_UID]: _mine, ...othersResults } = REVEAL.results ?? {};

  switch (id) {
    case 'starting':
      return idle({ ...baseSession(now), status: 'starting', currentIndex: 0, ...phase(now, STARTING_DURATION_S) });
    case 'questionShort':
      return idle(questionScenario(now, SHORT_QUESTION));
    case 'questionLong':
      return idle(questionScenario(now, LONG_QUESTION));
    case 'questionUrgent':
      return idle(questionScenario(now, SHORT_QUESTION, SHORT_QUESTION.timeLimit - 4));
    case 'answerSent':
      return { session: questionScenario(now, SHORT_QUESTION, 5), answer: { kind: 'sent', choice: 1 } };
    case 'answerRefused':
      return {
        session: questionScenario(now, SHORT_QUESTION, SHORT_QUESTION.timeLimit),
        answer: { kind: 'refused', choice: 2, reason: 'tooLate' },
      };
    case 'revealCorrect':
      return idle(revealScenario(now, REVEAL.results));
    case 'revealWrong':
      return idle(revealScenario(now, { ...othersResults, [DEMO_UID]: { correct: false, points: 0 } }));
    case 'revealNoAnswer':
      return idle(revealScenario(now, othersResults));
    case 'scores':
      return idle({ ...baseSession(now), status: 'scores', reveal: REVEAL, ...phase(now, SCORES_DURATION_S) });
    case 'paused':
      return idle({ ...baseSession(now), status: 'paused', pausedFrom: 'question', remainingMs: 12_000 });
    case 'ended':
      return idle({ ...baseSession(now), status: 'ended' });
  }
}
