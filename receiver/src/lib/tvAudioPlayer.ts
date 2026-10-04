// Lecteur audio de la TV (blind test) : un seul élément <audio>, jamais visible. La TV est la seule à
// jouer le son ; les joueurs n'entendent que la TV.

// playing : le son joue. blocked : le navigateur refuse la lecture sans geste de l'utilisateur
// (plan B dans Chrome, tant que personne n'a cliqué dans la page). failed : adresse expirée,
// réseau, format, ou délai dépassé. superseded : un appel plus récent (ou stop) a pris la main ;
// cet appel ne joue rien (jamais deux lectures en même temps).
export type PlayResult = 'playing' | 'blocked' | 'failed' | 'superseded'

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
  // Numéro du dernier ordre (play ou stop) : un play dépassé pendant son chargement s'abandonne.
  private generation = 0

  constructor() {
    this.audio.preload = 'auto'
  }

  get isPlaying(): boolean {
    return !this.audio.paused
  }

  get positionS(): number {
    return this.audio.currentTime
  }

  get currentUrl(): string | null {
    return this.url
  }

  // Joue l'adresse à la position demandée (en secondes) et au volume demandé (0 à 1).
  async play(url: string, positionS: number, volume: number): Promise<PlayResult> {
    const generation = ++this.generation
    if (this.url !== url) {
      this.url = url
      this.audio.src = url
      this.audio.load()
    }
    const isLoaded = await waitFor(this.audio, 'loadedmetadata', LOAD_TIMEOUT_MS)
    if (generation !== this.generation) return 'superseded'
    if (!isLoaded) return 'failed'
    this.audio.currentTime = positionS
    this.audio.volume = Math.max(0, Math.min(1, volume))
    try {
      await this.audio.play()
      if (generation !== this.generation) return 'superseded'
      return 'playing'
    } catch (error) {
      // play() interrompu par une pause ou un stop plus récent : abandon normal, pas un échec.
      if (generation !== this.generation) return 'superseded'
      return error instanceof DOMException && error.name === 'NotAllowedError' ? 'blocked' : 'failed'
    }
  }

  setVolume(volume: number): void {
    this.audio.volume = Math.max(0, Math.min(1, volume))
  }

  pause(): void {
    this.generation += 1
    this.audio.pause()
  }

  // Arrêt et oubli de l'adresse (question suivante, fin de partie).
  // Sans effet s'il n'y a rien à arrêter (appelé à chaque recalage quand il n'y a pas d'extrait).
  stop(): void {
    if (this.url === null && this.audio.paused) return
    this.generation += 1
    this.audio.pause()
    this.audio.removeAttribute('src')
    this.audio.load()
    this.url = null
  }
}

// Un seul lecteur pour toute la page : le déblocage du son (plan B) vaut pour lui.
export const tvAudioPlayer = new TvAudioPlayer()
