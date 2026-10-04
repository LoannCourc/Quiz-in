import { parseQuizCatalog, type QuizEntry } from '@shared/quizValidation';
import { Link, Redirect, router } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { CatalogView } from '@/components/host/catalog/CatalogView';
import { BigButton } from '@/components/ui/BigButton';
import { Screen } from '@/components/ui/Screen';
import { textStyles } from '@/components/ui/textStyles';
import { AppColors } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import { useLiveValue } from '@/hooks/useLiveValue';
import { useBlindTestEnabled } from '@/hooks/useBlindTestEnabled';
import { useResumableGame } from '@/hooks/useResumableGame';
import { warnIgnoredEntries } from '@/lib/devLog';
import { isPublishedWeb } from '@/lib/platform';

// Accueil de l'hôte. Sur le site des joueurs (web publié), redirige vers la saisie du code.
export default function HomeRoute() {
  return isPublishedWeb ? <Redirect href="/join" /> : <CatalogScreen />;
}

// Fiches valides ; les entrées mal formées de la base sont ignorées.
function toEntries(quizzes: unknown): QuizEntry[] {
  const { valid, ignoredCount } = parseQuizCatalog(quizzes);
  warnIgnoredEntries('Catalogue', ignoredCount);
  return valid;
}

function openQuiz(quizId: string) {
  router.push({ pathname: '/quiz/[quizId]', params: { quizId } });
}

function CatalogScreen() {
  const catalog = useLiveValue<unknown>('quizzes');
  const entries = useMemo(() => (catalog.kind === 'ready' ? toEntries(catalog.value) : []), [catalog]);
  const resumableCode = useResumableGame();
  const isBlindTestEnabled = useBlindTestEnabled();
  const resumeButton = resumableCode && (
    <BigButton
      label={strings.catalog.resumeGame(resumableCode)}
      onPress={() => router.push({ pathname: '/host/[code]', params: { code: resumableCode } })}
    />
  );

  return (
    <Screen>
      {catalog.kind === 'loading' && <Text style={textStyles.body}>{strings.catalog.loading}</Text>}
      {catalog.kind === 'error' && (
        <Text style={textStyles.error}>{`${strings.catalog.errorPrefix} ${catalog.detail}`}</Text>
      )}
      {catalog.kind === 'ready' && (
        <CatalogView
          entries={entries}
          onOpenQuiz={openQuiz}
          banner={resumeButton}
          isBlindTestEnabled={isBlindTestEnabled}
        />
      )}

      <View style={styles.footerLinks}>
        <Link href="/about" style={styles.footerLink}>
          {strings.about.link}
        </Link>
        {/* Démos : en développement seulement (absentes de l'APK publié). */}
        {__DEV__ && (
          <>
          <Link href="/debug/catalog" style={styles.debugLink}>
            {strings.catalog.demoCatalogLink}
          </Link>
          <Link href="/debug/player" style={styles.debugLink}>
            {strings.catalog.playerDemoLink}
          </Link>
          <Link href="/debug/counter" style={styles.debugLink}>
            {strings.catalog.debugLink}
          </Link>
          </>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  footerLinks: {
    marginTop: 'auto',
  },
  footerLink: {
    paddingVertical: Spacing.three,
    color: AppColors.textMuted,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  debugLink: {
    paddingVertical: Spacing.three,
    color: AppColors.textMuted,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});
