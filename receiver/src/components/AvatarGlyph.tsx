import { useState } from 'react'

import { avatarImageUrl } from '../lib/avatarImages'
import './AvatarGlyph.css'

// Avatar d'un joueur à la taille du texte (1 em, comme l'emoji qu'il remplace) : image Noto Emoji, ou l'emoji
// en texte si l'image manque ou ne charge pas.
export function AvatarGlyph({ emoji }: { emoji: string }) {
  const url = avatarImageUrl(emoji)
  const [failed, setFailed] = useState(false)
  if (!url || failed) return <>{emoji}</>
  return <img className="avatar-glyph" src={url} alt={emoji} draggable={false} onError={() => setFailed(true)} />
}
