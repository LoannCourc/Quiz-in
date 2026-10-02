import { StyleSheet } from 'react-native';

import { PlayerColors, PlayerSizes } from '@/constants/playerTheme';

export const playerTextStyles = StyleSheet.create({
  title: {
    color: PlayerColors.text,
    fontSize: PlayerSizes.textTitle,
    fontWeight: '900',
    textAlign: 'center',
  },
  label: {
    color: PlayerColors.text,
    fontSize: PlayerSizes.textLarge,
    fontWeight: '700',
  },
  body: {
    color: PlayerColors.text,
    fontSize: PlayerSizes.textBody,
  },
  muted: {
    color: PlayerColors.textMuted,
    fontSize: PlayerSizes.textBody,
  },
  error: {
    color: PlayerColors.wrong,
    fontSize: PlayerSizes.textBody,
    fontWeight: '700',
  },
  input: {
    minHeight: PlayerSizes.buttonHeight,
    paddingHorizontal: 16,
    borderRadius: PlayerSizes.radius,
    backgroundColor: PlayerColors.surface,
    color: PlayerColors.text,
    fontSize: PlayerSizes.textLarge,
    fontWeight: '700',
  },
});
