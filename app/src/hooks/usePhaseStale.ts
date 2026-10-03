import { stalePhaseAt } from '@shared/hostAbsence';
import type { PublicSession } from '@shared/types';
import { useEffect, useState } from 'react';

// Joueur : vrai quand la phase en cours a dépassé son échéance de STALE_PHASE_MARGIN_MS sans que
// l'hôte la fasse avancer (coupure pas encore détectée par le serveur). Un seul minuteur, programmé
// pour l'instant exact ; la phase est identifiée par son état et son échéance.
export function usePhaseStale(session: Pick<PublicSession, 'status' | 'phaseEndsAt'>, serverOffsetMs: number): boolean {
  const staleAt = stalePhaseAt(session);
  const phaseKey = staleAt === null ? null : `${session.status}@${staleAt}`;
  const [stalePhaseKey, setStalePhaseKey] = useState<string | null>(null);

  useEffect(() => {
    if (staleAt === null || phaseKey === null) return;
    const delayMs = Math.max(0, staleAt - (Date.now() + serverOffsetMs));
    const timeoutId = setTimeout(() => setStalePhaseKey(phaseKey), delayMs);
    return () => clearTimeout(timeoutId);
  }, [staleAt, phaseKey, serverOffsetMs]);

  return phaseKey !== null && stalePhaseKey === phaseKey;
}
