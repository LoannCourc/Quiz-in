import { useEffect, useState } from 'react'

import { isAudioUnlocked, onAudioUnlock } from '../lib/audioUnlock'
import { strings } from '../strings'
import './AudioUnlockBanner.css'

// Plan B (navigateur d'un PC) : invite à cliquer une fois sur l'écran pour
// que le navigateur autorise le son. Disparaît au premier clic (ou à la première touche).
export function AudioUnlockBanner() {
  const [isUnlocked, setIsUnlocked] = useState(isAudioUnlocked)
  useEffect(() => onAudioUnlock(() => setIsUnlocked(true)), [])
  if (isUnlocked) return null
  return (
    <div className="audio-unlock" role="status">
      <strong className="audio-unlock-title">{strings.blindTest.unlockTitle}</strong>
      <span className="audio-unlock-hint">{strings.blindTest.unlockHint}</span>
    </div>
  )
}
