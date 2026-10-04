import type { PlayerId } from '@shared/types';
import { StyleSheet, Text, View } from 'react-native';

import { AppColors, AppFonts, AppSizes, DISPLAY_LINE_HEIGHT } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import type { LobbyPlayers } from '@/lib/joinGame';

interface PlayerListProps {
  players: LobbyPlayers;
  // Joueur mis en évidence (« toi ») : affiché en premier, même s'il est déconnecté.
  highlightedUid?: PlayerId;
}

// Joueurs connectés, en direct : le joueur mis en évidence d'abord, puis par ordre alphabétique.
export function visiblePlayers(players: LobbyPlayers, highlightedUid?: PlayerId) {
  return Object.entries(players)
    .filter(([id, player]) => player.connected || id === highlightedUid)
    .map(([id, player]) => ({ id, ...player }))
    .sort(
      (a, b) =>
        Number(b.id === highlightedUid) - Number(a.id === highlightedUid) || a.name.localeCompare(b.name, 'fr'),
    );
}

// Grille d'avatars en pastilles blanches cerclées d'or, comme sur la TV.
export function PlayerList({ players, highlightedUid }: PlayerListProps) {
  const list = visiblePlayers(players, highlightedUid);

  return (
    <View style={styles.container}>
      <Text style={styles.count}>{strings.lobby.playerCount(list.length)}</Text>
      <View style={styles.grid}>
        {list.map((player) => {
          const isHighlighted = player.id === highlightedUid;
          return (
            <View key={player.id} style={styles.cell}>
              <View style={[styles.disc, isHighlighted && styles.myDisc]}>
                <Text style={styles.avatar}>{player.avatar}</Text>
              </View>
              <Text style={styles.name} numberOfLines={1}>
                {isHighlighted ? strings.game.scores.me : player.name}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const DISC = 64;

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  count: {
    color: AppColors.accent,
    fontFamily: AppFonts.display,
    fontSize: 20,
    lineHeight: Math.round(20 * DISPLAY_LINE_HEIGHT),
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.three,
  },
  cell: {
    width: DISC + Spacing.four,
    alignItems: 'center',
    gap: Spacing.one,
  },
  disc: {
    width: DISC,
    height: DISC,
    borderRadius: DISC / 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: AppSizes.selectionWidth,
    borderColor: AppColors.accent,
    backgroundColor: AppColors.card,
  },
  myDisc: {
    borderColor: AppColors.highlight,
  },
  avatar: {
    fontSize: 34,
  },
  name: {
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: 15,
    textAlign: 'center',
  },
});
