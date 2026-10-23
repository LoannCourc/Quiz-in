import type { BadgeTier } from '@shared/badges';
import { SvgXml } from 'react-native-svg';

import { EMBLEM_SVGS, TROPHY_SVGS, type EmblemName, type TrophyShape } from './badgeSvgSources';

export { CATEGORY_EMBLEMS, SINGLE_EMBLEMS, SINGLE_SHAPES } from './badgeEmblems';

// Dessins du pack (assets/badges/, voir son README) affichés tels quels : forme du palier + emblème de la
// catégorie, inséré à l'emplacement prévu (#emblem). Rien n'est redessiné.

export const TROPHY_VIEWBOX = { width: 80, height: 106 } as const;

const UNLOCKED_SHAPES: Record<BadgeTier, TrophyShape> = { 1: 'medal', 2: 'cup', 3: 'gold' };
// La silhouette de la coupe sert aussi au palier 3 (README du pack).
const LOCKED_SHAPES: Record<BadgeTier, TrophyShape> = { 1: 'lockedMedal', 2: 'lockedCup', 3: 'lockedCup' };

const EMBLEM_SLOT = /<!--[^>]*-->/;

// Emblème 24 × 24 : ses attributs de dessin (trait encre, bouts arrondis) gardés sur un groupe.
function emblemGroup(name: EmblemName): string {
  const svg = EMBLEM_SVGS[name];
  const root = /^<svg([^>]*)>([\s\S]*)<\/svg>$/.exec(svg);
  if (!root) return '';
  const attributes = root[1].replace(/\s(xmlns|viewBox|width|height)="[^"]*"/g, '');
  return `<g${attributes}>${root[2]}</g>`;
}

const xmlCache = new Map<string, string>();

function cached(key: string, build: () => string): string {
  const known = xmlCache.get(key);
  if (known !== undefined) return known;
  const xml = build();
  xmlCache.set(key, xml);
  return xml;
}

export function trophyXml(shape: TrophyShape, emblem: EmblemName | null): string {
  return cached(`${shape}|${emblem ?? ''}`, () => {
    const svg = TROPHY_SVGS[shape];
    return emblem ? svg.replace(EMBLEM_SLOT, emblemGroup(emblem)) : svg.replace(EMBLEM_SLOT, '');
  });
}

// Trophée or sans ses éléments animés (reflet clippé, étincelles), qui sont dessinés par-dessus.
export function goldBaseXml(emblem: EmblemName): string {
  return cached(`goldBase|${emblem}`, () =>
    trophyXml('gold', emblem)
      .replace(/<g clip-path="url\(#gold-cup-clip\)">[\s\S]*?<\/g>/, '')
      .replace(/<path id="gold-sparkle-[12]"[^>]*\/>/g, ''),
  );
}

// Éléments animables du trophée or, repris du dessin (positions dans son viewBox 0 -6 80 106).
export const GOLD_PARTS = {
  cupClip: 'M18 14 H62 V40 Q62 64 40 68 Q18 64 18 40 Z',
  shine: { x: 0, y: 8, width: 22, height: 66, skewX: -18 },
  // Balayage du reflet : de -70 à +90 unités (README du pack).
  shineFrom: -70,
  shineTo: 90,
  sparkles: [
    { path: 'M70 6 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z', box: { x: 63, y: 6, size: 14 } },
    { path: 'M8 52 l1.6 4 4 1.6 -4 1.6 -1.6 4 -1.6 -4 -4 -1.6 4 -1.6z', box: { x: 2.4, y: 52, size: 11.2 } },
  ],
} as const;

export function trophyHeight(width: number): number {
  return (width * TROPHY_VIEWBOX.height) / TROPHY_VIEWBOX.width;
}

interface TrophyArtProps {
  tier: BadgeTier;
  emblem: EmblemName;
  isUnlocked: boolean;
  width: number;
}

// Trophée fixe : médaille, coupe ou grand trophée avec l'emblème ; silhouette pointillée avec cadenas sinon.
export function TrophyArt({ tier, emblem, isUnlocked, width }: TrophyArtProps) {
  const xml = isUnlocked ? trophyXml(UNLOCKED_SHAPES[tier], emblem) : trophyXml(LOCKED_SHAPES[tier], null);
  return <SvgXml xml={xml} width={width} height={trophyHeight(width)} />;
}

// Emblème seul (tuile de catégorie, bouton de l'accueil) : trait encre du pack.
export function EmblemArt({ name, size }: { name: EmblemName; size: number }) {
  return <SvgXml xml={EMBLEM_SVGS[name]} width={size} height={size} />;
}
