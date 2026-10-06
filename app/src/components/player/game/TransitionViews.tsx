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
import { useRemainingBelow, type PhaseTiming } from './phaseTiming';
import { ScoresView } from './StatusViews';
import { TeamScoresView, type TeamGameInfo } from './TeamViews';
import { TransitionSteps, type TransitionStep } from './TransitionSteps';

// Attente avant la question suivante : temps total (révélation + classement).
export interface WaitInfo {
  timing: PhaseTiming;
  isLastQuestion: boolean;
}

// En haut des écrans de transition : l'étape en cours et le temps avant la question suivante.
export function WaitHeader({ step, wait, withRanking = true }: { step: TransitionStep; wait: WaitInfo; withRanking?: boolean }) {
  return (
    <View style={styles.header}>
      <TransitionSteps active={step} withRanking={withRanking} isLastQuestion={wait.isLastQuestion} />
      <NextQuestionBar timing={wait.timing} isLastQuestion={wait.isLastQuestion} />
    </View>
  );
}

// Pas à pas : classement sans barre de temps ni annonce, jusqu'à l'action de l'hôte.
// Classement de la phase : celui des équipes en Groupe, sinon celui des joueurs.
function PhaseRanking({ players, uid, index, team }: { players: RankedPlayer[]; uid: PlayerId; index: number; team?: TeamGameInfo }) {
  return team ? <TeamScoresView info={team} /> : <ScoresView players={players} uid={uid} index={index} />;
}

interface AwaitingScoresPhaseProps {
  players: RankedPlayer[];
  uid: PlayerId;
  index: number;
  team?: TeamGameInfo;
}

export function AwaitingScoresPhase({ players, uid, index, team }: AwaitingScoresPhaseProps) {
  return (
    <>
      <View style={styles.header}>
        <TransitionSteps active={1} />
        {/* En haut, à la place de la barre de temps : visible sans faire défiler le classement. */}
        <Text style={[textStyles.muted, styles.centered]}>{strings.game.awaitingHost}</Text>
      </View>
      <PhaseRanking players={players} uid={uid} index={index} team={team} />
    </>
  );
}

interface ScoresPhaseProps {
  players: RankedPlayer[];
  uid: PlayerId;
  index: number;
  // Phase de classement elle-même (pour l'annonce de fin de phase).
  phase: PhaseTiming;
  wait: WaitInfo;
  // Numéro de la question suivante, null après la dernière ; nombre de questions de la partie.
  upcoming: number | null;
  questionCount?: number;
  // Groupe : classement des équipes.
  team?: TeamGameInfo;
}

// Classement, puis annonce plein écran « QUESTION n/N » pendant les NEXT_QUESTION_ANNOUNCE_MS
// dernières millisecondes de la phase (sans l'allonger). À monter avec une clé par phase.
export function ScoresPhase({ players, uid, index, phase: phaseProps, wait, upcoming, questionCount, team }: ScoresPhaseProps) {
  // Objet stable : le minuteur ne redémarre pas à chaque rendu du parent.
  const [phase] = useState(phaseProps);
  const isEndOfPhase = useRemainingBelow(phase, NEXT_QUESTION_ANNOUNCE_MS);
  const isAnnouncing = upcoming !== null && questionCount !== undefined && isEndOfPhase;

  if (isAnnouncing) return <AnnounceView questionNumber={upcoming} questionCount={questionCount} />;
  return (
    <>
      <WaitHeader step={1} wait={wait} />
      <PhaseRanking players={players} uid={uid} index={index} team={team} />
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
