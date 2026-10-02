import type { PlayerId } from '@shared/types';
import { StyleSheet, Text, View } from 'react-native';

import { AppColors, AppSizes } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import type { RankedPlayer } from '@/lib/playerGame';

interface RankingListProps {
  players: RankedPlayer[];
  // Joueur mis en évidence (« toi »).
  uid: PlayerId;
}

// Les égalités partagent le même rang (spec 6.5) : 1er, 1er, 3e.
export function RankingList({ players, uid }: RankingListProps) {
  return (
    <View style={styles.list}>
      {players.map((player) => {
        const isMe = player.id === uid;
        return (
          <View key={player.id} style={[styles.row, isMe && styles.myRow]}>
            <Text style={styles.rank}>{strings.game.ordinal(player.rank)}</Text>
            <Text style={styles.avatar}>{player.avatar}</Text>
            <Text style={styles.name} numberOfLines={1}>
              {isMe ? `${player.name} ${strings.lobby.you}` : player.name}
            </Text>
            <Text style={styles.score}>{player.score}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.two,
  },
  row: {
    minHeight: AppSizes.buttonHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: AppSizes.radius,
    borderWidth: 3,
    borderColor: 'transparent',
    backgroundColor: AppColors.surface,
  },
  myRow: {
    borderColor: AppColors.accent,
  },
  rank: {
    minWidth: 44,
    color: AppColors.accent,
    fontSize: AppSizes.textLarge,
    fontWeight: '900',
  },
  avatar: {
    fontSize: 28,
  },
  name: {
    flex: 1,
    color: AppColors.text,
    fontSize: AppSizes.textBody,
    fontWeight: '700',
  },
  score: {
    color: AppColors.text,
    fontSize: AppSizes.textLarge,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
});
