import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BigButton } from '@/components/ui/BigButton';
import { Logo } from '@/components/ui/Logo';
import { Screen } from '@/components/ui/Screen';
import { textStyles } from '@/components/ui/textStyles';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import { openUpdateStore } from '@/lib/storeLinks';

import { storeFallbackText } from './UpdateSheet';

const texts = strings.update;

// Écran obligatoire (spec 21), à la place de l'accueil : version sous config/appVersion minimum (changement du
// protocole de partie). Un seul bouton ; si aucun lien ne s'ouvre, le message de secours : jamais d'impasse.
// openStore : remplaçable par la démo (ouverture qui échoue).
export function UpdateRequiredScreen({ storeUrl, openStore = openUpdateStore }: { storeUrl: string; openStore?: (storeUrl: string) => Promise<boolean> }) {
  const [hasFailed, setHasFailed] = useState(false);
  async function update() {
    setHasFailed(!(await openStore(storeUrl)));
  }
  return (
    <Screen footer={<BigButton label={texts.update} onPress={() => void update()} />}>
      <View style={styles.content}>
        <Logo size="large" />
        <Text style={[textStyles.title, styles.centered]}>{texts.requiredTitle}</Text>
        <Text style={[textStyles.body, styles.centered]}>{texts.requiredText}</Text>
        {hasFailed && <Text style={[textStyles.body, styles.centered]}>{storeFallbackText()}</Text>}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.four,
  },
  centered: {
    textAlign: 'center',
  },
});
