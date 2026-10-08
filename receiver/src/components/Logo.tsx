import { strings } from '../strings'
import './Logo.css'

export type LogoSize = 'small' | 'medium' | 'large'

// Logo L5 : QUIZ'IN en Bowlby One, face or, relief rose vers le bas, contour encre (ombres dures, sans flou).
// La taille vient de la classe : small (en-tête des écrans de partie), medium, large (salon, pages d'attente).
// className : taille ajustée par l'écran (salon dense).
export function Logo({ size, as: Tag = 'span', className = '' }: { size: LogoSize; as?: 'span' | 'h1'; className?: string }) {
  return <Tag className={`logo logo-${size} ${className}`.trim()}>{strings.appName}</Tag>
}
