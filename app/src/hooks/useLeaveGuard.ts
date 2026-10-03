import { router } from 'expo-router';
import { useNavigation, usePreventRemove } from 'expo-router/react-navigation';
import { useEffect } from 'react';
import { BackHandler } from 'react-native';

import { strings } from '@/constants/strings';
import { confirmAction } from '@/lib/confirm';

// « Quitter la partie ? Elle sera interrompue » ; onLeave n'est appelé que si l'hôte confirme.
function confirmLeave(onLeave: () => void): void {
  const { title, message, stay, leave } = strings.leaveGame;
  confirmAction({ title, message, confirm: leave, cancel: stay }, onLeave);
}

// Au plus ce délai d'attente de la pause avant de quitter (hors ligne, l'écriture resterait en attente).
const PAUSE_BEFORE_LEAVE_MAX_MS = 2_000;

// Pendant une partie en cours, toute sortie de l'écran hôte demande confirmation : retour,
// geste, lien. Sans cela, quitter l'écran couperait le minuteur du moteur en silence.
// beforeLeave (mise en pause) est attendu avant de partir, au plus PAUSE_BEFORE_LEAVE_MAX_MS.
// Attend beforeLeave (au plus PAUSE_BEFORE_LEAVE_MAX_MS), puis quitte, même en cas d'échec.
function leaveAfter(beforeLeave: () => Promise<unknown>, leave: () => void): void {
  const timeout = new Promise((resolve) => setTimeout(resolve, PAUSE_BEFORE_LEAVE_MAX_MS));
  Promise.race([beforeLeave(), timeout])
    .catch((error: unknown) => console.warn('[absence] Pause avant de quitter non enregistrée', error))
    .finally(leave);
}

export function useLeaveGuard(isActive: boolean, beforeLeave: () => Promise<unknown>): void {
  const navigation = useNavigation();

  // Navigation (retour, geste, lien) : bloquée, puis rejouée si l'hôte confirme.
  usePreventRemove(isActive, ({ data }) => {
    confirmLeave(() => leaveAfter(beforeLeave, () => navigation.dispatch(data.action)));
  });

  // Bouton Retour d'Android sans écran derrière : il fermerait l'app sans passer par la navigation.
  useEffect(() => {
    if (!isActive) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (router.canGoBack()) return false;
      confirmLeave(() => leaveAfter(beforeLeave, () => BackHandler.exitApp()));
      return true;
    });
    return () => subscription.remove();
  }, [isActive, beforeLeave]);
}
