import type { PublicSession } from '@shared/types'

import { Confetti } from '../components/Confetti'
import { Podium } from '../components/Podium'
import { RankingList } from '../components/RankingList'
import { TeamPodium } from '../components/TeamBoards'
import { sortByRank } from '../lib/players'
import { teamEndTitle } from '../lib/teamTitles'
import { strings } from '../strings'
import './EndScreen.css'

const PODIUM_SIZE = 3
// Au-delà, les lignes suivant le podium passent sur deux colonnes pour tenir à l'écran.
const SINGLE_COLUMN_MAX_ROWS = 6

export function EndScreen({ session }: { session: PublicSession }) {
  const players = sortByRank(session.players)
  const others = players.slice(PODIUM_SIZE)

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
