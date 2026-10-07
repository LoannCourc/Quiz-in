import type { DrawSecret, PlayerId, PublicSession } from '@shared/types';
import { onValue, ref } from 'firebase/database';
import { useEffect, useState } from 'react';

import { db } from '@/lib/firebase';
import { writeDrawingChunk, type PlayerDraw } from '@/lib/playerDraw';

// Dessine-moi : le mot du dessinateur (drawSecret, lisible par lui seul et l'hôte) et l'envoi de son
// dessin. null hors d'une partie de Dessine-moi.
export function useDraw(code: string, uid: PlayerId, session: PublicSession): PlayerDraw | null {
  const isDraw = session.settings.answerMode === 'draw';
  const isDrawer = isDraw && session.status === 'question' && session.drawTurn?.drawer === uid;
  const round = session.drawTurn?.round ?? -1;
  const [secret, setSecret] = useState<{ round: number; word: string } | null>(null);

  useEffect(() => {
    if (!isDrawer) return;
    return onValue(ref(db, `sessions/${code}/drawSecret`), (snapshot) => {
      const value = snapshot.val() as DrawSecret | null;
      if (value) setSecret({ round, word: value.word });
    });
  }, [isDrawer, code, round]);

  if (!isDraw) return null;
  return {
    word: isDrawer && secret?.round === round ? secret.word : null,
    onChunk: ({ seq, data }) => writeDrawingChunk(code, seq, data),
  };
}
