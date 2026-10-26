import { useLocalSearchParams } from 'expo-router';

import { HomeView } from '@/components/host/home/HomeView';
import { UpdateRequiredScreen } from '@/components/update/UpdateRequiredScreen';
import { UpdateSheet } from '@/components/update/UpdateSheet';
import { Screen } from '@/components/ui/Screen';

const DEMO_STORE_URL = 'https://play.google.com/store/apps/details?id=com.herocorp.quizin';

// Ouverture du store simulée : fail=1, aucun lien ne s'ouvre (message de secours).
function demoOpenStore(fails: boolean) {
  return async () => !fails;
}

// /debug/update?kind=soft|required&fail=1 : feuille douce sur l'accueil, ou écran obligatoire (spec 21).
export default function UpdateDemoScreen() {
  const { kind, fail } = useLocalSearchParams<{ kind?: string; fail?: string }>();
  const openStore = demoOpenStore(fail === '1');
  if (kind === 'required') return <UpdateRequiredScreen storeUrl={DEMO_STORE_URL} openStore={openStore} />;
  return (
    <Screen>
      <HomeView onOpenGame={() => undefined} onJoinWithCode={() => undefined} isBlindTestEnabled={false} isDrawEnabled />
      <UpdateSheet isOpen storeUrl={DEMO_STORE_URL} onClose={() => undefined} openStore={openStore} />
    </Screen>
  );
}
