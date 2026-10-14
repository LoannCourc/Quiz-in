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

// room : Changer de jeu (salon gardé ouvert), transmis jusqu'à la fiche.
function openQuiz(quizId: string, room: string | undefined) {
  router.push({ pathname: '/quiz/[quizId]', params: { quizId, ...(room && { room }) } });
}

// Dessine-moi : les catégories choisies voyagent jusqu'à la fiche du jeu (« animal,sport »), qui les met
// dans les réglages de la partie. Vide : « Mélange ».
function openDrawGame(drawCategories: string[], room: string | undefined) {
  const categories = drawCategories.length > 0 ? { categories: drawCategories.join(',') } : {};
  router.push({ pathname: '/quiz/[quizId]', params: { quizId: DRAW_QUIZ_ID, ...categories, ...(room && { room }) } });
}

// Quiz, thèmes choisis : fiche de la partie tirée dans leur union (thèmes séparés par « | »).
function openThemesGame(themes: string[], questionCount: number, room: string | undefined) {
  router.push({ pathname: '/pool', params: { themes: themes.join('|'), count: String(questionCount), ...(room && { room }) } });
}

// Retour à l'accueil (par la pile si on en vient, sinon en le remplaçant : lien direct).
function backHome() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

// Catalogue d'un jeu, ouvert depuis une tuile de l'accueil. Jeu inconnu ou indisponible : retour à l'accueil.
export default function CatalogRoute() {
  const { gameType, room } = useLocalSearchParams<{ gameType: string; room?: string }>();
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
  if (gameType === 'draw') return <DrawCategoryPicker onBack={backHome} onContinue={(categories) => openDrawGame(categories, room)} />;
  // Accès ouvert : gameType est l'un des quatre jeux (gameAccess).
  const game = gameType as GameType;

  if (catalog.kind === 'ready') {
    return (
      <CatalogView
        entries={entries}
        gameType={game}
        onOpenQuiz={(quizId) => openQuiz(quizId, room)}
        onBack={backHome}
        played={played}
        onContinueThemes={game === 'quiz' ? (themes, count) => openThemesGame(themes, count, room) : undefined}
      />
    );
  }
  return (
    <Screen>
      {catalog.kind === 'loading' && <Text style={textStyles.body}>{strings.catalog.loading}</Text>}
      {catalog.kind === 'error' && <Text style={textStyles.error}>{`${strings.catalog.errorPrefix} ${catalog.detail}`}</Text>}
    </Screen>
  );
}
