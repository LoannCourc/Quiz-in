# Relecture du lot BT-1 : 5 blind tests

Vérification Deezer du 2026-10-15 (`npm run music:fans -- 1 dance-annees-90 rock-annees-70 rap-us-annees-90 chanson-annees-60 pop-annees-2020`). Fans (nb_fan) à cette date ;
ils changent avec le temps et ne sont jamais publiés. « Impossible » : chaque artiste a moins de 800 fans le jour de la
vérification. Morceaux cochés par `npm run music:verify` (« auto ») : artiste et titre identiques à Deezer, version
originale, extrait présent, paroles non explicites, extrait qui tient dans le minuteur. Après écoute, passer
`verifiedBy` à `"listened"` dans `content/music-check/<quizId>.json`.

## À écouter en priorité (5)

- `rock-annees-70/r70-02` Eagles — Hotel California (2 artistes « Eagles » sur Deezer, album « Hotel California (40th Anniversary Expanded Edition) ») : <https://www.deezer.com/track/426703682>
- `rap-us-annees-90/ru90-05` Kris Kross — Jump (2 artistes « Kris Kross » sur Deezer, titre très générique) : <https://www.deezer.com/track/1056838>
- `chanson-annees-60/c60-07` Gilbert Bécaud — Et maintenant (2 artistes « Gilbert Bécaud » sur Deezer, album « Gilbert Becaud (1963-1964) [2011 Remastered] [Deluxe version] ») : <https://www.deezer.com/track/14406696>
- `dance-annees-90/d90-01` Corona — The Rhythm Of The Night (échantillon de ce blind test) : <https://www.deezer.com/track/3413806581>
- `pop-annees-2020/p20-01` Harry Styles — As It Was (échantillon de ce blind test) : <https://www.deezer.com/track/1703487577>

## Les blind tests

| Blind test | Identifiant | Genre | Décennie | Niveau |
|---|---|---|---|---|
| Dance des années 90 | `dance-annees-90` | Électro | 1990 | Facile |
| Rock des années 70 | `rock-annees-70` | Rock | 1970 | Facile |
| Rap US des années 90 | `rap-us-annees-90` | Rap | 1990 | Facile |
| Chanson française des années 60 | `chanson-annees-60` | Chanson | 1960 | Facile |
| Pop des années 2020 | `pop-annees-2020` | Pop | 2020 | Facile |

## Dance des années 90 (`dance-annees-90`)

| Question | Id Deezer | Artiste | Titre | Genre | Niveau | Fans (nb_fan) | Vérifié le | Extrait | Explicite | Vérifié par |
|---|---|---|---|---|---|---|---|---|---|---|
| d90-01 | [3413806581](https://www.deezer.com/track/3413806581) | Corona | The Rhythm Of The Night | Électro | Facile | 77 393 | 2026-10-15 | oui | non | auto |
| d90-02 | [134706074](https://www.deezer.com/track/134706074) | 2 Unlimited | No Limit | Électro | Facile | 68 180 | 2026-10-15 | oui | non | auto |
| d90-03 | [3785942552](https://www.deezer.com/track/3785942552) | Snap! | Rhythm Is a Dancer | Électro | Facile | 89 611 | 2026-10-15 | oui | non | auto |
| d90-04 | [3801448032](https://www.deezer.com/track/3801448032) | Dr. Alban | It's My Life | Électro | Facile | 86 648 | 2026-10-15 | oui | non | auto |
| d90-05 | [17347911](https://www.deezer.com/track/17347911) | Culture Beat | Mr. Vain | Électro | Facile | 62 254 | 2026-10-15 | oui | non | auto |
| d90-06 | [4096754](https://www.deezer.com/track/4096754) | La Bouche | Be My Lover | Électro | Facile | 76 599 | 2026-10-15 | oui | non | auto |
| d90-07 | [3413853181](https://www.deezer.com/track/3413853181) | Alexia | Uh La La La | Électro | Facile | 24 291 | 2026-10-15 | oui | non | auto |
| d90-08 | [143154464](https://www.deezer.com/track/143154464) | Captain Hollywood Project | More And More | Électro | Facile | 27 305 | 2026-10-15 | oui | non | auto |
| d90-09 | [1042543](https://www.deezer.com/track/1042543) | Real McCoy | Another Night | Électro | Facile | 30 773 | 2026-10-15 | oui | non | auto |
| d90-10 | [6907036](https://www.deezer.com/track/6907036) | Whigfield | Saturday Night | Électro | Facile | 29 988 | 2026-10-15 | oui | non | auto |

## Rock des années 70 (`rock-annees-70`)

| Question | Id Deezer | Artiste | Titre | Genre | Niveau | Fans (nb_fan) | Vérifié le | Extrait | Explicite | Vérifié par |
|---|---|---|---|---|---|---|---|---|---|---|
| r70-01 | [4091937401](https://www.deezer.com/track/4091937401) | Queen | Bohemian Rhapsody | Rock | Facile | 12 833 999 | 2026-10-15 | oui | non | auto |
| r70-02 | [426703682](https://www.deezer.com/track/426703682) | Eagles | Hotel California | Rock | Facile | 1 395 310 | 2026-10-15 | oui | non | auto |
| r70-03 | [2431707315](https://www.deezer.com/track/2431707315) | Aerosmith | Dream On | Rock | Facile | 5 339 702 | 2026-10-15 | oui | non | auto |
| r70-04 | [1037414](https://www.deezer.com/track/1037414) | Boston | More Than a Feeling | Rock | Facile | 233 850 | 2026-10-15 | oui | non | auto |
| r70-05 | [2267042](https://www.deezer.com/track/2267042) | KISS | I Was Made For Lovin' You | Rock | Facile | 2 903 153 | 2026-10-15 | oui | non | auto |
| r70-06 | [1006442262](https://www.deezer.com/track/1006442262) | Supertramp | The Logical Song | Rock | Facile | 1 289 227 | 2026-10-15 | oui | non | auto |
| r70-07 | [3248376](https://www.deezer.com/track/3248376) | The Knack | My Sharona | Rock | Facile | 11 386 | 2026-10-15 | oui | non | auto |
| r70-08 | [112662184](https://www.deezer.com/track/112662184) | Electric Light Orchestra | Mr. Blue Sky | Rock | Facile | 475 263 | 2026-10-15 | oui | non | auto |
| r70-09 | [63480990](https://www.deezer.com/track/63480990) | Fleetwood Mac | Go Your Own Way | Rock | Facile | 1 677 271 | 2026-10-15 | oui | non | auto |
| r70-10 | [1101200](https://www.deezer.com/track/1101200) | Thin Lizzy | The Boys Are Back In Town | Rock | Facile | 165 523 | 2026-10-15 | oui | non | auto |

## Rap US des années 90 (`rap-us-annees-90`)

| Question | Id Deezer | Artiste | Titre | Genre | Niveau | Fans (nb_fan) | Vérifié le | Extrait | Explicite | Vérifié par |
|---|---|---|---|---|---|---|---|---|---|---|
| ru90-01 | [3136389](https://www.deezer.com/track/3136389) | MC Hammer | U Can't Touch This | Rap | Facile | 70 320 | 2026-10-15 | oui | non | auto |
| ru90-02 | [2397026](https://www.deezer.com/track/2397026) | Vanilla Ice | Ice Ice Baby | Rap | Facile | 54 337 | 2026-10-15 | oui | non | auto |
| ru90-03 | [1584416372](https://www.deezer.com/track/1584416372) | Coolio | Gangsta's Paradise | Rap | Facile | 278 838 | 2026-10-15 | oui | non | auto |
| ru90-04 | [831351](https://www.deezer.com/track/831351) | DJ Jazzy Jeff & The Fresh Prince | Summertime | Rap | Facile | 36 915 | 2026-10-15 | oui | non | auto |
| ru90-05 | [1056838](https://www.deezer.com/track/1056838) | Kris Kross | Jump | Rap | Facile | 16 629 | 2026-10-15 | oui | non | auto |
| ru90-06 | [1584589772](https://www.deezer.com/track/1584589772) | House of Pain | Jump Around | Rap | Facile | 161 074 | 2026-10-15 | oui | non | auto |
| ru90-07 | [626417](https://www.deezer.com/track/626417) | Will Smith | Men In Black | Rap | Facile | 227 812 | 2026-10-15 | oui | non | auto |
| ru90-08 | [3100809](https://www.deezer.com/track/3100809) | Arrested Development | Tennessee | Rap | Facile | 23 914 | 2026-10-15 | oui | non | auto |
| ru90-09 | [1584431742](https://www.deezer.com/track/1584431742) | Naughty by Nature | Hip Hop Hooray | Rap | Facile | 132 233 | 2026-10-15 | oui | non | auto |
| ru90-10 | [82487070](https://www.deezer.com/track/82487070) | Diddy | I'll Be Missing You | Rap | Facile | 606 365 | 2026-10-15 | oui | non | auto |

## Chanson française des années 60 (`chanson-annees-60`)

| Question | Id Deezer | Artiste | Titre | Genre | Niveau | Fans (nb_fan) | Vérifié le | Extrait | Explicite | Vérifié par |
|---|---|---|---|---|---|---|---|---|---|---|
| c60-01 | [487451822](https://www.deezer.com/track/487451822) | Françoise Hardy | Tous les garçons et les filles | Chanson | Facile | 297 452 | 2026-10-15 | oui | non | auto |
| c60-02 | [3819673981](https://www.deezer.com/track/3819673981) | Sylvie Vartan | La plus belle pour aller danser | Chanson | Facile | 95 952 | 2026-10-15 | oui | non | auto |
| c60-03 | [539703](https://www.deezer.com/track/539703) | Jacques Dutronc | Et moi, et moi, et moi | Chanson | Facile | 219 203 | 2026-10-15 | oui | non | auto |
| c60-04 | [917404772](https://www.deezer.com/track/917404772) | France Gall | Poupée de cire, poupée de son | Chanson | Facile | 822 333 | 2026-10-15 | oui | non | auto |
| c60-05 | [1090312](https://www.deezer.com/track/1090312) | Claude François | Comme d'habitude | Chanson | Facile | 411 444 | 2026-10-15 | oui | non | auto |
| c60-06 | [2150021](https://www.deezer.com/track/2150021) | Hugues Aufray | Céline | Chanson | Facile | 81 036 | 2026-10-15 | oui | non | auto |
| c60-07 | [14406696](https://www.deezer.com/track/14406696) | Gilbert Bécaud | Et maintenant | Chanson | Facile | 129 975 | 2026-10-15 | oui | non | auto |
| c60-08 | [795210](https://www.deezer.com/track/795210) | Sheila | L'école est finie | Chanson | Facile | 39 570 | 2026-10-15 | oui | non | auto |
| c60-09 | [2178419](https://www.deezer.com/track/2178419) | Johnny Hallyday | Retiens la nuit | Chanson | Facile | 1 380 080 | 2026-10-15 | oui | non | auto |
| c60-10 | [2628773](https://www.deezer.com/track/2628773) | Nino Ferrer | Mirza | Chanson | Facile | 74 282 | 2026-10-15 | oui | non | auto |

## Pop des années 2020 (`pop-annees-2020`)

| Question | Id Deezer | Artiste | Titre | Genre | Niveau | Fans (nb_fan) | Vérifié le | Extrait | Explicite | Vérifié par |
|---|---|---|---|---|---|---|---|---|---|---|
| p20-01 | [1703487577](https://www.deezer.com/track/1703487577) | Harry Styles | As It Was | Pop | Facile | 2 204 319 | 2026-10-15 | oui | non | auto |
| p20-02 | [1124841682](https://www.deezer.com/track/1124841682) | Dua Lipa | Levitating | Pop | Facile | 8 794 628 | 2026-10-15 | oui | non | auto |
| p20-03 | [2105158337](https://www.deezer.com/track/2105158337) | Miley Cyrus | Flowers | Pop | Facile | 7 247 850 | 2026-10-15 | oui | non | auto |
| p20-04 | [2704682202](https://www.deezer.com/track/2704682202) | Benson Boone | Beautiful Things | Pop | Facile | 505 595 | 2026-10-15 | oui | non | auto |
| p20-05 | [1529509472](https://www.deezer.com/track/1529509472) | Ed Sheeran | Bad Habits | Pop | Facile | 20 936 394 | 2026-10-15 | oui | non | auto |
| p20-06 | [1040154662](https://www.deezer.com/track/1040154662) | Glass Animals | Heat Waves | Pop | Facile | 323 610 | 2026-10-15 | oui | non | auto |
| p20-07 | [1976903157](https://www.deezer.com/track/1976903157) | Taylor Swift | Anti-Hero | Pop | Facile | 12 749 293 | 2026-10-15 | oui | non | auto |
| p20-08 | [2366043655](https://www.deezer.com/track/2366043655) | Billie Eilish | What Was I Made For? | Pop | Facile | 9 276 181 | 2026-10-15 | oui | non | auto |
| p20-09 | [2704610682](https://www.deezer.com/track/2704610682) | Hozier | Too Sweet | Pop | Facile | 1 414 416 | 2026-10-15 | oui | non | auto |
| p20-10 | [1573406502](https://www.deezer.com/track/1573406502) | Angèle | Bruxelles je t'aime | Pop | Facile | 1 743 033 | 2026-10-15 | oui | non | auto |

