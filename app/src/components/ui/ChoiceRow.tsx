import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppColors, AppFonts } from '@/constants/appTheme';
import { Spacing } from '@/constants/theme';

const CHECK = 26;

// Ligne cochable d'une feuille de choix (filtres, tri) : coche cyan quand elle est choisie.
export function ChoiceRow({ label, isSelected, onPress }: { label: string; isSelected: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: isSelected }} onPress={onPress} style={styles.choice}>
      <Text style={styles.choiceLabel}>{label}</Text>
      <View style={[styles.check, isSelected && styles.checkOn]}>{isSelected && <Text style={styles.checkMark}>✓</Text>}</View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  choice: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: AppColors.chipBorder,
  },
  choiceLabel: {
    flex: 1,
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: 16,
  },
  check: {
    width: CHECK,
    height: CHECK,
    borderRadius: CHECK / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: AppColors.chipBorder,
  },
  checkOn: {
    borderColor: AppColors.link,
    backgroundColor: AppColors.link,
  },
  checkMark: {
    color: AppColors.ink,
    fontFamily: AppFonts.black,
    fontSize: 15,
  },
});
