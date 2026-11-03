import { keepAwakeDeadline } from '@shared/keepAwake'
import type { PublicSession } from '@shared/types'
import { useEffect, useState } from 'react'

import { startKeepAwake, stopKeepAwake } from '../lib/keepAwake'
import { estimateServerNow } from '../lib/serverTime'

// TV maintenue éveillée pendant la partie et 15 min sur l'écran de fin (shared/keepAwake.ts) ; coupée
// sans partie (session null).
export function useKeepAwake(session: PublicSession | null, serverOffsetMs: number): void {
  const deadline = session && keepAwakeDeadline(session)
  // Échéance de l'écran de fin passée (minuteur ci-dessous) : la box peut se mettre en veille.
  const [expiredDeadline, setExpiredDeadline] = useState<number | null>(null)
  const isActive = session !== null && (deadline === null || deadline !== expiredDeadline)

  useEffect(() => {
    if (deadline === null) return
    const delayMs = Math.max(0, deadline - estimateServerNow(serverOffsetMs))
    const timeoutId = setTimeout(() => setExpiredDeadline(deadline), delayMs)
    return () => clearTimeout(timeoutId)
  }, [deadline, serverOffsetMs])

  useEffect(() => {
    if (!isActive) return
    startKeepAwake()
    return stopKeepAwake
  }, [isActive])
}
