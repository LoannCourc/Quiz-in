import { isValidRoomCode, normalizeRoomCode } from '@shared/roomCode'

import { DemoReceiver } from './demo/DemoReceiver'
import { LiveReceiver } from './LiveReceiver'
import { StatusScreen } from './screens/StatusScreen'
import { strings } from './strings'

const ROOM_CODE_PARAM = 'code'

// Avec ?code=XXXX dans l'URL : partie réelle. Sans code : mode démo.
function App() {
  const rawCode = new URLSearchParams(window.location.search).get(ROOM_CODE_PARAM)
  if (rawCode === null) {
    return <DemoReceiver />
  }

  const roomCode = normalizeRoomCode(rawCode)
  if (!isValidRoomCode(roomCode)) {
    return <StatusScreen title={strings.status.invalidCodeTitle} hint={strings.status.invalidCodeHint(rawCode)} />
  }
  return <LiveReceiver roomCode={roomCode} />
}

export default App
