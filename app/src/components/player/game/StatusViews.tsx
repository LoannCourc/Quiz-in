import type { PlayerId } from '@shared/types';
import { StyleSheet, Text, View } from 'react-native';

import { textStyles } from '@/components/ui/textStyles';
import { AppColors, AppFonts, AppSizes, DISPLAY_LINE_HEIGHT } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import type { RankedPlayer } from '@/lib/playerGame';

import { Confetti } from './Confetti';
import { Countdown, type PhaseTiming } from './Countdown';
import { Ranking } from './RankingList';

// Écrans simples du joueur : démarrage, classement, pause, fin, attente.

const STARTING_RING_SIZE = 200;

export function StartingView({ timing }: { timing: PhaseTiming }) {
  return (
    <View style={styles.centeredBlock}>
      <Text style={textStyles.hero}>{strings.game.starting.title}</Text>
      <Countdown {...timing} size={STARTING_RING_SIZE} />
      <Text style={[textStyles.label, styles.centered]}>{strings.game.starting.subtitle}</Text>
    </View>
  );
}

interface ScoresViewProps {
  players: RankedPlayer[];
  uid: PlayerId;
  index: number;
}

export function ScoresView({ players, uid, index }: ScoresViewProps) {
  return (
    <View style={styles.block}>
      <View style={styles.scoresHeader}>
        <Text style={styles.sectionTitle}>{strings.game.scores.title}</Text>
        <Text style={styles.sectionSubtitle} numberOfLines={1}>
          {strings.game.scores.afterQuestion(index)}
        </Text>
      </View>
      <Ranking players={players} uid={uid} />
    </View>
  );
}

export function PausedView() {
  return (
    <View style={styles.centeredBlock}>
      <View style={styles.pauseCoin}>
        <View style={styles.pauseBar} />
        <View style={styles.pauseBar} />
      </View>
      <Text style={textStyles.hero}>{strings.game.paused.title}</Text>
      <Text style={[textStyles.label, styles.centered]}>{strings.game.paused.message}</Text>
    </View>
  );
}

export function EndView({ players, uid }: { players: RankedPlayer[]; uid: PlayerId }) {
  const me = players.find((player) => player.id === uid);
  const { ordinal, points } = strings.game;

  return (
    <View style={styles.block}>
      <Confetti layout="end" />
      <Text style={textStyles.hero}>{strings.game.ended.title}</Text>
      {me && (
        <View style={styles.resultBand}>
          <Text style={styles.resultRank}>
            <Text style={styles.uppercase}>{strings.game.ended.myResult}</Text> {ordinal(me.rank)}
          </Text>
          <Text style={styles.resultPoints}>{points(me.score)}</Text>
        </View>
      )}
      <Ranking players={players} uid={uid} />
    </View>
  );
}

export function WaitingView() {
  return <Text style={[textStyles.label, styles.centered]}>{strings.game.waiting}</Text>;
}

const PAUSE_COIN = 120;

const styles = StyleSheet.create({
  block: {
    gap: Spacing.four,
  },
  centeredBlock: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.four,
  },
  centered: {
    textAlign: 'center',
  },
  scoresHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: Spacing.two,
  },
  sectionTitle: {
    color: AppColors.text,
    fontFamily: AppFonts.display,
    fontSize: 22,
    lineHeight: Math.round(22 * DISPLAY_LINE_HEIGHT),
    textTransform: 'uppercase',
  },
  sectionSubtitle: {
    flexShrink: 1,
    color: AppColors.textMuted,
    fontFamily: AppFonts.black,
    fontSize: 14,
  },
  pauseCoin: {
    width: PAUSE_COIN,
    height: PAUSE_COIN,
    borderRadius: PAUSE_COIN / 2,
    borderWidth: AppSizes.coinBorder,
    borderColor: AppColors.card,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.three,
    backgroundColor: AppColors.accent,
  },
  pauseBar: {
    width: 18,
    height: 48,
    borderRadius: 4,
    backgroundColor: AppColors.inkSurface,
  },
  resultBand: {
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: AppSizes.radiusCard,
    backgroundColor: AppColors.inkSurface,
  },
  resultRank: {
    color: AppColors.accent,
    fontFamily: AppFonts.display,
    fontSize: 28,
    lineHeight: Math.round(28 * DISPLAY_LINE_HEIGHT),
  },
  // Majuscules sur le libellé seulement : « 2e » reste en minuscule.
  uppercase: {
    textTransform: 'uppercase',
  },
  resultPoints: {
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: AppSizes.textLarge,
  },
});
