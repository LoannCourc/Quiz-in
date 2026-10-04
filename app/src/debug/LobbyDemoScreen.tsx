import { AVATARS } from '@shared/avatars';
import { DEFAULT_SESSION_SETTINGS } from '@shared/constants';
import type { Player, PlayerId, Session } from '@shared/types';
import { useLocalSearchParams } from 'expo-router';

import { HostLobby } from '@/components/host/lobby/HostLobby';
import { LobbyQuizTitle } from '@/components/host/lobby/LobbyHeader';
import type { CastGame } from '@/hooks/useCastGame';

import { DEMO_CATALOG } from './demoCatalog';
import { DEMO_CODE } from './playerScenarios';

// Démo du salon de l'hôte (développement uniquement), sans Firebase :
// /debug/lobby?players=<0 à 20>&tv=<none|connected|unavailable>&host=<1|0>&notv=<0|1>
// host=0 : l'hôte n'a pas encore choisi son pseudo (formulaire au-dessus de la liste).
// Les actions (lancer, s'inscrire) écrivent dans la base : elles échouent ici, c'est attendu.

const HOST_UID: PlayerId = 'host';
const NAMES = ['Loann', 'Maman', 'Papa', 'Camille', 'Léa', 'Tom', 'Noé', 'Inès', 'Hugo', 'Jade'];

function player(index: number): Player {
  return { name: NAMES[index % NAMES.length] + (index >= NAMES.length ? ` ${index}` : ''), avatar: AVATARS[index % AVATARS.length], score: 0, rank: 0, connected: true };
}

function demoSession(playerCount: number, hostRegistered: boolean): Session {
  const players: Record<PlayerId, Player> = {};
  for (let index = 0; index < playerCount; index += 1) {
    if (index === 0 && !hostRegistered) continue;
    players[index === 0 ? HOST_UID : `p${index}`] = player(index);
  }
  return {
    hostUid: HOST_UID,
    quizId: DEMO_CATALOG[0].id,
    status: 'lobby',
    settings: DEFAULT_SESSION_SETTINGS,
    currentIndex: 0,
    phaseStartedAt: 0,
    phaseEndsAt: 0,
    players,
  };
}

function demoCast(tv: string | undefined): CastGame {
  return {
    isAvailable: tv !== 'unavailable',
    isTvConnected: tv === 'connected',
    castInterrupted: false,
    showTvPicker: () => undefined,
  };
}

export default function LobbyDemoScreen() {
  const params = useLocalSearchParams<{ players?: string; tv?: string; host?: string; notv?: string }>();
  const playerCount = Math.min(20, Math.max(0, Number(params.players ?? 4) || 0));
  return (
    <HostLobby
      code={DEMO_CODE}
      session={demoSession(playerCount, params.host !== '0')}
      questions={{ kind: 'ready', questions: [] }}
      serverOffsetMs={0}
      cast={demoCast(params.tv)}
      header={<LobbyQuizTitle quiz={DEMO_CATALOG[0]} />}
      initialNoTvOpen={params.notv === '1'}
    />
  );
}
