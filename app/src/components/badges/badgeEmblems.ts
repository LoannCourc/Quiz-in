import type { BadgeCategory, SingleBadge } from '@shared/badges';

import type { EmblemName } from './badgeSvgSources';

// Emblème du pack de chaque catégorie et de chaque badge unique (sans module natif : lisible au démarrage).
export const CATEGORY_EMBLEMS: Record<BadgeCategory, EmblemName> = {
  played: 'parties-jouees',
  wins: 'parties-gagnees',
  losses: 'parties-perdues',
  gathering: 'joueurs-reunis',
  winStreak: 'serie-de-victoires',
  loyal: 'fidele',
  allRounder: 'touche-a-tout',
  marathon: 'marathon',
  lightning: 'rapide-comme-l-eclair',
  liar: 'menteur-ultime',
  artist: 'artiste',
};

export const SINGLE_EMBLEMS: Record<SingleBadge, EmblemName> = {
  perfect: 'sans-faute',
  comeback: 'comeback',
  christmas: 'noel',
  newYear: 'reveillon',
  share: 'partager',
  rate: 'noter',
};

// Forme d'un badge unique (maquette G1) : médaille pour Partager et Noter, coupe pour les autres.
export const SINGLE_SHAPES: Record<SingleBadge, 1 | 2> = {
  perfect: 2,
  comeback: 2,
  christmas: 2,
  newYear: 2,
  share: 1,
  rate: 1,
};
