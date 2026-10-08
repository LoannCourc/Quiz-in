import { Logo } from '../components/Logo'
import './StatusScreen.css'

interface StatusScreenProps {
  title: string
  hint?: string
  // Détail technique discret, utile pour le débogage.
  detail?: string
  isLoading?: boolean
  // Résultats d'un diagnostic, une ligne chacun (test du son).
  lines?: readonly string[]
}

// Écran de message, sous le logo : attente du Cast, chargement, partie introuvable, erreur.
export function StatusScreen({ title, hint, detail, isLoading = false, lines }: StatusScreenProps) {
  return (
    <main className="screen status">
      <Logo size="medium" />
      {isLoading && <span className="status-spinner" aria-hidden="true" />}
      <h1 className="status-title">{title}</h1>
      {hint && <p className="status-hint">{hint}</p>}
      {lines && lines.length > 0 && (
        <ul className="status-lines">
          {lines.map((line, index) => (
            <li key={index}>{line}</li>
          ))}
        </ul>
      )}
      {detail && <p className="status-detail">{detail}</p>}
    </main>
  )
}
