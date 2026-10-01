import './StatusScreen.css'

interface StatusScreenProps {
  title: string
  hint?: string
  // Détail technique discret, utile pour le débogage.
  detail?: string
  isLoading?: boolean
}

// Écran de message : chargement, partie introuvable, erreur.
export function StatusScreen({ title, hint, detail, isLoading = false }: StatusScreenProps) {
  return (
    <main className="screen status">
      {isLoading && <span className="status-spinner" aria-hidden="true" />}
      <h1 className="status-title">{title}</h1>
      {hint && <p className="status-hint">{hint}</p>}
      {detail && <p className="status-detail">{detail}</p>}
    </main>
  )
}
