import type { RankedPlayer } from '../lib/players'
import { strings } from '../strings'
import { StreakBadge } from './StreakBadge'
import './Podium.css'

// Ordre d'affichage de gauche à droite : 3e, 1er, 2e (maquette). Les égalités gardent leur rang.
const DISPLAY_ORDER = [2, 0, 1]

interface PodiumProps {
  players: RankedPlayer[]
  // Délai CSS d'arrivée de chaque marche, par position (0 : premier), calé sur shared/rankingTimeline.ts.
  delays?: readonly string[]
  // Fin de partie (spec 17) : les avatars sautent selon leur place, couronne et projecteur sur le 1er,
  // marches qui pulsent au rythme des sauts (EndDance.css).
  dance?: boolean
  // Classement en cours de partie (spec 18) : badge flamme des séries de 3 et plus, au coin de l'avatar.
  showStreaks?: boolean
}

// Les trois premiers joueurs du classement trié ; marche colorée selon la position.
export function Podium({ players, delays, dance = false, showStreaks = false }: PodiumProps) {
  return (
    <section className={dance ? 'podium is-dancing' : 'podium'}>
      {DISPLAY_ORDER.map((position) => {
        const player = players[position]
        if (!player) return <div key={position} className="podium-step" />
        return (
          <div key={player.id} className={`podium-step podium-position-${position + 1}`} style={{ animationDelay: delays?.[position] }}>
            {dance && position === 0 && <span className="podium-spotlight" aria-hidden="true" />}
            <span className="podium-avatar">
              {dance && position === 0 && <Crown />}
              {player.avatar}
              {showStreaks && (
                <span className="podium-streak">
                  <StreakBadge streak={player.streak} delay={delays?.[position]} />
                </span>
              )}
            </span>
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

// Couronne dessinée avec des formes (pas d'emoji) : bandeau et trois pointes, posée sur l'avatar du 1er.
function Crown() {
  return (
    <span className="crown" aria-hidden="true">
      <span className="crown-point crown-point-left" />
      <span className="crown-point crown-point-middle" />
      <span className="crown-point crown-point-right" />
      <span className="crown-band" />
    </span>
  )
}
