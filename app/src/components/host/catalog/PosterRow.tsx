import type { QuizEntry } from '@shared/quizValidation';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppColors, AppFonts, AppSizes } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

import { QuizPoster } from './QuizPoster';

interface PosterRowProps {
  title: string;
  quizzes: QuizEntry[];
  posterWidth: number;
  // Top 10 : gros chiffre (featuredRank) devant chaque affiche.
  ranked?: boolean;
  onOpenQuiz: (quizId: string) => void;
}

// Rangée titrée d'affiches qui défile horizontalement, jusqu'aux bords de l'écran.
export function PosterRow({ title, quizzes, posterWidth, ranked = false, onOpenQuiz }: PosterRowProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll} contentContainerStyle={styles.row}>
        {quizzes.map((quiz) => (
          <View key={quiz.id} style={styles.item}>
            {ranked && quiz.featuredRank !== undefined && <Text style={styles.rank}>{quiz.featuredRank}</Text>}
            <QuizPoster
              title={quiz.title}
              poster={quiz.poster}
              theme={quiz.theme}
              icon={quiz.icon}
              width={posterWidth}
              accessibilityLabel={strings.catalog.posterLabel(quiz.title, ranked ? quiz.featuredRank : undefined)}
              onPress={() => onOpenQuiz(quiz.id)}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.two,
  },
  title: {
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: AppSizes.textBody,
  },
  // Annule la marge de l'écran : les affiches défilent jusqu'au bord. flexGrow 0 : sur le web,
  // une ScrollView horizontale s'étire sinon en hauteur.
  scroll: {
    flexGrow: 0,
    marginHorizontal: -Spacing.three,
  },
  row: {
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    // Laisse la place à l'ombre dure des affiches.
    paddingBottom: Spacing.two,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  // Gros chiffre doré à moitié caché derrière l'affiche (maquette S2).
  rank: {
    marginRight: -Spacing.three,
    color: AppColors.accent,
    fontFamily: AppFonts.display,
    fontSize: AppSizes.featuredNumber,
    lineHeight: AppSizes.featuredNumber,
    includeFontPadding: false,
  },
});
