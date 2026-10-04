import Constants from 'expo-constants';
import { Redirect, router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { BigButton } from '@/components/ui/BigButton';
import { Screen } from '@/components/ui/Screen';
import { textStyles } from '@/components/ui/textStyles';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import { isPublishedWeb } from '@/lib/platform';

// Version de l'app (app.json) ; inconnue si la configuration n'est pas lisible.
const APP_VERSION = Constants.expoConfig?.version ?? '?';

function backToCatalog() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

// « À propos et crédits », ouvert depuis le bas du catalogue : version, crédits, dont la mention
// obligatoire de Deezer pour les extraits du blind test.
export default function AboutRoute() {
  if (isPublishedWeb) return <Redirect href="/join" />;
  return (
    <Screen>
      <Text style={textStyles.title}>{strings.about.title}</Text>
      <View style={styles.section}>
        <Text style={textStyles.label}>{strings.about.version(APP_VERSION)}</Text>
        <Text style={textStyles.muted}>{strings.about.tagline}</Text>
      </View>
      <View style={styles.section}>
        <Text style={textStyles.label}>{strings.about.creditsTitle}</Text>
        {strings.about.credits.map((credit) => (
          <Text key={credit} style={textStyles.body}>
            {credit}
          </Text>
        ))}
      </View>
      <BigButton label={strings.about.back} variant="secondary" onPress={backToCatalog} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.two,
  },
});
