import { StyleSheet, Text, View } from 'react-native';

import { AppColors, AppFonts, AppSizes, TEXT_FIT_SAFETY } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

interface PlaceBandProps {
  rank: number;
  // Libellé (« Dans ton équipe »).
  label: string;
  // Après le rang, en petit (« sur 3 »).
  suffix?: string;
}

// « DANS TON ÉQUIPE 1er sur 2 » : un libellé et un rang. Ni le libellé ni le rang ne
// rétrécissent : s'ils ne tiennent pas sur une ligne (écran étroit, grande police), le rang passe
// à la ligne, aligné à droite. Le libellé prend en plus la place libre : sa boîte n'est jamais réduite
// à sa largeur mesurée, trop juste sur Android 15+ (voir TEXT_FIT_SAFETY).
export function PlaceBand({ rank, label, suffix }: PlaceBandProps) {
  const value = strings.game.ordinal(rank);

  return (
    <View style={styles.band}>
      <Text style={styles.bandLabel}>{label}</Text>
      <Text style={styles.bandValue}>
        {value}
        {suffix !== undefined && <Text style={styles.bandSuffix}>{` ${suffix}`}</Text>}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  band: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    columnGap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderRadius: AppSizes.radiusCard,
    backgroundColor: AppColors.inkSurface,
  },
  bandLabel: {
    ...TEXT_FIT_SAFETY,
    flexGrow: 1,
    flexShrink: 0,
    color: AppColors.text,
    fontFamily: AppFonts.display,
    fontSize: 17,
    lineHeight: 22,
    textTransform: 'uppercase',
  },
  bandValue: {
    ...TEXT_FIT_SAFETY,
    flexShrink: 0,
    marginLeft: 'auto',
    color: AppColors.accent,
    fontFamily: AppFonts.display,
    fontSize: 26,
    lineHeight: 34,
  },
  bandSuffix: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.black,
    fontSize: 13,
  },
});
