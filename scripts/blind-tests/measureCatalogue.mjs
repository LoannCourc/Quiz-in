// Mesure et niveau de tous les candidats et réserves du catalogue (sortie : .cache/catalogue-measures.json).
import { writeFileSync } from 'node:fs'
import { TESTS } from './catalogue.mjs'
import { measure } from './deezer.mjs'
import { measuredLevel } from './levels.mjs'

const out = {}
for (const test of TESTS) {
  out[test.id] = []
  for (const [kind, list] of [['candidat', test.candidates], ['réserve', test.reserves]]) {
    for (const [target, artist, title] of list) {
      const m = await measure(artist, title)
      const level = m.found ? measuredLevel(m) : null
      out[test.id].push({ kind, target, ...m, level })
      const mark = m.found ? (level === target ? 'OK' : `✗ ${level ?? '—'}`) : '✗ introuvable'
      console.log(`${test.id} | ${kind} | ${target} | ${artist} – ${title} | ${m.nbFan ?? ''} | ${m.position ?? ''} | ${m.rank ?? ''} | ${m.explicit ? 'explicite' : ''} | ${mark}`)
    }
  }
}
writeFileSync('.cache/catalogue-measures.json', JSON.stringify(out, null, 2))
