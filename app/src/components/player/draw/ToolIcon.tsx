import type { ReactNode } from 'react';
import { View } from 'react-native';

import { GENRE_DRAWINGS } from '@/components/ui/genreIcons';
import { box, clipped, dot, GRID, line, ring, STROKE, type Pen } from '@/components/ui/iconShapes';

export type ToolIconName = 'pen' | 'eraser' | 'bucket' | 'undo' | 'clear' | 'zoomIn' | 'zoomOut' | 'fit';

// Gomme : bloc en biais, sa bande, et la ligne du sol.
function eraser(pen: Pen): ReactNode[] {
  return [
    line(pen, 'a', 4, 14, 12, 6),
    line(pen, 'b', 12, 6, 19, 13),
    line(pen, 'c', 19, 13, 11, 21),
    line(pen, 'd', 11, 21, 4, 14),
    line(pen, 'band', 8, 10, 15, 17),
    line(pen, 'floor', 13, 21, 20, 21),
  ];
}

// Pot de peinture : seau évasé, anse en pointe au-dessus, goutte qui tombe à droite.
function bucket(pen: Pen): ReactNode[] {
  return [
    line(pen, 'rim', 3, 9, 16, 9),
    line(pen, 'left', 3, 9, 5, 21),
    line(pen, 'right', 16, 9, 14, 21),
    line(pen, 'bottom', 5, 21, 14, 21),
    line(pen, 'handleA', 3, 9, 9.5, 3.5),
    line(pen, 'handleB', 9.5, 3.5, 16, 9),
    line(pen, 'drip', 20, 10, 20, 14),
    dot(pen, 'drop', 20, 17.5, 3.4),
  ];
}

// Annuler : flèche vers la gauche qui revient en demi-cercle par la droite. Le demi-cercle a pour rayon
// UNDO_RADIUS au centre du trait : ring() se mesure au bord extérieur, d'où le trait ajouté à sa taille ; ainsi
// il se raccorde exactement aux deux traits droits (sans marche, qui donnait un « 5 »).
const UNDO_RADIUS = 5;
const UNDO_TOP = 8;
const UNDO_TURN_X = 14;

function undo(pen: Pen): ReactNode[] {
  const bottom = UNDO_TOP + 2 * UNDO_RADIUS;
  const ringSize = 2 * UNDO_RADIUS + STROKE;
  return [
    line(pen, 'top', 5, UNDO_TOP, UNDO_TURN_X, UNDO_TOP),
    clipped(pen, 'curve', { x: UNDO_TURN_X, y: 0, w: GRID - UNDO_TURN_X, h: GRID, radius: 0 }, (inner) => [
      ring(inner, 'arc', UNDO_TURN_X, UNDO_TOP + UNDO_RADIUS, ringSize, ringSize),
    ]),
    line(pen, 'bottom', 9, bottom, UNDO_TURN_X, bottom),
    line(pen, 'headA', 5, UNDO_TOP, 8.5, UNDO_TOP - 3.5),
    line(pen, 'headB', 5, UNDO_TOP, 8.5, UNDO_TOP + 3.5),
  ];
}

// Corbeille : couvercle, poignée, cuve et ses deux rainures.
function clear(pen: Pen): ReactNode[] {
  return [
    line(pen, 'lid', 4, 7, 20, 7),
    line(pen, 'grip', 10, 3.5, 14, 3.5),
    box(pen, 'can', 6, 8, 12, 13, 2),
    line(pen, 'grooveA', 10, 12, 10, 17),
    line(pen, 'grooveB', 14, 12, 14, 17),
  ];
}

// Loupe (zoom) : verre, manche, et le signe − ou +.
function magnifier(pen: Pen, withPlus: boolean): ReactNode[] {
  return [
    ring(pen, 'glass', 10.5, 10.5, 14, 14),
    line(pen, 'handle', 16, 16, 20.5, 20.5),
    line(pen, 'minus', 7.5, 10.5, 13.5, 10.5),
    ...(withPlus ? [line(pen, 'plus', 10.5, 7.5, 10.5, 13.5)] : []),
  ];
}

// Ajuster : les quatre coins d'un cadre (voir tout le dessin).
function fit(pen: Pen): ReactNode[] {
  return [
    line(pen, 'tlA', 4, 4, 9, 4),
    line(pen, 'tlB', 4, 4, 4, 9),
    line(pen, 'trA', 15, 4, 20, 4),
    line(pen, 'trB', 20, 4, 20, 9),
    line(pen, 'blA', 4, 20, 9, 20),
    line(pen, 'blB', 4, 15, 4, 20),
    line(pen, 'brA', 15, 20, 20, 20),
    line(pen, 'brB', 20, 15, 20, 20),
  ];
}

const DRAWINGS: Record<ToolIconName, (pen: Pen) => ReactNode[]> = {
  pen: GENRE_DRAWINGS.pencil,
  eraser,
  bucket,
  undo,
  clear,
  zoomIn: (pen) => magnifier(pen, true),
  zoomOut: (pen) => magnifier(pen, false),
  fit,
};

// Icônes des outils du dessinateur (maquette E1), dessinées en traits sur la grille commune des icônes.
export function ToolIcon({ name, size, color }: { name: ToolIconName; size: number; color: string }) {
  return <View style={{ width: size, height: size }}>{DRAWINGS[name]({ k: size / GRID, color })}</View>;
}
