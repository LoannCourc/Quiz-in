// Données de test du moteur de l'hôte, partagées par les tests unitaires et les tests des règles.
import type { Player, PlayerId, Question, Session } from '../../shared/types'

export const HOST = 'host-uid'
export const PLAYER = 'player-uid'
export const OTHER = 'other-uid'

export function makeQuestion(index: number, overrides: Partial<Question> = {}): Question {
  return {
    id: `q-${index}`,
    text: `Question numéro ${index + 1} ?`,
    options: [`Faux A${index}`, `Juste ${index}`, `Faux C${index}`, `Faux D${index}`],
    correctIndex: 1,
    acceptedAnswers: [`juste ${index}`],
    difficulty: 2,
    explanation: `Explication ${index}.`,
    ...overrides,
  }
}

export const QUESTIONS: Question[] = Array.from({ length: 12 }, (_, index) => makeQuestion(index))

export function player(name: string, overrides: Partial<Player> = {}): Player {
  return { name, avatar: '🦊', score: 0, rank: 1, connected: true, ...overrides }
}

export const PLAYERS: Record<PlayerId, Player> = {
  [HOST]: player('Hôte', { avatar: '🐸' }),
  [PLAYER]: player('Léa'),
  [OTHER]: player('Tom', { avatar: '🐼' }),
}

// Session complète telle que l'hôte la lit (lobby par défaut).
export function makeSession(overrides: Partial<Session> = {}): Session {
  return {
    hostUid: HOST,
    quizId: 'quiz-1',
    status: 'lobby',
    settings: { answerMode: 'choice', speedBonus: true, control: false, teams: false },
    currentIndex: 0,
    phaseStartedAt: 1_000_000,
    phaseEndsAt: 0,
    players: PLAYERS,
    ...overrides,
  }
}
