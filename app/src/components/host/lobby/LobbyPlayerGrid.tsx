import type { PlayerId } from '@shared/types';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { visiblePlayers } from '@/components/player/PlayerList';
import { AppColors, AppFonts, AppSizes } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import type { LobbyPlayers } from '@/lib/joinGame';
import { ToolIcon } from '@/components/player/draw/ToolIcon';
import { MarkIcon } from '@/components/ui/MarkIcon';
import { PlayerName } from '@/components/ui/PlayerName';

// Cercles vides en pointillés tant que personne n'a rejoint.
const EMPTY_SEATS = 5;
// Au-delà, la grille défile dans sa propre zone (environ deux lignes et demie) : les boutons du salon
// ne sont jamais repoussés.
const SCROLL_FROM = 9;
const SCROLL_ZONE_HEIGHT = 230;
const REMOVE_SIZE = 22;
const REMOVE_ICON = 10;
const EDIT_SIZE = 22;
const EDIT_ICON = 12;

interface LobbyPlayerGridProps {
  players: LobbyPlayers;
  hostUid: PlayerId;
  // Exclure un joueur (bouton × sur son avatar ; la confirmation est demandée par l'appelant). Absent :
  // pas de bouton (démos).
  onRemove?: (playerId: PlayerId, name: string) => void;
  // L'hôte qui joue : toucher son avatar (« Toi », petit crayon) ouvre son prénom et son avatar.
  onEditHost?: () => void;
}

// Joueurs du salon de l'hôte (maquette N2) : avatar et pseudo en grille qui revient à la ligne, l'hôte
// en premier (« Toi ») ; un petit × sur l'avatar de chaque autre joueur pour l'exclure.
export function LobbyPlayerGrid({ players, hostUid, onRemove, onEditHost }: LobbyPlayerGridProps) {
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
      {shown.map((player) =>
        player.id === hostUid ? (
          <HostCell key={player.id} avatar={player.avatar} onEdit={onEditHost} />
        ) : (
        <View key={player.id} style={styles.cell}>
          <View style={styles.disc}>
            <Text style={styles.avatar}>{player.avatar}</Text>
            {onRemove && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={strings.hostLobby.removePlayer(player.name)}
                hitSlop={Spacing.two}
                onPress={() => onRemove(player.id, player.name)}
                style={({ pressed }) => [styles.remove, pressed && styles.removePressed]}>
                <MarkIcon kind="cross" size={REMOVE_ICON} color={AppColors.text} />
              </Pressable>
            )}
          </View>
          <PlayerName name={player.name} style={styles.name} />
        </View>
        ),
      )}
    </View>
  );
  if (shown.length < SCROLL_FROM) return grid;
  return (
    <ScrollView style={styles.scrollZone} nestedScrollEnabled persistentScrollbar>
      {grid}
    </ScrollView>
  );
}

// L'hôte qui joue, en premier : son avatar avec un petit crayon, et « Toi » en jaune (maquette « Salon de
// l'hôte (nouveau) »). Le toucher ouvre son profil (prénom et avatar).
function HostCell({ avatar, onEdit }: { avatar: string; onEdit?: () => void }) {
  const texts = strings.hostLobby.playAlso;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={texts.editLabel}
      disabled={!onEdit}
      onPress={onEdit}
      style={({ pressed }) => [styles.cell, pressed && styles.removePressed]}>
      <View style={styles.disc}>
        <Text style={styles.avatar}>{avatar}</Text>
        {onEdit && (
          <View style={styles.edit}>
            <ToolIcon name="pen" size={EDIT_ICON} color={AppColors.ink} />
          </View>
        )}
      </View>
      <Text style={styles.you}>{texts.you}</Text>
    </Pressable>
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
  // Bouton × posé sur le coin haut droit de l'avatar.
  remove: {
    position: 'absolute',
    top: -6,
    right: -8,
    width: REMOVE_SIZE,
    height: REMOVE_SIZE,
    borderRadius: REMOVE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: AppColors.text,
    backgroundColor: AppColors.inkSurface,
  },
  removePressed: {
    opacity: 0.7,
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
  you: {
    color: AppColors.accent,
    fontFamily: AppFonts.black,
    fontSize: 13,
    textAlign: 'center',
  },
  // Petit crayon sur le coin bas droit de l'avatar de l'hôte.
  edit: {
    position: 'absolute',
    right: -6,
    bottom: -4,
    width: EDIT_SIZE,
    height: EDIT_SIZE,
    borderRadius: EDIT_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: AppColors.inkSurface,
    backgroundColor: AppColors.accent,
  },
});
