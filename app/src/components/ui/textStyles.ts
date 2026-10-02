import { StyleSheet } from 'react-native';

import { AppColors, AppSizes } from '@/constants/appTheme';

export const textStyles = StyleSheet.create({
  title: {
    color: AppColors.text,
    fontSize: AppSizes.textTitle,
    fontWeight: '900',
    textAlign: 'center',
  },
  label: {
    color: AppColors.text,
    fontSize: AppSizes.textLarge,
    fontWeight: '700',
  },
  body: {
    color: AppColors.text,
    fontSize: AppSizes.textBody,
  },
  muted: {
    color: AppColors.textMuted,
    fontSize: AppSizes.textBody,
  },
  error: {
    color: AppColors.wrong,
    fontSize: AppSizes.textBody,
    fontWeight: '700',
  },
  input: {
    minHeight: AppSizes.buttonHeight,
    paddingHorizontal: 16,
    borderRadius: AppSizes.radius,
    backgroundColor: AppColors.surface,
    color: AppColors.text,
    fontSize: AppSizes.textLarge,
    fontWeight: '700',
  },
});
