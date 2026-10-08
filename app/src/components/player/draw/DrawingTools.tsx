import { DRAW_COLORS, PICKER_COLORS, STROKE_WIDTHS } from '@shared/drawing/palette';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppColors, AppFonts, TEXT_FIT_SAFETY } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

import type { DrawTool } from './drawingTypes';
import { ToolIcon, type ToolIconName } from './ToolIcon';

export interface DrawingToolState {
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
// Tailles des maquettes E1 et E2 ; les boutons rétrécissent sur un écran étroit (tout tient à 320 points).
const TOOL_MAX = 52;
const TOOL_ICON = 24;
const SWATCH_MAX = 44;
const WIDTH_BUTTON = 44;
// Paysage (E2) : tout tient sur un écran de 320 points de haut.
const TOOL_COMPACT = 44;
const SWATCH_COMPACT = 34;
const WIDTH_COMPACT = 38;
// Points des épaisseurs, réduits pour tenir dans un bouton.
const DOT_SCALE = 0.6;

// Portrait (maquette E1) : cinq outils ronds avec leur nom, dix couleurs en deux rangées de cinq, puis la
// rangée « ÉPAISSEUR ». Choisir une couleur repasse au crayon après la gomme.
// compact : écran bas, couleurs et épaisseurs plus petites (le dessin garde sa place).
export function DrawingTools({ compact = false, ...props }: DrawingToolState & { compact?: boolean }) {
  return (
    <View style={[styles.block, compact && styles.blockCompact]}>
      <DrawingToolButtons {...props} />
      <DrawingColors {...props} compact={compact} />
      <DrawingWidths {...props} withTitle compact={compact} />
    </View>
  );
}

// Crayon, gomme, pot, annuler, effacer (l'outil choisi en or) : en rangée avec leur nom (E1), ou en
// colonne sans nom (paysage, E2).
export function DrawingToolButtons({ tool, onTool, onUndo, onClear, vertical = false }: DrawingToolState & { vertical?: boolean }) {
  const { draw } = strings;
  const showLabels = !vertical;
  return (
    <View style={vertical ? styles.toolsColumn : styles.toolsRow}>
      {TOOLS.map((item) => (
        <ToolButton key={item} icon={item} label={draw.tools[item]} showLabel={showLabels} isActive={item === tool} onPress={() => onTool(item)} />
      ))}
      <ToolButton icon="undo" label={draw.undoLabel} accessibilityLabel={draw.undo} showLabel={showLabels} onPress={onUndo} />
      <ToolButton icon="clear" label={draw.clearLabel} accessibilityLabel={draw.clear} showLabel={showLabels} onPress={onClear} isDanger />
    </View>
  );
}

// Dix couleurs en deux rangées de cinq ; la couleur choisie a un contour blanc (sauf avec la gomme).
export function DrawingColors({ tool, color, onColor, onTool, compact = false }: DrawingToolState & { compact?: boolean }) {
  const { draw } = strings;
  const rows = [PICKER_COLORS.slice(0, COLORS_PER_ROW), PICKER_COLORS.slice(COLORS_PER_ROW)];
  return (
    <View style={[styles.colors, compact && styles.colorsCompact]}>
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
                style={[styles.swatch, compact && styles.swatchCompact, { backgroundColor: DRAW_COLORS[index] }, isSelected && styles.swatchSelected]}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}

// Trois épaisseurs ; « ÉPAISSEUR » à gauche en portrait (E1), seules en paysage (E2).
export function DrawingWidths({ width, onWidth, withTitle = false, compact = false }: DrawingToolState & { withTitle?: boolean; compact?: boolean }) {
  const { draw } = strings;
  return (
    <View style={[styles.widthRow, !withTitle && styles.widthRowStart]}>
      {withTitle && <Text style={styles.widthTitle}>{draw.widthTitle}</Text>}
      <View style={styles.widthButtons}>
        {STROKE_WIDTHS.map((size, index) => (
          <Pressable
            key={size}
            accessibilityRole="button"
            accessibilityLabel={draw.widths[index]}
            accessibilityState={{ selected: index === width }}
            onPress={() => onWidth(index)}
            style={[styles.widthButton, compact && styles.widthCompact, index === width && styles.widthSelected]}>
            <View style={[styles.dot, { width: size * DOT_SCALE, height: size * DOT_SCALE, borderRadius: size }]} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

interface ToolButtonProps {
  icon: ToolIconName;
  label: string;
  accessibilityLabel?: string;
  showLabel: boolean;
  isActive?: boolean;
  // Effacer : icône rose (action destructrice).
  isDanger?: boolean;
  onPress: () => void;
}

function ToolButton({ icon, label, accessibilityLabel, showLabel, isActive = false, isDanger = false, onPress }: ToolButtonProps) {
  const iconColor = isActive ? AppColors.onAccent : isDanger ? AppColors.wrong : AppColors.accent;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected: isActive }}
      onPress={onPress}
      style={({ pressed }) => [showLabel ? styles.tool : styles.toolCompact, pressed && styles.pressed]}>
      <View style={[styles.toolDisc, !showLabel && styles.toolDiscCompact, isActive && styles.toolDiscActive]}>
        <ToolIcon name={icon} size={TOOL_ICON} color={iconColor} />
      </View>
      {showLabel && (
        <Text style={styles.toolLabel} numberOfLines={1}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: Spacing.three,
  },
  blockCompact: {
    gap: Spacing.two,
  },
  toolsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.one,
  },
  toolsColumn: {
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  tool: {
    flex: 1,
    maxWidth: TOOL_MAX + Spacing.three,
    alignItems: 'center',
    gap: Spacing.one,
  },
  toolCompact: {
    width: TOOL_COMPACT,
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
  toolDiscCompact: {
    maxWidth: TOOL_COMPACT,
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
  colors: {
    gap: Spacing.three,
  },
  colorsCompact: {
    gap: Spacing.two,
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
  swatchCompact: {
    maxWidth: SWATCH_COMPACT,
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
  widthRowStart: {
    justifyContent: 'flex-start',
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
  widthCompact: {
    width: WIDTH_COMPACT,
    height: WIDTH_COMPACT,
  },
  widthSelected: {
    borderColor: AppColors.selection,
  },
  dot: {
    backgroundColor: AppColors.text,
  },
});
