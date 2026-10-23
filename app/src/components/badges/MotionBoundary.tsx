import { Component, type ReactNode } from 'react';

import { disableBadgeMotion } from '@/lib/badgeMotion';

interface MotionBoundaryProps {
  // Dessin fixe affiché si l'animation échoue.
  fallback: ReactNode;
  children: ReactNode;
}

// Une animation de badge qui plante ne fait jamais tomber l'écran : le dessin fixe prend sa place, et les
// animations sont coupées jusqu'à la relance de l'app.
export class MotionBoundary extends Component<MotionBoundaryProps, { hasFailed: boolean }> {
  state = { hasFailed: false };

  static getDerivedStateFromError(): { hasFailed: boolean } {
    return { hasFailed: true };
  }

  componentDidCatch(error: unknown): void {
    console.warn('[badges] Animation arrêtée : dessin fixe', error);
    disableBadgeMotion();
  }

  render(): ReactNode {
    return this.state.hasFailed ? this.props.fallback : this.props.children;
  }
}
