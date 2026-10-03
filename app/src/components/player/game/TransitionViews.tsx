import { NEXT_QUESTION_ANNOUNCE_MS } from '@shared/constants';
import type { PlayerId } from '@shared/types';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { textStyles } from '@/components/ui/textStyles';
import { AppColors, DISPLAY_LINE_HEIGHT } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import type { RankedPlayer } from '@/lib/playerGame';

import { NextQuestionBar } from './NextQuestionBar';
import { useSecondsLeft, type PhaseTiming } from './phaseTiming';
import { ScoresView } from './StatusViews';
import { TransitionSteps, type TransitionStep } from './TransitionSteps';

// Attente avant la question suivante : temps total (révélation + classement).
export interface WaitInfo {
  timing: PhaseTiming;
  isLastQuestion: boolean;
}

// En haut des écrans de transition : l'étape en cours et le temps avant la question suivante.
export function WaitHeader({ step, wait }: { step: TransitionStep; wait: WaitInfo }) {
  return (
    <View style={styles.header}>
      <TransitionSteps active={step} />
      <NextQuestionBar timing={wait.timing} isLastQuestion={wait.isLastQuestion} />
    </View>
  );
}

interface ScoresPhaseProps {
  players: RankedPlayer[];
  uid: PlayerId;
  index: number;
  // Phase de classement elle-même (pour l'annonce des 2 dernières secondes).
  phase: PhaseTiming;
  wait: WaitInfo;
  // Numéro de la question suivante, null après la dernière ; nombre de questions de la partie.
  upcoming: number | null;
  questionCount?: number;
}

// Classement, puis annonce plein écran « QUESTION n/N » pendant les 2 dernières secondes de la
// phase (sans l'allonger). Un rendu par seconde au plus. À monter avec une clé par phase.
export function ScoresPhase({ players, uid, index, phase: phaseProps, wait, upcoming, questionCount }: ScoresPhaseProps) {
  // Objet stable : le minuteur des secondes ne redémarre pas à chaque rendu du parent.
  const [phase] = useState(phaseProps);
  const seconds = useSecondsLeft(phase);
  const isAnnouncing = upcoming !== null && questionCount !== undefined && seconds * 1000 <= NEXT_QUESTION_ANNOUNCE_MS;

  if (isAnnouncing) return <AnnounceView questionNumber={upcoming} questionCount={questionCount} />;
  return (
    <>
      <WaitHeader step={1} wait={wait} />
      <ScoresView players={players} uid={uid} index={index} />
    </>
  );
}

function AnnounceView({ questionNumber, questionCount }: { questionNumber: number; questionCount: number }) {
  return (
    <View style={styles.announce}>
      <TransitionSteps active={2} />
      <View style={styles.announceCenter}>
        <Text style={[textStyles.hero, styles.announceText]}>{strings.game.transition.announce(questionNumber, questionCount)}</Text>
        <Text style={[textStyles.label, styles.centered]}>{strings.game.transition.announceHint}</Text>
      </View>
    </View>
  );
}

const ANNOUNCE_SIZE = 52;

const styles = StyleSheet.create({
  header: {
    gap: Spacing.three,
  },
  announce: {
    flexGrow: 1,
    gap: Spacing.four,
  },
  announceCenter: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: Spacing.three,
  },
  announceText: {
    color: AppColors.accent,
    fontSize: ANNOUNCE_SIZE,
    lineHeight: Math.round(ANNOUNCE_SIZE * DISPLAY_LINE_HEIGHT),
  },
  centered: {
    textAlign: 'center',
  },
});
