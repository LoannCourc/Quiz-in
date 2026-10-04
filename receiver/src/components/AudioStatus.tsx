import { useContext } from 'react'

import { GameAudioStateContext } from '../hooks/useGameAudio'
import { strings } from '../strings'
import './AudioStatus.css'

const BAR_COUNT = 5

// Sous la question d'un blind test : barres animées pendant l'écoute (rien ne révèle le morceau),
// ou « Extrait indisponible » si la TV n'arrive pas à le lire.
export function AudioStatus() {
  const state = useContext(GameAudioStateContext)
  if (state === 'unavailable') {
    return (
      <p className="audio-status audio-status-error">
        {strings.blindTest.unavailable}
        <span className="audio-status-hint">{strings.blindTest.unavailableHint}</span>
      </p>
    )
  }
  return (
    <p className={`audio-status ${state === 'playing' ? 'is-playing' : ''}`}>
      <span className="audio-bars" aria-hidden="true">
        {Array.from({ length: BAR_COUNT }, (_, index) => (
          <span key={index} className={`audio-bar audio-bar-${index}`} />
        ))}
      </span>
      {strings.blindTest.listening}
    </p>
  )
}
