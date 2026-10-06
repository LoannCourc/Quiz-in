import { QUESTION_DURATION_S, REVEAL_DURATION_S } from '@shared/constants';
import type { BluffCheck, BluffEntry, PlayerId, PlayerResult, PublicQuestion, PublicSession, RevealedBluffChoice } from '@shared/types';

import type { PlayerBluff } from '@/lib/playerBluff';

// Bluff (spec 16) dans la démo /debug/player : l'état propre au joueur (sa proposition, le verdict de
// l'hôte, sa place parmi les choix, son vote), que useBluff lit dans la base pendant une vraie partie.

export type DemoBluff = Pick<PlayerBluff, 'entry' | 'check' | 'ownChoice' | 'send' | 'vote'>;

export const BLUFF_SCENARIO_LABELS = {
  bluffWrite: 'Bluff : écrire sa fausse réponse',
  bluffRefused: 'Bluff : proposition refusée (vraie réponse)',
  bluffChecking: 'Bluff : vérification par l’hôte',
  bluffSent: 'Bluff : proposition acceptée, attente',
  bluffExhausted: 'Bluff : plus aucun essai',
  bluffVote: 'Bluff : vote (sa proposition grisée)',
  bluffVoteMany: 'Bluff : vote, 12 choix de 100 caractères',
  bluffVoted: 'Bluff : vote envoyé',
  bluffRevealFound: 'Bluff : « Bien vu ! »',
  bluffRevealTrapped: 'Bluff : « Piégé ! », a piégé Tom',
  bluffRevealNoVote: 'Bluff : pas de vote',
} as const;

export type BluffScenarioId = keyof typeof BLUFF_SCENARIO_LABELS;

const IDLE: DemoBluff = { entry: null, check: null, ownChoice: null, send: { kind: 'idle' }, vote: { kind: 'idle' } };

const QUESTION_TEXT = 'Comment le roi Henri II est-il mort en 1559 ?';
const MY_BLUFF = 'Il a glissé dans l’escalier du Louvre en pleine nuit';
const REFUSED_BLUFF = 'Une lance dans l’œil pendant un tournoi';

// Choix du vote : la vraie réponse (B), un leurre (C) et les propositions des joueurs ; la mienne en D
// (« me » : DEMO_UID, écrit en toutes lettres pour éviter un import circulaire avec playerScenarios).
const CHOICES: readonly RevealedBluffChoice[] = [
  { text: 'Il s’est étouffé avec un noyau de cerise', kind: 'bluff', authors: ['tom'] },
  { text: 'Une lance brisée lors d’un tournoi lui a crevé l’œil', kind: 'truth' },
  { text: 'Une chute de cheval en pleine chasse au cerf', kind: 'decoy' },
  { text: MY_BLUFF, kind: 'bluff', authors: ['me'] },
  { text: 'Empoisonné par une pommade au mercure', kind: 'bluff', authors: ['lea', 'ines'] },
  { text: 'Une crise de fou rire pendant un banquet', kind: 'bluff', authors: ['noe'] },
];
const OWN_CHOICE = 3;

// Pire cas : 12 choix de 100 caractères (la liste défile avec la page).
const LONG_CHOICES: string[] = Array.from({ length: 12 }, (_, index) =>
  `Choix ${index + 1} : une phrase volontairement longue pour vérifier le passage à la ligne des cartes ici`.slice(0, 100),
);

const PUBLIC_QUESTION: PublicQuestion = { text: QUESTION_TEXT, difficulty: 2, timeLimit: QUESTION_DURATION_S.bluff };

function entry(text: string, submittedAt: number): BluffEntry {
  return { text, submittedAt };
}

function check(verdict: BluffCheck['verdict'], refusals: number, submittedAt: number): BluffCheck {
  return { verdict, refusals, submittedAt };
}

// Votes de la révélation : qui a voté pour quel choix (index), selon mon propre vote.
function revealChoices(myVote: number | null): RevealedBluffChoice[] {
  const votes: Record<PlayerId, number> = { lea: 1, noe: 1, ines: 0, tom: OWN_CHOICE };
  if (myVote !== null) votes.me = myVote;
  return CHOICES.map((choice, index) => {
    const voters = Object.keys(votes).filter((id) => votes[id] === index);
    return voters.length > 0 ? { ...choice, voters } : choice;
  });
}

// Mes points : 1 000 pour la vraie réponse, 500 par joueur piégé par ma proposition (Tom).
function myResult(myVote: number | null): PlayerResult {
  const isFound = myVote === 1;
  return { correct: isFound, points: (isFound ? 1000 : 0) + 500 };
}

interface BluffScenario {
  session: PublicSession;
  bluff: DemoBluff;
}

// base : session de la démo (joueurs, question 3 sur 10), passée en mode Bluff ici.
export function buildBluffScenario(id: BluffScenarioId, base: PublicSession, now: number): BluffScenario {
  const settings = { ...base.settings, answerMode: 'bluff' as const, speedBonus: false };
  const writing: PublicSession = {
    ...base,
    settings,
    status: 'question',
    currentQuestion: PUBLIC_QUESTION,
    phaseStartedAt: now - 12_000,
    phaseEndsAt: now - 12_000 + QUESTION_DURATION_S.bluff * 1000,
    bluffedBy: { 2: { lea: true, tom: true, noe: true } },
  };
  const voting = (choices: readonly string[]): PublicSession => ({
    ...writing,
    status: 'vote',
    currentQuestion: { ...PUBLIC_QUESTION, choices: [...choices] },
    phaseStartedAt: now - 5_000,
    // Vote sans minuteur.
    phaseEndsAt: 0,
    bluffedBy: { 2: { lea: true, tom: true, noe: true, ines: true, me: true } },
    votedBy: { 2: { lea: true, ines: true } },
  });
  const revealed = (myVote: number | null): PublicSession => {
    const choices = revealChoices(myVote);
    const truth = choices.find((choice) => choice.kind === 'truth')!;
    return {
      ...voting(CHOICES.map((choice) => choice.text)),
      status: 'reveal',
      reveal: {
        correctAnswer: truth.text,
        stats: { bluffChoices: choices },
        results: {
          lea: { correct: true, points: 1000 },
          noe: { correct: true, points: 1000 },
          tom: { correct: false, points: 1000 },
          ines: { correct: false, points: 0 },
          me: myResult(myVote),
        },
      },
      phaseStartedAt: now,
      phaseEndsAt: now + (REVEAL_DURATION_S.bluff + 2 * (choices.length - 1)) * 1000,
    };
  };
  const accepted: DemoBluff = { ...IDLE, entry: entry(MY_BLUFF, 2), check: check('ok', 1, 2) };

  switch (id) {
    case 'bluffWrite':
      return { session: writing, bluff: IDLE };
    case 'bluffRefused':
      return { session: writing, bluff: { ...IDLE, entry: entry(REFUSED_BLUFF, 1), check: check('truth', 1, 1) } };
    case 'bluffChecking':
      return { session: writing, bluff: { ...IDLE, entry: entry(MY_BLUFF, 2), check: check('truth', 1, 1) } };
    case 'bluffSent':
      return { session: { ...writing, bluffedBy: { 2: { lea: true, tom: true, noe: true, me: true } } }, bluff: accepted };
    case 'bluffExhausted':
      return { session: writing, bluff: { ...IDLE, entry: entry('Une lance', 3), check: check('truth', 3, 3) } };
    case 'bluffVote':
      return { session: voting(CHOICES.map((choice) => choice.text)), bluff: { ...accepted, ownChoice: OWN_CHOICE } };
    case 'bluffVoteMany':
      return { session: voting(LONG_CHOICES), bluff: { ...accepted, ownChoice: 5 } };
    case 'bluffVoted': {
      const session = voting(CHOICES.map((choice) => choice.text));
      return {
        session: { ...session, votedBy: { 2: { lea: true, ines: true, me: true } } },
        bluff: { ...accepted, ownChoice: OWN_CHOICE, vote: { kind: 'sent', choice: 0 } },
      };
    }
    case 'bluffRevealFound':
      return { session: revealed(1), bluff: accepted };
    case 'bluffRevealTrapped':
      return { session: revealed(0), bluff: accepted };
    case 'bluffRevealNoVote':
      return { session: revealed(null), bluff: accepted };
  }
}
