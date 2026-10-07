import type { QuizIconName } from '@shared/themeIcons';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppColors, AppFonts } from '@/constants/appTheme';

import { GENRE_DRAWINGS } from './genreIcons';
import { box, clipped, dot, GRID, line, ring, roof, STROKE, type Pen } from './iconShapes';

// Icônes des quiz : thèmes (maquette I2) et genres de blind test (I3, genreIcons), dessinées avec des
// View comme SettingsIcon : aucune image ni bibliothèque, même rendu sur Android et le web. Traits
// blancs arrondis, ombre dure bleu nuit. Grille de 24 unités, mise à l'échelle (18 à 64 px).

function clapper(pen: Pen): ReactNode[] {
  return [
    box(pen, 'body', 3, 10, 18, 11, 2),
    box(pen, 'band', 3, 4.5, 18, 5.5, 1.5),
    line(pen, 'stripe1', 9.5, 5.5, 7.5, 9),
    line(pen, 'stripe2', 15, 5.5, 13, 9),
  ];
}

function globe(pen: Pen): ReactNode[] {
  return [ring(pen, 'outer', 12, 12, 19, 19), ring(pen, 'meridian', 12, 12, 8.5, 19), line(pen, 'equator', 3.5, 12, 20.5, 12)];
}

function columns(pen: Pen): ReactNode[] {
  return [
    roof(pen, 'roof', 2.5, 2.5, 19, 5.5),
    line(pen, 'beam', 3.5, 9.5, 20.5, 9.5),
    line(pen, 'column1', 6, 12.5, 6, 17.5),
    line(pen, 'column2', 12, 12.5, 12, 17.5),
    line(pen, 'column3', 18, 12.5, 18, 17.5),
    line(pen, 'base', 3, 20.5, 21, 20.5),
  ];
}

function gamepad(pen: Pen): ReactNode[] {
  return [
    box(pen, 'body', 1.5, 6.5, 21, 11, 5.5),
    line(pen, 'crossH', 5.5, 12, 9.5, 12),
    line(pen, 'crossV', 7.5, 10, 7.5, 14),
    dot(pen, 'buttonA', 15, 12, 2.8),
    dot(pen, 'buttonB', 18.5, 12, 2.8),
  ];
}

const NOTE_HEAD = 6.5;
// Hampe posée sur le trait de la tête (bord droit du cercle, moins un demi-trait) : elles se rejoignent.
const NOTE_STEM_SHIFT = NOTE_HEAD / 2 - STROKE / 2;

export function note(pen: Pen): ReactNode[] {
  const stem1 = 6.5 + NOTE_STEM_SHIFT;
  const stem2 = 16.5 + NOTE_STEM_SHIFT;
  return [
    ring(pen, 'head1', 6.5, 18, NOTE_HEAD, NOTE_HEAD),
    ring(pen, 'head2', 16.5, 16, NOTE_HEAD, NOTE_HEAD),
    line(pen, 'stem1', stem1, 18, stem1, 5.5),
    line(pen, 'stem2', stem2, 16, stem2, 3.5),
    line(pen, 'beam', stem1, 5.5, stem2, 3.5),
  ];
}

function flask(pen: Pen): ReactNode[] {
  return [
    line(pen, 'lip', 7.5, 2.5, 16.5, 2.5),
    line(pen, 'neckL', 9.5, 2.5, 9.5, 9),
    line(pen, 'neckR', 14.5, 2.5, 14.5, 9),
    line(pen, 'sideL', 9.5, 9, 4.5, 20),
    line(pen, 'sideR', 14.5, 9, 19.5, 20),
    line(pen, 'bottom', 4.5, 20.5, 19.5, 20.5),
    line(pen, 'liquid', 7.2, 14.5, 16.8, 14.5),
  ];
}

const BALL = { x: 2.5, y: 2.5, w: 19, h: 19, radius: 9.5 };

// Ballon : contour, puis les coutures dans un disque qui les découpe.
function ball(pen: Pen): ReactNode[] {
  return [
    clipped(pen, 'seams', BALL, (seams) => [
      line(seams, 'vertical', 12, 1, 12, 23),
      line(seams, 'horizontal', 1, 12, 23, 12),
      ring(seams, 'left', 2.5, 12, 12, 17),
      ring(seams, 'right', 21.5, 12, 12, 17),
    ]),
    ring(pen, 'outer', 12, 12, BALL.w, BALL.h),
  ];
}

const DRAWINGS: Record<Exclude<QuizIconName, 'question'>, (pen: Pen) => ReactNode[]> = {
  clapper,
  globe,
  columns,
  gamepad,
  note,
  flask,
  ball,
  ...GENRE_DRAWINGS,
};

interface ThemeIconProps {
  name: QuizIconName;
  // Côté de l'icône en pixels (18 dans les puces, jusqu'à 64 sur les affiches).
  size: number;
}

export function ThemeIcon({ name, size }: ThemeIconProps) {
  // Ombre dure bleu nuit, décalée vers le bas comme celle des badges.
  const shadowOffset = Math.max(1, Math.round(size * 0.05));
  if (name === 'question') return <QuestionMark size={size} shadowOffset={shadowOffset} />;
  const draw = DRAWINGS[name];
  const k = size / GRID;
  return (
    <View style={{ width: size, height: size + shadowOffset }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <View style={[StyleSheet.absoluteFill, { top: shadowOffset }]}>{draw({ k, color: AppColors.themeIconShadow })}</View>
      <View style={StyleSheet.absoluteFill}>{draw({ k, color: AppColors.themeIcon })}</View>
    </View>
  );
}

// Culture générale : le « ? » de l'affiche, en police d'affichage.
function QuestionMark({ size, shadowOffset }: { size: number; shadowOffset: number }) {
  const style = {
    fontSize: size,
    lineHeight: Math.round(size * 1.15),
    textShadowOffset: { width: 0, height: shadowOffset },
  };
  return (
    <View style={[styles.questionBox, { width: size, height: size + shadowOffset }]}>
      <Text style={[styles.question, style]} accessibilityElementsHidden importantForAccessibility="no">
        ?
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  questionBox: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  question: {
    color: AppColors.themeIcon,
    fontFamily: AppFonts.display,
    textAlign: 'center',
    textShadowColor: AppColors.themeIconShadow,
    textShadowRadius: 0,
  },
});
