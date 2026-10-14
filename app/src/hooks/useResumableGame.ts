import { firstValue } from '@shared/firstValue';
import { resumeDecision, type ResumeDecision, type ResumeRead } from '@shared/hostEngine';
import type { GameStatus } from '@shared/types';
import { useFocusEffect } from 'expo-router';
import { get, onValue, ref } from 'firebase/database';
import { useCallback, useState } from 'react';

import { db, ensureSignedIn } from '@/lib/firebase';
import { clearHostedGameCode, loadHostedGameCode } from '@/lib/hostedGameStorage';

// Lecture de la partie : au-delà, elle compte comme échouée (doute, nouvel essai).
const READ_TIMEOUT_MS = 8_000;
// Doute : nouvel essai après ce délai, tant que l'accueil est affiché.
const RETRY_DELAY_MS = 5_000;
// Heure du serveur : décalage local de Firebase, attendu au plus ce délai (sinon l'horloge du téléphone).
const OFFSET_TIMEOUT_MS = 2_000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([promise, new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Délai dépassé')), ms))]);
}

// Décalage de l'horloge du serveur, comme useServerTimeOffset (onValue : get() n'est pas fait pour .info).
// onValue rappelle tout de suite quand la valeur est en cache : firstValue le supporte.
function readServerOffset(): Promise<number> {
  return firstValue<number>(
    (onOffset) =>
      onValue(ref(db, '.info/serverTimeOffset'), (snapshot) => {
        const offset: unknown = snapshot.val();
        onOffset(typeof offset === 'number' ? offset : 0);
      }),
    OFFSET_TIMEOUT_MS,
    0,
  );
}

// Champs publics seulement : hostUid, status et hostLeftAt. Toute erreur (refus au relancement, avant que la
// connexion porte l'authentification ; réseau ; délai) donne « failed », jamais « missing ».
async function readGame(code: string): Promise<ResumeRead> {
  try {
    const [hostUid, status, hostLeftAt] = await withTimeout(
      Promise.all([
        get(ref(db, `sessions/${code}/hostUid`)),
        get(ref(db, `sessions/${code}/status`)),
        get(ref(db, `sessions/${code}/hostLeftAt`)),
      ]),
      READ_TIMEOUT_MS,
    );
    if (!hostUid.exists()) return { kind: 'missing' };
    return {
      kind: 'found',
      game: {
        hostUid: hostUid.val() as string,
        status: status.val() as GameStatus,
        hostLeftAt: typeof hostLeftAt.val() === 'number' ? (hostLeftAt.val() as number) : undefined,
      },
    };
  } catch (error) {
    console.warn('[resume] Lecture de la partie à reprendre impossible : nouvel essai', error);
    return { kind: 'failed' };
  }
}

async function checkStoredGame(): Promise<{ code: string; decision: ResumeDecision } | null> {
  const code = await loadHostedGameCode();
  if (!code) return null;
  try {
    const user = await withTimeout(ensureSignedIn(), READ_TIMEOUT_MS);
    const [read, offset] = await Promise.all([readGame(code), readServerOffset()]);
    return { code, decision: resumeDecision(read, user.uid, Date.now() + offset) };
  } catch (error) {
    console.warn('[resume] Connexion pas encore prête : nouvel essai', error);
    return { code, decision: 'retry' };
  }
}

// Code de la partie que cet appareil peut reprendre, ou null. Vérifié à chaque retour sur l'accueil (il reste
// monté sous les autres écrans). Rien n'est affiché pendant la première vérification. Le code gardé n'est
// effacé que sur une réponse certaine (resumeDecision) ; en cas de doute, le bouton reste et la lecture
// recommence toutes les RETRY_DELAY_MS.
export function useResumableGame(): string | null {
  const [code, setCode] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      let retryTimer: ReturnType<typeof setTimeout> | undefined;
      setCode(null);
      const check = () => {
        checkStoredGame()
          .then(async (result) => {
            if (!isActive) return;
            if (result === null) return setCode(null);
            if (result.decision === 'forget') {
              await clearHostedGameCode();
              if (isActive) setCode(null);
              return;
            }
            setCode(result.code);
            if (result.decision === 'retry') retryTimer = setTimeout(check, RETRY_DELAY_MS);
          })
          .catch((error: unknown) => {
            // Erreur imprévue : le code gardé n'est jamais effacé, nouvel essai.
            console.warn('[resume] Vérification de la partie à reprendre impossible : nouvel essai', error);
            if (isActive) retryTimer = setTimeout(check, RETRY_DELAY_MS);
          });
      };
      check();
      return () => {
        isActive = false;
        clearTimeout(retryTimer);
      };
    }, []),
  );

  return code;
}
