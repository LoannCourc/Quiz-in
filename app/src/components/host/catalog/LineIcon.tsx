import { StyleSheet, View } from 'react-native';

import { AppColors } from '@/constants/appTheme';

const SIZE = 24;
const STROKE = 3;
const LENS = 13;
const HANDLE = 7;

// Icônes dessinées avec des formes simples (aucune police d'icônes à charger) : loupe et croix.
// Loupe : cercle puis manche collé dessous, dans une colonne tournée d'un bloc de 45° (le manche
// part en diagonale vers le bas à droite). Sans position absolue, le rendu est le même sur Android et le web.
export function LineIcon({ name }: { name: 'search' | 'close' }) {
  return (
    <View style={styles.box}>
      {name === 'search' ? (
        <View style={styles.magnifier}>
          <View style={styles.lens} />
          <View style={styles.handle} />
        </View>
      ) : (
        <>
          <View style={[styles.bar, { transform: [{ rotate: '45deg' }] }]} />
          <View style={[styles.bar, { transform: [{ rotate: '-45deg' }] }]} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  magnifier: {
    alignItems: 'center',
    // Remonte un peu la loupe : après rotation, le manche descend vers le coin bas droit.
    marginTop: -2,
    marginLeft: -2,
    transform: [{ rotate: '-45deg' }],
  },
  lens: {
    width: LENS,
    height: LENS,
    borderRadius: LENS / 2,
    borderWidth: STROKE,
    borderColor: AppColors.text,
  },
  handle: {
    width: STROKE,
    height: HANDLE,
    marginTop: -1,
    borderRadius: STROKE / 2,
    backgroundColor: AppColors.text,
  },
  bar: {
    position: 'absolute',
    width: SIZE - 4,
    height: STROKE,
    borderRadius: STROKE / 2,
    backgroundColor: AppColors.text,
  },
});
