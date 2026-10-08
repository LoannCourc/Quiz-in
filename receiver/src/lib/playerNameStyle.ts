import { playerNameScale } from '@shared/playerName'
import type { CSSProperties } from 'react'

// Pseudo sur une seule ligne (shared/playerName.ts) : la taille de police de l'élément est multipliée par
// --name-scale (réduite selon la longueur), puis « … » s'il ne tient toujours pas.
export function nameScaleStyle(name: string): CSSProperties {
  return { '--name-scale': String(playerNameScale(name)) } as CSSProperties
}
