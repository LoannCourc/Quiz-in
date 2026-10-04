import { CatalogView } from '@/components/host/catalog/CatalogView';
import { Screen } from '@/components/ui/Screen';

import { DEMO_CATALOG } from './demoCatalog';

// Démo du catalogue avec des fiches fictives (développement uniquement).
export default function CatalogDemoScreen() {
  return (
    <Screen>
      <CatalogView entries={DEMO_CATALOG} onOpenQuiz={() => undefined} />
    </Screen>
  );
}
