import type { ReactNode } from 'react'

import './AnswerPills.css'

// Grille 2 × 2 de « La bonne réponse » (maquettes Quiz, Blind test, Bluff), mêmes places qu'à la question :
// A et B en haut, C et D en bas. Une pastille grandit avec son texte ; celles d'une même rangée ont la même
// hauteur. Bluff avec plus de 4 choix : autant de rangées que nécessaire, plus petites (is-dense).
export interface AnswerPill {
  key: string
  letter: string
  isCorrect: boolean
  // Joueurs qui ont choisi cette proposition, et leur part parmi ceux qui ont répondu (0 à 1).
  count: number
  share: number
  // Bluff : « Bluff de Lola », « La vraie réponse ».
  label?: string
  text: ReactNode
}

const DENSE_MIN_CHOICES = 5

interface AnswerPillsProps {
  pills: AnswerPill[]
  sizeClass?: string
}

export function AnswerPills({ pills, sizeClass = '' }: AnswerPillsProps) {
  const classes = ['answer-pills', sizeClass, pills.length >= DENSE_MIN_CHOICES && 'is-dense'].filter(Boolean).join(' ')
  return (
    <ol className={classes}>
      {pills.map((pill) => (
        <li key={pill.key} className={pill.isCorrect ? 'answer-pill is-correct' : 'answer-pill'}>
          {pill.share > 0 && (
            <span className="answer-gauge-box" style={{ width: `${(pill.share * 100).toFixed(1)}%` }}>
              <span className="answer-gauge" />
            </span>
          )}
          <span className="answer-letter">{pill.letter}</span>
          <span className="answer-texts">
            {pill.label && <span className="answer-label">{pill.label}</span>}
            {pill.text}
          </span>
          <span className="answer-count">{pill.count}</span>
        </li>
      ))}
    </ol>
  )
}

// Encadré sous la grille : l'explication, jamais vide.
export function AnswerExplanation({ text }: { text: string | undefined }) {
  const trimmed = text?.trim()
  return trimmed ? <p className="answer-explanation">{trimmed}</p> : null
}
