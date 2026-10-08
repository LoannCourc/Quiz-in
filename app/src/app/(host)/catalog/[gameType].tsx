import { DRAW_QUIZ_ID, DRAW_QUIZ_SUMMARY } from '@shared/drawGame';
import { gameAccess } from '@shared/quizCatalog';
import { parseQuizCatalog, type QuizEntry } from '@shared/quizValidation';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { Text } from 'react-native';

import { CatalogView } from '@/components/host/catalog/CatalogView';
import { DrawCategoryPicker } from '@/components/host/catalog/DrawCategoryPicker';
import { Screen } from '@/components/ui/Screen';
import { textStyles } from '@/components/ui/textStyles';
import { strings, type GameType } from '@/constants/strings';
import { useBlindTestEnabled } from '@/hooks/useBlindTestEnabled';
import { useDrawEnabled } from '@/hooks/useDrawEnabled';
import { useLiveValue } from '@/hooks/useLiveValue';
import { usePlayedQuizzes } from '@/hooks/usePlayedQuizzes';
import { warnIgnoredEntries } from '@/lib/devLog';

// Fiches valides ; les entrées mal formées de la base sont ignorées. Dessine-moi (pas de quiz dans la
// base) : fiche locale.
function toEntries(quizzes: unknown): QuizEntry[] {
  const { valid, ignoredCount } = parseQuizCatalog(quizzes);
  warnIgnoredEntries('Catalogue', ignoredCount);
  return [...valid, { id: DRAW_QUIZ_ID, ...DRAW_QUIZ_SUMMARY }];
}

function openQuiz(quizId: string) {
  router.push({ pathname: '/quiz/[quizId]', params: { quizId } });
}

// Dessine-moi : les catégories choisies voyagent jusqu'à la fiche du jeu (« animal,sport »), qui les met
// dans les réglages de la partie. Vide : « Mélange ».
function openDrawGame(drawCategories: string[]) {
  const params = drawCategories.length > 0 ? { quizId: DRAW_QUIZ_ID, categories: drawCategories.join(',') } : { quizId: DRAW_QUIZ_ID };
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
  const blindTest = useBlindTestEnabled();
  const played = usePlayedQuizzes();
  const draw = useDrawEnabled();
  const catalog = useLiveValue<unknown>('quizzes');
  const entries = useMemo(() => (catalog.kind === 'ready' ? toEntries(catalog.value) : []), [catalog]);
  // Jeu fermé ou inconnu : retour à l'accueil ; interrupteur pas encore lu : on attend (shared/quizCatalog.ts).
  const access = gameAccess(gameType, { blindTest, draw });
  if (access === 'closed') return <Redirect href="/" />;
  if (access === 'loading') {
    return (
      <Screen>
        <Text style={textStyles.body}>{strings.catalog.loading}</Text>
      </Screen>
    );
  }
  // Dessine-moi (maquette D1) : choix des catégories de mots, puis la fiche du jeu.
  if (gameType === 'draw') return <DrawCategoryPicker onBack={backHome} onContinue={openDrawGame} />;
  // Accès ouvert : gameType est l'un des quatre jeux (gameAccess).
  const game = gameType as GameType;

  return (
    <Screen>
      {catalog.kind === 'loading' && <Text style={textStyles.body}>{strings.catalog.loading}</Text>}
      {catalog.kind === 'error' && <Text style={textStyles.error}>{`${strings.catalog.errorPrefix} ${catalog.detail}`}</Text>}
      {catalog.kind === 'ready' && <CatalogView entries={entries} gameType={game} onOpenQuiz={openQuiz} onBack={backHome} played={played} />}
    </Screen>
  );
}
