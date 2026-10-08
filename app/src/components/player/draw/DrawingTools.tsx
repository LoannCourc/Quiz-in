import { DRAW_COLORS, PICKER_COLORS, STROKE_WIDTHS } from '@shared/drawing/palette';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppColors, AppFonts, TEXT_FIT_SAFETY } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

import type { DrawTool } from './drawingTypes';
import { ToolIcon, type ToolIconName } from './ToolIcon';

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
const COLORS_PER_ROW = 5;
// Tailles de la maquette E1 ; les boutons rétrécissent sur un écran étroit (tout tient à 320 points).
const TOOL_MAX = 52;
const TOOL_ICON = 24;
const SWATCH_MAX = 44;
const WIDTH_BUTTON = 44;
// Points des épaisseurs, réduits pour tenir dans un bouton.
const DOT_SCALE = 0.6;

// Outils du dessinateur (maquette E1) : cinq outils ronds avec leur nom (crayon, gomme, pot, annuler,
// effacer ; l'outil choisi en or), dix couleurs en deux rangées de cinq, puis la rangée « ÉPAISSEUR ».
// Choisir une couleur repasse au crayon après la gomme.
export function DrawingTools({ tool, color, width, onTool, onColor, onWidth, onUndo, onClear }: DrawingToolsProps) {
  const { draw } = strings;
  const rows = [PICKER_COLORS.slice(0, COLORS_PER_ROW), PICKER_COLORS.slice(COLORS_PER_ROW)];
  return (
    <View style={styles.block}>
      <View style={styles.toolsRow}>
        {TOOLS.map((item) => (
          <ToolButton
            key={item}
            icon={item}
            label={draw.tools[item]}
            isActive={item === tool}
            onPress={() => onTool(item)}
          />
        ))}
        <ToolButton icon="undo" label={draw.undoLabel} accessibilityLabel={draw.undo} onPress={onUndo} />
        <ToolButton icon="clear" label={draw.clearLabel} accessibilityLabel={draw.clear} onPress={onClear} isDanger />
      </View>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.colorsRow}>
          {row.map((index) => {
            const isSelected = index === color && tool !== 'eraser';
            return (
              <Pressable
                key={index}
                accessibilityRole="button"
                accessibilityLabel={draw.color(index)}
                accessibilityState={{ selected: isSelected }}
                onPress={() => {
                  onColor(index);
                  if (tool === 'eraser') onTool('pen');
                }}
                style={[styles.swatch, { backgroundColor: DRAW_COLORS[index] }, isSelected && styles.swatchSelected]}
              />
            );
          })}
        </View>
      ))}
      <View style={styles.widthRow}>
        <Text style={styles.widthTitle}>{draw.widthTitle}</Text>
        <View style={styles.widthButtons}>
          {STROKE_WIDTHS.map((size, index) => (
            <Pressable
              key={size}
              accessibilityRole="button"
              accessibilityLabel={draw.widths[index]}
              accessibilityState={{ selected: index === width }}
              onPress={() => onWidth(index)}
              style={[styles.widthButton, index === width && styles.widthSelected]}>
              <View style={[styles.dot, { width: size * DOT_SCALE, height: size * DOT_SCALE, borderRadius: size }]} />
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

interface ToolButtonProps {
  icon: ToolIconName;
  label: string;
  accessibilityLabel?: string;
  isActive?: boolean;
  // Effacer : icône rose (action destructrice).
  isDanger?: boolean;
  onPress: () => void;
}

function ToolButton({ icon, label, accessibilityLabel, isActive = false, isDanger = false, onPress }: ToolButtonProps) {
  const iconColor = isActive ? AppColors.onAccent : isDanger ? AppColors.wrong : AppColors.accent;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected: isActive }}
      onPress={onPress}
      style={({ pressed }) => [styles.tool, pressed && styles.pressed]}>
      <View style={[styles.toolDisc, isActive && styles.toolDiscActive]}>
        <ToolIcon name={icon} size={TOOL_ICON} color={iconColor} />
      </View>
      <Text style={styles.toolLabel} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: Spacing.three,
  },
  toolsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.one,
  },
  tool: {
    flex: 1,
    maxWidth: TOOL_MAX + Spacing.three,
    alignItems: 'center',
    gap: Spacing.one,
  },
  toolDisc: {
    width: '100%',
    maxWidth: TOOL_MAX,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: TOOL_MAX,
    backgroundColor: AppColors.inkSurface,
  },
  toolDiscActive: {
    backgroundColor: AppColors.accent,
  },
  pressed: {
    opacity: 0.7,
  },
  toolLabel: {
    ...TEXT_FIT_SAFETY,
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: 11,
  },
  colorsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  swatch: {
    flex: 1,
    maxWidth: SWATCH_MAX,
    aspectRatio: 1,
    borderRadius: SWATCH_MAX,
    borderWidth: 3,
    borderColor: AppColors.chipBorder,
  },
  swatchSelected: {
    borderColor: AppColors.selection,
  },
  widthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  widthTitle: {
    ...TEXT_FIT_SAFETY,
    color: AppColors.questionMeta,
    fontFamily: AppFonts.black,
    fontSize: 12,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  widthButtons: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  widthButton: {
    width: WIDTH_BUTTON,
    height: WIDTH_BUTTON,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 3,
    borderColor: 'transparent',
    backgroundColor: AppColors.inkSurface,
  },
  widthSelected: {
    borderColor: AppColors.selection,
  },
  dot: {
    backgroundColor: AppColors.text,
  },
});
