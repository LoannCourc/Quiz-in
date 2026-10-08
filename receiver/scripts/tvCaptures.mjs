// Captures de chaque écran de la TV (démo, sans Firebase) à plusieurs résolutions et facteurs d'échelle, à
// comparer d'un lot à l'autre. Une TV de 1920×1080 au facteur 2,5 affiche une page de 768×432 px CSS : c'est
// ce que reproduit l'émulation (taille CSS = résolution / facteur, image à la résolution réelle).
//
// 1. Dans receiver/ : npm run dev (adresse affichée, 5173 par défaut).
// 2. Dans un autre terminal, dans receiver/ : npm run captures
//    Options : --base=http://localhost:5173  --only=draw,bluff (filtre sur le nom des écrans)
//              --sizes=1280x720,1920x1080  --scales=1,2.5  --wait=2500 (ms avant chaque capture)
//              --chrome="C:/Program Files/Google/Chrome/Application/chrome.exe"
// Sortie : receiver/captures/<date-heure>/<écran>_<résolution>_x<facteur>.png (dossier ignoré par Git).
import { spawn } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const SCREENS = [
  ['quiz-lobby-8', 'status=lobby&players=8'],
  ['quiz-lobby-20', 'status=lobby&players=20'],
  ['quiz-lobby-teams', 'status=lobby&players=12&teams=1&teamcount=4'],
  ['quiz-starting', 'status=starting'],
  ['quiz-question', 'status=question'],
  ['quiz-question-20', 'status=question&players=20&qlen=140'],
  ['quiz-reveal', 'status=reveal'],
  ['quiz-scores', 'status=scores'],
  ['quiz-paused', 'status=paused'],
  ['quiz-ended', 'status=ended'],
  ['quiz-ended-20', 'status=ended&players=20&names=long'],
  ['free-question', 'status=question&mode=free'],
  ['free-validation', 'status=validation&mode=free'],
  ['free-reveal', 'status=reveal&mode=free'],
  ['free-reveal-step', 'status=reveal&mode=free&step=1'],
  ['blindtest-question', 'status=question&blindtest=1'],
  ['blindtest-reveal', 'status=reveal&blindtest=1'],
  ['bluff-write', 'status=question&mode=bluff'],
  ['bluff-vote', 'status=vote&mode=bluff&players=20'],
  ['bluff-reveal', 'status=reveal&mode=bluff'],
  ['draw-round', 'status=question&mode=draw&found=3'],
  ['draw-reveal', 'status=reveal&mode=draw&step=1'],
  ['draw-reveal-long', 'status=reveal&mode=draw&word=ornithorynque'],
  ['draw-scores', 'status=scores&mode=draw'],
  ['draw-ended', 'status=ended&mode=draw'],
]
const DEFAULT_SIZES = ['1280x720', '1366x768', '1920x1080', '3840x2160']
const DEFAULT_SCALES = ['1', '2.5']
const CDP_PORT = 9335

function option(name, fallback) {
  const found = process.argv.find((arg) => arg.startsWith(`--${name}=`))
  return found ? found.slice(name.length + 3) : fallback
}

const base = option('base', 'http://localhost:5173').replace(/\/$/, '')
const only = option('only', '').split(',').filter(Boolean)
const sizes = option('sizes', DEFAULT_SIZES.join(',')).split(',')
const scales = option('scales', DEFAULT_SCALES.join(',')).split(',').map(Number)
const waitMs = Number(option('wait', '2500'))
const chromePath = option('chrome', 'C:/Program Files/Google/Chrome/Application/chrome.exe')
const screens = SCREENS.filter(([name]) => only.length === 0 || only.some((part) => name.includes(part)))

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-')
const outDir = join(import.meta.dirname, '..', 'captures', stamp)
mkdirSync(outDir, { recursive: true })

const chrome = spawn(chromePath, [
  '--headless=new',
  '--disable-gpu',
  '--hide-scrollbars',
  '--autoplay-policy=no-user-gesture-required',
  `--remote-debugging-port=${CDP_PORT}`,
  `--user-data-dir=${join(tmpdir(), 'quizin-tv-captures')}`,
  'about:blank',
])

async function pageTarget() {
  for (let attempt = 0; attempt < 50; attempt++) {
    await sleep(300)
    try {
      const targets = await (await fetch(`http://127.0.0.1:${CDP_PORT}/json`)).json()
      const page = targets.find((entry) => entry.type === 'page')
      if (page) return page
    } catch {
      // Chrome pas encore prêt.
    }
  }
  throw new Error('Chrome ne répond pas (vérifier --chrome=…)')
}

const socket = new WebSocket((await pageTarget()).webSocketDebuggerUrl)
await new Promise((resolve) => socket.addEventListener('open', resolve))
let nextId = 0
const pending = new Map()
socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data)
  if (message.id && pending.has(message.id)) {
    pending.get(message.id)(message)
    pending.delete(message.id)
  }
})
function send(method, params = {}) {
  const id = ++nextId
  socket.send(JSON.stringify({ id, method, params }))
  return new Promise((resolve) => pending.set(id, resolve))
}

let count = 0
try {
  for (const size of sizes) {
    const [width, height] = size.split('x').map(Number)
    for (const scale of scales) {
      await send('Emulation.setDeviceMetricsOverride', {
        width: Math.round(width / scale),
        height: Math.round(height / scale),
        deviceScaleFactor: scale,
        mobile: false,
      })
      for (const [name, query] of screens) {
        await send('Page.navigate', { url: `${base}/?${query}&capture=1` })
        await sleep(waitMs)
        const shot = await send('Page.captureScreenshot', { format: 'png' })
        writeFileSync(join(outDir, `${name}_${size}_x${scale}.png`), Buffer.from(shot.result.data, 'base64'))
        count++
      }
      console.log(`${size} ×${scale} : ${screens.length} écrans`)
    }
  }
  console.log(`${count} captures dans ${outDir}`)
} finally {
  socket.close()
  chrome.kill()
}
