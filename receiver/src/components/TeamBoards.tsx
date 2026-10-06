import { teamRanking, teamsInGame, type TeamRow } from '@shared/teams'
import type { Player, PublicSession } from '@shared/types'

import { Avatar } from './Avatar'
import { hasAnswered, sortByRank, type RankedPlayer } from '../lib/players'
import { strings } from '../strings'
import { StreakBadge } from './StreakBadge'
import { TeamSymbol, TeamTile } from './TeamSymbol'
import './TeamBoards.css'

// Groupe : composants de la TV pendant la partie (maquettes G2 et G3). Points d'équipe arrondis.

// Pendant la question : avatars regroupés par équipe (symbole à la couleur de l'équipe), allumés
// quand le joueur a répondu ; jamais ce qu'il a répondu.
export function TeamAvatarGroups({ session, players }: { session: PublicSession; players: RankedPlayer[] }) {
  return (
    <div className="team-avatar-groups">
      {teamsInGame(session.players).map((team) => (
        <div key={team} className={`team-avatar-group team-${team}`}>
          <span className="team-avatar-symbol">
            <TeamSymbol team={team} />
          </span>
          {players
            .filter((player) => player.team === team)
            .map((player) => (
              <Avatar key={player.id} player={player} state={hasAnswered(session, player.id) ? 'lit' : 'dimmed'} showName={false} />
            ))}
        </div>
      ))}
    </div>
  )
}

// showStreaks : classement en cours de partie (spec 18), badge flamme du meilleur joueur (série individuelle).
function BestPlayer({ player, showStreaks = false, delay }: { player: Player | undefined; showStreaks?: boolean; delay?: string }) {
  if (!player) return <span />
  return (
    <span className="team-best">
      <span className="team-best-avatar">{player.avatar}</span>
      <span className="team-best-texts">
        <span className="team-best-label">{strings.teams.bestPlayer}</span>
        <span className="team-best-name">{strings.teams.bestPlayerScore(player.name, player.score ?? 0)}</span>
      </span>
      {showStreaks && <StreakBadge streak={player.streak} delay={delay} />}
    </span>
  )
}

// Classement des équipes entre deux questions (G3) : rang, pastille, barre proportionnelle au score,
// moyenne, meilleur joueur de l'équipe.
// delays : délai CSS d'arrivée de chaque ligne, par position (0 : première équipe).
export function TeamRankingBoard({ session, delays, showStreaks = false }: { session: PublicSession; delays?: readonly string[]; showStreaks?: boolean }) {
  const rows = teamRanking(session)
  const maxScore = Math.max(1, ...rows.map((row) => row.score))
  return (
    <div className="team-board">
      <ol className="team-rows">
        {rows.map((row, position) => (
          <li key={row.team} className={`team-row team-${row.team}`} style={{ animationDelay: delays?.[position] }}>
            <span className={row.rank === 1 ? 'team-row-rank is-first' : 'team-row-rank'}>{row.rank}</span>
            <TeamTile team={row.team} />
            <span className="team-row-main">
              <span className="team-row-top">
                <span className="team-row-name">{strings.teams.names[row.team]}</span>
                <span className="team-row-score">
                  {Math.round(row.score)} <span className="team-row-unit">{strings.teams.averageUnit}</span>
                </span>
              </span>
              <span className="team-row-track">
                <span className="team-row-bar" style={{ transform: `scaleX(${row.score / maxScore})` }} />
              </span>
            </span>
            <BestPlayer
              player={row.bestPlayerId ? session.players[row.bestPlayerId] : undefined}
              showStreaks={showStreaks}
              delay={delays?.[position]}
            />
          </li>
        ))}
      </ol>
      <p className="team-board-note">{strings.teams.averageNote}</p>
    </div>
  )
}

// Ordre d'affichage du podium, de gauche à droite : 2e, 1er, 3e (maquette G3).
const PODIUM_ORDER = [1, 0, 2]
const BEST_PLAYERS_COUNT = 3

// Fin de partie (G3) : podium des équipes, puis les meilleurs joueurs de la partie.
// delays : délai CSS d'arrivée de chaque marche, par place (0 : première équipe).
// dance : fin de partie (spec 17), les symboles d'équipe dansent selon le rang et les membres de l'équipe
// gagnante sautent avec elle (EndDance.css).
export function TeamPodium({ session, delays, dance = false }: { session: PublicSession; delays?: readonly string[]; dance?: boolean }) {
  const rows = teamRanking(session)
  const winners = rows[0] ? sortByRank(session.players).filter((player) => player.team === rows[0].team) : []
  const best = sortByRank(session.players).slice(0, BEST_PLAYERS_COUNT)
  return (
    <div className="team-final">
      <div className={dance ? 'team-podium is-dancing' : 'team-podium'}>
        {PODIUM_ORDER.map((position) => {
          const row: TeamRow | undefined = rows[position]
          if (!row) return <div key={position} />
          return (
            <div key={row.team} className={`team-podium-step team-${row.team} place-${position + 1}`} style={{ animationDelay: delays?.[position] }}>
              {dance && position === 0 && <span className="podium-spotlight" aria-hidden="true" />}
              <span className="team-dancer">
                <TeamTile team={row.team} />
              </span>
              {position === 0 && (
                <span className="team-podium-members">
                  {winners.map((player, index) => (
                    <span key={player.id} className="team-member-avatar" style={{ animationDelay: `${-index * 0.12}s` }}>
                      {player.avatar}
                    </span>
                  ))}
                </span>
              )}
              <span className="team-podium-name">{strings.teams.names[row.team]}</span>
              <span className="team-podium-score">{strings.teams.averagePoints(Math.round(row.score))}</span>
              <span className="team-podium-block">{row.rank}</span>
            </div>
          )
        })}
      </div>
      <div className="team-best-players">
        <span className="team-best-players-label">{strings.teams.bestPlayers}</span>
        {best.map((player) => (
          <span key={player.id} className="team-best-chip">
            <span className="team-best-avatar">{player.avatar}</span>
            {strings.teams.bestPlayerRank(player.rank, player.name, player.score)}
          </span>
        ))}
      </div>
    </div>
  )
}
