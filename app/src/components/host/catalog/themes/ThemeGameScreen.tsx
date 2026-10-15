import { DEFAULT_SESSION_SETTINGS } from '@shared/constants';
import { areSettingsCompatible, settingsForGameType } from '@shared/quizCatalog';
import { withPool } from '@shared/questionPool';
import type { QuizEntry } from '@shared/quizValidation';
import type { QuizAudience, SessionSettings, SoundSettings } from '@shared/types';
import { useState } from 'react';

import { useSoundPreferences } from '@/hooks/useSoundPreferences';
import { useThemeGameDraw } from '@/hooks/useThemeGameDraw';
import type { ThemeQuestionSource } from '@/lib/themeGameDraw';

import { ThemeGameDetails } from './ThemeGameDetails';

interface ThemeGameScreenProps {
  // Fiches du catalogue (déjà validées) ; themes et count : choix vérifiés par la route.
  entries: QuizEntry[];
  themes: string[];
  count: number;
  source: ThemeQuestionSource;
  // Crée la partie (ou change le jeu du salon) avec les questions tirées sur la fiche.
  start: (quizId: string, settings: SessionSettings, sound: SoundSettings, questionRefs: readonly string[]) => void;
  isCreating: boolean;
  error?: string | null;
  onModify?: () => void;
}

// Public de la partie : celui de tous ses quiz s'il est commun, sinon tout public.
function poolAudience(quizzes: readonly QuizEntry[]): QuizAudience {
  const audiences = new Set(quizzes.map((quiz) => quiz.audience));
  return audiences.size === 1 ? quizzes[0].audience : 'all';
}

// Fiche d'une partie tirée dans des thèmes du Quiz : tirage sur la fiche (useThemeGameDraw), réglages,
// puis création avec ces questions (questionRefs écrit avec la partie).
export function ThemeGameScreen({ entries, themes, count, source, start, isCreating, error, onModify }: ThemeGameScreenProps) {
  const [chosenSettings, setSettings] = useState<SessionSettings>(DEFAULT_SESSION_SETTINGS);
  const [sound, setSound] = useSoundPreferences();
  const draw = useThemeGameDraw(source, entries, themes, count);
  const settings = withPool(settingsForGameType(chosenSettings, 'quiz'), { kind: 'themes', themes }, count);
  const quizzes = draw.kind === 'ready' ? draw.draw.quizzes : [];

  function create() {
    if (draw.kind !== 'ready' || draw.draw.quizzes.length === 0 || !areSettingsCompatible(settings)) return;
    // quizId : le premier quiz des thèmes (type du jeu pour la TV et les joueurs ; les questions viennent du tirage).
    start(draw.draw.quizzes[0].id, settings, sound, draw.draw.refs);
  }

  return (
    <ThemeGameDetails
      themes={themes}
      count={count}
      draw={draw}
      audience={poolAudience(quizzes)}
      settings={settings}
      onSettingsChange={setSettings}
      sound={sound}
      onSoundChange={setSound}
      onCreate={create}
      isCreating={isCreating}
      error={error}
      onModify={onModify}
    />
  );
}
