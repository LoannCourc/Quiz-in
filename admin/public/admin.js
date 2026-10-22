// Page privée des statistiques (docs/statistiques.md) : connexion e-mail et mot de passe, lecture de /stats
// (autorisée par les règles aux seuls comptes de admins/{uid}), affichage. SDK Firebase figé, servi par gstatic.
import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js'
import { connectAuthEmulator, getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js'
import { connectDatabaseEmulator, get, getDatabase, ref } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js'

import {
  dailyTrend,
  DEFAULT_MIN_ANSWERS,
  dropOff,
  formatRate,
  MODE_LABELS,
  modeRows,
  playerHistogram,
  questionRanking,
  quizIdsToName,
  topGames,
  totals,
} from './statsView.js'

// Aperçu local (npm run serve dans admin/) : émulateurs Database et Auth du projet fictif des tests, jamais la
// base réelle. En ligne : configuration du projet servie par Firebase Hosting (/__/firebase/init.json).
const IS_LOCAL = ['localhost', '127.0.0.1'].includes(location.hostname)
const EMULATOR_PROJECT = 'demo-quiz-in'
const EMULATOR_CONFIG = {
  apiKey: 'demo-key',
  authDomain: `${EMULATOR_PROJECT}.firebaseapp.com`,
  projectId: EMULATOR_PROJECT,
  databaseURL: `http://127.0.0.1:9000?ns=${EMULATOR_PROJECT}-default-rtdb`,
}

const $ = (id) => document.getElementById(id)
const SCREENS = ['loading', 'login', 'denied', 'failure', 'dashboard']

function show(screen) {
  for (const id of SCREENS) $(id).hidden = id !== screen
}

function el(tag, className, text) {
  const node = document.createElement(tag)
  if (className) node.className = className
  if (text !== undefined) node.textContent = text
  return node
}

const number = new Intl.NumberFormat('fr-FR')

async function firebaseConfig() {
  if (IS_LOCAL) return EMULATOR_CONFIG
  const response = await fetch('/__/firebase/init.json')
  if (!response.ok) throw new Error(`Configuration Firebase introuvable (${response.status})`)
  return response.json()
}

const app = initializeApp(await firebaseConfig())
const auth = getAuth(app)
const db = getDatabase(app)
if (IS_LOCAL) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
  connectDatabaseEmulator(db, '127.0.0.1', 9000)
  $('emulator-banner').hidden = false
}

// État de la page : statistiques lues, titres et textes des questions.
let stats = null
let titles = {}
let questionTexts = {}

function isDenied(error) {
  return /permission[_ ]denied/i.test(String(error?.message ?? error))
}

async function readTitles(quizIds) {
  const entries = await Promise.all(
    quizIds.map(async (id) => {
      const snapshot = await get(ref(db, `quizzes/${id}/title`)).catch(() => null)
      return [id, typeof snapshot?.val() === 'string' ? snapshot.val() : id]
    }),
  )
  return Object.fromEntries(entries)
}

// Textes des questions classées : un seul quiz lu à la fois, seulement ceux des classements.
async function readQuestionTexts(rows) {
  const quizIds = [...new Set(rows.map((row) => row.quizId))]
  const texts = {}
  await Promise.all(
    quizIds.map(async (quizId) => {
      const snapshot = await get(ref(db, `questions/${quizId}`)).catch(() => null)
      for (const question of Object.values(snapshot?.val() ?? {})) {
        if (question && typeof question.id === 'string' && typeof question.text === 'string') texts[`${quizId}/${question.id}`] = question.text
      }
    }),
  )
  return texts
}

async function load() {
  show('loading')
  try {
    stats = (await get(ref(db, 'stats'))).val() ?? {}
  } catch (error) {
    if (isDenied(error)) {
      show('denied')
    } else {
      $('failure-text').textContent = `La base n'a pas répondu (${error?.message ?? error}).`
      show('failure')
    }
    return
  }
  titles = await readTitles(quizIdsToName(stats))
  questionTexts = {}
  $('updated').textContent = `Lu le ${new Date().toLocaleString('fr-FR')}`
  render()
  show('dashboard')
}

// Ligne : libellé, valeur à droite, barre proportionnelle à share (0 à 1).
function barRow(label, value, share, tone = '') {
  const row = el('div')
  const head = el('div', 'row-head')
  head.append(el('b', '', label), el('span', '', value))
  const bar = el('div', `bar ${tone}`.trim())
  const fill = el('span')
  fill.style.width = `${Math.round(Math.max(0, Math.min(1, share ?? 0)) * 100)}%`
  bar.append(fill)
  row.append(head, bar)
  return row
}

function fill(id, nodes, emptyText = 'Pas encore de données.') {
  const container = $(id)
  container.replaceChildren(...(nodes.length > 0 ? nodes : [el('p', 'muted', emptyText)]))
}

function games(started, completed, rateValue) {
  return `${number.format(started)} démarrées · ${number.format(completed)} terminées (${formatRate(rateValue)})`
}

function renderKpis() {
  const total = totals(stats)
  const kpi = (value, label) => {
    const card = el('div', 'kpi')
    card.append(el('strong', '', value), el('span', '', label))
    return card
  }
  $('kpis').replaceChildren(
    kpi(number.format(total.started), 'parties démarrées'),
    kpi(number.format(total.completed), 'parties terminées'),
    kpi(formatRate(total.rate), 'taux de parties terminées'),
  )
  $('empty').hidden = total.started > 0
}

function renderRanked(id, rows) {
  const max = Math.max(1, ...rows.map((row) => row.started))
  fill(id, rows.map((row) => barRow(row.label, games(row.started, row.completed, row.rate), row.started / max)))
}

function renderDropOffSelect() {
  const select = $('dropoff-mode')
  const current = select.value
  const modes = modeRows(stats).filter((row) => row.started > 0)
  select.replaceChildren(...(modes.length > 0 ? modes : Object.keys(MODE_LABELS).map((id) => ({ id, label: MODE_LABELS[id] }))).map((row) => {
    const option = el('option', '', row.label)
    option.value = row.id
    return option
  }))
  if ([...select.options].some((option) => option.value === current)) select.value = current
}

function renderDropOff() {
  const mode = $('dropoff-mode').value
  const unit = mode === 'draw' ? 'Manche' : 'Question'
  fill(
    'dropoff',
    dropOff(stats, mode).map((point) => {
      const after = point.abandoned === null ? '' : ` · ${number.format(point.abandoned)} abandon${point.abandoned > 1 ? 's' : ''} ensuite`
      return barRow(`${unit} ${point.index + 1}`, `${number.format(point.games)} (${formatRate(point.share)})${after}`, point.share, 'cyan')
    }),
  )
}

function renderPlayers() {
  fill('players', playerHistogram(stats).map((row) => barRow(`${row.players} joueur${row.players > 1 ? 's' : ''}`, `${number.format(row.games)} (${formatRate(row.share)})`, row.share, 'green')))
}

function questionItem(row) {
  const item = el('li')
  const text = questionTexts[`${row.quizId}/${row.questionId}`] ?? row.questionId
  item.append(el('span', 'rate', `${formatRate(row.rate)} `), document.createTextNode(text))
  item.append(el('span', 'meta', `${titles[row.quizId] ?? row.quizId} · ${row.questionId} · ${number.format(row.correct)} bonnes sur ${number.format(row.answered)}`))
  return item
}

async function renderQuestions() {
  const minAnswers = Math.max(1, Math.round(Number($('min-answers').value) || DEFAULT_MIN_ANSWERS))
  const ranking = questionRanking(stats, minAnswers)
  const missing = [...ranking.hardest, ...ranking.easiest].filter((row) => !(`${row.quizId}/${row.questionId}` in questionTexts))
  if (missing.length > 0) Object.assign(questionTexts, await readQuestionTexts(missing))
  $('questions-count').textContent = `${number.format(ranking.counted)} question${ranking.counted > 1 ? 's' : ''} avec au moins ${minAnswers} réponse${minAnswers > 1 ? 's' : ''} (part de bonnes réponses).`
  if (Number($('min-answers').value) !== minAnswers) $('min-answers').value = String(minAnswers)
  fill('hardest', ranking.hardest.map(questionItem), 'Aucune question n’a encore assez de réponses.')
  fill('easiest', ranking.easiest.map(questionItem), 'Aucune question n’a encore assez de réponses.')
}

function renderDaily() {
  const days = dailyTrend(stats, Date.now())
  const max = Math.max(1, ...days.map((day) => day.started))
  $('daily').replaceChildren(
    ...days.map((day) => {
      const column = el('div', 'day')
      column.title = `${day.day} : ${day.started} démarrées, ${day.completed} terminées`
      const started = el('span', 'started')
      started.style.height = `${(day.started / max) * 100}%`
      const completed = el('span', 'completed')
      completed.style.height = `${(day.completed / max) * 100}%`
      column.append(started, completed)
      return column
    }),
  )
  const label = (day) => day.slice(8, 10) + '/' + day.slice(5, 7)
  $('daily-axis').replaceChildren(el('span', '', label(days[0].day)), el('span', '', label(days[days.length - 1].day)))
}

function render() {
  renderKpis()
  renderRanked('modes', modeRows(stats))
  renderRanked('games', topGames(stats, titles))
  renderDropOffSelect()
  renderDropOff()
  renderPlayers()
  void renderQuestions()
  renderDaily()
}

function loginMessage(error) {
  const code = String(error?.code ?? '')
  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found' || code === 'auth/invalid-email') return 'E-mail ou mot de passe incorrect.'
  if (code === 'auth/too-many-requests') return 'Trop d’essais. Réessaie dans quelques minutes.'
  if (code === 'auth/network-request-failed') return 'Pas de connexion. Vérifie ton réseau.'
  return `Connexion impossible (${code || error?.message || error}).`
}

$('login-form').addEventListener('submit', async (event) => {
  event.preventDefault()
  const form = new FormData(event.currentTarget)
  const button = $('login-button')
  $('login-error').hidden = true
  button.disabled = true
  try {
    await signInWithEmailAndPassword(auth, String(form.get('email')).trim(), String(form.get('password')))
  } catch (error) {
    $('login-error').textContent = loginMessage(error)
    $('login-error').hidden = false
  } finally {
    button.disabled = false
  }
})

$('sign-out').addEventListener('click', () => void signOut(auth))
$('refresh').addEventListener('click', () => void load())
$('retry').addEventListener('click', () => void load())
$('dropoff-mode').addEventListener('change', renderDropOff)
$('min-answers').addEventListener('change', () => void renderQuestions())

onAuthStateChanged(auth, (user) => {
  $('account').hidden = !user
  $('account-email').textContent = user?.email ?? ''
  stats = null
  if (user) void load()
  else show('login')
})
