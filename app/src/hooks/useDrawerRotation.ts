import * as ScreenOrientation from 'expo-screen-orientation';
import { useEffect } from 'react';

// App (Android) : le reste de l'app est en portrait (app.json). Tant que l'écran du dessinateur est affiché,
// le téléphone peut tourner (paysage, maquette E2) ; en le quittant (fin de la manche), retour au portrait.
export function useDrawerRotation(): void {
  useEffect(() => {
    ScreenOrientation.unlockAsync().catch((error: unknown) => {
      if (__DEV__) console.warn('[dessin] Rotation non débloquée', error);
    });
    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch((error: unknown) => {
        if (__DEV__) console.warn('[dessin] Retour au portrait refusé', error);
      });
    };
  }, []);
}
