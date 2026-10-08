import { DRAW_QUIZ_ID, DRAW_QUIZ_SUMMARY } from '@shared/drawGame';
import { parseQuizCatalog, type QuizEntry } from '@shared/quizValidation';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { Text } from 'react-native';

import { CatalogView } from '@/components/host/catalog/CatalogView';
import { Screen } from '@/components/ui/Screen';
import { textStyles } from '@/components/ui/textStyles';
import { strings, type GameType } from '@/constants/strings';
import { useBlindTestEnabled } from '@/hooks/useBlindTestEnabled';
import { useDrawEnabled } from '@/hooks/useDrawEnabled';
import { useLiveValue } from '@/hooks/useLiveValue';
import { warnIgnoredEntries } from '@/lib/devLog';

// Jeux ouvrables depuis l'accueil (blind test et Dessine-moi : selon leur interrupteur à distance).
function isOpenableGame(value: string | undefined, isBlindTestEnabled: boolean, isDrawEnabled: boolean): value is GameType {
  if (value === 'quiz' || value === 'bluff') return true;
  if (value === 'blindTest') return isBlindTestEnabled;
  return value === 'draw' && isDrawEnabled;
}

// Fiches valides ; les entrées mal formées de la base sont ignorées. Dessine-moi (pas de quiz dans la
// base) : fiche locale.
function toEntries(quizzes: unknown): QuizEntry[] {
  const { valid, ignoredCount } = parseQuizCatalog(quizzes);
  warnIgnoredEntries('Catalogue', ignoredCount);
  return [...valid, { id: DRAW_QUIZ_ID, ...DRAW_QUIZ_SUMMARY }];
}

// Dessine-moi : les catégories choisies voyagent jusqu'à la fiche (« animal,sport »), qui les met dans les
// réglages de la partie.
function openQuiz(quizId: string, drawCategories: string[]) {
  const params = drawCategories.length > 0 ? { quizId, categories: drawCategories.join(',') } : { quizId };
  router.push({ pathname: '/quiz/[quizId]', params });
}

// Retour à l'accueil (par la pile si on en vient, sinon en le remplaçant : lien direct).
function backHome() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

// Catalogue d'un jeu, ouvert depuis une tuile de l'accueil. Jeu inconnu ou indisponible : retour à l'accueil.
export default function CatalogRoute() {
  const { gameType } = useLocalSearchParams<{ gameType: string }>();
  const isBlindTestEnabled = useBlindTestEnabled();
  const isDrawEnabled = useDrawEnabled();
  const catalog = useLiveValue<unknown>('quizzes');
  const entries = useMemo(() => (catalog.kind === 'ready' ? toEntries(catalog.value) : []), [catalog]);
  if (!isOpenableGame(gameType, isBlindTestEnabled, isDrawEnabled)) return <Redirect href="/" />;

  return (
    <Screen>
      {catalog.kind === 'loading' && <Text style={textStyles.body}>{strings.catalog.loading}</Text>}
      {catalog.kind === 'error' && <Text style={textStyles.error}>{`${strings.catalog.errorPrefix} ${catalog.detail}`}</Text>}
      {catalog.kind === 'ready' && <CatalogView entries={entries} gameType={gameType} onOpenQuiz={openQuiz} onBack={backHome} />}
    </Screen>
  );
}
