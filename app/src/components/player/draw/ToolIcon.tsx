import type { ReactNode } from 'react';
import { View } from 'react-native';

import { GENRE_DRAWINGS } from '@/components/ui/genreIcons';
import { box, clipped, dot, GRID, line, ring, type Pen } from '@/components/ui/iconShapes';

export type ToolIconName = 'pen' | 'eraser' | 'bucket' | 'undo' | 'clear';

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

// Annuler : flèche vers la gauche qui revient en arc par la droite.
function undo(pen: Pen): ReactNode[] {
  return [
    line(pen, 'top', 6, 7, 13, 7),
    clipped(pen, 'curve', { x: 13, y: 5, w: 9, h: 18, radius: 0 }, (inner) => [ring(inner, 'arc', 13, 13, 14, 12)]),
    line(pen, 'bottom', 8, 19, 13, 19),
    line(pen, 'headA', 6, 7, 9.5, 3.5),
    line(pen, 'headB', 6, 7, 9.5, 10.5),
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

const DRAWINGS: Record<ToolIconName, (pen: Pen) => ReactNode[]> = {
  pen: GENRE_DRAWINGS.pencil,
  eraser,
  bucket,
  undo,
  clear,
};

// Icônes des outils du dessinateur (maquette E1), dessinées en traits sur la grille commune des icônes.
export function ToolIcon({ name, size, color }: { name: ToolIconName; size: number; color: string }) {
  return <View style={{ width: size, height: size }}>{DRAWINGS[name]({ k: size / GRID, color })}</View>;
}
