import { MAX_PLAYERS } from '@shared/constants'
import type { PublicSession } from '@shared/types'
import { QRCodeSVG } from 'qrcode.react'

import { Avatar } from '../components/Avatar'
import { JOIN_URL_BASE } from '../config'
import { countConnected, sortByRank } from '../lib/players'
import { strings } from '../strings'
import './LobbyScreen.css'

interface LobbyScreenProps {
  session: PublicSession
  roomCode: string
}

export function LobbyScreen({ session, roomCode }: LobbyScreenProps) {
  const players = sortByRank(session.players)

  return (
    <main className="screen lobby">
      <section className="lobby-join">
        <p className="lobby-label">{strings.lobby.scanToJoin}</p>
        <div className="lobby-qr">
          {/* Niveau M : le code reste lisible même si l'écran de la TV reflète un peu la lumière. */}
          <QRCodeSVG value={`${JOIN_URL_BASE}${roomCode}`} size={512} level="M" marginSize={2} />
        </div>
        <p className="lobby-label">{strings.lobby.orEnterCode}</p>
        <p className="lobby-code">{roomCode}</p>
      </section>

      <section className="lobby-players">
        <h1 className="screen-title">{strings.appName}</h1>
        <p className="lobby-count">{strings.lobby.playerCount(countConnected(players), MAX_PLAYERS)}</p>
        <div className="lobby-avatars">
          {players.map((player) => (
            <Avatar key={player.id} player={player} />
          ))}
        </div>
        <p className="lobby-waiting">{strings.lobby.waitingForPlayers}</p>
      </section>
    </main>
  )
}
