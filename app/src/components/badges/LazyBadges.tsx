import type { BadgeId } from '@shared/badges';
import { SUSPENSE_DRUMROLL_MS } from '@shared/sound';
import type { PublicSession } from '@shared/types';
import { Text } from 'react-native';

import { badgeUi } from '@/lib/badgeUi';

import type { EmblemName } from './badgeSvgSources';

// Relais sans module natif, importables par les écrans chargés au démarrage (accueil, parties, À propos) :
// l'interface des badges n'est chargée qu'au premier affichage (lib/badgeUi.ts).

// Apparition après l'arrivée sur l'écran de fin (podium et confettis d'abord) ; Suspense : après le roulement de tambour.
const END_SCREEN_FIRST_MS = 1_500;

export function badgeToastDelayMs(session: Pick<PublicSession, 'settings'>): number {
  return END_SCREEN_FIRST_MS + (session.settings.suspense ? SUSPENSE_DRUMROLL_MS : 0);
}

interface BadgeNoticeProps {
  badges: readonly BadgeId[];
  delayMs: number;
  onDismiss: () => void;
}

// Notification ou fenêtre de célébration (rien tant qu'il n'y a pas de badge à montrer).
export function BadgeNotice(props: BadgeNoticeProps) {
  if (props.badges.length === 0) return null;
  const ui = badgeUi();
  return ui ? <ui.BadgeUnlockedToast {...props} /> : null;
}

// Emblème du pack ; interface indisponible : un trophée en emoji à la place.
export function BadgeEmblem({ name, size }: { name: EmblemName; size: number }) {
  const ui = badgeUi();
  return ui ? <ui.EmblemArt name={name} size={size} /> : <Text style={{ fontSize: size * 0.8 }}>🏆</Text>;
}
