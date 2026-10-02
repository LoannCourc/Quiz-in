import type { PlayerId } from '@shared/types';
import { StyleSheet, Text, View } from 'react-native';

import { textStyles } from '@/components/ui/textStyles';
import { AppColors, AppSizes } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import type { RankedPlayer } from '@/lib/playerGame';

import { Countdown, type PhaseTiming } from './Countdown';
import { RankingList } from './RankingList';

// Écrans simples du joueur : démarrage, classement, pause, fin, attente.

export function StartingView({ timing }: { timing: PhaseTiming }) {
  return (
    <View style={styles.centeredBlock}>
      <Text style={textStyles.title}>{strings.game.starting.title}</Text>
      <Countdown {...timing} variant="digits" />
      <Text style={[textStyles.muted, styles.centered]}>{strings.game.starting.subtitle}</Text>
    </View>
  );
}

export function ScoresView({ players, uid }: { players: RankedPlayer[]; uid: PlayerId }) {
  return (
    <View style={styles.block}>
      <Text style={textStyles.title}>{strings.game.scores.title}</Text>
      <RankingList players={players} uid={uid} />
    </View>
  );
}

export function PausedView() {
  return (
    <View style={styles.centeredBlock}>
      <Text style={styles.pauseIcon}>⏸</Text>
      <Text style={textStyles.title}>{strings.game.paused.title}</Text>
      <Text style={[textStyles.body, styles.centered]}>{strings.game.paused.message}</Text>
    </View>
  );
}

interface EndViewProps {
  players: RankedPlayer[];
  uid: PlayerId;
}

export function EndView({ players, uid }: EndViewProps) {
  const me = players.find((player) => player.id === uid);
  const { ordinal, points } = strings.game;

  return (
    <View style={styles.block}>
      <Text style={textStyles.title}>{strings.game.ended.title}</Text>
      {me && (
        <Text style={[styles.myResult, styles.centered]}>
          {strings.game.ended.myResult(ordinal(me.rank), points(me.score))}
        </Text>
      )}
      <Text style={textStyles.label}>{strings.game.ended.finalRanking}</Text>
      <RankingList players={players} uid={uid} />
    </View>
  );
}

export function WaitingView() {
  return <Text style={[textStyles.body, styles.centered]}>{strings.game.waiting}</Text>;
}

const styles = StyleSheet.create({
  block: {
    gap: Spacing.three,
  },
  centeredBlock: {
    alignItems: 'center',
    gap: Spacing.three,
  },
  centered: {
    textAlign: 'center',
  },
  pauseIcon: {
    color: AppColors.accent,
    fontSize: AppSizes.textHuge,
  },
  myResult: {
    color: AppColors.accent,
    fontSize: AppSizes.textLarge,
    fontWeight: '800',
  },
});
