import type { BluffChoicesLayout } from '@shared/bluffLayout'
import type { Player, PlayerId, RevealedBluffChoice } from '@shared/types'

import { strings } from '../strings'
import './BluffChoices.css'

// Lettre d'un choix : A, B, C… (jusqu'à 21 choix : 20 joueurs et la vraie réponse).
function bluffLetter(index: number): string {
  return String.fromCharCode(65 + index)
}

function layoutClass({ columns, size }: BluffChoicesLayout): string {
  return `bluff-choices bluff-columns-${columns} bluff-size-${size}`
}

// Vote (maquette B4) : les choix, sans auteur ni type ; une ou deux colonnes et une seule taille de
// texte pour tous (bluffChoicesLayout), selon leur nombre et la plus longue phrase.
export function BluffVoteChoices({ choices, layout }: { choices: readonly string[]; layout: BluffChoicesLayout }) {
  return (
    <ol className={layoutClass(layout)}>
      {choices.map((text, index) => (
        <li key={index} className="bluff-choice">
          <span className="bluff-letter">{bluffLetter(index)}</span>
          <span className="bluff-text">{text}</span>
        </li>
      ))}
    </ol>
  )
}

// Votants affichés au plus sur une ligne, puis « +N ».
const MAX_VOTER_AVATARS = 6

function Voters({ voters, players }: { voters: PlayerId[]; players: Record<PlayerId, Player> }) {
  if (voters.length === 0) return <span className="bluff-no-vote">{strings.bluff.noVote}</span>
  const shown = voters.slice(0, MAX_VOTER_AVATARS)
  return (
    <span className="bluff-voters">
      {shown.map((id) => (
        <span key={id} className="bluff-voter">
          {players[id]?.avatar}
        </span>
      ))}
      {voters.length > shown.length && <span className="bluff-more">{strings.bluff.moreVoters(voters.length - shown.length)}</span>}
    </span>
  )
}

function ChoiceTag({ choice, players }: { choice: RevealedBluffChoice; players: Record<PlayerId, Player> }) {
  if (choice.kind === 'truth') return <span className="bluff-tag is-truth">{strings.bluff.truthTag}</span>
  if (choice.kind === 'decoy') return <span className="bluff-tag">{strings.bluff.decoyTag}</span>
  const names = (choice.authors ?? []).map((id) => players[id]?.name).filter((name) => name !== undefined)
  return <span className="bluff-author">{strings.bluff.writtenBy(strings.bluff.names(names))}</span>
}

export interface RevealRow {
  // Position du choix au vote (sa lettre).
  index: number
  choice: RevealedBluffChoice
}

// Révélation (maquette B5) : chaque choix avec sa lettre, son auteur ou « Leurre », et ses votants.
interface BluffRevealRowsProps {
  rows: RevealRow[]
  // Même mise en page pendant toute la révélation (bluffRevealLayout) : rien ne saute.
  layout: BluffChoicesLayout
  players: Record<PlayerId, Player>
}

export function BluffRevealRows({ rows, layout, players }: BluffRevealRowsProps) {
  return (
    <ol className={`${layoutClass(layout)} bluff-reveal-rows`}>
      {rows.map(({ index, choice }) => (
        <li key={index} className={choice.kind === 'truth' ? 'bluff-choice bluff-row is-truth' : 'bluff-choice bluff-row'}>
          <span className="bluff-letter">{bluffLetter(index)}</span>
          <span className="bluff-row-main">
            <span className="bluff-text">{choice.text}</span>
            <ChoiceTag choice={choice} players={players} />
          </span>
          <Voters voters={choice.voters ?? []} players={players} />
        </li>
      ))}
    </ol>
  )
}
