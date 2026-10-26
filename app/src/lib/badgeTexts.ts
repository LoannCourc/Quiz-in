import { BADGE_TIERS, type BadgeCategory, type BadgeId, type BadgeTier, type SingleBadge } from '@shared/badges';

import { CATEGORY_EMBLEMS, SINGLE_EMBLEMS, SINGLE_SHAPES } from '@/components/badges/badgeEmblems';
import type { EmblemName } from '@/components/badges/badgeSvgSources';
import { strings } from '@/constants/strings';

const texts = strings.trophies;

// Ce qu'il faut pour montrer un badge débloqué : forme (palier), emblème, nom et sous-titre.
export interface BadgeInfo {
  id: BadgeId;
  shape: BadgeTier;
  emblem: EmblemName;
  title: string;
  goal: string;
  // Troisième palier d'une catégorie : fenêtre de célébration.
  ultimate: { title: string; tagline: string } | null;
}

export function badgeInfo(id: BadgeId): BadgeInfo {
  if (!id.includes('.')) {
    const single = id as SingleBadge;
    return { id, shape: SINGLE_SHAPES[single], emblem: SINGLE_EMBLEMS[single], ...texts.singles[single], ultimate: null };
  }
  const [category, tierText] = id.split('.') as [BadgeCategory, string];
  const tier = Number(tierText) as BadgeTier;
  const labels = texts.categories[category];
  const threshold = BADGE_TIERS[category][tier - 1];
  return {
    id,
    shape: tier,
    emblem: CATEGORY_EMBLEMS[category],
    title: labels.title,
    goal: labels.goal(threshold),
    ultimate: tier === 3 ? { title: labels.ultimate.title(threshold), tagline: labels.ultimate.tagline } : null,
  };
}

// Badges d'une fin de partie, du plus haut palier au plus bas (le premier est mis en avant).
export function byImportance(ids: readonly BadgeId[]): BadgeInfo[] {
  return ids.map(badgeInfo).sort((a, b) => b.shape - a.shape);
}
