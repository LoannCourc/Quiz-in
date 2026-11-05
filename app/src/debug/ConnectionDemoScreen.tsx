import { useLocalSearchParams } from 'expo-router';

import { ConnectionRequiredPanel } from '@/components/connection/ConnectionRequiredPanel';
import { Screen } from '@/components/ui/Screen';
import { Logo } from '@/components/ui/Logo';

// /debug/connection : panneau « Connexion requise » sans couper le réseau. « Réessayer » échoue toujours, après 1 s.
// &nosettings=1 : sans le lien « Ouvrir les réglages » (site des joueurs).
export default function ConnectionDemoScreen() {
  const { nosettings } = useLocalSearchParams<{ nosettings?: string }>();
  return (
    <Screen>
      <Logo size="medium" />
      <ConnectionRequiredPanel
        onRetry={() => new Promise((resolve) => setTimeout(() => resolve(false), 1_000))}
        onOpenSettings={nosettings === '1' ? undefined : () => undefined}
      />
    </Screen>
  );
}
