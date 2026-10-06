// Boucle sur le début d'un fichier de musique (spec 17) : quand la fin du fichier ne raccorde pas avec son
// début (fondu de sortie, dernière note), on boucle sur [0, endS), là où la musique se répète. Pour qu'aucun
// clic ne s'entende au raccord, la fin de la boucle est fondue dans le début (fondu enchaîné de fadeS) :
// la boucle joue alors de fadeS à endS + fadeS, et le saut se fait entre deux échantillons presque égaux.

export interface LoopRegion {
  startS: number
  endS: number
}

// Modifie samples (son décodé, en mono) et renvoie la zone à boucler (loopStart / loopEnd de Web Audio).
export function bakeLoopSeam(samples: Float32Array, sampleRate: number, endS: number, fadeS: number): LoopRegion {
  const end = Math.round(endS * sampleRate)
  const fade = Math.max(0, Math.min(Math.round(fadeS * sampleRate), samples.length - end, end))
  for (let index = 0; index < fade; index++) {
    const weight = index / fade
    samples[end + index] = samples[end + index] * (1 - weight) + samples[index] * weight
  }
  return { startS: fade / sampleRate, endS: (end + fade) / sampleRate }
}
