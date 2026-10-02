import type { PlayerId } from '@shared/types';
import { StyleSheet, Text, View } from 'react-native';

import { textStyles } from '@/components/ui/textStyles';
import { AppColors, AppFonts, AppShadows, AppSizes, DISPLAY_LINE_HEIGHT } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import type { LobbyPlayers } from '@/lib/joinGame';

import { PlayerList } from './PlayerList';

interface PlayerLobbyProps {
  uid: PlayerId;
  players: LobbyPlayers;
}

// Lobby du joueur : son avatar en grand, le message principal, puis les autres joueurs.
// Le bouton « Modifier mon profil » est fourni à part, en pied d'écran (toujours visible).
export function PlayerLobby({ uid, players }: PlayerLobbyProps) {
  const me = players[uid];

  return (
    <View style={styles.lobby}>
      {me && (
        <View style={styles.me}>
          <View style={styles.bigDisc}>
            <Text style={styles.bigAvatar}>{me.avatar}</Text>
          </View>
          <Text style={styles.myName}>{me.name}</Text>
        </View>
      )}
      <Text style={textStyles.hero}>{strings.lobby.inLobbyTitle}</Text>
      <Text style={[textStyles.label, styles.centered]}>{strings.lobby.waiting}</Text>

      <PlayerList players={players} highlightedUid={uid} />
    </View>
  );
}

const BIG_DISC = 104;

const styles = StyleSheet.create({
  lobby: {
    gap: Spacing.three,
  },
  me: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  bigDisc: {
    width: BIG_DISC,
    height: BIG_DISC,
    borderRadius: BIG_DISC / 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: AppSizes.coinBorder,
    borderColor: AppColors.accent,
    backgroundColor: AppColors.card,
    boxShadow: AppShadows.hard,
  },
  bigAvatar: {
    fontSize: 58,
  },
  myName: {
    color: AppColors.text,
    fontFamily: AppFonts.display,
    fontSize: 26,
    lineHeight: Math.round(26 * DISPLAY_LINE_HEIGHT),
  },
  centered: {
    textAlign: 'center',
  },
});
