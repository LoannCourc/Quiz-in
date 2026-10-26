import type { Difficulty } from '@shared/types'

import { strings } from '../strings'
import './DifficultyBadge.css'

const DIFFICULTY_LEVELS: Difficulty[] = [1, 2, 3]

// Points pleins jusqu'au niveau, puis cerclés : dessinés en CSS (les polices du design n'ont ni ● ni ○).
export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span className={`difficulty difficulty-${difficulty}`}>
      <span className="difficulty-dots" aria-hidden="true">
        {DIFFICULTY_LEVELS.map((level) => (
          <span key={level} className={level <= difficulty ? 'difficulty-dot is-full' : 'difficulty-dot'} />
        ))}
      </span>
      {strings.difficulty[difficulty]}
    </span>
  )
}
