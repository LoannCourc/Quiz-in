import type { TeamId } from '@shared/types';
import { StyleSheet, View } from 'react-native';

import { AppColors } from '@/constants/appTheme';

// Symbole de chaque équipe, dessiné avec des formes simples (les polices du jeu n'ont pas ces signes) :
// Rose étoile, Cyan rond, Or triangle, Vert carré. Même rendu sur Android et sur le web.
export function TeamSymbol({ team, size, color }: { team: TeamId; size: number; color: string }) {
  return <View style={[styles.box, { width: size, height: size }]}>{renderShape(team, size, color)}</View>;
}

// Pastille d'équipe : carré arrondi de la couleur de l'équipe, symbole en encre au centre.
export function TeamTile({ team, size }: { team: TeamId; size: number }) {
  return (
    <View style={[styles.box, { width: size, height: size, borderRadius: size * 0.26, backgroundColor: AppColors.teams[team] }]}>
      <TeamSymbol team={team} size={size * 0.56} color={AppColors.onTeam} />
    </View>
  );
}

// Triangle dessiné par les bordures d'une boîte vide : base en bas, pointe en haut.
function triangle(halfWidth: number, height: number, color: string) {
  return {
    width: 0,
    height: 0,
    borderLeftWidth: halfWidth,
    borderRightWidth: halfWidth,
    borderBottomWidth: height,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: color,
  } as const;
}

const STAR_POINTS = [0, 72, 144, 216, 288];

function renderShape(team: TeamId, size: number, color: string) {
  switch (team) {
    case 'cyan':
      return <View style={{ width: size * 0.8, height: size * 0.8, borderRadius: size * 0.4, backgroundColor: color }} />;
    case 'green':
      return <View style={{ width: size * 0.74, height: size * 0.74, borderRadius: size * 0.08, backgroundColor: color }} />;
    case 'gold':
      return <View style={[triangle(size * 0.48, size * 0.84, color), { marginTop: -size * 0.06 }]} />;
    case 'pink': {
      // Étoile à cinq branches : cinq pointes tournées de 72° autour du centre, et un disque au centre.
      const radius = size / 2;
      return (
        <>
          {STAR_POINTS.map((angle) => (
            <View key={angle} style={[styles.layer, { width: size, height: size, transform: [{ rotate: `${angle}deg` }] }]}>
              <View style={triangle(radius * 0.325, radius, color)} />
            </View>
          ))}
          <View style={{ width: radius * 0.66, height: radius * 0.66, borderRadius: radius * 0.33, backgroundColor: color }} />
        </>
      );
    }
  }
}

const styles = StyleSheet.create({
  box: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  layer: {
    position: 'absolute',
    top: 0,
    left: 0,
    alignItems: 'center',
  },
});
