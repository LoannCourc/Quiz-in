import { connectionLostPauseUpdate, hostReturnUpdate } from '@shared/hostAbsence';
import { pauseUpdate } from '@shared/hostEngine';
import type { Session } from '@shared/types';
import { onValue, ref } from 'firebase/database';
import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { db } from '@/lib/firebase';
import { armHostAbsenceMarker } from '@/lib/hostAbsence';
import { applyHostAction } from '@/lib/hostGame';

export interface HostConnection {
  // Le moteur et les contrôles peuvent écrire : connecté, et aucun retour de coupure en attente.
  canWrite: boolean;
  // Connexion perdue (ou reconnexion pas encore traitée) : « Connexion perdue… ».
  isOffline: boolean;
  // L'hôte vient de revenir d'une coupure et la partie est en pause (message sur l'écran de pause).
  returnedFromAbsence: boolean;
}

// Absence de l'hôte (spec 6.6), tant que l'écran de la partie est affiché :
// - .info/connected : à chaque connexion, l'écriture onDisconnect de hostLeftAt est réarmée ; à la
//   perte, on note l'heure (serveur) et plus rien n'est écrit, pour qu'aucune écriture mise en
//   file d'attente hors ligne ne parte en retard au retour du réseau ;
// - au retour, après relecture de la session sur le serveur : hostReturnUpdate si le serveur a
//   écrit hostLeftAt, sinon pause avec le temps qui restait à l'instant de la perte ;
// - mise en arrière-plan de l'app (bouton Accueil, écran éteint) : pause immédiate si connecté.
export function useHostAbsence(code: string, session: Session, serverOffsetMs: number): HostConnection {
  const [isConnected, setIsConnected] = useState(false);
  // Heure serveur estimée de la perte de connexion ; null si aucune coupure à traiter.
  const [lostAt, setLostAt] = useState<number | null>(null);
  const [returnedFromAbsence, setReturnedFromAbsence] = useState(false);
  const isConnectedRef = useRef(false);
  const offsetRef = useRef(serverOffsetMs);
  const isReturning = useRef(false);
  const hasLeftMarker = session.hostLeftAt !== undefined;
  const needsReturn = hasLeftMarker || lostAt !== null;

  useEffect(() => {
    offsetRef.current = serverOffsetMs;
  }, [serverOffsetMs]);

  useEffect(
    () =>
      onValue(ref(db, '.info/connected'), (snapshot) => {
        const connected = snapshot.val() === true;
        // Une perte n'est notée qu'après une vraie connexion (au démarrage, la valeur vaut d'abord faux).
        if (!connected && isConnectedRef.current) {
          setLostAt((current) => current ?? Date.now() + offsetRef.current);
        }
        isConnectedRef.current = connected;
        setIsConnected(connected);
        if (!connected) return;
        armHostAbsenceMarker(code).catch((error: unknown) =>
          console.warn('[absence] Écriture de départ (onDisconnect) non armée', error),
        );
      }),
    [code],
  );

  // Retour après une coupure : une seule fois tant que l'écriture précédente n'est pas confirmée.
  useEffect(() => {
    if (!isConnected || !needsReturn || isReturning.current) return;
    isReturning.current = true;
    const buildReturn = (current: Session) =>
      hostReturnUpdate(current) ?? (lostAt === null ? null : connectionLostPauseUpdate(current, lostAt));
    applyHostAction(code, buildReturn, Date.now() + serverOffsetMs)
      .then((applied) => {
        if (applied) setReturnedFromAbsence(true);
      })
      .catch((error: unknown) => console.error('[absence] Retour de l’hôte non enregistré', error))
      .finally(() => {
        isReturning.current = false;
        // Nouvelle coupure pendant l'écriture : la perte reste à traiter au prochain retour.
        if (isConnectedRef.current) setLostAt(null);
      });
  }, [code, isConnected, needsReturn, lostAt, serverOffsetMs]);

  // Arrière-plan : pause tout de suite (rien si hors ligne, si la partie n'est pas en cours ou déjà en pause).
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'background' || !isConnectedRef.current) return;
      applyHostAction(code, pauseUpdate, Date.now() + offsetRef.current).catch((error: unknown) =>
        console.warn('[absence] Pause à la mise en arrière-plan non enregistrée', error),
      );
    });
    return () => subscription.remove();
  }, [code]);

  return {
    canWrite: isConnected && !needsReturn,
    isOffline: lostAt !== null,
    returnedFromAbsence: returnedFromAbsence && session.status === 'paused',
  };
}
