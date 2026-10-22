// Données de démonstration pour la page des statistiques : ÉMULATEURS SEULEMENT (npm run demo-data).
// Adresses des émulateurs et projet fictif « demo-quiz-in » écrits en dur : aucune option, aucune variable
// d'environnement ni aucun identifiant ne peut faire écrire ce script ailleurs que sur 127.0.0.1. Les
// émulateurs refusent d'ailleurs tout projet réel (préfixe « demo- »).
// Crée deux comptes (admin et non admin), la liste admins/{uid}, /stats, et des quiz avec leurs questions (le
// catalogue généré content/import/ s'il existe, sinon trois quiz fictifs).
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const PROJECT = 'demo-quiz-in'
// Espace de noms de la base par défaut : le seul où l'émulateur applique database.rules.json.
const NAMESPACE = `${PROJECT}-default-rtdb`
const DATABASE = 'http://127.0.0.1:9000'
const AUTH = 'http://127.0.0.1:9099'
const ADMIN = { email: 'admin@demo.test', password: 'demo-admin-123' }
const VISITOR = { email: 'visiteur@demo.test', password: 'demo-visiteur-123' }
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')

if (!PROJECT.startsWith('demo-') || !DATABASE.startsWith('http://127.0.0.1:') || !AUTH.startsWith('http://127.0.0.1:')) {
  throw new Error('Ce script ne vise que les émulateurs locaux du projet fictif.')
}

// Écriture dans l'émulateur Database, règles ignorées (jeton « owner » propre à l'émulateur).
async function put(path, value) {
  const response = await fetch(`${DATABASE}/${path}.json?ns=${NAMESPACE}`, {
    method: 'PUT',
    headers: { Authorization: 'Bearer owner', 'Content-Type': 'application/json' },
    body: JSON.stringify(value),
  })
  if (!response.ok) throw new Error(`Écriture de /${path} refusée par l'émulateur (${response.status}).`)
}

// Compte de l'émulateur Auth (créé s'il n'existe pas) ; renvoie son uid.
async function account({ email, password }) {
  const call = (action) =>
    fetch(`${AUTH}/identitytoolkit.googleapis.com/v1/accounts:${action}?key=demo-key`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    }).then((response) => response.json())
  const created = await call('signUp')
  const result = created.localId ? created : await call('signInWithPassword')
  if (!result.localId) throw new Error(`Compte ${email} impossible à créer : ${JSON.stringify(result.error ?? result)}`)
  return result.localId
}

function catalog() {
  const quizzesFile = join(ROOT, 'content', 'import', 'quizzes.json')
  const questionsFile = join(ROOT, 'content', 'import', 'questions.json')
  if (existsSync(quizzesFile) && existsSync(questionsFile)) {
    const quizzes = JSON.parse(readFileSync(quizzesFile, 'utf8'))
    const questions = JSON.parse(readFileSync(questionsFile, 'utf8'))
    const ids = Object.keys(quizzes).filter((id) => quizzes[id].gameType !== 'blindTest')
    return { source: 'content/import', quizzes, questions, ids }
  }
  const quizzes = {}
  const questions = {}
  for (const [id, title, prefix] of [['demo-histoire', 'Histoire de France', 'hi'], ['demo-animaux', 'Les animaux', 'an'], ['demo-bluff', 'Bluff : records', 'bl']]) {
    quizzes[id] = { title }
    questions[id] = Array.from({ length: 10 }, (_, i) => ({ id: `${prefix}-${String(i + 1).padStart(2, '0')}`, text: `${title}, question ${i + 1} ?` }))
  }
  return { source: 'quiz fictifs', quizzes, questions, ids: Object.keys(quizzes) }
}

// Hasard reproductible : mêmes données à chaque lancement.
let seed = 42
function random() {
  seed = (seed * 1_103_515_245 + 12_345) % 2 ** 31
  return seed / 2 ** 31
}
const between = (min, max) => min + Math.floor(random() * (max - min + 1))

function demoStats({ ids, questions }) {
  const stats = { modes: {}, quizzes: {}, pools: {}, playerCounts: {}, questions: {}, daily: {} }
  const modes = { quiz: [180, 10], bluff: [60, 10], draw: [45, 8] }
  for (const [mode, [started, length]] of Object.entries(modes)) {
    const reached = []
    let games = started
    for (let i = 0; i < length; i++) {
      games = Math.max(0, games - between(0, Math.ceil(started * 0.04)))
      reached.push(games)
    }
    stats.modes[mode] = { started, completed: Math.round(games * 0.97), reached }
  }
  for (const id of ids.slice(0, 15)) {
    const started = between(2, 40)
    stats.quizzes[id] = { started, completed: Math.round(started * (0.7 + random() * 0.3)) }
  }
  stats.pools = { themes: { started: 52, completed: 47 }, mix: { started: 21, completed: 18 } }
  for (const [players, games] of [[2, 30], [3, 64], [4, 88], [5, 51], [6, 30], [7, 12], [8, 7], [10, 2], [12, 1]]) stats.playerCounts[players] = games
  for (const id of ids.slice(0, 15)) {
    for (const question of (questions[id] ?? []).slice(0, 10)) {
      const answered = between(5, 120)
      stats.questions[id] ??= {}
      stats.questions[id][question.id] = { answered, correct: Math.round(answered * random()) }
    }
  }
  const today = Date.now()
  for (let day = 0; day < 45; day++) {
    const date = new Date(today - day * 86_400_000).toISOString().slice(0, 10)
    const started = between(0, 14) + (new Date(today - day * 86_400_000).getUTCDay() >= 5 ? 8 : 0)
    stats.daily[date] = { started, completed: Math.round(started * 0.85) }
  }
  return stats
}

try {
  const adminUid = await account(ADMIN)
  await account(VISITOR)
  const data = catalog()
  await put('quizzes', data.quizzes)
  await put('questions', data.questions)
  await put('admins', { [adminUid]: true })
  await put('stats', demoStats(data))
  console.log(`Données de démonstration écrites dans l'émulateur (${data.source}).`)
  console.log(`Compte admin : ${ADMIN.email} / ${ADMIN.password}`)
  console.log(`Compte sans accès : ${VISITOR.email} / ${VISITOR.password}`)
} catch (error) {
  console.error(error instanceof TypeError ? 'Émulateurs injoignables : lance d’abord « firebase emulators:start --only database,auth --project demo-quiz-in ».' : error.message)
  process.exit(1)
}
