import { ROOM_CODE_MAX_ATTEMPTS } from './constants'

// Pourquoi une partie n'a pas pu être créée : un message distinct pour chaque cas.
// - codeTaken : tous les codes tirés étaient déjà pris (en pratique jamais : environ un million de codes) ;
// - refused : la base a refusé la partie (règles déployées qui ne correspondent pas à cette version de l'app) ;
// - offline : pas de réseau, ou Firebase ne répond pas dans le délai ;
// - unknown : autre erreur, affichée telle quelle.
export type CreateGameFailure = 'codeTaken' | 'refused' | 'offline' | 'unknown'

// Étape où la création a échoué (ligne « Réf. » et journal) : connexion anonyme, lecture du code, écriture.
export type CreateGameStage = 'connexion' | 'lecture' | 'écriture'

export interface CreateGameProblem {
  failure: CreateGameFailure
  stage: CreateGameStage
  // Écriture refusée une seconde fois, après le rafraîchissement du jeton.
  retried?: boolean
  cause?: unknown
}

export type ClaimOutcome = { ok: true; code: string } | ({ ok: false } & CreateGameProblem)

// Accès à la base, remplaçables dans les tests.
export interface ClaimDeps {
  generateCode: () => string
  // Vrai si sessions/{code}/hostUid existe (lisible par tout utilisateur connecté).
  isCodeTaken: (code: string) => Promise<boolean>
  writeGame: (code: string) => Promise<void>
  // Filet de sécurité : jeton de connexion rafraîchi (getIdToken(true)) puis court délai, avant un seul nouvel
  // essai de l'écriture refusée (la connexion à la base peut tarder à reprendre le bon compte).
  refreshAuth?: () => Promise<void>
}

export class TimeoutError extends Error {
  constructor() {
    super('Délai dépassé (timeout)')
  }
}

// Classe une erreur Firebase d'après son message (les SDK n'exposent pas toujours de code).
export function createGameFailureOf(error: unknown): CreateGameFailure {
  const message = error instanceof Error ? error.message : String(error)
  if (/permission[_ ]denied/i.test(message)) return 'refused'
  if (error instanceof TimeoutError || /offline|network/i.test(message)) return 'offline'
  return 'unknown'
}

// Rejette après ms si la promesse n'a pas abouti (elle continue en arrière-plan).
export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new TimeoutError()), ms)
    promise.then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      (error: unknown) => {
        clearTimeout(timer)
        reject(error)
      },
    )
  })
}

// Occupe un code libre : tirage, lecture de hostUid, écriture de la partie. Un refus à l'écriture est relu :
// code pris entre-temps par un autre hôte (on retente un autre code) ; sinon, une seule fois par création, jeton
// rafraîchi et même écriture retentée ; refusée encore : partie refusée par les règles.
export async function claimRoomCode(deps: ClaimDeps, attempts = ROOM_CODE_MAX_ATTEMPTS): Promise<ClaimOutcome> {
  let stage: CreateGameStage = 'lecture'
  let hasRetried = false
  try {
    for (let attempt = 0; attempt < attempts; attempt++) {
      const code = deps.generateCode()
      stage = 'lecture'
      if (await deps.isCodeTaken(code)) continue
      stage = 'écriture'
      try {
        await deps.writeGame(code)
        return { ok: true, code }
      } catch (error) {
        if (createGameFailureOf(error) !== 'refused') throw error
        stage = 'lecture'
        if (await deps.isCodeTaken(code)) continue
        if (hasRetried || !deps.refreshAuth) return { ok: false, failure: 'refused', stage: 'écriture', retried: hasRetried, cause: error }
        hasRetried = true
        await deps.refreshAuth().catch(() => undefined)
        stage = 'écriture'
        try {
          await deps.writeGame(code)
          return { ok: true, code }
        } catch (retryError) {
          if (createGameFailureOf(retryError) !== 'refused') throw retryError
          stage = 'lecture'
          if (await deps.isCodeTaken(code)) continue
          return { ok: false, failure: 'refused', stage: 'écriture', retried: true, cause: retryError }
        }
      }
    }
    return { ok: false, failure: 'codeTaken', stage: 'lecture' }
  } catch (error) {
    return { ok: false, failure: createGameFailureOf(error), stage, cause: error }
  }
}

// Code technique court d'une erreur Firebase : jamais le message brut (il peut contenir le chemin, donc le code
// de la partie), seulement un mot connu.
export function createGameErrorCode(error: unknown): string {
  if (error instanceof TimeoutError) return 'délai dépassé'
  const code = typeof error === 'object' && error !== null && 'code' in error ? String((error as { code: unknown }).code) : ''
  const message = error instanceof Error ? error.message : String(error ?? '')
  if (/permission[_ ]denied/i.test(`${code} ${message}`)) return 'permission_denied'
  if (/network-request-failed/i.test(code)) return 'network-request-failed'
  if (/offline/i.test(message)) return 'hors ligne'
  if (/network/i.test(`${code} ${message}`)) return 'réseau'
  if (/^auth\/[a-z-]+$/.test(code)) return code
  return 'inconnue'
}

// Ligne « Réf. » sous le message (et journal) : étape et code technique, jamais l'uid ni le code de la partie.
export function createGameReference(problem: CreateGameProblem): string {
  const code = problem.failure === 'codeTaken' ? 'codes pris' : createGameErrorCode(problem.cause)
  return `création · ${problem.stage} · ${code}${problem.retried ? ' (après nouvel essai)' : ''}`
}
