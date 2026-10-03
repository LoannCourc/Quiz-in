import { RECEIVER_CODE_PARAM } from '@shared/constants'
import { isValidRoomCode, normalizeRoomCode } from '@shared/roomCode'

import { CastReceiver } from './CastReceiver'
import { DemoReceiver } from './demo/DemoReceiver'
import { LiveReceiver } from './LiveReceiver'
import { StatusScreen } from './screens/StatusScreen'
import { strings } from './strings'

// Sans code dans l'URL : mode démo en développement (ou ?demo=1), sinon mode Cast. L'URL
// enregistrée dans la console Cast n'a pas de code ; ?cast=1 force le mode Cast en développement.
function isDemo(params: URLSearchParams): boolean {
  if (params.has('demo')) return true
  return import.meta.env.DEV && !params.has('cast')
}

// Avec ?code=XXXX : partie réelle, dans n'importe quel navigateur (plan B sans Cast).
function App() {
  const params = new URLSearchParams(window.location.search)
  const rawCode = params.get(RECEIVER_CODE_PARAM)
  if (rawCode === null) {
    return isDemo(params) ? <DemoReceiver /> : <CastReceiver />
  }

  const roomCode = normalizeRoomCode(rawCode)
  if (!isValidRoomCode(roomCode)) {
    return <StatusScreen title={strings.status.invalidCodeTitle} hint={strings.status.invalidCodeHint(rawCode)} />
  }
  return <LiveReceiver roomCode={roomCode} />
}

export default App
