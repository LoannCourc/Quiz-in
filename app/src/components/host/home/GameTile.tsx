import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ButtonLabel } from '@/components/ui/ButtonLabel';
import { AppColors, AppFonts, AppShadows, AppSizes, TEXT_FIT_SAFETY } from '@/constants/appTheme';
import { strings, type GameType } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

import { GameIcon } from './GameIcon';

const DISC_SIZE = 64;
const ICON_SIZE = 34;
const BORDER = 4;

interface GameTileProps {
  game: GameType;
  onPress: () => void;
  // Jeu coupé à distance : étiquette « Bientôt » en haut à droite, tuile éteinte, non cliquable.
  isSoon?: boolean;
}

// Tuile d'un jeu de l'accueil (maquette H1) : fond de la couleur du jeu, bord blanc, ombre dure encre,
// disque encre avec l'icône dans la couleur de la tuile, nom et phrase en encre (ButtonLabel : jamais
// coupés). Une tuile « Bientôt » (jeu coupé à distance) reste visible mais ne s'ouvre pas.
export function GameTile({ game, onPress, isSoon = false }: GameTileProps) {
  const color = AppColors.gameTiles[game];
  const { name, hint } = strings.home.games[game];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${name}. ${hint}`}
      accessibilityState={{ disabled: isSoon }}
      disabled={isSoon}
      onPress={onPress}
      style={({ pressed }) => [styles.tile, { backgroundColor: color }, pressed && styles.pressed, isSoon && styles.soon]}>
      {isSoon && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{strings.home.soonBadge}</Text>
        </View>
      )}
      <View style={styles.disc}>
        <GameIcon game={game} size={ICON_SIZE} color={color} />
      </View>
      <ButtonLabel style={styles.name}>{name}</ButtonLabel>
      <ButtonLabel style={styles.hint}>{hint}</ButtonLabel>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    flexBasis: '47%',
    flexGrow: 1,
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.two,
    borderRadius: AppSizes.radiusCard,
    borderWidth: BORDER,
    borderColor: AppColors.gameTileBorder,
    boxShadow: AppShadows.hardInk,
  },
  pressed: {
    transform: [{ translateY: 4 }],
    boxShadow: AppShadows.pressed,
  },
  soon: {
    opacity: 0.5,
  },
  disc: {
    width: DISC_SIZE,
    height: DISC_SIZE,
    borderRadius: DISC_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.inkSurface,
  },
  name: {
    color: AppColors.onGameTile,
    fontFamily: AppFonts.black,
    fontSize: 20,
  },
  hint: {
    color: AppColors.onGameTile,
    fontFamily: AppFonts.bold,
    fontSize: 14,
  },
  badge: {
    position: 'absolute',
    top: Spacing.two,
    right: Spacing.two,
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    borderRadius: AppSizes.radiusPill,
    backgroundColor: AppColors.inkSurface,
  },
  badgeText: {
    ...TEXT_FIT_SAFETY,
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: 11,
    textTransform: 'uppercase',
  },
});
