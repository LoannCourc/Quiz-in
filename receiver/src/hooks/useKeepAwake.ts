import { useEffect } from 'react'

import { startKeepAwake, stopKeepAwake } from '../lib/keepAwake'

// TV maintenue éveillée tant que isActive est vrai (partie en cours), coupée sinon.
export function useKeepAwake(isActive: boolean): void {
  useEffect(() => {
    if (!isActive) return
    startKeepAwake()
    return stopKeepAwake
  }, [isActive])
}
