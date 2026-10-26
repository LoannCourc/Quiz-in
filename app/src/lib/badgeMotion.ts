// Animations des badges (Reanimated) chargées à la demande : jamais au démarrage de l'app (expo-router charge
// toutes les routes à l'ouverture), seulement à l'affichage de l'écran « Mes badges » ou de la fenêtre de
// célébration. Chargement impossible : null, les badges restent des dessins fixes (rien ne plante).
type BadgeMotionModule = typeof import('@/components/badges/motion/BadgeMotion');

let loaded: BadgeMotionModule | null | undefined;

export function badgeMotion(): BadgeMotionModule | null {
  if (loaded !== undefined) return loaded;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- chargement à la demande (voir plus haut)
    loaded = require('@/components/badges/motion/BadgeMotion') as BadgeMotionModule;
  } catch (error) {
    console.warn('[badges] Animations indisponibles : dessins fixes', error);
    loaded = null;
  }
  return loaded;
}

// Erreur pendant une animation (MotionBoundary) : plus d'animation jusqu'à la relance de l'app.
export function disableBadgeMotion(): void {
  loaded = null;
}
