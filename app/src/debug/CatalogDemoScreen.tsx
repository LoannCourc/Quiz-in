import { DEFAULT_SESSION_SETTINGS } from '@shared/constants';
import { GENRE_ICONS, ICON_THEMES, themeIconOf, type GenreIconName, type QuizIconName } from '@shared/themeIcons';
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
// « Choisir ce quiz » revient au catalogue sans créer de partie. /debug/catalog?icons=1 (ou icons=genres) : icônes de
// thème de 18 à 64 px, sur la couleur de leur pastille, puis icônes des genres de blind test.
export default function CatalogDemoScreen() {
  const { quiz: quizId, settings: openSettings, icons } = useLocalSearchParams<{ quiz?: string; settings?: string; icons?: string }>();
  const [settings, setSettings] = useState<SessionSettings>(DEFAULT_SESSION_SETTINGS);
  const quiz = DEMO_CATALOG.find((entry) => entry.id === quizId);

  if (icons === '1' || icons === 'genres') return <ThemeIconGallery onlyGenres={icons === 'genres'} />;
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

// Genres de blind test : couleur de la pastille Musique (les puces restent sur les thèmes).
const GALLERY_ROWS: { label: string; name: QuizIconName; color: string }[] = [
  ...ICON_THEMES.map((theme) => ({ label: theme, name: themeIconOf(theme), color: AppColors.themeChips[themeIconOf(theme)] })),
  ...GENRE_ICONS.map((name) => ({ label: name, name, color: AppColors.themeChips.note })),
];

function ThemeIconGallery({ onlyGenres }: { onlyGenres: boolean }) {
  return (
    <Screen>
      {GALLERY_ROWS.filter((row) => !onlyGenres || GENRE_ICONS.includes(row.name as GenreIconName)).map(({ label, name, color }) => (
        <View key={label} style={styles.galleryRow}>
          {GALLERY_SIZES.map((size) => (
            <View key={size} style={[styles.galleryTile, { backgroundColor: color, padding: size / 4 }]}>
              <ThemeIcon name={name} size={size} />
            </View>
          ))}
          <Text style={styles.galleryLabel}>{label}</Text>
        </View>
      ))}
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
