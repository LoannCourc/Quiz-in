import type { TeamId } from '@shared/types';
import { useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

import { MarkIcon } from '@/components/ui/MarkIcon';
import { CountUpText, popScale, useEntrance, useLoop, useReduceMotion } from '@/components/ui/motion';
import { textStyles } from '@/components/ui/textStyles';
import { AppCoinGradient, AppColors, AppFonts, AppShadows, AppSizes, DISPLAY_LINE_HEIGHT, TEXT_FIT_SAFETY } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import type { FreeText, RevealOutcome } from '@/lib/playerGame';

import { gradientStyle } from '@/components/ui/gradient';

import { ChoicePill, choiceTextSize } from './ChoicePill';
import type { CoinCenter } from './RevealCelebration';
import { StreakNotice } from './StreakNotice';
import { TeamChip } from './TeamViews';

// Réponse libre (maquette S2) : bonne réponse (titre et artiste pour un blind test « both »), parties
// jugées justes en « both », réponse tapée par le joueur (null si l'appareil ne l'a pas gardée).
export interface FreeRevealInfo {
  title: string;
  artist?: string;
  parts?: { title: boolean; artist: boolean };
  given: FreeText | null;
  // Rapidité activée : les points des parties comprennent le bonus.
  speedBonus: boolean;
}

interface RevealViewProps {
  outcome: RevealOutcome;
  points: number;
  // Part du bonus de rapidité dans les points (option Rapidité), sinon undefined.
  speedBonus?: number;
  correctAnswer: string;
  // Position de la bonne réponse (lettre et couleur) ; undefined si introuvable.
  correctChoice?: number;
  // Propositions de la question : la bonne réponse garde la taille de texte de l'écran de question.
  options?: readonly string[];
  // Réponse libre : bonne réponse rappelée avec ce que le joueur a écrit, à la place de la pilule.
  free?: FreeRevealInfo;
  // Groupe : pastille de l'équipe du joueur.
  team?: TeamId;
  // Série du joueur à montrer (3 et plus, bonne réponse) : badge flamme et « Série de 4 ! ».
  streak?: number | null;
  // Bonne réponse : position du centre de la pièce à l'écran, pour les rayons et les confettis.
  onCoinCenter?: (center: CoinCenter) => void;
}

// Écran Réponse : juste ou faux, et les points gagnés. Aucun rang : il n'apparaît qu'au Classement.
export function RevealView(props: RevealViewProps) {
  const { outcome, points, speedBonus, correctAnswer, correctChoice, options = [], free, team, streak, onCoinCenter } = props;
  const isCorrect = outcome === 'correct';
  const isAnimated = !useReduceMotion();
  const motion = useRevealMotion(isCorrect, outcome === 'wrong', isAnimated);

  return (
    <View style={styles.container}>
      {team && <TeamChip team={team} />}
      <Animated.Text style={[textStyles.hero, outcome === 'partial' && styles.partialTitle, motion.title]}>{strings.game.reveal.titles[outcome]}</Animated.Text>

      {/* Ton plus doux pour une mauvaise réponse ou une absence de réponse : pièce translucide. */}
      <PointsCoin points={points} isSoft={!isCorrect} isAnimated={isAnimated} onCoinCenter={onCoinCenter} />
      {streak != null && <StreakNotice streak={streak} />}
      <Animated.View style={[styles.result, motion.result]}>
        {free ? (
          <FreeResult free={free} isCorrect={isCorrect} points={points} />
        ) : (
          <ChoiceResult correctAnswer={correctAnswer} correctChoice={correctChoice} options={options} isCorrect={isCorrect} />
        )}
      </Animated.View>
      {isCorrect && free?.artist === undefined && speedBonus !== undefined && speedBonus > 0 && (
        <Animated.View style={motion.bonus}>
          <CountUpText
            to={speedBonus}
            delayMs={BONUS_COUNT_DELAY_MS}
            durationMs={BONUS_COUNT_MS}
            isAnimated={isAnimated}
            format={strings.game.reveal.speedBonus}
            style={[textStyles.body, styles.centered]}
          />
        </Animated.View>
      )}
    </View>
  );
}

// Calendrier de l'écran. Bonne réponse : titre en « pop », pastille qui monte à 0,7 s, bonus à 0,95 s. Sinon, sobre :
// petit tremblement du titre (mauvaise réponse), le reste apparaît en douceur, sans rayons ni confettis.
const RESULT_DELAY_MS = 700;
const BONUS_DELAY_MS = 950;
const BONUS_COUNT_DELAY_MS = 1_200;
const BONUS_COUNT_MS = 800;
const SOFT_RESULT_DELAY_MS = 250;
const RISE_DISTANCE = 40;
const SHAKE_DISTANCE = 6;

function useRevealMotion(isCorrect: boolean, shakes: boolean, isAnimated: boolean) {
  const title = useEntrance({ durationMs: isCorrect ? 600 : 450, isAnimated, easing: Easing.linear });
  const result = useEntrance({ delayMs: isCorrect ? RESULT_DELAY_MS : SOFT_RESULT_DELAY_MS, durationMs: isCorrect ? 450 : 400, isAnimated });
  const bonus = useEntrance({ delayMs: BONUS_DELAY_MS, durationMs: 350, isAnimated });
  const titleStyle = isCorrect
    ? { transform: [{ scale: popScale(title) }] }
    : {
        opacity: title.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 1, 1] }),
        transform: shakes
          ? [{ translateX: title.interpolate({ inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1], outputRange: [0, -SHAKE_DISTANCE, SHAKE_DISTANCE, -SHAKE_DISTANCE / 2, SHAKE_DISTANCE / 2, 0] }) }]
          : [],
      };
  return {
    title: titleStyle,
    result: {
      opacity: result,
      transform: [{ translateY: result.interpolate({ inputRange: [0, 1], outputRange: [isCorrect ? RISE_DISTANCE : RISE_DISTANCE / 4, 0] }) }],
    },
    bonus: { opacity: bonus },
  };
}

interface ChoiceResultProps {
  correctAnswer: string;
  correctChoice?: number;
  options: readonly string[];
  isCorrect: boolean;
}

function ChoiceResult({ correctAnswer, correctChoice, options, isCorrect }: ChoiceResultProps) {
  return (
    <>
      {!isCorrect && <Text style={[textStyles.label, styles.centered]}>{strings.game.reveal.correctAnswerLabel}</Text>}
      {correctChoice === undefined ? (
        <Text style={[textStyles.label, styles.centered]}>{correctAnswer}</Text>
      ) : (
        <ChoicePill choice={correctChoice} text={correctAnswer} textSize={choiceTextSize(options)} />
      )}
    </>
  );
}

// Points de chaque partie en « both » : tout pour la seule partie juste, partagés si les deux le sont.
function partPoints(points: number, parts: { title: boolean; artist: boolean }): { title: number; artist: number } {
  if (parts.title && parts.artist) {
    const title = Math.round(points / 2);
    return { title, artist: points - title };
  }
  return { title: parts.title ? points : 0, artist: parts.artist ? points : 0 };
}

// Libellé d'une partie fausse : rappel de ce que le joueur a écrit, s'il a écrit quelque chose.
function partLabel(label: string, isOk: boolean, typed: string): string {
  return !isOk && typed !== '' ? strings.game.reveal.youWrote(label, typed) : label;
}

function FreeResult({ free, isCorrect, points }: { free: FreeRevealInfo; isCorrect: boolean; points: number }) {
  const { reveal } = strings.game;
  const typedTitle = free.given?.value.trim() ?? '';
  if (free.artist === undefined || !free.parts) {
    return <PartRow isOk={isCorrect} label={partLabel(reveal.correctAnswerLabel, isCorrect, typedTitle)} value={free.title} />;
  }
  const typedArtist = free.given?.artist?.trim() ?? '';
  const shares = partPoints(points, free.parts);
  return (
    <View style={styles.parts}>
      <PartRow
        isOk={free.parts.title}
        label={partLabel(reveal.partLabels.title, free.parts.title, typedTitle)}
        value={free.title}
        points={shares.title}
      />
      <PartRow
        isOk={free.parts.artist}
        label={partLabel(reveal.partLabels.artist, free.parts.artist, typedArtist)}
        value={free.artist}
        points={shares.artist}
      />
      {free.speedBonus && <Text style={styles.partsNote}>{reveal.speedIncluded}</Text>}
    </View>
  );
}

interface PartRowProps {
  isOk: boolean;
  label: string;
  value: string;
  points?: number;
}

// Ligne de résultat : pastille coche ou croix (le signe porte l'information, pas seulement la couleur),
// libellé, bonne réponse, et points de la partie en « both ».
function PartRow({ isOk, label, value, points }: PartRowProps) {
  return (
    <View style={styles.partRow}>
      <View style={[styles.partIcon, isOk ? styles.partIconOk : styles.partIconWrong]}>
        <MarkIcon kind={isOk ? 'check' : 'cross'} size={20} color={AppColors.ink} />
      </View>
      <View style={styles.partTexts}>
        <Text style={styles.partLabel}>{label}</Text>
        <Text style={styles.partValue}>{value}</Text>
      </View>
      {points !== undefined && (
        <Text style={[styles.partPoints, points > 0 && styles.partPointsWon]}>{strings.game.reveal.partPoints(points)}</Text>
      )}
    </View>
  );
}

interface PointsCoinProps {
  points: number;
  isSoft: boolean;
  isAnimated: boolean;
  onCoinCenter?: (center: CoinCenter) => void;
}

const COIN_POP_DELAY_MS = 250;
const COIN_POP_MS = 550;
const COIN_COUNT_MS = 1_300;
const HALO_MS = 2_000;
const PULSE_SCALE = 1.03;

// Pièce des points. Bonne réponse : « pop » à 0,25 s, nombre qui monte, pulsation et halo jaune en boucle. Sinon, apparition douce.
function PointsCoin({ points, isSoft, isAnimated, onCoinCenter }: PointsCoinProps) {
  const isFestive = !isSoft && isAnimated;
  const pop = useEntrance({ delayMs: isSoft ? 0 : COIN_POP_DELAY_MS, durationMs: isSoft ? 400 : COIN_POP_MS, isAnimated, easing: Easing.linear });
  const beat = useLoop({ delayMs: COIN_POP_DELAY_MS + COIN_POP_MS, durationMs: HALO_MS, isAnimated: isFestive });
  const ref = useRef<View>(null);
  const pulse = beat.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, PULSE_SCALE, 1] });
  const coinStyle = isSoft
    ? { opacity: pop, transform: [{ scale: pop.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] }) }] }
    : { transform: [{ scale: popScale(pop) }, { scale: pulse }] };
  return (
    <View
      ref={ref}
      style={styles.coinBox}
      onLayout={() => ref.current?.measureInWindow((x, y, width, height) => onCoinCenter?.({ x: x + width / 2, y: y + height / 2 }))}>
      {isFestive && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.halo,
            {
              opacity: beat.interpolate({ inputRange: [0, 0.1, 1], outputRange: [0, 0.55, 0] }),
              transform: [{ scale: beat.interpolate({ inputRange: [0, 1], outputRange: [1, 1.32] }) }],
            },
          ]}
        />
      )}
      <Animated.View style={[styles.coin, isSoft ? styles.softCoin : COIN_GRADIENT, coinStyle]}>
        <CountUpText
          to={points}
          delayMs={COIN_POP_DELAY_MS}
          durationMs={COIN_COUNT_MS}
          isAnimated={isAnimated && !isSoft}
          format={strings.game.reveal.coinPoints}
          style={[styles.coinPoints, isSoft && styles.softCoinText]}
        />
        <Text style={[styles.coinLabel, isSoft && styles.softCoinText]}>{strings.game.reveal.coinLabel}</Text>
      </Animated.View>
    </View>
  );
}

const COIN_GRADIENT = gradientStyle(AppCoinGradient);
const PART_ICON_SIZE = 36;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    gap: Spacing.four,
  },
  centered: {
    textAlign: 'center',
  },
  partialTitle: {
    color: AppColors.accent,
  },
  result: {
    gap: Spacing.four,
  },
  coinBox: {
    alignSelf: 'center',
    width: AppSizes.coinSize,
    height: AppSizes.coinSize,
  },
  halo: {
    position: 'absolute',
    inset: 0,
    borderRadius: AppSizes.coinSize / 2,
    backgroundColor: AppColors.celebrationHalo,
  },
  coin: {
    width: AppSizes.coinSize,
    height: AppSizes.coinSize,
    borderRadius: AppSizes.coinSize / 2,
    borderWidth: AppSizes.coinBorder,
    borderColor: AppColors.card,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    backgroundColor: AppColors.accent,
    boxShadow: AppShadows.hard,
  },
  softCoin: {
    borderColor: AppColors.surface,
    backgroundColor: AppColors.surface,
    boxShadow: 'none',
  },
  softCoinText: {
    color: AppColors.text,
  },
  coinPoints: {
    ...TEXT_FIT_SAFETY,
    color: AppColors.ink,
    fontFamily: AppFonts.display,
    fontSize: 54,
    lineHeight: Math.round(54 * DISPLAY_LINE_HEIGHT),
  },
  coinLabel: {
    ...TEXT_FIT_SAFETY,
    color: AppColors.ink,
    fontFamily: AppFonts.black,
    fontSize: AppSizes.textBody,
    textTransform: 'uppercase',
  },
  parts: {
    gap: Spacing.two,
  },
  partRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 2,
    borderRadius: AppSizes.radius,
    backgroundColor: AppColors.inkSurface,
  },
  partIcon: {
    width: PART_ICON_SIZE,
    height: PART_ICON_SIZE,
    borderRadius: PART_ICON_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  partIconOk: {
    backgroundColor: AppColors.correct,
  },
  partIconWrong: {
    backgroundColor: AppColors.choices[0],
  },
  partTexts: {
    flex: 1,
    gap: 2,
  },
  partLabel: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.black,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  partValue: {
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: AppSizes.textBody,
  },
  partPoints: {
    ...TEXT_FIT_SAFETY,
    color: AppColors.textMuted,
    fontFamily: AppFonts.black,
    fontSize: AppSizes.textBody,
  },
  partPointsWon: {
    color: AppColors.correct,
  },
  partsNote: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.bold,
    fontSize: 13,
  },
});
