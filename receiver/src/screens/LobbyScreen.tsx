import { MAX_PLAYERS, TEAM_DRAW_SHOW_MS } from '@shared/constants'
import type { PublicSession } from '@shared/types'
import { QRCodeSVG } from 'qrcode.react'
import { useEffect, useState } from 'react'

import { Avatar } from '../components/Avatar'
import { TeamColumns } from '../components/TeamColumns'
import { JOIN_URL_BASE, PLAYERS_SITE_HOST } from '../config'
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

interface LobbyScreenProps {
  session: PublicSession
  roomCode: string
}

export function LobbyScreen({ session, roomCode }: LobbyScreenProps) {
  const players = sortByRank(session.players)
  // Groupe : écran du tirage pendant quelques secondes après chaque « Tirer au sort ».
  const isDrawing = useIsRecent(session.settings.teams ? session.teamDrawAt : undefined, TEAM_DRAW_SHOW_MS)
  if (isDrawing) return <TeamDrawScreen session={session} />

  return (
    <main className="screen lobby">
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

      <section className="lobby-players">
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
