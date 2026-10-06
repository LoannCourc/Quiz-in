// Empêche la box (Android TV) de lancer son économiseur d'écran pendant une partie : pour Android, une
// page qui ne lit aucune vidéo est inactive, et la musique (Web Audio) ne compte pas.
// Deux moyens, actifs ensemble pendant la partie :
// - une vidéo muette, noire, de 2 px, sans piste audio, en boucle (public/keep-awake.webm, 4 Ko) :
//   Chrome garde l'écran allumé tant qu'une vidéo joue sur une page visible et que la vidéo est à
//   l'écran (VideoWakeLock de Chromium, vrai aussi pour une vidéo muette) ;
// - l'API Wake Lock (navigator.wakeLock), si le navigateur la propose et l'accorde.
// La vidéo n'est jamais déclarée au SDK Cast (pas de session média : aucune commande de lecture chez
// l'hôte) et, muette et sans son, ne touche ni à la musique ni aux extraits du blind test.

const VIDEO_SRC = '/keep-awake.webm'
// 2 px dans le coin, presque transparente : invisible, mais « à l'écran » pour Chrome (une vidéo hors de
// l'écran ou masquée ne garde pas l'écran allumé).
const VIDEO_STYLE = 'position:fixed;right:0;bottom:0;width:2px;height:2px;opacity:0.01;pointer-events:none'

export type KeepAwakeVideoState = 'off' | 'starting' | 'playing' | 'blocked' | 'error'
export type KeepAwakeLockState = 'off' | 'unsupported' | 'held' | 'refused'

export interface KeepAwakeStatus {
  video: KeepAwakeVideoState
  wakeLock: KeepAwakeLockState
}

const status: KeepAwakeStatus = { video: 'off', wakeLock: 'off' }
let video: HTMLVideoElement | null = null
let wakeLock: WakeLockSentinel | null = null
let isActive = false

// État lu par le panneau de mesures (?perf=1).
export function keepAwakeStatus(): KeepAwakeStatus {
  return { ...status }
}

function createVideo(): HTMLVideoElement {
  const element = document.createElement('video')
  element.muted = true
  element.loop = true
  element.playsInline = true
  element.setAttribute('aria-hidden', 'true')
  element.style.cssText = VIDEO_STYLE
  element.addEventListener('playing', () => (status.video = 'playing'))
  element.addEventListener('error', () => (status.video = 'error'))
  // Mise en pause par le système (rare) : on relance tant que la partie dure.
  element.addEventListener('pause', () => {
    if (isActive) playVideo(element)
  })
  element.src = VIDEO_SRC
  document.body.appendChild(element)
  return element
}

function playVideo(element: HTMLVideoElement): void {
  element.play().catch((error: unknown) => {
    status.video = 'blocked'
    console.warn('[veille] Vidéo muette non lancée', error)
  })
}

async function requestWakeLock(): Promise<void> {
  if (!('wakeLock' in navigator)) {
    status.wakeLock = 'unsupported'
    return
  }
  try {
    const sentinel = await navigator.wakeLock.request('screen')
    if (!isActive) {
      void sentinel.release()
      return
    }
    wakeLock = sentinel
    status.wakeLock = 'held'
    sentinel.addEventListener('release', () => {
      if (wakeLock === sentinel) wakeLock = null
      if (status.wakeLock === 'held') status.wakeLock = 'off'
    })
  } catch (error: unknown) {
    status.wakeLock = 'refused'
    console.warn('[veille] Wake Lock refusé', error)
  }
}

// Le navigateur relâche le Wake Lock quand la page est masquée : on le redemande à son retour.
function onVisibilityChange(): void {
  if (isActive && document.visibilityState === 'visible' && wakeLock === null) void requestWakeLock()
}

export function startKeepAwake(): void {
  if (isActive) return
  isActive = true
  status.video = 'starting'
  video ??= createVideo()
  playVideo(video)
  void requestWakeLock()
  document.addEventListener('visibilitychange', onVisibilityChange)
}

// Hors partie : vidéo retirée de la page (décodeur libéré), Wake Lock rendu.
export function stopKeepAwake(): void {
  if (!isActive) return
  isActive = false
  document.removeEventListener('visibilitychange', onVisibilityChange)
  if (video) {
    video.pause()
    video.removeAttribute('src')
    video.load()
    video.remove()
    video = null
  }
  void wakeLock?.release()
  wakeLock = null
  status.video = 'off'
  status.wakeLock = 'off'
}
