import { ROOM_CODE_MAX_ATTEMPTS } from './constants'

// Pourquoi une partie n'a pas pu être créée : un message distinct pour chaque cas.
// - codeTaken : tous les codes tirés étaient déjà pris (en pratique jamais : environ un million de codes) ;
// - refused : la base a refusé la partie (règles déployées qui ne correspondent pas à cette version de l'app) ;
// - offline : pas de réseau, ou Firebase ne répond pas dans le délai ;
// - unknown : autre erreur, affichée telle quelle.
export type CreateGameFailure = 'codeTaken' | 'refused' | 'offline' | 'unknown'

export type ClaimOutcome = { ok: true; code: string } | { ok: false; failure: CreateGameFailure; cause?: unknown }

// Accès à la base, remplaçables dans les tests.
export interface ClaimDeps {
  generateCode: () => string
  // Vrai si sessions/{code}/hostUid existe (lisible par tout utilisateur connecté).
  isCodeTaken: (code: string) => Promise<boolean>
  writeGame: (code: string) => Promise<void>
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
// code pris entre-temps par un autre hôte (on retente), sinon partie refusée par les règles (inutile de retenter).
export async function claimRoomCode(deps: ClaimDeps, attempts = ROOM_CODE_MAX_ATTEMPTS): Promise<ClaimOutcome> {
  try {
    for (let attempt = 0; attempt < attempts; attempt++) {
      const code = deps.generateCode()
      if (await deps.isCodeTaken(code)) continue
      try {
        await deps.writeGame(code)
        return { ok: true, code }
      } catch (error) {
        if (createGameFailureOf(error) !== 'refused') throw error
        if (await deps.isCodeTaken(code)) continue
        return { ok: false, failure: 'refused', cause: error }
      }
    }
    return { ok: false, failure: 'codeTaken' }
  } catch (error) {
    return { ok: false, failure: createGameFailureOf(error), cause: error }
  }
}
