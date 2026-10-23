import type { BadgeCategory, BadgeId, SingleBadge } from '@shared/badges';

import { strings } from '@/constants/strings';

const texts = strings.trophies;

// Nom affiché d'un badge : « Fidèle · coupe », ou le badge unique (« Noël »).
export function badgeLabel(id: BadgeId): string {
  if (!id.includes('.')) return texts.singles[id as SingleBadge].title;
  const [category, tier] = id.split('.') as [BadgeCategory, string];
  return `${texts.categories[category].title} · ${texts.tiers[Number(tier) - 1]}`;
}
