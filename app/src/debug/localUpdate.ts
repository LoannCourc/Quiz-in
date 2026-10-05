import type { SessionUpdate } from '@shared/hostEngine';
import type { Session } from '@shared/types';

// Démos : applique un update multi-chemins à une session gardée en mémoire, comme le ferait Firebase
// (null efface le chemin). Jamais utilisé hors des écrans de démonstration.
export function applyLocalUpdate(session: Session, update: SessionUpdate | null): Session {
  if (!update) return session;
  const next = structuredClone(session) as unknown as Record<string, unknown>;
  for (const [path, value] of Object.entries(update)) {
    const keys = path.split('/');
    let node = next;
    for (const key of keys.slice(0, -1)) {
      if (typeof node[key] !== 'object' || node[key] === null) node[key] = {};
      node = node[key] as Record<string, unknown>;
    }
    const last = keys[keys.length - 1];
    if (value === null) delete node[last];
    else node[last] = structuredClone(value);
  }
  return next as unknown as Session;
}
