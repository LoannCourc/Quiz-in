import { useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { AppColors, AppFonts, AppSizes } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

import { useRemainingFraction, useSecondsLeft, type PhaseTiming } from './phaseTiming';

interface NextQuestionBarProps {
  // Attente totale jusqu'à la question suivante (révélation + classement), heure serveur.
  timing: PhaseTiming;
  isLastQuestion: boolean;
  // Dessine-moi : « Prochaine manche dans N s ».
  isRound?: boolean;
}

// « Prochaine question dans N… » et une fine barre qui se vide (animation native).
// Nouvelle clé si l'attente change (reprise après une pause).
export function NextQuestionBar(props: NextQuestionBarProps) {
  const { phaseStartedAt, phaseEndsAt } = props.timing;
  return <WaitLine key={`${phaseStartedAt}-${phaseEndsAt}`} {...props} />;
}

function WaitLine({ timing: timingProps, isLastQuestion, isRound = false }: NextQuestionBarProps) {
  // Objet stable : les effets ne redémarrent pas à chaque rendu du parent.
  const [timing] = useState<PhaseTiming>(timingProps);
  const seconds = useSecondsLeft(timing);
  const fraction = useRemainingFraction(timing);
  const { nextQuestionIn, nextRoundIn, finalRankingIn } = strings.game.transition;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{isLastQuestion ? finalRankingIn(seconds) : (isRound ? nextRoundIn : nextQuestionIn)(seconds)}</Text>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { transform: [{ scaleX: fraction }] }]} />
      </View>
    </View>
  );
}

const BAR_HEIGHT = 8;

const styles = StyleSheet.create({
  container: {
    gap: Spacing.one,
  },
  label: {
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: AppSizes.textBody,
    textAlign: 'center',
  },
  track: {
    height: BAR_HEIGHT,
    borderRadius: BAR_HEIGHT / 2,
    overflow: 'hidden',
    backgroundColor: AppColors.timebarTrack,
  },
  fill: {
    height: '100%',
    borderRadius: BAR_HEIGHT / 2,
    backgroundColor: AppColors.ring,
    transformOrigin: 'left',
  },
});
