import { DEFAULT_SESSION_SETTINGS } from '@shared/constants';
import type { SessionSettings } from '@shared/types';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { CatalogView } from '@/components/host/catalog/CatalogView';
import { QuizDetails } from '@/components/host/catalog/QuizDetails';
import { Screen } from '@/components/ui/Screen';

import { DEMO_CATALOG } from './demoCatalog';

// Démo du catalogue et des fiches avec des quiz fictifs (développement uniquement).
// /debug/catalog?quiz=<id> ouvre une fiche ; « Choisir ce quiz » revient au catalogue sans créer de partie.
export default function CatalogDemoScreen() {
  const { quiz: quizId } = useLocalSearchParams<{ quiz?: string }>();
  const [settings, setSettings] = useState<SessionSettings>(DEFAULT_SESSION_SETTINGS);
  const quiz = DEMO_CATALOG.find((entry) => entry.id === quizId);

  if (quiz) {
    return <QuizDetails quiz={quiz} settings={settings} onSettingsChange={setSettings} onChoose={() => router.back()} />;
  }
  return (
    <Screen>
      <CatalogView
        entries={DEMO_CATALOG}
        onOpenQuiz={(id) => router.push({ pathname: '/debug/catalog', params: { quiz: id } })}
      />
    </Screen>
  );
}
