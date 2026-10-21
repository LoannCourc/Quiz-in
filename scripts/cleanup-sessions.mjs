// Nettoyage des parties de plus de 24 h (sessions/{code} dont createdAt est plus ancien), lancé chaque heure par
// .github/workflows/cleanup-sessions.yml. Passe outre les règles de sécurité (compte de service).
//
// Simulation par défaut : n'affiche que ce qui serait supprimé. Suppression réelle avec --apply.
//   FIREBASE_SERVICE_ACCOUNT : contenu JSON de la clé du compte de service (secret, jamais affiché ni écrit).
//   FIREBASE_DATABASE_URL    : adresse de la base (non secrète).
//
// Les journaux d'un dépôt public sont publics : aucun prénom ni contenu de partie, codes masqués.
import { cert, deleteApp, initializeApp } from 'firebase-admin/app'
import { getDatabase } from 'firebase-admin/database'

const MAX_AGE_MS = 24 * 60 * 60 * 1000
const BATCH_SIZE = 100
// Garde-fou contre un emballement : 2 000 parties au plus par exécution, l'exécution suivante continue.
const MAX_BATCHES = 20
// Même format que la règle de validation de sessions/$code (database.rules.json).
const ROOM_CODE = /^[A-HJ-NP-Z2-9]{4}$/
const MAX_LISTED = 50

function readSettings() {
  const rawKey = process.env.FIREBASE_SERVICE_ACCOUNT
  const databaseURL = process.env.FIREBASE_DATABASE_URL
  if (!rawKey) throw new Error('FIREBASE_SERVICE_ACCOUNT manquant (secret GitHub).')
  if (!databaseURL || !/^https:\/\/[a-z0-9-]+(\.[a-z0-9-]+)*\.(firebasedatabase\.app|firebaseio\.com)\/?$/.test(databaseURL)) {
    throw new Error('FIREBASE_DATABASE_URL manquant ou invalide (variable GitHub).')
  }
  let serviceAccount
  try {
    serviceAccount = JSON.parse(rawKey)
  } catch {
    // Jamais le contenu dans le message : ce serait la clé.
    throw new Error("FIREBASE_SERVICE_ACCOUNT n'est pas un JSON valide.")
  }
  return { serviceAccount, databaseURL, apply: process.argv.includes('--apply') }
}

// Heure du serveur de la base (et non celle de la machine qui exécute le script).
async function serverNow(db) {
  const offset = (await db.ref('.info/serverTimeOffset').once('value')).val()
  return Date.now() + (typeof offset === 'number' ? offset : 0)
}

// Parties de plus de 24 h, par createdAt croissant. startAt(0) écarte les parties sans createdAt (anciennes
// versions de l'app), que la base classe avant les nombres ; le filtre redit chaque condition par sécurité.
async function expiredBatch(db, cutoff, after) {
  let query = db.ref('sessions').orderByChild('createdAt')
  query = after ? query.startAt(after.createdAt, after.code) : query.startAt(0)
  const snapshot = await query.endAt(cutoff).limitToFirst(BATCH_SIZE + (after ? 1 : 0)).once('value')
  const games = []
  snapshot.forEach((child) => {
    const game = child.val()
    const createdAt = game?.createdAt
    if (after && child.key === after.code) return
    if (ROOM_CODE.test(child.key) && typeof createdAt === 'number' && createdAt <= cutoff) {
      games.push({ code: child.key, createdAt, status: typeof game.status === 'string' ? game.status : '?' })
    }
  })
  return games
}

function describeGame(game, now) {
  const hours = Math.floor((now - game.createdAt) / 3_600_000)
  return `  ${game.code.slice(0, 2)}··  créée il y a ${hours} h  état ${game.status}`
}

async function run() {
  const { serviceAccount, databaseURL, apply } = readSettings()
  const app = initializeApp({ credential: cert(serviceAccount), databaseURL })
  try {
    const db = getDatabase(app)
    const now = await serverNow(db)
    const cutoff = now - MAX_AGE_MS
    console.log(`${apply ? 'Suppression' : 'Simulation (rien n’est supprimé)'} : parties créées avant le ${new Date(cutoff).toISOString()}`)

    let total = 0
    let after = null
    for (let batch = 0; batch < MAX_BATCHES; batch++) {
      const games = apply ? await expiredBatch(db, cutoff, null) : await expiredBatch(db, cutoff, after)
      if (games.length === 0) break
      for (const game of games) {
        if (total < MAX_LISTED) console.log(describeGame(game, now))
        total++
      }
      if (apply) {
        await db.ref('sessions').update(Object.fromEntries(games.map((game) => [game.code, null])))
      } else {
        after = games[games.length - 1]
      }
      if (games.length < BATCH_SIZE) break
    }
    if (total > MAX_LISTED) console.log(`  … et ${total - MAX_LISTED} autre(s)`)
    console.log(apply ? `${total} partie(s) supprimée(s).` : `${total} partie(s) seraient supprimées (relancer avec --apply).`)
  } finally {
    await deleteApp(app)
  }
}

run().catch((error) => {
  console.error(`Échec du nettoyage : ${error instanceof Error ? error.message : String(error)}`)
  process.exit(1)
})
