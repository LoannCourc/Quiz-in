import type { UpdatePrompt } from '@shared/appVersion';
import { useCallback, useEffect, useState } from 'react';

import { readUpdatePrompt, recordUpdateReminder } from '@/lib/appUpdate';

const NONE: UpdatePrompt = { kind: 'none' };

// Une seule lecture par lancement de l'app (spec 21), partagée par les retours sur l'accueil.
let launchPrompt: Promise<UpdatePrompt> | null = null;

// Mise à jour disponible, vue de l'accueil. isActive faux (mode salon de Changer de jeu) : rien, jamais lu.
// La lecture ne retarde pas l'accueil : il s'affiche tout de suite, la feuille ou l'écran arrive ensuite.
// Feuille douce : montrée une fois par lancement, comptée pour la fréquence (une fois par jour, trois par
// version) dès qu'elle s'affiche ; « Plus tard » la ferme. Écran obligatoire : gardé tout le lancement.
export function useAppUpdate(isActive: boolean): { prompt: UpdatePrompt; dismiss: () => void } {
  const [prompt, setPrompt] = useState<UpdatePrompt>(NONE);

  useEffect(() => {
    if (!isActive) return;
    let isMounted = true;
    launchPrompt ??= readUpdatePrompt();
    void launchPrompt.then((result) => {
      if (!isMounted) return;
      if (result.kind === 'soft') {
        launchPrompt = Promise.resolve(NONE);
        void recordUpdateReminder(result.latest);
      }
      setPrompt(result);
    });
    return () => {
      isMounted = false;
    };
  }, [isActive]);

  const dismiss = useCallback(() => setPrompt((current) => (current.kind === 'soft' ? NONE : current)), []);
  return { prompt: isActive ? prompt : NONE, dismiss };
}
