import { spreadConfettiPieces } from '@shared/confettiLayout'

import './Confetti.css'

// 12 confettis CSS (règle : 10 à 15 au plus), uniquement à la révélation et à la fin.
// Une seule chute (transform et opacity seulement), répartie sur les bords de l'écran (fin de partie).
const PIECE_COUNT = 12

// Fin de partie (spec 17) : après la salve de l'arrivée du 1er, une pluie légère et continue de
// RAIN_PIECE_COUNT pièces recyclées (chacune retombe en boucle), dans les mêmes marges latérales.
// Avec la salve, jamais plus de 30 confettis à l'écran.
const RAIN_PIECE_COUNT = 18
const RAIN_COLORS = 5
// La pluie commence quand la salve finit de tomber.
const RAIN_START_S = 2.5

export function ConfettiRain() {
  return (
    <div className="confetti" aria-hidden="true">
      {Array.from({ length: RAIN_PIECE_COUNT }, (_, index) => {
        // Pièces paires à gauche (0,5 à 4,5 %), impaires à droite (95,5 à 99,5 %).
        const lane = (index * 7) % 9
        const left = index % 2 === 0 ? 0.5 + lane * 0.5 : 95.5 + lane * 0.5
        return (
          <span
            key={index}
            className="confetti-piece confetti-rain-piece"
            style={{
              left: `${left}%`,
              background: `var(--confetti-${(index % RAIN_COLORS) + 1})`,
              animationDelay: `${RAIN_START_S + (index * 0.37) % 6}s`,
              animationDuration: `${5.5 + (index % 4) * 0.6}s`,
            }}
          />
        )
      })}
    </div>
  )
}

export function Confetti() {
  return (
    <div className="confetti" aria-hidden="true">
      {Array.from({ length: PIECE_COUNT }, (_, index) => (
        <span key={index} className={`confetti-piece confetti-piece-${index}`} />
      ))}
    </div>
  )
}

// « La bonne réponse » : une chute sur toute la largeur. Derrière les cartes, visible entre elles : jamais devant une
// réponse, un compteur ni un texte. Pour la passer devant (plus petite et légèrement transparente) : IN_FRONT à true.
const IN_FRONT = false
const CONFETTI_COLORS = 5
const SPREAD_PIECES = spreadConfettiPieces(CONFETTI_COLORS)

export function RevealConfetti() {
  return (
    <div className={IN_FRONT ? 'confetti confetti-spread is-front' : 'confetti confetti-spread'} aria-hidden="true">
      {SPREAD_PIECES.map((piece) => (
        <span
          key={piece.leftPercent}
          className="confetti-piece"
          style={{
            left: `${piece.leftPercent}%`,
            background: `var(--confetti-${piece.colorIndex + 1})`,
            animationDelay: `${piece.delayMs}ms`,
            animationDuration: `${piece.durationMs}ms`,
          }}
        />
      ))}
    </div>
  )
}
