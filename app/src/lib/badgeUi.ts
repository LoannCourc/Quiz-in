// Interface des badges (react-native-svg) chargée à la demande, comme QuestionMarkIcon et DrawingCanvas :
// expo-router charge toutes les routes à l'ouverture, et un module natif importé en tête planterait un build
// qui ne l'a pas. Chargement impossible : null (pas de badges affichés, rien ne plante).
type BadgeUiModule = typeof import('@/components/badges/BadgeUi');

let loaded: BadgeUiModule | null | undefined;

export function badgeUi(): BadgeUiModule | null {
  if (loaded !== undefined) return loaded;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- chargement à la demande (voir plus haut)
    loaded = require('@/components/badges/BadgeUi') as BadgeUiModule;
  } catch (error) {
    console.warn('[badges] Interface des badges indisponible', error);
    loaded = null;
  }
  return loaded;
}
