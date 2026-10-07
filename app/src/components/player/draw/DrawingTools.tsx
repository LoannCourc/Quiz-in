import { BACKGROUND_COLOR, DRAW_COLORS, STROKE_WIDTHS } from '@shared/drawing/palette';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppColors, AppFonts } from '@/constants/appTheme';
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
// Plus grand diamètre d'un bouton ; les boutons rétrécissent sur un écran étroit (320 px).
const BUTTON_MAX = 40;
const SWATCH_MAX = 30;
// Points des épaisseurs, réduits pour tenir dans un bouton.
const DOT_SCALE = 0.75;

// Outils du dessinateur (Dessine-moi), en deux lignes sous le canvas : les couleurs, puis épaisseurs,
// crayon, gomme, seau, annuler et tout effacer. Choisir une couleur repasse au crayon après la gomme.
export function DrawingTools({ tool, color, width, onTool, onColor, onWidth, onUndo, onClear }: DrawingToolsProps) {
  const { draw } = strings;
  return (
    <View style={styles.block}>
      <View style={styles.row}>
        {COLOR_INDEXES.map((index) => (
          <Pressable
            key={index}
            accessibilityRole="button"
            accessibilityLabel={draw.color(index)}
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
            accessibilityLabel={draw.widths[index]}
            accessibilityState={{ selected: index === width }}
            onPress={() => onWidth(index)}
            style={[styles.button, index === width && styles.selected]}>
            <View style={[styles.dot, { width: size * DOT_SCALE, height: size * DOT_SCALE, borderRadius: size }]} />
          </Pressable>
        ))}
        {TOOLS.map((item) => (
          <Pressable
            key={item}
            accessibilityRole="button"
            accessibilityLabel={draw.tools[item]}
            accessibilityState={{ selected: item === tool }}
            onPress={() => onTool(item)}
            style={[styles.button, item === tool && styles.active]}>
            <Text style={styles.icon}>{draw.toolIcons[item]}</Text>
          </Pressable>
        ))}
        <Pressable accessibilityRole="button" accessibilityLabel={draw.undo} onPress={onUndo} style={styles.button}>
          <Text style={styles.icon}>{draw.undoIcon}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel={draw.clear} onPress={onClear} style={styles.button}>
          <Text style={styles.icon}>{draw.clearIcon}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.one,
  },
  swatch: {
    flex: 1,
    maxWidth: SWATCH_MAX,
    aspectRatio: 1,
    borderRadius: SWATCH_MAX,
    borderWidth: 2,
    borderColor: AppColors.chipBorder,
  },
  button: {
    flex: 1,
    maxWidth: BUTTON_MAX,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BUTTON_MAX,
    borderWidth: 2,
    borderColor: AppColors.chipBorder,
    backgroundColor: AppColors.surface,
  },
  selected: {
    borderWidth: 3,
    borderColor: AppColors.selection,
  },
  active: {
    borderWidth: 3,
    borderColor: AppColors.selection,
    backgroundColor: AppColors.chipSelected,
  },
  dot: {
    backgroundColor: AppColors.text,
  },
  icon: {
    fontFamily: AppFonts.black,
    fontSize: 18,
    color: AppColors.text,
  },
});
