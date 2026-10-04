import { StyleSheet, Text, View } from 'react-native';

import { AppColors, AppFonts, AppSizes } from '@/constants/appTheme';
import { strings, type GameType } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

// Seul le quiz est jouable au MVP : les autres types sont visibles, marqués « bientôt », non cliquables.
const SOON_TYPES: readonly GameType[] = ['blindTest', 'lyrics'];

export function GameTypeTabs() {
  return (
    <View style={styles.row} accessibilityRole="tablist">
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
          style={[styles.tab, styles.soonTab]}>
          <Text style={styles.soonLabel}>{strings.catalog.gameTypes[type]}</Text>
          <Text style={styles.badge}>{strings.catalog.soon}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    columnGap: Spacing.four,
    rowGap: Spacing.two,
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
  soonTab: {
    opacity: 0.8,
  },
  activeLabel: {
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: AppSizes.textBody,
  },
  soonLabel: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.extraBold,
    fontSize: AppSizes.textBody,
  },
  badge: {
    paddingHorizontal: Spacing.one,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: AppColors.soonBadge,
    color: AppColors.onSoonBadge,
    fontFamily: AppFonts.black,
    fontSize: 10,
    textTransform: 'uppercase',
  },
});
