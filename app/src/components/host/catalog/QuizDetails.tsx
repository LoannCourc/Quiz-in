import { QUESTIONS_PER_GAME } from '@shared/constants';
import { difficultyLevel } from '@shared/quizCatalog';
import type { QuizSummary, SessionSettings } from '@shared/types';
import { useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { BigButton } from '@/components/ui/BigButton';
import { Screen } from '@/components/ui/Screen';
import { textStyles } from '@/components/ui/textStyles';
import { AppColors, AppFonts, AppSizes, DISPLAY_LINE_HEIGHT } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

import { GameSettingsCard } from './GameSettingsCard';
import { GameSettingsSheet } from './GameSettingsSheet';
import { QuizPoster } from './QuizPoster';

// Hauteur de la grande affiche : environ un quart de l'écran, pour que la fiche tienne sans défiler.
const POSTER_SCREEN_SHARE = 0.26;
const POSTER_MIN_HEIGHT = 140;
const POSTER_MAX_HEIGHT = 300;

interface QuizDetailsProps {
  quiz: QuizSummary;
  settings: SessionSettings;
  onSettingsChange: (settings: SessionSettings) => void;
  onChoose: () => void;
  isCreating?: boolean;
  error?: string | null;
  // Démo (/debug/catalog) : feuille des réglages déjà ouverte.
  initialSettingsOpen?: boolean;
}

function posterWidthFor(screenHeight: number): number {
  const height = Math.min(POSTER_MAX_HEIGHT, Math.max(POSTER_MIN_HEIGHT, screenHeight * POSTER_SCREEN_SHARE));
  return Math.round(height / AppSizes.posterRatio);
}

// Fiche d'un quiz (maquettes S2 et R2) : grande affiche, informations, puis « Choisir ce quiz » et la
// carte des réglages, fixés en bas de l'écran pour être atteints sans défiler. La carte ouvre la feuille.
export function QuizDetails({ quiz, settings, onSettingsChange, onChoose, isCreating = false, error, initialSettingsOpen = false }: QuizDetailsProps) {
  const { height } = useWindowDimensions();
  const [isSettingsOpen, setIsSettingsOpen] = useState(initialSettingsOpen);
  const level = difficultyLevel(quiz.difficulty);
  const questionCount = Math.min(quiz.questionCount, QUESTIONS_PER_GAME);

  const footer = (
    <View style={styles.footer}>
      {error && <Text style={textStyles.error}>{error}</Text>}
      <BigButton
        label={isCreating ? strings.quizSetup.creating : strings.quizSetup.createButton}
        onPress={onChoose}
        disabled={isCreating}
      />
      <GameSettingsCard settings={settings} onPress={() => setIsSettingsOpen(true)} />
    </View>
  );

  return (
    <Screen footer={footer}>
      <View style={styles.content}>
        <View style={styles.posterBox}>
          <QuizPoster title={quiz.title} poster={quiz.poster} width={posterWidthFor(height)} />
        </View>
        <Text style={styles.title} numberOfLines={3}>
          {quiz.title}
        </Text>
        <Text style={styles.meta}>{strings.quizSetup.meta(questionCount, quiz.estimatedMinutes)}</Text>
        <View style={styles.tags}>
          <Tag label={strings.catalog.difficultyLevels[level]} color={AppColors.tags.difficulty} />
          <Tag label={strings.quizSetup.audiences[quiz.audience]} color={AppColors.tags.audience} />
          <Tag label={strings.catalog.gameTypes.quiz} color={AppColors.tags.gameType} />
        </View>
        {quiz.description !== '' && (
          <Text style={styles.description} numberOfLines={4}>
            {quiz.description}
          </Text>
        )}
      </View>

      <GameSettingsSheet
        visible={isSettingsOpen}
        settings={settings}
        onChange={onSettingsChange}
        onClose={() => setIsSettingsOpen(false)}
      />
    </Screen>
  );
}

function Tag({ label, color }: { label: string; color: string }) {
  return <Text style={[styles.tag, { backgroundColor: color }]}>{label}</Text>;
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.three,
  },
  posterBox: {
    alignItems: 'center',
  },
  // Marge en plus : les accents de Bowlby One montent haut au-dessus des capitales.
  title: {
    marginTop: Spacing.two,
    color: AppColors.accent,
    fontFamily: AppFonts.display,
    fontSize: AppSizes.textLarge,
    lineHeight: Math.round(AppSizes.textLarge * DISPLAY_LINE_HEIGHT),
    textTransform: 'uppercase',
  },
  meta: {
    marginTop: -Spacing.two,
    color: AppColors.textMuted,
    fontFamily: AppFonts.extraBold,
    fontSize: 15,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  tag: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: AppSizes.radiusPill,
    overflow: 'hidden',
    color: AppColors.onTag,
    fontFamily: AppFonts.black,
    fontSize: 14,
  },
  description: {
    color: AppColors.text,
    fontFamily: AppFonts.extraBold,
    fontSize: 16,
    lineHeight: 22,
  },
  footer: {
    gap: Spacing.three,
  },
});
