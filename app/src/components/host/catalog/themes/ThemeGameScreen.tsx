import { DEFAULT_SESSION_SETTINGS } from '@shared/constants';
import { areSettingsCompatible, settingsForGameType } from '@shared/quizCatalog';
import { withPool } from '@shared/questionPool';
import type { QuizEntry } from '@shared/quizValidation';
import { themeStats } from '@shared/themeCatalog';
import type { QuizAudience, SessionSettings, SoundSettings } from '@shared/types';
import { useCallback, useMemo, useState } from 'react';

import { useSoundPreferences } from '@/hooks/useSoundPreferences';
import { useThemeGameDraw } from '@/hooks/useThemeGameDraw';
import type { ThemeQuestionSource } from '@/lib/themeGameDraw';

import { ThemeGameDetails } from './ThemeGameDetails';
import { ThemePickerView, type ThemeGameChoice } from './ThemePickerView';

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
  // Démo : « Ta partie » ouvert d'emblée.
  initialEditing?: boolean;
}

// Public de la partie : celui de tous ses quiz s'il est commun, sinon tout public.
function poolAudience(quizzes: readonly QuizEntry[]): QuizAudience {
  const audiences = new Set(quizzes.map((quiz) => quiz.audience));
  return audiences.size === 1 ? quizzes[0].audience : 'all';
}

// Fiche d'une partie tirée dans des thèmes du Quiz : tirage sur la fiche (useThemeGameDraw), réglages,
// puis création avec ces questions (questionRefs écrit avec la partie). « Modifier mon choix » affiche
// « Ta partie » à la place de la fiche ; VALIDER y revient avec le nouveau choix (nouveau tirage).
export function ThemeGameScreen({ entries, themes, count, source, start, isCreating, error, initialEditing = false }: ThemeGameScreenProps) {
  const [choice, setChoice] = useState<ThemeGameChoice>({ themes, count, levels: 'all' });
  const [isEditing, setIsEditing] = useState(initialEditing);
  const [chosenSettings, setSettings] = useState<SessionSettings>(DEFAULT_SESSION_SETTINGS);
  const [sound, setSound] = useSoundPreferences();
  const allThemes = useMemo(() => themeStats(entries, new Set()), [entries]);
  const draw = useThemeGameDraw(source, entries, choice.themes, choice.count, choice.levels);
  // Nombre réel de la partie : celui des questions tirées (moins que demandé s'il en manque).
  const questionCount = draw.kind === 'ready' ? draw.draw.refs.length : choice.count;
  const levels = choice.levels === 'all' ? undefined : choice.levels;
  const settings = withPool(settingsForGameType(chosenSettings, 'quiz'), { kind: 'themes', themes: choice.themes }, questionCount, levels);
  const quizzes = draw.kind === 'ready' ? draw.draw.quizzes : [];
  const closeEditor = useCallback(() => setIsEditing(false), []);

  function create() {
    if (draw.kind !== 'ready' || draw.draw.refs.length === 0 || !areSettingsCompatible(settings)) return;
    // quizId : le premier quiz des thèmes (type du jeu pour la TV et les joueurs ; les questions viennent du tirage).
    start(draw.draw.quizzes[0].id, settings, sound, draw.draw.refs);
  }

  if (isEditing) {
    return (
      <ThemePickerView
        themes={allThemes}
        entries={entries}
        initial={choice}
        onCancel={closeEditor}
        onValidate={(next) => {
          setChoice(next);
          setIsEditing(false);
        }}
      />
    );
  }

  return (
    <ThemeGameDetails
      themes={choice.themes}
      count={choice.count}
      draw={draw}
      audience={poolAudience(quizzes)}
      settings={settings}
      onSettingsChange={setSettings}
      sound={sound}
      onSoundChange={setSound}
      onCreate={create}
      isCreating={isCreating}
      error={error}
      onModify={() => setIsEditing(true)}
    />
  );
}
