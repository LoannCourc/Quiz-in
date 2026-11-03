import {
  chromeMajorVersion,
  INITIAL_AUTO_LIGHT,
  isLightActive,
  isOldChrome,
  LIGHT_WINDOW_MS,
  nextAutoLight,
  readDisplaySetting,
  type AutoLightState,
  type DisplaySetting,
} from '@shared/displayMode'

// Mode allégé des petites box (shared/displayMode.ts) : applique la classe tv-light sur <html> (règles
// dans displayMode.css). Réglage gardé par la TV (localStorage), modifiable par l'adresse
// (?light=on|auto|off) ou par cast-sender.html, même en pleine partie.
// Automatique : allégé d'office sur un vieux Chrome (box Android TV) ; sinon, la TV compte ses images
// seconde par seconde, en continu, et s'allège dès que l'affichage est trop lent. Elle le retient : la
// page suivante démarre directement allégée.

const SETTING_KEY = 'quizin.light'
const REMEMBERED_KEY = 'quizin.light.slow'

export interface DisplayModeState {
  setting: DisplaySetting
  auto: AutoLightState
  isLight: boolean
}

function readStored(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function store(key: string, value: string | null): void {
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, value)
  } catch {
    // Stockage indisponible : le réglage vaut pour cette page seulement.
  }
}

// Adresse d'abord (et gardée), sinon réglage gardé, sinon auto.
function initialSetting(): DisplaySetting {
  const fromUrl = readDisplaySetting(new URLSearchParams(window.location.search).get('light'))
  if (fromUrl) {
    store(SETTING_KEY, fromUrl)
    return fromUrl
  }
  return readDisplaySetting(readStored(SETTING_KEY)) ?? 'auto'
}

// Point de départ de l'automatique : vieux Chrome, ou lenteur mesurée sur une page précédente.
function initialAuto(): AutoLightState {
  if (isOldChrome(chromeMajorVersion(navigator.userAgent))) return { ...INITIAL_AUTO_LIGHT, triggeredAt: performance.now(), reason: 'oldChrome' }
  if (readStored(REMEMBERED_KEY) === '1') return { ...INITIAL_AUTO_LIGHT, triggeredAt: performance.now(), reason: 'remembered' }
  return INITIAL_AUTO_LIGHT
}

let setting = initialSetting()
let auto = initialAuto()
let frameId: number | null = null
// Page masquée pendant la seconde en cours (onglet en arrière-plan) : seconde ignorée.
let wasHidden = false
document.addEventListener('visibilitychange', () => (wasHidden = true))

export function displayModeState(): DisplayModeState {
  return { setting, auto, isLight: isLightActive(setting, auto) }
}

export function applyCastLight(value: DisplaySetting): void {
  setting = value
  store(SETTING_KEY, value)
  // Revenir en automatique remet la mesure à zéro (le vieux Chrome reste allégé d'office).
  if (value === 'auto') {
    store(REMEMBERED_KEY, null)
    auto = initialAuto()
  }
  update()
}

function update(): void {
  document.documentElement.classList.toggle('tv-light', isLightActive(setting, auto))
  const isWatching = setting === 'auto' && auto.reason === null
  if (isWatching && frameId === null) watchFrames()
  if (!isWatching && frameId !== null) {
    cancelAnimationFrame(frameId)
    frameId = null
  }
}

// Compte les images par fenêtres d'une seconde, avec le plus long écart entre deux images.
function watchFrames(): void {
  let windowStart = performance.now()
  let previous = windowStart
  let frames = 0
  let maxGapMs = 0
  const onFrame = (now: number) => {
    frames += 1
    maxGapMs = Math.max(maxGapMs, now - previous)
    previous = now
    if (now - windowStart >= LIGHT_WINDOW_MS) {
      if (!wasHidden) auto = nextAutoLight(auto, { frames, elapsedMs: now - windowStart, maxGapMs, at: now })
      wasHidden = false
      windowStart = now
      frames = 0
      maxGapMs = 0
      if (auto.reason !== null) {
        store(REMEMBERED_KEY, '1')
        frameId = null
        update()
        return
      }
    }
    frameId = requestAnimationFrame(onFrame)
  }
  frameId = requestAnimationFrame(onFrame)
}

// Au chargement de la page (main.tsx), avant le premier affichage.
export function startDisplayMode(): void {
  update()
}
