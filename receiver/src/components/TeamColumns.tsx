import { teamColumns } from '@shared/teamDraw'
import type { PlayerId, PublicSession } from '@shared/types'

import { strings } from '../strings'
import { TeamSymbol } from './TeamSymbol'
import './TeamColumns.css'

interface TeamColumnsProps {
  session: PublicSession
  // Tirage : délai d'arrivée de chaque joueur dans sa colonne, en ms (calendrier de shared/teamDraw.ts,
  // négatif si l'arrivée est déjà en cours). Sans : tous affichés tout de suite (salon).
  arrivalDelayMs?: Record<PlayerId, number>
}

// Une colonne par équipe (maquette G2) : en-tête à sa couleur (symbole et nom), puis ses joueurs.
// Les joueurs sans équipe sont rappelés en dessous. Animations CSS seulement (transform, opacity).
export function TeamColumns({ session, arrivalDelayMs }: TeamColumnsProps) {
  const { columns, unassigned } = teamColumns(session)
  const teams = columns.map((column) => column.team)

  return (
    <div className="team-columns-wrap">
      <div className={`team-columns columns-${teams.length}`}>
        {columns.map(({ team, members }) => (
          <section key={team} className={`team-column team-${team}`}>
            <h2 className="team-column-head">
              <TeamSymbol team={team} />
              {strings.teams.names[team]}
            </h2>
            <ul className="team-column-members">
              {members.map((id) => (
                <li
                  key={id}
                  className={arrivalDelayMs ? 'team-member is-arriving' : 'team-member'}
                  style={arrivalDelayMs ? { animationDelay: `${arrivalDelayMs[id] ?? 0}ms` } : undefined}>
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
