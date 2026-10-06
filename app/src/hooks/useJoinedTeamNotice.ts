import type { TeamId } from '@shared/types';
import { useEffect, useRef, useState } from 'react';

// Durée du message « Tu as rejoint l'équipe X ».
const NOTICE_MS = 6_000;

// Groupe : équipe à annoncer quand le joueur vient d'en recevoir une (tirage, ou placement automatique d'un
// retardataire par l'hôte), pendant quelques secondes ; null sinon. Rien à l'ouverture de la page si
// l'équipe était déjà là.
export function useJoinedTeamNotice(team: TeamId | undefined): TeamId | null {
  const previous = useRef(team);
  const [notice, setNotice] = useState<TeamId | null>(null);

  useEffect(() => {
    const before = previous.current;
    previous.current = team;
    if (before !== undefined || team === undefined) return;
    setNotice(team);
    const timer = setTimeout(() => setNotice(null), NOTICE_MS);
    return () => clearTimeout(timer);
  }, [team]);

  return notice;
}
