import type { PlayerId } from '@shared/types';
import { StyleSheet, Text, View } from 'react-native';

import { AppColors, AppFonts, AppSizes, DISPLAY_LINE_HEIGHT, TEXT_FIT_SAFETY } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import type { RankedPlayer } from '@/lib/playerGame';
import { PlayerName } from '@/components/ui/PlayerName';

// Hauteur des marches, par position sur le podium (1re, 2e, 3e place du classement trié).
const STEP_HEIGHTS = [190, 150, 110];
// Ordre d'affichage de gauche à droite : 3e, 1er, 2e (maquette).
const DISPLAY_ORDER = [2, 0, 1];

interface RankingProps {
  // Joueurs triés par rang (égalités comprises).
  players: RankedPlayer[];
  uid: PlayerId;
}

// Podium des trois premiers, puis lignes à partir du 4e. Les égalités gardent leur rang (1, 1, 3).
export function Ranking({ players, uid }: RankingProps) {
  return (
    <View style={styles.container}>
      <Podium players={players.slice(0, 3)} uid={uid} />
      <View style={styles.rows}>
        {players.slice(3).map((player) => (
          <RankingRow key={player.id} player={player} isMe={player.id === uid} />
        ))}
      </View>
    </View>
  );
}

function Podium({ players, uid }: RankingProps) {
  return (
    <View style={styles.podium}>
      {DISPLAY_ORDER.map((position) => {
        const player = players[position];
        if (!player) return <View key={position} style={styles.step} />;
        const isMe = player.id === uid;
        return (
          <View key={player.id} style={styles.step}>
            <Text style={styles.podiumAvatar}>{player.avatar}</Text>
            {isMe ? (
              <View style={styles.meTag}>
                <Text style={styles.meTagText}>{strings.game.scores.me}</Text>
              </View>
            ) : (
              <PlayerName name={player.name} style={styles.podiumName} />
            )}
            <View
              style={[
                styles.block,
                { height: STEP_HEIGHTS[position], backgroundColor: AppColors.podium[position] },
                isMe && styles.myBlock,
              ]}>
              <Text style={styles.blockRank}>{player.rank}</Text>
              <Text style={styles.blockScore}>{strings.game.formatNumber(player.score)}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function RankingRow({ player, isMe }: { player: RankedPlayer; isMe: boolean }) {
  return (
    <View style={[styles.row, isMe && styles.myRow]}>
      <Text style={styles.rowRank}>{player.rank}</Text>
      <Text style={styles.rowAvatar}>{player.avatar}</Text>
      {isMe ? (
        <Text style={styles.rowName} numberOfLines={1}>
          {strings.game.scores.me}
        </Text>
      ) : (
        <PlayerName name={player.name} style={styles.rowName} />
      )}
      <Text style={styles.rowScore}>{strings.game.formatNumber(player.score)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  podium: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  step: {
    flex: 1,
    maxWidth: AppSizes.podiumWidth + Spacing.four,
    alignItems: 'center',
    gap: Spacing.one,
  },
  podiumAvatar: {
    fontSize: 44,
  },
  podiumName: {
    ...TEXT_FIT_SAFETY,
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: AppSizes.textBody,
  },
  meTag: {
    paddingHorizontal: Spacing.three,
    borderRadius: AppSizes.radiusPill,
    backgroundColor: AppColors.card,
  },
  meTagText: {
    ...TEXT_FIT_SAFETY,
    color: AppColors.ink,
    fontFamily: AppFonts.black,
    fontSize: AppSizes.textBody,
    textTransform: 'uppercase',
  },
  block: {
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: AppSizes.radius / 2,
    borderTopRightRadius: AppSizes.radius / 2,
    borderWidth: AppSizes.selectionWidth,
    borderColor: 'transparent',
  },
  myBlock: {
    borderColor: AppColors.selection,
  },
  blockRank: {
    ...TEXT_FIT_SAFETY,
    color: AppColors.ink,
    fontFamily: AppFonts.display,
    fontSize: 40,
    lineHeight: Math.round(40 * DISPLAY_LINE_HEIGHT),
  },
  blockScore: {
    ...TEXT_FIT_SAFETY,
    color: AppColors.ink,
    fontFamily: AppFonts.black,
    fontSize: 15,
  },
  rows: {
    gap: Spacing.two,
  },
  row: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: AppSizes.radiusPill,
    borderWidth: AppSizes.selectionWidth,
    borderColor: 'transparent',
    backgroundColor: AppColors.surface,
  },
  myRow: {
    borderColor: AppColors.selection,
  },
  rowRank: {
    ...TEXT_FIT_SAFETY,
    minWidth: 24,
    color: AppColors.text,
    fontFamily: AppFonts.display,
    fontSize: 20,
    lineHeight: 26,
  },
  rowAvatar: {
    fontSize: 28,
  },
  rowName: {
    flex: 1,
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: AppSizes.textBody,
  },
  rowScore: {
    ...TEXT_FIT_SAFETY,
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: AppSizes.textBody,
  },
});
