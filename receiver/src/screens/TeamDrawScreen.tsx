import { teamDrawTimeline } from '@shared/teamDraw'
import { activeTeams, teamCountOf } from '@shared/teams'
import type { PlayerId, PublicSession } from '@shared/types'
import { useState } from 'react'

import { TeamColumns } from '../components/TeamColumns'
import { useFitScale } from '../hooks/useFitScale'
import { estimateServerNow, useServerTimeOffset } from '../lib/serverTime'
import { strings } from '../strings'
import './TeamDrawScreen.css'

// Tirage des équipes (maquette G2) : affiché quelques secondes après chaque « Tirer au sort » de
// l'hôte ; les joueurs arrivent un à un dans leur colonne, au même calendrier que les sons (un tic par
// joueur, gong au dernier : shared/teamDraw.ts). Nouvelle clé par tirage : l'animation rejoue.
export function TeamDrawScreen({ session }: { session: PublicSession }) {
  const playerCount = Object.keys(session.players).length
  const teamCount = activeTeams(teamCountOf(session.settings, playerCount)).length
  // Colonnes à la place qui reste (pseudos entiers, aucun joueur sous le bord de l'écran).
  const fitKey = Object.entries(session.players).map(([id, player]) => `${id}:${player.name}:${player.team ?? ''}`).join('|')
  // Délais calés sur l'heure du tirage (serveur) : une TV qui affiche le tirage en retard le reprend où il en est.
  const offsetMs = useServerTimeOffset()
  const [elapsedMs] = useState(() => estimateServerNow(offsetMs) - (session.teamDrawAt ?? 0))
  const arrivalDelayMs: Record<PlayerId, number> = Object.fromEntries(
    teamDrawTimeline(session).arrivals.map((arrival) => [arrival.playerId, arrival.atMs - elapsedMs]),
  )
  const ref = useFitScale(fitKey, { variables: ['--fit-scale'], boxes: '.team-columns-wrap, .team-column', texts: '.team-member-name' })
  return (
    <main className="screen team-draw" key={session.teamDrawAt} ref={ref}>
      <header className="team-draw-header">
        <h1 className="hero-title team-draw-title">{strings.teams.drawTitle}</h1>
        <p className="team-draw-summary">{strings.teams.drawSummary(playerCount, teamCount)}</p>
      </header>
      <TeamColumns session={session} arrivalDelayMs={arrivalDelayMs} />
      <p className="team-draw-footer">{strings.teams.drawFooter}</p>
    </main>
  )
}
