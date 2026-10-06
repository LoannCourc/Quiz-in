import { CAST_NAMESPACE, readCastAudioTest, readCastPerf, readCastPerfMusic, readCastRoomCode, readCastSoundTest } from '@shared/cast'

import { setPerfEnabled, setPerfMusicForcedOff } from './perf/perfFlag'

// SDK Web Receiver de Google : toujours chargé depuis gstatic (Google interdit de l'héberger
// soi-même), et seulement en mode Cast, pour que le navigateur du plan B n'en dépende pas.
const CAST_SDK_URL = '//www.gstatic.com/cast/sdk/libs/caf_receiver/v3/cast_receiver_framework.js'

// Seule la petite partie du SDK utilisée ici est typée (pas de dépendance de types en plus).
interface CustomMessageEvent {
  senderId: string
  data: unknown
}

interface CastReceiverContext {
  addCustomMessageListener(namespace: string, listener: (event: CustomMessageEvent) => void): void
  start(options: {
    customNamespaces: Record<string, string>
    // Pas de vidéo : sans cette option, le récepteur se fermerait faute de lecture en cours.
    disableIdleTimeout: boolean
    // Pas de lecteur vidéo à charger.
    skipPlayersLoad: boolean
  }): void
}

interface CastFramework {
  CastReceiverContext: { getInstance(): CastReceiverContext }
  system: { MessageType: { JSON: string } }
}

declare global {
  interface Window {
    cast?: { framework?: CastFramework }
  }
}

type CodeListener = (code: string) => void
type AudioTestListener = (url: string) => void
type SoundTestListener = (target: string) => void

const listeners = new Set<CodeListener>()
const audioTestListeners = new Set<AudioTestListener>()
const soundTestListeners = new Set<SoundTestListener>()
let lastCode: string | null = null
let started: Promise<void> | null = null

function loadCastSdk(): Promise<CastFramework> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = CAST_SDK_URL
    script.onload = () => {
      const framework = window.cast?.framework
      if (framework) resolve(framework)
      else reject(new Error('SDK Cast chargé mais cast.framework absent'))
    }
    script.onerror = () => reject(new Error('SDK Cast impossible à charger'))
    document.head.appendChild(script)
  })
}

function receiveMessage(event: CustomMessageEvent): void {
  // Panneau de mesures (cast-sender.html), même en pleine partie : la partie continue.
  const perf = readCastPerf(event.data)
  if (perf !== null) {
    setPerfEnabled(perf)
    return
  }
  const perfMusic = readCastPerfMusic(event.data)
  if (perfMusic !== null) {
    setPerfMusicForcedOff(!perfMusic)
    return
  }
  const soundTest = readCastSoundTest(event.data)
  if (soundTest !== null) {
    soundTestListeners.forEach((listener) => listener(soundTest))
    return
  }
  const audioTestUrl = readCastAudioTest(event.data)
  if (audioTestUrl !== null) {
    audioTestListeners.forEach((listener) => listener(audioTestUrl))
    return
  }
  const code = readCastRoomCode(event.data)
  if (code === null) {
    console.warn('[cast] Message ignoré', event.data)
    return
  }
  lastCode = code
  listeners.forEach((listener) => listener(code))
}

// Démarre le récepteur une seule fois (le mode strict de React monte les composants deux fois).
// L'écoute du canal est déclarée avant start(), comme l'exige le SDK.
export function startCastReceiver(): Promise<void> {
  started ??= loadCastSdk().then((framework) => {
    const context = framework.CastReceiverContext.getInstance()
    context.addCustomMessageListener(CAST_NAMESPACE, receiveMessage)
    context.start({
      customNamespaces: { [CAST_NAMESPACE]: framework.system.MessageType.JSON },
      disableIdleTimeout: true,
      skipPlayersLoad: true,
    })
  })
  return started
}

// Dernier code reçu (null tant que l'hôte n'en a envoyé aucun).
export function lastCastCode(): string | null {
  return lastCode
}

export function onCastCode(listener: CodeListener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

// Diagnostic du son envoyé par cast-sender.html (adresse d'un extrait à jouer).
export function onCastAudioTest(listener: AudioTestListener): () => void {
  audioTestListeners.add(listener)
  return () => audioTestListeners.delete(listener)
}

// Test du son de la TV envoyé par cast-sender.html : « effects », ou fichier de musique à décoder.
export function onCastSoundTest(listener: SoundTestListener): () => void {
  soundTestListeners.add(listener)
  return () => soundTestListeners.delete(listener)
}
