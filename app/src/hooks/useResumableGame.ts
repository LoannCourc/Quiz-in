import { firstValue } from '@shared/firstValue';
import type { ResumeRead } from '@shared/hostEngine';
import { runResumeCheck, type ResumeCheckDeps } from '@shared/resumeCheck';
import type { GameStatus } from '@shared/types';
import { useFocusEffect } from 'expo-router';
import { get, onValue, ref } from 'firebase/database';
import { useCallback, useState } from 'react';

import { db, ensureSignedIn } from '@/lib/firebase';
import { clearHostedGameCode, loadHostedGameCode } from '@/lib/hostedGameStorage';
import { deleteGame } from '@/lib/hostGame';

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

// Accès réels de la vérification (shared/resumeCheck), chacun borné dans le temps.
const RESUME_CHECK_DEPS: ResumeCheckDeps = {
  uid: async () => (await withTimeout(ensureSignedIn(), READ_TIMEOUT_MS)).uid,
  readGame,
  serverNow: async () => Date.now() + (await readServerOffset()),
  deleteGame: (code) => withTimeout(deleteGame(code), READ_TIMEOUT_MS),
  forgetCode: clearHostedGameCode,
  // Lignes [resume] dans la console (Metro) pour suivre les essais.
  log: (message) => console.info(message),
};

// Code de la partie que cet appareil peut reprendre, ou null. Spec 6.6 : affiché dès qu'un code est gardé sur
// le téléphone, puis vérifié à chaque retour sur l'accueil (il reste monté sous les autres écrans). Il ne
// disparaît que sur une réponse certaine ; en cas de doute, il reste et la vérification recommence toutes
// les RETRY_DELAY_MS.
export function useResumableGame(): string | null {
  const [code, setCode] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      let retryTimer: ReturnType<typeof setTimeout> | undefined;
      const retryLater = () => {
        if (isActive) retryTimer = setTimeout(check, RETRY_DELAY_MS);
      };
      const check = () => {
        loadHostedGameCode()
          .then(async (stored) => {
            if (!isActive) return;
            setCode(stored);
            if (stored === null) return;
            console.info(`[resume] ${stored} : code gardé, bouton affiché, vérification…`);
            const outcome = await runResumeCheck(stored, RESUME_CHECK_DEPS);
            if (!isActive) return;
            if (outcome === 'forgotten') setCode(null);
            if (outcome === 'retry') retryLater();
          })
          .catch((error: unknown) => {
            // Erreur imprévue : le code gardé n'est jamais effacé, nouvel essai.
            console.warn('[resume] Vérification impossible : bouton gardé, nouvel essai', error);
            retryLater();
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
