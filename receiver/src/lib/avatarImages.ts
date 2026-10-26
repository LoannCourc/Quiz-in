import { AVATARS } from '@shared/avatars'

// Image d'un avatar (public/avatars/, Noto Emoji) : la TV ne compte pas sur une police emoji, absente de
// certaines TV (pastille blanche vide). null pour un emoji hors de la liste (affiché en texte).
export function avatarImageUrl(emoji: string): string | null {
  if (!(AVATARS as readonly string[]).includes(emoji)) return null
  const codepoints = [...emoji].map((char) => char.codePointAt(0)!.toString(16)).join('_')
  return `${import.meta.env.BASE_URL}avatars/${codepoints}.svg`
}

// Images gardées en mémoire : le cache du navigateur les garde décodées pour le premier affichage.
const preloaded: HTMLImageElement[] = []

// Charge les 24 images avant le premier affichage (pas de pastille vide au salon). Une image en échec ne
// bloque rien : AvatarGlyph affiche alors l'emoji en texte.
export function preloadAvatarImages(): Promise<void> {
  const loads = AVATARS.map((emoji) => {
    const image = new Image()
    preloaded.push(image)
    return new Promise<void>((resolve) => {
      image.onload = () => resolve()
      image.onerror = () => resolve()
      image.src = avatarImageUrl(emoji)!
    })
  })
  return Promise.all(loads).then(() => undefined)
}
