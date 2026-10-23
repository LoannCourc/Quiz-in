import { localDayOf, type BadgeId, type BadgeRole } from '@shared/badges';
import { finishedGameOf, trackSession, type TrackedGame } from '@shared/badgeTracking';
import type { PlayerId, PublicSession } from '@shared/types';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

import { answerClock } from '@/lib/answerClock';
import { loadTrackedGame, recordFinishedGame, saveTrackedGame } from '@/lib/badgeStore';
import { readOpenGames } from '@/lib/openGames';

// Badges (spec 20) : suit la partie affichée sur ce téléphone et compte la partie terminée, une seule fois.
// Un seul appel par écran de partie : écran du joueur dans l'appli (rôle « player »), écran de l'hôte (« player »
// s'il joue, « organizer » sinon). Jamais sur le site des joueurs. Renvoie les badges débloqués à la fin.
export function useBadgeTracking(code: string, uid: PlayerId, role: BadgeRole, session: PublicSession) {
  const isEnabled = Platform.OS !== 'web';
  const tracked = useRef<TrackedGame | null>(null);
  const countedKey = useRef<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [unlocked, setUnlocked] = useState<BadgeId[]>([]);

  // Partie suivie relue (app relancée en pleine partie) avant de suivre la session.
  useEffect(() => {
    if (!isEnabled) return;
    let isActive = true;
    void loadTrackedGame().then((stored) => {
      if (!isActive) return;
      tracked.current = stored;
      setIsLoaded(true);
    });
    return () => {
      isActive = false;
    };
  }, [isEnabled]);

  useEffect(() => {
    if (!isEnabled || !isLoaded) return;
    const context = { code, uid, role, answerMs: (index: number) => answerClock.answerMs(code, index) };
    const next = trackSession(tracked.current, session, context);
    if (next !== tracked.current) {
      tracked.current = next;
      void saveTrackedGame(next);
    }
    if (session.status !== 'ended') return;
    const finished = finishedGameOf(next, session, { code, uid, localDay: localDayOf(new Date()) });
    if (!finished || countedKey.current === finished.gameKey) return;
    // Comptée une fois par écran ; le stockage refuse de toute façon une partie déjà comptée (gameKey).
    countedKey.current = finished.gameKey;
    tracked.current = null;
    void readOpenGames()
      .then((openGames) => recordFinishedGame(finished, openGames))
      .then((ids) => {
        if (ids.length > 0) setUnlocked((current) => [...current, ...ids]);
      });
  }, [isEnabled, isLoaded, code, uid, role, session]);

  return { unlocked, dismiss: () => setUnlocked([]) };
}
