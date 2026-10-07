// Outils du dessinateur (Dessine-moi) : communs au canvas du navigateur et à son remplaçant dans l'app.
export type DrawTool = 'pen' | 'eraser' | 'bucket'

export interface DrawingCanvasHandle {
  undo(): void
  clear(): void
}

export interface DrawingCanvasProps {
  tool: DrawTool
  color: number
  width: number
  // Chaque paquet produit (prototype : enregistré ; plus tard : envoyé dans la base).
  onChunk?: (data: string) => void
  ref?: React.Ref<DrawingCanvasHandle>
}
