import { View } from 'react-native';

import { clipped, dot, GRID, line, ring, type Pen } from '@/components/ui/iconShapes';

// Œil (mot affiché) ou œil barré (mot masqué), dans l'app de l'hôte qui dessine : même dessin que la
// version web (EyeIcon.web.tsx, en SVG), tracé avec les formes communes des icônes. L'œil est la partie
// centrale d'un grand cercle (amande), la pupille un rond plein.
export function EyeIcon({ isOpen, size, color }: { isOpen: boolean; size: number; color: string }) {
  const pen: Pen = { k: size / GRID, color };
  return (
    <View style={{ width: size, height: size }}>
      {clipped(pen, 'upper', { x: 1, y: 5, w: 22, h: 7, radius: 0 }, (inner) => [ring(inner, 'arc', 12, 17, 24, 24)])}
      {clipped(pen, 'lower', { x: 1, y: 12, w: 22, h: 7, radius: 0 }, (inner) => [ring(inner, 'arc', 12, 7, 24, 24)])}
      {ring(pen, 'iris', 12, 12, 8.6, 8.6)}
      {dot(pen, 'pupil', 12, 12, 2.4)}
      {!isOpen && line(pen, 'slash', 4, 4, 20, 20)}
    </View>
  );
}
