import { DRAW_CATEGORIES, drawCategoryId, type DrawCategory } from '@shared/drawWords';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SettingsIcon } from '@/components/host/settings/SettingsIcon';
import { ButtonLabel } from '@/components/ui/ButtonLabel';
import { DrawCategoryIcon } from '@/components/ui/drawCategoryIcons';
import { Screen } from '@/components/ui/Screen';
import { AppColors, AppFonts, AppShadows, AppSizes, DISPLAY_LINE_HEIGHT, TEXT_FIT_SAFETY } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

const texts = strings.catalog.drawCategories;
const COLUMNS = 3;
// Taille des noms : la même pour toutes les affiches, la plus grande où le nom le plus long (« Nourriture »)
// tient sur une ligne ; une lettre de Nunito Black fait environ 0,62 de la taille de police.
const NAME_MAX_SIZE = 14;
const NAME_MIN_SIZE = 11;
const LETTER_WIDTH_RATIO = 0.62;
const LONGEST_NAME = Math.max(...DRAW_CATEGORIES.map((category) => category.length));

function nameFontSize(tileWidth: number): number {
  const fitting = Math.floor((tileWidth - 2 * Spacing.two) / (LONGEST_NAME * LETTER_WIDTH_RATIO));
  return Math.max(NAME_MIN_SIZE, Math.min(NAME_MAX_SIZE, fitting));
}

interface DrawCategoryPickerProps {
  onBack: () => void;
  // Identifiants choisis (drawCategoryId) ; vide : « Mélange ».
  onContinue: (drawCategories: string[]) => void;
}

// Choix en cours : « Mélange », ou une ou plusieurs catégories (les deux s'excluent) ; ni l'un ni l'autre :
// rien n'est choisi.
interface Choice {
  isMix: boolean;
  ids: string[];
}

// Catalogue de Dessine-moi (maquette D1) : « Mélange » (par défaut) ou une ou plusieurs des 12 catégories,
// en affiches de couleur, puis « Continuer » vers la fiche du jeu. Choisir une catégorie quitte
// « Mélange » ; appuyer sur « Mélange » efface les catégories. Rien de choisi : « Continuer » désactivé.
export function DrawCategoryPicker({ onBack, onContinue }: DrawCategoryPickerProps) {
  const [choice, setChoice] = useState<Choice>({ isMix: true, ids: [] });
  const [gridWidth, setGridWidth] = useState(0);
  const tileWidth = gridWidth > 0 ? Math.floor((gridWidth - (COLUMNS - 1) * Spacing.three) / COLUMNS) : 0;
  const nameSize = nameFontSize(tileWidth);
  const chosen = DRAW_CATEGORIES.filter((category) => choice.ids.includes(drawCategoryId(category)));
  const canContinue = choice.isMix || chosen.length > 0;

  function toggle(category: DrawCategory) {
    const id = drawCategoryId(category);
    setChoice((current) => ({
      isMix: false,
      ids: current.ids.includes(id) ? current.ids.filter((value) => value !== id) : [...current.ids, id],
    }));
  }

  const footer = (
    <View style={styles.bar}>
      <View style={styles.barTexts}>
        <Text style={styles.barTitle}>{choice.isMix ? texts.mix : chosen.length > 0 ? texts.count(chosen.length) : texts.none}</Text>
        <Text style={styles.barHint} numberOfLines={2}>
          {choice.isMix ? texts.mixHint : chosen.length > 0 ? chosen.join(', ') : texts.noneHint}
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !canContinue }}
        disabled={!canContinue}
        onPress={() => onContinue(choice.isMix ? [] : choice.ids)}
        style={({ pressed }) => [styles.continue, !canContinue && styles.disabled, pressed && styles.pressed]}>
        <ButtonLabel stretch={false} style={styles.continueLabel}>
          {texts.continue}
        </ButtonLabel>
      </Pressable>
    </View>
  );

  return (
    <Screen footer={footer}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel={strings.home.back} hitSlop={Spacing.two} onPress={onBack} style={styles.back}>
          <View style={styles.backIcon}>
            <SettingsIcon name="chevron" color={AppColors.text} />
          </View>
        </Pressable>
        <Text style={styles.brand} numberOfLines={1}>
          {strings.home.games.draw.name}
        </Text>
      </View>
      <View style={styles.titles}>
        <Text style={styles.question}>{texts.title}</Text>
        <Text style={styles.subtitle}>{texts.subtitle}</Text>
      </View>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: choice.isMix }}
        onPress={() => setChoice((current) => (current.isMix ? { isMix: false, ids: [] } : { isMix: true, ids: [] }))}
        style={({ pressed }) => [styles.mix, choice.isMix && styles.mixSelected, pressed && styles.pressed]}>
        <View style={styles.mixDisc}>
          <DrawCategoryIcon category="mix" size={22} color={AppColors.accent} />
        </View>
        <View style={styles.barTexts}>
          <Text style={styles.mixTitle}>{texts.mix}</Text>
          <Text style={styles.mixHint}>{texts.mixHint}</Text>
        </View>
        {choice.isMix && <CheckBadge />}
      </Pressable>
      <View style={styles.grid} onLayout={(event) => setGridWidth(event.nativeEvent.layout.width)}>
        {tileWidth > 0 &&
          DRAW_CATEGORIES.map((category) => {
            const isSelected = choice.ids.includes(drawCategoryId(category));
            return (
              <Pressable
                key={category}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isSelected }}
                accessibilityLabel={category}
                onPress={() => toggle(category)}
                style={({ pressed }) => [
                  styles.tile,
                  { width: tileWidth, backgroundColor: AppColors.drawCategories[category] },
                  isSelected ? styles.tileSelected : styles.tileIdle,
                  pressed && styles.pressed,
                ]}>
                <DrawCategoryIcon category={category} size={TILE_ICON} color={AppColors.ink} />
                <ButtonLabel style={[styles.tileName, { fontSize: nameSize }]}>{category}</ButtonLabel>
                {isSelected && <CheckBadge />}
              </Pressable>
            );
          })}
      </View>
    </Screen>
  );
}

// Pastille de coche en haut à droite d'une catégorie choisie.
function CheckBadge() {
  return (
    <View style={styles.badge}>
      <SettingsIcon name="check" color={AppColors.correct} />
    </View>
  );
}

const TILE_ICON = 32;
const BADGE = 32;
const BRAND_SIZE = 26;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  back: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.surface,
  },
  backIcon: {
    transform: [{ rotate: '180deg' }],
  },
  brand: {
    flexShrink: 1,
    color: AppColors.accent,
    fontFamily: AppFonts.display,
    fontSize: BRAND_SIZE,
    lineHeight: Math.round(BRAND_SIZE * DISPLAY_LINE_HEIGHT),
    textTransform: 'uppercase',
  },
  titles: {
    gap: 2,
  },
  question: {
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: AppSizes.textLarge,
  },
  subtitle: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.bold,
    fontSize: 14,
  },
  mix: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: AppSizes.radius,
    borderWidth: 2,
    borderColor: AppColors.chipBorder,
    backgroundColor: AppColors.surface,
  },
  mixSelected: {
    borderWidth: 3,
    borderColor: AppColors.selection,
  },
  mixDisc: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.inkSurface,
  },
  mixTitle: {
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: 16,
  },
  mixHint: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.bold,
    fontSize: 13,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  tile: {
    minHeight: 100,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.one,
    paddingVertical: Spacing.three,
    borderRadius: AppSizes.radius,
    borderWidth: 3,
    borderColor: 'transparent',
    boxShadow: AppShadows.hard,
  },
  tileIdle: {
    opacity: 0.85,
  },
  tileSelected: {
    borderColor: AppColors.selection,
  },
  tileName: {
    color: AppColors.ink,
    fontFamily: AppFonts.black,
  },
  badge: {
    position: 'absolute',
    top: -BADGE / 3,
    right: -BADGE / 3,
    width: BADGE,
    height: BADGE,
    borderRadius: BADGE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: AppColors.selection,
    backgroundColor: AppColors.inkSurface,
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.45,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderRadius: AppSizes.radius,
    backgroundColor: AppColors.lobbyPanel,
  },
  barTexts: {
    flex: 1,
    gap: 2,
  },
  barTitle: {
    ...TEXT_FIT_SAFETY,
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: 16,
  },
  barHint: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.bold,
    fontSize: 13,
  },
  continue: {
    minHeight: 52,
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    borderRadius: AppSizes.radiusPill,
    backgroundColor: AppColors.accent,
    boxShadow: AppShadows.hard,
  },
  continueLabel: {
    color: AppColors.onAccent,
    fontFamily: AppFonts.display,
    fontSize: 16,
    textTransform: 'uppercase',
  },
});
