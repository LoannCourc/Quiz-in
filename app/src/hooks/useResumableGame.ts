import { isResumableBy } from '@shared/hostEngine';
import type { GameStatus } from '@shared/types';
import { useFocusEffect } from 'expo-router';
import { get, ref } from 'firebase/database';
import { useCallback, useState } from 'react';

import { db, ensureSignedIn } from '@/lib/firebase';
import { clearHostedGameCode, loadHostedGameCode } from '@/lib/hostedGameStorage';

// Code de la partie que cet appareil peut reprendre (hôte relancé en pleine partie), ou null.
// Vérifiée dans la base à chaque retour sur l'accueil (il reste monté sous les autres écrans : après
// « Quitter », l'ancien bouton restait affiché) ; rien n'est proposé pendant la vérification. Partie
// disparue, terminée, d'un autre hôte, ou hôte parti depuis plus de 5 min : le code mémorisé est effacé.
export function useResumableGame(): string | null {
  const [code, setCode] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      setCode(null);
      findResumableGame()
        .then((found) => {
          if (isActive) setCode(found);
        })
        .catch((error: unknown) => console.warn('[resume] Vérification de la partie à reprendre impossible', error));
      return () => {
        isActive = false;
      };
    }, []),
  );

  return code;
}

async function findResumableGame(): Promise<string | null> {
  const code = await loadHostedGameCode();
  if (!code) return null;
  const user = await ensureSignedIn();
  // Champs publics seulement : hostUid, status et hostLeftAt ; heure du serveur par son décalage.
  const [hostUid, status, hostLeftAt, offset] = await Promise.all([
    get(ref(db, `sessions/${code}/hostUid`)),
    get(ref(db, `sessions/${code}/status`)),
    get(ref(db, `sessions/${code}/hostLeftAt`)),
    get(ref(db, '.info/serverTimeOffset')),
  ]);
  const game = hostUid.exists()
    ? {
        hostUid: hostUid.val() as string,
        status: status.val() as GameStatus,
        hostLeftAt: typeof hostLeftAt.val() === 'number' ? (hostLeftAt.val() as number) : undefined,
      }
    : null;
  const nowServer = Date.now() + (typeof offset.val() === 'number' ? (offset.val() as number) : 0);
  if (isResumableBy(game, user.uid, nowServer)) return code;
  await clearHostedGameCode();
  return null;
}
