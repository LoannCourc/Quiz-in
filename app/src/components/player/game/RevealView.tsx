import { StyleSheet, Text, View } from 'react-native';

import { textStyles } from '@/components/ui/textStyles';
import { AppCoinGradient, AppColors, AppFonts, AppShadows, AppSizes, DISPLAY_LINE_HEIGHT } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import type { RevealOutcome } from '@/lib/playerGame';

import { gradientStyle } from '@/components/ui/gradient';

import { ChoicePill } from './ChoicePill';

interface RevealViewProps {
  outcome: RevealOutcome;
  points: number;
  // Part du bonus de rapidité dans les points (option Rapidité), sinon undefined.
  speedBonus?: number;
  correctAnswer: string;
  // Position de la bonne réponse (lettre et couleur) ; undefined si introuvable.
  correctChoice?: number;
  // Absent en Suspense : pas de rang en cours de partie (seulement les points gagnés).
  rank?: number;
  previousRank?: number;
}

export function RevealView({ outcome, points, speedBonus, correctAnswer, correctChoice, rank, previousRank }: RevealViewProps) {
  const isCorrect = outcome === 'correct';

  return (
    <View style={styles.container}>
      <Text style={textStyles.hero}>{strings.game.reveal.titles[outcome]}</Text>

      {/* Ton plus doux pour une mauvaise réponse ou une absence de réponse : pièce translucide. */}
      <PointsCoin points={points} isSoft={!isCorrect} />
      {!isCorrect && <Text style={[textStyles.label, styles.centered]}>{strings.game.reveal.correctAnswerLabel}</Text>}

      {correctChoice === undefined ? (
        <Text style={[textStyles.label, styles.centered]}>{correctAnswer}</Text>
      ) : (
        <ChoicePill choice={correctChoice} text={correctAnswer} />
      )}
      {isCorrect && speedBonus !== undefined && speedBonus > 0 && (
        <Text style={[textStyles.body, styles.centered]}>{strings.game.reveal.speedBonus(speedBonus)}</Text>
      )}

      {rank !== undefined && <PlaceBand rank={rank} previousRank={previousRank} />}
    </View>
  );
}

function PointsCoin({ points, isSoft }: { points: number; isSoft: boolean }) {
  return (
    <View style={[styles.coin, isSoft ? styles.softCoin : COIN_GRADIENT]}>
      <Text style={[styles.coinPoints, isSoft && styles.softCoinText]}>{strings.game.reveal.coinPoints(points)}</Text>
      <Text style={[styles.coinLabel, isSoft && styles.softCoinText]}>{strings.game.reveal.coinLabel}</Text>
    </View>
  );
}

// « TA PLACE 4e → 2e ▲ » : rang avant et après la question.
function PlaceBand({ rank, previousRank }: { rank: number; previousRank?: number }) {
  const { ordinal, reveal } = strings.game;
  // Rang inchangé (ou inconnu) : le rang seul, sans flèche.
  const value =
    previousRank === undefined || previousRank === rank
      ? ordinal(rank)
      : reveal.placeChange(ordinal(previousRank), ordinal(rank), rank < previousRank ? reveal.arrows.up : reveal.arrows.down);

  return (
    <View style={styles.band}>
      <Text style={styles.bandLabel}>{reveal.placeLabel}</Text>
      <Text style={styles.bandValue}>{value}</Text>
    </View>
  );
}

const COIN_GRADIENT = gradientStyle(AppCoinGradient);

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    gap: Spacing.four,
  },
  centered: {
    textAlign: 'center',
  },
  coin: {
    alignSelf: 'center',
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
    color: AppColors.ink,
    fontFamily: AppFonts.display,
    fontSize: 54,
    lineHeight: Math.round(54 * DISPLAY_LINE_HEIGHT),
  },
  coinLabel: {
    color: AppColors.ink,
    fontFamily: AppFonts.black,
    fontSize: AppSizes.textBody,
    textTransform: 'uppercase',
  },
  band: {
    marginTop: 'auto',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderRadius: AppSizes.radiusCard,
    backgroundColor: AppColors.inkSurface,
  },
  bandLabel: {
    color: AppColors.text,
    fontFamily: AppFonts.display,
    fontSize: 17,
    lineHeight: 22,
    textTransform: 'uppercase',
  },
  bandValue: {
    color: AppColors.accent,
    fontFamily: AppFonts.display,
    fontSize: 26,
    lineHeight: 34,
  },
});
