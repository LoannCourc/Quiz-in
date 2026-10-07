import { DRAW_BENCH_SCALES } from '@shared/cast'
import { RECEIVER_CODE_PARAM } from '@shared/constants'
import { isValidRoomCode, normalizeRoomCode } from '@shared/roomCode'
import { lazy, Suspense } from 'react'

import { CastReceiver } from './CastReceiver'
import { LiveReceiver } from './LiveReceiver'
import { DrawBenchScreen } from './screens/DrawBenchScreen'
import { StatusScreen } from './screens/StatusScreen'
import { strings } from './strings'

// Démo : en développement seulement. Dans le build publié, import.meta.env.DEV vaut false et
// Vite retire ce chargement : le code de démo n'est pas déployé.
const DemoReceiver = import.meta.env.DEV
  ? lazy(() => import('./demo/DemoReceiver').then((module) => ({ default: module.DemoReceiver })))
  : null

// Sans code dans l'URL : mode démo en développement, sinon mode Cast. L'URL enregistrée dans la
// console Cast n'a pas de code ; ?cast=1 force le mode Cast en développement.

// Avec ?code=XXXX : partie réelle, dans n'importe quel navigateur (plan B sans Cast).
// ?drawbench=1 (ou 1.5, 2 : échelle du canvas) : banc d'essai du dessin, aussi sur le site publié (plan B).
function App() {
  const params = new URLSearchParams(window.location.search)
  const benchScale = Number(params.get('drawbench'))
  if (DRAW_BENCH_SCALES.includes(benchScale)) return <DrawBenchScreen scale={benchScale} />
  const rawCode = params.get(RECEIVER_CODE_PARAM)
  if (rawCode === null) {
    return DemoReceiver && !params.has('cast') ? (
      <Suspense fallback={null}>
        <DemoReceiver />
      </Suspense>
    ) : (
      <CastReceiver />
    )
  }

  const roomCode = normalizeRoomCode(rawCode)
  if (!isValidRoomCode(roomCode)) {
    return <StatusScreen title={strings.status.invalidCodeTitle} hint={strings.status.invalidCodeHint(rawCode)} />
  }
  return <LiveReceiver roomCode={roomCode} />
}

export default App
