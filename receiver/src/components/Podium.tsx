import type { RankedPlayer } from '../lib/players'
import { strings } from '../strings'
import './Podium.css'

// Ordre d'affichage de gauche à droite : 3e, 1er, 2e (maquette). Les égalités gardent leur rang.
const DISPLAY_ORDER = [2, 0, 1]

// Les trois premiers joueurs du classement trié ; marche colorée selon la position. delays : délai CSS
// d'arrivée de chaque marche, par position (0 : premier), calé sur shared/rankingTimeline.ts.
export function Podium({ players, delays }: { players: RankedPlayer[]; delays?: readonly string[] }) {
  return (
    <section className="podium">
      {DISPLAY_ORDER.map((position) => {
        const player = players[position]
        if (!player) return <div key={position} className="podium-step" />
        return (
          <div key={player.id} className={`podium-step podium-position-${position + 1}`} style={{ animationDelay: delays?.[position] }}>
            <span className="podium-avatar">{player.avatar}</span>
            <span className="podium-name">{player.name}</span>
            <div className="podium-block">
              <span className="podium-rank">{player.rank}</span>
              <span className="podium-score">{strings.ranking.points(player.score)}</span>
            </div>
          </div>
        )
      })}
    </section>
  )
}
