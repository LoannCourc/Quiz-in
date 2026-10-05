import type { ReactNode } from 'react';
import { View, type ViewStyle } from 'react-native';

// Formes de base des icônes des quiz (ThemeIcon, genreIcons), dessinées avec des View sur une grille de
// GRID unités mises à l'échelle : traits arrondis, contours, disques, triangle plein, zone découpée.

export const GRID = 24;
export const STROKE = 2.2;

// Crayon : échelle (pixels par unité de grille), couleur, décalage d'une zone découpée (ballon).
export interface Pen {
  k: number;
  color: string;
  dx?: number;
  dy?: number;
}

function at(pen: Pen, x: number, y: number) {
  return { x: (x + (pen.dx ?? 0)) * pen.k, y: (y + (pen.dy ?? 0)) * pen.k };
}

// Trait arrondi d'un point à un autre : barre centrée sur le milieu, tournée selon l'angle. Un trait
// vertical ou horizontal est une barre droite, sans rotation : sur Android, une barre tournée de 90° est
// arrondie au pixel avant d'être tournée et peut se décaler d'un pixel par rapport aux autres formes.
export function line(pen: Pen, key: string, x1: number, y1: number, x2: number, y2: number): ReactNode {
  if (x1 === x2 || y1 === y2) return straight(pen, key, x1, y1, x2, y2);
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

function straight(pen: Pen, key: string, x1: number, y1: number, x2: number, y2: number): ReactNode {
  const corner = at(pen, Math.min(x1, x2) - STROKE / 2, Math.min(y1, y2) - STROKE / 2);
  const style: ViewStyle = {
    position: 'absolute',
    left: corner.x,
    top: corner.y,
    width: (Math.abs(x2 - x1) + STROKE) * pen.k,
    height: (Math.abs(y2 - y1) + STROKE) * pen.k,
    borderRadius: (STROKE / 2) * pen.k,
    backgroundColor: pen.color,
  };
  return <View key={key} style={style} />;
}

// Contour d'ellipse (ou de cercle) centré en (cx, cy).
export function ring(pen: Pen, key: string, cx: number, cy: number, w: number, h: number): ReactNode {
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
export function box(pen: Pen, key: string, x: number, y: number, w: number, h: number, radius: number): ReactNode {
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
export function dot(pen: Pen, key: string, cx: number, cy: number, d: number): ReactNode {
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
export function roof(pen: Pen, key: string, x: number, y: number, w: number, h: number): ReactNode {
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

// Zone découpée (overflow hidden), rectangle arrondi ou disque : ses tracés, en coordonnées de la grille,
// ne dépassent pas son bord (coutures du ballon, reflets de la boule disco, arceau du casque).
export function clipped(
  pen: Pen,
  key: string,
  area: { x: number; y: number; w: number; h: number; radius: number },
  draw: (inner: Pen) => ReactNode[],
): ReactNode {
  const corner = at(pen, area.x, area.y);
  const style: ViewStyle = {
    position: 'absolute',
    left: corner.x,
    top: corner.y,
    width: area.w * pen.k,
    height: area.h * pen.k,
    borderRadius: area.radius * pen.k,
    overflow: 'hidden',
  };
  const inner: Pen = { ...pen, dx: (pen.dx ?? 0) - area.x, dy: (pen.dy ?? 0) - area.y };
  return (
    <View key={key} style={style}>
      {draw(inner)}
    </View>
  );
}
