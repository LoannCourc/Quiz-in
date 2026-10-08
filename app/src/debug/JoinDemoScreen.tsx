import { DEFAULT_SESSION_SETTINGS } from '@shared/constants';
import type { Player, PlayerId } from '@shared/types';
import { useLocalSearchParams } from 'expo-router';

import { JoinForm } from '@/components/player/JoinForm';
import { JoinGameCard } from '@/components/player/JoinGameCard';
import { JoinTopBar } from '@/components/player/JoinTopBar';
import { PlayerNotice } from '@/components/player/PlayerNotice';
import { Screen } from '@/components/ui/Screen';
import { strings } from '@/constants/strings';

const DEMO_CODE = 'K7LQ';
const HOST_UID: PlayerId = 'loann';

function player(name: string, avatar: string): Player {
  return { name, avatar, score: 0, rank: 1, connected: true };
}

const PLAYERS: Record<PlayerId, Player> = {
  [HOST_UID]: player('Loann', '🦊'),
  lea: player('Léa', '🐼'),
  tom: player('Tom', '🐙'),
};

// Démo (développement) de l'écran J3 sans Firebase : /debug/join (Dessine-moi, l'hôte joue),
// ?host=0 (l'hôte ne joue pas : pas de « Hôte : … »), ?refusal=started (partie déjà commencée).
export default function JoinDemoScreen() {
  const { host, refusal } = useLocalSearchParams<{ host?: string; refusal?: string }>();
  const players = host === '0' ? Object.fromEntries(Object.entries(PLAYERS).filter(([id]) => id !== HOST_UID)) : PLAYERS;
  const session = { quizId: 'dessine-moi', hostUid: HOST_UID, players, settings: { ...DEFAULT_SESSION_SETTINGS, answerMode: 'draw' as const } };
  return (
    <Screen>
      <JoinTopBar />
      <JoinGameCard code={DEMO_CODE} session={session} />
      {refusal === 'started' ? (
        <PlayerNotice message={strings.join.refusals.alreadyStarted} tone="error" showOtherCode />
      ) : (
        <JoinForm code={DEMO_CODE} uid="me" status="lobby" players={players} />
      )}
    </Screen>
  );
}
