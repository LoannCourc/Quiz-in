import { resumeDecision, type ResumeRead } from './hostEngine'

// Vérification du bouton « Reprendre la partie » (spec 6.6), sans Firebase ni stockage : l'app fournit les
// accès. Chaque accès peut échouer ou rejeter ; la vérification, elle, ne rejette jamais.
export interface ResumeCheckDeps {
  // Utilisateur connecté (authentification anonyme).
  uid: () => Promise<string>
  // Champs publics de la partie ; « failed » sur toute erreur.
  readGame: (code: string) => Promise<ResumeRead>
  // Heure du serveur estimée.
  serverNow: () => Promise<number>
  // Suppression de la partie par son hôte (abandonnée depuis plus de 5 min).
  deleteGame: (code: string) => Promise<void>
  // Effacement du code gardé sur le téléphone.
  forgetCode: () => Promise<void>
  log: (message: string) => void
}

// shown : le bouton reste ; forgotten : réponse certaine, code effacé ; retry : doute, bouton gardé, nouvel essai.
export type ResumeOutcome = 'shown' | 'forgotten' | 'retry'

export async function runResumeCheck(code: string, deps: ResumeCheckDeps): Promise<ResumeOutcome> {
  try {
    const uid = await deps.uid()
    const [read, now] = await Promise.all([deps.readGame(code), deps.serverNow()])
    const decision = resumeDecision(read, uid, now)
    deps.log(`[resume] ${code} : lecture ${describeRead(read)} → ${decision}`)
    if (decision === 'resume') return 'shown'
    if (decision === 'retry') return 'retry'
    if (decision === 'delete') {
      await deps.deleteGame(code)
      deps.log(`[resume] ${code} : partie abandonnée supprimée par l’hôte`)
    }
    await deps.forgetCode()
    deps.log(`[resume] ${code} : code oublié, bouton retiré`)
    return 'forgotten'
  } catch (error) {
    // Erreur imprévue (connexion, suppression refusée…) : rien n'est effacé, nouvel essai.
    deps.log(`[resume] ${code} : erreur, bouton gardé et nouvel essai (${String(error)})`)
    return 'retry'
  }
}

function describeRead(read: ResumeRead): string {
  if (read.kind !== 'found') return read.kind === 'missing' ? 'partie absente' : 'échouée'
  const { status, hostLeftAt } = read.game
  return `état ${status ?? '?'}${hostLeftAt === undefined ? '' : `, hôte parti à ${hostLeftAt}`}`
}
