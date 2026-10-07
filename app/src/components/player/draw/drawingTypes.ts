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
  // Chaque paquet produit, avec son numéro (clé dans la base ; démo : enregistré).
  onChunk?: (chunk: { seq: number; data: string }) => void
  // Paquets déjà envoyés pendant cette manche (page rechargée) : redessinés, l'écriture continue après.
  initialChunks?: readonly string[]
  ref?: React.Ref<DrawingCanvasHandle>
}
