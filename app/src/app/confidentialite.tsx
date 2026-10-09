import { router } from 'expo-router';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { BigButton } from '@/components/ui/BigButton';
import { Logo } from '@/components/ui/Logo';
import { Screen } from '@/components/ui/Screen';
import { textStyles } from '@/components/ui/textStyles';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

// Politique de confidentialité : quizin-play.web.app/confidentialite (adresse donnée aux stores), ouverte
// aussi depuis « À propos et crédits » dans l'app. Bouton retour dans l'app seulement.
export default function PrivacyRoute() {
  return (
    <Screen>
      <Logo size="small" align="start" />
      <Text style={textStyles.title}>{strings.privacy.title}</Text>
      <View style={styles.text}>
        {strings.privacy.paragraphs.map((paragraph, index) => (
          <Text key={index} style={textStyles.body}>
            {paragraph}
          </Text>
        ))}
      </View>
      {Platform.OS !== 'web' && <BigButton label={strings.privacy.back} variant="secondary" onPress={goBack} />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  text: {
    gap: Spacing.three,
  },
});
