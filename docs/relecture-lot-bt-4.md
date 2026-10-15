# Relecture du lot BT-4 : 5 blind tests

Vérification Deezer du 2026-10-15 (`npm run music:fans -- 4 disco-annees-70 disco-a-la-francaise funk-soul-annees-70 rock-annees-60 pop-annees-70`). Fans (nb_fan) à cette date ;
ils changent avec le temps et ne sont jamais publiés. « Impossible » : chaque artiste a moins de 800 fans le jour de la
vérification. Morceaux cochés par `npm run music:verify` (« auto ») : artiste et titre identiques à Deezer, version
originale, extrait présent, paroles non explicites, extrait qui tient dans le minuteur. Après écoute, passer
`verifiedBy` à `"listened"` dans `content/music-check/<quizId>.json`.

## À écouter en priorité (5)

- `funk-soul-annees-70/fs70-03` Funkadelic — One Nation Under a Groove (2 artistes « Funkadelic » sur Deezer, album « One Nation Under a Groove - 2015 Remastered Edition ») : <https://www.deezer.com/track/136922594>
- `funk-soul-annees-70/fs70-06` Sly & The Family Stone — Family Affair (2 artistes « Sly & The Family Stone » sur Deezer, album « There's A Riot Goin' On (Expanded Edition) ») : <https://www.deezer.com/track/549579>
- `funk-soul-annees-70/fs70-09` Curtis Mayfield — Move On Up (2 artistes « Curtis Mayfield » sur Deezer, album « Move on Up (Single Edit) ») : <https://www.deezer.com/track/115195420>
- `disco-annees-70/d70-01` Village People — Y.M.C.A. (Deezer : YMCA) (échantillon de ce blind test) : <https://www.deezer.com/track/3809086042>
- `disco-a-la-francaise/dfr-01` Patrick Juvet — Où sont les femmes ? (Deezer : Où sont les femmes) (échantillon de ce blind test) : <https://www.deezer.com/track/953339>

## Les blind tests

| Blind test | Identifiant | Genre | Décennie | Niveau |
|---|---|---|---|---|
| Disco des années 70 | `disco-annees-70` | Disco/Funk | 1970 | Moyen |
| Disco à la française | `disco-a-la-francaise` | Disco/Funk | 1970 | Moyen |
| Funk et soul des années 70 | `funk-soul-annees-70` | Disco/Funk | 1970 | Difficile |
| Rock des années 60 | `rock-annees-60` | Rock | 1960 | Difficile |
| Pop des années 70 | `pop-annees-70` | Pop | 1970 | Difficile |

## Disco des années 70 (`disco-annees-70`)

| Question | Id Deezer | Artiste | Titre | Genre | Niveau | Fans (nb_fan) | Vérifié le | Extrait | Explicite | Vérifié par |
|---|---|---|---|---|---|---|---|---|---|---|
| d70-01 | [3809086042](https://www.deezer.com/track/3809086042) | Village People | Y.M.C.A. (Deezer : YMCA) | Disco/Funk | Moyen | 137 375 | 2026-10-15 | oui | non | auto |
| d70-02 | [364951](https://www.deezer.com/track/364951) | Boney M. | Daddy Cool | Disco/Funk | Moyen | 955 634 | 2026-10-15 | oui | non | auto |
| d70-03 | [884040](https://www.deezer.com/track/884040) | ABBA | Voulez-Vous | Disco/Funk | Moyen | 3 196 389 | 2026-10-15 | oui | non | auto |
| d70-04 | [538706952](https://www.deezer.com/track/538706952) | Donna Summer | Hot Stuff | Disco/Funk | Moyen | 851 827 | 2026-10-15 | oui | non | auto |
| d70-05 | [3151321](https://www.deezer.com/track/3151321) | KC & The Sunshine Band | That's the Way (I Like It) | Disco/Funk | Moyen | 78 509 | 2026-10-15 | oui | non | auto |
| d70-06 | [404691712](https://www.deezer.com/track/404691712) | Anita Ward | Ring My Bell | Disco/Funk | Moyen | 10 917 | 2026-10-15 | oui | non | auto |
| d70-07 | [139138751](https://www.deezer.com/track/139138751) | Bee Gees | Night Fever | Disco/Funk | Moyen | 2 614 513 | 2026-10-15 | oui | non | auto |
| d70-08 | [12276222](https://www.deezer.com/track/12276222) | The Trammps | Disco Inferno | Disco/Funk | Moyen | 36 776 | 2026-10-15 | oui | non | auto |
| d70-09 | [10370275](https://www.deezer.com/track/10370275) | Amii Stewart | Knock on Wood | Disco/Funk | Moyen | 6 356 | 2026-10-15 | oui | non | auto |
| d70-10 | [6614292](https://www.deezer.com/track/6614292) | Chic | Good Times | Disco/Funk | Moyen | 392 457 | 2026-10-15 | oui | non | auto |

## Disco à la française (`disco-a-la-francaise`)

| Question | Id Deezer | Artiste | Titre | Genre | Niveau | Fans (nb_fan) | Vérifié le | Extrait | Explicite | Vérifié par |
|---|---|---|---|---|---|---|---|---|---|---|
| dfr-01 | [953339](https://www.deezer.com/track/953339) | Patrick Juvet | Où sont les femmes ? (Deezer : Où sont les femmes) | Disco/Funk | Moyen | 13 423 | 2026-10-15 | oui | non | auto |
| dfr-02 | [743754](https://www.deezer.com/track/743754) | Claude François | Magnolias for ever | Disco/Funk | Moyen | 411 447 | 2026-10-15 | oui | non | auto |
| dfr-03 | [7314746](https://www.deezer.com/track/7314746) | Dalida | Laissez-moi danser | Disco/Funk | Moyen | 606 898 | 2026-10-15 | oui | non | auto |
| dfr-04 | [740773](https://www.deezer.com/track/740773) | Sheila | Spacer | Disco/Funk | Moyen | 39 570 | 2026-10-15 | oui | non | auto |
| dfr-05 | [1013210122](https://www.deezer.com/track/1013210122) | Cerrone | Supernature | Disco/Funk | Moyen | 61 384 | 2026-10-15 | oui | non | auto |
| dfr-06 | [3039725731](https://www.deezer.com/track/3039725731) | Space | Magic Fly | Disco/Funk | Moyen | 2 376 | 2026-10-15 | oui | non | auto |
| dfr-07 | [1436213772](https://www.deezer.com/track/1436213772) | Ottawan | D.I.S.C.O. | Disco/Funk | Moyen | 17 221 | 2026-10-15 | oui | non | auto |
| dfr-08 | [13025896](https://www.deezer.com/track/13025896) | Gibson Brothers | Cuba | Disco/Funk | Moyen | 2 954 | 2026-10-15 | oui | non | auto |
| dfr-09 | [46328881](https://www.deezer.com/track/46328881) | France Gall | Musique | Disco/Funk | Moyen | 822 337 | 2026-10-15 | oui | non | auto |
| dfr-10 | [7978344](https://www.deezer.com/track/7978344) | Voyage | Souvenirs | Disco/Funk | Moyen | 27 171 | 2026-10-15 | oui | non | auto |

## Funk et soul des années 70 (`funk-soul-annees-70`)

| Question | Id Deezer | Artiste | Titre | Genre | Niveau | Fans (nb_fan) | Vérifié le | Extrait | Explicite | Vérifié par |
|---|---|---|---|---|---|---|---|---|---|---|
| fs70-01 | [102811506](https://www.deezer.com/track/102811506) | James Brown | Get Up Offa That Thing | Disco/Funk | Difficile | 1 446 237 | 2026-10-15 | oui | non | auto |
| fs70-02 | [2515096](https://www.deezer.com/track/2515096) | Parliament | Flash Light | Disco/Funk | Difficile | 40 988 | 2026-10-15 | oui | non | auto |
| fs70-03 | [136922594](https://www.deezer.com/track/136922594) | Funkadelic | One Nation Under a Groove | Disco/Funk | Difficile | 62 877 | 2026-10-15 | oui | non | auto |
| fs70-04 | [646290872](https://www.deezer.com/track/646290872) | Kool & The Gang | Jungle Boogie | Disco/Funk | Difficile | 934 995 | 2026-10-15 | oui | non | auto |
| fs70-05 | [549335232](https://www.deezer.com/track/549335232) | Ohio Players | Fire | Disco/Funk | Difficile | 26 469 | 2026-10-15 | oui | non | auto |
| fs70-06 | [549579](https://www.deezer.com/track/549579) | Sly & The Family Stone | Family Affair | Disco/Funk | Difficile | 120 928 | 2026-10-15 | oui | non | auto |
| fs70-07 | [143042822](https://www.deezer.com/track/143042822) | War | Low Rider | Disco/Funk | Difficile | 19 649 | 2026-10-15 | oui | non | auto |
| fs70-08 | [12164497](https://www.deezer.com/track/12164497) | Average White Band | Pick Up the Pieces | Disco/Funk | Difficile | 33 474 | 2026-10-15 | oui | non | auto |
| fs70-09 | [115195420](https://www.deezer.com/track/115195420) | Curtis Mayfield | Move On Up | Disco/Funk | Difficile | 205 537 | 2026-10-15 | oui | non | auto |
| fs70-10 | [1119126](https://www.deezer.com/track/1119126) | Commodores | Brick House | Disco/Funk | Difficile | 299 045 | 2026-10-15 | oui | non | auto |

## Rock des années 60 (`rock-annees-60`)

| Question | Id Deezer | Artiste | Titre | Genre | Niveau | Fans (nb_fan) | Vérifié le | Extrait | Explicite | Vérifié par |
|---|---|---|---|---|---|---|---|---|---|---|
| r60-01 | [2319655705](https://www.deezer.com/track/2319655705) | The Kinks (Deezer : Kinks) | You Really Got Me | Rock | Difficile | 208 | 2026-10-15 | oui | non | auto |
| r60-02 | [136341550](https://www.deezer.com/track/136341550) | The Who | My Generation | Rock | Difficile | 2 174 465 | 2026-10-15 | oui | non | auto |
| r60-03 | [3614129](https://www.deezer.com/track/3614129) | The Doors | Light My Fire | Rock | Difficile | 3 808 144 | 2026-10-15 | oui | non | auto |
| r60-04 | [4952885](https://www.deezer.com/track/4952885) | Jimi Hendrix | Purple Haze | Rock | Difficile | 4 268 498 | 2026-10-15 | oui | non | auto |
| r60-05 | [1175615](https://www.deezer.com/track/1175615) | Cream | Sunshine of Your Love | Rock | Difficile | 334 269 | 2026-10-15 | oui | non | auto |
| r60-06 | [107659972](https://www.deezer.com/track/107659972) | The Animals | The House of the Rising Sun | Rock | Difficile | 357 991 | 2026-10-15 | oui | non | auto |
| r60-07 | [729595152](https://www.deezer.com/track/729595152) | The Troggs | Wild Thing | Rock | Difficile | 17 203 | 2026-10-15 | oui | non | auto |
| r60-08 | [540202122](https://www.deezer.com/track/540202122) | Steppenwolf | Born to Be Wild | Rock | Difficile | 245 499 | 2026-10-15 | oui | non | auto |
| r60-09 | [757921442](https://www.deezer.com/track/757921442) | The Zombies | She's Not There | Rock | Difficile | 49 140 | 2026-10-15 | oui | non | auto |
| r60-10 | [570650](https://www.deezer.com/track/570650) | Jefferson Airplane | Somebody to Love | Rock | Difficile | 220 252 | 2026-10-15 | oui | non | auto |

## Pop des années 70 (`pop-annees-70`)

| Question | Id Deezer | Artiste | Titre | Genre | Niveau | Fans (nb_fan) | Vérifié le | Extrait | Explicite | Vérifié par |
|---|---|---|---|---|---|---|---|---|---|---|
| p70-01 | [1124103](https://www.deezer.com/track/1124103) | Elton John | Crocodile Rock | Pop | Difficile | 3 009 342 | 2026-10-15 | oui | non | auto |
| p70-02 | [74790480](https://www.deezer.com/track/74790480) | Carpenters | (They Long To Be) Close To You | Pop | Difficile | 257 299 | 2026-10-15 | oui | non | auto |
| p70-03 | [1581601](https://www.deezer.com/track/1581601) | 10cc | I'm Not in Love | Pop | Difficile | 44 249 | 2026-10-15 | oui | non | auto |
| p70-04 | [63480987](https://www.deezer.com/track/63480987) | Fleetwood Mac | Dreams | Pop | Difficile | 1 677 277 | 2026-10-15 | oui | non | auto |
| p70-05 | [2660357262](https://www.deezer.com/track/2660357262) | Wings | Band on the Run | Pop | Difficile | 53 | 2026-10-15 | oui | non | auto |
| p70-06 | [14333215](https://www.deezer.com/track/14333215) | Billy Joel | Piano Man | Pop | Difficile | 862 933 | 2026-10-15 | oui | non | auto |
| p70-07 | [3785439982](https://www.deezer.com/track/3785439982) | Gilbert O'Sullivan | Alone Again (Naturally) | Pop | Difficile | 18 333 | 2026-10-15 | oui | non | auto |
| p70-08 | [717104332](https://www.deezer.com/track/717104332) | Harry Nilsson | Without You | Pop | Difficile | 40 613 | 2026-10-15 | oui | non | auto |
| p70-09 | [13174764](https://www.deezer.com/track/13174764) | Simon & Garfunkel | Bridge over Troubled Water | Pop | Difficile | 1 168 529 | 2026-10-15 | oui | non | auto |
| p70-10 | [3806167112](https://www.deezer.com/track/3806167112) | Bonnie Tyler | It's a Heartache | Pop | Difficile | 596 855 | 2026-10-15 | oui | non | auto |

