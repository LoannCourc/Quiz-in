import { useEffect } from 'react';

type ScreenOrientationModule = typeof import('expo-screen-orientation');

// Module natif chargé seulement quand l'écran du dessinateur s'affiche, jamais au démarrage : un build de
// développement plus ancien, sans ce module, ouvre l'app normalement (l'écran du dessinateur reste alors
// en portrait). null : module absent.
let orientation: ScreenOrientationModule | null | undefined;

function loadOrientation(): ScreenOrientationModule | null {
  if (orientation === undefined) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports -- chargement paresseux : un module natif absent ne doit pas empêcher l'app de s'ouvrir
      orientation = require('expo-screen-orientation') as ScreenOrientationModule;
    } catch (error) {
      if (__DEV__) console.warn('[dessin] Module de rotation absent de ce build : écran en portrait', error);
      orientation = null;
    }
  }
  return orientation;
}

// App (Android) : le reste de l'app est en portrait (app.json). Tant que l'écran du dessinateur est affiché,
// le téléphone peut tourner (paysage, maquette E2) ; en le quittant (fin de la manche), retour au portrait.
export function useDrawerRotation(): void {
  useEffect(() => {
    const screen = loadOrientation();
    if (!screen) return;
    screen.unlockAsync().catch((error: unknown) => {
      if (__DEV__) console.warn('[dessin] Rotation non débloquée', error);
    });
    return () => {
      screen.lockAsync(screen.OrientationLock.PORTRAIT_UP).catch((error: unknown) => {
        if (__DEV__) console.warn('[dessin] Retour au portrait refusé', error);
      });
    };
  }, []);
}
