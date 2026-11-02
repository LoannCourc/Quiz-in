// Rapport de la refonte (étape 6) : docs/blind-tests-apres-refonte.md, à partir de .cache/report.json (generate.mjs).
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { TESTS } from './catalogue.mjs'
import { THRESHOLDS } from './levels.mjs'

const here = new URL('.', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')
const root = join(here, '..', '..')
const frozen = JSON.parse(readFileSync(join(root, 'content', 'frozen-blind-tests.json'), 'utf8'))
const FROZEN = new Set(Object.keys(frozen.hashes))
const FROZEN_AT = frozen.frozenAt
const report = JSON.parse(readFileSync(join(here, '.cache', 'report.json'), 'utf8'))
const LEVEL_NAMES = { F: 'Facile', M: 'Moyen', D: 'Difficile', I: 'Impossible' }
const fmt = (n) => (n === null || n === undefined ? '—' : String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '))

const lines = [
  '# Blind tests après la refonte (lot BT-8)',
  '',
  `Généré le ${new Date().toISOString().slice(0, 10)} par \`scripts/blind-tests/generate.mjs\` et \`report.mjs\`. Mesures Deezer : fans de l'artiste (\`nb_fan\`), position du morceau chez l'artiste (la meilleure entre le top Deezer et le classement par rang), rang de la piste (\`rank\`).`,
  '',
  '## Seuils (calibrés sur les 12 références rap français)',
  '',
  `- Connu : ${fmt(THRESHOLDS.knownMinFans)} fans ou plus.`,
  `- Facile : position ≤ ${THRESHOLDS.easyMaxPosition}, et artiste connu ou rang ≥ ${fmt(THRESHOLDS.easyMinRankAnyArtist)}.`,
  `- Moyen : artiste connu, position ≥ ${THRESHOLDS.mediumMinPosition}.`,
  `- Difficile : artiste moins connu, rang ≥ ${fmt(THRESHOLDS.hardMinRank)} ou position ≤ ${THRESHOLDS.hardMaxPosition}.`,
  `- Impossible : artiste moins connu, rang < ${fmt(THRESHOLDS.impossibleMaxRank)} et position ≥ ${THRESHOLDS.impossibleMinPosition}.`,
  '',
]

for (const test of TESTS) {
  const data = report[test.id]
  if (!data) continue
  lines.push(`## ${test.title} (\`${test.id}\`)`, '', `level \`${test.level}\` · decade \`${test.decade}\` · genre \`${test.genre}\``, '')
  lines.push(FROZEN.has(test.id) ? `**Figé le ${FROZEN_AT[test.id]}** (content/frozen-blind-tests.json : le build refuse tout changement).` : '**Non figé** : en attente de validation.', '')
  lines.push('| n° | Niveau visé | Artiste – titre | nb_fan | Position | Rang | Extrait | Origine |', '|---|---|---|---|---|---|---|---|')
  for (const [index, q] of data.questions.entries()) {
    const measured = data.chosen?.[index]?.level
    const exception = measured !== undefined && measured !== q.target ? ` (exception : mesuré ${measured ? LEVEL_NAMES[measured] : 'non classé'})` : ''
    lines.push(`| ${index + 1} | ${LEVEL_NAMES[q.target]}${exception} | ${q.artist} – ${q.title}${q.explicit ? ' (explicite)' : ''} | ${fmt(q.nbFan)} | ${q.position} | ${fmt(q.rank)} | ${q.preview ? 'oui' : 'non'} | ${q.origin} |`)
  }
  lines.push('')
  if (data.replacements.length) {
    lines.push('**Remplacements**', '')
    for (const r of data.replacements) {
      const why = data.rejected.find((x) => x.slot === r.slot && !x.reason.startsWith('réserve'))
      lines.push(`- n° ${r.slot} : ${r.replaced ?? '(à découvrir)'} → ${r.by} (${r.origin})${why ? ` ; écarté : ${why.reason}` : ''}`)
    }
    lines.push('')
  }
  const rejectedReserves = data.rejected.filter((x) => x.reason.startsWith('réserve'))
  if (rejectedReserves.length) {
    lines.push('**Réserves écartées**', '')
    for (const x of rejectedReserves) lines.push(`- ${x.artist} – ${x.title} : ${x.reason.replace(/^réserve : /, '')}`)
    lines.push('')
  }
  lines.push('<details><summary>Leurres</summary>', '')
  for (const q of data.questions) lines.push(`- ${q.id} : ${q.decoys.map((d) => `${d.artist} – ${d.title}`).join(' ; ')}`)
  lines.push('', '</details>', '')
}

writeFileSync(join(root, 'docs', 'blind-tests-apres-refonte.md'), `${lines.join('\n')}\n`)
console.log('docs/blind-tests-apres-refonte.md écrit')
