import { Redirect } from 'expo-router';
import { Text } from 'react-native';

import { BackButton } from '@/components/ui/BackButton';
import { Screen } from '@/components/ui/Screen';
import { textStyles } from '@/components/ui/textStyles';
import { strings } from '@/constants/strings';
import { badgeUi } from '@/lib/badgeUi';
import { isPublishedWeb } from '@/lib/platform';

// « Mes badges » (spec 20, maquette G1), ouvert par le trophée de l'accueil ou une notification de fin de
// partie. Pas de badges sur le site des joueurs.
export default function BadgesRoute() {
  if (isPublishedWeb) return <Redirect href="/join" />;
  const ui = badgeUi();
  if (ui) return <ui.BadgesScreen />;
  return (
    <Screen>
      <BackButton />
      <Text style={textStyles.title}>{strings.trophies.screenTitle}</Text>
    </Screen>
  );
}
