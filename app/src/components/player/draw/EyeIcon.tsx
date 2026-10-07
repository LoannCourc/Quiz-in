import { View } from 'react-native';

// App de l'hôte : jamais affiché (l'hôte ne dessine pas, décision D1). Version web en SVG :
// EyeIcon.web.tsx. Ici, une forme simple dessinée en View pour garder le même composant.
export function EyeIcon({ isOpen, size, color }: { isOpen: boolean; size: number; color: string }) {
  const eye = { width: size, height: size * 0.6, borderRadius: size, borderWidth: 2, borderColor: color, alignItems: 'center', justifyContent: 'center' } as const;
  const pupil = { width: size * 0.25, height: size * 0.25, borderRadius: size, backgroundColor: color } as const;
  const slash = { position: 'absolute', width: size, height: 2, backgroundColor: color, transform: [{ rotate: '45deg' }] } as const;
  return (
    <View style={eye}>
      <View style={pupil} />
      {!isOpen && <View style={slash} />}
    </View>
  );
}
