import type { PlayerId } from '@shared/types';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { visiblePlayers } from '@/components/player/PlayerList';
import { AppColors, AppFonts, AppSizes } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import type { LobbyPlayers } from '@/lib/joinGame';

interface LobbyPlayerRowsProps {
  players: LobbyPlayers;
  hostUid: PlayerId;
  // Lien « Modifier » sur la ligne de l'hôte ; absent tant qu'il n'est pas inscrit ou pendant la modification.
  onEditHost?: () => void;
}

// Joueurs connectés du salon de l'hôte, une ligne chacun (avatar, pseudo, étiquette HÔTE), l'hôte en premier.
export function LobbyPlayerRows({ players, hostUid, onEditHost }: LobbyPlayerRowsProps) {
  return (
    <View style={styles.list}>
      {visiblePlayers(players, hostUid).map((player) => {
        const isHost = player.id === hostUid;
        return (
          <View key={player.id} style={styles.row}>
            <View style={styles.disc}>
              <Text style={styles.avatar}>{player.avatar}</Text>
            </View>
            <Text style={styles.name} numberOfLines={1}>
              {player.name}
            </Text>
            {isHost && <Text style={styles.badge}>{strings.hostLobby.hostBadge}</Text>}
            {isHost && onEditHost && (
              <Pressable accessibilityRole="button" hitSlop={Spacing.two} onPress={onEditHost}>
                <Text style={styles.edit}>{strings.hostLobby.editProfileLink}</Text>
              </Pressable>
            )}
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  disc: {
    width: AppSizes.lobbyAvatar,
    height: AppSizes.lobbyAvatar,
    borderRadius: AppSizes.lobbyAvatar / 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: AppColors.accent,
    backgroundColor: AppColors.card,
  },
  avatar: {
    fontSize: 20,
  },
  name: {
    flex: 1,
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: AppSizes.textBody,
  },
  badge: {
    paddingHorizontal: Spacing.two,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: AppColors.accent,
    color: AppColors.onAccent,
    fontFamily: AppFonts.black,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  edit: {
    color: AppColors.link,
    fontFamily: AppFonts.extraBold,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
