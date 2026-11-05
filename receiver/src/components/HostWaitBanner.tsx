import { hostWaitBannerAt } from '@shared/gameFlow'
import type { PublicSession } from '@shared/types'
import { useEffect, useState } from 'react'

import { estimateServerNow, useServerTimeOffset } from '../lib/serverTime'
import { strings } from '../strings'
import './HostWaitBanner.css'

interface HostWaitBannerProps {
  session: PublicSession
  // Début de l'attente, si elle ne commence pas avec la phase (Bluff : la vraie réponse montrée).
  waitStartedAt?: number
}

// Pas à pas : bandeau en bas de l'écran après HOST_WAIT_BANNER_DELAY_MS sans action de l'hôte. La place est
// toujours réservée en bas des écrans concernés : il ne recouvre rien et rien ne bouge quand il apparaît. Une
// phase suivante change l'heure attendue (ou démonte l'écran) : il disparaît aussitôt.
export function HostWaitBanner({ session, waitStartedAt }: HostWaitBannerProps) {
  const offsetMs = useServerTimeOffset()
  const showAt = hostWaitBannerAt(session, waitStartedAt)
  const [shownFor, setShownFor] = useState<number | null>(null)

  useEffect(() => {
    if (showAt === null) return
    const timer = window.setTimeout(() => setShownFor(showAt), Math.max(0, showAt - estimateServerNow(offsetMs)))
    return () => window.clearTimeout(timer)
  }, [showAt, offsetMs])

  if (showAt === null || shownFor !== showAt) return null
  return (
    <aside className="host-wait-banner" role="status">
      <span className="host-wait-sweep" />
      <svg className="host-wait-clock" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6.5V12l3.5 2.2" />
      </svg>
      <span className="host-wait-message">{strings.hostWait.message}</span>
    </aside>
  )
}
