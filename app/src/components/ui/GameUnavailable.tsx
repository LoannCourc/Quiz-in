import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { BigButton } from '@/components/ui/BigButton';
import { textStyles } from '@/components/ui/textStyles';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import { isPublishedWeb } from '@/lib/platform';

export type GameUnavailableKind = 'gone' | 'connection';

interface GameUnavailableProps {
  kind: GameUnavailableKind;
  // Cause technique courte (ligne grise « Réf. : … »), pour les retours des testeurs.
  reference: string;
  // Connexion impossible : nouvel essai (la partie est relue depuis le début).
  onRetry?: () => void;
  // Avant de partir (hôte, partie introuvable : oublier le code gardé).
  onHome?: () => void;
}

const texts = strings.gameUnavailable;

// Accueil : celui de l'appli, ou la saisie du code sur le site des joueurs.
function goHome(): void {
  router.replace(isPublishedWeb ? '/join' : '/');
}

// Partie impossible à ouvrir : introuvable ou terminée (retour à l'accueil), ou connexion impossible
// (Réessayer, et l'accueil). Jamais un chargement sans fin.
export function GameUnavailable({ kind, reference, onRetry, onHome }: GameUnavailableProps) {
  const isGone = kind === 'gone';
  return (
    <View style={styles.box}>
      <Text style={textStyles.title}>{isGone ? texts.goneTitle : texts.connectionTitle}</Text>
      <Text style={[textStyles.body, styles.centered]}>{isGone ? texts.goneText : texts.connectionText}</Text>
      {!isGone && onRetry && <BigButton label={texts.retry} onPress={onRetry} />}
      <BigButton
        label={texts.home}
        variant={isGone ? 'primary' : 'secondary'}
        onPress={() => {
          onHome?.();
          goHome();
        }}
      />
      <Text style={[textStyles.muted, styles.centered]}>{texts.reference(reference)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    gap: Spacing.three,
  },
  centered: {
    textAlign: 'center',
  },
});
