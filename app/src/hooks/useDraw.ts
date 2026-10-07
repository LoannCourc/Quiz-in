import { DRAW_GUESS_MAX_LENGTH, DRAW_GUESS_MIN_INTERVAL_MS, DRAW_MAX_GUESSES } from '@shared/constants';
import type { DrawHint, DrawSecret, PlayerId, PublicSession } from '@shared/types';
import { onValue, ref } from 'firebase/database';
import { useEffect, useState } from 'react';

import { db } from '@/lib/firebase';
import { requestWordChange, writeDrawGuess, writeDrawingChunk, type PlayerDraw } from '@/lib/playerDraw';

// Marge sur l'écart minimal entre deux essais : l'heure du serveur fait foi, pas celle du téléphone.
const GUESS_INTERVAL_MARGIN_MS = 150;

// Essais envoyés depuis cet écran pendant une manche.
interface SentGuesses {
  round: number;
  sent: number;
  lastText: string | null;
  nextAllowedAt: number;
  hasFailed: boolean;
}

const NO_GUESS: Omit<SentGuesses, 'round'> = { sent: 0, lastText: null, nextAllowedAt: 0, hasFailed: false };

// Dessine-moi : le mot du dessinateur (drawSecret, lisible par lui seul et l'hôte), l'envoi de son
// dessin et sa demande de changement de mot ; pour les devineurs, leurs essais et le verdict de
// l'hôte (drawHint, lisible par le joueur seul). null hors d'une partie de Dessine-moi.
export function useDraw(code: string, uid: PlayerId, session: PublicSession): PlayerDraw | null {
  const isDraw = session.settings.answerMode === 'draw';
  const isRound = isDraw && session.status === 'question';
  const isDrawer = isRound && session.drawTurn?.drawer === uid;
  const round = session.drawTurn?.round ?? -1;
  const [secret, setSecret] = useState<{ round: number; word: string } | null>(null);
  const [hint, setHint] = useState<{ round: number; value: DrawHint | null } | null>(null);
  const [sentState, setSentState] = useState<SentGuesses | null>(null);
  const [changeRequestedRound, setChangeRequestedRound] = useState(-1);

  useEffect(() => {
    if (!isDrawer) return;
    return onValue(ref(db, `sessions/${code}/drawSecret`), (snapshot) => {
      const value = snapshot.val() as DrawSecret | null;
      if (value) setSecret({ round, word: value.word });
    });
  }, [isDrawer, code, round]);

  const isGuessing = isRound && !isDrawer;
  useEffect(() => {
    if (!isGuessing) return;
    return onValue(ref(db, `sessions/${code}/drawHint/${uid}`), (snapshot) => {
      setHint({ round, value: snapshot.val() as DrawHint | null });
    });
  }, [isGuessing, code, uid, round]);

  if (!isDraw) return null;

  const roundHint = hint?.round === round ? hint.value : null;
  const sent = sentState?.round === round ? sentState : { round, ...NO_GUESS };
  const judged = roundHint?.count ?? 0;
  const used = Math.max(sent.sent, judged);
  const isFound = roundHint?.verdict === 'found' || session.drawFound?.[uid] !== undefined;
  const hasDrawing = session.drawing !== undefined && Object.keys(session.drawing).length > 0;

  function onGuess(text: string) {
    const value = text.trim().slice(0, DRAW_GUESS_MAX_LENGTH);
    if (!isGuessing || isFound || value === '' || used >= DRAW_MAX_GUESSES || Date.now() < sent.nextAllowedAt) return;
    const count = used + 1;
    const nextAllowedAt = Date.now() + DRAW_GUESS_MIN_INTERVAL_MS + GUESS_INTERVAL_MARGIN_MS;
    setSentState({ round, sent: count, lastText: value, nextAllowedAt, hasFailed: false });
    writeDrawGuess(code, uid, value, count).catch((error: unknown) => {
      if (__DEV__) console.warn('[dessin] Essai refusé', error);
      // Le numéro reste libre : le prochain essai le reprend.
      setSentState((current) => (current?.round === round ? { ...current, sent: count - 1, hasFailed: true } : current));
    });
  }

  function onChangeWord() {
    setChangeRequestedRound(round);
    requestWordChange(code).catch((error: unknown) => {
      if (__DEV__) console.warn('[dessin] Changement de mot refusé', error);
    });
  }

  return {
    word: isDrawer && secret?.round === round ? secret.word : null,
    onChunk: ({ seq, data }) => writeDrawingChunk(code, seq, data),
    canChangeWord: isDrawer && !session.drawTurn?.changedWord && !hasDrawing && changeRequestedRound !== round,
    onChangeWord,
    guess: {
      hint: roundHint,
      used,
      lastText: sent.lastText,
      isPending: sent.sent > judged,
      nextAllowedAt: sent.nextAllowedAt,
      hasFailed: sent.hasFailed,
      isFound,
    },
    onGuess,
  };
}
