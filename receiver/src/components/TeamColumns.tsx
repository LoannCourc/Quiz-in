import { activeTeams, teamCountOf } from '@shared/teams'
import type { PlayerId, PublicSession, TeamId } from '@shared/types'

import { strings } from '../strings'
import { TeamSymbol } from './TeamSymbol'
import './TeamColumns.css'

interface TeamColumnsProps {
  session: PublicSession
  // Tirage : les joueurs arrivent un à un dans leur colonne (une équipe après l'autre).
  animate?: boolean
}

// Délai entre deux arrivées pendant l'animation du tirage.
const ARRIVAL_STEP_S = 0.45

// Une colonne par équipe (maquette G2) : en-tête à sa couleur (symbole et nom), puis ses joueurs.
// Les joueurs sans équipe sont rappelés en dessous. Animations CSS seulement (transform, opacity).
export function TeamColumns({ session, animate = false }: TeamColumnsProps) {
  const playerIds = Object.keys(session.players)
  const teams = activeTeams(teamCountOf(session.settings, playerIds.length))
  const byName = (a: PlayerId, b: PlayerId) => session.players[a].name.localeCompare(session.players[b].name, 'fr')
  const membersOf = (team: TeamId) => playerIds.filter((id) => session.players[id].team === team).sort(byName)
  const unassigned = playerIds.filter((id) => !teams.includes(session.players[id].team as TeamId)).sort(byName)

  return (
    <div className="team-columns-wrap">
      <div className={`team-columns columns-${teams.length}`}>
        {teams.map((team, teamIndex) => (
          <section key={team} className={`team-column team-${team}`}>
            <h2 className="team-column-head">
              <TeamSymbol team={team} />
              {strings.teams.names[team]}
            </h2>
            <ul className="team-column-members">
              {membersOf(team).map((id, memberIndex) => (
                <li
                  key={id}
                  className={animate ? 'team-member is-arriving' : 'team-member'}
                  style={animate ? { animationDelay: `${(memberIndex * teams.length + teamIndex) * ARRIVAL_STEP_S}s` } : undefined}>
                  <span className="team-member-avatar">{session.players[id].avatar}</span>
                  <span className="team-member-name">{session.players[id].name}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      {unassigned.length > 0 && (
        <p className="team-unassigned">
          <span className="team-unassigned-label">{strings.teams.unassigned}</span>
          {unassigned.map((id) => (
            <span key={id} className="team-unassigned-player">
              {session.players[id].avatar} {session.players[id].name}
            </span>
          ))}
        </p>
      )}
    </div>
  )
}
