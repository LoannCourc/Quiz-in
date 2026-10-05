import type { TeamId } from '@shared/types'

import { strings } from '../strings'
import './TeamSymbol.css'

// Symbole d'équipe dessiné en CSS (les polices du jeu n'ont pas ces signes) : Rose étoile, Cyan rond,
// Or triangle, Vert carré. La couleur vient du parent (currentColor).
export function TeamSymbol({ team }: { team: TeamId }) {
  return <span className={`team-symbol team-symbol-${team}`} aria-hidden="true" />
}

// Pastille d'équipe : carré arrondi de sa couleur, symbole en encre ; le nom est lu par les lecteurs d'écran.
export function TeamTile({ team }: { team: TeamId }) {
  return (
    <span className={`team-tile team-${team}`} role="img" aria-label={strings.teams.names[team]}>
      <TeamSymbol team={team} />
    </span>
  )
}
