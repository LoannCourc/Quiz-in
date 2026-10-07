// Faux joueurs pour mesurer la TV à 8 ou 20 joueurs (plan de fiabilité, docs/plan-fiabilite-tv.md).
// Usage (depuis receiver/, partie créée par l'app de l'hôte et encore dans le salon) :
//   npm run fake-players -- CODE [nombre, défaut 19]
// Chaque faux joueur est un vrai utilisateur anonyme (receiver/.env) : il rejoint le salon, reste
// connecté, puis répond à chaque question comme un téléphone (choix au hasard, réponse libre, Bluff :
// proposition puis vote), à un moment au hasard du temps de réponse. Rejouer : ils restent.
// Dessine-moi : un faux joueur désigné dessinateur rejoue le dessin enregistré du banc d'essai
// (src/lib/drawing/benchRecording.json), chaque paquet à son heure, comme un vrai téléphone. Les autres
// devinent : ils ne lisent pas le mot, mais la catégorie et le nombre de lettres sont publics ; ils tentent
// d'abord un ou deux mots faux, puis les mots de la liste qui correspondent (shared/drawWords.ts).
// Environ un sur quatre ne trouve jamais (il n'envoie que des mots faux).
// Ctrl+C : ils se déconnectent (la partie les voit hors ligne).
// Limite de Firebase : environ 100 nouveaux comptes anonymes par heure et par adresse IP.
// Essai local : FAKE_PLAYERS_EMULATOR=1 vise les émulateurs (Auth 9099, Database 9000, base demo-quiz-in,
// la même que la TV lancée avec VITE_FIREBASE_EMULATOR=1) au lieu du vrai projet.
import { initializeApp, setLogLevel } from 'firebase/app'
import { connectAuthEmulator, getAuth, signInAnonymously } from 'firebase/auth'
import { connectDatabaseEmulator, get, getDatabase, onDisconnect, onValue, ref, serverTimestamp, set, update } from 'firebase/database'
import { readFileSync } from 'node:fs'

const MAX_PLAYERS = 20
const AVATARS = ['🤖', '👾', '🦾', '🛸', '🚀', '🧠', '🎛️', '📡', '🔋', '💾', '🕹️', '🎲', '🧩', '🔧', '⚙️', '🛰️', '🔭', '💡', '🧲', '📟']
const FREE_ANSWERS = ['Paris', 'Je ne sais pas', 'Victor Hugo', 'Les Beatles', 'Madonna', '1789', 'Napoléon']
// Moment de la réponse : entre 1 s et 70 % du temps restant.
const MIN_DELAY_MS = 1_000
const ANSWER_SHARE = 0.7
// Les champs d'une transition arrivent un par un : on attend qu'ils soient tous là avant d'agir.
const SETTLE_MS = 300
const isEmulator = process.env.FAKE_PLAYERS_EMULATOR === '1'
// Dessin rejoué par un faux dessinateur (Dessine-moi).
const DRAWING = JSON.parse(readFileSync(new URL('../src/lib/drawing/benchRecording.json', import.meta.url), 'utf8'))
// Mots de Dessine-moi, lus dans le fichier TypeScript (pas d'import possible depuis ce script).
const DRAW_WORDS = [...readFileSync(new URL('../../shared/drawWords.ts', import.meta.url), 'utf8').matchAll(/word: '([^']+)', category: '([^']+)'/g)].map(
  ([, word, category]) => ({ word, category }),
)
const DRAW_DECOYS = ['truc', 'machin', 'bidule', 'chose', 'dessin']
// Essais d'un faux devineur : 1,5 s au moins entre deux (règles), 15 au plus.
const DRAW_GUESS_GAP_MS = 2_500
const DRAW_MAX_GUESSES = 15
const DRAW_NEVER_FINDS = 0.25

const config = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.VITE_FIREBASE_DATABASE_URL,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  // Émulateurs : base du projet fictif des tests des règles (comme la TV en mode émulateur).
  ...(isEmulator && { databaseURL: 'http://127.0.0.1:9000?ns=demo-quiz-in' }),
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

// Dessine-moi : le faux dessinateur envoie les paquets enregistrés à leur heure, tant que la manche dure
// (isCurrent faux : manche finie, on s'arrête). Les autres faux joueurs devinent.
function drawRound(players, phase, isCurrent) {
  const drawer = players.find((player) => player.uid === phase.drawTurn?.drawer)
  if (!drawer) return
  let sent = 0
  DRAWING.chunks.forEach((chunk, seq) => {
    setTimeout(() => {
      if (!isCurrent()) return
      set(ref(drawer.db, `sessions/${code}/drawing/${seq}`), chunk.data).then(
        () => {
          sent++
          if (sent === DRAWING.chunks.length) console.log(`Manche ${phase.currentIndex + 1} : ${drawer.name} a envoyé ses ${sent} paquets`)
        },
        () => {},
      )
    }, chunk.t)
  })
  console.log(`Manche ${phase.currentIndex + 1} : ${drawer.name} dessine (${DRAWING.chunks.length} paquets enregistrés)`)
  for (const player of players) if (player !== drawer) guessRound(player, phase, isCurrent)
}

// Lettres d'un mot sans tirets ni espaces (comme wordLetterCount).
const letterCount = (word) => word.replace(/[\s-]/g, '').length

// Un faux devineur : ses essais l'un après l'autre, jusqu'à « trouvé » (drawFound public), 15 essais ou la
// fin de la manche. Refus des règles (autre équipe en Groupe, trop tôt) : il s'arrête.
function guessRound(player, phase, isCurrent) {
  const { category, wordLength } = phase.drawTurn
  const candidates = DRAW_WORDS.filter((entry) => entry.category === category && letterCount(entry.word) === wordLength).map((entry) => entry.word)
  const decoys = Array.from({ length: 1 + randomInt(3) }, () => pick(DRAW_DECOYS))
  const guesses = (Math.random() < DRAW_NEVER_FINDS ? [...decoys, ...DRAW_DECOYS] : [...decoys, ...candidates]).slice(0, DRAW_MAX_GUESSES)
  const foundRef = ref(player.db, `sessions/${code}/drawFound/${player.uid}`)
  let count = 0
  const next = async () => {
    if (!isCurrent() || count >= guesses.length || (await get(foundRef)).exists()) return
    count++
    try {
      await set(ref(player.db, `sessions/${code}/drawGuess/${player.uid}`), { text: guesses[count - 1], count, at: serverTimestamp() })
    } catch {
      return
    }
    setTimeout(next, DRAW_GUESS_GAP_MS + Math.random() * 1_000)
  }
  setTimeout(next, 4_000 + Math.random() * 20_000)
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
  const phaseKey = () => `${phase.status}-${phase.currentIndex}-${phase.phaseStartedAt}`
  const playIfReady = () => {
    const isPlayable = (phase.status === 'question' && phase.currentQuestion) || (phase.status === 'vote' && phase.currentQuestion?.choices)
    const key = phaseKey()
    if (!isPlayable || !phase.settings || key === playedKey) return
    if (phase.settings.answerMode === 'draw') {
      // La manche du dessinateur doit être publiée (drawTurn de cette manche) avant de dessiner.
      if (phase.drawTurn?.round !== phase.currentIndex) return
      playedKey = key
      drawRound(players, { ...phase }, () => phaseKey() === key)
      return
    }
    playedKey = key
    playPhase(players, { ...phase }, serverOffsetMs)
  }
  const fields = ['status', 'currentIndex', 'currentQuestion', 'phaseStartedAt', 'phaseEndsAt', 'settings', 'drawTurn']
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
