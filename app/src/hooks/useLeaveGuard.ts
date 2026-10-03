import { router } from 'expo-router';
import { useNavigation, usePreventRemove } from 'expo-router/react-navigation';
import { useEffect } from 'react';
import { Alert, BackHandler, Platform } from 'react-native';

import { strings } from '@/constants/strings';

// Demande « Quitter la partie ? Elle sera interrompue » ; onLeave n'est appelé que si l'hôte confirme.
function confirmLeave(onLeave: () => void): void {
  const { title, message, stay, leave } = strings.leaveGame;
  if (Platform.OS === 'web') {
    // Alert.alert ne fait rien sur le web (react-native-web) : boîte de confirmation du navigateur.
    if (window.confirm(`${title} ${message}`)) onLeave();
    return;
  }
  Alert.alert(title, message, [
    { text: stay, style: 'cancel' },
    { text: leave, style: 'destructive', onPress: onLeave },
  ]);
}

// Pendant une partie en cours, toute sortie de l'écran hôte demande confirmation : retour,
// geste, lien. Sans cela, quitter l'écran couperait le minuteur du moteur en silence.
export function useLeaveGuard(isActive: boolean): void {
  const navigation = useNavigation();

  // Navigation (retour, geste, lien) : bloquée, puis rejouée si l'hôte confirme.
  usePreventRemove(isActive, ({ data }) => {
    confirmLeave(() => navigation.dispatch(data.action));
  });

  // Bouton Retour d'Android sans écran derrière : il fermerait l'app sans passer par la navigation.
  useEffect(() => {
    if (!isActive) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (router.canGoBack()) return false;
      confirmLeave(() => BackHandler.exitApp());
      return true;
    });
    return () => subscription.remove();
  }, [isActive]);
}
