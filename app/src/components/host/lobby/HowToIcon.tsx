import type { ReactNode } from 'react';
import { View } from 'react-native';

import { box, dot, GRID, line, type Pen } from '@/components/ui/iconShapes';

export type HowToIconName = 'monitor' | 'fullscreen' | 'phone';

// Formes de chaque icône sur la grille de 24.
function shapes(name: HowToIconName, pen: Pen): ReactNode[] {
  switch (name) {
    case 'monitor':
      return [box(pen, 'screen', 3, 4, 18, 12, 2), line(pen, 'stand', 12, 16, 12, 19), line(pen, 'foot', 8, 20, 16, 20)];
    case 'fullscreen':
      return [
        line(pen, 'tl1', 4, 4, 4, 9), line(pen, 'tl2', 4, 4, 9, 4),
        line(pen, 'tr1', 20, 4, 20, 9), line(pen, 'tr2', 15, 4, 20, 4),
        line(pen, 'br1', 20, 15, 20, 20), line(pen, 'br2', 15, 20, 20, 20),
        line(pen, 'bl1', 4, 15, 4, 20), line(pen, 'bl2', 4, 20, 9, 20),
      ];
    case 'phone':
      return [box(pen, 'body', 7, 3, 10, 18, 2), dot(pen, 'button', 12, 17.5, 1.6)];
  }
}

// Icônes des étapes « Sur un ordinateur » (écran du PC, plein écran, téléphone), dessinées avec des View.
export function HowToIcon({ name, size, color }: { name: HowToIconName; size: number; color: string }) {
  const pen: Pen = { k: size / GRID, color };
  return <View style={{ width: size, height: size }}>{shapes(name, pen)}</View>;
}
