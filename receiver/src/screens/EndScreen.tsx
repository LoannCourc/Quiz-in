import { SUSPENSE_DRUMROLL_MS } from '@shared/sound'
import type { PublicSession } from '@shared/types'
import { useEffect, useState } from 'react'

import { Confetti } from '../components/Confetti'
import { Podium } from '../components/Podium'
import { RankingList } from '../components/RankingList'
import { TeamPodium } from '../components/TeamBoards'
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
  const isSuspense = session.settings.suspense === true
  const isDrumrollOver = useDelayPassed(session.phaseStartedAt, isSuspense ? SUSPENSE_DRUMROLL_MS : 0)
  const players = sortByRank(session.players)
  const others = players.slice(PODIUM_SIZE)

  if (!isDrumrollOver) {
    return (
      <main className="screen end end-suspense">
        <h1 className="hero-title end-suspense-title">{session.settings.teams ? strings.end.suspenseTeams : strings.end.suspense}</h1>
      </main>
    )
  }

  // Groupe : podium des équipes, puis les meilleurs joueurs (maquette G3).
  if (session.settings.teams) {
    return (
      <main className="screen end">
        <Confetti />
        <h1 className="hero-title end-team-title">{teamEndTitle(session)}</h1>
        <TeamPodium session={session} />
      </main>
    )
  }

  return (
    <main className="screen end">
      <Confetti />
      <h1 className="hero-title">{strings.end.title}</h1>
      <div className="end-body">
        <Podium players={players.slice(0, PODIUM_SIZE)} />
        <RankingList players={others} columns={others.length > SINGLE_COLUMN_MAX_ROWS ? 2 : 1} />
      </div>
    </main>
  )
}
