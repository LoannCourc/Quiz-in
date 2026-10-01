import type { Difficulty } from '@shared/types'

import { strings } from '../strings'
import './DifficultyBadge.css'

const DIFFICULTY_LEVELS: Difficulty[] = [1, 2, 3]

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span className={`difficulty difficulty-${difficulty}`}>
      <span className="difficulty-dots" aria-hidden="true">
        {DIFFICULTY_LEVELS.map((level) => (level <= difficulty ? '●' : '○')).join('')}
      </span>
      {strings.difficulty[difficulty]}
    </span>
  )
}
