import { activeTeams, teamCountOf } from '@shared/teams'
import type { PublicSession } from '@shared/types'

import { TeamColumns } from '../components/TeamColumns'
import { useFitScale } from '../hooks/useFitScale'
import { strings } from '../strings'
import './TeamDrawScreen.css'

// Tirage des équipes (maquette G2) : affiché quelques secondes après chaque « Tirer au sort » de
// l'hôte ; les joueurs arrivent un à un dans leur colonne. Nouvelle clé par tirage : l'animation rejoue.
export function TeamDrawScreen({ session }: { session: PublicSession }) {
  const playerCount = Object.keys(session.players).length
  const teamCount = activeTeams(teamCountOf(session.settings, playerCount)).length
  // Colonnes à la place qui reste (pseudos entiers, aucun joueur sous le bord de l'écran).
  const fitKey = Object.entries(session.players).map(([id, player]) => `${id}:${player.name}:${player.team ?? ''}`).join('|')
  const ref = useFitScale(fitKey, '.team-columns-wrap, .team-column', '.team-member-name')
  return (
    <main className="screen team-draw" key={session.teamDrawAt} ref={ref}>
      <header className="team-draw-header">
        <h1 className="hero-title team-draw-title">{strings.teams.drawTitle}</h1>
        <p className="team-draw-summary">{strings.teams.drawSummary(playerCount, teamCount)}</p>
      </header>
      <TeamColumns session={session} animate />
      <p className="team-draw-footer">{strings.teams.drawFooter}</p>
    </main>
  )
}
