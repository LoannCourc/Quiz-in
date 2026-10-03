import { strings } from '../strings'
import './PausedScreen.css'

export function PausedScreen() {
  return (
    <main className="screen paused">
      <div className="paused-coin" aria-hidden="true">
        <span className="paused-bar" />
        <span className="paused-bar" />
      </div>
      <h1 className="hero-title">{strings.paused.title}</h1>
      <p className="paused-subtitle">{strings.paused.subtitle}</p>
    </main>
  )
}
