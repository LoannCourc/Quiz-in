import { StyleSheet, View } from 'react-native';

// Icônes des réglages, dessinées avec des formes simples dans un carré de 24 (aucune dépendance,
// même rendu sur Android et le web) : curseurs, grille, clavier, éclair, coche, groupe, chevron.
export type SettingsIconName = 'sliders' | 'grid' | 'keyboard' | 'bolt' | 'check' | 'group' | 'chevron';

const SIZE = 24;
const STROKE = 2.5;

interface SettingsIconProps {
  name: SettingsIconName;
  color: string;
}

export function SettingsIcon({ name, color }: SettingsIconProps) {
  return <View style={styles.box}>{renderIcon(name, color)}</View>;
}

function renderIcon(name: SettingsIconName, color: string) {
  const fill = { backgroundColor: color };
  const line = { borderColor: color };
  switch (name) {
    case 'sliders':
      return (
        <>
          <View style={[styles.sliderBar, { top: 6 }, fill]} />
          <View style={[styles.sliderKnob, { top: 3, left: 13 }, fill]} />
          <View style={[styles.sliderBar, { top: 16 }, fill]} />
          <View style={[styles.sliderKnob, { top: 13, left: 4 }, fill]} />
        </>
      );
    case 'grid':
      return [
        [2, 2],
        [13, 2],
        [2, 13],
        [13, 13],
      ].map(([left, top]) => <View key={`${left}-${top}`} style={[styles.gridCell, { left, top }, fill]} />);
    case 'keyboard':
      return (
        <View style={[styles.keyboard, line]}>
          <View style={styles.keyRow}>
            {[0, 1, 2, 3].map((key) => (
              <View key={key} style={[styles.key, fill]} />
            ))}
          </View>
          <View style={[styles.spaceBar, fill]} />
        </View>
      );
    case 'bolt':
      // Deux triangles (bordures) qui se chevauchent au milieu : le haut descend vers la gauche,
      // le bas repart vers la droite et finit en pointe.
      return (
        <>
          <View style={[styles.boltTop, { borderBottomColor: color }]} />
          <View style={[styles.boltBottom, { borderTopColor: color }]} />
        </>
      );
    case 'check':
      return (
        <View style={[styles.ring, line]}>
          <View style={[styles.checkMark, line]} />
        </View>
      );
    case 'group':
      return (
        <>
          <View style={[styles.head, { left: 3 }, line]} />
          <View style={[styles.shoulders, { left: 0 }, line]} />
          <View style={[styles.head, { left: 14 }, line]} />
          <View style={[styles.shoulders, { left: 11 }, line]} />
        </>
      );
    case 'chevron':
      return <View style={[styles.chevron, line]} />;
  }
}

const styles = StyleSheet.create({
  box: {
    width: SIZE,
    height: SIZE,
  },
  sliderBar: {
    position: 'absolute',
    left: 1,
    width: SIZE - 2,
    height: STROKE,
    borderRadius: STROKE / 2,
  },
  sliderKnob: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  gridCell: {
    position: 'absolute',
    width: 9,
    height: 9,
    borderRadius: 2,
  },
  keyboard: {
    position: 'absolute',
    top: 4,
    left: 1,
    width: SIZE - 2,
    height: 16,
    borderRadius: 3,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  keyRow: {
    flexDirection: 'row',
    gap: 2,
  },
  key: {
    width: 2.5,
    height: 2.5,
    borderRadius: 1,
  },
  spaceBar: {
    width: 11,
    height: 2,
    borderRadius: 1,
  },
  // Triangle rectangle en bas à droite : sommets (4, 13), (14, 13), (14, 1).
  boltTop: {
    position: 'absolute',
    left: 4,
    top: 1,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderBottomWidth: 12,
    borderLeftColor: 'transparent',
  },
  // Triangle rectangle en haut à gauche : sommets (10, 11), (20, 11), (10, 23).
  boltBottom: {
    position: 'absolute',
    left: 10,
    top: 11,
    width: 0,
    height: 0,
    borderRightWidth: 10,
    borderTopWidth: 12,
    borderRightColor: 'transparent',
  },
  ring: {
    position: 'absolute',
    top: 1,
    left: 1,
    width: SIZE - 2,
    height: SIZE - 2,
    borderRadius: (SIZE - 2) / 2,
    borderWidth: STROKE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // « L » tourné : la coche.
  checkMark: {
    width: 9,
    height: 5,
    marginTop: -3,
    borderLeftWidth: STROKE,
    borderBottomWidth: STROKE,
    transform: [{ rotate: '-45deg' }],
  },
  head: {
    position: 'absolute',
    top: 3,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    borderWidth: 2,
  },
  shoulders: {
    position: 'absolute',
    top: 13,
    width: 13,
    height: 8,
    borderTopLeftRadius: 6.5,
    borderTopRightRadius: 6.5,
    borderWidth: 2,
    borderBottomWidth: 0,
  },
  // Carré dont on garde deux côtés, tourné de 45° : « › ».
  chevron: {
    position: 'absolute',
    top: 7,
    left: 5,
    width: 10,
    height: 10,
    borderTopWidth: STROKE,
    borderRightWidth: STROKE,
    transform: [{ rotate: '45deg' }],
  },
});
