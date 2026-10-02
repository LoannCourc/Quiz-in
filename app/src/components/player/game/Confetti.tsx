import { StyleSheet, View } from 'react-native';

import { AppColors } from '@/constants/appTheme';

type Piece = { top: number; left?: `${number}%`; right?: `${number}%`; rotate: `${number}deg` };

// Confettis fixes (aucune animation), placés dans les marges latérales de chaque écran pour ne
// jamais passer devant un texte ou un avatar. Repères : écran de 390 px de large.
const LAYOUTS = {
  // Révélation : côtés du titre et de la pièce (la pièce de 224 px laisse ~80 px de chaque côté).
  reveal: [
    { top: 18, left: '3%', rotate: '-25deg' },
    { top: 10, right: '4%', rotate: '60deg' },
    { top: 165, left: '5%', rotate: '-50deg' },
    { top: 230, right: '4%', rotate: '30deg' },
    { top: 310, left: '8%', rotate: '15deg' },
  ],
  // Fin : côtés du titre, au-dessus du bandeau de résultat.
  end: [
    { top: 8, left: '3%', rotate: '-25deg' },
    { top: 14, right: '6%', rotate: '60deg' },
    { top: 74, right: '2%', rotate: '30deg' },
    { top: 90, left: '4%', rotate: '-50deg' },
  ],
} satisfies Record<string, Piece[]>;

export function Confetti({ layout }: { layout: keyof typeof LAYOUTS }) {
  return (
    <>
      {LAYOUTS[layout].map(({ rotate, ...position }: Piece, index) => (
        <View
          key={index}
          pointerEvents="none"
          style={[
            styles.piece,
            position,
            { backgroundColor: AppColors.confetti[index % AppColors.confetti.length], transform: [{ rotate }] },
          ]}
        />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  piece: {
    position: 'absolute',
    width: 14,
    height: 28,
    borderRadius: 3,
  },
});
