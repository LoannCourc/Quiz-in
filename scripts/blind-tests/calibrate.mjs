// Mesures des 12 références rap français (étape 1 de la refonte) : fans, position dans le top, rang de la piste.
import { measure } from './deezer.mjs'

export const REFERENCES = [
  ['F', 'IAM', 'Je danse le MIA'], ['F', 'Ninho', "La vie qu'on mène"], ['F', '13 Organisé', 'Bande organisée'],
  ['M', 'Damso', 'Autotune'], ['M', 'Vald', 'Superman'], ['M', 'Orelsan', 'Jour meilleur'],
  ['D', 'La Fève', 'Loyal'], ['D', 'Ino Casablanca', 'Oranj'], ['D', 'Ben PLG', 'Chaque jour un peu plus'],
  ['I', 'Juice', 'Sans toi'], ['I', 'Dakeez', 'Adrénaline'], ['I', 'Krisy', 'Sisyphe'],
]

for (const [level, artist, title] of REFERENCES) {
  const m = await measure(artist, title)
  console.log([level, artist, title, m.found ? `${m.deezerArtist} – ${m.deezerTitle}` : 'INTROUVABLE', m.nbFan, m.position, m.rank, m.preview, m.explicit].join(' | '))
}
