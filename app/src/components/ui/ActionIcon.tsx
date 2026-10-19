import type { ReactNode } from 'react';
import { View } from 'react-native';

import { box, GRID, line, type Pen } from './iconShapes';

export type ActionIconName = 'share' | 'copy';

// Formes sur la grille de 24 : partage (boîte ouverte et flèche vers le haut), copie (deux feuilles).
function shapes(name: ActionIconName, pen: Pen): ReactNode[] {
  switch (name) {
    case 'share':
      return [
        line(pen, 'left', 5, 11, 5, 20), line(pen, 'bottom', 5, 20, 19, 20), line(pen, 'right', 19, 11, 19, 20),
        line(pen, 'shaft', 12, 3, 12, 14), line(pen, 'headL', 12, 3, 8, 7), line(pen, 'headR', 12, 3, 16, 7),
      ];
    case 'copy':
      return [line(pen, 'backV', 4, 4, 4, 14), line(pen, 'backH', 4, 4, 14, 4), box(pen, 'front', 8, 8, 12, 12, 2)];
  }
}

// Icônes des boutons « Partager », « Copier », « M'envoyer » (maquettes Inviter et « Sur un ordinateur »),
// dessinées avec des View (aucune police d'icônes).
export function ActionIcon({ name, size, color }: { name: ActionIconName; size: number; color: string }) {
  const pen: Pen = { k: size / GRID, color };
  return <View style={{ width: size, height: size }}>{shapes(name, pen)}</View>;
}
