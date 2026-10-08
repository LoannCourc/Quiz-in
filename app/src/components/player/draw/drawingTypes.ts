import type { Viewport } from '@shared/drawing/viewport'

// Outils du dessinateur (Dessine-moi) : communs au canvas du navigateur et à celui de l'app.
export type DrawTool = 'pen' | 'eraser' | 'bucket'

export interface DrawingCanvasHandle {
  undo(): void
  clear(): void
  // Zoom (plan 5, livraison C) : boutons − / + et « ajuster ». Absents : canvas sans zoom (app, étape 3).
  zoomBy?(direction: 1 | -1): void
  fit?(): void
}

export interface DrawingCanvasProps {
  tool: DrawTool
  color: number
  width: number
  // Chaque paquet produit, avec son numéro (clé dans la base ; démo : enregistré).
  onChunk?: (chunk: { seq: number; data: string }) => void
  // Paquets déjà envoyés pendant cette manche (page rechargée) : redessinés, l'écriture continue après.
  initialChunks?: readonly string[]
  // Zoom : la vue après chaque changement (pincement fini, bouton) ; affichage seulement.
  onViewportChange?: (view: Viewport) => void
  ref?: React.Ref<DrawingCanvasHandle>
}
