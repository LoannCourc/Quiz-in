import { strings } from '../strings'
import './ConnectionLostBanner.css'

// Bandeau affiché par-dessus le dernier écran connu pendant une coupure réseau.
export function ConnectionLostBanner() {
  return (
    <div className="connection-lost" role="status">
      <strong>{strings.status.connectionLostTitle}</strong>
      <span>{strings.status.connectionLostHint}</span>
    </div>
  )
}
