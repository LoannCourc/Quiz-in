// Versions non explicites (avec extrait) d'un morceau, toutes éditions confondues.
import { editions } from './deezer.mjs'
for (const [artist, title] of JSON.parse(process.argv[2])) {
  const all = await editions(artist, title)
  console.log(`${artist} – ${title} : ${all.length} éditions, non explicites : ${all.filter((t) => !t.explicit_lyrics).map((t) => `${t.title} (${t.rank})`).join(', ') || 'aucune'}`)
}
