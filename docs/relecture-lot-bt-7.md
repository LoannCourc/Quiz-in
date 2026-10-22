# Relecture du lot BT-7 : 1 blind tests

Vérification Deezer du 2026-10-22 (`npm run music:review -- 7 chansons-de-fete`). Popularité du morceau (rank) et
fans de l'artiste (nb_fan) à cette date ; ils changent avec le temps et ne sont jamais publiés. « Impossible » : rank sous
200 000 (titre d'album très peu écouté) et artiste à 50 000 fans ou plus, le jour de la vérification.
Morceaux cochés par `npm run music:verify` (« auto ») : artiste et titre identiques à Deezer, version
originale, extrait présent, paroles non explicites, extrait qui tient dans le minuteur. Après écoute, passer
`verifiedBy` à `"listened"` dans `content/music-check/<quizId>.json`.

## À écouter en priorité (5)

- `chansons-de-fete/fete-02` Pierre Perret — Les jolies colonies de vacances (2 artistes « Pierre Perret » sur Deezer) : <https://www.deezer.com/track/3487044821>
- `chansons-de-fete/fete-04` Vincè la petite culotte — La goffa Lolita (2 artistes « Vincè la petite culotte » sur Deezer) : <https://www.deezer.com/track/1619126272>
- `chansons-de-fete/fete-08` Georges Brassens — Le gorille (2 artistes « Georges Brassens » sur Deezer) : <https://www.deezer.com/track/14396302>
- `chansons-de-fete/fete-01` Patrick Sébastien — Les sardines (échantillon) : <https://www.deezer.com/track/66644816>
- `chansons-de-fete/fete-03` Harmonie bayonnaise — Peña Baiona (échantillon) : <https://www.deezer.com/track/3852338>

## Les blind tests

| Blind test | Identifiant | Genre | Décennie | Niveau |
|---|---|---|---|---|
| Chansons de fête | `chansons-de-fete` | Chanson | toutes époques | ? |

## Chansons de fête (`chansons-de-fete`)

| Question | Id Deezer | Artiste | Titre | Genre | Niveau | Rank | Fans (nb_fan) | Vérifié le | Extrait | Explicite | Vérifié par |
|---|---|---|---|---|---|---|---|---|---|---|---|
| fete-01 | [66644816](https://www.deezer.com/track/66644816) | Patrick Sébastien | Les sardines | Chanson | ? | 659 236 | 54 464 | 2026-10-22 | oui | non | auto |
| fete-02 | [3487044821](https://www.deezer.com/track/3487044821) | Pierre Perret | Les jolies colonies de vacances | Chanson | ? | 498 096 | 77 345 | 2026-10-22 | oui | non | auto |
| fete-03 | [3852338](https://www.deezer.com/track/3852338) | Harmonie bayonnaise | Peña Baiona | Chanson | ? | 236 048 | 1 182 | 2026-10-22 | oui | non | auto |
| fete-04 | [1619126272](https://www.deezer.com/track/1619126272) | Vincè la petite culotte | La goffa Lolita | Chanson | ? | 878 153 | 11 602 | 2026-10-22 | oui | non | auto |
| fete-05 | [2649989182](https://www.deezer.com/track/2649989182) | Sébastien Patoche | La tournée du patron | Chanson | ? | 751 494 | 6 061 | 2026-10-22 | oui | non | auto |
| fete-06 | [2280698](https://www.deezer.com/track/2280698) | Les Charlots | Merci patron (Deezer : Merci Patron) | Chanson | ? | 483 302 | 6 762 | 2026-10-22 | oui | non | auto |
| fete-07 | [64535115](https://www.deezer.com/track/64535115) | Boby Lapointe | Framboise | Chanson | ? | 258 927 | 43 304 | 2026-10-22 | oui | non | auto |
| fete-08 | [14396302](https://www.deezer.com/track/14396302) | Georges Brassens | Le gorille | Chanson | ? | 639 228 | 661 166 | 2026-10-22 | oui | non | auto |
| fete-09 | [643779592](https://www.deezer.com/track/643779592) | Les Quatre Barbus | Chevaliers de la table ronde | Chanson | ? | 253 408 | 1 588 | 2026-10-22 | oui | non | auto |
| fete-10 | [291132](https://www.deezer.com/track/291132) | Lina Margy | Ah ! Le petit vin blanc (Deezer : Ah le petit vin blanc) | Chanson | ? | 347 915 | 1 029 | 2026-10-22 | oui | non | auto |

