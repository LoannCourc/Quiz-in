import { BACKGROUND_COLOR, DRAW_COLORS, STROKE_WIDTHS } from '@shared/drawing/palette';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppColors, AppFonts, AppSizes, TEXT_FIT_SAFETY } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

import type { DrawTool } from './drawingTypes';

interface DrawingToolsProps {
  tool: DrawTool;
  color: number;
  width: number;
  onTool: (tool: DrawTool) => void;
  onColor: (color: number) => void;
  onWidth: (width: number) => void;
  onUndo: () => void;
  onClear: () => void;
}

const TOOLS: readonly DrawTool[] = ['pen', 'eraser', 'bucket'];
// Couleurs proposées : toutes sauf le fond (la gomme peint le fond).
const COLOR_INDEXES = DRAW_COLORS.map((_, index) => index).filter((index) => index !== BACKGROUND_COLOR);
const SWATCH_SIZE = 34;
const WIDTH_BUTTON_SIZE = 44;

// Outils du dessinateur (Dessine-moi) : couleurs, trois épaisseurs, crayon, gomme, seau, annuler, tout
// effacer. Choisir une couleur repasse au crayon (sauf au seau).
export function DrawingTools({ tool, color, width, onTool, onColor, onWidth, onUndo, onClear }: DrawingToolsProps) {
  return (
    <View style={styles.block}>
      <View style={styles.swatches}>
        {COLOR_INDEXES.map((index) => (
          <Pressable
            key={index}
            accessibilityRole="button"
            accessibilityLabel={strings.draw.color(index)}
            accessibilityState={{ selected: index === color }}
            onPress={() => {
              onColor(index);
              if (tool === 'eraser') onTool('pen');
            }}
            style={[styles.swatch, { backgroundColor: DRAW_COLORS[index] }, index === color && tool !== 'eraser' && styles.selected]}
          />
        ))}
      </View>
      <View style={styles.row}>
        {STROKE_WIDTHS.map((size, index) => (
          <Pressable
            key={size}
            accessibilityRole="button"
            accessibilityLabel={strings.draw.widths[index]}
            accessibilityState={{ selected: index === width }}
            onPress={() => onWidth(index)}
            style={[styles.widthButton, index === width && styles.selected]}>
            <View style={[styles.widthDot, { width: size, height: size, borderRadius: size / 2 }]} />
          </Pressable>
        ))}
        {TOOLS.map((item) => (
          <Pressable
            key={item}
            accessibilityRole="button"
            accessibilityState={{ selected: item === tool }}
            onPress={() => onTool(item)}
            style={[styles.pill, item === tool && styles.pillActive]}>
            <Text style={[styles.pillText, item === tool && styles.pillTextActive]}>{strings.draw.tools[item]}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.row}>
        <Pressable accessibilityRole="button" onPress={onUndo} style={styles.pill}>
          <Text style={styles.pillText}>{strings.draw.undo}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={onClear} style={styles.pill}>
          <Text style={styles.pillText}>{strings.draw.clear}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: Spacing.two,
  },
  swatches: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  swatch: {
    width: SWATCH_SIZE,
    height: SWATCH_SIZE,
    borderRadius: SWATCH_SIZE / 2,
    borderWidth: 2,
    borderColor: AppColors.chipBorder,
  },
  selected: {
    borderWidth: 3,
    borderColor: AppColors.selection,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.two,
  },
  widthButton: {
    width: WIDTH_BUTTON_SIZE,
    height: WIDTH_BUTTON_SIZE,
    borderRadius: WIDTH_BUTTON_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: AppColors.chipBorder,
    backgroundColor: AppColors.surface,
  },
  widthDot: {
    backgroundColor: AppColors.text,
  },
  pill: {
    minHeight: WIDTH_BUTTON_SIZE,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    borderRadius: AppSizes.radiusPill,
    borderWidth: 2,
    borderColor: AppColors.chipBorder,
    backgroundColor: AppColors.surface,
  },
  pillActive: {
    borderColor: AppColors.chipSelected,
    backgroundColor: AppColors.chipSelected,
  },
  pillText: {
    ...TEXT_FIT_SAFETY,
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: 14,
  },
  pillTextActive: {
    color: AppColors.onChipSelected,
  },
});
