import type { ThemeStats } from '@shared/themeCatalog';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppColors, AppFonts, AppSizes } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

import { ThemeTile } from './ThemeTile';

interface ThemeRailProps {
  themes: ThemeStats[];
  tileWidth: number;
  onOpenTheme: (theme: string) => void;
  onSeeAll: () => void;
}

// Rangée « Tous les thèmes » (maquette QN1-A) : tuiles qui défilent jusqu'au bord de l'écran, « Tout voir »
// ouvre la grille complète.
export function ThemeRail({ themes, tileWidth, onOpenTheme, onSeeAll }: ThemeRailProps) {
  const texts = strings.catalog.themesHome;
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>{texts.allThemes}</Text>
        <Pressable accessibilityRole="link" accessibilityLabel={texts.seeAllLabel} hitSlop={Spacing.two} onPress={onSeeAll}>
          <Text style={styles.link}>{`${texts.seeAll} ›`}</Text>
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll} contentContainerStyle={styles.row}>
        {themes.map((theme) => (
          <ThemeTile key={theme.theme} theme={theme} width={tileWidth} onPress={() => onOpenTheme(theme.theme)} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.two,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  title: {
    flexShrink: 1,
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: AppSizes.textBody,
  },
  link: {
    color: AppColors.link,
    fontFamily: AppFonts.black,
    fontSize: 14,
  },
  // Comme PosterRow : la rangée défile jusqu'au bord de l'écran ; flexGrow 0 pour le web.
  scroll: {
    flexGrow: 0,
    marginHorizontal: -Spacing.three,
  },
  row: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
});
