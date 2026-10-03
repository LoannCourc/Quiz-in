import { onDisconnect, ref, remove, serverTimestamp } from 'firebase/database';

import { db } from './firebase';

// Absence de l'hôte (spec 6.6). Le serveur Firebase exécute lui-même l'écriture préparée par
// onDisconnect quand la connexion de l'hôte tombe (app fermée, réseau perdu) : hostLeftAt reçoit
// alors l'heure du serveur. Une écriture onDisconnect ne sert qu'une fois : à réarmer à chaque
// reconnexion.
export function armHostAbsenceMarker(code: string): Promise<void> {
  return onDisconnect(ref(db, `sessions/${code}`)).update({ hostLeftAt: serverTimestamp() });
}

// Quitter : annulée AVANT la suppression, sinon la déconnexion suivante recréerait un
// hostLeftAt orphelin sous une session supprimée.
export function cancelHostAbsenceMarker(code: string): Promise<void> {
  return onDisconnect(ref(db, `sessions/${code}`)).cancel();
}

// Nettoyage par un joueur ou la TV, une fois le délai dépassé (les règles le refusent avant).
export function deleteAbandonedGame(code: string): Promise<void> {
  return remove(ref(db, `sessions/${code}`));
}
