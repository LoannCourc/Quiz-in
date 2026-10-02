import { StyleSheet } from 'react-native';

import { AppColors, AppFonts, AppShadows, AppSizes, DISPLAY_LINE_HEIGHT } from '@/constants/appTheme';

export const textStyles = StyleSheet.create({
  // Titre Bowlby One : hauteur de ligne ≥ 1,3 pour que les accents ne touchent pas la ligne du dessus.
  title: {
    color: AppColors.text,
    fontFamily: AppFonts.display,
    fontSize: AppSizes.textTitle,
    lineHeight: Math.round(AppSizes.textTitle * DISPLAY_LINE_HEIGHT),
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  // Message principal d'un écran de partie (« BONNE RÉPONSE ! »), avec ombre dure sans flou.
  hero: {
    color: AppColors.text,
    fontFamily: AppFonts.display,
    fontSize: AppSizes.textHero,
    lineHeight: Math.round(AppSizes.textHero * DISPLAY_LINE_HEIGHT),
    textAlign: 'center',
    textTransform: 'uppercase',
    textShadowColor: AppShadows.textColor,
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 0,
  },
  label: {
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: AppSizes.textLarge,
  },
  body: {
    color: AppColors.text,
    fontFamily: AppFonts.bold,
    fontSize: AppSizes.textBody,
  },
  muted: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.bold,
    fontSize: AppSizes.textBody,
  },
  error: {
    color: AppColors.wrong,
    fontFamily: AppFonts.extraBold,
    fontSize: AppSizes.textBody,
  },
  // Champ de saisie : carte blanche, texte encre.
  input: {
    minHeight: AppSizes.buttonHeight,
    paddingHorizontal: 20,
    borderRadius: AppSizes.radius,
    backgroundColor: AppColors.card,
    color: AppColors.ink,
    fontFamily: AppFonts.extraBold,
    fontSize: AppSizes.textLarge,
    boxShadow: AppShadows.hard,
  },
});
