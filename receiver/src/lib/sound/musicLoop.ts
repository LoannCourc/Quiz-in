// Musiques de la TV (spec 17) : fichier téléchargé et décodé une fois, puis joué en boucle par Web Audio,
// à l'échantillon près (la balise <audio loop> laisse un blanc à chaque tour).

export interface LoadedMusic {
  buffer: AudioBuffer
  // Taille du fichier téléchargé, en octets.
  bytes: number
}

export async function loadMusic(context: AudioContext, url: string): Promise<LoadedMusic> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const data = await response.arrayBuffer()
  const bytes = data.byteLength
  // decodeAudioData consomme le tampon : la taille est relevée avant.
  return { buffer: await context.decodeAudioData(data), bytes }
}

// Mémoire occupée par la musique décodée (échantillons en 32 bits).
export function decodedBytes(buffer: AudioBuffer): number {
  return buffer.length * buffer.numberOfChannels * 4
}

const STOP_FADE_S = 0.8

// Joue la boucle dans `input` avec un fondu d'entrée ; la fonction renvoyée l'arrête par un fondu.
export function playLoop(context: AudioContext, input: AudioNode, buffer: AudioBuffer, fadeInS: number): () => void {
  const source = context.createBufferSource()
  source.buffer = buffer
  source.loop = true
  const gain = context.createGain()
  const startAt = context.currentTime
  gain.gain.setValueAtTime(0, startAt)
  gain.gain.linearRampToValueAtTime(1, startAt + fadeInS)
  source.connect(gain)
  gain.connect(input)
  source.start(startAt)
  let isStopped = false
  return () => {
    if (isStopped) return
    isStopped = true
    const now = context.currentTime
    gain.gain.cancelScheduledValues(now)
    gain.gain.setValueAtTime(gain.gain.value, now)
    gain.gain.linearRampToValueAtTime(0, now + STOP_FADE_S)
    source.stop(now + STOP_FADE_S + 0.05)
    source.onended = () => gain.disconnect()
  }
}
