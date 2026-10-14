// Blind test en choix multiples : chaque proposition est « Titre – Artiste » (tiret demi-cadratin entouré
// d'espaces), affichée titre en gros et artiste en plus petit dessous, sur le téléphone et la TV. Le
// séparateur est réservé aux blind tests (le build le refuse dans les autres quiz).
export const TRACK_OPTION_SEPARATOR = ' – '

export interface TrackOptionParts {
  title: string
  // null : proposition sans artiste (quiz classique).
  artist: string | null
}

// Coupe au dernier séparateur : un titre peut en contenir un (« Ballade – version courte »), jamais un artiste.
export function trackOptionParts(option: string): TrackOptionParts {
  const at = option.lastIndexOf(TRACK_OPTION_SEPARATOR)
  if (at <= 0) return { title: option, artist: null }
  return { title: option.slice(0, at), artist: option.slice(at + TRACK_OPTION_SEPARATOR.length) }
}

// Ce que demande une question de blind test en Réponse libre, dans sa proposition : le titre, l'artiste,
// ou la proposition entière (« les deux »).
export function trackOptionAnswer(option: string, ask: 'title' | 'artist' | 'both'): string {
  const { title, artist } = trackOptionParts(option)
  if (artist === null || ask === 'both') return option
  return ask === 'title' ? title : artist
}
