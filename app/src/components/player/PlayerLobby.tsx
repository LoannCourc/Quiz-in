import type { PlayerId } from '@shared/types';
import { StyleSheet, Text, View } from 'react-native';

import { PlayerColors, PlayerSizes } from '@/constants/playerTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import type { LobbyPlayers } from '@/lib/joinGame';

import { playerTextStyles } from './playerTextStyles';

interface PlayerLobbyProps {
  uid: PlayerId;
  players: LobbyPlayers;
}

// Joueurs connectés, soi-même en premier puis par ordre alphabétique.
function connectedPlayers(uid: PlayerId, players: LobbyPlayers) {
  return Object.entries(players)
    .filter(([id, player]) => player.connected || id === uid)
    .map(([id, player]) => ({ id, ...player }))
    .sort((a, b) => Number(b.id === uid) - Number(a.id === uid) || a.name.localeCompare(b.name, 'fr'));
}

export function PlayerLobby({ uid, players }: PlayerLobbyProps) {
  const list = connectedPlayers(uid, players);

  return (
    <View style={styles.lobby}>
      <Text style={playerTextStyles.label}>{strings.lobby.playerCount(list.length)}</Text>

      <View style={styles.list}>
        {list.map((player) => {
          const isMe = player.id === uid;
          return (
            <View key={player.id} style={[styles.row, isMe && styles.myRow]}>
              <Text style={styles.avatar}>{player.avatar}</Text>
              <Text style={[playerTextStyles.label, styles.name]} numberOfLines={1}>
                {player.name}
              </Text>
              {isMe && <Text style={styles.you}>{strings.lobby.you}</Text>}
            </View>
          );
        })}
      </View>

      <Text style={[playerTextStyles.muted, styles.waiting]}>{strings.lobby.waiting}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  lobby: {
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
  myRow: {
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
  waiting: {
    textAlign: 'center',
  },
});
