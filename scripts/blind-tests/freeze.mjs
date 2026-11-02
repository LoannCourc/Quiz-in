// Fige des blind tests validés : écrit leur empreinte dans content/frozen-blind-tests.json. npm run build refuse
// ensuite tout changement de leur fichier source ou de leurs morceaux vérifiés (music-check), et generate.mjs ne les
// réécrit plus. Usage (depuis la racine) : node scripts/blind-tests/freeze.mjs <quizId>… (ou --all-blind-tests) ;
// --unfreeze <quizId>… retire l'empreinte (le test redevient modifiable et regénérable).
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

import { frozenHash } from '../../content/scripts/frozenHash.mjs'
import { listQuizFiles, quizPath } from '../../content/scripts/quizFiles.mjs'

const root = join(new URL('.', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'), '..', '..')
const target = join(root, 'content/frozen-blind-tests.json')
const args = process.argv.slice(2)
const ids = args.includes('--all-blind-tests')
  ? listQuizFiles().filter((file) => JSON.parse(readFileSync(file.path, 'utf8')).gameType === 'blindTest').map((file) => file.fileName.replace('.json', ''))
  : args
const frozen = existsSync(target) ? JSON.parse(readFileSync(target, 'utf8')) : { frozenAt: {}, hashes: {} }
const today = new Date().toISOString().slice(0, 10)
if (args[0] === '--unfreeze') {
  for (const id of args.slice(1)) {
    delete frozen.hashes[id]
    delete frozen.frozenAt[id]
    console.log(`dégelé : ${id}`)
  }
  writeFileSync(target, `${JSON.stringify(frozen, null, 2)}
`)
  process.exit(0)
}
for (const id of ids) {
  const quiz = JSON.parse(readFileSync(quizPath(id), 'utf8'))
  const check = JSON.parse(readFileSync(join(root, 'content/music-check', `${id}.json`), 'utf8'))
  frozen.hashes[id] = frozenHash(quiz, check)
  frozen.frozenAt[id] = frozen.frozenAt[id] ?? today
  console.log(`figé : ${id}`)
}
writeFileSync(target, `${JSON.stringify(frozen, null, 2)}\n`)
