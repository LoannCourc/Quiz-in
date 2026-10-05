import { DEFAULT_SESSION_SETTINGS } from '@shared/constants';
import { ICON_THEMES, themeIconOf } from '@shared/themeIcons';
import type { SessionSettings } from '@shared/types';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { CatalogView } from '@/components/host/catalog/CatalogView';
import { QuizDetails } from '@/components/host/catalog/QuizDetails';
import { Screen } from '@/components/ui/Screen';
import { ThemeIcon } from '@/components/ui/ThemeIcon';
import { AppColors, AppFonts } from '@/constants/appTheme';
import { Spacing } from '@/constants/theme';

import { DEMO_CATALOG } from './demoCatalog';

// Démo du catalogue et des fiches avec des quiz fictifs (développement uniquement).
// /debug/catalog?quiz=<id> ouvre une fiche (&settings=1 : feuille des réglages ouverte) ;
// « Choisir ce quiz » revient au catalogue sans créer de partie. /debug/catalog?icons=1 : icônes de
// thème de 18 à 64 px, sur la couleur de leur pastille.
export default function CatalogDemoScreen() {
  const { quiz: quizId, settings: openSettings, icons } = useLocalSearchParams<{ quiz?: string; settings?: string; icons?: string }>();
  const [settings, setSettings] = useState<SessionSettings>(DEFAULT_SESSION_SETTINGS);
  const quiz = DEMO_CATALOG.find((entry) => entry.id === quizId);

  if (icons === '1') return <ThemeIconGallery />;
  if (quiz) {
    return (
      <QuizDetails
        quiz={quiz}
        settings={settings}
        onSettingsChange={setSettings}
        onChoose={() => router.back()}
        initialSettingsOpen={openSettings === '1'}
      />
    );
  }
  return (
    <Screen>
      <CatalogView
        entries={DEMO_CATALOG}
        isBlindTestEnabled
        onOpenQuiz={(id) => router.push({ pathname: '/debug/catalog', params: { quiz: id } })}
      />
    </Screen>
  );
}

const GALLERY_SIZES = [18, 28, 44, 64];

function ThemeIconGallery() {
  return (
    <Screen>
      {ICON_THEMES.map((theme) => {
        const name = themeIconOf(theme);
        return (
          <View key={theme} style={styles.galleryRow}>
            {GALLERY_SIZES.map((size) => (
              <View key={size} style={[styles.galleryTile, { backgroundColor: AppColors.themeChips[name], padding: size / 4 }]}>
                <ThemeIcon name={name} size={size} />
              </View>
            ))}
            <Text style={styles.galleryLabel}>{theme}</Text>
          </View>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  galleryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  galleryTile: {
    borderRadius: 12,
  },
  galleryLabel: {
    flex: 1,
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: 12,
  },
});
