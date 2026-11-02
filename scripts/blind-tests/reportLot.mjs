// Rapport d'un lot de la refonte (docs/blind-tests-lot-<n>.md), écrit au fur et à mesure : une section par test,
// remplacée si elle existe, à partir de .cache/report.json (generate.mjs). Les autres sections ne sont pas relues.
// Usage (depuis la racine) : node scripts/blind-tests/reportLot.mjs <n> <testId>… ; --summary : résumé dans la console.
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { quizPath } from '../../content/scripts/quizFiles.mjs'
import { TESTS } from './catalogue.mjs'

const here = new URL('.', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')
const root = join(here, '..', '..')
const [lotNumber, ...rest] = process.argv.slice(2)
const ids = rest.filter((arg) => !arg.startsWith('--'))
const summary = rest.includes('--summary')
const target = join(root, 'docs', `blind-tests-lot-${lotNumber}.md`)
const report = JSON.parse(readFileSync(join(here, '.cache', 'report.json'), 'utf8'))
const LEVEL_NAMES = { F: 'Facile', M: 'Moyen', D: 'Difficile', I: 'Impossible' }
const fmt = (n) => (n === null || n === undefined ? '—' : String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '))
const START = (id) => `<!-- test:${id} -->`
const END = (id) => `<!-- /test:${id} -->`

function section(test) {
  const data = report[test.id]
  const written = Boolean(quizPath(test.id))
  const lines = [START(test.id), `## ${test.title} (\`${test.id}\`)`, '', `level \`${test.level}\` · decade \`${test.decade}\`${test.era ? ` (époque ${test.era.join('–')})` : ''} · genre \`${test.genre}\``, '']
  if (!data) return [...lines, 'Pas encore généré.', '', END(test.id)]
  lines.push(written && !data.incomplete ? '**Écrit**, non figé.' : '**Non écrit** : places sans morceau ou leurres manquants (détail ci-dessous).', '')
  lines.push('| n° | Niveau visé | Artiste – titre | nb_fan | Position | rank | Extrait | Origine |', '|---|---|---|---|---|---|---|---|')
  const rows = data.questions.length ? data.questions : data.chosen.map((c, index) => ({ ...c, id: index, artist: c.deezerArtist ?? '—', title: c.deezerTitle ?? c.origin }))
  for (const [index, q] of rows.entries()) {
    const measured = data.chosen?.[index]?.level
    const exception = data.chosen?.[index]?.found && measured !== q.target ? ` (exception : mesuré ${measured ? LEVEL_NAMES[measured] : 'non classé'})` : ''
    lines.push(`| ${index + 1} | ${LEVEL_NAMES[q.target]}${exception} | ${q.artist} – ${q.title}${q.explicit ? ' (explicite)' : ''} | ${fmt(q.nbFan)} | ${q.position ?? '—'} | ${fmt(q.rank)} | ${q.preview ? 'oui' : q.found === false ? '—' : 'non'} | ${q.origin} |`)
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
  const missing = data.chosen.map((c, index) => ({ c, index })).filter(({ c }) => !c.found)
  if (missing.length) {
    lines.push('**Places sans morceau**', '')
    for (const { index } of missing) {
      const reasons = data.rejected.filter((x) => x.slot === index + 1).map((x) => `${x.artist} – ${x.title} : ${x.reason.replace(/^réserve : /, 'réserve, ')}`)
      lines.push(`- n° ${index + 1} : aucun remplaçant du même niveau${reasons.length ? ` (${reasons.join(' ; ')})` : ''}`)
    }
    lines.push('')
  }
  const rejected = data.rejected.filter((x) => x.reason.startsWith('réserve'))
  if (rejected.length) {
    lines.push('**Titres écartés (réserves)**', '')
    for (const x of rejected) lines.push(`- ${x.artist} – ${x.title} : ${x.reason.replace(/^réserve : /, '')}`)
    lines.push('')
  }
  if (data.questions.length) {
    lines.push('<details><summary>Leurres</summary>', '')
    for (const q of data.questions) lines.push(`- ${q.id} : ${q.decoys.map((d) => `${d.artist} – ${d.title}`).join(' ; ')}${q.decoys.length < 3 ? ` (**${q.decoys.length} seulement**)` : ''}`)
    lines.push('', '</details>', '')
  }
  return [...lines, END(test.id)]
}

let text = existsSync(target)
  ? readFileSync(target, 'utf8')
  : `# Blind tests : lot ${lotNumber}\n\nMesures Deezer : fans de l'artiste (\`nb_fan\`), position du morceau chez l'artiste (la meilleure entre le top Deezer et le classement par rang), rang de la piste (\`rank\`). Seuils : \`scripts/blind-tests/thresholds.json\` (calibrés au lot 1, plafond de 100 000 fans en Impossible).\n\n`
for (const id of ids) {
  const test = TESTS.find((t) => t.id === id)
  if (!test) throw new Error(`test inconnu : ${id}`)
  const block = section(test).join('\n')
  const start = text.indexOf(START(id))
  text = start === -1 ? `${text.trimEnd()}\n\n${block}\n` : `${text.slice(0, start)}${block}${text.slice(text.indexOf(END(id)) + END(id).length)}`
  if (summary) console.log(block.replace(/<details>[\s\S]*<\/details>/, '').replace(/<!--.*-->/g, '').trim())
}
writeFileSync(target, text)
console.log(`${target} : ${ids.join(', ')}`)
