import type { Player } from '@shared/types'

import './Avatar.css'
import { nameScaleStyle } from '../lib/playerNameStyle'

interface AvatarProps {
  player: Player
  // Pendant la question : allumé si le joueur a répondu, sinon atténué.
  state?: 'normal' | 'lit' | 'dimmed'
  showName?: boolean
}

export function Avatar({ player, state = 'normal', showName = true }: AvatarProps) {
  const isDimmed = state === 'dimmed' || !player.connected
  const className = ['avatar', state === 'lit' && 'is-lit', isDimmed && 'is-dimmed']
    .filter(Boolean)
    .join(' ')

  return (
    <div className={className}>
      <span className="avatar-emoji">{player.avatar}</span>
      {showName && (
        <span className="avatar-name" style={nameScaleStyle(player.name)}>
          {player.name}
        </span>
      )}
    </div>
  )
}
