import { fadeCurve } from '@shared/audioPlayback'
import { AUDIO_FADE_IN_MS, AUDIO_STOP_FADE_MS } from '@shared/constants'

import { soundEngine } from './sound/soundEngine'

// Lecteur audio de la TV (blind test) : un seul élément <audio>, jamais visible. La TV est la seule à
// jouer le son ; les joueurs n'entendent que la TV. Jamais de coupure ni de démarrage sec.
//
// Volume : l'élément passe par un gain du moteur audio (Web Audio) ; tous les fondus sont des rampes
// natives, calculées par le fil audio du navigateur, sans minuteur ni travail sur le fil de l'affichage :
// - entrée courte au démarrage (AUDIO_FADE_IN_MS) ;
// - fin du timing : fondu en cosinus qui finit pile à la fin du timing (setValueCurveAtTime), court quand le
//   chrono va au bout (AUDIO_END_FADE_MS), reprogrammé plus long quand tout le monde a répondu avant
//   (AUDIO_TAIL_FADE_MS, shared/audioPlayback.ts) ;
// - coupure par un changement d'étape (question suivante, pause) : fondu court (AUDIO_STOP_FADE_MS).
// Préchargement : un second élément, de réserve, charge l'extrait de la question suivante (adresse publiée
// par l'hôte dès la révélation, nextAudio) et se place à son début, gain à zéro ; à la question, il prend la
// place de l'élément actif. Le navigateur télécharge et prépare le fichier sur ses fils média : rien de lourd
// sur le fil de l'affichage. Réserve libérée à la fin de la partie ou quand l'extrait attendu change.
// L'extrait doit être lu en CORS (preview Deezer : Access-Control-Allow-Origin: *), sinon le moteur audio
// n'en reçoit que du silence. Si ce chemin échoue (CORS refusé, Web Audio absent), le lecteur repasse
// pour le reste de la page sur un élément simple, dont le volume suit le plan (fondu par paliers).

// playing : le son joue. blocked : le navigateur refuse la lecture sans geste de l'utilisateur
// (plan B dans Chrome, tant que personne n'a cliqué dans la page). failed : adresse expirée,
// réseau, format, ou délai dépassé. superseded : un appel plus récent (ou un arrêt) a pris la main ;
// cet appel ne joue rien (jamais deux lectures en même temps).
export type PlayResult = 'playing' | 'blocked' | 'failed' | 'superseded'

// Délai maximal pour charger le début du fichier avant de considérer la lecture comme impossible.
const LOAD_TIMEOUT_MS = 8_000

function clampVolume(volume: number): number {
  return Math.max(0, Math.min(1, volume))
}

function waitFor(audio: HTMLAudioElement, event: 'loadedmetadata', timeoutMs: number): Promise<boolean> {
  if (audio.readyState >= HTMLMediaElement.HAVE_METADATA) return Promise.resolve(true)
  return new Promise((resolve) => {
    const done = (ok: boolean) => {
      clearTimeout(timer)
      audio.removeEventListener(event, onEvent)
      audio.removeEventListener('error', onError)
      resolve(ok)
    }
    const onEvent = () => done(true)
    const onError = () => done(false)
    const timer = setTimeout(() => done(false), timeoutMs)
    audio.addEventListener(event, onEvent)
    audio.addEventListener('error', onError)
  })
}

// Arrête les rampes en cours en gardant le volume atteint à cet instant (pas de saut).
function holdAt(param: AudioParam, time: number): void {
  if (typeof param.cancelAndHoldAtTime === 'function') {
    param.cancelAndHoldAtTime(time)
    return
  }
  const value = param.value
  param.cancelScheduledValues(time)
  param.setValueAtTime(value, time)
}

// Gain natif de l'extrait : élément relié au moteur audio de la TV.
interface Routed {
  context: AudioContext
  gain: GainNode
}

// Volume de base, fin du timing (heure du serveur) et durée du fondu programmé, pour ne le reprogrammer
// que s'ils changent.
interface ScheduledTail {
  level: number
  endsAt: number
  fadeMs: number
}

function createElement(isRouted: boolean): HTMLAudioElement {
  const audio = new Audio()
  audio.preload = 'auto'
  if (isRouted) audio.crossOrigin = 'anonymous'
  return audio
}

// Élément relié au moteur audio : source, gain (à zéro au départ), sortie.
function createRouted(context: AudioContext): Routed & { audio: HTMLAudioElement } {
  const audio = createElement(true)
  const gain = context.createGain()
  gain.gain.value = 0
  context.createMediaElementSource(audio).connect(gain)
  gain.connect(context.destination)
  return { audio, context, gain }
}

function unloadElement(audio: HTMLAudioElement): void {
  audio.pause()
  audio.removeAttribute('src')
  audio.load()
}

// Dernier démarrage d'un extrait, pour le panneau ?perf=1 : délai entre l'ordre de jouer et le son, et si
// l'extrait était préchargé.
export interface ExtractStartStats {
  ms: number
  isPreloaded: boolean
  at: number
}

class TvAudioPlayer {
  // Élément relié au moteur audio (null : pas encore créé, ou chemin abandonné).
  private routed: (Routed & { audio: HTMLAudioElement }) | null = null
  private canRoute = true
  private plain: HTMLAudioElement | null = null
  private url: string | null = null
  // Numéro du dernier ordre (play ou arrêt) : un play dépassé pendant son chargement s'abandonne.
  private generation = 0
  private stopTimer: ReturnType<typeof setTimeout> | null = null
  private isFadingOut = false
  private scheduled: ScheduledTail | null = null
  // Élément de réserve (préchargement de l'extrait suivant) et son adresse.
  private spareRouted: (Routed & { audio: HTMLAudioElement }) | null = null
  private sparePlain: HTMLAudioElement | null = null
  private spareUrl: string | null = null
  private lastStart: ExtractStartStats | null = null

  get startStats(): ExtractStartStats | null {
    return this.lastStart
  }

  private get audio(): HTMLAudioElement | null {
    return this.routed?.audio ?? this.plain
  }

  // Vrai si le son joue et n'est pas en train de s'éteindre.
  get isPlaying(): boolean {
    const audio = this.audio
    return audio !== null && !audio.paused && !this.isFadingOut
  }

  get positionS(): number {
    return this.audio?.currentTime ?? 0
  }

  get currentUrl(): string | null {
    return this.url
  }

  // Élément de lecture : relié au moteur audio si possible (contexte du son de la TV), sinon simple.
  private element(): HTMLAudioElement {
    if (this.routed) return this.routed.audio
    if (this.canRoute) {
      soundEngine.start()
      const context = soundEngine.musicInput?.context
      if (context) {
        try {
          this.routed = createRouted(context)
          return this.routed.audio
        } catch (error) {
          console.warn('[extrait] Moteur audio indisponible, lecteur simple', error)
        }
      }
      this.canRoute = false
    }
    this.plain ??= createElement(false)
    return this.plain
  }

  // Élément de réserve, de même nature que l'élément actif (relié au moteur audio, ou simple).
  private spareElement(): HTMLAudioElement {
    this.element()
    if (this.routed) {
      this.spareRouted ??= createRouted(this.routed.context)
      return this.spareRouted.audio
    }
    this.sparePlain ??= createElement(false)
    return this.sparePlain
  }

  // Précharge l'extrait de la question suivante (adresse, début en secondes) sur l'élément de réserve.
  preload(url: string, positionS: number): void {
    if (this.spareUrl === url || this.url === url) return
    const audio = this.spareElement()
    this.spareUrl = url
    audio.src = url
    audio.load()
    // Placé à son début dès que possible : le navigateur charge ce qui sera joué en premier.
    const place = () => {
      if (this.spareUrl === url && this.spare === audio) audio.currentTime = positionS
    }
    if (audio.readyState >= HTMLMediaElement.HAVE_METADATA) place()
    else audio.addEventListener('loadedmetadata', place, { once: true })
  }

  // Libère l'extrait préchargé (fin de la partie, extrait attendu qui a changé).
  releasePreload(): void {
    const spare = this.spare
    if (spare && this.spareUrl !== null) unloadElement(spare)
    this.spareUrl = null
  }

  private get spare(): HTMLAudioElement | null {
    return this.routed ? (this.spareRouted?.audio ?? null) : this.sparePlain
  }

  // L'extrait demandé est celui préchargé : la réserve devient l'élément actif (l'ancien, coupé par un
  // fondu court s'il jouait encore, devient la réserve, vidée).
  private async takePreloaded(url: string): Promise<boolean> {
    if (this.spareUrl !== url) return false
    const previous = this.audio
    if (previous && !previous.paused) await this.fadeOutNow()
    if (previous) unloadElement(previous)
    if (this.routed && this.spareRouted) [this.routed, this.spareRouted] = [this.spareRouted, this.routed]
    else [this.plain, this.sparePlain] = [this.sparePlain, this.plain]
    this.url = url
    this.spareUrl = null
    return true
  }

  // Le chemin relié a échoué (CORS refusé ?) : élément simple pour le reste de la page.
  private abandonRouting(): void {
    if (!this.routed) return
    console.warn('[extrait] Lecture par le moteur audio impossible, lecteur simple')
    unloadElement(this.routed.audio)
    if (this.spareRouted) unloadElement(this.spareRouted.audio)
    this.routed = null
    this.spareRouted = null
    this.spareUrl = null
    this.canRoute = false
    this.url = null
  }

  // Joue l'adresse à la position demandée (en secondes) : entrée courte jusqu'au volume de base, puis
  // fondu de fin programmé (endsAt : fin du timing, heure du serveur ; volume : volume à cet instant,
  // pour le lecteur simple).
  async play(url: string, positionS: number, tail: ScheduledTail & { volume: number }, nowServer: number): Promise<PlayResult> {
    const generation = ++this.generation
    const requestedAt = performance.now()
    // Un fondu de sortie en cours est abandonné : c'est cette lecture qui prend la main.
    this.cancelStop()
    this.isFadingOut = false
    this.element()
    const isPreloaded = this.url !== url && (await this.takePreloaded(url))
    if (generation !== this.generation) return 'superseded'
    let audio = this.element()
    if (this.url !== url) {
      // Extrait précédent encore audible (question suivante sans 3-2-1) : fondu court avant de changer.
      if (this.routed && !audio.paused) {
        await this.fadeOutNow()
        if (generation !== this.generation) return 'superseded'
      }
      this.url = url
      audio.src = url
      audio.load()
    }
    let isLoaded = await waitFor(audio, 'loadedmetadata', LOAD_TIMEOUT_MS)
    if (generation !== this.generation) return 'superseded'
    if (!isLoaded && this.routed) {
      // Peut-être un refus CORS : nouvel essai, tout de suite, avec l'élément simple.
      this.abandonRouting()
      audio = this.element()
      this.url = url
      audio.src = url
      audio.load()
      isLoaded = await waitFor(audio, 'loadedmetadata', LOAD_TIMEOUT_MS)
      if (generation !== this.generation) return 'superseded'
    }
    if (!isLoaded) return 'failed'
    audio.currentTime = positionS
    this.silence()
    try {
      await audio.play()
    } catch (error) {
      // play() interrompu par un arrêt plus récent : abandon normal, pas un échec.
      if (generation !== this.generation) return 'superseded'
      return error instanceof DOMException && error.name === 'NotAllowedError' ? 'blocked' : 'failed'
    }
    if (generation !== this.generation) {
      // Annulé pendant le démarrage : le volume est encore à 0, on remet en pause sans rien faire entendre.
      if (!this.isFadingOut) audio.pause()
      return 'superseded'
    }
    this.scheduled = null
    this.keep(tail, nowServer, true)
    this.lastStart = { ms: Math.round(performance.now() - requestedAt), isPreloaded, at: Date.now() }
    return 'playing'
  }

  // Lecture en cours : fondu de fin programmé une fois (reprogrammé si le volume de base ou la fin
  // changent) ; lecteur simple : volume du plan à cet instant.
  keep(tail: ScheduledTail & { volume: number }, nowServer: number, isStarting = false): void {
    if (this.isFadingOut) return
    if (!this.routed) {
      if (this.plain) this.plain.volume = clampVolume(tail.volume)
      return
    }
    const { scheduled } = this
    if (scheduled && scheduled.level === tail.level && scheduled.endsAt === tail.endsAt && scheduled.fadeMs === tail.fadeMs) return
    this.scheduled = { level: tail.level, endsAt: tail.endsAt, fadeMs: tail.fadeMs }
    const { context, gain } = this.routed
    const now = context.currentTime
    const level = clampVolume(tail.level)
    const remainingMs = tail.endsAt - nowServer
    // Démarrage : entrée courte ; changement en cours de lecture (fondu long, volume de base) : transition
    // douce depuis le volume du moment.
    const rampEnd = now + (isStarting ? AUDIO_FADE_IN_MS : 300) / 1000
    holdAt(gain.gain, now)
    // Le fondu de fin commence fadeMs avant la fin du timing (tout de suite s'il reste moins).
    const fadeStartMs = Math.max(0, remainingMs - tail.fadeMs)
    const curveStart = Math.max(rampEnd + 0.001, now + fadeStartMs / 1000)
    const curveRemainingMs = Math.max(1, remainingMs - (curveStart - now) * 1000)
    const curve = fadeCurve(curveRemainingMs, tail.fadeMs, level)
    gain.gain.linearRampToValueAtTime(curve[0], rampEnd)
    gain.gain.setValueCurveAtTime(curve, curveStart, curveRemainingMs / 1000)
  }

  // Abandonne un démarrage en cours de chargement (la phase a changé entre-temps).
  cancelPending(): void {
    this.generation += 1
  }

  // Arrêt avec un fondu court ; l'adresse reste chargée (reprise après une pause sans rechargement).
  fadeOutAndPause(): void {
    const audio = this.audio
    if (!audio || audio.paused || this.isFadingOut) return
    this.generation += 1
    this.fadeOut(() => audio.pause())
  }

  // Arrêt et oubli de l'adresse (plus d'extrait, fin de partie), avec le même fondu court si le son joue
  // encore. Sans effet s'il n'y a rien à arrêter.
  stop(): void {
    const audio = this.audio
    if ((this.url === null && (!audio || audio.paused)) || this.isFadingOut) return
    this.generation += 1
    if (!audio || audio.paused) {
      this.unload()
      return
    }
    const generation = this.generation
    this.fadeOut(() => {
      if (generation === this.generation) this.unload()
    })
  }

  // Fondu court jusqu'au silence (rampe native ; lecteur simple : coupure au volume déjà réglé), puis onDone.
  private fadeOut(onDone: () => void): void {
    this.isFadingOut = true
    this.scheduled = null
    if (this.routed) {
      const { context, gain } = this.routed
      const now = context.currentTime
      holdAt(gain.gain, now)
      gain.gain.linearRampToValueAtTime(0, now + AUDIO_STOP_FADE_MS / 1000)
    }
    this.cancelStop()
    this.stopTimer = setTimeout(() => {
      this.stopTimer = null
      this.isFadingOut = false
      onDone()
    }, this.routed ? AUDIO_STOP_FADE_MS + 20 : 0)
  }

  // Fondu court jusqu'au silence (rampe native), sans arrêter l'élément : terminé à la promesse.
  private fadeOutNow(): Promise<void> {
    if (!this.routed) return Promise.resolve()
    const { context, gain } = this.routed
    const now = context.currentTime
    this.scheduled = null
    holdAt(gain.gain, now)
    gain.gain.linearRampToValueAtTime(0, now + AUDIO_STOP_FADE_MS / 1000)
    return new Promise((resolve) => setTimeout(resolve, AUDIO_STOP_FADE_MS + 20))
  }

  // Volume à zéro avant un démarrage.
  private silence(): void {
    if (this.routed) {
      const { context, gain } = this.routed
      gain.gain.cancelScheduledValues(context.currentTime)
      gain.gain.setValueAtTime(0, context.currentTime)
    } else if (this.plain) {
      this.plain.volume = 0
    }
  }

  private cancelStop(): void {
    if (this.stopTimer !== null) clearTimeout(this.stopTimer)
    this.stopTimer = null
  }

  private unload(): void {
    this.cancelStop()
    const audio = this.audio
    this.url = null
    this.scheduled = null
    if (!audio) return
    audio.pause()
    audio.removeAttribute('src')
    audio.load()
  }
}

// Un seul lecteur pour toute la page : le déblocage du son (plan B) vaut pour lui.
export const tvAudioPlayer = new TvAudioPlayer()
