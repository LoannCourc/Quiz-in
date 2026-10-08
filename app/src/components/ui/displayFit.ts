import { AppSizes, DISPLAY_LINE_HEIGHT } from '@/constants/appTheme';
import { Spacing } from '@/constants/theme';

// Bowlby One en capitales : une lettre fait environ 0,82 de la taille de police en largeur.
const DISPLAY_LETTER_RATIO = 0.82;

// Taille d'un titre en Bowlby One qui doit tenir sur une ligne dans la colonne de l'écran (le web ne sait
// pas réduire un texte tout seul) : la plus grande taille, entre min et max, qui fait tenir le texte.
export function displaySizeOnOneLine(text: string, screenWidth: number, max: number, min: number): number {
  const available = Math.min(screenWidth, AppSizes.contentMaxWidth) - 2 * Spacing.three;
  const fitting = Math.floor(available / (Math.max(1, [...text].length) * DISPLAY_LETTER_RATIO));
  return Math.max(min, Math.min(max, fitting));
}

// Style de taille (police et hauteur de ligne) d'un titre en Bowlby One.
export function displaySizeStyle(fontSize: number): { fontSize: number; lineHeight: number } {
  return { fontSize, lineHeight: Math.round(fontSize * DISPLAY_LINE_HEIGHT) };
}
