import { MAX_PLAYERS } from '@shared/constants';
import { isSamePlayerName } from '@shared/playerName';
import type { GameStatus, Player, PlayerId } from '@shared/types';
import { ref, update } from 'firebase/database';

import { db } from './firebase';

// En lobby, l'entrée d'un joueur ne contient que ce qu'il a écrit lui-même :
// score et rank n'apparaissent qu'une fois écrits par l'hôte.
export type LobbyPlayer = Pick<Player, 'name' | 'avatar' | 'connected'>;
export type LobbyPlayers = Record<PlayerId, LobbyPlayer>;

export type JoinRefusal = 'notFound' | 'alreadyStarted' | 'ended' | 'full' | 'nameTaken';

// Refus connus avant même la saisie du pseudo, pour un joueur pas encore inscrit.
export function getEntryRefusal(status: GameStatus, players: LobbyPlayers): JoinRefusal | null {
  if (status === 'ended') return 'ended';
  if (status !== 'lobby') return 'alreadyStarted';
  // Les règles ne savent pas compter : l'hôte retirera aussi un joueur en trop (spec 7).
  if (Object.keys(players).length >= MAX_PLAYERS) return 'full';
  return null;
}

export function getJoinRefusal(
  status: GameStatus,
  players: LobbyPlayers,
  name: string,
): JoinRefusal | null {
  const entryRefusal = getEntryRefusal(status, players);
  if (entryRefusal) return entryRefusal;
  const isNameTaken = Object.values(players).some((player) => isSamePlayerName(player.name, name));
  return isNameTaken ? 'nameTaken' : null;
}

// update() et non set() : les droits du joueur portent sur chaque champ (name, avatar,
// connected), pas sur l'entrée entière, que set() remplacerait d'un bloc.
export function registerPlayer(code: string, uid: PlayerId, name: string, avatar: string): Promise<void> {
  return update(ref(db, `sessions/${code}/players/${uid}`), { name, avatar, connected: true });
}
