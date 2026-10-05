import type { QuizGameType } from '@shared/types';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppColors, AppFonts, AppSizes } from '@/constants/appTheme';
import { strings, type GameType } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

// Types de jeu du sélecteur. Le blind test n'est jouable que si l'interrupteur à distance est ouvert
// (config/blindTestEnabled) ; sinon il reste « bientôt » : visible, non cliquable.
const TAB_ORDER: readonly GameType[] = ['quiz', 'blindTest'];

export type PlayableGameType = Extract<GameType, QuizGameType>;

interface GameTypeTabsProps {
  selected: PlayableGameType;
  onSelect: (type: PlayableGameType) => void;
  isBlindTestEnabled: boolean;
}

function isPlayable(type: GameType, isBlindTestEnabled: boolean): type is PlayableGameType {
  return type === 'quiz' || (type === 'blindTest' && isBlindTestEnabled);
}

// Une seule ligne, jamais de retour à la ligne : tient en 320 de large ; sur un écran plus étroit
// (ou avec une police agrandie dans les réglages du téléphone), la rangée défile horizontalement.
export function GameTypeTabs({ selected, onSelect, isBlindTestEnabled }: GameTypeTabsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.row}
      accessibilityRole="tablist">
      {TAB_ORDER.map((type) => {
        const label = strings.catalog.gameTypes[type];
        if (!isPlayable(type, isBlindTestEnabled)) {
          return (
            <View
              key={type}
              accessible
              accessibilityRole="tab"
              accessibilityState={{ disabled: true }}
              accessibilityLabel={strings.catalog.gameTypeSoon(label)}
              style={styles.tab}>
              <Text style={styles.soonLabel}>{label}</Text>
              <Text style={styles.badge}>{strings.catalog.soon}</Text>
            </View>
          );
        }
        const isSelected = type === selected;
        return (
          <Pressable
            key={type}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            onPress={() => onSelect(type)}
            style={[styles.tab, isSelected && styles.activeTab]}>
            <Text style={isSelected ? styles.activeLabel : styles.soonLabel}>{label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const LABEL_SIZE = 15;

const styles = StyleSheet.create({
  // Défile jusqu'aux bords de l'écran (même principe que les puces de thème) ; flexGrow 0 : sur le
  // web, une ScrollView horizontale s'étire sinon en hauteur.
  scroll: {
    flexGrow: 0,
    marginHorizontal: -Spacing.three,
  },
  row: {
    alignItems: 'flex-end',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingBottom: Spacing.one,
    borderBottomWidth: AppSizes.tabUnderline,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: AppColors.accent,
  },
  activeLabel: {
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: LABEL_SIZE,
  },
  soonLabel: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.extraBold,
    fontSize: LABEL_SIZE,
  },
  // Étiquette discrète : petite, contour cyan plutôt qu'un aplat.
  badge: {
    paddingHorizontal: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: AppColors.soonBadge,
    overflow: 'hidden',
    color: AppColors.soonBadge,
    fontFamily: AppFonts.black,
    fontSize: 8,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
});
