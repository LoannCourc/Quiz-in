import { describe, expect, test } from 'vitest'

import { BLUFF_REVEAL_WINDOW, bluffChoicesLayout, bluffRevealLayout, estimatedHeight } from '../../shared/bluffLayout'

const SHORT = 'Monopolis'
const LONG = 'x'.repeat(100)

function choices(count: number, text: string): string[] {
  return Array.from({ length: count }, () => text)
}

describe('Bluff : mise en page des choix sur la TV', () => {
  test('choix courts de la maquette B4 : deux colonnes, texte le plus grand', () => {
    expect(bluffChoicesLayout(choices(6, SHORT))).toEqual({ columns: 2, size: 'xl', crowded: false })
  })

  test('deux ou trois phrases longues : une colonne', () => {
    expect(bluffChoicesLayout(choices(3, LONG)).columns).toBe(1)
    expect(bluffChoicesLayout(choices(4, LONG)).columns).toBe(2)
  })

  test('plus il y a de phrases longues, plus le texte est petit, jusqu’à l’écran serré', () => {
    const sizes = [4, 6, 10, 14, 21].map((count) => bluffChoicesLayout(choices(count, LONG)).size)
    const order = ['xl', 'l', 'm', 's', 'xs']
    for (let index = 1; index < sizes.length; index++) {
      expect(order.indexOf(sizes[index])).toBeGreaterThanOrEqual(order.indexOf(sizes[index - 1]))
    }
    expect(bluffChoicesLayout(choices(21, LONG))).toEqual({ columns: 2, size: 'xs', crowded: true })
  })

  test('vote : jusqu’à 21 phrases de 100 caractères tiennent dans la hauteur disponible', () => {
    for (const count of [2, 3, 4, 6, 10, 14, 21]) {
      const layout = bluffChoicesLayout(choices(count, LONG))
      expect(estimatedHeight(choices(count, LONG), layout.columns, layout.size, 'vote')).toBeLessThanOrEqual(layout.crowded ? 22 : 15.5)
    }
  })

  test('révélation : la fenêtre de choix affichés tient, quel que soit le nombre de choix', () => {
    for (const count of [2, 4, 6, 10, 21]) {
      const layout = bluffRevealLayout(choices(count, LONG))
      const shown = choices(Math.min(count, BLUFF_REVEAL_WINDOW), LONG)
      expect(estimatedHeight(shown, layout.columns, layout.size, 'reveal')).toBeLessThanOrEqual(layout.crowded ? 18.5 : 15)
    }
  })

  test('une seule taille pour tous : celle qu’exige la plus longue', () => {
    expect(bluffChoicesLayout([SHORT, SHORT, LONG])).toEqual(bluffChoicesLayout([LONG, LONG, LONG]))
  })
})
