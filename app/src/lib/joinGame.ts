import { AVATARS } from '@shared/avatars';
import { MAX_PLAYERS } from '@shared/constants';
import { isAllowedPlayerName, isSamePlayerName } from '@shared/playerName';
import type { GameStatus, Player, PlayerId, TeamId } from '@shared/types';
import { ref, set, update } from 'firebase/database';

import { db } from './firebase';

// En lobby, l'entrée d'un joueur ne contient que ce qu'il a écrit lui-même :
// score et rank n'apparaissent qu'une fois écrits par l'hôte.
export type LobbyPlayer = Pick<Player, 'name' | 'avatar' | 'connected' | 'team'>;
export type LobbyPlayers = Record<PlayerId, LobbyPlayer>;

export type JoinRefusal = 'notFound' | 'alreadyStarted' | 'ended' | 'full' | 'nameTaken' | 'nameNotAllowed' | 'removed';

// Les autres joueurs que soi : à l'inscription, le joueur n'a pas encore d'entrée ;
// en modification de profil, il ne doit gêner ni lui-même ni le plafond de joueurs.
function otherPlayers(players: LobbyPlayers, uid: PlayerId): LobbyPlayer[] {
  return Object.entries(players)
    .filter(([id]) => id !== uid)
    .map(([, player]) => player);
}

// Premier avatar encore libre : chacun a ainsi un avatar différent sans avoir à chercher.
export function firstFreeAvatar(players: LobbyPlayers): string {
  const used = new Set(Object.values(players).map((player) => player.avatar));
  return AVATARS.find((avatar) => !used.has(avatar)) ?? AVATARS[0];
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
  if (!isAllowedPlayerName(name)) return 'nameNotAllowed';
  const isNameTaken = otherPlayers(players, uid).some((player) => isSamePlayerName(player.name, name));
  return isNameTaken ? 'nameTaken' : null;
}

// update() et non set() : les droits du joueur portent sur chaque champ (name, avatar,
// connected), pas sur l'entrée entière, que set() remplacerait d'un bloc.
// Groupe, mode « Ils choisissent » : le joueur choisit son équipe (en lobby seulement, règles).
export function chooseTeam(code: string, uid: PlayerId, team: TeamId): Promise<void> {
  return set(ref(db, `sessions/${code}/players/${uid}/team`), team);
}

export function registerPlayer(code: string, uid: PlayerId, name: string, avatar: string): Promise<void> {
  return update(ref(db, `sessions/${code}/players/${uid}`), { name, avatar, connected: true });
}

// Modification en lobby : seulement name et avatar ; connected reste géré par la présence.
export function updateProfile(code: string, uid: PlayerId, name: string, avatar: string): Promise<void> {
  return update(ref(db, `sessions/${code}/players/${uid}`), { name, avatar });
}

// Dernier profil connu de ce joueur, par partie, le temps que la page reste ouverte : si l'hôte
// le retire du lobby (joueur fantôme), le formulaire de réinscription est prérempli.
const knownProfiles = new Map<string, { name: string; avatar: string }>();

export function rememberProfile(code: string, name: string, avatar: string): void {
  knownProfiles.set(code, { name, avatar });
}

export function rememberedProfile(code: string): { name: string; avatar: string } | undefined {
  return knownProfiles.get(code);
}
