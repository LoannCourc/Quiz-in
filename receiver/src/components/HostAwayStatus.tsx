import { abandonedGameDeletableAt, formatMinutesSeconds } from '@shared/hostAbsence'
import type { PublicSession } from '@shared/types'

import { useRemainingMs } from '../hooks/useRemainingMs'
import { StatusScreen } from '../screens/StatusScreen'
import { strings } from '../strings'

// Pendant l'absence de l'hôte (coupure) : un seul message, et le temps avant suppression.
export function HostAwayStatus({ session }: { session: PublicSession }) {
  const remainingMs = useRemainingMs(abandonedGameDeletableAt(session) ?? 0)
  return (
    <StatusScreen
      title={strings.hostAway.title}
      hint={`${strings.hostAway.message} ${strings.hostAway.deletionIn(formatMinutesSeconds(remainingMs))}`}
    />
  )
}
