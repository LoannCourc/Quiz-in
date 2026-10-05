import { StyleSheet, View } from 'react-native';

// Coche ✓ et croix ✕ épaisses, dessinées avec des formes simples (les polices du design n'ont pas
// ces signes) : même rendu sur Android et sur le web. size : côté du carré, en points.
export function MarkIcon({ kind, size, color }: { kind: 'check' | 'cross'; size: number; color: string }) {
  const stroke = Math.max(2, Math.round(size / 6));
  if (kind === 'check') {
    // Un « L » tourné de 45° : petite branche à gauche, grande branche vers le haut.
    return (
      <View style={[styles.box, { width: size, height: size }]}>
        <View
          style={[
            styles.check,
            {
              width: size * 0.38,
              height: size * 0.7,
              marginTop: -size * 0.12,
              borderRightWidth: stroke,
              borderBottomWidth: stroke,
              borderColor: color,
            },
          ]}
        />
      </View>
    );
  }
  const bar = { width: size * 0.82, height: stroke, borderRadius: stroke / 2, backgroundColor: color };
  return (
    <View style={[styles.box, { width: size, height: size }]}>
      <View style={[styles.bar, bar, styles.barForward]} />
      <View style={[styles.bar, bar, styles.barBackward]} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  check: {
    transform: [{ rotate: '45deg' }],
  },
  bar: {
    position: 'absolute',
  },
  barForward: {
    transform: [{ rotate: '45deg' }],
  },
  barBackward: {
    transform: [{ rotate: '-45deg' }],
  },
});
