// Tailles de police calculées (texte ajusté à une largeur mesurée) : toujours une taille utilisable.
// Android refuse une taille négative ou nulle et plante (« FontSize should be a positive value ») : une largeur
// pas encore mesurée (0 au premier rendu), négative après soustraction des marges, ou NaN, donnait -19.

// Plus petite taille raisonnable d'un texte ajusté (ou la taille de départ si elle est plus petite).
export const MIN_FITTED_FONT_SIZE = 12

// Taille bornée entre le minimum et la taille de départ ; valeur impossible (NaN, infini) : la taille de départ.
export function boundedFontSize(size: number, base: number, min = MIN_FITTED_FONT_SIZE): number {
  const floor = Math.min(min, base)
  if (!Number.isFinite(size)) return base
  return Math.max(floor, Math.min(base, size))
}

// Taille qui fait tenir charCount caractères (largeur moyenne charRatio × taille) dans available pixels, entre
// le minimum et base. Largeur inconnue (0, négative, NaN) ou texte vide : la taille de départ.
export function fittedFontSize(base: number, available: number, charCount: number, charRatio: number, min = MIN_FITTED_FONT_SIZE): number {
  if (!Number.isFinite(available) || available <= 0 || !(charCount > 0) || !(charRatio > 0)) return base
  return boundedFontSize(Math.floor(available / (charCount * charRatio)), base, min)
}
