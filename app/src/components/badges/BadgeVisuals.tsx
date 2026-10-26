import type { ReactNode } from 'react';

import { badgeMotion } from '@/lib/badgeMotion';

import { TrophyArt } from './BadgeArt';
import type { EmblemName } from './badgeSvgSources';
import type { IconMotion } from './iconMotions';
import { MotionBoundary } from './MotionBoundary';

// Trophée ultime animé si Reanimated est disponible, sinon dessin fixe (même taille).
export function UltimateTrophyView({ emblem, width, active, withEntrance }: { emblem: EmblemName; width: number; active: boolean; withEntrance?: boolean }) {
  const still = <TrophyArt tier={3} emblem={emblem} isUnlocked width={width} />;
  const motion = badgeMotion();
  if (!motion) return still;
  return (
    <MotionBoundary fallback={still}>
      <motion.UltimateTrophy emblem={emblem} width={width} active={active} withEntrance={withEntrance} />
    </MotionBoundary>
  );
}

// Icône qui bouge (catégorie ou badge unique débloqué), ou immobile.
export function MovingIconView({ motion: iconMotion, active, children }: { motion: IconMotion; active: boolean; children: ReactNode }) {
  const motion = badgeMotion();
  if (!motion || !active) return children;
  return (
    <MotionBoundary fallback={children}>
      <motion.MovingIcon motion={iconMotion} active={active}>
        {children}
      </motion.MovingIcon>
    </MotionBoundary>
  );
}
