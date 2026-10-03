import { CAST_NAMESPACE, CAST_RECEIVER_APP_ID, type CastShowGameMessage } from '@shared/cast'

// Page de test cast-sender.html (développement seulement) : lance le récepteur sur la TV et lui
// envoie un code, comme le fera l'app de l'hôte au bloc 4.3. Textes non traduits : outil interne.

// Petite partie du SDK émetteur de Google utilisée ici.
interface CastSession {
  sendMessage(namespace: string, data: object): Promise<unknown>
}

interface SenderContext {
  setOptions(options: { receiverApplicationId: string; autoJoinPolicy: string }): void
  getCurrentSession(): CastSession | null
}

interface SenderGlobals {
  __onGCastApiAvailable?: (isAvailable: boolean) => void
  cast?: { framework: { CastContext: { getInstance(): SenderContext } } }
  chrome?: { cast: { AutoJoinPolicy: { ORIGIN_SCOPED: string } } }
}

// Le SDK est chargé après la déclaration de __onGCastApiAvailable, qu'il appelle une fois prêt.
const SENDER_SDK_URL = 'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1'

const globals = window as unknown as SenderGlobals
const status = document.getElementById('status')!
const codeInput = document.getElementById('code') as HTMLInputElement

function show(message: string): void {
  status.textContent = message
}

function context(): SenderContext | null {
  return globals.cast?.framework.CastContext.getInstance() ?? null
}

globals.__onGCastApiAvailable = (isAvailable) => {
  const castContext = context()
  if (!isAvailable || !castContext || !globals.chrome) {
    show('SDK Cast indisponible : utilisez Chrome sur ce PC.')
    return
  }
  castContext.setOptions({
    receiverApplicationId: CAST_RECEIVER_APP_ID,
    autoJoinPolicy: globals.chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
  })
  show(`Prêt (récepteur ${CAST_RECEIVER_APP_ID}). Cliquez sur l’icône Cast et choisissez la TV.`)
}

document.getElementById('send')!.addEventListener('click', () => {
  const session = context()?.getCurrentSession()
  if (!session) {
    show('Pas de session Cast : connectez-vous d’abord à la TV (étape 1).')
    return
  }
  const message: CastShowGameMessage = { code: codeInput.value }
  session
    .sendMessage(CAST_NAMESPACE, message)
    .then(() => show(`Envoyé sur ${CAST_NAMESPACE} : ${JSON.stringify(message)}`))
    .catch((error: unknown) => show(`Échec de l’envoi : ${String(error)}`))
})

const sdk = document.createElement('script')
sdk.src = SENDER_SDK_URL
sdk.onerror = () => show('SDK Cast impossible à charger (réseau ?).')
document.head.appendChild(sdk)
