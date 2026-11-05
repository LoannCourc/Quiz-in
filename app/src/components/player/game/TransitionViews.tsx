import { NEXT_QUESTION_ANNOUNCE_MS } from '@shared/constants';
import type { PlayerId, PublicSession } from '@shared/types';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { textStyles } from '@/components/ui/textStyles';
import { AppColors, DISPLAY_LINE_HEIGHT } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

import { NextQuestionBar } from './NextQuestionBar';
import { useRemainingBelow, type PhaseTiming } from './phaseTiming';
import { PhoneRankingView } from './PhoneRankingView';
import { TeamScoresView, type TeamGameInfo } from './TeamViews';
import { TransitionSteps, type TransitionStep } from './TransitionSteps';

// Attente avant la question suivante : temps total (révélation + classement).
export interface WaitInfo {
  timing: PhaseTiming;
  isLastQuestion: boolean;
  // Dessine-moi : « manche » au lieu de « question ».
  isRound: boolean;
}

const stepLabels = (isRound: boolean) => (isRound ? strings.game.transition.roundSteps : strings.game.transition.steps);

// En haut des écrans de transition : l'étape en cours et le temps avant la question suivante.
export function WaitHeader({ step, wait, withRanking = true }: { step: TransitionStep; wait: WaitInfo; withRanking?: boolean }) {
  return (
    <View style={styles.header}>
      <TransitionSteps active={step} withRanking={withRanking} isLastQuestion={wait.isLastQuestion} labels={stepLabels(wait.isRound)} />
      <NextQuestionBar timing={wait.timing} isLastQuestion={wait.isLastQuestion} isRound={wait.isRound} />
    </View>
  );
}

// Classement de la phase : ta place et le top 5 ; celui des équipes en Groupe. Ni onglets, ni temps, ni texte d'attente.
function PhaseRanking({ session, uid, team, isRound }: { session: PublicSession; uid: PlayerId; team?: TeamGameInfo; isRound: boolean }) {
  return team ? <TeamScoresView info={team} /> : <PhoneRankingView session={session} uid={uid} isRound={isRound} />;
}

interface AwaitingScoresPhaseProps {
  session: PublicSession;
  uid: PlayerId;
  team?: TeamGameInfo;
  isRound: boolean;
}

// Pas à pas : jusqu'à l'action de l'hôte.
export function AwaitingScoresPhase({ session, uid, team, isRound }: AwaitingScoresPhaseProps) {
  return <PhaseRanking session={session} uid={uid} team={team} isRound={isRound} />;
}

interface ScoresPhaseProps {
  session: PublicSession;
  uid: PlayerId;
  // Phase de classement elle-même (pour l'annonce de fin de phase).
  phase: PhaseTiming;
  isRound: boolean;
  // Numéro de la question suivante, null après la dernière ; nombre de questions de la partie.
  upcoming: number | null;
  questionCount?: number;
  // Groupe : classement des équipes.
  team?: TeamGameInfo;
}

// Classement, puis annonce plein écran « QUESTION n/N » pendant les NEXT_QUESTION_ANNOUNCE_MS
// dernières millisecondes de la phase (sans l'allonger). À monter avec une clé par phase.
export function ScoresPhase({ session, uid, phase: phaseProps, isRound, upcoming, questionCount, team }: ScoresPhaseProps) {
  // Objet stable : le minuteur ne redémarre pas à chaque rendu du parent.
  const [phase] = useState(phaseProps);
  const isEndOfPhase = useRemainingBelow(phase, NEXT_QUESTION_ANNOUNCE_MS);
  const isAnnouncing = upcoming !== null && questionCount !== undefined && isEndOfPhase;

  if (isAnnouncing) return <AnnounceView questionNumber={upcoming} questionCount={questionCount} isRound={isRound} />;
  return <PhaseRanking session={session} uid={uid} team={team} isRound={isRound} />;
}

function AnnounceView({ questionNumber, questionCount, isRound }: { questionNumber: number; questionCount: number; isRound: boolean }) {
  const { announce, announceRound } = strings.game.transition;
  return (
    <View style={styles.announce}>
      <View style={styles.announceCenter}>
        <Text style={[textStyles.hero, styles.announceText]}>{(isRound ? announceRound : announce)(questionNumber, questionCount)}</Text>
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
