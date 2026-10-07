import type { PlayerId } from '@shared/types';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { visiblePlayers } from '@/components/player/PlayerList';
import { AppColors, AppFonts, AppSizes } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import type { LobbyPlayers } from '@/lib/joinGame';

// Cercles vides en pointillés tant que personne n'a rejoint.
const EMPTY_SEATS = 5;
// Au-delà, la grille défile dans sa propre zone (environ deux lignes et demie) : les boutons du salon
// ne sont jamais repoussés.
const SCROLL_FROM = 9;
const SCROLL_ZONE_HEIGHT = 230;

// Joueurs du salon de l'hôte (maquette N2) : avatar et pseudo en grille qui revient à la ligne, l'hôte
// en premier avec son étiquette.
export function LobbyPlayerGrid({ players, hostUid }: { players: LobbyPlayers; hostUid: PlayerId }) {
  const shown = visiblePlayers(players, hostUid);
  if (shown.length === 0) {
    return (
      <View style={[styles.grid, styles.emptyGrid]} accessibilityLabel={strings.hostLobby.noPlayersShort}>
        {Array.from({ length: EMPTY_SEATS }, (_, index) => (
          <View key={index} style={[styles.disc, styles.emptyDisc]} />
        ))}
      </View>
    );
  }
  const grid = (
    <View style={styles.grid}>
      {shown.map((player) => (
        <View key={player.id} style={styles.cell}>
          <View style={styles.disc}>
            <Text style={styles.avatar}>{player.avatar}</Text>
          </View>
          <Text style={styles.name} numberOfLines={2}>
            {player.name}
          </Text>
          {player.id === hostUid && <Text style={styles.badge}>{strings.hostLobby.hostBadge}</Text>}
        </View>
      ))}
    </View>
  );
  if (shown.length < SCROLL_FROM) return grid;
  return (
    <ScrollView style={styles.scrollZone} nestedScrollEnabled persistentScrollbar>
      {grid}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    columnGap: Spacing.two,
    rowGap: Spacing.three,
  },
  // Les 5 cercles vides tiennent sur une ligne dès 320 px.
  emptyGrid: {
    flexWrap: 'nowrap',
    columnGap: Spacing.one,
  },
  scrollZone: {
    maxHeight: SCROLL_ZONE_HEIGHT,
  },
  cell: {
    width: AppSizes.lobbyGridCell,
    alignItems: 'center',
    gap: Spacing.one,
  },
  disc: {
    width: AppSizes.lobbyGridAvatar,
    height: AppSizes.lobbyGridAvatar,
    borderRadius: AppSizes.lobbyGridAvatar / 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: AppColors.accent,
    backgroundColor: AppColors.card,
  },
  emptyDisc: {
    borderStyle: 'dashed',
    borderColor: AppColors.chipBorder,
    backgroundColor: 'transparent',
  },
  avatar: {
    fontSize: 26,
  },
  name: {
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: 13,
    textAlign: 'center',
  },
  badge: {
    paddingHorizontal: Spacing.one,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: AppColors.accent,
    color: AppColors.onAccent,
    fontFamily: AppFonts.black,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
