import { Redirect, useLocalSearchParams } from 'expo-router';
import { Linking, Platform, StyleSheet, Text, View } from 'react-native';

import { BackButton, goBackOrHome } from '@/components/ui/BackButton';
import { BigButton } from '@/components/ui/BigButton';
import { BUTTON_LABEL_MAX_FONT_SCALE } from '@/components/ui/ButtonLabel';
import { Screen } from '@/components/ui/Screen';
import { textStyles } from '@/components/ui/textStyles';
import { AppColors, AppFonts, AppSizes, DISPLAY_LINE_HEIGHT } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import { isPublishedWeb } from '@/lib/platform';
import { requestTvRetry } from '@/lib/tvRetry';

const texts = strings.tvHelp;
const NUMBER_SIZE = 34;
const STEP_TITLE_SIZE = 17;

// Étapes, dans l'ordre ; la 4e (réseau local) selon le téléphone de l'hôte.
function helpSteps(): { title: string; text: string }[] {
  const { wifi, power, restart, localNetwork, youtube, elsewhere, compatible } = texts.steps;
  const localText = Platform.OS === 'ios' ? localNetwork.ios : localNetwork.android;
  return [wifi, power, restart, { title: localNetwork.title, text: localText }, youtube, elsewhere, compatible];
}

// « Réessayer » : retour au salon, qui rouvre la liste des TV.
function retry() {
  requestTvRetry();
  goBackOrHome();
}

// iPhone : autorisation du réseau local et même Wi-Fi, avec un raccourci vers la page de Quiz'in dans
// Réglages (l'interrupteur « Réseau local » y apparaît une fois la demande faite par l'app).
function IosHelpCard() {
  const ios = texts.ios;
  return (
    <View style={[styles.card, styles.iosCard]}>
      <Text style={styles.stepTitle} maxFontSizeMultiplier={BUTTON_LABEL_MAX_FONT_SCALE}>
        {ios.title}
      </Text>
      {[ios.localNetwork, ios.wifi].map((cause, index) => (
        <View key={cause} style={styles.cause}>
          <Text style={[textStyles.body, styles.causeNumber]}>{index + 1}.</Text>
          <Text style={[textStyles.body, styles.causeText]}>{cause}</Text>
        </View>
      ))}
      <BigButton label={ios.openSettings} variant="secondary" size="compact" onPress={() => void Linking.openSettings()} />
    </View>
  );
}

// Aide « Je ne trouve pas ma TV » (ouverte depuis le salon, sous « Afficher sur la TV ») : sept vérifications
// dans des cartes numérotées, le contact, et « Réessayer ». Même texte que quizin-play.web.app/aide-tv.
// iPhone : carte des deux causes iOS en tête (démo dans le navigateur, développement : /tv-help?ios=1).
export default function TvHelpRoute() {
  const { ios } = useLocalSearchParams<{ ios?: string }>();
  if (isPublishedWeb) return <Redirect href="/join" />;
  const isIos = Platform.OS === 'ios' || (__DEV__ && ios === '1');
  return (
    <Screen footer={<BigButton label={texts.retry} onPress={retry} />}>
      <BackButton label={texts.back} />
      <Text style={textStyles.title} maxFontSizeMultiplier={BUTTON_LABEL_MAX_FONT_SCALE}>
        {texts.title}
      </Text>
      <Text style={[textStyles.body, styles.intro]}>{texts.intro}</Text>
      {isIos && <IosHelpCard />}
      <View style={styles.steps}>
        {helpSteps().map((step, index) => (
          <View key={step.title} style={styles.card}>
            <View style={styles.cardHead}>
              <View style={styles.number}>
                <Text style={styles.numberText} maxFontSizeMultiplier={1}>
                  {index + 1}
                </Text>
              </View>
              <Text style={styles.stepTitle} maxFontSizeMultiplier={BUTTON_LABEL_MAX_FONT_SCALE}>
                {step.title}
              </Text>
            </View>
            <Text style={textStyles.body}>{step.text}</Text>
          </View>
        ))}
      </View>
      {/* Adresse sur sa propre ligne, plafonnée : un mot sans espace ne peut pas passer à la ligne. */}
      <View>
        <Text style={[textStyles.body, styles.contact]}>{texts.contactStart.trim()}</Text>
        <Text
          accessibilityRole="link"
          style={[textStyles.body, styles.contact, styles.mail]}
          maxFontSizeMultiplier={BUTTON_LABEL_MAX_FONT_SCALE}
          onPress={() => void Linking.openURL(`mailto:${texts.contactEmail}`)}>
          {texts.contactEmail}
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: {
    color: AppColors.textMuted,
    textAlign: 'center',
  },
  // Numéro et titre sur une ligne, texte dessous sur toute la largeur de la carte (lisible en grande police).
  card: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: AppSizes.radius,
    backgroundColor: AppColors.panel,
  },
  number: {
    width: NUMBER_SIZE,
    height: NUMBER_SIZE,
    borderRadius: NUMBER_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.link,
  },
  numberText: {
    color: AppColors.ink,
    fontFamily: AppFonts.display,
    fontSize: 16,
    lineHeight: Math.round(16 * DISPLAY_LINE_HEIGHT),
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  stepTitle: {
    flex: 1,
    color: AppColors.text,
    fontFamily: AppFonts.display,
    fontSize: STEP_TITLE_SIZE,
    lineHeight: Math.round(STEP_TITLE_SIZE * DISPLAY_LINE_HEIGHT),
    textTransform: 'uppercase',
  },
  contact: {
    textAlign: 'center',
  },
  mail: {
    color: AppColors.link,
    textDecorationLine: 'underline',
  },
  steps: {
    gap: Spacing.two,
  },
  iosCard: {
    gap: Spacing.three,
    borderWidth: 2,
    borderColor: AppColors.highlight,
  },
  cause: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  causeNumber: {
    color: AppColors.highlight,
    fontFamily: AppFonts.black,
  },
  causeText: {
    flex: 1,
  },
});
