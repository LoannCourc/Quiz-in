import { createContext, useContext, useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { ScrollView, StyleSheet, View, type TextInput } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { AppBackgrounds, AppColors, AppSizes, type AppBackgroundName } from '@/constants/appTheme';
import { Spacing } from '@/constants/theme';

import { useKeyboardInset } from '@/hooks/useKeyboardInset';

import { gradientStyle } from './gradient';

// Clavier ouvert : la marge du bas (sûre) est remplacée par la hauteur du clavier, et le bas de l'écran
// garde 12 points au-dessus de lui (maquette S1).
const KEYBOARD_GAP = 12;
const EDGES_WITH_KEYBOARD: Edge[] = ['top', 'left', 'right'];
// Champ ramené au-dessus du clavier : marge gardée entre lui et le bord de la zone visible.
const FIELD_MARGIN = Spacing.three;

// Champ touché à garder visible quand le clavier s'ouvre (Android et iOS ne font pas défiler d'eux-mêmes la
// zone qui défile jusqu'à lui ; le navigateur, si). Fourni par Screen, lu par useKeepFieldVisible.
const KeepFieldVisibleContext = createContext<((field: TextInput) => void) | null>(null);

// À appeler dans onFocus d'un champ placé dans la zone qui défile d'un Screen (formulaire pour rejoindre).
export function useKeepFieldVisible(fieldRef: RefObject<TextInput | null>): () => void {
  const keepVisible = useContext(KeepFieldVisibleContext);
  return () => {
    if (fieldRef.current) keepVisible?.(fieldRef.current);
  };
}

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
  // Écrans de saisie (Réponse libre, Bluff, « Ton idée » de Dessine-moi) : clavier ouvert, la zone qui
  // défile descend jusqu'en bas (champ et bouton « Valider » visibles), aussi quand le contenu grandit.
  keyboardShowsBottom?: boolean;
  // Trait au-dessus du pied fixe quand le contenu dépasse : le bas du contenu défile, il n'est pas coupé.
  footerDivider?: boolean;
}

// Délai avant de descendre : la zone utile vient d'être réduite par le clavier.
const SCROLL_TO_BOTTOM_DELAY_MS = 50;

// Fond et colonne centrée communs aux écrans de l'app (hôte et joueurs). Clavier ouvert : la zone utile
// s'arrête au-dessus du clavier (useKeyboardInset), le bas de la colonne (bouton « Valider ») reste visible.
export function Screen({ children, background, header, footer, scrollable = true, wide = false, keyboardShowsBottom = false, footerDivider = false }: ScreenProps) {
  const keyboardInset = useKeyboardInset();
  const hasKeyboard = keyboardInset > 0;
  const scrollRef = useRef<ScrollView>(null);
  const showsBottom = keyboardShowsBottom && hasKeyboard;
  const scrollToBottom = () => scrollRef.current?.scrollToEnd({ animated: true });
  const [viewportHeight, setViewportHeight] = useState(0);
  const scrollOffset = useRef(0);
  const fieldToReveal = useRef<TextInput | null>(null);
  const [contentHeight, setContentHeight] = useState(0);
  const isOverflowing = footerDivider && contentHeight > viewportHeight + 1;
  function onContentSizeChange(_width: number, height: number) {
    setContentHeight(height);
    if (showsBottom) scrollToBottom();
  }
  useEffect(() => {
    if (!showsBottom) return;
    const timer = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), SCROLL_TO_BOTTOM_DELAY_MS);
    return () => clearTimeout(timer);
  }, [showsBottom, keyboardInset]);
  // Champ touché : ramené dans la zone visible dès que le clavier l'a réduite (ou tout de suite s'il est déjà ouvert).
  useEffect(() => {
    if (!hasKeyboard) return;
    const timer = setTimeout(() => {
      const field = fieldToReveal.current;
      if (field?.isFocused()) revealField(scrollRef.current, field, scrollOffset.current);
    }, SCROLL_TO_BOTTOM_DELAY_MS);
    return () => clearTimeout(timer);
  }, [hasKeyboard, keyboardInset]);
  function keepFieldVisible(field: TextInput) {
    fieldToReveal.current = field;
    if (hasKeyboard) setTimeout(() => revealField(scrollRef.current, field, scrollOffset.current), SCROLL_TO_BOTTOM_DELAY_MS);
  }
  const bottomGap = hasKeyboard ? { paddingBottom: KEYBOARD_GAP } : null;
  const column = <View style={[styles.column, !scrollable && styles.fixedColumn, wide && styles.wideColumn]}>{children}</View>;
  return (
    <ScreenBackground background={background}>
      <SafeAreaView
        edges={hasKeyboard ? EDGES_WITH_KEYBOARD : undefined}
        style={[styles.safeArea, hasKeyboard && { paddingBottom: keyboardInset }]}>
        {header && <View style={styles.header}>{header}</View>}
        {scrollable ? (
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={[styles.scrollContent, !footer && bottomGap]}
            keyboardShouldPersistTaps="handled"
            onLayout={footerDivider ? (event) => setViewportHeight(event.nativeEvent.layout.height) : undefined}
            onScroll={(event) => (scrollOffset.current = event.nativeEvent.contentOffset.y)}
            scrollEventThrottle={16}
            onContentSizeChange={showsBottom || footerDivider ? onContentSizeChange : undefined}>
            <KeepFieldVisibleContext.Provider value={keepFieldVisible}>{column}</KeepFieldVisibleContext.Provider>
          </ScrollView>
        ) : (
          <View style={[styles.scrollContent, styles.fixedContent, !footer && bottomGap]}>{column}</View>
        )}
        {footer && <View style={[styles.footer, isOverflowing && styles.footerDivider, bottomGap]}>{footer}</View>}
      </SafeAreaView>
    </ScreenBackground>
  );
}

// Fait défiler juste ce qu'il faut pour que le champ soit entier dans la zone visible, avec une marge.
function revealField(scroll: ScrollView | null, field: TextInput, offset: number) {
  scroll?.getNativeScrollRef()?.measureInWindow((_x, top, _width, height) => {
    field.measureInWindow((_fieldX, fieldTop, _fieldWidth, fieldHeight) => {
      const below = fieldTop + fieldHeight + FIELD_MARGIN - (top + height);
      const above = top + FIELD_MARGIN - fieldTop;
      const delta = above > 0 ? -above : Math.max(0, below);
      if (delta !== 0) scroll.scrollTo({ y: Math.max(0, offset + delta), animated: true });
    });
  });
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
  footerDivider: {
    borderTopWidth: StyleSheet.hairlineWidth * 2,
    borderTopColor: AppColors.surface,
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
