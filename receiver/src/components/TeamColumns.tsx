import { teamColumns } from '@shared/teamDraw'
import type { PlayerId, PublicSession, TeamId } from '@shared/types'
import { useEffect, useState } from 'react'

import { FIT_EVENT } from '../hooks/useFitScale'
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
  const [wrap, setWrap] = useState<HTMLDivElement | null>(null)
  const hidden = useHiddenMembers(wrap)

  return (
    <div className="team-columns-wrap" ref={setWrap}>
      <div className={`team-columns columns-${teams.length}`}>
        {columns.map(({ team, members }) => (
          <section key={team} className={`team-column team-${team}`} data-team={team}>
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
            {/* Garde-fou : un membre qui ne tient toujours pas à la plus petite taille n'est jamais masqué en silence. */}
            {(hidden[team] ?? 0) > 0 && <span className="team-column-more">{strings.teams.moreMembers(hidden[team] ?? 0)}</span>}
          </section>
        ))}
      </div>
      {unassigned.length > 0 && (
        <p className="team-unassigned">
          <span className="team-unassigned-label">{strings.teams.unassigned(unassigned.length)}</span>
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

// Membres qui dépassent du bas de leur colonne, par équipe (après l'ajustement de la taille par
// hooks/useFitScale.ts, qui envoie FIT_EVENT ; aussi au redimensionnement de la fenêtre).
function useHiddenMembers(wrap: HTMLElement | null): Partial<Record<TeamId, number>> {
  const [hidden, setHidden] = useState<Partial<Record<TeamId, number>>>({})
  useEffect(() => {
    if (!wrap) return
    const measure = () => {
      const next: Partial<Record<TeamId, number>> = {}
      wrap.querySelectorAll<HTMLElement>('.team-column[data-team]').forEach((column) => {
        const bottom = column.getBoundingClientRect().bottom
        const count = [...column.querySelectorAll('.team-member')].filter((member) => member.getBoundingClientRect().bottom > bottom + 1).length
        if (count > 0) next[column.dataset.team as TeamId] = count
      })
      setHidden((previous) => (JSON.stringify(previous) === JSON.stringify(next) ? previous : next))
    }
    measure()
    document.addEventListener(FIT_EVENT, measure)
    window.addEventListener('resize', measure)
    return () => {
      document.removeEventListener(FIT_EVENT, measure)
      window.removeEventListener('resize', measure)
    }
  }, [wrap])
  return hidden
}
