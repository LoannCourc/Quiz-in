import { useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { AppColors, AppFonts, AppSizes, TEXT_FIT_SAFETY } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

import { useRemainingFraction, useSecondsLeft, type PhaseTiming } from './phaseTiming';

const META_SIZE = 14;
// Marges de la barre (maquette S1) : 8 au-dessus, 18 en dessous.
const BAR_MARGIN_TOP = 8;
const BAR_MARGIN_BOTTOM = 18;

interface QuestionHeaderProps {
  index: number;
  // Nombre de questions de la partie (absent avant le lancement : « Question 3 » seul).
  questionCount?: number;
  // Dessine-moi : « Manche 3 / 8 ».
  isRound?: boolean;
  // Temps de la question ; absent au vote du Bluff (sans minuteur) : votes à la place.
  timing?: PhaseTiming;
  votes?: { voted: number; expected: number };
}

// En-tête des questions (maquette S1) : « Question 3 / 10 » à gauche, « 18 s » à droite, puis la barre
// de temps (ou de votes, au Bluff). Fixé en haut de l'écran par PlayerGame.
export function QuestionHeader({ index, questionCount, isRound = false, timing, votes }: QuestionHeaderProps) {
  const progress = strings.game.questionProgress(index, questionCount, isRound);
  if (timing) return <TimedHeader key={`${timing.phaseStartedAt}-${timing.phaseEndsAt}`} progress={progress} timing={timing} />;
  const fraction = votes && votes.expected > 0 ? Math.min(1, votes.voted / votes.expected) : 0;
  return (
    <View>
      <MetaRow progress={progress} right={votes ? strings.game.bluff.votedCount(votes.voted, votes.expected) : ''} />
      <Bar fraction={fraction} />
    </View>
  );
}

// Nouvelle clé dès que la phase change ou que sa fin est recalculée (reprise après une pause) : la barre
// rétrécit vers la gauche (scaleX animé nativement), les secondes changent une fois par seconde.
function TimedHeader({ progress, timing: timingProp }: { progress: string; timing: PhaseTiming }) {
  // Objet stable : les effets ne redémarrent pas à chaque rendu du parent.
  const [timing] = useState<PhaseTiming>(timingProp);
  const seconds = useSecondsLeft(timing);
  const fraction = useRemainingFraction(timing);
  return (
    <View accessibilityLabel={strings.game.secondsLeft(seconds)}>
      <MetaRow progress={progress} right={strings.game.secondsShort(seconds)} />
      <Bar fraction={fraction} />
    </View>
  );
}

function MetaRow({ progress, right }: { progress: string; right: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.progress}>{progress}</Text>
      <Text style={styles.right}>{right}</Text>
    </View>
  );
}

function Bar({ fraction }: { fraction: number | Animated.AnimatedNode }) {
  return (
    <View style={styles.track}>
      <Animated.View style={[styles.fill, { transform: [{ scaleX: fraction as number }] }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
  },
  progress: {
    ...TEXT_FIT_SAFETY,
    color: AppColors.questionMeta,
    fontFamily: AppFonts.black,
    fontSize: META_SIZE,
  },
  right: {
    ...TEXT_FIT_SAFETY,
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: META_SIZE,
    fontVariant: ['tabular-nums'],
  },
  track: {
    height: AppSizes.timebarHeight,
    marginTop: BAR_MARGIN_TOP,
    marginBottom: BAR_MARGIN_BOTTOM,
    borderRadius: AppSizes.timebarHeight / 2,
    overflow: 'hidden',
    backgroundColor: AppColors.timebarTrack,
  },
  fill: {
    height: '100%',
    borderRadius: AppSizes.timebarHeight / 2,
    backgroundColor: AppColors.timebarFill,
    transformOrigin: 'left',
  },
});
