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

// Les autres joueurs que soi : à l'inscription, le joueur n'a pas encore d'entrée ;
// en modification de profil, il ne doit gêner ni lui-même ni le plafond de joueurs.
function otherPlayers(players: LobbyPlayers, uid: PlayerId): LobbyPlayer[] {
  return Object.entries(players)
    .filter(([id]) => id !== uid)
    .map(([, player]) => player);
}

// Refus connus avant même la saisie du pseudo.
export function getEntryRefusal(
  status: GameStatus,
  players: LobbyPlayers,
  uid: PlayerId,
): JoinRefusal | null {
  if (status === 'ended') return 'ended';
  if (status !== 'lobby') return 'alreadyStarted';
  // Les règles ne savent pas compter : l'hôte retirera aussi un joueur en trop (spec 7).
  if (otherPlayers(players, uid).length >= MAX_PLAYERS) return 'full';
  return null;
}

export function getJoinRefusal(
  status: GameStatus,
  players: LobbyPlayers,
  uid: PlayerId,
  name: string,
): JoinRefusal | null {
  const entryRefusal = getEntryRefusal(status, players, uid);
  if (entryRefusal) return entryRefusal;
  const isNameTaken = otherPlayers(players, uid).some((player) => isSamePlayerName(player.name, name));
  return isNameTaken ? 'nameTaken' : null;
}

// update() et non set() : les droits du joueur portent sur chaque champ (name, avatar,
// connected), pas sur l'entrée entière, que set() remplacerait d'un bloc.
export function registerPlayer(code: string, uid: PlayerId, name: string, avatar: string): Promise<void> {
  return update(ref(db, `sessions/${code}/players/${uid}`), { name, avatar, connected: true });
}

// Modification en lobby : seulement name et avatar ; connected reste géré par la présence.
export function updateProfile(code: string, uid: PlayerId, name: string, avatar: string): Promise<void> {
  return update(ref(db, `sessions/${code}/players/${uid}`), { name, avatar });
}
