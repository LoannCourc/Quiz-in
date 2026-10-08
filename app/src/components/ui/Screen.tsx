import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { AppBackgrounds, AppColors, AppSizes, type AppBackgroundName } from '@/constants/appTheme';
import { Spacing } from '@/constants/theme';

import { useKeyboardInset } from '@/hooks/useKeyboardInset';

import { gradientStyle } from './gradient';

// Clavier ouvert : la marge du bas (sûre) est remplacée par la hauteur du clavier, et le bas de l'écran
// garde 12 points au-dessus de lui (maquette S1).
const KEYBOARD_GAP = 12;
const EDGES_WITH_KEYBOARD: Edge[] = ['top', 'left', 'right'];

interface BackgroundProps {
  children?: ReactNode;
  background?: AppBackgroundName;
}

// Fond seul, sans contenu : écran de chargement (polices) et base de Screen.
export function ScreenBackground({ children, background = 'main' }: BackgroundProps) {
  return <View style={[styles.background, gradientStyle(AppBackgrounds[background])]}>{children}</View>;
}

interface ScreenProps extends BackgroundProps {
  // Fixé en haut de l'écran, hors de la zone qui défile : toujours visible, même quand le clavier fait
  // défiler la page (en-tête de la question et minuteur).
  header?: ReactNode;
  // Fixé en bas de l'écran, hors de la zone qui défile : toujours visible.
  footer?: ReactNode;
  // false : la page ne défile pas, la colonne occupe la hauteur restante (une zone interne défile
  // à sa place, comme la liste des joueurs du salon).
  scrollable?: boolean;
  // Toute la largeur de l'écran, sans la colonne centrée (dessinateur en paysage, maquette E2).
  wide?: boolean;
}

// Fond et colonne centrée communs aux écrans de l'app (hôte et joueurs). Clavier ouvert : la zone utile
// s'arrête au-dessus du clavier (useKeyboardInset), le bas de la colonne (bouton « Valider ») reste visible.
export function Screen({ children, background, header, footer, scrollable = true, wide = false }: ScreenProps) {
  const keyboardInset = useKeyboardInset();
  const hasKeyboard = keyboardInset > 0;
  const bottomGap = hasKeyboard ? { paddingBottom: KEYBOARD_GAP } : null;
  const column = <View style={[styles.column, !scrollable && styles.fixedColumn, wide && styles.wideColumn]}>{children}</View>;
  return (
    <ScreenBackground background={background}>
      <SafeAreaView
        edges={hasKeyboard ? EDGES_WITH_KEYBOARD : undefined}
        style={[styles.safeArea, hasKeyboard && { paddingBottom: keyboardInset }]}>
        {header && <View style={styles.header}>{header}</View>}
        {scrollable ? (
          <ScrollView contentContainerStyle={[styles.scrollContent, !footer && bottomGap]} keyboardShouldPersistTaps="handled">
            {column}
          </ScrollView>
        ) : (
          <View style={[styles.scrollContent, styles.fixedContent, !footer && bottomGap]}>{column}</View>
        )}
        {footer && <View style={[styles.footer, bottomGap]}>{footer}</View>}
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    padding: Spacing.three,
  },
  // Sans défilement : hauteur bornée à l'écran (minHeight 0), le contenu ne la dépasse pas.
  fixedContent: {
    flex: 1,
    minHeight: 0,
  },
  fixedColumn: {
    flex: 1,
    minHeight: 0,
  },
  header: {
    width: '100%',
    maxWidth: AppSizes.contentMaxWidth,
    alignSelf: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
  },
  footer: {
    width: '100%',
    maxWidth: AppSizes.contentMaxWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
  },
  wideColumn: {
    maxWidth: '100%',
  },
  column: {
    flexGrow: 1,
    width: '100%',
    maxWidth: AppSizes.contentMaxWidth,
    gap: Spacing.four,
  },
});
