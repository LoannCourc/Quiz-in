// Faux joueurs pour mesurer la TV à 8 ou 20 joueurs (plan de fiabilité, docs/plan-fiabilite-tv.md).
// Usage (depuis receiver/, partie créée par l'app de l'hôte et encore dans le salon) :
//   npm run fake-players -- CODE [nombre, défaut 19]
// Chaque faux joueur est un vrai utilisateur anonyme (receiver/.env) : il rejoint le salon, reste
// connecté, puis répond à chaque question comme un téléphone (choix au hasard, réponse libre, Bluff :
// proposition puis vote), à un moment au hasard du temps de réponse. Rejouer : ils restent.
// Ctrl+C : ils se déconnectent (la partie les voit hors ligne).
// Limite de Firebase : environ 100 nouveaux comptes anonymes par heure et par adresse IP.
// Essai local : FAKE_PLAYERS_EMULATOR=1 vise les émulateurs (firebase emulators:start, Auth 9099,
// Database 9000) au lieu du vrai projet.
import { initializeApp, setLogLevel } from 'firebase/app'
import { connectAuthEmulator, getAuth, signInAnonymously } from 'firebase/auth'
import { connectDatabaseEmulator, get, getDatabase, onDisconnect, onValue, ref, serverTimestamp, set, update } from 'firebase/database'

const MAX_PLAYERS = 20
const AVATARS = ['🤖', '👾', '🦾', '🛸', '🚀', '🧠', '🎛️', '📡', '🔋', '💾', '🕹️', '🎲', '🧩', '🔧', '⚙️', '🛰️', '🔭', '💡', '🧲', '📟']
const FREE_ANSWERS = ['Paris', 'Je ne sais pas', 'Victor Hugo', 'Les Beatles', 'Madonna', '1789', 'Napoléon']
// Moment de la réponse : entre 1 s et 70 % du temps restant.
const MIN_DELAY_MS = 1_000
const ANSWER_SHARE = 0.7
// Les champs d'une transition arrivent un par un : on attend qu'ils soient tous là avant d'agir.
const SETTLE_MS = 300
const isEmulator = process.env.FAKE_PLAYERS_EMULATOR === '1'

const config = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.VITE_FIREBASE_DATABASE_URL,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
}

const code = (process.argv[2] ?? '').toUpperCase()
const count = Math.min(MAX_PLAYERS, Math.max(1, Number(process.argv[3] ?? 19)))
if (!/^[A-Z0-9]{4}$/.test(code)) {
  console.error('Usage : npm run fake-players -- CODE [nombre]')
  process.exit(1)
}
if (!config.apiKey || !config.databaseURL) {
  console.error('Configuration Firebase absente : lancer depuis receiver/ avec receiver/.env rempli.')
  process.exit(1)
}

// Les refus attendus (vote sur sa propre proposition, réponse trop tardive) ne sont pas des erreurs.
setLogLevel('error')

const randomInt = (max) => Math.floor(Math.random() * max)
const pick = (list) => list[randomInt(list.length)]
const label = (index) => `Robot ${String(index + 1).padStart(2, '0')}`

async function createPlayer(index) {
  const app = initializeApp(config, `fake-${index}`)
  const auth = getAuth(app)
  const db = getDatabase(app)
  if (isEmulator) {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
    connectDatabaseEmulator(db, '127.0.0.1', 9000)
  }
  const { user } = await signInAnonymously(auth)
  return { index, uid: user.uid, db, name: label(index) }
}

async function join(player, settings) {
  const playerPath = `sessions/${code}/players/${player.uid}`
  await update(ref(player.db, playerPath), { name: player.name, avatar: AVATARS[player.index % AVATARS.length], connected: true })
  // Présence comme un téléphone : connected = false écrit par le serveur si la connexion tombe.
  onValue(ref(player.db, '.info/connected'), (snapshot) => {
    if (snapshot.val() !== true) return
    const connectedRef = ref(player.db, `${playerPath}/connected`)
    onDisconnect(connectedRef)
      .set(false)
      .then(() => set(connectedRef, true))
      .catch(() => {})
  })
  if (settings?.teams && settings.teamMode === 'players') {
    const teams = ['pink', 'cyan', 'gold', 'green'].slice(0, settings.teamCount ?? 2)
    await set(ref(player.db, `${playerPath}/team`), teams[player.index % teams.length]).catch(() => {})
  }
}

function freeAnswer(question) {
  const value = pick(FREE_ANSWERS)
  return question.ask === 'both' ? { value, artist: pick(FREE_ANSWERS) } : { value }
}

async function answer(player, index, question) {
  const fields = question.options ? { value: randomInt(question.options.length) } : freeAnswer(question)
  await update(ref(player.db, `sessions/${code}`), {
    [`answers/${index}/${player.uid}`]: { ...fields, submittedAt: serverTimestamp() },
    [`answeredBy/${index}/${player.uid}`]: true,
  })
}

async function bluff(player, index) {
  const text = `Fausse réponse ${randomInt(1000)} de ${player.name}`
  await set(ref(player.db, `sessions/${code}/bluffs/${index}/${player.uid}`), { text, submittedAt: serverTimestamp() })
}

// Vote au hasard ; sa propre proposition est refusée par les règles : on essaie le choix suivant.
async function vote(player, index, choiceCount) {
  const first = randomInt(choiceCount)
  for (let step = 0; step < choiceCount; step++) {
    const choice = (first + step) % choiceCount
    try {
      await update(ref(player.db, `sessions/${code}`), {
        [`votes/${index}/${player.uid}`]: { value: choice, submittedAt: serverTimestamp() },
        [`votedBy/${index}/${player.uid}`]: true,
      })
      return
    } catch {
      // Choix refusé (le sien) : suivant.
    }
  }
  throw new Error('aucun choix accepté')
}

// Un écran de question ou de vote : chaque joueur agit à un moment au hasard, puis bilan.
function playPhase(players, phase, serverOffsetMs) {
  const remainingMs = phase.phaseEndsAt > 0 ? phase.phaseEndsAt - (Date.now() + serverOffsetMs) : 20_000
  const windowMs = Math.max(MIN_DELAY_MS, remainingMs * ANSWER_SHARE)
  const { status, currentIndex: index, currentQuestion: question, settings } = phase
  const actions = players.map(
    (player) =>
      new Promise((resolve) => {
        setTimeout(() => {
          const action =
            status === 'vote'
              ? vote(player, index, question.choices.length)
              : settings.answerMode === 'bluff'
                ? bluff(player, index)
                : answer(player, index, question)
          action.then(() => resolve(true), () => resolve(false))
        }, MIN_DELAY_MS + Math.random() * (windowMs - MIN_DELAY_MS))
      }),
  )
  Promise.all(actions).then((results) => {
    const sent = results.filter(Boolean).length
    console.log(`Q${index + 1} ${status} : ${sent} envoyés, ${results.length - sent} refusés (temps écoulé ou règle)`)
  })
}

async function main() {
  console.log(`Partie ${code} : connexion de ${count} faux joueurs…`)
  const players = []
  for (let index = 0; index < count; index++) players.push(await createPlayer(index))
  const [watcher] = players
  const sessionRef = (field) => ref(watcher.db, `sessions/${code}/${field}`)
  const status = (await get(sessionRef('status'))).val()
  if (status !== 'lobby') {
    console.error(`La partie ${code} n'est pas dans le salon (état : ${status ?? 'introuvable'}).`)
    process.exit(1)
  }
  const settings = (await get(sessionRef('settings'))).val()
  const joined = await Promise.allSettled(players.map((player) => join(player, settings)))
  const refused = joined.filter((result) => result.status === 'rejected').length
  console.log(`${count - refused} faux joueurs dans le salon${refused > 0 ? ` (${refused} refusés)` : ''}. Ctrl+C pour arrêter.`)

  let serverOffsetMs = 0
  onValue(ref(watcher.db, '.info/serverTimeOffset'), (snapshot) => (serverOffsetMs = snapshot.val() ?? 0))
  // Phase en cours, lue champ par champ comme un joueur ; une phase n'est jouée qu'une fois.
  const phase = {}
  let playedKey = null
  let settleId = null
  const playIfReady = () => {
    const isPlayable = (phase.status === 'question' && phase.currentQuestion) || (phase.status === 'vote' && phase.currentQuestion?.choices)
    const key = `${phase.status}-${phase.currentIndex}-${phase.phaseStartedAt}`
    if (!isPlayable || !phase.settings || key === playedKey) return
    playedKey = key
    playPhase(players, { ...phase }, serverOffsetMs)
  }
  const fields = ['status', 'currentIndex', 'currentQuestion', 'phaseStartedAt', 'phaseEndsAt', 'settings']
  for (const field of fields) {
    onValue(sessionRef(field), (snapshot) => {
      phase[field] = snapshot.val()
      if (phase.status === null && field === 'status') {
        console.log('Partie supprimée : arrêt.')
        process.exit(0)
      }
      if (!fields.every((name) => name in phase)) return
      clearTimeout(settleId)
      settleId = setTimeout(playIfReady, SETTLE_MS)
    })
  }

  process.on('SIGINT', async () => {
    console.log('Déconnexion des faux joueurs…')
    await Promise.allSettled(players.map((player) => set(ref(player.db, `sessions/${code}/players/${player.uid}/connected`), false)))
    process.exit(0)
  })
}

main().catch((error) => {
  console.error('Échec :', error)
  process.exit(1)
})
