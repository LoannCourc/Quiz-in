// Mesure une liste « artiste|titre » (une par ligne sur l'entrée standard) : niveau, fans, position, rang, année.
import { measure } from './deezer.mjs'
import { measuredLevel } from './levels.mjs'
import { firstYear } from './pool.mjs'

const input = await new Promise((resolve) => { let s = ''; process.stdin.on('data', (d) => (s += d)).on('end', () => resolve(s)) })
for (const line of input.split('\n').map((l) => l.trim()).filter(Boolean)) {
  const [artist, title] = line.split('|')
  const m = await measure(artist, title)
  if (!m.found) { console.log(`${artist} – ${title} : introuvable`); continue }
  console.log(`${measuredLevel(m) ?? '—'} | ${m.deezerArtist} – ${m.deezerTitle} | ${m.nbFan} | ${m.position} | ${m.rank} | ${await firstYear(m.deezerArtist, m.deezerTitle, m.trackId)}`)
}
