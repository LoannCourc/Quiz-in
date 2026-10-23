import type { BadgeCategory, SingleBadge } from '@shared/badges';

// Mouvements discrets des icônes de catégorie et des badges uniques (validés) : pulsation de 16 % au plus,
// rotation de 8° au plus, déplacement de 3 px au plus. Une boucle complète par cycle.
// scale : 1 → 1 + amount → 1 ; rotate : -amount° → +amount° ; up : 0 → -amount px → 0 ;
// sideways : -amount → +amount px ; diagonal : 0 → (amount, amount) px → 0 (crayon qui trace) ;
// flicker : échelle verticale 1 → 1,1 et ±amount° depuis la base (flamme).
export type IconMotionKind = 'scale' | 'rotate' | 'up' | 'sideways' | 'diagonal' | 'flicker';

export interface IconMotion {
  kind: IconMotionKind;
  amount: number;
  durationMs: number;
  // Point fixe de la rotation ou de l'échelle (centre par défaut).
  origin?: 'bottom' | 'top' | 'bottomLeft';
}

export const CATEGORY_MOTIONS: Record<BadgeCategory, IconMotion> = {
  played: { kind: 'scale', amount: 0.16, durationMs: 2400 },
  wins: { kind: 'rotate', amount: 8, durationMs: 2400 },
  losses: { kind: 'up', amount: 3, durationMs: 1200 },
  gathering: { kind: 'sideways', amount: 2, durationMs: 1200 },
  winStreak: { kind: 'flicker', amount: 4, durationMs: 1200, origin: 'bottom' },
  loyal: { kind: 'rotate', amount: 6, durationMs: 2400, origin: 'top' },
  allRounder: { kind: 'scale', amount: 0.1, durationMs: 2400 },
  marathon: { kind: 'rotate', amount: 6, durationMs: 1200, origin: 'bottomLeft' },
  lightning: { kind: 'scale', amount: 0.16, durationMs: 1200 },
  liar: { kind: 'rotate', amount: 8, durationMs: 2400 },
  artist: { kind: 'diagonal', amount: 3, durationMs: 1200 },
};

export const SINGLE_MOTIONS: Record<SingleBadge, IconMotion> = {
  perfect: { kind: 'scale', amount: 0.1, durationMs: 2400 },
  comeback: { kind: 'up', amount: 3, durationMs: 1200 },
  christmas: { kind: 'rotate', amount: 6, durationMs: 2400 },
  newYear: { kind: 'scale', amount: 0.1, durationMs: 2400 },
  share: { kind: 'scale', amount: 0.16, durationMs: 2400 },
  rate: { kind: 'rotate', amount: 8, durationMs: 2400 },
};

// Trophée ultime (troisième palier) : flottement, reflet, étincelles.
export const ULTIMATE_MOTION = {
  floatPx: 3,
  floatMs: 2400,
  shineCycleMs: 2400,
  // Balayage pendant les premiers 45 % du cycle, puis pause.
  shineSweepShare: 0.45,
  sparkleMs: 1200,
  // Fenêtre de célébration : entrée du trophée.
  entranceFrom: 0.6,
  entranceMs: 400,
} as const;
