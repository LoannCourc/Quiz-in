import { playedQuizName } from '@shared/quizCatalog';
import { parseQuizSummary } from '@shared/quizValidation';
import type { SessionSettings } from '@shared/types';
import { useMemo } from 'react';

import { formatPlayedQuizName } from '@/lib/playedQuizName';

import { useLiveValue } from './useLiveValue';

// Quiz joué (« Électro des années 80 · Moyen »), lu dans sa fiche (quizzes/{quizId}, lisible par tous les
// connectés) ; null tant qu'elle n'est pas lue, et pour le Bluff, Dessine-moi ou une partie par thèmes.
export function usePlayedQuizName(quizId: string, settings: SessionSettings): string | null {
  const quiz = useLiveValue<unknown>(`quizzes/${quizId}`);
  return useMemo(() => {
    const summary = quiz.kind === 'ready' ? parseQuizSummary(quiz.value) : null;
    return formatPlayedQuizName(playedQuizName(summary, settings));
  }, [quiz, settings]);
}
