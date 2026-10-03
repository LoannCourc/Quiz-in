import { isResumableBy } from '@shared/hostEngine';
import type { GameStatus } from '@shared/types';
import { get, ref } from 'firebase/database';
import { useEffect, useState } from 'react';

import { db, ensureSignedIn } from '@/lib/firebase';
import { clearHostedGameCode, loadHostedGameCode } from '@/lib/hostedGameStorage';

// Code de la partie que cet appareil peut reprendre (hôte relancé en pleine partie), ou null.
// La partie doit exister, ne pas être terminée et avoir cet utilisateur pour hôte ; sinon,
// le code mémorisé est effacé et rien n'est proposé.
export function useResumableGame(): string | null {
  const [code, setCode] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    findResumableGame()
      .then((found) => {
        if (isActive) setCode(found);
      })
      .catch((error: unknown) => console.warn('[resume] Vérification de la partie à reprendre impossible', error));
    return () => {
      isActive = false;
    };
  }, []);

  return code;
}

async function findResumableGame(): Promise<string | null> {
  const code = await loadHostedGameCode();
  if (!code) return null;
  const user = await ensureSignedIn();
  // Champs publics seulement : hostUid et status.
  const [hostUid, status] = await Promise.all([
    get(ref(db, `sessions/${code}/hostUid`)),
    get(ref(db, `sessions/${code}/status`)),
  ]);
  const game = hostUid.exists() ? { hostUid: hostUid.val() as string, status: status.val() as GameStatus } : null;
  if (isResumableBy(game, user.uid)) return code;
  await clearHostedGameCode();
  return null;
}
