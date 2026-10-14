import { PRIVACY_URL } from '@shared/constants';
import Constants from 'expo-constants';
import { Redirect } from 'expo-router';
import { Linking, StyleSheet, Text, View } from 'react-native';

import { BigButton } from '@/components/ui/BigButton';
import { BackButton, goBackOrHome } from '@/components/ui/BackButton';
import { Logo } from '@/components/ui/Logo';
import { Screen } from '@/components/ui/Screen';
import { textStyles } from '@/components/ui/textStyles';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import { isPublishedWeb } from '@/lib/platform';

// Version de l'app (app.json) ; inconnue si la configuration n'est pas lisible.
const APP_VERSION = Constants.expoConfig?.version ?? '?';

// « À propos et crédits », ouvert depuis le bas du catalogue : version, crédits, dont la mention
// obligatoire de Deezer pour les extraits du blind test, et artistes des musiques de la TV.
export default function AboutRoute() {
  if (isPublishedWeb) return <Redirect href="/join" />;
  return (
    <Screen>
      <BackButton />
      <Logo size="large" />
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
      <View style={styles.section}>
        <Text style={textStyles.label}>{strings.about.musicTitle}</Text>
        {strings.about.music.map((credit) => (
          <Text key={credit} style={textStyles.body}>
            {credit}
          </Text>
        ))}
      </View>
      <BigButton label={strings.about.privacyLink} variant="secondary" onPress={() => void Linking.openURL(PRIVACY_URL)} />
      <BigButton label={strings.about.back} variant="secondary" onPress={goBackOrHome} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.two,
  },
});
