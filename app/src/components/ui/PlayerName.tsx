import { playerNameScale } from '@shared/playerName';
import { StyleSheet, Text, type StyleProp, type TextStyle } from 'react-native';

import { TEXT_FIT_SAFETY } from '@/constants/appTheme';

import { BUTTON_LABEL_MAX_FONT_SCALE } from './ButtonLabel';

const DEFAULT_FONT_SIZE = 16;
// Android : si le pseudo ne tient toujours pas (grande police du système), il rétrécit encore un peu avant
// les « … ».
const FIT_MIN_SCALE = 0.85;

interface PlayerNameProps {
  name: string;
  // Style du texte ; sa fontSize est la taille d'un pseudo court (8 caractères ou moins).
  style?: StyleProp<TextStyle>;
}

// Pseudo d'un joueur, toujours sur une seule ligne (salon, classements, équipes, écrans du joueur) : taille
// réduite selon sa longueur (playerNameScale, shared/playerName.ts), puis « … » s'il ne tient pas.
export function PlayerName({ name, style }: PlayerNameProps) {
  const fontSize = (StyleSheet.flatten(style)?.fontSize ?? DEFAULT_FONT_SIZE) * playerNameScale(name);
  return (
    <Text
      numberOfLines={1}
      ellipsizeMode="tail"
      adjustsFontSizeToFit
      minimumFontScale={FIT_MIN_SCALE}
      maxFontSizeMultiplier={BUTTON_LABEL_MAX_FONT_SCALE}
      style={[style, styles.fit, { fontSize }]}>
      {name}
    </Text>
  );
}

const styles = StyleSheet.create({
  fit: {
    ...TEXT_FIT_SAFETY,
  },
});
