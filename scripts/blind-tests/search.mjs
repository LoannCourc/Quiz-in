// Recherche libre chez Deezer pour trouver l'interprète d'un morceau (versions françaises de Disney, génériques) :
// node scripts/blind-tests/search.mjs "<requête>" [...] → artiste, titre, album, rang, fans, extrait (8 premiers).
import { deezer } from './deezer.mjs'

for (const query of process.argv.slice(2)) {
  const result = await deezer(`/search?q=${encodeURIComponent(query)}&limit=25`)
  console.log(`# ${query}`)
  for (const track of (result.data ?? []).slice(0, 8)) {
    console.log(`  ${track.artist.name} | ${track.title} | ${track.album.title} | rang ${track.rank} | ${track.preview ? 'extrait' : 'sans extrait'}${track.explicit_lyrics ? ' | explicite' : ''}`)
  }
}
