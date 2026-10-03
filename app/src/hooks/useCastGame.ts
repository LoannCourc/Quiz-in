import { CAST_NAMESPACE, type CastShowGameMessage } from '@shared/cast';
import { pauseUpdate } from '@shared/hostEngine';
import type { Session } from '@shared/types';
import { useEffect, useRef, useState } from 'react';
import GoogleCast, { useCastChannel } from 'react-native-google-cast';

import { applyHostAction } from '@/lib/hostGame';

export interface CastGame {
  // Faux sur le web (site des joueurs) : pas de Cast, l'interface TV est masquée.
  isAvailable: boolean;
  isTvConnected: boolean;
  // La session Cast s'est terminée pendant la partie, qui a été mise en pause.
  castInterrupted: boolean;
  // Liste des TV (dialogue Cast natif) ; exige un TvCastButton affiché à l'écran.
  showTvPicker: () => void;
}

// Cast de l'hôte (spec 4.1 et 6.6), un seul appel par écran de partie :
// - à chaque session ouverte ou reprise (nouveau canal), la TV reçoit le code de la partie ;
// - fin de session pendant que la partie avance : pause (même fonction que le bouton Pause),
//   sauf hors ligne, où l'absence de l'hôte (D5) s'en charge au retour du réseau.
export function useCastGame(code: string, session: Session, canWrite: boolean, serverOffsetMs: number): CastGame {
  const channel = useCastChannel(CAST_NAMESPACE);
  const [castInterrupted, setCastInterrupted] = useState(false);
  const [previousStatus, setPreviousStatus] = useState(session.status);
  const latest = useRef({ canWrite, serverOffsetMs });

  // Le message disparaît dès que la partie quitte la pause (reprise, fin).
  if (session.status !== previousStatus) {
    setPreviousStatus(session.status);
    if (session.status !== 'paused') setCastInterrupted(false);
  }

  useEffect(() => {
    latest.current = { canWrite, serverOffsetMs };
  }, [canWrite, serverOffsetMs]);

  useEffect(() => {
    if (!channel) return;
    const message: CastShowGameMessage = { code };
    channel.sendMessage(message).catch((error: unknown) => console.warn('[cast] Code non envoyé à la TV', error));
  }, [channel, code]);

  useEffect(() => {
    const subscription = GoogleCast.getSessionManager().onSessionEnded(() => {
      if (!latest.current.canWrite) return;
      // pauseUpdate relit la session : rien en lobby, en fin de partie ou déjà en pause.
      applyHostAction(code, pauseUpdate, Date.now() + latest.current.serverOffsetMs)
        .then((applied) => {
          if (applied) setCastInterrupted(true);
        })
        .catch((error: unknown) => console.error('[cast] Pause après la fin du Cast impossible', error));
    });
    return () => subscription.remove();
  }, [code]);

  function showTvPicker() {
    GoogleCast.showCastDialog()
      .then((shown) => {
        if (!shown) console.warn('[cast] Liste des TV non affichée : aucun bouton Cast à l’écran');
      })
      .catch((error: unknown) => console.warn('[cast] Liste des TV impossible à afficher', error));
  }

  return { isAvailable: true, isTvConnected: channel !== null, castInterrupted, showTvPicker };
}
