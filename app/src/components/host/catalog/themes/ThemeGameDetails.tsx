import { gameProgramme, programmeLevels, QUESTION_LEVELS, themeGameMinutes, type GameProgramme } from '@shared/themeCatalog';
import { themeIconOf } from '@shared/themeIcons';
import type { QuizAudience, SessionSettings, SoundSettings } from '@shared/types';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BackButton } from '@/components/ui/BackButton';
import { ButtonLabel } from '@/components/ui/ButtonLabel';
import { gradientStyle } from '@/components/ui/gradient';
import { Screen } from '@/components/ui/Screen';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { textStyles } from '@/components/ui/textStyles';
import { ThemeIcon } from '@/components/ui/ThemeIcon';
import { AppColors, AppFonts, AppSizes, DISPLAY_LINE_HEIGHT, themeHeroGradient } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import type { ThemeGameDrawState } from '@/hooks/useThemeGameDraw';

import { GameSettingsCard } from '../GameSettingsCard';
import { GameSettingsSheet } from '../GameSettingsSheet';

interface ThemeGameDetailsProps {
  themes: string[];
  // Nombre demandé ; une fois le tirage fait, celui des questions tirées.
  count: number;
  draw: ThemeGameDrawState;
  audience: QuizAudience;
  settings: SessionSettings;
  onSettingsChange: (settings: SessionSettings) => void;
  sound: SoundSettings;
  onSoundChange: (sound: SoundSettings) => void;
  onCreate: () => void;
  isCreating: boolean;
  error?: string | null;
  // « Modifier mon choix » (écran « Ta partie ») ; absent : bouton caché.
  onModify?: () => void;
}

const texts = strings.catalog.themesGame;
const TITLE_SIZE = 28;
const VISUAL_HEIGHT = 170;
const WATERMARK_SIZE = 130;

// Fiche d'une partie tirée dans des thèmes du Quiz (maquette QN1-F) : grand visuel aux couleurs des thèmes,
// titre, durée, pastilles, description, « Au programme » (répartition réelle des questions tirées), réglages ;
// en bas, « Modifier mon choix », CRÉER LA PARTIE et la ligne d'aide.
export function ThemeGameDetails(props: ThemeGameDetailsProps) {
  const { themes, count, draw, audience, settings, onSettingsChange, sound, onSoundChange, onCreate, isCreating, error, onModify } = props;
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const programme = draw.kind === 'ready' ? gameProgramme(draw.draw.info, themes) : null;
  const questionCount = draw.kind === 'ready' ? draw.draw.refs.length : count;
  const levels = programme ? programmeLevels(programme) : [];

  const footer = (
    <View style={styles.footer}>
      {error && <Text style={textStyles.error}>{error}</Text>}
      {onModify && (
        <Pressable accessibilityRole="button" onPress={onModify} style={({ pressed }) => [styles.modify, pressed && styles.pressed]}>
          <ButtonLabel stretch={false} style={styles.modifyLabel}>{`✎ ${texts.modify}`}</ButtonLabel>
        </Pressable>
      )}
      <SubmitButton singleLine label={isCreating ? texts.creating : texts.create} disabled={isCreating || draw.kind !== 'ready' || questionCount === 0} onPress={onCreate} />
      <Text style={styles.help}>{texts.help}</Text>
    </View>
  );

  return (
    <Screen footer={footer}>
      <ThemeVisual themes={themes} />
      <View style={styles.content}>
        <Text style={styles.title}>{themes.join(' + ')}</Text>
        <Text style={styles.meta}>{texts.meta(questionCount, themeGameMinutes(questionCount, settings))}</Text>
        <View style={styles.tags}>
          {levels.length > 0 && (
            <Tag label={levels.length === 1 ? strings.catalog.difficultyLevels[levels[0]] : texts.mixedLevels} color={AppColors.tags.difficulty} />
          )}
          <Tag label={strings.quizSetup.audiences[audience]} color={AppColors.tags.audience} />
          <Tag label={strings.catalog.gameTypes.quiz} color={AppColors.tags.gameType} />
        </View>
        <Text style={styles.description}>{description(themes, questionCount, programme)}</Text>
        <View style={styles.programme}>
          <Text style={styles.programmeTitle}>{texts.programme}</Text>
          {draw.kind === 'loading' && <Text style={styles.small}>{texts.loading}</Text>}
          {draw.kind === 'error' && <Text style={textStyles.error}>{`${texts.drawFailed} ${draw.detail}`}</Text>}
          {programme && <ProgrammeBars programme={programme} />}
          <Text style={styles.small}>{texts.unplayedFirst}</Text>
        </View>
        <GameSettingsCard settings={settings} onPress={() => setIsSettingsOpen(true)} />
      </View>
      <GameSettingsSheet
        visible={isSettingsOpen}
        settings={settings}
        onChange={onSettingsChange}
        sound={sound}
        onSoundChange={onSoundChange}
        onClose={() => setIsSettingsOpen(false)}
      />
    </Screen>
  );
}

// Une phrase : le thème et sa phrase de présentation, ou la part de chaque thème.
function description(themes: string[], questionCount: number, programme: GameProgramme | null): string {
  if (themes.length === 1) {
    const blurb = texts.themeBlurbs[themes[0]];
    return blurb ? `${texts.oneTheme(questionCount, themes[0])} ${blurb}` : texts.oneTheme(questionCount, themes[0]);
  }
  if (!programme) return '';
  return texts.severalThemes(
    questionCount,
    programme.byTheme.map(({ theme, count }) => texts.themeShare(count, theme)),
  );
}

// Visuel en dégradé, icône de chaque thème en filigrane, flèche retour par-dessus.
function ThemeVisual({ themes }: { themes: string[] }) {
  const icons = themes.map(themeIconOf);
  return (
    <View style={[styles.visual, gradientStyle(themeHeroGradient(icons))]}>
      {icons.map((icon, index) => (
        <View key={`${icon}-${index}`} style={[styles.watermark, watermarkPosition(index, icons.length)]} importantForAccessibility="no-hide-descendants">
          <ThemeIcon name={icon} size={WATERMARK_SIZE} />
        </View>
      ))}
      <View style={[StyleSheet.absoluteFill, gradientStyle(`linear-gradient(180deg, transparent 55%, ${AppColors.themeVisualFade} 100%)`)]} />
      <View style={styles.back}>
        <BackButton />
      </View>
    </View>
  );
}

// Un thème : à droite ; plusieurs : répartis de gauche à droite (en pourcentage de la largeur).
function watermarkPosition(index: number, total: number) {
  if (total === 1) return { right: Spacing.four };
  return { left: `${Math.round((index / (total - 1)) * 70)}%` as const };
}

function ProgrammeBars({ programme }: { programme: GameProgramme }) {
  const themeParts = programme.byTheme.map(({ theme, count }) => ({ key: theme, label: theme, count, color: AppColors.themeChips[themeIconOf(theme)] }));
  const levelParts = QUESTION_LEVELS.map((level) => ({
    key: level,
    label: strings.catalog.difficultyLevels[level],
    count: programme.byLevel[level],
    color: AppColors.programmeLevels[level],
  }));
  return (
    <>
      {themeParts.length > 1 && <ShareBar title={texts.byTheme} parts={themeParts} />}
      <ShareBar title={texts.byLevel} parts={levelParts} />
    </>
  );
}

interface SharePart {
  key: string;
  label: string;
  count: number;
  color: string;
}

// Barre de répartition (une part par couleur, à sa proportion) et sa légende ; les parts vides sont omises.
function ShareBar({ title, parts }: { title: string; parts: SharePart[] }) {
  const shown = parts.filter((part) => part.count > 0);
  return (
    <View style={styles.share}>
      <Text style={styles.shareTitle}>{title}</Text>
      <View style={styles.bar}>
        {shown.map((part) => (
          <View key={part.key} style={[styles.segment, { flex: part.count, backgroundColor: part.color }]} />
        ))}
      </View>
      <View style={styles.legend}>
        {shown.map((part) => (
          <View key={part.key} style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: part.color }]} />
            <Text style={styles.legendLabel}>{texts.share(part.label, part.count)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function Tag({ label, color }: { label: string; color: string }) {
  return <Text style={[styles.tag, { backgroundColor: color }]}>{label}</Text>;
}

const styles = StyleSheet.create({
  // Le visuel va jusqu'aux bords de l'écran (annule la marge de Screen).
  visual: {
    height: VISUAL_HEIGHT,
    marginHorizontal: -Spacing.three,
    marginTop: -Spacing.three,
    overflow: 'hidden',
  },
  watermark: {
    position: 'absolute',
    top: Spacing.four,
    opacity: 0.25,
  },
  back: {
    position: 'absolute',
    top: Spacing.three,
    left: Spacing.three,
  },
  content: {
    gap: Spacing.three,
  },
  title: {
    color: AppColors.accent,
    fontFamily: AppFonts.display,
    fontSize: TITLE_SIZE,
    lineHeight: Math.round(TITLE_SIZE * DISPLAY_LINE_HEIGHT),
    textTransform: 'uppercase',
  },
  meta: {
    marginTop: -Spacing.two,
    color: AppColors.textMuted,
    fontFamily: AppFonts.extraBold,
    fontSize: 14,
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
    fontSize: 13,
  },
  description: {
    color: AppColors.text,
    fontFamily: AppFonts.extraBold,
    fontSize: 15,
    lineHeight: 21,
  },
  programme: {
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: 20,
    backgroundColor: AppColors.programmePanel,
  },
  programmeTitle: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.black,
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  share: {
    gap: Spacing.two,
  },
  shareTitle: {
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: 14,
  },
  bar: {
    flexDirection: 'row',
    gap: 3,
    height: 10,
  },
  segment: {
    borderRadius: 5,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: Spacing.three,
    rowGap: Spacing.one,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: 13,
  },
  small: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.bold,
    fontSize: 13,
  },
  footer: {
    gap: Spacing.two,
  },
  modify: {
    alignSelf: 'center',
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    borderRadius: AppSizes.radiusPill,
    borderWidth: 2,
    borderColor: AppColors.outlineButton,
  },
  modifyLabel: {
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: 15,
  },
  pressed: {
    opacity: 0.8,
  },
  help: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.bold,
    fontSize: 12,
    textAlign: 'center',
  },
});
