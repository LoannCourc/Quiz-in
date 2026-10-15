import type { QuizEntry } from '@shared/quizValidation';
import type { LevelChoice } from '@shared/themePool';
import { useEffect, useState } from 'react';

import { toErrorMessage } from '@/lib/errors';
import { drawThemeGame, type ThemeGameDraw, type ThemeQuestionSource } from '@/lib/themeGameDraw';

export type ThemeGameDrawState = { kind: 'loading' } | { kind: 'error'; detail: string } | { kind: 'ready'; draw: ThemeGameDraw };

// Tirage de la fiche d'une partie tirée dans des thèmes, refait seulement quand le choix change (thèmes,
// nombre, niveaux) : un catalogue relu ne change pas les questions affichées. État étiqueté par le choix : jamais le
// tirage d'un choix précédent (« Modifier mon choix »).
export function useThemeGameDraw(
  source: ThemeQuestionSource,
  entries: readonly QuizEntry[],
  themes: readonly string[],
  count: number,
  levels: LevelChoice,
): ThemeGameDrawState {
  const key = JSON.stringify({ themes, count, levels });
  const [state, setState] = useState<{ key: string; value: ThemeGameDrawState }>({ key, value: { kind: 'loading' } });
  const hasEntries = entries.length > 0;

  useEffect(() => {
    if (!hasEntries) return;
    let isActive = true;
    const choice = JSON.parse(key) as { themes: string[]; count: number; levels: LevelChoice };
    drawThemeGame(source, entries, choice.themes, choice.count, choice.levels)
      .then((draw) => {
        if (isActive) setState({ key, value: { kind: 'ready', draw } });
      })
      .catch((error: unknown) => {
        if (isActive) setState({ key, value: { kind: 'error', detail: toErrorMessage(error) } });
      });
    return () => {
      isActive = false;
    };
    // entries : lu au moment du tirage seulement (un catalogue relu ne refait pas le tirage).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, hasEntries, source]);

  return state.key === key ? state.value : { kind: 'loading' };
}
