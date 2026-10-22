import type { ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BigButton } from '@/components/ui/BigButton';
import { AppColors, AppFonts, AppSizes, DISPLAY_LINE_HEIGHT, TEXT_FIT_SAFETY } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import { useKeyboardInset } from '@/hooks/useKeyboardInset';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  // En-tête (maquette R4) : titre à gauche, information courte à droite (« 2 joueurs »).
  title?: string;
  aside?: string;
  // Lien d'en-tête à droite, à la place de aside (« Tout effacer »).
  action?: { label: string; onPress: () => void };
  // En-tête libre, à la place du titre (feuille d'un thème du Quiz : tuile, nom, fermer).
  header?: ReactNode;
  // Bas de la feuille, à la place de « Terminé » (« VOIR 5 QUIZ »).
  footer?: ReactNode;
  // iOS : appelé quand la feuille a fini de disparaître (une fenêtre native ne peut s'ouvrir qu'après).
  onDismissed?: () => void;
  // Appelé quand la feuille est affichée (focus d'un champ : le clavier ne s'ouvre qu'une fois la fenêtre prête).
  onShow?: () => void;
  children: ReactNode;
}

// Feuille du bas, par-dessus l'écran (salon de l'hôte : son, réglages) : poignée, en-tête facultatif, contenu
// qui défile (petit écran, grande police), « Terminé » jaune. Appui en dehors, bouton retour d'Android ou
// « Terminé » : fermeture.
// Clavier ouvert (prénom de « Je joue aussi ») : la feuille est posée dans la zone au-dessus du clavier et
// raccourcit avec elle ; en-tête et bas restent visibles, le milieu défile. Android : le Modal est une fenêtre à
// part, mise en bord à bord comme l'écran (sinon le système la remonte lui-même au-dessus du clavier et la marge
// du clavier s'y ajoute : feuille écrasée, champ invisible) ; les barres système sont donc laissées en marge.
export function BottomSheet({ isOpen, onClose, title, aside, action, header, footer, onDismissed, onShow, children }: BottomSheetProps) {
  const keyboardInset = useKeyboardInset();
  const insets = useSafeAreaInsets();
  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
      onDismiss={onDismissed}
      onShow={onShow}>
      <View style={[styles.overlay, { paddingTop: insets.top, paddingBottom: Math.max(keyboardInset, insets.bottom) }]}>
        <Pressable accessibilityRole="button" accessibilityLabel={strings.quizSetup.settingsDone} style={styles.backdrop} onPress={onClose} />
        <View style={styles.aboveKeyboard}>
          <View style={styles.sheet}>
            <View style={styles.handle} />
            {header}
            {title && (
              <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
                {action ? (
                  <Pressable accessibilityRole="button" onPress={action.onPress} hitSlop={Spacing.three} style={styles.action}>
                    <Text style={styles.actionLabel}>{action.label}</Text>
                  </Pressable>
                ) : (
                  aside && <Text style={styles.aside}>{aside}</Text>
                )}
              </View>
            )}
            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">{children}</ScrollView>
            {footer ?? <BigButton label={strings.quizSetup.settingsDone} onPress={onClose} />}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const TITLE_SIZE = 24;
const HANDLE_WIDTH = 44;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    inset: 0,
    backgroundColor: AppColors.backdrop,
  },
  // Zone visible au-dessus du clavier : la hauteur maximale de la feuille se mesure sur elle. Transparente
  // au toucher : un appui au-dessus de la feuille atteint le fond qui ferme.
  aboveKeyboard: {
    flex: 1,
    justifyContent: 'flex-end',
    pointerEvents: 'box-none',
  },
  sheet: {
    width: '100%',
    maxWidth: AppSizes.contentMaxWidth,
    maxHeight: '92%',
    alignSelf: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
    borderTopLeftRadius: AppSizes.radiusCard,
    borderTopRightRadius: AppSizes.radiusCard,
    backgroundColor: AppColors.inkSurface,
  },
  handle: {
    alignSelf: 'center',
    width: HANDLE_WIDTH,
    height: 5,
    borderRadius: 3,
    backgroundColor: AppColors.sheetHandle,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  title: {
    flexShrink: 1,
    color: AppColors.text,
    fontFamily: AppFonts.display,
    fontSize: TITLE_SIZE,
    lineHeight: Math.round(TITLE_SIZE * DISPLAY_LINE_HEIGHT),
    textTransform: 'uppercase',
  },
  aside: {
    ...TEXT_FIT_SAFETY,
    color: AppColors.textMuted,
    fontFamily: AppFonts.extraBold,
    fontSize: 14,
  },
  action: {
    minHeight: 44,
    justifyContent: 'center',
  },
  actionLabel: {
    ...TEXT_FIT_SAFETY,
    color: AppColors.link,
    fontFamily: AppFonts.black,
    fontSize: 15,
    textDecorationLine: 'underline',
  },
  content: {
    gap: Spacing.three,
  },
});
