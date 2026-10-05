import { podiumEntryMs } from '@shared/rankingTimeline'
import { SUSPENSE_DRUMROLL_MS } from '@shared/sound'
import type { PublicSession } from '@shared/types'
import { useEffect, useState } from 'react'

import { Confetti } from '../components/Confetti'
import { Podium } from '../components/Podium'
import { RankingList } from '../components/RankingList'
import { TeamPodium } from '../components/TeamBoards'
import { useEntryDelay } from '../hooks/useEntryDelay'
import { sortByRank } from '../lib/players'
import { estimateServerNow, useServerTimeOffset } from '../lib/serverTime'
import { teamEndTitle } from '../lib/teamTitles'
import { strings } from '../strings'
import './EndScreen.css'

const PODIUM_SIZE = 3
// Au-delà, les lignes suivant le podium passent sur deux colonnes pour tenir à l'écran.
const SINGLE_COLUMN_MAX_ROWS = 6

// Vrai une fois passé delayMs après startedAt (heure du serveur) : un seul minuteur, pas de
// rafraîchissement continu sur la box. Après un rechargement de la TV, le délai déjà écoulé compte.
function useDelayPassed(startedAt: number, delayMs: number): boolean {
  const offsetMs = useServerTimeOffset()
  // Phase dont le délai est passé (startedAt), lue une fois à l'affichage, puis par le minuteur.
  const [passedFor, setPassedFor] = useState<number | null>(() =>
    estimateServerNow(offsetMs) >= startedAt + delayMs ? startedAt : null,
  )
  useEffect(() => {
    const remainingMs = startedAt + delayMs - estimateServerNow(offsetMs)
    const timer = setTimeout(() => setPassedFor(startedAt), Math.max(0, remainingMs))
    return () => clearTimeout(timer)
  }, [startedAt, delayMs, offsetMs])
  return delayMs <= 0 || passedFor === startedAt
}

// Fin de partie. Suspense : « Et le grand gagnant est… » pendant le roulement de tambour (spec 17),
// puis le podium (même durée que le son, SUSPENSE_DRUMROLL_MS).
export function EndScreen({ session }: { session: PublicSession }) {
  const podiumStartMs = session.settings.suspense === true ? SUSPENSE_DRUMROLL_MS : 0
  const isDrumrollOver = useDelayPassed(session.phaseStartedAt, podiumStartMs)

  if (!isDrumrollOver) {
    return (
      <main className="screen end end-suspense">
        <h1 className="hero-title end-suspense-title">{session.settings.teams ? strings.end.suspenseTeams : strings.end.suspense}</h1>
      </main>
    )
  }
  return <EndPodium session={session} podiumStartMs={podiumStartMs} />
}

// Podium final : le 3e, le 2e, puis le 1er arrivent l'un après l'autre (PODIUM_ENTRY_STEP_MS d'écart),
// chacun avec son son ; le reste du classement est déjà là, les confettis partent avec le 1er. Monté
// après le roulement en Suspense.
function EndPodium({ session, podiumStartMs }: { session: PublicSession; podiumStartMs: number }) {
  const entryDelay = useEntryDelay(session.phaseStartedAt)
  const delays = [0, 1, 2].map((place) => entryDelay(podiumEntryMs(place, podiumStartMs)))
  // Confettis à l'arrivée du 1er, avec le tada.
  const isFirstIn = useDelayPassed(session.phaseStartedAt, podiumEntryMs(0, podiumStartMs))
  const players = sortByRank(session.players)
  const others = players.slice(PODIUM_SIZE)

  // Groupe : podium des équipes, puis les meilleurs joueurs (maquette G3).
  if (session.settings.teams) {
    return (
      <main className="screen end">
        {isFirstIn && <Confetti />}
        <h1 className="hero-title end-team-title">{teamEndTitle(session)}</h1>
        <TeamPodium session={session} delays={delays} />
      </main>
    )
  }

  return (
    <main className="screen end">
      {isFirstIn && <Confetti />}
      <h1 className="hero-title">{strings.end.title}</h1>
      <div className="end-body">
        <Podium players={players.slice(0, PODIUM_SIZE)} delays={delays} />
        <RankingList players={others} columns={others.length > SINGLE_COLUMN_MAX_ROWS ? 2 : 1} />
      </div>
    </main>
  )
}
