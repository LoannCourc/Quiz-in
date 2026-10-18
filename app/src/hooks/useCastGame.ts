import { CAST_NAMESPACE, type CastShowGameMessage } from '@shared/cast';
import { pauseUpdate } from '@shared/hostEngine';
import type { Session } from '@shared/types';
import { useEffect, useRef, useState } from 'react';
import GoogleCast, { CastState, useCastChannel, useCastState } from 'react-native-google-cast';

import {
  loadLocalNetworkAsked,
  needsExplicitDiscovery,
  saveLocalNetworkAsked,
  startCastDiscovery,
  stopCastDiscovery,
} from '@/lib/castDiscovery';
import { applyHostAction } from '@/lib/hostGame';

// Recherche des TV sans résultat depuis ce délai : le salon propose l'aide « Je ne trouve pas ma TV ».
const NO_TV_FOUND_DELAY_MS = 8000;

export interface CastGame {
  // Faux sur le web (site des joueurs) : pas de Cast, l'interface TV est masquée.
  isAvailable: boolean;
  isTvConnected: boolean;
  // La session Cast s'est terminée pendant la partie, qui a été mise en pause.
  castInterrupted: boolean;
  // La recherche des TV ne trouve rien depuis quelques secondes.
  noTvFound: boolean;
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
  const isSearchEmpty = useCastState() === CastState.NO_DEVICES_AVAILABLE;
  const [hasWaitedForTv, setHasWaitedForTv] = useState(false);
  // iOS : la recherche des TV tourne dans le salon tant qu'aucune TV n'est connectée, une fois la demande
  // d'accès au réseau local faite (jamais avant : elle s'afficherait sans explication).
  const [isLocalNetworkAsked, setIsLocalNetworkAsked] = useState(false);
  const isTvConnected = channel !== null;
  const isDiscovering = needsExplicitDiscovery && isLocalNetworkAsked && session.status === 'lobby' && !isTvConnected;

  // Le message disparaît dès que la partie quitte la pause (reprise, fin).
  if (session.status !== previousStatus) {
    setPreviousStatus(session.status);
    if (session.status !== 'paused') setCastInterrupted(false);
  }

  useEffect(() => {
    latest.current = { canWrite, serverOffsetMs };
  }, [canWrite, serverOffsetMs]);

  useEffect(() => {
    if (!isSearchEmpty) return;
    const timer = setTimeout(() => setHasWaitedForTv(true), NO_TV_FOUND_DELAY_MS);
    return () => {
      clearTimeout(timer);
      setHasWaitedForTv(false);
    };
  }, [isSearchEmpty]);

  useEffect(() => {
    if (!needsExplicitDiscovery) return;
    let isActive = true;
    loadLocalNetworkAsked().then((asked) => {
      if (isActive && asked) setIsLocalNetworkAsked(true);
    });
    return () => {
      isActive = false;
    };
  }, []);

  // Arrêtée en quittant le salon (partie lancée, retour à l'accueil) ou dès qu'une TV est connectée.
  useEffect(() => {
    if (!isDiscovering) return;
    void startCastDiscovery();
    return () => stopCastDiscovery();
  }, [isDiscovering]);

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

  // iOS : la liste n'est remplie que si la recherche tourne ; la lancer ici déclenche, la première fois,
  // la demande d'accès au réseau local. La liste se met à jour au fil des TV trouvées.
  function showTvPicker() {
    if (needsExplicitDiscovery) {
      setIsLocalNetworkAsked(true);
      void saveLocalNetworkAsked();
    }
    startCastDiscovery()
      .then(() => GoogleCast.showCastDialog())
      .then((shown) => {
        if (!shown) console.warn('[cast] Liste des TV non affichée : aucun bouton Cast à l’écran');
      })
      .catch((error: unknown) => console.warn('[cast] Liste des TV impossible à afficher', error));
  }

  return { isAvailable: true, isTvConnected, castInterrupted, noTvFound: isSearchEmpty && hasWaitedForTv, showTvPicker };
}
