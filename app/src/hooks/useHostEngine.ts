import { bluffChecksUpdate, isBluffQuestion } from '@shared/bluff';
import { isDrawQuestion } from '@shared/drawGame';
import { drawHintsUpdate, drawWordChangeUpdate } from '@shared/drawGuess';
import type { ValidationDecisions } from '@shared/freeAnswers';
import {
  drawCancelUpdate,
  isTransitionLocked,
  nextDeadline,
  transitionKey,
  type AudioUrls,
  type ExpectedPhase,
  type SessionUpdate,
  type TransitionLock,
} from '@shared/hostEngine';
import type { GameQuestion, Session } from '@shared/types';
import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { applyHostAction, runTransition } from '@/lib/hostGame';

export interface HostEngine {
  // Contrôle « Passer » de l'hôte ; decisions : pendant la validation (Contrôle), ses coches.
  skip: (decisions?: ValidationDecisions) => void;
  // Dessine-moi : « Annuler la manche » (réponse tout de suite, aucun point).
  cancelDrawRound: () => void;
}

interface HostEngineInput {
  code: string;
  // Session complète lue en temps réel par l'hôte.
  session: Session;
  // Questions de la partie ; null tant qu'elles ne sont pas chargées (aucune transition).
  questions: readonly GameQuestion[] | null;
  serverOffsetMs: number;
  // Faux hors ligne (ou retour de coupure en cours) : aucune transition, aucune écriture.
  canWrite: boolean;
  // Blind test : adresses des extraits, renouvelées en continu (lues au moment de chaque transition).
  audioUrls?: AudioUrls;
}

const NO_AUDIO_URLS: AudioUrls = {};

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
export function useHostEngine({
  code,
  session,
  questions,
  serverOffsetMs,
  canWrite,
  audioUrls = NO_AUDIO_URLS,
}: HostEngineInput): HostEngine {
  const foregroundCount = useForegroundCount();
  const lock = useRef<TransitionLock | null>(null);
  const canWriteRef = useRef(canWrite);
  // Référence : un renouvellement d'adresse ne doit pas reprogrammer le minuteur de la partie.
  const audioUrlsRef = useRef(audioUrls);

  useEffect(() => {
    canWriteRef.current = canWrite;
  }, [canWrite]);

  useEffect(() => {
    audioUrlsRef.current = audioUrls;
  }, [audioUrls]);

  useEffect(() => {
    if (!questions || !canWrite) return;
    const deadline = nextDeadline(session);
    if (deadline === null) return;
    const expected: ExpectedPhase = { status: session.status, currentIndex: session.currentIndex };
    const delayMs = Math.max(0, deadline - (Date.now() + serverOffsetMs));

    const timeoutId = setTimeout(() => {
      const nowServer = Date.now() + serverOffsetMs;
      void advance(code, questions, expected, nowServer, lock, canWriteRef, audioUrlsRef);
    }, delayMs);
    return () => clearTimeout(timeoutId);
  }, [code, session, questions, serverOffsetMs, canWrite, foregroundCount]);

  useBluffChecks(code, session, questions, serverOffsetMs, canWrite);
  useDrawJudging(code, session, questions, serverOffsetMs, canWrite);

  // Passer : la transition suivante tout de suite, par le même chemin que le minuteur (même verrou,
  // même état attendu) : un double appui, ou un appui en même temps que le minuteur, est ignoré.
  // decisions : pendant la validation (Contrôle), les coches de l'hôte (« Valider les réponses »).
  function skip(decisions: ValidationDecisions = {}) {
    if (!questions || !canWriteRef.current) return;
    const expected: ExpectedPhase = { status: session.status, currentIndex: session.currentIndex };
    void advance(code, questions, expected, Date.now() + serverOffsetMs, lock, canWriteRef, audioUrlsRef, decisions);
  }

  // Même verrou que les transitions : un appui pendant la fin du minuteur n'écrit qu'une fois.
  function cancelDrawRound() {
    if (!questions || !canWriteRef.current) return;
    const key = transitionKey({ status: session.status, currentIndex: session.currentIndex });
    if (isTransitionLocked(lock.current, key, Date.now())) return;
    const current: TransitionLock = { key, since: Date.now() };
    lock.current = current;
    applyHostAction(code, (current, nowServer) => drawCancelUpdate(current, questions, nowServer), Date.now() + serverOffsetMs)
      .catch((error: unknown) => console.error('[engine] Annulation de la manche impossible', error))
      .finally(() => {
        if (lock.current === current) lock.current = null;
      });
  }

  return { skip, cancelDrawRound };
}

// Bluff (spec 16) : pendant l'écriture, l'hôte juge chaque nouvelle proposition (vraie réponse, mot
// interdit, vide) et écrit son verdict dans bluffChecks (et bluffedBy si elle est acceptée).
function useBluffChecks(
  code: string,
  session: Session,
  questions: readonly GameQuestion[] | null,
  serverOffsetMs: number,
  canWrite: boolean,
): void {
  const question = questions?.[session.currentIndex];
  const build = question && isBluffQuestion(question) ? (current: Session) => bluffChecksUpdate(current, question) : null;
  useHostVerdicts(code, session, build, serverOffsetMs, canWrite, 'Vérification des propositions');
}

// Dessine-moi (spec 19) : l'hôte juge chaque nouvel essai (verdict pour le joueur, « a trouvé » pour
// tous) et applique la demande de changement de mot du dessinateur.
function useDrawJudging(
  code: string,
  session: Session,
  questions: readonly GameQuestion[] | null,
  serverOffsetMs: number,
  canWrite: boolean,
): void {
  const drawQuestions = questions?.filter(isDrawQuestion);
  const build =
    drawQuestions && drawQuestions.length > 0 && session.status === 'question'
      ? (current: Session) => mergeUpdates(drawHintsUpdate(current), drawWordChangeUpdate(current, drawQuestions))
      : null;
  useHostVerdicts(code, session, build, serverOffsetMs, canWrite, 'Jugement des essais');
}

function mergeUpdates(first: SessionUpdate | null, second: SessionUpdate | null): SessionUpdate | null {
  if (!first) return second;
  return second ? { ...first, ...second } : first;
}

// Écrit le résultat de build dès qu'il n'est pas vide. Une seule écriture à la fois ; la session est
// relue avant d'écrire. Un échec sera réessayé à la valeur suivante.
function useHostVerdicts(
  code: string,
  session: Session,
  build: ((current: Session) => SessionUpdate | null) | null,
  serverOffsetMs: number,
  canWrite: boolean,
  label: string,
): void {
  const isWriting = useRef(false);
  // Relance après chaque écriture : un essai arrivé pendant l'écriture est jugé aussitôt.
  const [writeCount, setWriteCount] = useState(0);

  // build change à chaque rendu : l'effet repasse, mais n'écrit que s'il y a du nouveau.
  useEffect(() => {
    if (!canWrite || isWriting.current || !build) return;
    if (build(session) === null) return;
    isWriting.current = true;
    applyHostAction(code, build, Date.now() + serverOffsetMs)
      .catch((error: unknown) => console.error(`[engine] ${label} impossible`, error))
      .finally(() => {
        isWriting.current = false;
        setWriteCount((count) => count + 1);
      });
  }, [code, session, build, serverOffsetMs, canWrite, writeCount, label]);
}

// Exécute une transition, sauf si la même est déjà en cours d'écriture depuis moins de
// TRANSITION_LOCK_MAX_MS (une écriture hors ligne peut rester en attente : le verrou finit
// par être relâché pour ne jamais bloquer la partie).
async function advance(
  code: string,
  questions: readonly GameQuestion[],
  expected: ExpectedPhase,
  nowServer: number,
  lock: { current: TransitionLock | null },
  canWrite: { current: boolean },
  audioUrls: { current: AudioUrls },
  decisions: ValidationDecisions = {},
): Promise<void> {
  const key = transitionKey(expected);
  if (isTransitionLocked(lock.current, key, Date.now())) return;
  if (lock.current?.key === key) {
    console.warn(`[engine] Verrou relâché après une écriture en attente : ${key}`);
  }
  const current: TransitionLock = { key, since: Date.now() };
  lock.current = current;
  try {
    await runTransition(code, questions, expected, nowServer, () => canWrite.current, audioUrls.current, decisions);
  } catch (error) {
    // Erreur d'écriture : on réessaiera à la prochaine valeur de la session ou au premier plan.
    console.error('[engine] Transition impossible', error);
  } finally {
    if (lock.current === current) lock.current = null;
  }
}
