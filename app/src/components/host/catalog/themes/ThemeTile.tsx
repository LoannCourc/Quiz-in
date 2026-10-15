import type { ThemeStats } from '@shared/themeCatalog';
import { themeIconOf } from '@shared/themeIcons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ThemeIcon } from '@/components/ui/ThemeIcon';
import { AppColors, AppFonts } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

interface ThemeTileProps {
  theme: ThemeStats;
  width: number;
  onPress: () => void;
}

const ICON_BOX = 40;
const ICON_SIZE = 24;
const NAME_SIZE = 15;
const TILE_RADIUS = 20;

// Tuile d'un thème (maquette QN1-A) : pastille carrée à la couleur du thème avec son icône, nom sur deux
// lignes au plus, nombre de questions.
export function ThemeTile({ theme, width, onPress }: ThemeTileProps) {
  const icon = themeIconOf(theme.theme);
  const count = strings.catalog.themesHome.tileCount(theme.questionCount);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${theme.theme}, ${count}`}
      onPress={onPress}
      style={({ pressed }) => [styles.tile, { width }, pressed && styles.pressed]}>
      <View style={[styles.iconBox, { backgroundColor: AppColors.themeChips[icon] }]}>
        <ThemeIcon name={icon} size={ICON_SIZE} />
      </View>
      <View style={styles.nameBox}>
        <Text style={styles.name} numberOfLines={2}>
          {theme.theme}
        </Text>
      </View>
      <Text style={styles.count} numberOfLines={1}>
        {count}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    gap: Spacing.one,
    padding: Spacing.two,
    paddingTop: Spacing.three,
    borderRadius: TILE_RADIUS,
    backgroundColor: AppColors.themeTile,
  },
  pressed: {
    opacity: 0.8,
  },
  iconBox: {
    width: ICON_BOX,
    height: ICON_BOX,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    marginBottom: Spacing.two,
  },
  // Deux lignes réservées, nom calé en bas : toutes les tuiles d'une rangée ont la même hauteur.
  nameBox: {
    minHeight: Math.round(NAME_SIZE * 1.3) * 2,
    justifyContent: 'flex-end',
  },
  name: {
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: NAME_SIZE,
    lineHeight: Math.round(NAME_SIZE * 1.3),
  },
  count: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.extraBold,
    fontSize: 12,
  },
});
