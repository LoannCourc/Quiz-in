# Relecture du lot BT-3 : 5 blind tests

Vérification Deezer du 2026-10-15 (`npm run music:fans -- 3 electro-annees-80 rock-annees-2000 rap-francais-annees-90 rap-francais-annees-2010 chanson-annees-2000`). Fans (nb_fan) à cette date ;
ils changent avec le temps et ne sont jamais publiés. « Impossible » : chaque artiste a moins de 800 fans le jour de la
vérification. Morceaux cochés par `npm run music:verify` (« auto ») : artiste et titre identiques à Deezer, version
originale, extrait présent, paroles non explicites, extrait qui tient dans le minuteur. Après écoute, passer
`verifiedBy` à `"listened"` dans `content/music-check/<quizId>.json`.

## À écouter en priorité (5)

- `rap-francais-annees-2010/rf10-05` Soprano — Clown (3 artistes « Soprano » sur Deezer, album « Cosmopolitanie (Deluxe Edition) ») : <https://www.deezer.com/track/576822222>
- `electro-annees-80/e80-02` New Order — Blue Monday (3 artistes « New Order » sur Deezer) : <https://www.deezer.com/track/131744046>
- `electro-annees-80/e80-06` Vangelis — Chariots Of Fire (2 artistes « Vangelis » sur Deezer) : <https://www.deezer.com/track/41319291>
- `rock-annees-2000/r00-01` The White Stripes — Seven Nation Army (échantillon de ce blind test) : <https://www.deezer.com/track/1153182282>
- `rap-francais-annees-90/rf90-01` MC Solaar — Bouge de là (Part. 1) (échantillon de ce blind test) : <https://www.deezer.com/track/1410517042>

## Les blind tests

| Blind test | Identifiant | Genre | Décennie | Niveau |
|---|---|---|---|---|
| Électro des années 80 | `electro-annees-80` | Électro | 1980 | Moyen |
| Rock des années 2000 | `rock-annees-2000` | Rock | 2000 | Moyen |
| Rap français des années 90 | `rap-francais-annees-90` | Rap | 1990 | Moyen |
| Rap français des années 2010 | `rap-francais-annees-2010` | Rap | 2010 | Moyen |
| Chanson française des années 2000 | `chanson-annees-2000` | Chanson | 2000 | Moyen |

## Électro des années 80 (`electro-annees-80`)

| Question | Id Deezer | Artiste | Titre | Genre | Niveau | Fans (nb_fan) | Vérifié le | Extrait | Explicite | Vérifié par |
|---|---|---|---|---|---|---|---|---|---|---|
| e80-01 | [68513610](https://www.deezer.com/track/68513610) | Depeche Mode | Just Can't Get Enough | Électro | Moyen | 3 283 976 | 2026-10-15 | oui | non | auto |
| e80-02 | [131744046](https://www.deezer.com/track/131744046) | New Order | Blue Monday | Électro | Moyen | 949 810 | 2026-10-15 | oui | non | auto |
| e80-03 | [1173622](https://www.deezer.com/track/1173622) | Soft Cell | Tainted Love | Électro | Moyen | 363 999 | 2026-10-15 | oui | non | auto |
| e80-04 | [131741644](https://www.deezer.com/track/131741644) | Yello | Oh Yeah | Électro | Moyen | 46 066 | 2026-10-15 | oui | non | auto |
| e80-05 | [80538212](https://www.deezer.com/track/80538212) | Harold Faltermeyer | Axel F | Électro | Moyen | 16 038 | 2026-10-15 | oui | non | auto |
| e80-06 | [41319291](https://www.deezer.com/track/41319291) | Vangelis | Chariots Of Fire | Électro | Moyen | 210 938 | 2026-10-15 | oui | non | auto |
| e80-07 | [623838](https://www.deezer.com/track/623838) | Herbie Hancock | Rockit | Électro | Moyen | 429 090 | 2026-10-15 | oui | non | auto |
| e80-08 | [3153778](https://www.deezer.com/track/3153778) | Orchestral Manoeuvres In The Dark | Enola Gay | Électro | Moyen | 395 888 | 2026-10-15 | oui | non | auto |
| e80-09 | [3092940](https://www.deezer.com/track/3092940) | The Human League | Don't You Want Me | Électro | Moyen | 205 503 | 2026-10-15 | oui | non | auto |
| e80-10 | [4273260462](https://www.deezer.com/track/4273260462) | Jean-Michel Jarre | Fourth Rendez-Vous | Électro | Moyen | 321 781 | 2026-10-15 | oui | non | auto |

## Rock des années 2000 (`rock-annees-2000`)

| Question | Id Deezer | Artiste | Titre | Genre | Niveau | Fans (nb_fan) | Vérifié le | Extrait | Explicite | Vérifié par |
|---|---|---|---|---|---|---|---|---|---|---|
| r00-01 | [1153182282](https://www.deezer.com/track/1153182282) | The White Stripes | Seven Nation Army | Rock | Moyen | 1 321 459 | 2026-10-15 | oui | non | auto |
| r00-02 | [953097](https://www.deezer.com/track/953097) | The Killers | Mr. Brightside | Rock | Moyen | 2 241 184 | 2026-10-15 | oui | non | auto |
| r00-03 | [4315684](https://www.deezer.com/track/4315684) | Franz Ferdinand | Take Me Out | Rock | Moyen | 1 133 394 | 2026-10-15 | oui | non | auto |
| r00-04 | [13636688](https://www.deezer.com/track/13636688) | Muse | Plug in Baby | Rock | Moyen | 5 049 926 | 2026-10-15 | oui | non | auto |
| r00-05 | [4315310](https://www.deezer.com/track/4315310) | Arctic Monkeys | I Bet You Look Good On The Dancefloor | Rock | Moyen | 4 969 872 | 2026-10-15 | oui | non | auto |
| r00-06 | [958109](https://www.deezer.com/track/958109) | The Strokes | Last Nite | Rock | Moyen | 1 755 984 | 2026-10-15 | oui | non | auto |
| r00-07 | [2924841](https://www.deezer.com/track/2924841) | Kings of Leon | Use Somebody | Rock | Moyen | 2 396 121 | 2026-10-15 | oui | non | auto |
| r00-08 | [676183](https://www.deezer.com/track/676183) | Linkin Park | In the End | Rock | Moyen | 12 250 096 | 2026-10-15 | oui | non | auto |
| r00-09 | [26608051](https://www.deezer.com/track/26608051) | Kaiser Chiefs | Ruby | Rock | Moyen | 424 247 | 2026-10-15 | oui | non | auto |
| r00-10 | [7179758](https://www.deezer.com/track/7179758) | Queens of the Stone Age | No One Knows | Rock | Moyen | 1 374 592 | 2026-10-15 | oui | non | auto |

## Rap français des années 90 (`rap-francais-annees-90`)

| Question | Id Deezer | Artiste | Titre | Genre | Niveau | Fans (nb_fan) | Vérifié le | Extrait | Explicite | Vérifié par |
|---|---|---|---|---|---|---|---|---|---|---|
| rf90-01 | [1410517042](https://www.deezer.com/track/1410517042) | MC Solaar | Bouge de là (Part. 1) | Rap | Moyen | 305 279 | 2026-10-15 | oui | non | auto |
| rf90-02 | [73956352](https://www.deezer.com/track/73956352) | IAM | Petit frère | Rap | Moyen | 779 028 | 2026-10-15 | oui | non | auto |
| rf90-03 | [881064042](https://www.deezer.com/track/881064042) | Alliance Ethnik | Respect | Rap | Moyen | 31 065 | 2026-10-15 | oui | non | auto |
| rf90-04 | [955752](https://www.deezer.com/track/955752) | Ménélik (Deezer : Menelik) | Bye bye (Deezer : Bye Bye) | Rap | Moyen | 21 601 | 2026-10-15 | oui | non | auto |
| rf90-05 | [3134123](https://www.deezer.com/track/3134123) | Akhenaton | Bad Boys de Marseille | Rap | Moyen | 262 983 | 2026-10-15 | oui | non | auto |
| rf90-06 | [2106872967](https://www.deezer.com/track/2106872967) | Passi | Je zappe et je mate | Rap | Moyen | 86 692 | 2026-10-15 | oui | non | auto |
| rf90-07 | [3217059461](https://www.deezer.com/track/3217059461) | 113 | Tonton du bled | Rap | Moyen | 522 169 | 2026-10-15 | oui | non | auto |
| rf90-08 | [1041554](https://www.deezer.com/track/1041554) | Stomy Bugsy | Mon papa à moi est un gangster | Rap | Moyen | 33 889 | 2026-10-15 | oui | non | auto |
| rf90-09 | [3134395](https://www.deezer.com/track/3134395) | Shurik'n (Deezer : Shurik'N) | Samuraï | Rap | Moyen | 151 499 | 2026-10-15 | oui | non | auto |
| rf90-10 | [3134133](https://www.deezer.com/track/3134133) | Doc Gynéco | Né ici | Rap | Moyen | 136 034 | 2026-10-15 | oui | non | auto |

## Rap français des années 2010 (`rap-francais-annees-2010`)

| Question | Id Deezer | Artiste | Titre | Genre | Niveau | Fans (nb_fan) | Vérifié le | Extrait | Explicite | Vérifié par |
|---|---|---|---|---|---|---|---|---|---|---|
| rf10-01 | [414838122](https://www.deezer.com/track/414838122) | Orelsan | Basique | Rap | Moyen | 2 722 593 | 2026-10-15 | oui | non | auto |
| rf10-02 | [101764813](https://www.deezer.com/track/101764813) | Nekfeu | On verra | Rap | Moyen | 2 901 289 | 2026-10-15 | oui | non | auto |
| rf10-03 | [125089724](https://www.deezer.com/track/125089724) | Alonzo | Binta | Rap | Moyen | 1 961 509 | 2026-10-15 | oui | non | auto |
| rf10-04 | [714021812](https://www.deezer.com/track/714021812) | Bigflo & Oli | Plus tard | Rap | Moyen | 1 494 133 | 2026-10-15 | oui | non | auto |
| rf10-05 | [576822222](https://www.deezer.com/track/576822222) | Soprano | Clown | Rap | Moyen | 3 151 912 | 2026-10-15 | oui | non | auto |
| rf10-06 | [107030958](https://www.deezer.com/track/107030958) | Black M | Le prince Aladin | Rap | Moyen | 2 693 858 | 2026-10-15 | oui | non | auto |
| rf10-07 | [135203382](https://www.deezer.com/track/135203382) | Lartiste | Chocolat | Rap | Moyen | 1 650 023 | 2026-10-15 | oui | non | auto |
| rf10-08 | [130900292](https://www.deezer.com/track/130900292) | Georgio | Héra | Rap | Moyen | 307 137 | 2026-10-15 | oui | non | auto |
| rf10-09 | [72717420](https://www.deezer.com/track/72717420) | GIMS | Bella | Rap | Moyen | 6 962 420 | 2026-10-15 | oui | non | auto |
| rf10-10 | [71844509](https://www.deezer.com/track/71844509) | Sexion d'Assaut | Ma direction | Rap | Moyen | 2 647 578 | 2026-10-15 | oui | non | auto |

## Chanson française des années 2000 (`chanson-annees-2000`)

| Question | Id Deezer | Artiste | Titre | Genre | Niveau | Fans (nb_fan) | Vérifié le | Extrait | Explicite | Vérifié par |
|---|---|---|---|---|---|---|---|---|---|---|
| c00-01 | [583033](https://www.deezer.com/track/583033) | Bénabar | Le dîner | Chanson | Moyen | 326 519 | 2026-10-15 | oui | non | auto |
| c00-02 | [605653282](https://www.deezer.com/track/605653282) | Vincent Delerm | Fanny Ardant et moi (Deezer : Fanny ardant et moi) | Chanson | Moyen | 86 808 | 2026-10-15 | oui | non | auto |
| c00-03 | [3129431](https://www.deezer.com/track/3129431) | Raphaël | Caravane | Chanson | Moyen | 279 033 | 2026-10-15 | oui | non | auto |
| c00-04 | [3092236](https://www.deezer.com/track/3092236) | Cali | C'est quand le bonheur ? | Chanson | Moyen | 118 013 | 2026-10-15 | oui | non | auto |
| c00-05 | [1148350](https://www.deezer.com/track/1148350) | Olivia Ruiz | J'traîne des pieds (Deezer : J'traine des pieds) | Chanson | Moyen | 209 145 | 2026-10-15 | oui | non | auto |
| c00-06 | [371636691](https://www.deezer.com/track/371636691) | Renan Luce | Les voisines | Chanson | Moyen | 225 815 | 2026-10-15 | oui | non | auto |
| c00-07 | [355636791](https://www.deezer.com/track/355636791) | Camille | Ta douleur | Chanson | Moyen | 144 338 | 2026-10-15 | oui | non | auto |
| c00-08 | [580647992](https://www.deezer.com/track/580647992) | Thomas Dutronc | J'aime plus Paris | Chanson | Moyen | 207 458 | 2026-10-15 | oui | non | auto |
| c00-09 | [132629150](https://www.deezer.com/track/132629150) | Calogero | En apesanteur | Chanson | Moyen | 1 174 143 | 2026-10-15 | oui | non | auto |
| c00-10 | [3130099](https://www.deezer.com/track/3130099) | -M- | Qui de nous deux | Chanson | Moyen | 769 561 | 2026-10-15 | oui | non | auto |

