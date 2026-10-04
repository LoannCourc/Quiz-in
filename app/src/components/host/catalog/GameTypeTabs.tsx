import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppColors, AppFonts, AppSizes } from '@/constants/appTheme';
import { strings, type GameType } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

// Seul le quiz est jouable au MVP : les autres types sont visibles, marqués « bientôt », non cliquables.
const SOON_TYPES: readonly GameType[] = ['blindTest', 'lyrics'];

// Une seule ligne, jamais de retour à la ligne : tient en 320 de large ; sur un écran plus étroit
// (ou avec une police agrandie dans les réglages du téléphone), la rangée défile horizontalement.
export function GameTypeTabs() {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.row}
      accessibilityRole="tablist">
      <View accessibilityRole="tab" accessibilityState={{ selected: true }} style={[styles.tab, styles.activeTab]}>
        <Text style={styles.activeLabel}>{strings.catalog.gameTypes.quiz}</Text>
      </View>
      {SOON_TYPES.map((type) => (
        <View
          key={type}
          accessible
          accessibilityRole="tab"
          accessibilityState={{ disabled: true }}
          accessibilityLabel={strings.catalog.gameTypeSoon(strings.catalog.gameTypes[type])}
          style={styles.tab}>
          <Text style={styles.soonLabel}>{strings.catalog.gameTypes[type]}</Text>
          <Text style={styles.badge}>{strings.catalog.soon}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const LABEL_SIZE = 15;

const styles = StyleSheet.create({
  // Défile jusqu'aux bords de l'écran (même principe que les puces de thème) ; flexGrow 0 : sur le
  // web, une ScrollView horizontale s'étire sinon en hauteur.
  scroll: {
    flexGrow: 0,
    marginHorizontal: -Spacing.three,
  },
  row: {
    alignItems: 'flex-end',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingBottom: Spacing.one,
    borderBottomWidth: AppSizes.tabUnderline,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: AppColors.accent,
  },
  activeLabel: {
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: LABEL_SIZE,
  },
  soonLabel: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.extraBold,
    fontSize: LABEL_SIZE,
  },
  // Étiquette discrète : petite, contour cyan plutôt qu'un aplat.
  badge: {
    paddingHorizontal: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: AppColors.soonBadge,
    overflow: 'hidden',
    color: AppColors.soonBadge,
    fontFamily: AppFonts.black,
    fontSize: 8,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
});
