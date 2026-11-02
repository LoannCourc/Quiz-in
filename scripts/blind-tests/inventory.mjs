// Inventaire des blind tests existants (content/quizzes/**/*.json, gameType blindTest) → docs/blind-tests-avant-refonte.md.
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { listQuizFiles } from '../../content/scripts/quizFiles.mjs'

const root = new URL('../../', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')
const quizzes = listQuizFiles().map((file) => JSON.parse(readFileSync(file.path, 'utf8')))
const blind = quizzes.filter((q) => q.gameType === 'blindTest').sort((a, b) => a.id.localeCompare(b.id))
const music = quizzes.filter((q) => q.theme === 'Musique' && q.gameType !== 'blindTest')
const lines = ['# Blind tests avant la refonte', '', `Inventaire du ${new Date().toISOString().slice(0, 10)} : ${blind.length} blind tests, ${blind.reduce((n, q) => n + q.questions.length, 0)} questions.`, '']
lines.push('## Résumé', '', '| id | titre | level | decade | genre | audience | questions | difficultés (1/2/3/4) |', '|---|---|---|---|---|---|---|---|')
const dist = (q) => [1, 2, 3, 4].map((d) => q.questions.filter((x) => x.difficulty === d).length).join(' / ')
for (const q of blind) lines.push(`| ${q.id} | ${q.title} | ${q.level ?? '—'} | ${q.decade} | ${q.genre} | ${q.audience} | ${q.questions.length} | ${dist(q)} |`)
lines.push('', '## Quiz de thème « Musique » conservés (pas des blind tests)', '')
for (const q of music) lines.push(`- \`${q.id}\` (${q.gameType ?? 'quiz'}) : ${q.title}, ids ${q.questions[0].id} à ${q.questions.at(-1).id}`)
lines.push('', '## Morceaux de chaque blind test', '')
for (const q of blind) {
  lines.push(`### ${q.id} : ${q.title}`, '', `level ${q.level ?? '—'} · decade ${q.decade} · genre ${q.genre} · audience ${q.audience} · ${q.reviewStatus ?? ''}`, '')
  for (const x of q.questions) lines.push(`${x.id}. ${x.music.artist} – ${x.music.title} (difficulté ${x.difficulty})`)
  lines.push('')
}
writeFileSync(join(root, 'docs/blind-tests-avant-refonte.md'), lines.join('\n'))
console.log(lines.slice(4, 4 + blind.length + 3).join('\n'))
