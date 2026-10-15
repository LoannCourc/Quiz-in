import { DEFAULT_SESSION_SETTINGS } from '@shared/constants';
import { DRAW_QUIZ_ID, DRAW_QUIZ_SUMMARY } from '@shared/drawGame';
import { settingsForGameType } from '@shared/quizCatalog';
import { themeGameChoice, themeStats } from '@shared/themeCatalog';
import { GENRE_ICONS, ICON_THEMES, themeIconOf, type GenreIconName, type QuizIconName } from '@shared/themeIcons';
import { DEFAULT_SOUND_SETTINGS } from '@shared/sound';
import type { SessionSettings, SoundSettings } from '@shared/types';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BlindTestCatalog } from '@/components/host/catalog/blindtest/BlindTestCatalog';
import { BluffCatalog } from '@/components/host/catalog/bluff/BluffCatalog';
import { CatalogView } from '@/components/host/catalog/CatalogView';
import { AllThemesView } from '@/components/host/catalog/themes/AllThemesView';
import { ThemeGameScreen } from '@/components/host/catalog/themes/ThemeGameScreen';
import { DrawCategoryPicker } from '@/components/host/catalog/DrawCategoryPicker';
import { GameIcon } from '@/components/host/home/GameIcon';
import { HomeView } from '@/components/host/home/HomeView';
import { QuizDetails } from '@/components/host/catalog/QuizDetails';
import { Screen } from '@/components/ui/Screen';
import { ThemeIcon } from '@/components/ui/ThemeIcon';
import { AppColors, AppFonts } from '@/constants/appTheme';
import type { GameType } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

import { DEMO_CATALOG, DEMO_THEME_CATALOG } from './demoCatalog';
import { demoThemeSource } from './demoThemeSource';

function openDemoPool(themes: string[], questionCount: number) {
  router.push({ pathname: '/debug/catalog', params: { pool: themes.join('|'), count: String(questionCount) } });
}

// Dessine-moi : fiche locale, comme dans le vrai catalogue.
const DEMO_ENTRIES = [...DEMO_CATALOG, ...DEMO_THEME_CATALOG, { id: DRAW_QUIZ_ID, ...DRAW_QUIZ_SUMMARY }];

// Démo de l'accueil, du catalogue et des fiches avec des quiz fictifs (développement uniquement).
// /debug/catalog : accueil (tuiles des jeux) ; &game=quiz|blindTest|bluff|draw : catalogue de ce jeu ;
// &blindtest=0 : tuile Blind test « Bientôt » ; &draw=0 : tuile Dessine-moi « Bientôt ». /debug/catalog?quiz=<id> ouvre une fiche (&settings=1 : feuille des réglages ouverte ; &categories=animal,sport : Dessine-moi) ;
// « Choisir ce quiz » revient au catalogue sans créer de partie. /debug/catalog?icons=1 (ou icons=genres) : icônes de
// thème de 18 à 64 px, sur la couleur de leur pastille, puis icônes des genres de blind test.
export default function CatalogDemoScreen() {
  const { quiz: quizId, settings: openSettings, icons, game, blindtest, draw, categories, played: playedParam, allThemes, pool, count } = useLocalSearchParams<{
    // ?pool=Histoire|Sport&count=20 : fiche d'une partie tirée dans ces thèmes (questions fictives).
    pool?: string;
    count?: string;
    // &allThemes=1 (avec game=quiz) : grille « Tout voir » des thèmes.
    allThemes?: string;
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
  const themeSource = useMemo(() => demoThemeSource(DEMO_ENTRIES), []);
  const [settings, setSettings] = useState<SessionSettings>(DEFAULT_SESSION_SETTINGS);
  const [sound, setSound] = useState<SoundSettings>(DEFAULT_SOUND_SETTINGS);
  const choice = pool ? themeGameChoice(DEMO_ENTRIES, pool.split('|'), Number(count)) : null;
  if (choice) {
    return <ThemeGameScreen entries={DEMO_ENTRIES} themes={choice.themes} count={choice.count} source={themeSource} start={() => router.back()} isCreating={false} />;
  }
  const quiz = DEMO_ENTRIES.find((entry) => entry.id === quizId);

  if (icons === '1' || icons === 'genres') return <ThemeIconGallery onlyGenres={icons === 'genres'} />;
  if (icons === 'question') return <QuestionMarkGallery />;
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
  if (game === 'bluff') {
    return <BluffCatalog entries={DEMO_ENTRIES} played={played} onBack={() => router.setParams({ game: undefined })} onContinue={() => undefined} />;
  }
  if (game === 'blindTest') {
    return (
      <BlindTestCatalog
        entries={DEMO_ENTRIES}
        played={played}
        onOpenQuiz={(id) => router.push({ pathname: '/debug/catalog', params: { quiz: id } })}
        onBack={() => router.setParams({ game: undefined })}
      />
    );
  }
  if (game === 'quiz' && allThemes === '1') {
    return <AllThemesView themes={themeStats(DEMO_ENTRIES, played)} onBack={() => router.setParams({ allThemes: undefined })} onPlay={openDemoPool} />;
  }
  // CatalogView porte son propre écran.
  if (game) {
    return (
      <CatalogView
        entries={DEMO_ENTRIES}
        gameType={game}
        onOpenQuiz={(id) => router.push({ pathname: '/debug/catalog', params: { quiz: id } })}
        onBack={() => router.setParams({ game: undefined })}
        played={played}
        themes={
          game === 'quiz'
            ? {
                onPlay: openDemoPool,
                onSeeAll: () => router.setParams({ allThemes: '1' }),
              }
            : undefined
        }
      />
    );
  }
  return (
    <Screen>
      <HomeView
        isBlindTestEnabled={blindtest !== '0'}
        isDrawEnabled={draw !== '0'}
        onOpenGame={(type) => router.setParams({ game: type })}
        onJoinWithCode={() => router.push('/join')}
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

// ?icons=question : le « ? » aux tailles de l'app, sur fond sombre et sur fond clair (affiches, puces), et tel
// qu'il est sur la tuile Quiz de l'accueil (disque encre, « ? » rose).
const QUESTION_SIZES = [18, 24, 32, 48, 64];
const QUESTION_BACKGROUNDS: { label: string; color: string }[] = [
  { label: 'Puce / affiche rose', color: AppColors.themeChips.question },
  { label: 'Fond clair (or)', color: AppColors.accent },
  { label: 'Fond sombre', color: AppColors.inkSurface },
];

function QuestionMarkGallery() {
  return (
    <Screen>
      {QUESTION_BACKGROUNDS.map(({ label, color }) => (
        <View key={label} style={styles.galleryRow}>
          {QUESTION_SIZES.map((size) => (
            <View key={size} style={[styles.galleryTile, { backgroundColor: color, padding: size / 4 }]}>
              <ThemeIcon name="question" size={size} />
            </View>
          ))}
          <Text style={styles.galleryLabel}>{label}</Text>
        </View>
      ))}
      <View style={styles.galleryRow}>
        {QUESTION_SIZES.map((size) => (
          <View key={size} style={[styles.galleryTile, { backgroundColor: AppColors.inkSurface, padding: size / 4, borderRadius: size }]}>
            <GameIcon game="quiz" size={size} color={AppColors.gameTiles.quiz} />
          </View>
        ))}
        <Text style={styles.galleryLabel}>Tuile Quiz</Text>
      </View>
    </Screen>
  );
}

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
