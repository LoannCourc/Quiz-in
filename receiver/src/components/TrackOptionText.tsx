import { trackOptionParts } from '@shared/trackOption'

import './TrackOptionText.css'

// Texte d'une proposition. Blind test « Titre – Artiste » : titre en gros, artiste en plus petit dessous.
export function TrackOptionText({ option, className = 'choice-text' }: { option: string; className?: string }) {
  const { title, artist } = trackOptionParts(option)
  return (
    <span className={className}>
      {title}
      {artist !== null && <span className="choice-artist">{artist}</span>}
    </span>
  )
}
