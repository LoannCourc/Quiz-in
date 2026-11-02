// Fichiers sources des quiz : content/quizzes/<dossier>/<id>.json, un dossier par type de jeu (quiz/, bluff/,
// blind-test/). Le nom du fichier reste l'id du quiz (clé dans la base) ; seul le dossier dit le type. Partagé par le
// build et les scripts de content/scripts (TypeScript) et ceux de scripts/blind-tests (JavaScript).
import { existsSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

export const quizzesRoot = join(dirname(fileURLToPath(import.meta.url)), '..', 'quizzes')

// Dossier de chaque type de jeu (gameType absent : quiz classique).
export const GAME_TYPE_DIRS = { quiz: 'quiz', bluff: 'bluff', blindTest: 'blind-test' }

export function gameTypeDir(gameType) {
  return join(quizzesRoot, GAME_TYPE_DIRS[gameType ?? 'quiz'])
}

// Tous les fichiers de quiz, triés par nom de fichier (ordre indépendant des dossiers : le build produit les mêmes
// fichiers d'import). Les fichiers encore à la racine de content/quizzes/ sont lus aussi ; le build les refuse.
export function listQuizFiles() {
  const files = []
  const add = (dir, folder) => {
    for (const fileName of readdirSync(dir)) {
      if (fileName.endsWith('.json')) files.push({ fileName, folder, path: join(dir, fileName) })
    }
  }
  add(quizzesRoot, null)
  for (const folder of Object.values(GAME_TYPE_DIRS)) {
    const dir = join(quizzesRoot, folder)
    if (existsSync(dir)) add(dir, folder)
  }
  return files.sort((a, b) => (a.fileName < b.fileName ? -1 : a.fileName > b.fileName ? 1 : 0))
}

// Chemin du fichier d'un quiz d'après son id, quel que soit son dossier ; null s'il n'existe pas.
export function quizPath(id) {
  return listQuizFiles().find((file) => file.fileName === `${id}.json`)?.path ?? null
}
