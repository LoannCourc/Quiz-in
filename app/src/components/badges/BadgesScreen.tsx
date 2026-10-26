import {
  BADGE_CATEGORIES,
  categoryProgress,
  emptyBadgeState,
  SINGLE_BADGES,
  unlockedCount,
  ALL_BADGES,
  type BadgeCategory,
  type BadgeGame,
  type BadgeId,
  type BadgeState,
  type BadgeTier,
  type SingleBadge,
} from '@shared/badges';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState, type ComponentType } from 'react';
import { AppState, FlatList, StyleSheet, Text, View, type ViewToken } from 'react-native';

import { BackButton } from '@/components/ui/BackButton';
import { Screen } from '@/components/ui/Screen';
import { AppColors, AppFonts, AppSizes, DISPLAY_LINE_HEIGHT } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import { rateApp, shareApp } from '@/lib/badgeActions';
import { loadBadgesAndMarkSeen } from '@/lib/badgeStore';
import { readOpenGames } from '@/lib/openGames';

import { BadgeCategoryCard, BadgeSingleCard } from './BadgeCards';
import { BadgeUnlockedToast } from './BadgeUnlockedToast';

const texts = strings.trophies;
// Sections de la maquette G1 : six catégories « Parties », cinq « Défis », puis les badges uniques (3 par rangée).
const GAMES_CATEGORIES: readonly BadgeCategory[] = ['played', 'wins', 'losses', 'gathering', 'winStreak', 'loyal'];
const CHALLENGE_CATEGORIES: readonly BadgeCategory[] = ['allRounder', 'marathon', 'lightning', 'liar', 'artist'];
const SINGLES_PER_ROW = 3;
// Jeux toujours ouverts, en attendant la lecture de la config (Touche-à-tout).
const ALWAYS_OPEN: readonly BadgeGame[] = ['quiz', 'bluff'];
const TITLE_SIZE = 30;

type Row =
  | { key: string; kind: 'header' }
  | { key: string; kind: 'section'; title: string }
  | { key: string; kind: 'category'; category: BadgeCategory }
  | { key: string; kind: 'singles'; badges: readonly SingleBadge[] };

const ROWS: readonly Row[] = [
  { key: 'header', kind: 'header' },
  { key: 'section-games', kind: 'section', title: texts.sections.games },
  ...GAMES_CATEGORIES.map((category): Row => ({ key: category, kind: 'category', category })),
  { key: 'section-challenges', kind: 'section', title: texts.sections.challenges },
  ...CHALLENGE_CATEGORIES.map((category): Row => ({ key: category, kind: 'category', category })),
  { key: 'section-singles', kind: 'section', title: texts.sections.singles },
  ...Array.from({ length: Math.ceil(SINGLE_BADGES.length / SINGLES_PER_ROW) }, (_, row): Row => ({
    key: `singles-${row}`,
    kind: 'singles',
    badges: SINGLE_BADGES.slice(row * SINGLES_PER_ROW, (row + 1) * SINGLES_PER_ROW),
  })),
];

function unlockedTiers(state: BadgeState, category: BadgeCategory): Set<BadgeTier> {
  return new Set(([1, 2, 3] as const).filter((tier) => state.unlocked[`${category}.${tier}`] !== undefined));
}

// Écran affiché et app au premier plan : sinon, toutes les animations s'arrêtent.
function useIsOnScreen(): boolean {
  const [isFocused, setIsFocused] = useState(false);
  const [isForeground, setIsForeground] = useState(AppState.currentState === 'active');
  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      return () => setIsFocused(false);
    }, []),
  );
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (status) => setIsForeground(status === 'active'));
    return () => subscription.remove();
  }, []);
  return isFocused && isForeground;
}

// Outils de développement (exemple de 15 badges, notification, badge ultime) : jamais dans un build publié.
interface DevToolsProps {
  onChanged: () => void;
  onPreview: (badges: BadgeId[]) => void;
}
const DevBadgeTools: ComponentType<DevToolsProps> | null = __DEV__
  ? // eslint-disable-next-line @typescript-eslint/no-require-imports -- outil de développement, absent des builds publiés
    (require('./DevBadgeTools') as typeof import('./DevBadgeTools')).DevBadgeTools
  : null;

// Écran « Mes badges » (maquette G1). Seules les cartes visibles à l'écran sont animées.
export function BadgesScreen() {
  const [state, setState] = useState<BadgeState>(emptyBadgeState);
  const [openGames, setOpenGames] = useState<readonly BadgeGame[]>(ALWAYS_OPEN);
  const [visible, setVisible] = useState<ReadonlySet<string>>(new Set());
  const [notice, setNotice] = useState<BadgeId[]>([]);
  const isOnScreen = useIsOnScreen();

  const reload = useCallback(() => {
    void loadBadgesAndMarkSeen().then((parsed) => setState(parsed.state));
  }, []);
  useFocusEffect(reload);
  useEffect(() => {
    void readOpenGames().then(setOpenGames);
  }, []);

  // FlatList refuse que ces deux valeurs changent : créées une seule fois.
  const [viewability] = useState(() => ({ itemVisiblePercentThreshold: 10 }));
  const [onViewableItemsChanged] = useState(() => ({ viewableItems }: { viewableItems: ViewToken<Row>[] }) => {
    setVisible(new Set(viewableItems.map((item) => item.key)));
  });

  async function act(action: () => Promise<BadgeId[]>) {
    const unlocked = await action();
    reload();
    if (unlocked.length > 0) setNotice(unlocked);
  }

  function renderRow({ item }: { item: Row }) {
    const isActive = isOnScreen && visible.has(item.key);
    switch (item.kind) {
      case 'header':
        return <Header unlocked={unlockedCount(state)} />;
      case 'section':
        return <Text style={styles.section}>{item.title}</Text>;
      case 'category':
        return (
          <BadgeCategoryCard
            category={item.category}
            accent={AppColors.badgeAccents[BADGE_CATEGORIES.indexOf(item.category)]}
            progress={categoryProgress(state.counters, item.category, openGames)}
            unlockedTiers={unlockedTiers(state, item.category)}
            active={isActive}
          />
        );
      case 'singles':
        return (
          <View style={styles.singlesRow}>
            {item.badges.map((badge) => (
              <BadgeSingleCard
                key={badge}
                badge={badge}
                isUnlocked={state.unlocked[badge] !== undefined}
                active={isActive}
                onPress={badge === 'share' ? () => void act(shareApp) : badge === 'rate' ? () => void act(rateApp) : undefined}
              />
            ))}
          </View>
        );
    }
  }

  return (
    <View style={styles.fill}>
      <Screen scrollable={false}>
        <FlatList
          data={ROWS}
          keyExtractor={(row) => row.key}
          renderItem={renderRow}
          extraData={[state, openGames, visible, isOnScreen]}
          viewabilityConfig={viewability}
          onViewableItemsChanged={onViewableItemsChanged}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={DevBadgeTools ? <DevBadgeTools onChanged={reload} onPreview={setNotice} /> : null}
        />
      </Screen>
      <BadgeUnlockedToast badges={notice} delayMs={0} onDismiss={() => setNotice([])} />
    </View>
  );
}

function Header({ unlocked }: { unlocked: number }) {
  const total = ALL_BADGES.length;
  return (
    <View style={styles.header}>
      <View style={styles.titleRow}>
        <BackButton />
        <View style={styles.titleTexts}>
          <Text style={styles.title} accessibilityRole="header">
            {texts.screenTitle}
          </Text>
          <Text style={styles.count}>{texts.unlockedCount(unlocked, total)}</Text>
        </View>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, styles.trackFill, { width: `${Math.round((unlocked / total) * 100)}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  list: {
    gap: Spacing.three,
    paddingBottom: Spacing.five,
  },
  header: {
    gap: Spacing.three,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  titleTexts: {
    flex: 1,
  },
  title: {
    color: AppColors.text,
    fontFamily: AppFonts.display,
    fontSize: TITLE_SIZE,
    lineHeight: Math.round(TITLE_SIZE * DISPLAY_LINE_HEIGHT),
  },
  count: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.black,
    fontSize: AppSizes.textBody,
  },
  track: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    backgroundColor: AppColors.badgeTrack,
  },
  trackFill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: AppColors.badgeNotice,
  },
  section: {
    marginTop: Spacing.two,
    color: AppColors.textMuted,
    fontFamily: AppFonts.black,
    fontSize: 13,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  singlesRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
});
