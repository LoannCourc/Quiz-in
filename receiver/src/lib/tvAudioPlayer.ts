// Lecteur audio de la TV (blind test) : un seul élément <audio>, jamais visible. La TV est la seule à
// jouer le son ; les joueurs n'entendent que la TV.

// playing : le son joue. blocked : le navigateur refuse la lecture sans geste de l'utilisateur
// (plan B dans Chrome, tant que personne n'a cliqué dans la page). failed : adresse expirée,
// réseau, format, ou délai dépassé.
export type PlayResult = 'playing' | 'blocked' | 'failed'

// Délai maximal pour charger le début du fichier avant de considérer la lecture comme impossible.
const LOAD_TIMEOUT_MS = 8_000

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

  constructor() {
    this.audio.preload = 'auto'
  }

  get isPlaying(): boolean {
    return !this.audio.paused
  }

  get positionS(): number {
    return this.audio.currentTime
  }

  // Joue l'adresse à la position demandée (en secondes) et au volume demandé (0 à 1).
  async play(url: string, positionS: number, volume: number): Promise<PlayResult> {
    if (this.url !== url) {
      this.url = url
      this.audio.src = url
      this.audio.load()
    }
    if (!(await waitFor(this.audio, 'loadedmetadata', LOAD_TIMEOUT_MS)) || this.url !== url) return 'failed'
    this.audio.currentTime = positionS
    this.audio.volume = Math.max(0, Math.min(1, volume))
    try {
      await this.audio.play()
      return 'playing'
    } catch (error) {
      return error instanceof DOMException && error.name === 'NotAllowedError' ? 'blocked' : 'failed'
    }
  }

  setVolume(volume: number): void {
    this.audio.volume = Math.max(0, Math.min(1, volume))
  }

  pause(): void {
    this.audio.pause()
  }

  // Arrêt et oubli de l'adresse (question suivante, fin de partie).
  stop(): void {
    this.audio.pause()
    this.audio.removeAttribute('src')
    this.audio.load()
    this.url = null
  }
}

// Un seul lecteur pour toute la page : le déblocage du son (plan B) vaut pour lui.
export const tvAudioPlayer = new TvAudioPlayer()
