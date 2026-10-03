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

import { logEngine } from '@/lib/devLog';
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
export function useHostEngine({ code, session, questions, serverOffsetMs }: HostEngineInput): HostEngine {
  const foregroundCount = useForegroundCount();
  const lock = useRef<TransitionLock | null>(null);

  useEffect(() => {
    if (!questions) return;
    const deadline = nextDeadline(session);
    if (deadline === null) return;
    const expected: ExpectedPhase = { status: session.status, currentIndex: session.currentIndex };
    const delayMs = Math.max(0, deadline - (Date.now() + serverOffsetMs));

    const timeoutId = setTimeout(() => {
      const nowServer = Date.now() + serverOffsetMs;
      void advance(code, questions, expected, nowServer, nowServer - deadline, lock);
    }, delayMs);
    return () => clearTimeout(timeoutId);
  }, [code, session, questions, serverOffsetMs, foregroundCount]);

  // Passer : la transition suivante tout de suite, par le même chemin que le minuteur (même verrou,
  // même état attendu) : un double appui, ou un appui en même temps que le minuteur, est ignoré.
  function skip() {
    if (!questions) return;
    const expected: ExpectedPhase = { status: session.status, currentIndex: session.currentIndex };
    void advance(code, questions, expected, Date.now() + serverOffsetMs, 0, lock);
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
  lateMs: number,
  lock: { current: TransitionLock | null },
): Promise<void> {
  const key = transitionKey(expected);
  const from = `${expected.status} ${expected.currentIndex}`;
  if (isTransitionLocked(lock.current, key, Date.now())) {
    logEngine(from, '—', key, 'déjà en cours', lateMs);
    return;
  }
  if (lock.current?.key === key) {
    console.warn(`[engine] Verrou relâché après une écriture en attente : ${key}`);
  }
  const current: TransitionLock = { key, since: Date.now() };
  lock.current = current;
  try {
    const outcome = await runTransition(code, questions, expected, nowServer);
    logEngine(from, outcome.result === 'applied' ? outcome.toStatus : '—', key, outcome.result, lateMs);
  } catch (error) {
    // Erreur d'écriture : on réessaiera à la prochaine valeur de la session ou au premier plan.
    logEngine(from, '—', key, 'erreur', lateMs);
    console.error('[engine] Transition impossible', error);
  } finally {
    if (lock.current === current) lock.current = null;
  }
}
