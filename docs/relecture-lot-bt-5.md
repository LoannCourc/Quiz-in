# Relecture du lot BT-5 : 5 blind tests

Vérification Deezer du 2026-10-15 (`npm run music:fans -- 5 house-techno-annees-90 electro-connaisseurs rap-us-old-school rap-francais-annees-2000 chanson-a-texte-annees-70`). Fans (nb_fan) à cette date ;
ils changent avec le temps et ne sont jamais publiés. « Impossible » : chaque artiste a moins de 800 fans le jour de la
vérification. Morceaux cochés par `npm run music:verify` (« auto ») : artiste et titre identiques à Deezer, version
originale, extrait présent, paroles non explicites, extrait qui tient dans le minuteur. Après écoute, passer
`verifiedBy` à `"listened"` dans `content/music-check/<quizId>.json`.

## À écouter en priorité (5)

- `electro-connaisseurs/eco-10` Caribou — Can't Do Without You (2 artistes « Caribou » sur Deezer, album « Our Love (Expanded Edition) ») : <https://www.deezer.com/track/2583057732>
- `house-techno-annees-90/ht90-01` Daft Punk — Da Funk (2 artistes « Daft Punk » sur Deezer) : <https://www.deezer.com/track/3129772>
- `house-techno-annees-90/ht90-02` Underworld — Born Slippy (Nuxx) (2 artistes « Underworld » sur Deezer) : <https://www.deezer.com/track/82265248>
- `rap-us-old-school/ros-01` The Sugarhill Gang — Rapper's Delight (échantillon de ce blind test) : <https://www.deezer.com/track/3785968522>
- `rap-francais-annees-2000/rf00-01` Diam's — DJ (échantillon de ce blind test) : <https://www.deezer.com/track/3437460>

## Les blind tests

| Blind test | Identifiant | Genre | Décennie | Niveau |
|---|---|---|---|---|
| House et techno des années 90 | `house-techno-annees-90` | Électro | 1990 | Difficile |
| Électro pour connaisseurs | `electro-connaisseurs` | Électro | toutes époques | Difficile |
| Rap US old school | `rap-us-old-school` | Rap | 1980 | Difficile |
| Rap français des années 2000 | `rap-francais-annees-2000` | Rap | 2000 | Difficile |
| Chanson à texte des années 70 | `chanson-a-texte-annees-70` | Chanson | 1970 | Difficile |

## House et techno des années 90 (`house-techno-annees-90`)

| Question | Id Deezer | Artiste | Titre | Genre | Niveau | Fans (nb_fan) | Vérifié le | Extrait | Explicite | Vérifié par |
|---|---|---|---|---|---|---|---|---|---|---|
| ht90-01 | [3129772](https://www.deezer.com/track/3129772) | Daft Punk | Da Funk | Électro | Difficile | 5 221 404 | 2026-10-15 | oui | non | auto |
| ht90-02 | [82265248](https://www.deezer.com/track/82265248) | Underworld | Born Slippy (Nuxx) | Électro | Difficile | 109 762 | 2026-10-15 | oui | non | auto |
| ht90-03 | [3252242](https://www.deezer.com/track/3252242) | The Chemical Brothers | Block Rockin' Beats | Électro | Difficile | 1 458 289 | 2026-10-15 | oui | non | auto |
| ht90-04 | [7035328](https://www.deezer.com/track/7035328) | Faithless | Insomnia | Électro | Difficile | 677 167 | 2026-10-15 | oui | non | auto |
| ht90-05 | [91348522](https://www.deezer.com/track/91348522) | Robert Miles | Children | Électro | Difficile | 73 760 | 2026-10-15 | oui | non | auto |
| ht90-06 | [3801561902](https://www.deezer.com/track/3801561902) | Fatboy Slim | Praise You | Électro | Difficile | 1 249 873 | 2026-10-15 | oui | non | auto |
| ht90-07 | [3806165162](https://www.deezer.com/track/3806165162) | Moby | Go | Électro | Difficile | 1 038 431 | 2026-10-15 | oui | non | auto |
| ht90-08 | [63653810](https://www.deezer.com/track/63653810) | Darude | Sandstorm | Électro | Difficile | 56 795 | 2026-10-15 | oui | non | auto |
| ht90-09 | [128973850](https://www.deezer.com/track/128973850) | The Prodigy | Out of Space | Électro | Difficile | 1 743 697 | 2026-10-15 | oui | non | auto |
| ht90-10 | [3780534](https://www.deezer.com/track/3780534) | Laurent Garnier | Crispy Bacon | Électro | Difficile | 108 120 | 2026-10-15 | oui | non | auto |

## Électro pour connaisseurs (`electro-connaisseurs`)

| Question | Id Deezer | Artiste | Titre | Genre | Niveau | Fans (nb_fan) | Vérifié le | Extrait | Explicite | Vérifié par |
|---|---|---|---|---|---|---|---|---|---|---|
| eco-01 | [3788146542](https://www.deezer.com/track/3788146542) | Jean-Michel Jarre | Oxygène, Pt. 4 | Électro | Difficile | 321 784 | 2026-10-15 | oui | non | auto |
| eco-02 | [3286437](https://www.deezer.com/track/3286437) | Röyksopp | Eple | Électro | Difficile | 358 528 | 2026-10-15 | oui | non | auto |
| eco-03 | [10284907](https://www.deezer.com/track/10284907) | Justice | Genesis | Électro | Difficile | 811 191 | 2026-10-15 | oui | non | auto |
| eco-04 | [2992806421](https://www.deezer.com/track/2992806421) | Kavinsky | Nightcall | Électro | Difficile | 497 160 | 2026-10-15 | oui | non | auto |
| eco-05 | [92213550](https://www.deezer.com/track/92213550) | M83 | Midnight City | Électro | Difficile | 968 798 | 2026-10-15 | oui | non | auto |
| eco-06 | [29373661](https://www.deezer.com/track/29373661) | Boards of Canada | Roygbiv | Électro | Difficile | 276 271 | 2026-10-15 | oui | non | auto |
| eco-07 | [29392051](https://www.deezer.com/track/29392051) | Aphex Twin | Windowlicker | Électro | Difficile | 590 021 | 2026-10-15 | oui | non | auto |
| eco-08 | [3148103](https://www.deezer.com/track/3148103) | Air | La femme d'argent | Électro | Difficile | 342 675 | 2026-10-15 | oui | non | auto |
| eco-09 | [3129775](https://www.deezer.com/track/3129775) | Daft Punk | Around the World | Électro | Difficile | 5 221 404 | 2026-10-15 | oui | non | auto |
| eco-10 | [2583057732](https://www.deezer.com/track/2583057732) | Caribou | Can't Do Without You | Électro | Difficile | 177 516 | 2026-10-15 | oui | non | auto |

## Rap US old school (`rap-us-old-school`)

| Question | Id Deezer | Artiste | Titre | Genre | Niveau | Fans (nb_fan) | Vérifié le | Extrait | Explicite | Vérifié par |
|---|---|---|---|---|---|---|---|---|---|---|
| ros-01 | [3785968522](https://www.deezer.com/track/3785968522) | The Sugarhill Gang | Rapper's Delight | Rap | Difficile | 19 498 | 2026-10-15 | oui | non | auto |
| ros-02 | [3782933752](https://www.deezer.com/track/3782933752) | Grandmaster Flash & The Furious Five | The Message | Rap | Difficile | 24 424 | 2026-10-15 | oui | non | auto |
| ros-03 | [994699](https://www.deezer.com/track/994699) | Run-DMC | It's Tricky | Rap | Difficile | 291 982 | 2026-10-15 | oui | non | auto |
| ros-04 | [1085495](https://www.deezer.com/track/1085495) | Beastie Boys | Fight For Your Right | Rap | Difficile | 688 996 | 2026-10-15 | oui | non | auto |
| ros-05 | [1580525](https://www.deezer.com/track/1580525) | Kurtis Blow | The Breaks | Rap | Difficile | 11 047 | 2026-10-15 | oui | non | auto |
| ros-06 | [1587016002](https://www.deezer.com/track/1587016002) | Afrika Bambaataa | Planet Rock | Rap | Difficile | 25 186 | 2026-10-15 | oui | non | auto |
| ros-07 | [1158616](https://www.deezer.com/track/1158616) | Eric B. & Rakim | Paid in Full | Rap | Difficile | 45 434 | 2026-10-15 | oui | non | auto |
| ros-08 | [120302496](https://www.deezer.com/track/120302496) | Young MC | Bust A Move | Rap | Difficile | 4 415 | 2026-10-15 | oui | non | auto |
| ros-09 | [2048503687](https://www.deezer.com/track/2048503687) | De La Soul | Me Myself and I | Rap | Difficile | 198 260 | 2026-10-15 | oui | non | auto |
| ros-10 | [537989342](https://www.deezer.com/track/537989342) | Salt-N-Pepa | Push It | Rap | Difficile | 65 486 | 2026-10-15 | oui | non | auto |

## Rap français des années 2000 (`rap-francais-annees-2000`)

| Question | Id Deezer | Artiste | Titre | Genre | Niveau | Fans (nb_fan) | Vérifié le | Extrait | Explicite | Vérifié par |
|---|---|---|---|---|---|---|---|---|---|---|
| rf00-01 | [3437460](https://www.deezer.com/track/3437460) | Diam's | DJ | Rap | Difficile | 688 041 | 2026-10-15 | oui | non | auto |
| rf00-02 | [15044236](https://www.deezer.com/track/15044236) | Sniper | Gravé dans la roche | Rap | Difficile | 521 987 | 2026-10-15 | oui | non | auto |
| rf00-03 | [142750160](https://www.deezer.com/track/142750160) | Grand Corps Malade | Saint-Denis | Rap | Difficile | 1 056 682 | 2026-10-15 | oui | non | auto |
| rf00-04 | [615784812](https://www.deezer.com/track/615784812) | Keny Arkana | La rage | Rap | Difficile | 312 612 | 2026-10-15 | oui | non | auto |
| rf00-05 | [105966812](https://www.deezer.com/track/105966812) | Kamini | Marly-Gomont | Rap | Difficile | 25 469 | 2026-10-15 | oui | non | auto |
| rf00-06 | [483173352](https://www.deezer.com/track/483173352) | Oxmo Puccino | Toucher l'horizon | Rap | Difficile | 341 045 | 2026-10-15 | oui | non | auto |
| rf00-07 | [15904504](https://www.deezer.com/track/15904504) | Psy 4 de la Rime (Deezer : Psy 4 De La Rime) | Le son des bandits | Rap | Difficile | 613 553 | 2026-10-15 | oui | non | auto |
| rf00-08 | [365936531](https://www.deezer.com/track/365936531) | Kery James | Banlieusards | Rap | Difficile | 452 882 | 2026-10-15 | oui | non | auto |
| rf00-09 | [555305](https://www.deezer.com/track/555305) | 113 | Partir loin | Rap | Difficile | 522 172 | 2026-10-15 | oui | non | auto |
| rf00-10 | [3135171](https://www.deezer.com/track/3135171) | Saïan Supa Crew | Raz de marée | Rap | Difficile | 86 956 | 2026-10-15 | oui | non | auto |

## Chanson à texte des années 70 (`chanson-a-texte-annees-70`)

| Question | Id Deezer | Artiste | Titre | Genre | Niveau | Fans (nb_fan) | Vérifié le | Extrait | Explicite | Vérifié par |
|---|---|---|---|---|---|---|---|---|---|---|
| ct70-01 | [2242551](https://www.deezer.com/track/2242551) | Alain Souchon | J'ai dix ans | Chanson | Difficile | 595 555 | 2026-10-15 | oui | non | auto |
| ct70-02 | [12711462](https://www.deezer.com/track/12711462) | Maxime Le Forestier | San Francisco | Chanson | Difficile | 287 467 | 2026-10-15 | oui | non | auto |
| ct70-03 | [2430033](https://www.deezer.com/track/2430033) | Georges Moustaki | Il y avait un jardin | Chanson | Difficile | 181 632 | 2026-10-15 | oui | non | auto |
| ct70-04 | [365911091](https://www.deezer.com/track/365911091) | Jacques Higelin | Champagne | Chanson | Difficile | 172 352 | 2026-10-15 | oui | non | auto |
| ct70-05 | [70335739](https://www.deezer.com/track/70335739) | Léo Ferré | Avec le temps | Chanson | Difficile | 224 848 | 2026-10-15 | oui | non | auto |
| ct70-06 | [65626236](https://www.deezer.com/track/65626236) | Jacques Brel | Les Marquises | Chanson | Difficile | 794 655 | 2026-10-15 | oui | non | auto |
| ct70-07 | [800576](https://www.deezer.com/track/800576) | Véronique Sanson | Amoureuse | Chanson | Difficile | 379 171 | 2026-10-15 | oui | non | auto |
| ct70-08 | [72064735](https://www.deezer.com/track/72064735) | Francis Cabrel | Je l'aime à mourir | Chanson | Difficile | 1 352 834 | 2026-10-15 | oui | non | auto |
| ct70-09 | [46299441](https://www.deezer.com/track/46299441) | Michel Berger | Seras-tu là ? (Deezer : Seras-tu là) | Chanson | Difficile | 520 858 | 2026-10-15 | oui | non | auto |
| ct70-10 | [3148132](https://www.deezer.com/track/3148132) | Charles Aznavour | Comme ils disent | Chanson | Difficile | 1 070 357 | 2026-10-15 | oui | non | auto |

