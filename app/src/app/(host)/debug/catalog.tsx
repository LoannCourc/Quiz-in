import { Redirect } from 'expo-router';
import type { ComponentType } from 'react';

import { isPublishedWeb } from '@/lib/platform';

// Démo, en développement seulement. En production, __DEV__ vaut false : Metro retire la branche
// et le module de démo n'est inclus ni dans le site des joueurs ni dans l'APK publié.
const CatalogDemoScreen: ComponentType | null = __DEV__
  ? // eslint-disable-next-line @typescript-eslint/no-require-imports -- require conditionnel : seul moyen d'exclure le module du bundle de production
    require('@/debug/CatalogDemoScreen').default
  : null;

export default function CatalogDemoRoute() {
  return CatalogDemoScreen ? <CatalogDemoScreen /> : <Redirect href={isPublishedWeb ? '/join' : '/'} />;
}
