import { CAST_NAMESPACE, type CastShowGameMessage } from '@shared/cast';
import { startCastSearch, type CastSearch, type CastSearchDeps } from '@shared/castSearch';
import { pauseUpdate } from '@shared/hostEngine';
import type { Session } from '@shared/types';
import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { AppState } from 'react-native';
import GoogleCast, { useCastChannel } from 'react-native-google-cast';

import {
  castDeviceCount,
  loadLocalNetworkAsked,
  logCastDiscovery,
  needsExplicitDiscovery,
  onCastDevicesSeen,
  restartCastDiscovery,
  saveLocalNetworkAsked,
  startCastDiscovery,
  stopCastDiscovery,
} from '@/lib/castDiscovery';
import { applyHostAction } from '@/lib/hostGame';

// iOS : minuteries de l'attente des TV (shared/castSearch.ts), lignes [cast] dans la console.
const CAST_SEARCH_DEPS: CastSearchDeps = {
  now: () => Date.now(),
  setTimer: (callback, delayMs) => setTimeout(callback, delayMs),
  clearTimer: (timer) => clearTimeout(timer as ReturnType<typeof setTimeout>),
  isForeground: () => AppState.currentState === 'active',
  deviceCount: castDeviceCount,
  restart: (reason) => void restartCastDiscovery(reason),
  log: (message) => console.log(`[cast] ${message}`),
};

// Attente en cours : son minuteur et l'abonnement à la liste des TV du SDK.
interface PendingTvSearch {
  search: CastSearch | null;
  unsubscribe: () => void;
}

export interface CastGame {
  // Faux sur le web (site des joueurs) : pas de Cast, l'interface TV est masquée.
  isAvailable: boolean;
  isTvConnected: boolean;
  // La session Cast s'est terminée pendant la partie, qui a été mise en pause.
  castInterrupted: boolean;
  // Liste des TV (dialogue Cast natif) ; exige un TvCastButton affiché à l'écran.
  showTvPicker: () => void;
  // iOS, jamais encore demandé sur ce téléphone : expliquer l'accès au réseau local avant la liste.
  needsLocalNetworkExplanation: boolean;
  // iOS : recherche des TV avant d'ouvrir la liste (la pilule affiche « Recherche des TV… »).
  isSearchingTv: boolean;
  // iOS : aucune TV vue à la fin de l'attente, feuille « Aucune TV trouvée ».
  isNoTvSheetOpen: boolean;
  closeNoTvSheet: () => void;
  // « Ouvrir les réglages » : la recherche reprend, puis la liste s'ouvre, au retour dans l'app.
  retryOnReturn: () => void;
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
  // iOS : la recherche des TV tourne dans le salon tant qu'aucune TV n'est connectée, une fois la demande
  // d'accès au réseau local faite (jamais avant : elle s'afficherait sans explication).
  // null tant que la mémoire du téléphone n'est pas lue.
  const [isLocalNetworkAsked, setIsLocalNetworkAsked] = useState<boolean | null>(needsExplicitDiscovery ? null : true);
  const isTvConnected = channel !== null;
  const isDiscovering = needsExplicitDiscovery && isLocalNetworkAsked === true && session.status === 'lobby' && !isTvConnected;
  const [isSearchingTv, setIsSearchingTv] = useState(false);
  const [isNoTvSheetOpen, setIsNoTvSheetOpen] = useState(false);
  const pendingSearch = useRef<PendingTvSearch | null>(null);
  const isRetryOnReturn = useRef(false);

  // Le message disparaît dès que la partie quitte la pause (reprise, fin).
  if (session.status !== previousStatus) {
    setPreviousStatus(session.status);
    if (session.status !== 'paused') setCastInterrupted(false);
  }

  useEffect(() => {
    latest.current = { canWrite, serverOffsetMs };
  }, [canWrite, serverOffsetMs]);

  useEffect(() => {
    if (!needsExplicitDiscovery) return;
    let isActive = true;
    loadLocalNetworkAsked().then((asked) => {
      if (isActive) setIsLocalNetworkAsked((current) => current === true || asked);
    });
    return () => {
      isActive = false;
    };
  }, []);

  // Arrêtée en quittant le salon (partie lancée, retour à l'accueil) ou dès qu'une TV est connectée ; l'attente
  // des TV s'arrête avec elle.
  const cancelSearchOnStop = useEffectEvent(() => cancelTvSearch());
  useEffect(() => {
    if (!isDiscovering) return;
    console.log('[cast] Recherche démarrée (salon)');
    void startCastDiscovery().then(() => logCastDiscovery('après le démarrage'));
    return () => {
      cancelSearchOnStop();
      stopCastDiscovery();
    };
  }, [isDiscovering]);

  // iOS : relance à chaque retour au premier plan (fenêtre d'accès au réseau local fermée, retour des
  // Réglages ou d'une autre app), tant que la recherche doit tourner.
  const onForeground = useEffectEvent(() => {
    if (isRetryOnReturn.current) {
      isRetryOnReturn.current = false;
      searchThenShowTvPicker('retour des réglages');
      return;
    }
    if (!isDiscovering && !pendingSearch.current) return;
    void restartCastDiscovery('retour au premier plan');
    pendingSearch.current?.search?.foreground();
  });
  useEffect(() => {
    if (!needsExplicitDiscovery) return;
    let previous = AppState.currentState;
    const subscription = AppState.addEventListener('change', (next) => {
      console.log(`[cast] App : ${previous} → ${next}`);
      const isBack = previous !== 'active' && next === 'active';
      previous = next;
      if (isBack) onForeground();
    });
    return () => subscription.remove();
  }, []);

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

  function cancelTvSearch() {
    const pending = pendingSearch.current;
    if (!pending) return;
    pendingSearch.current = null;
    pending.search?.cancel();
    pending.unsubscribe();
    setIsSearchingTv(false);
  }

  // iOS : la liste n'est ouverte qu'une fois une TV vue (shared/castSearch.ts). TV déjà vue : tout de suite,
  // sans relance. Premier appui : l'effet ci-dessus démarre la recherche, ce qui affiche la demande d'accès
  // au réseau local ; ensuite, relance à chaque appui.
  function searchThenShowTvPicker(reason: string) {
    if (pendingSearch.current) {
      console.log('[cast] Recherche des TV déjà en cours : appui ignoré');
      return;
    }
    const isFirst = isLocalNetworkAsked !== true;
    const pending: PendingTvSearch = { search: null, unsubscribe: () => {} };
    pendingSearch.current = pending;
    void castDeviceCount().then((count) => {
      if (pendingSearch.current !== pending) return;
      if (count > 0) {
        console.log(`[cast] ${count} TV déjà vue(s) : liste ouverte sans relance`);
        pendingSearch.current = null;
        openCastDialog();
        return;
      }
      if (isFirst) console.log('[cast] Premier appui : la recherche démarre (demande d’accès au réseau local)');
      else void restartCastDiscovery(reason);
      setIsSearchingTv(true);
      pending.search = startCastSearch(CAST_SEARCH_DEPS, (found) => {
        cancelTvSearch();
        if (found) openCastDialog();
        else setIsNoTvSheetOpen(true);
      });
      pending.unsubscribe = onCastDevicesSeen((seen) => {
        console.log(`[cast] TV vues : ${seen}`);
        pending.search?.devicesSeen(seen);
      });
    });
  }

  // Liste des TV : remplie seulement si la recherche tourne (iOS). Android : ouverte directement, comme avant.
  function showTvPicker() {
    if (!needsExplicitDiscovery) {
      startCastDiscovery()
        .then(openCastDialog)
        .catch((error: unknown) => console.warn('[cast] Liste des TV impossible à afficher', error));
      return;
    }
    setIsLocalNetworkAsked(true);
    void saveLocalNetworkAsked();
    searchThenShowTvPicker('appui');
  }

  return { isAvailable: true, isTvConnected, castInterrupted,
    showTvPicker,
    needsLocalNetworkExplanation: isLocalNetworkAsked === false,
    isSearchingTv,
    isNoTvSheetOpen,
    closeNoTvSheet: () => setIsNoTvSheetOpen(false),
    retryOnReturn: () => {
      isRetryOnReturn.current = true;
    },
  };
}

function openCastDialog() {
  GoogleCast.showCastDialog()
    .then((shown) => {
      if (!shown) console.warn('[cast] Liste des TV non affichée : aucun bouton Cast à l’écran');
    })
    .catch((error: unknown) => console.warn('[cast] Liste des TV impossible à afficher', error));
}
