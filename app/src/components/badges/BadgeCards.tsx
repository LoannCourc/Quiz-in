import { BADGE_TIERS, type BadgeCategory, type BadgeTier, type CategoryProgress, type SingleBadge } from '@shared/badges';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppColors, AppFonts, AppSizes, BADGE_LOCKED_OPACITY, TEXT_FIT_SAFETY } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

import { CATEGORY_EMBLEMS, EmblemArt, SINGLE_EMBLEMS, SINGLE_SHAPES, TrophyArt } from './BadgeArt';
import { MovingIconView, UltimateTrophyView } from './BadgeVisuals';
import { CATEGORY_MOTIONS, SINGLE_MOTIONS } from './iconMotions';

const texts = strings.trophies;
const TIERS: readonly BadgeTier[] = [1, 2, 3];
const TILE_SIZE = 46;
const TILE_EMBLEM_SIZE = 26;
const TROPHY_WIDTH = 34;
const SINGLE_TROPHY_WIDTH = 40;

// Valeur actuelle sous le titre, seule (une ligne) : le prochain palier se lit sur les trophées et la barre.
function statusText(category: BadgeCategory, progress: CategoryProgress): string {
  const value = progress.value;
  return category === 'lightning' ? texts.categories.lightning.status(value) : texts.categories[category].status(value ?? 0);
}

interface CategoryCardProps {
  category: BadgeCategory;
  accent: string;
  progress: CategoryProgress;
  // Paliers débloqués (jamais retirés, même si un jeu ouvert plus tard fait baisser la valeur).
  unlockedTiers: ReadonlySet<BadgeTier>;
  // Carte à l'écran, écran affiché, app au premier plan : animations en marche.
  active: boolean;
}

// Carte d'une catégorie (maquette G1) : tuile de l'icône, titre et valeur, trois trophées avec leur seuil,
// barre vers le prochain palier.
export function BadgeCategoryCard({ category, accent, progress, unlockedTiers, active }: CategoryCardProps) {
  const labels = texts.categories[category];
  const hasAny = unlockedTiers.size > 0;
  const emblem = CATEGORY_EMBLEMS[category];
  const status = statusText(category, progress);
  const tierLabels = TIERS.map((tier) => labels.tier(BADGE_TIERS[category][tier - 1]));
  const accessibility = `${labels.title}, ${status}. ${TIERS.map((tier) => `${tierLabels[tier - 1]} : ${unlockedTiers.has(tier) ? texts.unlocked : texts.locked}`).join(', ')}`;
  return (
    <View style={styles.card} accessible accessibilityLabel={accessibility}>
      <View style={styles.row}>
        <View style={[styles.tile, { backgroundColor: accent }, !hasAny && styles.faded]}>
          <MovingIconView motion={CATEGORY_MOTIONS[category]} active={active && hasAny}>
            <EmblemArt name={emblem} size={TILE_EMBLEM_SIZE} />
          </MovingIconView>
        </View>
        <View style={styles.texts}>
          <Text style={styles.title} numberOfLines={2}>
            {labels.title}
          </Text>
          <Text style={styles.status} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
            {status}
          </Text>
        </View>
        <View style={styles.trophies}>
          {TIERS.map((tier) => {
            const isUnlocked = unlockedTiers.has(tier);
            return (
              <View key={tier} style={styles.trophy}>
                {tier === 3 && isUnlocked ? (
                  <UltimateTrophyView emblem={emblem} width={TROPHY_WIDTH} active={active} />
                ) : (
                  <TrophyArt tier={tier} emblem={emblem} isUnlocked={isUnlocked} width={TROPHY_WIDTH} />
                )}
                <Text style={[styles.tierLabel, { color: isUnlocked ? AppColors.badgeTiers[tier - 1] : AppColors.badgeLocked }]} numberOfLines={1}>
                  {tierLabels[tier - 1]}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.round(progress.fraction * 100)}%`, backgroundColor: accent }, !hasAny && styles.faded]} />
      </View>
    </View>
  );
}

interface SingleCardProps {
  badge: SingleBadge;
  isUnlocked: boolean;
  active: boolean;
  // Partager, Noter : la carte est un bouton (déclaratif, débloqué à l'ouverture).
  onPress?: () => void;
}

// Badge unique (maquette G1) : petite carte, coupe ou médaille, titre ; grisée tant qu'il est verrouillé.
export function BadgeSingleCard({ badge, isUnlocked, active, onPress }: SingleCardProps) {
  const labels = texts.singles[badge];
  const action = 'action' in labels ? labels.action : null;
  const trophy = (
    <TrophyArt tier={SINGLE_SHAPES[badge]} emblem={SINGLE_EMBLEMS[badge]} isUnlocked={isUnlocked} width={SINGLE_TROPHY_WIDTH} />
  );
  const content = (
    <>
      {isUnlocked ? (
        <MovingIconView motion={SINGLE_MOTIONS[badge]} active={active}>
          {trophy}
        </MovingIconView>
      ) : (
        trophy
      )}
      <Text style={[styles.singleTitle, !isUnlocked && styles.singleLocked]} numberOfLines={2}>
        {labels.title}
      </Text>
      {action && onPress && <Text style={styles.singleAction}>{action}</Text>}
    </>
  );
  const accessibility = `${labels.title}, ${isUnlocked ? texts.unlocked : texts.locked}`;
  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${accessibility}. ${action ?? ''}`}
        onPress={onPress}
        style={({ pressed }) => [styles.single, pressed && styles.pressed]}>
        {content}
      </Pressable>
    );
  }
  return (
    <View style={styles.single} accessible accessibilityLabel={accessibility}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: 12,
    borderRadius: AppSizes.radius,
    backgroundColor: AppColors.badgeCard,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  tile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  faded: {
    opacity: BADGE_LOCKED_OPACITY,
  },
  texts: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  title: {
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: 15,
  },
  status: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.bold,
    fontSize: 12,
    ...TEXT_FIT_SAFETY,
  },
  trophies: {
    flexDirection: 'row',
    gap: 2,
  },
  trophy: {
    width: TROPHY_WIDTH + 4,
    alignItems: 'center',
    gap: 2,
  },
  tierLabel: {
    fontFamily: AppFonts.black,
    fontSize: 12,
    ...TEXT_FIT_SAFETY,
  },
  track: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: AppColors.badgeTrack,
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
  single: {
    flex: 1,
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    padding: Spacing.two,
    borderRadius: AppSizes.radius,
    backgroundColor: AppColors.badgeCard,
  },
  pressed: {
    opacity: 0.7,
  },
  // Largeur de la carte et texte centré : centré quelle que soit la mesure du texte (deux lignes, Android).
  singleTitle: {
    alignSelf: 'stretch',
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: 13,
    textAlign: 'center',
  },
  singleLocked: {
    color: AppColors.badgeLocked,
  },
  singleAction: {
    alignSelf: 'center',
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    borderRadius: AppSizes.radiusPill,
    overflow: 'hidden',
    backgroundColor: AppColors.badgeNotice,
    color: AppColors.onBadge,
    fontFamily: AppFonts.black,
    fontSize: 12,
    ...TEXT_FIT_SAFETY,
  },
});
