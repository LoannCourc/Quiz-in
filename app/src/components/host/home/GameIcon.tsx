import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { GENRE_DRAWINGS } from '@/components/ui/genreIcons';
import { box, dot, GRID, line, type Pen } from '@/components/ui/iconShapes';
import { note } from '@/components/ui/ThemeIcon';
import { AppFonts } from '@/constants/appTheme';
import type { GameType } from '@/constants/strings';

// Icônes des jeux de l'accueil (maquette H1), dessinées avec des View comme ThemeIcon, dans la couleur de
// la tuile, sur le disque encre : « ? » (Quiz), note (Blind test), bulle de dialogue (Bluff), crayon
// (Dessine-moi). Grille de 24 unités.

// Bulle de dialogue avec ses trois points.
function bubble(pen: Pen): ReactNode[] {
  return [
    box(pen, 'body', 2, 3.5, 20, 14, 6),
    line(pen, 'tailA', 7, 17, 5.5, 21.5),
    line(pen, 'tailB', 5.5, 21.5, 11.5, 17.2),
    dot(pen, 'dot1', 7.5, 10.5, 2.8),
    dot(pen, 'dot2', 12, 10.5, 2.8),
    dot(pen, 'dot3', 16.5, 10.5, 2.8),
  ];
}

const DRAWINGS: Record<Exclude<GameType, 'quiz'>, (pen: Pen) => ReactNode[]> = {
  blindTest: note,
  bluff: bubble,
  draw: GENRE_DRAWINGS.pencil,
};

export function GameIcon({ game, size, color }: { game: GameType; size: number; color: string }) {
  if (game === 'quiz') {
    return (
      <View style={[styles.box, { width: size, height: size }]}>
        <Text style={[styles.question, { color, fontSize: size, lineHeight: Math.round(size * 1.15) }]}>?</Text>
      </View>
    );
  }
  return <View style={{ width: size, height: size }}>{DRAWINGS[game]({ k: size / GRID, color })}</View>;
}

const styles = StyleSheet.create({
  box: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  question: {
    fontFamily: AppFonts.display,
    textAlign: 'center',
  },
});
