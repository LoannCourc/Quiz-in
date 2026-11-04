import { interimRanking, type InterimRow, type LeaderStatus } from '@shared/interimRanking'
import { rankingStreakBadges } from '@shared/streak'
import type { PublicSession } from '@shared/types'

import { useFitScale } from '../hooks/useFitScale'
import { nameScaleStyle } from '../lib/playerNameStyle'
import { strings } from '../strings'
import { AvatarGlyph } from './AvatarGlyph'
import { ExtraStreaks } from './ExtraStreaks'
import { StreakBadge } from './StreakBadge'
import './InterimRankingBoard.css'

// Tout tient au-dessus du bandeau : les lignes rétrécissent si « et N autres » et « Aussi en série » s'ajoutent.
const BOARD_FIT = { variables: ['--rows-scale'], boxes: '.interim-rows', includeRoot: true }

// Couronne validée par Loann ; id du dégradé unique dans la page (une seule couronne à la fois).
function Crown() {
  return (
    <svg className="interim-crown" viewBox="0 0 120 90" aria-hidden="true">
      <defs>
        <linearGradient id="quizin-interim-crown-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff2a8" />
          <stop offset=".55" stopColor="#ffcf2e" />
          <stop offset="1" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      <g transform="rotate(-8 60 45)">
        <path
          d="M12 72 L10 28 Q10 22 15 25 L42 50 L56 14 Q60 6 64 14 L78 50 L105 25 Q110 22 110 28 L108 72 Z"
          fill="url(#quizin-interim-crown-gold)"
          stroke="#1a0b4a"
          strokeWidth="5"
          strokeLinejoin="round"
        />
        <rect x="10" y="68" width="100" height="16" rx="8" fill="#ffb81f" stroke="#1a0b4a" strokeWidth="5" />
        <circle cx="12" cy="22" r="8" fill="#ff6fa8" stroke="#1a0b4a" strokeWidth="4" />
        <circle cx="60" cy="8" r="9" fill="#3ce7fe" stroke="#1a0b4a" strokeWidth="4" />
        <circle cx="108" cy="22" r="8" fill="#ff6fa8" stroke="#1a0b4a" strokeWidth="4" />
        <circle cx="34" cy="76" r="4" fill="#ff6fa8" />
        <circle cx="60" cy="76" r="4" fill="#3ce7fe" />
        <circle cx="86" cy="76" r="4" fill="#ff6fa8" />
        <path d="M27 60 L23 38" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity=".75" />
      </g>
    </svg>
  )
}

function Sparkle({ className }: { className: string }) {
  return (
    <svg className={`interim-sparkle ${className}`} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z" />
    </svg>
  )
}

const LEADER_TEXTS: Record<LeaderStatus, string> = {
  first: strings.interim.leads,
  holds: strings.interim.holds,
  takes: strings.interim.takes,
  tied: strings.interim.tied,
}

// Mouvement depuis la question précédente : triangles dessinés (les polices du design n'ont pas ▲ ni ▼).
function Movement({ movement }: { movement: number }) {
  if (movement === 0) return <span className="interim-move is-same" aria-label={strings.interim.moveSame}>=</span>
  const isUp = movement > 0
  return (
    <span className={isUp ? 'interim-move is-up' : 'interim-move is-down'} aria-label={(isUp ? strings.interim.moveUp : strings.interim.moveDown)(Math.abs(movement))}>
      <span className="interim-triangle" />
      {Math.abs(movement)}
    </span>
  )
}

function RankRow({ row, delay, streak }: { row: InterimRow; delay?: string; streak?: number }) {
  const score = row.player.score ?? 0
  const percent = (row.share * 100).toFixed(1)
  return (
    <li className="interim-row">
      <span className="interim-rank">{row.player.rank}</span>
      <span className="interim-name" style={nameScaleStyle(row.player.name)}>
        {row.player.name}
        {streak !== undefined && <StreakBadge streak={streak} delay={delay} />}
      </span>
      <span className="interim-track">
        {/* Les points restent lisibles sur une barre courte ; à 0 point, pas de barre. */}
        {score > 0 ? (
          <span className="interim-bar-box" style={{ width: `max(${percent}%, 5.5rem)` }}>
            <span className={`interim-bar rank-bar-${row.colorIndex}`} style={{ animationDelay: delay }} />
            <span className="interim-points">{strings.interim.points(score)}</span>
          </span>
        ) : (
          <span className="interim-points is-empty">{strings.interim.points(score)}</span>
        )}
      </span>
      {row.movement !== null && <Movement movement={row.movement} />}
    </li>
  )
}

interface InterimRankingBoardProps {
  session: PublicSession
  // Délais d'arrivée, de la première à la dernière place (mêmes instants que les sons).
  delays: readonly string[]
}

// Classement entre deux questions (maquette « 1er avec une couronne ») : le 1er sur sa carte, sans gain de points
// ; 2e à 5e sur une barre proportionnelle aux points ; au-delà, « et N autres ».
export function InterimRankingBoard({ session, delays }: InterimRankingBoardProps) {
  const { leader, rows, othersCount } = interimRanking(session)
  const streaks = rankingStreakBadges(session)
  const fitKey = `${Object.keys(session.players).length}|${rows.map((row) => row.player.name).join('|')}|${Object.keys(streaks).length}`
  const boardRef = useFitScale(fitKey, BOARD_FIT)
  if (!leader) return null
  return (
    <div className="interim-board" ref={boardRef}>
      <section className="interim-leader" style={{ animationDelay: delays[0] }}>
        <span className="interim-avatar">
          <span className="interim-crown-box">
            <Sparkle className="is-left" />
            <Crown />
            <Sparkle className="is-right" />
          </span>
          <span className="interim-avatar-glyph">
            <AvatarGlyph emoji={leader.player.avatar} />
          </span>
          {streaks[leader.id] !== undefined && (
            <span className="interim-leader-streak">
              <StreakBadge streak={streaks[leader.id]} delay={delays[0]} />
            </span>
          )}
        </span>
        <span className="interim-leader-texts">
          <span className="interim-leader-name" style={nameScaleStyle(leader.player.name)}>
            {leader.player.name}
          </span>
          <span className="interim-leader-status">{LEADER_TEXTS[leader.status]}</span>
        </span>
        <span className="interim-leader-score">{strings.interim.points(leader.player.score ?? 0)}</span>
      </section>
      {rows.length > 0 && (
        <ol className="interim-rows">
          {rows.map((row, index) => (
            <RankRow key={row.id} row={row} delay={delays[index + 1]} streak={streaks[row.id]} />
          ))}
        </ol>
      )}
      {othersCount > 0 && <p className="interim-others">{strings.interim.others(othersCount)}</p>}
      <ExtraStreaks session={session} delay={delays[0]} />
    </div>
  )
}
