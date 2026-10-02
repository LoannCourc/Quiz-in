import type { PlayerId } from '@shared/types';
import { StyleSheet, Text, View } from 'react-native';

import { PlayerColors, PlayerSizes } from '@/constants/playerTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import type { LobbyPlayers } from '@/lib/joinGame';

import { playerTextStyles } from './playerTextStyles';

interface PlayerListProps {
  players: LobbyPlayers;
  // Joueur mis en évidence (« toi ») : affiché en premier, même s'il est déconnecté.
  highlightedUid?: PlayerId;
}

// Joueurs connectés, en direct : le joueur mis en évidence d'abord, puis par ordre alphabétique.
function visiblePlayers(players: LobbyPlayers, highlightedUid?: PlayerId) {
  return Object.entries(players)
    .filter(([id, player]) => player.connected || id === highlightedUid)
    .map(([id, player]) => ({ id, ...player }))
    .sort(
      (a, b) =>
        Number(b.id === highlightedUid) - Number(a.id === highlightedUid) || a.name.localeCompare(b.name, 'fr'),
    );
}

export function PlayerList({ players, highlightedUid }: PlayerListProps) {
  const list = visiblePlayers(players, highlightedUid);

  return (
    <View style={styles.container}>
      <Text style={playerTextStyles.label}>{strings.lobby.playerCount(list.length)}</Text>
      <View style={styles.list}>
        {list.map((player) => {
          const isHighlighted = player.id === highlightedUid;
          return (
            <View key={player.id} style={[styles.row, isHighlighted && styles.highlightedRow]}>
              <Text style={styles.avatar}>{player.avatar}</Text>
              <Text style={[playerTextStyles.label, styles.name]} numberOfLines={1}>
                {player.name}
              </Text>
              {isHighlighted && <Text style={styles.you}>{strings.lobby.you}</Text>}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  list: {
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: PlayerSizes.radius,
    borderWidth: 3,
    borderColor: 'transparent',
    backgroundColor: PlayerColors.surface,
  },
  highlightedRow: {
    borderColor: PlayerColors.accent,
  },
  avatar: {
    fontSize: 32,
  },
  name: {
    flexShrink: 1,
  },
  you: {
    color: PlayerColors.accent,
    fontSize: PlayerSizes.textBody,
    fontWeight: '700',
  },
});
