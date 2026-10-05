import type { ThemeIconName } from '@shared/themeIcons';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { AppColors, AppFonts } from '@/constants/appTheme';

// Icônes de thème (maquette I2) dessinées avec des View, comme SettingsIcon : aucune image ni
// bibliothèque, même rendu sur Android et le web. Traits blancs arrondis, ombre dure bleu nuit.
// Tracés sur une grille de 24 unités, mis à l'échelle de la taille demandée (18 à 64 px).

const GRID = 24;
const STROKE = 2.2;

// Crayon : échelle (pixels par unité de grille), couleur, décalage d'une zone découpée (ballon).
interface Pen {
  k: number;
  color: string;
  dx?: number;
  dy?: number;
}

function at(pen: Pen, x: number, y: number) {
  return { x: (x + (pen.dx ?? 0)) * pen.k, y: (y + (pen.dy ?? 0)) * pen.k };
}

// Trait arrondi d'un point à un autre : barre centrée sur le milieu, tournée selon l'angle.
function line(pen: Pen, key: string, x1: number, y1: number, x2: number, y2: number): ReactNode {
  const length = Math.hypot(x2 - x1, y2 - y1) + STROKE;
  const middle = at(pen, (x1 + x2) / 2, (y1 + y2) / 2);
  const width = length * pen.k;
  const height = STROKE * pen.k;
  const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
  const style: ViewStyle = {
    position: 'absolute',
    left: middle.x - width / 2,
    top: middle.y - height / 2,
    width,
    height,
    borderRadius: height / 2,
    backgroundColor: pen.color,
    transform: [{ rotate: `${angle}deg` }],
  };
  return <View key={key} style={style} />;
}

// Contour d'ellipse (ou de cercle) centré en (cx, cy).
function ring(pen: Pen, key: string, cx: number, cy: number, w: number, h: number): ReactNode {
  const corner = at(pen, cx - w / 2, cy - h / 2);
  const style: ViewStyle = {
    position: 'absolute',
    left: corner.x,
    top: corner.y,
    width: w * pen.k,
    height: h * pen.k,
    borderRadius: (Math.max(w, h) / 2) * pen.k,
    borderWidth: STROKE * pen.k,
    borderColor: pen.color,
  };
  return <View key={key} style={style} />;
}

// Contour de rectangle arrondi.
function box(pen: Pen, key: string, x: number, y: number, w: number, h: number, radius: number): ReactNode {
  const corner = at(pen, x, y);
  const style: ViewStyle = {
    position: 'absolute',
    left: corner.x,
    top: corner.y,
    width: w * pen.k,
    height: h * pen.k,
    borderRadius: radius * pen.k,
    borderWidth: STROKE * pen.k,
    borderColor: pen.color,
  };
  return <View key={key} style={style} />;
}

// Disque plein.
function dot(pen: Pen, key: string, cx: number, cy: number, d: number): ReactNode {
  const corner = at(pen, cx - d / 2, cy - d / 2);
  const style: ViewStyle = {
    position: 'absolute',
    left: corner.x,
    top: corner.y,
    width: d * pen.k,
    height: d * pen.k,
    borderRadius: (d / 2) * pen.k,
    backgroundColor: pen.color,
  };
  return <View key={key} style={style} />;
}

// Triangle plein pointe en haut (fronton), par l'astuce des bordures.
function roof(pen: Pen, key: string, x: number, y: number, w: number, h: number): ReactNode {
  const corner = at(pen, x, y);
  const style: ViewStyle = {
    position: 'absolute',
    left: corner.x,
    top: corner.y,
    width: 0,
    height: 0,
    borderLeftWidth: (w / 2) * pen.k,
    borderRightWidth: (w / 2) * pen.k,
    borderBottomWidth: h * pen.k,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: pen.color,
  };
  return <View key={key} style={style} />;
}

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

function note(pen: Pen): ReactNode[] {
  return [
    ring(pen, 'head1', 6.5, 18, 6.5, 6.5),
    ring(pen, 'head2', 16.5, 16, 6.5, 6.5),
    line(pen, 'stem1', 9.6, 18, 9.6, 5.5),
    line(pen, 'stem2', 19.6, 16, 19.6, 3.5),
    line(pen, 'beam', 9.6, 5.5, 19.6, 3.5),
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

const BALL = { x: 2.5, y: 2.5, d: 19 };

// Ballon : contour, puis les coutures dans un disque qui les découpe (overflow hidden).
function ball(pen: Pen): ReactNode[] {
  const seams: Pen = { ...pen, dx: -BALL.x, dy: -BALL.y };
  const clip: ViewStyle = {
    position: 'absolute',
    left: BALL.x * pen.k,
    top: BALL.y * pen.k,
    width: BALL.d * pen.k,
    height: BALL.d * pen.k,
    borderRadius: (BALL.d / 2) * pen.k,
    overflow: 'hidden',
  };
  return [
    <View key="seams" style={clip}>
      {line(seams, 'vertical', 12, 1, 12, 23)}
      {line(seams, 'horizontal', 1, 12, 23, 12)}
      {ring(seams, 'left', 2.5, 12, 12, 17)}
      {ring(seams, 'right', 21.5, 12, 12, 17)}
    </View>,
    ring(pen, 'outer', 12, 12, BALL.d, BALL.d),
  ];
}

const DRAWINGS: Record<Exclude<ThemeIconName, 'question'>, (pen: Pen) => ReactNode[]> = {
  clapper,
  globe,
  columns,
  gamepad,
  note,
  flask,
  ball,
};

interface ThemeIconProps {
  name: ThemeIconName;
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
