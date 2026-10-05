import { teamRanking } from '@shared/teams'
import type { PublicSession } from '@shared/types'

import { strings } from '../strings'

// Titre de fin en Groupe : l'équipe gagnante, ou l'égalité.
export function teamEndTitle(session: PublicSession): string {
  const winners = teamRanking(session).filter((row) => row.rank === 1)
  return winners.length === 1 ? strings.teams.winner(strings.teams.names[winners[0].team]) : strings.teams.tie
}
