// Marqueurs de texte à finir ([À COMPLÉTER], [À VÉRIFIER], [TO FILL IN], [TO CHECK], [DATE …]) :
// listés par npm run check ; le build refuse d'en publier si le site est indexable.

const MARKER = /\[(?:À COMPLÉTER|À VÉRIFIER|TO FILL IN|TO CHECK|DATE)[^\]]*\]/g

// Parcourt un fichier de langue : [{ key: 'legal.privacy.sections.3.p', marker: '[À VÉRIFIER : …]' }].
export function findMarkers(value, key = '') {
  if (typeof value === 'string') {
    return [...value.matchAll(MARKER)].map((match) => ({ key, marker: match[0] }))
  }
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([childKey, child]) => findMarkers(child, key ? `${key}.${childKey}` : childKey))
  }
  return []
}
