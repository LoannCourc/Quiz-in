import { AVATARS } from '@shared/avatars';
import { DEFAULT_SESSION_SETTINGS } from '@shared/constants';
import { TEAM_MODES, teamDrawUpdate } from '@shared/teams';
import type { Player, PlayerId, Session, TeamMode } from '@shared/types';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { HostLobby } from '@/components/host/lobby/HostLobby';
import { LobbyQuizTitle } from '@/components/host/lobby/LobbyHeader';
import type { CastGame } from '@/hooks/useCastGame';

import { DEMO_CATALOG } from './demoCatalog';
import { applyLocalUpdate } from './localUpdate';
import { DEMO_CODE } from './playerScenarios';

// Démo du salon de l'hôte (développement uniquement), sans Firebase :
// /debug/lobby?players=<0 à 20>&tv=<none|connected|unavailable>&host=<1|0>&notv=<0|1>
// host=0 : l'hôte n'a pas encore choisi son pseudo (formulaire au-dessus de la liste).
// &teams=random|host|players : Groupe (composition des équipes, actions appliquées sur place) ;
// &drawn=1 : équipes déjà tirées au sort ; &late=3 : 3 joueurs arrivés après le tirage (sans équipe) ; &page=teams : page « Équipes » ouverte ;
// &details=1 (avec tv=connected) : QR et lien dépliés sous la barre « TV connectée » ;
// &settings=1 : feuille « Réglages » ouverte.
// Les actions (lancer, s'inscrire) écrivent dans la base : elles échouent ici, c'est attendu.

const HOST_UID: PlayerId = 'host';
const NAMES = ['Loann', 'Maman', 'Papa', 'Camille', 'Léa', 'Tom', 'Noé', 'Inès', 'Hugo', 'Jade'];

function player(index: number): Player {
  return { name: NAMES[index % NAMES.length] + (index >= NAMES.length ? ` ${index}` : ''), avatar: AVATARS[index % AVATARS.length], score: 0, rank: 0, connected: true };
}

function isTeamMode(value: string | undefined): value is TeamMode {
  return TEAM_MODES.includes(value as TeamMode);
}

function demoSession(playerCount: number, hostRegistered: boolean, teamMode?: TeamMode): Session {
  const players: Record<PlayerId, Player> = {};
  for (let index = 0; index < playerCount; index += 1) {
    if (index === 0 && !hostRegistered) continue;
    players[index === 0 ? HOST_UID : `p${index}`] = player(index);
  }
  return {
    hostUid: HOST_UID,
    quizId: DEMO_CATALOG[0].id,
    status: 'lobby',
    settings: teamMode ? { ...DEFAULT_SESSION_SETTINGS, teams: true, teamMode } : DEFAULT_SESSION_SETTINGS,
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
  const params = useLocalSearchParams<{ players?: string; tv?: string; host?: string; notv?: string; teams?: string; drawn?: string; late?: string; page?: string; details?: string; settings?: string }>();
  const playerCount = Math.min(20, Math.max(0, Number(params.players ?? 4) || 0));
  const teamMode = isTeamMode(params.teams) ? params.teams : undefined;
  // Session en mémoire : les actions du salon (équipes) s'y appliquent, rien n'est écrit dans la base.
  const [session, setSession] = useState(() => {
    const initial = demoSession(playerCount, params.host !== '0', teamMode);
    const drawn = params.drawn === '1' ? applyLocalUpdate(initial, teamDrawUpdate(initial, Date.now() - 60_000)) : initial;
    return withLateJoiners(drawn, Number(params.late) || 0);
  });
  return (
    <HostLobby
      code={DEMO_CODE}
      session={session}
      applyUpdate={(build) => setSession((current) => applyLocalUpdate(current, build(current, Date.now())))}
      questions={{ kind: 'ready', questions: [] }}
      serverOffsetMs={0}
      cast={demoCast(params.tv)}
      header={<LobbyQuizTitle quiz={DEMO_CATALOG[0]} />}
      initialNoTvOpen={params.notv === '1'}
      initialTvDetailsOpen={params.details === '1'}
      initialTeamsOpen={params.page === 'teams'}
      initialSettingsOpen={params.settings === '1'}
    />
  );
}

// &late=N : les N derniers joueurs perdent leur équipe (arrivés après le tirage).
function withLateJoiners(session: Session, count: number): Session {
  const ids = Object.keys(session.players)
  const late = new Set(ids.slice(Math.max(0, ids.length - count)))
  const players = Object.fromEntries(ids.map((id) => [id, late.has(id) ? { ...session.players[id], team: undefined } : session.players[id]]))
  return { ...session, players }
}
