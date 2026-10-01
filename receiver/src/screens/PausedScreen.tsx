import { strings } from '../strings'
import './PausedScreen.css'

export function PausedScreen() {
  return (
    <main className="screen paused">
      <p className="paused-icon" aria-hidden="true">
        ❚❚
      </p>
      <h1 className="paused-title">{strings.paused.title}</h1>
      <p className="paused-subtitle">{strings.paused.subtitle}</p>
    </main>
  )
}
