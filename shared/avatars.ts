// Avatars proposés aux joueurs (spec 6.6) : emojis simples, sans combinaison de caractères,
// pour un rendu identique sur tous les téléphones et sur la TV.
export const AVATARS = [
  '🦊', '🐼', '🦉', '🐻', '🐱', '🐶', '🐸', '🐵',
  '🐯', '🦁', '🐨', '🐰', '🐷', '🐮', '🐔', '🐧',
  '🐙', '🦄', '🐢', '🐝', '🦋', '🐳', '🦖', '👽',
] as const

export type AvatarEmoji = (typeof AVATARS)[number]
