import { parseQuizCatalog } from '@shared/quizValidation';
import { themeStats } from '@shared/themeCatalog';
import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { Text } from 'react-native';

import { AllThemesView } from '@/components/host/catalog/themes/AllThemesView';
import { goBackOrHome } from '@/components/ui/BackButton';
import { Screen } from '@/components/ui/Screen';
import { textStyles } from '@/components/ui/textStyles';
import { strings } from '@/constants/strings';
import { useLiveValue } from '@/hooks/useLiveValue';
import { usePlayedQuizzes } from '@/hooks/usePlayedQuizzes';
import { openThemesGame } from '@/lib/themeGameNavigation';

// « Tout voir » du catalogue Quiz (maquette QN1-A) : tous les thèmes ; une tuile ouvre la feuille du thème.
export default function AllThemesRoute() {
  const { room } = useLocalSearchParams<{ room?: string }>();
  const played = usePlayedQuizzes();
  const catalog = useLiveValue<unknown>('quizzes');
  const themes = useMemo(() => (catalog.kind === 'ready' ? themeStats(parseQuizCatalog(catalog.value).valid, played) : []), [catalog, played]);
  if (catalog.kind !== 'ready') {
    return (
      <Screen>
        {catalog.kind === 'loading' && <Text style={textStyles.body}>{strings.catalog.loading}</Text>}
        {catalog.kind === 'error' && <Text style={textStyles.error}>{`${strings.catalog.errorPrefix} ${catalog.detail}`}</Text>}
      </Screen>
    );
  }
  return <AllThemesView themes={themes} onBack={goBackOrHome} onPlay={(chosen, count) => openThemesGame(chosen, count, room)} />;
}
