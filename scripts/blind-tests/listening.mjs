// Feuilles d'écoute des blind tests de la refonte, avec la page Deezer et le lecteur d'extrait (widget Deezer : 30 s,
// sans compte ; les adresses d'extrait directes expirent après quelques heures, celles-ci non).
// - node scripts/blind-tests/listening.mjs : lot 1 (BT-8), docs/ecoute-impossible-bt8.md, titres « Impossible » du rap
//   « faces cachées » et des tests « Tous niveaux ».
// - node scripts/blind-tests/listening.mjs --lots : lots 2 à 4 (BT-9, BT-10, BT-11), docs/ecoute-lots-2-a-4.md : tous
//   les titres « Impossible », toutes les exceptions de niveau (niveau mesuré chez Deezer différent du niveau visé,
//   d'après .cache/report.json), et les pistes prises sur un EP de remix, avec un avertissement.
// La feuille des lots 2 à 4 n'est écrite qu'une fois (refus si elle existe) ; ensuite, un titre changé met à jour sa
// seule ligne : node scripts/blind-tests/listening.mjs --update <quizId> <questionId> (case de cette ligne remise à
// vide, puisque le titre est nouveau ; les autres lignes, leurs cases et leurs remarques ne sont pas touchées).
// La feuille du lot 1 est réécrite en entier : reporter ses cases cochées avant de la regénérer.
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { listQuizFiles } from '../../content/scripts/quizFiles.mjs'

const here = new URL('.', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')
const root = join(here, '..', '..')
const blindTests = listQuizFiles()
  .map((file) => JSON.parse(readFileSync(file.path, 'utf8')))
  .filter((quiz) => quiz.gameType === 'blindTest')
const checkOf = (quizId) => JSON.parse(readFileSync(join(root, 'content/music-check', `${quizId}.json`), 'utf8'))
const listen = (found) => `[écouter](https://widget.deezer.com/widget/dark/track/${found.id})`
const page = (found) => `[Deezer](${found.link})`

function lotOneSheet() {
  const tests = blindTests
    .filter((q) => q.id === 'rap-francais-impossible' || (q.level === 'mixed' && q.reviewStatus.includes('(lot BT-8)')))
    .sort((a, b) => (a.id === 'rap-francais-impossible' ? -1 : b.id === 'rap-francais-impossible' ? 1 : a.id.localeCompare(b.id)))
  const lines = [
    '# Feuille d\'écoute : titres « Impossible » du lot BT-8',
    '',
    'À écouter avant d\'ouvrir le blind test : vérifier que l\'extrait est bien le morceau annoncé (studio, ni reprise ni',
    'remix), que le niveau semble juste, et que les paroles des 30 premières secondes passent pour le public visé.',
    'Cocher une case, noter le problème éventuel ; je remplace ensuite les titres refusés.',
    '',
    'Extrait : lecteur Deezer (30 s, sans compte). Page : fiche du morceau chez Deezer.',
    '',
  ]
  for (const quiz of tests) {
    const check = checkOf(quiz.id)
    lines.push(`## ${quiz.title} (\`${quiz.id}\`)`, '', '| OK | Question | Artiste – titre | Extrait | Page | Remarque |', '|---|---|---|---|---|---|')
    for (const q of quiz.questions.filter((question) => question.difficulty === 4)) {
      const found = check.tracks.find((t) => t.questionId === q.id)?.found
      lines.push(`| [ ] | ${q.id} | ${q.options[q.correctIndex]}${found?.explicit ? ' (explicite)' : ''} | ${listen(found)} | ${page(found)} |  |`)
    }
    lines.push('')
  }
  writeFileSync(join(root, 'docs/ecoute-impossible-bt8.md'), `${lines.join('\n')}\n`)
  console.log(`docs/ecoute-impossible-bt8.md : ${tests.reduce((n, q) => n + q.questions.filter((x) => x.difficulty === 4).length, 0)} titres`)
}

const LOTS = [['BT-9', 'Lot 2'], ['BT-10', 'Lot 3'], ['BT-11', 'Lot 4']]
const LEVEL_NAMES = { F: 'Facile', M: 'Moyen', D: 'Difficile', I: 'Impossible' }
const DIFFICULTY_NAMES = { 1: 'Facile', 2: 'Moyen', 3: 'Difficile', 4: 'Impossible' }
const REMIX_EP = /remix/i
const REMIX_WARNING = '⚠ EP de remix : signaler si l\'extrait ressemble à un remix (intro allongée, autre rythme, voix retravaillée)'
const duration = (seconds) => (seconds ? `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}` : '—')

// Raisons d'écouter une question : titre « Impossible », exception de niveau, piste d'un EP de remix.
function reasonsFor(question, index, found, chosen) {
  const reasons = []
  if (question.difficulty === 4) reasons.push('Impossible')
  const measured = chosen?.[index]
  if (measured?.found && measured.level !== measured.target) reasons.push(`Exception : mesuré ${measured.level ? LEVEL_NAMES[measured.level] : 'non classé'}`)
  if (REMIX_EP.test(found?.album ?? '')) reasons.push('EP de remix')
  return reasons
}

const LOTS_SHEET = join(root, 'docs/ecoute-lots-2-a-4.md')
const readReport = () => {
  const reportPath = join(here, '.cache', 'report.json')
  return existsSync(reportPath) ? JSON.parse(readFileSync(reportPath, 'utf8')) : {}
}

// Ligne d'une question à écouter (null si elle n'a pas de raison d'y être).
function sheetRow(quiz, q, index, report) {
  const found = checkOf(quiz.id).tracks.find((t) => t.questionId === q.id)?.found
  const reasons = reasonsFor(q, index, found, report[quiz.id]?.chosen)
  if (reasons.length === 0) return null
  const remark = reasons.includes('EP de remix') ? REMIX_WARNING : ''
  return `| [ ] | ${q.id} | ${DIFFICULTY_NAMES[q.difficulty]} | ${reasons.join(' ; ')} | ${q.options[q.correctIndex]}${found?.explicit ? ' (explicite)' : ''} | ${found?.album ?? '—'} | ${duration(found?.durationS)} | ${listen(found)} | ${page(found)} | ${remark} |`
}

function lotsSheet() {
  if (existsSync(LOTS_SHEET)) throw new Error('docs/ecoute-lots-2-a-4.md existe déjà : utiliser --update <quizId> <questionId>')
  const report = readReport()
  const lines = [
    '# Feuille d\'écoute : lots 2 à 4 (BT-9, BT-10, BT-11)',
    '',
    'À écouter avant d\'ouvrir ces blind tests. Pour chaque ligne : l\'extrait est-il bien le morceau annoncé (studio, ni',
    'reprise ni remix) ? Le niveau semble-t-il juste ? Les paroles des 30 premières secondes passent-elles pour le public ?',
    'Cocher la case si tout va bien, sinon noter le problème dans « Remarque » ; je remplace ensuite les titres refusés',
    '(mode patch).',
    '',
    'Pourquoi la ligne est là : **Impossible** (tous les titres de difficulté 4) ; **Exception** (tests à thème : niveau',
    'mesuré chez Deezer différent du niveau visé, accepté pour ce test) ; **EP de remix** (seule édition trouvée chez',
    'Deezer, version d\'origine attendue : à confirmer à l\'oreille).',
    '',
    'Extrait : lecteur Deezer (30 s, sans compte). Page : fiche du morceau chez Deezer. Durée : celle de la piste entière',
    '(une version d\'origine plus longue que le single connu peut trahir une version longue ou un remix).',
    '',
  ]
  let total = 0
  for (const [lot, name] of LOTS) {
    const tests = blindTests.filter((q) => q.reviewStatus?.includes(`(lot ${lot})`)).sort((a, b) => a.id.localeCompare(b.id))
    lines.push(`## ${name} (\`${lot}\`)`, '')
    for (const quiz of tests) {
      const rows = quiz.questions.map((q, index) => sheetRow(quiz, q, index, report)).filter(Boolean)
      if (rows.length === 0) continue
      total += rows.length
      lines.push(`### ${quiz.title} (\`${quiz.id}\`)`, '', '| OK | Question | Niveau | Pourquoi | Artiste – titre | Album | Durée | Extrait | Page | Remarque |', '|---|---|---|---|---|---|---|---|---|---|', ...rows, '')
    }
  }
  writeFileSync(LOTS_SHEET, `${lines.join('\n')}\n`)
  console.log(`docs/ecoute-lots-2-a-4.md : ${total} titres`)
}

// Mise à jour d'une seule ligne de la feuille des lots 2 à 4 (titre changé) ; la question doit déjà y figurer.
function updateRow(quizId, questionId) {
  const quiz = blindTests.find((q) => q.id === quizId)
  const index = quiz?.questions.findIndex((q) => q.id === questionId) ?? -1
  if (index < 0) throw new Error(`question introuvable : ${quizId}/${questionId}`)
  const row = sheetRow(quiz, quiz.questions[index], index, readReport())
  const lines = readFileSync(LOTS_SHEET, 'utf8').split('\n')
  const at = lines.findIndex((line) => line.startsWith('| [') && line.split('|')[2]?.trim() === questionId)
  if (at < 0) throw new Error(`${questionId} absent de la feuille : à ajouter à la main dans la section de ${quizId}`)
  if (!row) throw new Error(`${questionId} n'a plus de raison d'être écouté : retirer la ligne à la main`)
  lines[at] = row
  writeFileSync(LOTS_SHEET, lines.join('\n'))
  console.log(`docs/ecoute-lots-2-a-4.md : ligne ${questionId} mise à jour (case à recocher après écoute)`)
}

// Sans option : feuille du lot 1 seulement si --lot1 est donné (évite de la réécrire par erreur).
const update = process.argv.indexOf('--update')
if (update >= 0) updateRow(process.argv[update + 1], process.argv[update + 2])
else if (process.argv.includes('--lots')) lotsSheet()
else if (process.argv.includes('--lot1')) lotOneSheet()
else throw new Error('option attendue : --update <quizId> <questionId>, --lots ou --lot1')
