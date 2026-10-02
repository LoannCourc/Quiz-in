import type { PlayerId } from '@shared/types';
import { StyleSheet, Text, View } from 'react-native';

import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import type { LobbyPlayers } from '@/lib/joinGame';

import { BigButton } from '@/components/ui/BigButton';
import { PlayerList } from './PlayerList';
import { textStyles } from '@/components/ui/textStyles';

interface PlayerLobbyProps {
  uid: PlayerId;
  players: LobbyPlayers;
  onEditProfile: () => void;
}

export function PlayerLobby({ uid, players, onEditProfile }: PlayerLobbyProps) {
  return (
    <View style={styles.lobby}>
      <PlayerList players={players} highlightedUid={uid} />

      <Text style={[textStyles.muted, styles.waiting]}>{strings.lobby.waiting}</Text>

      <BigButton label={strings.profile.editButton} variant="secondary" onPress={onEditProfile} />
    </View>
  );
}

const styles = StyleSheet.create({
  lobby: {
    gap: Spacing.three,
  },
  waiting: {
    textAlign: 'center',
  },
});
