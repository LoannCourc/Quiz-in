import { AUDIO_FADE_IN_MS, AUDIO_STOP_FADE_MS } from '@shared/constants'

// Lecteur audio de la TV (blind test) : un seul élément <audio>, jamais visible. La TV est la seule à
// jouer le son ; les joueurs n'entendent que la TV. Jamais de coupure ni de démarrage sec : le volume
// monte et descend toujours par un fondu court (une coupure sèche produit un clic ou une bouffée de son
// sur certaines TV).

// playing : le son joue. blocked : le navigateur refuse la lecture sans geste de l'utilisateur
// (plan B dans Chrome, tant que personne n'a cliqué dans la page). failed : adresse expirée,
// réseau, format, ou délai dépassé. superseded : un appel plus récent (ou un arrêt) a pris la main ;
// cet appel ne joue rien (jamais deux lectures en même temps).
export type PlayResult = 'playing' | 'blocked' | 'failed' | 'superseded'

// Délai maximal pour charger le début du fichier avant de considérer la lecture comme impossible.
const LOAD_TIMEOUT_MS = 8_000
// Pas des fondus (environ une image).
const FADE_STEP_MS = 16

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

class TvAudioPlayer {
  private readonly audio = new Audio()
  private url: string | null = null
  // Numéro du dernier ordre (play ou arrêt) : un play dépassé pendant son chargement s'abandonne.
  private generation = 0
  private fadeTimer: ReturnType<typeof setInterval> | null = null
  private isFadingOut = false

  constructor() {
    this.audio.preload = 'auto'
  }

  // Vrai si le son joue et n'est pas en train de s'éteindre.
  get isPlaying(): boolean {
    return !this.audio.paused && !this.isFadingOut
  }

  get positionS(): number {
    return this.audio.currentTime
  }

  get currentUrl(): string | null {
    return this.url
  }

  // Joue l'adresse à la position demandée (en secondes), avec un fondu d'entrée jusqu'au volume demandé.
  async play(url: string, positionS: number, volume: number): Promise<PlayResult> {
    const generation = ++this.generation
    // Un fondu de sortie en cours est abandonné : c'est cette lecture qui prend la main.
    this.cancelFade()
    this.isFadingOut = false
    if (this.url !== url) {
      this.url = url
      this.audio.src = url
      this.audio.load()
    }
    const isLoaded = await waitFor(this.audio, 'loadedmetadata', LOAD_TIMEOUT_MS)
    if (generation !== this.generation) return 'superseded'
    if (!isLoaded) return 'failed'
    this.audio.currentTime = positionS
    this.audio.volume = 0
    try {
      await this.audio.play()
    } catch (error) {
      // play() interrompu par un arrêt plus récent : abandon normal, pas un échec.
      if (generation !== this.generation) return 'superseded'
      return error instanceof DOMException && error.name === 'NotAllowedError' ? 'blocked' : 'failed'
    }
    if (generation !== this.generation) {
      // Annulé pendant le démarrage : le volume est encore à 0, on remet en pause sans rien faire entendre.
      if (!this.isFadingOut) this.audio.pause()
      return 'superseded'
    }
    this.fadeTo(volume, AUDIO_FADE_IN_MS)
    return 'playing'
  }

  // Abandonne un démarrage en cours de chargement (la phase a changé entre-temps).
  cancelPending(): void {
    this.generation += 1
  }

  // Volume suivi pendant la lecture (fondu de fin du timer) : sans effet pendant un fondu en cours.
  setVolume(volume: number): void {
    if (this.fadeTimer === null) this.audio.volume = clampVolume(volume)
  }

  // Arrêt avec un fondu très court ; l'adresse reste chargée (reprise après une pause sans rechargement).
  fadeOutAndPause(): void {
    if (this.audio.paused || this.isFadingOut) return
    this.generation += 1
    this.isFadingOut = true
    this.fadeTo(0, AUDIO_STOP_FADE_MS, () => {
      this.audio.pause()
      this.isFadingOut = false
    })
  }

  // Arrêt et oubli de l'adresse (plus d'extrait, fin de partie), avec le même fondu très court si le
  // son joue encore. Sans effet s'il n'y a rien à arrêter.
  stop(): void {
    if ((this.url === null && this.audio.paused) || this.isFadingOut) return
    this.generation += 1
    if (this.audio.paused) {
      this.unload()
      return
    }
    this.isFadingOut = true
    const generation = this.generation
    this.fadeTo(0, AUDIO_STOP_FADE_MS, () => {
      this.isFadingOut = false
      if (generation === this.generation) this.unload()
    })
  }

  private unload(): void {
    this.cancelFade()
    this.audio.pause()
    this.audio.removeAttribute('src')
    this.audio.load()
    this.url = null
  }

  // Fait varier le volume linéairement jusqu'à target en durationMs, puis appelle onDone.
  private fadeTo(target: number, durationMs: number, onDone?: () => void): void {
    this.cancelFade()
    const from = this.audio.volume
    const to = clampVolume(target)
    const startedAt = performance.now()
    this.fadeTimer = setInterval(() => {
      const progress = Math.min(1, (performance.now() - startedAt) / durationMs)
      this.audio.volume = clampVolume(from + (to - from) * progress)
      if (progress < 1) return
      this.cancelFade()
      onDone?.()
    }, FADE_STEP_MS)
  }

  private cancelFade(): void {
    if (this.fadeTimer !== null) clearInterval(this.fadeTimer)
    this.fadeTimer = null
  }
}

// Un seul lecteur pour toute la page : le déblocage du son (plan B) vaut pour lui.
export const tvAudioPlayer = new TvAudioPlayer()
