// Remplit la base d'un projet Firebase de TEST avec le contenu généré (content/import) et ouvre le blind test dans ce
// projet seulement (config/blindTestV2Enabled = true). Refuse le projet de production. Utilise la CLI Firebase déjà
// connectée (firebase login). Usage (depuis la racine) :
//   node scripts/test-project/seed.mjs <idDuProjetDeTest>            → affiche les commandes, n'exécute rien
//   node scripts/test-project/seed.mjs <idDuProjetDeTest> --execute  → exécute les trois écritures
// Procédure complète : docs/test-hors-production.md.
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const PRODUCTION_PROJECT = 'quiz-in-7dbd6'
const root = join(new URL('.', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'), '..', '..')
const [project, flag] = process.argv.slice(2)

if (!project) throw new Error('id du projet de test attendu : node scripts/test-project/seed.mjs <idDuProjetDeTest>')
if (project === PRODUCTION_PROJECT || project === 'default') throw new Error(`refusé : ${project} est le projet de production`)
for (const file of ['quizzes.json', 'questions.json']) {
  if (!existsSync(join(root, 'content/import', file))) throw new Error(`content/import/${file} absent : lancer npm run build dans content/`)
}
const blindTests = Object.values(JSON.parse(readFileSync(join(root, 'content/import/quizzes.json'), 'utf8'))).filter((quiz) => quiz.gameType === 'blindTest').length

// Chaque écriture vise un seul nœud du projet de test, jamais la racine.
const commands = [
  ['database:set', '/quizzes', 'content/import/quizzes.json', '--project', project, '--force'],
  ['database:set', '/questions', 'content/import/questions.json', '--project', project, '--force'],
  ['database:set', '/config/blindTestV2Enabled', '--data', 'true', '--project', project, '--force'],
]

console.log(`Projet de test : ${project} (blind tests dans content/import : ${blindTests})`)
for (const args of commands) console.log(`  firebase ${args.join(' ')}`)
if (flag !== '--execute') {
  console.log('Rien n’a été exécuté. Relancer avec --execute pour écrire dans le projet de test.')
  process.exit(0)
}
for (const args of commands) execFileSync('firebase', args, { cwd: root, stdio: 'inherit', shell: process.platform === 'win32' })
console.log('Projet de test rempli.')
