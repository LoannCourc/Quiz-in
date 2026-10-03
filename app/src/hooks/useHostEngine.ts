import {
  isTransitionLocked,
  nextDeadline,
  transitionKey,
  type ExpectedPhase,
  type TransitionLock,
} from '@shared/hostEngine';
import type { Question, Session } from '@shared/types';
import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { runTransition } from '@/lib/hostGame';

export interface HostEngine {
  // Contrôle « Passer » de l'hôte.
  skip: () => void;
}

interface HostEngineInput {
  code: string;
  // Session complète lue en temps réel par l'hôte.
  session: Session;
  // Questions de la partie ; null tant qu'elles ne sont pas chargées (aucune transition).
  questions: readonly Question[] | null;
  serverOffsetMs: number;
  // Faux hors ligne (ou retour de coupure en cours) : aucune transition, aucune écriture.
  canWrite: boolean;
}

// Compteur incrémenté à chaque retour de l'app au premier plan : force le recalcul de
// l'échéance (les minuteurs JavaScript peuvent être suspendus en arrière-plan).
function useForegroundCount(): number {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') setCount((current) => current + 1);
    });
    return () => subscription.remove();
  }, []);
  return count;
}

// Boucle de jeu de l'hôte. À chaque nouvelle valeur de la session (ou retour au premier plan),
// on programme UN seul minuteur jusqu'à la prochaine échéance (heure du serveur). Le nettoyage
// de l'effet annule le minuteur précédent : jamais deux minuteurs actifs, même en mode strict.
// Rien n'est gardé en mémoire : après une relance, la boucle repart de la session stockée, et
// une échéance déjà passée déclenche la transition aussitôt (rattrapage).
// Hors ligne, la boucle est gelée ; elle repart quand canWrite redevient vrai (partie en pause).
export function useHostEngine({ code, session, questions, serverOffsetMs, canWrite }: HostEngineInput): HostEngine {
  const foregroundCount = useForegroundCount();
  const lock = useRef<TransitionLock | null>(null);
  const canWriteRef = useRef(canWrite);

  useEffect(() => {
    canWriteRef.current = canWrite;
  }, [canWrite]);

  useEffect(() => {
    if (!questions || !canWrite) return;
    const deadline = nextDeadline(session);
    if (deadline === null) return;
    const expected: ExpectedPhase = { status: session.status, currentIndex: session.currentIndex };
    const delayMs = Math.max(0, deadline - (Date.now() + serverOffsetMs));

    const timeoutId = setTimeout(() => {
      const nowServer = Date.now() + serverOffsetMs;
      void advance(code, questions, expected, nowServer, lock, canWriteRef);
    }, delayMs);
    return () => clearTimeout(timeoutId);
  }, [code, session, questions, serverOffsetMs, canWrite, foregroundCount]);

  // Passer : la transition suivante tout de suite, par le même chemin que le minuteur (même verrou,
  // même état attendu) : un double appui, ou un appui en même temps que le minuteur, est ignoré.
  function skip() {
    if (!questions || !canWriteRef.current) return;
    const expected: ExpectedPhase = { status: session.status, currentIndex: session.currentIndex };
    void advance(code, questions, expected, Date.now() + serverOffsetMs, lock, canWriteRef);
  }

  return { skip };
}

// Exécute une transition, sauf si la même est déjà en cours d'écriture depuis moins de
// TRANSITION_LOCK_MAX_MS (une écriture hors ligne peut rester en attente : le verrou finit
// par être relâché pour ne jamais bloquer la partie).
async function advance(
  code: string,
  questions: readonly Question[],
  expected: ExpectedPhase,
  nowServer: number,
  lock: { current: TransitionLock | null },
  canWrite: { current: boolean },
): Promise<void> {
  const key = transitionKey(expected);
  if (isTransitionLocked(lock.current, key, Date.now())) return;
  if (lock.current?.key === key) {
    console.warn(`[engine] Verrou relâché après une écriture en attente : ${key}`);
  }
  const current: TransitionLock = { key, since: Date.now() };
  lock.current = current;
  try {
    await runTransition(code, questions, expected, nowServer, () => canWrite.current);
  } catch (error) {
    // Erreur d'écriture : on réessaiera à la prochaine valeur de la session ou au premier plan.
    console.error('[engine] Transition impossible', error);
  } finally {
    if (lock.current === current) lock.current = null;
  }
}
