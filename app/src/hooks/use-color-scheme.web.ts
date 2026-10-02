import { useSyncExternalStore } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

// Aucune source à écouter : seule compte la différence entre rendu serveur et rendu client.
const subscribe = () => () => {};

// Rendu statique (web) : thème clair pendant l'hydratation, pour que le HTML généré et le premier
// rendu du navigateur soient identiques ; ensuite, thème du système.
export function useColorScheme() {
  const hasHydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const colorScheme = useRNColorScheme();

  return hasHydrated ? colorScheme : 'light';
}
