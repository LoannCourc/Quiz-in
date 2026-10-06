import { MAX_PLAYERS } from '@shared/constants'
import { teamDrawTimeline } from '@shared/teamDraw'
import type { PublicSession } from '@shared/types'
import { QRCodeSVG } from 'qrcode.react'
import { useEffect, useState } from 'react'

import { Avatar } from '../components/Avatar'
import { TeamColumns } from '../components/TeamColumns'
import { useFitScale } from '../hooks/useFitScale'
import { JOIN_URL_BASE, PLAYERS_SITE_HOST } from '../config'
import { lobbyDensity } from '../lib/lobbyLayout'
import { countConnected, sortByRank } from '../lib/players'
import { estimateServerNow, useServerTimeOffset } from '../lib/serverTime'
import { strings } from '../strings'
import { TeamDrawScreen } from './TeamDrawScreen'
import './LobbyScreen.css'

// Vrai pendant durationMs après l'heure serveur since (puis un nouveau rendu repasse à faux).
function useIsRecent(since: number | undefined, durationMs: number): boolean {
  const offsetMs = useServerTimeOffset()
  const remainingMs = since === undefined ? 0 : since + durationMs - estimateServerNow(offsetMs)
  const [, setTick] = useState(0)
  useEffect(() => {
    if (remainingMs <= 0) return
    const timeoutId = setTimeout(() => setTick((tick) => tick + 1), remainingMs)
    return () => clearTimeout(timeoutId)
  }, [remainingMs])
  return remainingMs > 0
}

// Ce qui doit tenir dans la colonne des joueurs : boîtes sans débordement, pseudos entiers.
const FIT_BOXES = '.lobby-avatars, .team-columns-wrap, .team-column'
const FIT_TEXTS = '.avatar-name, .team-member-name, .team-unassigned-player'

interface LobbyScreenProps {
  session: PublicSession
  roomCode: string
}

export function LobbyScreen({ session, roomCode }: LobbyScreenProps) {
  const players = sortByRank(session.players)
  // Groupe : écran du tirage pendant quelques secondes après chaque « Tirer au sort ».
  // Durée selon le nombre de joueurs : tous arrivent, le gong sonne, puis les équipes restent un instant.
  const isDrawing = useIsRecent(session.settings.teams ? session.teamDrawAt : undefined, teamDrawTimeline(session).endMs)
  // Joueurs à la place qui reste : échelle réduite tant qu'un avatar, une équipe ou un pseudo dépasse.
  const { teams, teamCount } = session.settings
  const fitKey = `${players.map((player) => `${player.id}:${player.name}:${player.team ?? ''}`).join('|')}|${teams}|${teamCount ?? ''}`
  const playersRef = useFitScale(fitKey, { variables: ['--fit-scale'], boxes: FIT_BOXES, texts: FIT_TEXTS })
  if (isDrawing) return <TeamDrawScreen session={session} />

  return (
    <main className={`screen lobby lobby-${lobbyDensity(players.length)}`}>
      <section className="lobby-join">
        <p className="lobby-label">{strings.lobby.scanToJoin}</p>
        <div className="lobby-qr">
          {/* Niveau M : le code reste lisible même si l'écran de la TV reflète un peu la lumière. */}
          <QRCodeSVG value={`${JOIN_URL_BASE}${roomCode}`} size={512} level="M" marginSize={2} />
        </div>
        <p className="lobby-host">{PLAYERS_SITE_HOST}</p>
        <p className="lobby-label">{strings.lobby.orEnterCode}</p>
        <p className="lobby-code">{roomCode}</p>
      </section>

      <section className="lobby-players" ref={playersRef}>
        <h1 className="lobby-logo">{strings.appName}</h1>
        <p className="lobby-count">{strings.lobby.playerCount(countConnected(players), MAX_PLAYERS)}</p>
        {session.settings.teams ? (
          // Groupe : les joueurs dans leur équipe (et ceux qui n'en ont pas encore).
          <TeamColumns session={session} />
        ) : (
          <div className="lobby-avatars">
            {players.map((player) => (
              <Avatar key={player.id} player={player} />
            ))}
          </div>
        )}
        <p className="lobby-waiting">{strings.lobby.waitingForPlayers}</p>
      </section>
    </main>
  )
}
