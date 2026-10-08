import { View } from 'react-native';

import { box, dot, GRID, line, type Pen } from './iconShapes';

// Clavier (bouton « J'ai un code », maquette J1) : cadre arrondi, deux rangées de touches, barre d'espace.
export function KeyboardIcon({ size, color }: { size: number; color: string }) {
  const pen: Pen = { k: size / GRID, color };
  return (
    <View style={{ width: size, height: size }}>
      {box(pen, 'frame', 2, 5, 20, 14, 3)}
      {[6.5, 10, 13.5, 17].map((x) => dot(pen, `top-${x}`, x, 9.5, 2))}
      {[6.5, 17].map((x) => dot(pen, `mid-${x}`, x, 13, 2))}
      {line(pen, 'space', 9, 14.5, 15, 14.5)}
    </View>
  );
}
