import { Platform, type ViewStyle } from 'react-native';

// Fond en dégradé CSS (linear-gradient ou radial-gradient), Android et web.
// Android : experimental_backgroundImage (React Native ≥ 0.80). Web : react-native-web transmet
// backgroundImage tel quel au CSS, mais ce nom n'existe pas dans les types React Native,
// d'où la conversion de type.
export function gradientStyle(gradient: string): ViewStyle {
  return Platform.OS === 'web'
    ? ({ backgroundImage: gradient } as ViewStyle)
    : { experimental_backgroundImage: gradient };
}
