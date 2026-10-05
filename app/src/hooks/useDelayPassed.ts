import { useEffect, useState } from 'react';

// Vrai une fois passé delayMs après startedAt (heure du serveur) : un seul minuteur. Lu aussi à
// l'affichage, pour qu'un écran ouvert après le délai (rechargement) ne l'attende pas une seconde fois.
export function useDelayPassed(startedAt: number, delayMs: number, serverOffsetMs: number): boolean {
  const [passedFor, setPassedFor] = useState<number | null>(() =>
    Date.now() + serverOffsetMs >= startedAt + delayMs ? startedAt : null,
  );
  useEffect(() => {
    const remainingMs = startedAt + delayMs - (Date.now() + serverOffsetMs);
    const timer = setTimeout(() => setPassedFor(startedAt), Math.max(0, remainingMs));
    return () => clearTimeout(timer);
  }, [startedAt, delayMs, serverOffsetMs]);
  return delayMs <= 0 || passedFor === startedAt;
}
