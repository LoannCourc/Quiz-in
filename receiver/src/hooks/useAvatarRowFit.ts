import { useLayoutEffect, useState } from 'react'

// Rangée d'avatars de hauteur fixe (pendant la question) : la taille de chaque avatar est calculée pour
// que tous tiennent sur UNE ligne dans la largeur disponible, de 1 à 20 joueurs, sans jamais déborder ni
// passer à la ligne. Écrit --avatar-fit (px) sur la rangée ; le CSS garde le plus petit de cette taille
// et de la taille normale. Recalculé quand la rangée change de taille ou que le nombre d'avatars change.
export function useAvatarRowFit(count: number): (element: HTMLElement | null) => void {
  const [row, setRow] = useState<HTMLElement | null>(null)

  useLayoutEffect(() => {
    if (!row) return
    const fit = () => {
      const gap = parseFloat(getComputedStyle(row).columnGap) || 0
      const size = Math.floor((row.clientWidth - gap * Math.max(0, count - 1)) / Math.max(1, count))
      row.style.setProperty('--avatar-fit', `${Math.max(0, size)}px`)
    }
    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(row)
    return () => observer.disconnect()
  }, [row, count])

  return setRow
}
