# Relecture du lot BT-6 : 5 blind tests

Vérification Deezer du 2026-10-15 (`npm run music:review -- 6 electro-impossible-2010 rock-impossible-2000 pop-impossible-2010 rap-impossible-2000 chanson-impossible-2010`). Popularité du morceau (rank) et
fans de l'artiste (nb_fan) à cette date ; ils changent avec le temps et ne sont jamais publiés. « Impossible » : rank sous
200 000 (titre d'album très peu écouté) et artiste à 50 000 fans ou plus, le jour de la vérification.
Morceaux cochés par `npm run music:verify` (« auto ») : artiste et titre identiques à Deezer, version
originale, extrait présent, paroles non explicites, extrait qui tient dans le minuteur. Après écoute, passer
`verifiedBy` à `"listened"` dans `content/music-check/<quizId>.json`.

## À écouter en priorité (5)

- `electro-impossible-2010/ei10-01` Vitalic — The Legend of Kaspar Hauser (2 artistes « Vitalic » sur Deezer) : <https://www.deezer.com/track/3625529742>
- `electro-impossible-2010/ei10-06` Fakear — Tonight (titre très générique) : <https://www.deezer.com/track/468663332>
- `rock-impossible-2000/ri00-01` Kasabian — Happiness (2 artistes « Kasabian » sur Deezer) : <https://www.deezer.com/track/3437884>
- `pop-impossible-2010/pi10-01` Christine and the Queens — Comme si (échantillon de ce blind test) : <https://www.deezer.com/track/555962672>
- `rap-impossible-2000/rpi00-01` La Fouine — Machine arrière (échantillon de ce blind test) : <https://www.deezer.com/track/120308060>

## Les blind tests

| Blind test | Identifiant | Genre | Décennie | Niveau |
|---|---|---|---|---|
| Électro, faces cachées | `electro-impossible-2010` | Électro | 2010 | Impossible |
| Rock, faces cachées | `rock-impossible-2000` | Rock | 2000 | Impossible |
| Pop, faces cachées | `pop-impossible-2010` | Pop | 2010 | Impossible |
| Rap français, faces cachées | `rap-impossible-2000` | Rap | toutes époques | Impossible |
| Chanson française, faces cachées | `chanson-impossible-2010` | Chanson | 2010 | Impossible |

## Électro, faces cachées (`electro-impossible-2010`)

| Question | Id Deezer | Artiste | Titre | Genre | Niveau | Rank | Fans (nb_fan) | Vérifié le | Extrait | Explicite | Vérifié par |
|---|---|---|---|---|---|---|---|---|---|---|---|
| ei10-01 | [3625529742](https://www.deezer.com/track/3625529742) | Vitalic | The Legend of Kaspar Hauser | Électro | Impossible | 193 141 ✓ | 341 212 ✓ | 2026-10-15 | oui | non | listened |
| ei10-02 | [412059012](https://www.deezer.com/track/412059012) | Four Tet | 10 Midi | Électro | Impossible | 198 452 ✓ | 447 874 ✓ | 2026-10-15 | oui | non | listened |
| ei10-03 | [644296862](https://www.deezer.com/track/644296862) | Gesaffelstein | Humanity Gone | Électro | Impossible | 194 698 ✓ | 330 491 ✓ | 2026-10-15 | oui | non | listened |
| ei10-04 | [124701812](https://www.deezer.com/track/124701812) | Flume | Pika | Électro | Impossible | 180 997 ✓ | 375 895 ✓ | 2026-10-15 | oui | non | listened |
| ei10-05 | [134527348](https://www.deezer.com/track/134527348) | Møme | Wagga | Électro | Impossible | 191 766 ✓ | 300 394 ✓ | 2026-10-15 | oui | non | listened |
| ei10-06 | [468663332](https://www.deezer.com/track/468663332) | Fakear | Tonight | Électro | Impossible | 194 187 ✓ | 210 259 ✓ | 2026-10-15 | oui | non | listened |
| ei10-07 | [130727768](https://www.deezer.com/track/130727768) | Birdy Nam Nam | Can't Do Me | Électro | Impossible | 198 998 ✓ | 255 452 ✓ | 2026-10-15 | oui | non | listened |
| ei10-08 | [90603859](https://www.deezer.com/track/90603859) | Rone | Memory | Électro | Impossible | 196 129 ✓ | 140 442 ✓ | 2026-10-15 | oui | non | listened |
| ei10-09 | [1754080647](https://www.deezer.com/track/1754080647) | Moderat | Ilona | Électro | Impossible | 198 784 ✓ | 144 674 ✓ | 2026-10-15 | oui | non | listened |
| ei10-10 | [445790732](https://www.deezer.com/track/445790732) | Mr. Oizo | Oiseaux | Électro | Impossible | 118 515 ✓ | 176 975 ✓ | 2026-10-15 | oui | non | listened |

## Rock, faces cachées (`rock-impossible-2000`)

| Question | Id Deezer | Artiste | Titre | Genre | Niveau | Rank | Fans (nb_fan) | Vérifié le | Extrait | Explicite | Vérifié par |
|---|---|---|---|---|---|---|---|---|---|---|---|
| ri00-01 | [3437884](https://www.deezer.com/track/3437884) | Kasabian | Happiness | Rock | Impossible | 191 122 ✓ | 813 986 ✓ | 2026-10-15 | oui | non | listened |
| ri00-02 | [1156041](https://www.deezer.com/track/1156041) | Dionysos | I Love Liou | Rock | Impossible | 143 169 ✓ | 130 777 ✓ | 2026-10-15 | oui | non | listened |
| ri00-03 | [1280074222](https://www.deezer.com/track/1280074222) | Cage The Elephant | Judas | Rock | Impossible | 192 334 ✓ | 579 673 ✓ | 2026-10-15 | oui | non | listened |
| ri00-04 | [3335078](https://www.deezer.com/track/3335078) | Mickey 3D | 2, 3 jours à Paris | Rock | Impossible | 189 957 ✓ | 116 804 ✓ | 2026-10-15 | oui | non | listened |
| ri00-05 | [2498715](https://www.deezer.com/track/2498715) | Yeah Yeah Yeahs | Mysteries | Rock | Impossible | 66 362 ✓ | 350 868 ✓ | 2026-10-15 | oui | non | listened |
| ri00-06 | [2796808](https://www.deezer.com/track/2796808) | Les Wampas | Elle Est Où Ma Loge ? | Rock | Impossible | 178 841 ✓ | 92 806 ✓ | 2026-10-15 | oui | non | listened |
| ri00-07 | [1112825](https://www.deezer.com/track/1112825) | The Hives | Giddy Up! | Rock | Impossible | 166 279 ✓ | 247 746 ✓ | 2026-10-15 | oui | non | listened |
| ri00-08 | [553973](https://www.deezer.com/track/553973) | Luke | La Nuit Et Le Jour | Rock | Impossible | 153 982 ✓ | 68 313 ✓ | 2026-10-15 | oui | non | listened |
| ri00-09 | [4217718](https://www.deezer.com/track/4217718) | Editors | Bricks and Mortar | Rock | Impossible | 160 225 ✓ | 239 712 ✓ | 2026-10-15 | oui | non | listened |
| ri00-10 | [4255747](https://www.deezer.com/track/4255747) | Wolfmother | Pilgrim | Rock | Impossible | 192 689 ✓ | 143 791 ✓ | 2026-10-15 | oui | non | listened |

## Pop, faces cachées (`pop-impossible-2010`)

| Question | Id Deezer | Artiste | Titre | Genre | Niveau | Rank | Fans (nb_fan) | Vérifié le | Extrait | Explicite | Vérifié par |
|---|---|---|---|---|---|---|---|---|---|---|---|
| pi10-01 | [555962672](https://www.deezer.com/track/555962672) | Christine and the Queens | Comme si | Pop | Impossible | 197 941 ✓ | 683 608 ✓ | 2026-10-15 | oui | non | listened |
| pi10-02 | [511053942](https://www.deezer.com/track/511053942) | Maroon 5 | Plastic Rose | Pop | Impossible | 169 175 ✓ | 11 425 488 ✓ | 2026-10-15 | oui | non | listened |
| pi10-03 | [130008232](https://www.deezer.com/track/130008232) | Coeur De Pirate | La chute | Pop | Impossible | 193 206 ✓ | 946 484 ✓ | 2026-10-15 | oui | non | listened |
| pi10-04 | [6304691](https://www.deezer.com/track/6304691) | Sia | Big Girl Little Girl | Pop | Impossible | 172 728 ✓ | 8 723 292 ✓ | 2026-10-15 | oui | non | listened |
| pi10-05 | [569643522](https://www.deezer.com/track/569643522) | Vanessa Paradis | Dans notre monde | Pop | Impossible | 192 761 ✓ | 447 127 ✓ | 2026-10-15 | oui | non | listened |
| pi10-06 | [78281880](https://www.deezer.com/track/78281880) | Ellie Goulding | Halcyon | Pop | Impossible | 192 215 ✓ | 6 242 245 ✓ | 2026-10-15 | oui | non | listened |
| pi10-07 | [564224032](https://www.deezer.com/track/564224032) | Joyce Jonathan | Rouler sur l'or | Pop | Impossible | 197 951 ✓ | 499 854 ✓ | 2026-10-15 | oui | non | listened |
| pi10-08 | [608488932](https://www.deezer.com/track/608488932) | Sam Smith | Little Tin Buddhas | Pop | Impossible | 108 599 ✓ | 5 586 291 ✓ | 2026-10-15 | oui | non | listened |
| pi10-09 | [765865612](https://www.deezer.com/track/765865612) | MIKA | Blue | Pop | Impossible | 199 724 ✓ | 1 075 711 ✓ | 2026-10-15 | oui | non | listened |
| pi10-10 | [120832222](https://www.deezer.com/track/120832222) | Birdy | Hear You Calling | Pop | Impossible | 194 440 ✓ | 1 382 243 ✓ | 2026-10-15 | oui | non | listened |

## Rap français, faces cachées (`rap-impossible-2000`)

| Question | Id Deezer | Artiste | Titre | Genre | Niveau | Rank | Fans (nb_fan) | Vérifié le | Extrait | Explicite | Vérifié par |
|---|---|---|---|---|---|---|---|---|---|---|---|
| rpi00-01 | [120308060](https://www.deezer.com/track/120308060) | La Fouine | Machine arrière | Rap | Impossible | 191 414 ✓ | 2 122 842 ✓ | 2026-10-15 | oui | non | listened |
| rpi00-02 | [14477901](https://www.deezer.com/track/14477901) | Nessbeal | Sélection naturelle | Rap | Impossible | 188 950 ✓ | 109 651 ✓ | 2026-10-15 | oui | non | listened |
| rpi00-03 | [643827922](https://www.deezer.com/track/643827922) | Sinik | Elle était là | Rap | Impossible | 194 558 ✓ | 346 251 ✓ | 2026-10-15 | oui | non | listened |
| rpi00-04 | [68132490](https://www.deezer.com/track/68132490) | Médine | D’arobaz à zéro | Rap | Impossible | 199 659 ✓ | 398 381 ✓ | 2026-10-15 | oui | non | listened |
| rpi00-05 | [99550230](https://www.deezer.com/track/99550230) | Mac Tyer | Malheureux | Rap | Impossible | 190 223 ✓ | 442 132 ✓ | 2026-10-15 | oui | non | listened |
| rpi00-06 | [132628032](https://www.deezer.com/track/132628032) | Lefa | TMCP #5 - Ça va mal terminer | Rap | Impossible | 185 482 ✓ | 517 501 ✓ | 2026-10-15 | oui | non | listened |
| rpi00-07 | [75769319](https://www.deezer.com/track/75769319) | MZ | En bas de chez nous | Rap | Impossible | 199 916 ✓ | 510 718 ✓ | 2026-10-15 | oui | non | listened |
| rpi00-08 | [3938039831](https://www.deezer.com/track/3938039831) | Disiz (Deezer : disiz) | Lotus | Rap | Impossible | 196 175 ✓ | 455 444 ✓ | 2026-10-15 | oui | non | listened |
| rpi00-09 | [2581716092](https://www.deezer.com/track/2581716092) | STUPEFLIP | Le miracle | Rap | Impossible | 22 573 ✓ | 351 641 ✓ | 2026-10-15 | oui | non | listened |
| rpi00-10 | [14172327](https://www.deezer.com/track/14172327) | JoeyStarr | Affamé | Rap | Impossible | 163 916 ✓ | 210 245 ✓ | 2026-10-15 | oui | non | listened |

## Chanson française, faces cachées (`chanson-impossible-2010`)

| Question | Id Deezer | Artiste | Titre | Genre | Niveau | Rank | Fans (nb_fan) | Vérifié le | Extrait | Explicite | Vérifié par |
|---|---|---|---|---|---|---|---|---|---|---|---|
| ci10-01 | [3762670942](https://www.deezer.com/track/3762670942) | Tryo | Mourir la mort | Chanson | Impossible | 189 578 ✓ | 1 002 176 ✓ | 2026-10-15 | oui | non | listened |
| ci10-02 | [555959882](https://www.deezer.com/track/555959882) | Miossec | La mer, quand elle mord, c'est méchant | Chanson | Impossible | 180 617 ✓ | 78 945 ✓ | 2026-10-15 | oui | non | listened |
| ci10-03 | [523074732](https://www.deezer.com/track/523074732) | Dominique A | Le soleil | Chanson | Impossible | 199 554 ✓ | 92 877 ✓ | 2026-10-15 | oui | non | listened |
| ci10-04 | [750509572](https://www.deezer.com/track/750509572) | Debout Sur Le Zinc | De velours et de soie | Chanson | Impossible | 194 548 ✓ | 114 051 ✓ | 2026-10-15 | oui | non | listened |
| ci10-05 | [580885242](https://www.deezer.com/track/580885242) | Bertrand Belin | Bec | Chanson | Impossible | 175 467 ✓ | 70 721 ✓ | 2026-10-15 | oui | non | listened |
| ci10-06 | [726877612](https://www.deezer.com/track/726877612) | Sanseverino | J'ai froid | Chanson | Impossible | 152 454 ✓ | 71 855 ✓ | 2026-10-15 | oui | non | listened |
| ci10-07 | [758852212](https://www.deezer.com/track/758852212) | Philippe Katerine | Point noir sur feuille blanche | Chanson | Impossible | 197 370 ✓ | 145 746 ✓ | 2026-10-15 | oui | non | listened |
| ci10-08 | [400291882](https://www.deezer.com/track/400291882) | Laurent Voulzy | Tombée du jour sur la plage de Grumari | Chanson | Impossible | 193 897 ✓ | 432 965 ✓ | 2026-10-15 | oui | non | listened |
| ci10-09 | [629311582](https://www.deezer.com/track/629311582) | Les Innocents | Mon homme | Chanson | Impossible | 199 565 ✓ | 61 066 ✓ | 2026-10-15 | oui | non | listened |
| ci10-10 | [66982951](https://www.deezer.com/track/66982951) | Boulevard des Airs | On the Run | Chanson | Impossible | 195 340 ✓ | 575 659 ✓ | 2026-10-15 | oui | non | listened |

