import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppColors, AppFonts, AppShadows, AppSizes, TEXT_FIT_SAFETY } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

// Hôte pas encore inscrit (maquette L1) : « Je joue aussi » ouvre le même formulaire que celui des
// joueurs (pseudo et avatar).
export function HostJoinCard({ onJoin }: { onJoin: () => void }) {
  const { hostCard } = strings.hostLobby;
  return (
    <View style={styles.card}>
      <View style={styles.texts}>
        <Text style={styles.title}>{hostCard.title}</Text>
        <Text style={styles.hint}>{hostCard.hint}</Text>
      </View>
      <Pressable accessibilityRole="button" onPress={onJoin} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
        <Text style={styles.buttonLabel}>{hostCard.button}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 2,
    borderRadius: AppSizes.radius,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: AppColors.link,
  },
  texts: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: 15,
  },
  hint: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.bold,
    fontSize: 13,
  },
  button: {
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    borderRadius: AppSizes.radiusPill,
    backgroundColor: AppColors.link,
    boxShadow: AppShadows.hard,
  },
  pressed: {
    transform: [{ translateY: 4 }],
    boxShadow: AppShadows.pressed,
  },
  buttonLabel: {
    ...TEXT_FIT_SAFETY,
    color: AppColors.ink,
    fontFamily: AppFonts.black,
    fontSize: 14,
    textTransform: 'uppercase',
  },
});
