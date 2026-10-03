import './Confetti.css'

// 12 confettis CSS (règle : 10 à 15 au plus), uniquement à la révélation et à la fin.
// Une seule chute (transform et opacity seulement), répartie sur les bords de l'écran.
const PIECE_COUNT = 12

export function Confetti() {
  return (
    <div className="confetti" aria-hidden="true">
      {Array.from({ length: PIECE_COUNT }, (_, index) => (
        <span key={index} className={`confetti-piece confetti-piece-${index}`} />
      ))}
    </div>
  )
}
