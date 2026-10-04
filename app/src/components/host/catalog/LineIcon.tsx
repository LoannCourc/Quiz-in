import { StyleSheet, View } from 'react-native';

import { AppColors } from '@/constants/appTheme';

const SIZE = 24;
const STROKE = 3;

// Icônes dessinées avec des formes simples (aucune police d'icônes à charger) : loupe et croix.
export function LineIcon({ name }: { name: 'search' | 'close' }) {
  return (
    <View style={styles.box}>
      {name === 'search' ? (
        <>
          <View style={styles.lens} />
          <View style={[styles.bar, styles.handle]} />
        </>
      ) : (
        <>
          <View style={[styles.bar, styles.cross, { transform: [{ rotate: '45deg' }] }]} />
          <View style={[styles.bar, styles.cross, { transform: [{ rotate: '-45deg' }] }]} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    width: SIZE,
    height: SIZE,
  },
  lens: {
    position: 'absolute',
    top: 1,
    left: 1,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: STROKE,
    borderColor: AppColors.text,
  },
  bar: {
    position: 'absolute',
    height: STROKE,
    borderRadius: STROKE,
    backgroundColor: AppColors.text,
  },
  handle: {
    top: 18,
    left: 13,
    width: 10,
    transform: [{ rotate: '45deg' }],
  },
  cross: {
    top: (SIZE - STROKE) / 2,
    left: 1,
    width: SIZE - 2,
  },
});
