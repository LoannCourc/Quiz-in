import { DEFAULT_SESSION_SETTINGS } from '@shared/constants';
import { DRAW_QUIZ_ID, DRAW_QUIZ_SUMMARY } from '@shared/drawGame';
import { settingsForGameType } from '@shared/quizCatalog';
import { GENRE_ICONS, ICON_THEMES, themeIconOf, type GenreIconName, type QuizIconName } from '@shared/themeIcons';
import { DEFAULT_SOUND_SETTINGS } from '@shared/sound';
import type { SessionSettings, SoundSettings } from '@shared/types';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { CatalogView } from '@/components/host/catalog/CatalogView';
import { DrawCategoryPicker } from '@/components/host/catalog/DrawCategoryPicker';
import { HomeView } from '@/components/host/home/HomeView';
import { QuizDetails } from '@/components/host/catalog/QuizDetails';
import { Screen } from '@/components/ui/Screen';
import { ThemeIcon } from '@/components/ui/ThemeIcon';
import { AppColors, AppFonts } from '@/constants/appTheme';
import type { GameType } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

import { DEMO_CATALOG } from './demoCatalog';

// Dessine-moi : fiche locale, comme dans le vrai catalogue.
const DEMO_ENTRIES = [...DEMO_CATALOG, { id: DRAW_QUIZ_ID, ...DRAW_QUIZ_SUMMARY }];

// Démo de l'accueil, du catalogue et des fiches avec des quiz fictifs (développement uniquement).
// /debug/catalog : accueil (tuiles des jeux) ; &game=quiz|blindTest|bluff|draw : catalogue de ce jeu ;
// &blindtest=0 : tuile Blind test « Bientôt » ; &draw=0 : tuile Dessine-moi « Bientôt ». /debug/catalog?quiz=<id> ouvre une fiche (&settings=1 : feuille des réglages ouverte ; &categories=animal,sport : Dessine-moi) ;
// « Choisir ce quiz » revient au catalogue sans créer de partie. /debug/catalog?icons=1 (ou icons=genres) : icônes de
// thème de 18 à 64 px, sur la couleur de leur pastille, puis icônes des genres de blind test.
export default function CatalogDemoScreen() {
  const { quiz: quizId, settings: openSettings, icons, game, blindtest, draw, categories, played: playedParam } = useLocalSearchParams<{
    quiz?: string;
    settings?: string;
    icons?: string;
    game?: GameType;
    blindtest?: string;
    draw?: string;
    categories?: string;
    // &played=id1,id2 : quiz « déjà faits » (lot E).
    played?: string;
  }>();
  const played = new Set(playedParam ? playedParam.split(',') : []);
  const [settings, setSettings] = useState<SessionSettings>(DEFAULT_SESSION_SETTINGS);
  const [sound, setSound] = useState<SoundSettings>(DEFAULT_SOUND_SETTINGS);
  const quiz = DEMO_ENTRIES.find((entry) => entry.id === quizId);

  if (icons === '1' || icons === 'genres') return <ThemeIconGallery onlyGenres={icons === 'genres'} />;
  if (quiz) {
    return (
      <QuizDetails
        quiz={quiz}
        settings={settingsForGameType(categories ? { ...settings, drawCategories: categories.split(',') } : settings, quiz.gameType)}
        onSettingsChange={setSettings}
        sound={sound}
        onSoundChange={setSound}
        onChoose={() => router.back()}
        initialSettingsOpen={openSettings === '1'}
        isPlayed={played.has(quiz.id)}
      />
    );
  }
  // Dessine-moi (maquette D1) : choix des catégories, comme la vraie route.
  if (game === 'draw') {
    return (
      <DrawCategoryPicker
        onBack={() => router.setParams({ game: undefined })}
        onContinue={(ids) =>
          router.push({ pathname: '/debug/catalog', params: ids.length > 0 ? { quiz: DRAW_QUIZ_ID, categories: ids.join(',') } : { quiz: DRAW_QUIZ_ID } })
        }
      />
    );
  }
  return (
    <Screen>
      {game ? (
        <CatalogView
          entries={DEMO_ENTRIES}
          gameType={game}
          onOpenQuiz={(id) => router.push({ pathname: '/debug/catalog', params: { quiz: id } })}
          onBack={() => router.setParams({ game: undefined })}
          played={played}
        />
      ) : (
        <HomeView
          isBlindTestEnabled={blindtest !== '0'}
          isDrawEnabled={draw !== '0'}
          onOpenGame={(type) => router.setParams({ game: type })}
          onJoinWithCode={() => router.push('/join')}
        />
      )}
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
