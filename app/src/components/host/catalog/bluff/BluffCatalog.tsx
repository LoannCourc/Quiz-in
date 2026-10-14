import {
  BLUFF_SORTS,
  bluffCategories,
  bluffEntries,
  bluffList,
  mixSummary,
  surpriseMix,
  toggleMix,
  type BluffSortId,
} from '@shared/bluffCatalog';
import { availableQuestionCounts, BLUFF_QUESTION_COUNTS } from '@shared/questionPool';
import type { QuizEntry } from '@shared/quizValidation';
import { themeIconOf } from '@shared/themeIcons';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { LineIcon } from '@/components/host/catalog/LineIcon';
import { QuestionCountBar } from '@/components/host/catalog/QuestionCountBar';
import { ThemeChips } from '@/components/host/catalog/ThemeChips';
import { BackButton } from '@/components/ui/BackButton';
import { BigButton } from '@/components/ui/BigButton';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { ChoiceRow } from '@/components/ui/ChoiceRow';
import { Screen } from '@/components/ui/Screen';
import { textStyles } from '@/components/ui/textStyles';
import { ThemeIcon } from '@/components/ui/ThemeIcon';
import { AppColors, AppFonts, AppSizes, DISPLAY_LINE_HEIGHT, TEXT_FIT_SAFETY } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

const texts = strings.catalog.bluff;
const ROW_HEIGHT = 68;
const ROW_ICON = 44;
const ROUND = 30;

interface BluffCatalogProps {
  entries: QuizEntry[];
  played: ReadonlySet<string>;
  onBack: () => void;
  // Continuer : fiche de la partie tirée dans les quiz du mélange.
  onContinue: (quizIds: string[], questionCount: number) => void;
}

// Catalogue du Bluff (maquette BL4) : recherche, « Surprends-moi », catégories qui ont du contenu, liste
// triable avec « + ». Toucher un quiz l'ajoute à « Mon mélange » (ligne surlignée, coche cyan) ; le résumé
// tient dans la barre du bas (« 3 quiz · 30 questions », lien « Voir » vers la feuille du mélange).
export function BluffCatalog({ entries: allEntries, played, onBack, onContinue }: BluffCatalogProps) {
  const entries = useMemo(() => bluffEntries(allEntries), [allEntries]);
  const categories = useMemo(() => bluffCategories(entries), [entries]);
  const [category, setCategory] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<BluffSortId>('popular');
  const [mix, setMix] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState(BLUFF_QUESTION_COUNTS[0]);
  const [sheet, setSheet] = useState<'sort' | 'mix' | null>(null);
  const shown = useMemo(() => bluffList(entries, category, query, sort), [entries, category, query, sort]);
  const summary = mixSummary(entries, mix);
  const available = availableQuestionCounts(BLUFF_QUESTION_COUNTS, summary.questionCount);
  // Choix devenu impossible (quiz retiré du mélange) : le plus grand possible.
  const count = available.includes(questionCount) ? questionCount : (available.at(-1) ?? questionCount);
  const isEmpty = mix.length === 0;

  const footer = (
    <QuestionCountBar
      options={BLUFF_QUESTION_COUNTS}
      available={isEmpty ? [] : available}
      value={count}
      onChange={setQuestionCount}
      summary={isEmpty ? texts.chooseQuiz : texts.mixSummary(mix.length, summary.questionCount)}
      onShowSummary={isEmpty ? undefined : () => setSheet('mix')}
      note={!isEmpty && available.length < BLUFF_QUESTION_COUNTS.length ? texts.mixTooSmall(summary.questionCount) : undefined}
      onContinue={() => onContinue(mix, count)}
      isContinueDisabled={isEmpty || available.length === 0}
    />
  );

  // En-tête de la liste : il défile avec elle (petit écran), la liste reste rendue au fil du défilement.
  const listHeader = (
    <View style={styles.listTop}>
      <View style={styles.search}>
        <LineIcon name="search" />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={texts.searchPlaceholder(entries.length)}
          placeholderTextColor={AppColors.textMuted}
          accessibilityLabel={texts.searchPlaceholder(entries.length)}
          returnKeyType="search"
          style={styles.searchInput}
        />
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={() => setMix(surpriseMix(entries, played))}
        style={({ pressed }) => [styles.surprise, pressed && styles.pressed]}>
        <Dice />
        <View style={styles.fill}>
          <Text style={styles.surpriseTitle}>{texts.surprise}</Text>
          <Text style={styles.surpriseHint}>{texts.surpriseHint}</Text>
        </View>
      </Pressable>
      <ThemeChips
        themes={categories}
        selection={category === null ? 'all' : [category]}
        onToggle={(theme) => setCategory(theme === category ? null : theme)}
      />
      <View style={styles.listHeader}>
        <Pressable accessibilityRole="button" accessibilityLabel={texts.sortTitle} hitSlop={Spacing.two} onPress={() => setSheet('sort')}>
          <Text style={styles.sortLabel}>{`${texts.sorts[sort]} ▾`}</Text>
        </Pressable>
        <Text style={styles.quizCount}>{texts.quizCount(shown.length)}</Text>
      </View>
    </View>
  );

  return (
    <Screen footer={footer} scrollable={false}>
      <View style={styles.column}>
        <View style={styles.header}>
          <BackButton onPress={onBack} label={strings.home.back} />
          <Text style={styles.brand} numberOfLines={1}>
            {texts.title}
          </Text>
        </View>
        <FlatList
          ListHeaderComponent={listHeader}
          data={shown}
          keyExtractor={(quiz) => quiz.id}
          renderItem={({ item }) => (
            <BluffRow quiz={item} isChosen={mix.includes(item.id)} onPress={() => setMix((current) => toggleMix(current, item.id))} />
          )}
          initialNumToRender={10}
          ListEmptyComponent={<Text style={textStyles.body}>{texts.noResult}</Text>}
          keyboardShouldPersistTaps="handled"
          style={styles.fill}
        />
      </View>

      <BottomSheet isOpen={sheet === 'sort'} onClose={() => setSheet(null)} title={texts.sortTitle}>
        {BLUFF_SORTS.map((choice) => (
          <ChoiceRow key={choice} label={texts.sorts[choice]} isSelected={sort === choice} onPress={() => setSort(choice)} />
        ))}
      </BottomSheet>
      <BottomSheet isOpen={sheet === 'mix'} onClose={() => setSheet(null)} title={texts.mixTitle} aside={texts.mixSummary(mix.length, summary.questionCount)}>
        {summary.quizzes.map((quiz) => (
          <View key={quiz.id} style={styles.mixRow}>
            <Text style={styles.mixTitle} numberOfLines={2}>
              {quiz.title}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={texts.remove(quiz.title)}
              hitSlop={Spacing.two}
              onPress={() => setMix((current) => toggleMix(current, quiz.id))}
              style={styles.round}>
              <LineIcon name="close" />
            </Pressable>
          </View>
        ))}
        <BigButton
          label={texts.clearMix}
          variant="secondary"
          size="compact"
          onPress={() => {
            setMix([]);
            setSheet(null);
          }}
        />
      </BottomSheet>
    </Screen>
  );
}

// Ligne d'un quiz : icône de son thème, titre, « Histoire · 10 questions », et « + » (ou coche cyan s'il est
// dans le mélange, ligne surlignée).
function BluffRow({ quiz, isChosen, onPress }: { quiz: QuizEntry; isChosen: boolean; onPress: () => void }) {
  const icon = quiz.icon ?? themeIconOf(quiz.theme);
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isChosen }}
      accessibilityLabel={isChosen ? texts.remove(quiz.title) : texts.add(quiz.title)}
      onPress={onPress}
      style={({ pressed }) => [styles.row, isChosen && styles.rowChosen, pressed && styles.pressed]}>
      <View style={[styles.rowIcon, { backgroundColor: AppColors.themeChips[themeIconOf(quiz.theme)] }]}>
        <ThemeIcon name={icon} size={26} />
      </View>
      <View style={styles.fill}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {quiz.title}
        </Text>
        <Text style={styles.rowMeta} numberOfLines={1}>
          {texts.rowMeta(quiz.theme, quiz.questionCount)}
        </Text>
      </View>
      <View style={[styles.round, isChosen && styles.roundChosen]}>
        <Text style={[styles.roundMark, isChosen && styles.roundMarkChosen]}>{isChosen ? '✓' : '+'}</Text>
      </View>
    </Pressable>
  );
}

const DICE = 40;
const PIP = 6;
// Points du dé (face 5), en part du côté.
const PIPS = [
  [0.27, 0.27],
  [0.73, 0.27],
  [0.5, 0.5],
  [0.27, 0.73],
  [0.73, 0.73],
] as const;

// Dé de « Surprends-moi », dessiné (carré or, cinq points encre).
function Dice() {
  return (
    <View style={styles.dice}>
      {PIPS.map(([x, y]) => (
        <View key={`${x}-${y}`} style={[styles.pip, { left: x * DICE - PIP / 2, top: y * DICE - PIP / 2 }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  column: {
    flex: 1,
    gap: Spacing.three,
  },
  listTop: {
    gap: Spacing.three,
    paddingBottom: Spacing.two,
  },
  fill: {
    flex: 1,
  },
  pressed: {
    opacity: 0.75,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  brand: {
    flex: 1,
    color: AppColors.accent,
    fontFamily: AppFonts.display,
    fontSize: AppSizes.textLarge,
    lineHeight: Math.round(AppSizes.textLarge * DISPLAY_LINE_HEIGHT),
    textTransform: 'uppercase',
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    height: 52,
    paddingHorizontal: Spacing.three,
    borderRadius: AppSizes.radius,
    borderWidth: 2,
    borderColor: AppColors.chipBorder,
    backgroundColor: AppColors.surface,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    color: AppColors.text,
    fontFamily: AppFonts.extraBold,
    fontSize: AppSizes.textBody,
  },
  surprise: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.two,
    borderRadius: AppSizes.radius,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: AppColors.chipBorder,
  },
  surpriseTitle: {
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: 16,
  },
  surpriseHint: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.bold,
    fontSize: 13,
  },
  dice: {
    width: DICE,
    height: DICE,
    borderRadius: 10,
    backgroundColor: AppColors.accent,
  },
  pip: {
    position: 'absolute',
    width: PIP,
    height: PIP,
    borderRadius: PIP / 2,
    backgroundColor: AppColors.ink,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sortLabel: {
    ...TEXT_FIT_SAFETY,
    color: AppColors.questionMeta,
    fontFamily: AppFonts.black,
    fontSize: 12,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  quizCount: {
    ...TEXT_FIT_SAFETY,
    color: AppColors.link,
    fontFamily: AppFonts.black,
    fontSize: 12,
  },
  row: {
    height: ROW_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.two,
    borderRadius: AppSizes.radius,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  rowChosen: {
    borderColor: AppColors.link,
    backgroundColor: AppColors.surface,
  },
  rowIcon: {
    width: ROW_ICON,
    height: ROW_ICON,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: {
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: 16,
  },
  rowMeta: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.bold,
    fontSize: 13,
  },
  round: {
    width: ROUND,
    height: ROUND,
    borderRadius: ROUND / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: AppColors.chipBorder,
  },
  roundChosen: {
    borderColor: AppColors.link,
    backgroundColor: AppColors.link,
  },
  roundMark: {
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: 18,
    lineHeight: 22,
  },
  roundMarkChosen: {
    color: AppColors.ink,
    fontSize: 15,
  },
  mixRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: AppColors.chipBorder,
  },
  mixTitle: {
    flex: 1,
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: 16,
  },
});
