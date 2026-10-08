import type { DrawCategory } from '@shared/drawWords';
import type { ReactNode } from 'react';
import { View } from 'react-native';

import { box, dot, GRID, line, ring, roof, type Pen } from './iconShapes';
import { ball, gamepad } from './ThemeIcon';

// Icônes des catégories de Dessine-moi (maquette D1), en traits, sur la grille de 24 unités des autres
// icônes de l'app (dessinées avec des View : pas de module natif). Loisir et Sport reprennent la manette
// et le ballon des thèmes du quiz.

function paw(pen: Pen): ReactNode[] {
  return [
    ring(pen, 'toe1', 5.5, 10, 4, 5),
    ring(pen, 'toe2', 9.5, 5.5, 4, 5),
    ring(pen, 'toe3', 14.5, 5.5, 4, 5),
    ring(pen, 'toe4', 18.5, 10, 4, 5),
    ring(pen, 'pad', 12, 16.5, 10, 8),
  ];
}

function apple(pen: Pen): ReactNode[] {
  return [ring(pen, 'body', 12, 14, 16, 15), line(pen, 'stem', 12, 7, 13, 3), line(pen, 'leaf', 13.5, 5, 17, 3.5)];
}

function key(pen: Pen): ReactNode[] {
  return [
    ring(pen, 'head', 7, 8, 9, 9),
    line(pen, 'shaft', 10.2, 11.2, 20, 21),
    line(pen, 'tooth1', 15.5, 16.5, 18, 14),
    line(pen, 'tooth2', 18, 19, 20.5, 16.5),
  ];
}

// Maison : toit plein, murs et porte.
function house(pen: Pen): ReactNode[] {
  return [roof(pen, 'roof', 3, 2.5, 18, 8.5), box(pen, 'walls', 5.5, 10, 13, 11, 1), box(pen, 'door', 10, 14.5, 4, 6.5, 0.5)];
}

// Arbre en sucette (maquette D1).
function tree(pen: Pen): ReactNode[] {
  return [ring(pen, 'crown', 12, 9, 11, 11), line(pen, 'trunk', 12, 14.5, 12, 22)];
}

function pin(pen: Pen): ReactNode[] {
  return [
    ring(pen, 'head', 12, 9.5, 13, 13),
    dot(pen, 'center', 12, 9.5, 3.4),
    line(pen, 'sideL', 6.6, 13, 12, 21.5),
    line(pen, 'sideR', 17.4, 13, 12, 21.5),
  ];
}

function car(pen: Pen): ReactNode[] {
  return [
    line(pen, 'roofL', 6, 10, 8, 5.5),
    line(pen, 'roof', 8, 5.5, 16, 5.5),
    line(pen, 'roofR', 16, 5.5, 18, 10),
    box(pen, 'body', 2.5, 10, 19, 7.5, 2.5),
    ring(pen, 'wheelL', 7.5, 18.5, 4, 4),
    ring(pen, 'wheelR', 16.5, 18.5, 4, 4),
  ];
}

function briefcase(pen: Pen): ReactNode[] {
  return [box(pen, 'handle', 8.5, 3.5, 7, 5, 1.5), box(pen, 'body', 2.5, 7.5, 19, 13, 2.5), line(pen, 'belt', 2.5, 13, 21.5, 13)];
}

function tshirt(pen: Pen): ReactNode[] {
  return [
    line(pen, 'shoulderL', 8, 3.5, 3, 7.5),
    line(pen, 'sleeveL', 3, 7.5, 5.5, 11.5),
    line(pen, 'armL', 5.5, 11.5, 7.5, 10.5),
    line(pen, 'sideL', 7.5, 10.5, 7.5, 20.5),
    line(pen, 'hem', 7.5, 20.5, 16.5, 20.5),
    line(pen, 'sideR', 16.5, 20.5, 16.5, 10.5),
    line(pen, 'armR', 16.5, 10.5, 18.5, 11.5),
    line(pen, 'sleeveR', 18.5, 11.5, 21, 7.5),
    line(pen, 'shoulderR', 21, 7.5, 16, 3.5),
    line(pen, 'neckL', 8, 3.5, 10.5, 6),
    line(pen, 'neckBottom', 10.5, 6, 13.5, 6),
    line(pen, 'neckR', 13.5, 6, 16, 3.5),
  ];
}

// Main ouverte : paume et quatre doigts, pouce sur le côté.
function hand(pen: Pen): ReactNode[] {
  return [
    line(pen, 'finger1', 8, 12, 8, 6),
    line(pen, 'finger2', 11, 11, 11, 3.5),
    line(pen, 'finger3', 14, 11, 14, 4),
    line(pen, 'finger4', 17, 12, 17, 7),
    line(pen, 'thumb', 7.5, 16, 4.5, 12.5),
    box(pen, 'palm', 6.5, 11, 12, 10.5, 4.5),
  ];
}

// Mélange : deux flèches croisées.
function shuffle(pen: Pen): ReactNode[] {
  return [
    line(pen, 'aStart', 3, 7, 8, 7),
    line(pen, 'aCross', 8, 7, 15, 17),
    line(pen, 'aEnd', 15, 17, 21, 17),
    line(pen, 'aHead1', 18, 14, 21, 17),
    line(pen, 'aHead2', 18, 20, 21, 17),
    line(pen, 'bStart', 3, 17, 8, 17),
    line(pen, 'bCross', 8, 17, 15, 7),
    line(pen, 'bEnd', 15, 7, 21, 7),
    line(pen, 'bHead1', 18, 4, 21, 7),
    line(pen, 'bHead2', 18, 10, 21, 7),
  ];
}

const DRAWINGS: Record<DrawCategory, (pen: Pen) => ReactNode[]> = {
  Animal: paw,
  Nourriture: apple,
  Objet: key,
  Maison: house,
  Nature: tree,
  Lieu: pin,
  Transport: car,
  Métier: briefcase,
  Sport: ball,
  Loisir: gamepad,
  Vêtement: tshirt,
  Corps: hand,
};

export function DrawCategoryIcon({ category, size, color }: { category: DrawCategory | 'mix'; size: number; color: string }) {
  const draw = category === 'mix' ? shuffle : DRAWINGS[category];
  return (
    <View style={{ width: size, height: size }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {draw({ k: size / GRID, color })}
    </View>
  );
}
