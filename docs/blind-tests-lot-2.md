# Blind tests : lot 2

Mesures Deezer : fans de l'artiste (`nb_fan`), position du morceau chez l'artiste (la meilleure entre le top Deezer et le classement par rang), rang de la piste (`rank`). Seuils : `scripts/blind-tests/thresholds.json` (calibrés au lot 1, plafond de 100 000 fans en Impossible).

<!-- synthese -->
## Synthèse (2 novembre 2026)

**Lot 2 terminé : 12 tests écrits** (lot `BT-9`, `addedAt` 2026-11-02), tous « Facile ». Pour chacun : `npm run music:verify` 10/10, `npm run music:decoys` sans manque, `npm run build` réussi. **Non figés** : à écouter et relire avant le gel.

| Test | Bonnes réponses | Particularités |
|---|---|---|
| Rock : les hymnes | 10 mesurées « Facile » | rend « Sweet Child O' Mine », « Californication », « Wind of Change » (voir plus bas) |
| Tubes d'été | 10 mesurées « Facile » | rend « Macarena », « Premier Gaou » |
| Variété française des années 80-90 | 10 mesurées « Facile » | rend « Encore et encore » ; `decade` 1980, époque 1980-1999 |
| Rap US : les classiques | 10 mesurées « Facile » | genre `rap`, époque 1988-2018 |
| Années 70 | 10 mesurées « Facile » | |
| Années 60 | 10 mesurées « Facile » | leurres : 1er ou 2e titre d'un artiste « Difficile » acceptés |
| Années 2020 | 10 mesurées « Facile » | |
| Électro et dance | 10 mesurées « Facile » | |
| Chansons de Noël | exception de niveau (7 sur 10) | test à thème, leurres choisis à la main |
| Musiques de films et séries | exception de niveau (8 sur 10) | test à thème, leurres choisis à la main |
| Disney : les chansons cultes | exception de niveau (7 sur 10) | test à thème, leurres choisis à la main |
| Génériques de dessins animés | exception de niveau (10 sur 10) | test à thème, leurres choisis à la main, 2 titres par artiste au plus |

### Décisions du 2 novembre 2026 appliquées

**Tests à thème** (Noël, musiques de films et séries, Disney, génériques). Les titres demandés trouvés chez Deezer avec un extrait sont acceptés quel que soit leur niveau mesuré (`levelExempt`, ces quatre tests seulement ; niveau mesuré indiqué dans chaque tableau). Pas de remplaçant trouvé automatiquement. Les leurres viennent d'une liste choisie à la main dans le thème (`decoyList` de `scripts/blind-tests/catalogueLot2Themes.mjs`), sans condition de niveau, chacun vérifié chez Deezer. Écarts aux titres demandés :

- Pokémon et Olive et Tom : aucune version française d'origine chez Deezer (seulement des reprises de groupes de karaoké). Remplacés par « Signé Cat's Eyes » (Isabelle Guillard) et « Nicky Larson » (Jean-Paul Césari).
- Hakuna Matata : version de 1994 (Dimitri Rougeul), pas celle de 2019 (Jamel Debbouze). Il en faut peu pour être heureux : version de 1967 (Jean Stout).
- Titres corrigés d'après Deezer : « Le bleu lumière » (Vaiana), « Ne parlons pas de Bruno » (Encanto ; « On ne parle pas de Bruno » accepté), « L'air du vent » (Pocahontas ; « Les couleurs du vent » accepté), « Star Wars: Main Title », « Mission: Impossible », « Love Theme From "The Godfather" » (« Le Parrain » et « Parle plus bas » acceptés), « Comptine d'un autre été, l'après-midi », « Do They Know It's Christmas? » (version de 1984).
- Le film ou la série est accepté en réponse libre (`artistAliases`, et `titleAliases` pour les musiques de films).

**Génériques, 2 titres par artiste au plus.** Bernard Minet (Dragon Ball Z, Les Chevaliers du Zodiaque) et Jacques Cardona (Les Mystérieuses Cités d'or, Inspecteur Gadget). Les leurres Marie Dauphin, Noam et Bernard Denimal apparaissent aussi deux fois. Le build l'accepte pour ce test seulement (`ARTIST_REPEATS_ALLOWED` dans `content/scripts/buildImport.ts`).

**Genres et décennies validés tels quels** : variété → `chanson`, rap US → `rap`, les autres → `pop` (sauf rock `rock` et électro `electro`).

**Leurres rendus par les tests figés** (`generate.mjs --patch --decoys-only` : seuls ces leurres ont changé, à la même place, par un titre du même genre, de la même langue et sorti à 8 ans au plus de l'original ; bonnes réponses, ordre et autres leurres identiques, contrôlé par comparaison des fichiers). Dégelés, retouchés, `music:verify` 10/10, `music:decoys` sans manque, refigés le 2 novembre 2026.

| Test figé | Question | Leurre retiré | Remplacé par | Rendu à |
|---|---|---|---|---|
| annees-80-facile | a80f-07 | Encore et encore – Francis Cabrel | Les démons de minuit – Images | Variété française des années 80-90 |
| annees-80-facile | a80f-10 | Sweet Child O' Mine – Guns N' Roses | Forever – KISS | Rock : les hymnes |
| annees-90-facile | a90f-01 | Wind Of Change – Scorpions | Don't Speak – No Doubt | Rock : les hymnes |
| annees-90-facile | a90f-02 | All I Want for Christmas Is You – Mariah Carey | Kiss Me – Sixpence None the Richer | Chansons de Noël |
| annees-90-facile | a90f-03 | Californication – Red Hot Chili Peppers | Are You Gonna Go My Way – Lenny Kravitz | Rock : les hymnes |
| chansons-de-fete-facile | fete-08 | Premier Gaou – Magic System | La tribu de Dana – Manau | Tubes d'été |
| chansons-de-fete-facile | fete-09 | Macarena – Los Del Rio | Torero – Chayanne | Tubes d'été |

### Autres écarts aux règles

- Candidats remplacés (mesurés hors « Facile », introuvables ou explicites ; détail dans chaque section) : tubes d'été, « This Girl », « Taki Taki » (explicite), « D.I.S.C.O. » (Ottawan, « Difficile ») → « Bailando », « This Girl (Kungs Vs. Cookin' On 3 Burners) », « Waka Waka » ; variété, « SOS d'un terrien en détresse » (introuvable), « Mon mec à moi », « Ella, elle l'a » (déjà bonne réponse d'un autre test) → « J'ai demandé à la lune », « Savoir aimer », « Quelques mots d'amour » ; années 2020, « L'enfer » et « Anti-Hero » (« Moyen ») → « Mon bébé – RnBoi » et « Hate that i made you love me – Ariana Grande » ; rap US, « California Love » (édition Deezer la plus écoutée titrée en chinois, resté en leurre), « Drop It Like It's Hot » et « HUMBLE. » (« Moyen ») → « Ms. Jackson », « Hot In Herre », « Get Ur Freak On » ; années 70, « Y.M.C.A. » (introuvable) → « Don't Stop Me Now » ; années 60, « These Boots Are Made for Walkin' » et « Light My Fire » → « The House of the Rising Sun » et « What a Wonderful World » ; électro, « Flat Beat » → « Levels ».
- Leurres exclus à la main : artistes français dont le titre ne trahit pas la langue (« Aline », « Amsterdam », « Vesoul », « Rockollection », « En feu », « Samuraï »), « Ti amo », titres mal formés (« No More ?'s », « Stateside + Zara Larsson »), un leurre seulement explicite (« Siente El Boom »).

### Corrections des outils (aucun effet sur les tests figés, jamais régénérés)

- Recherche Deezer (`scripts/blind-tests/deezer.mjs`) : un titre Deezer suivi de « - autre chose » n'est plus pris pour le titre cherché. « Star Wars (Main Title) » avait trouvé « Star Wars - Duel Of The Fates » ; c'était le seul cas dans tous les blind tests. Variante sans apostrophe ajoutée à la recherche (« L' air Du Vent » restait introuvable).
- Mentions de même enregistrement reconnues par le générateur et par `music:verify` : « (Spanish Version) », « (Kungs Vs. …) », « (1984 Version) », « (Générique…) », « (De "Mulan") », « (Bande originale…) », « (Theme From "Rocky") ».
- Contrôle du genre Deezer étendu au rock et à l'électro.

<!-- test:rock-hymnes-facile -->
## Rock : les hymnes (`rock-hymnes-facile`)

level `easy` · decade `all` · genre `rock`

**Écrit**, non figé.

| n° | Niveau visé | Artiste – titre | nb_fan | Position | rank | Extrait | Origine |
|---|---|---|---|---|---|---|---|
| 1 | Facile | Queen – Bohemian Rhapsody | 12 852 230 | 1 | 958 949 | oui | candidat |
| 2 | Facile | AC/DC – Highway to Hell | 9 964 433 | 1 | 978 152 | oui | candidat |
| 3 | Facile | Led Zeppelin – Whole Lotta Love | 5 555 711 | 2 | 828 993 | oui | candidat |
| 4 | Facile | Guns N' Roses – Sweet Child O' Mine | 8 621 941 | 2 | 934 281 | oui | candidat |
| 5 | Facile | The Rolling Stones – (I Can't Get No) Satisfaction | 7 119 941 | 3 | 824 477 | oui | candidat |
| 6 | Facile | Deep Purple – Smoke on the Water | 2 023 741 | 1 | 868 151 | oui | candidat |
| 7 | Facile | Red Hot Chili Peppers – Californication | 7 725 611 | 1 | 957 783 | oui | candidat |
| 8 | Facile | Pink Floyd – Another Brick in the Wall, Pt. 2 | 6 838 937 | 2 | 887 839 | oui | candidat |
| 9 | Facile | Scorpions – Wind of Change | 3 688 819 | 2 | 916 862 | oui | candidat |
| 10 | Facile | Noir Désir – Le vent nous portera | 1 052 339 | 1 | 812 534 | oui | candidat |

<details><summary>Leurres</summary>

- rkh-01 : The Police – Every Breath You Take ; Dire Straits – Walk Of Life ; Lynyrd Skynyrd – Simple Man
- rkh-02 : Metallica – Nothing Else Matters ; Van Halen – Runnin' with the Devil ; KISS – I Was Made For Lovin' You
- rkh-03 : The Who – Baba O'Riley ; ZZ Top – Gimme All Your Lovin' ; Neil Young – Heart of Gold
- rkh-04 : Aerosmith – Dream On ; Bon Jovi – You Give Love A Bad Name ; Pearl Jam – Black
- rkh-05 : Creedence Clearwater Revival – Bad Moon Rising ; Bob Dylan – Like a Rolling Stone ; The Doors – Roadhouse Blues
- rkh-06 : Whitesnake – Here I Go Again ; Alice Cooper – No More Mr. Nice Guy ; Nirvana – Lithium
- rkh-07 : The White Stripes – Seven Nation Army ; Green Day – Basket Case ; Foo Fighters – Everlong
- rkh-08 : Supertramp – The Logical Song ; Fleetwood Mac – The Chain ; David Bowie – Let's Dance
- rkh-09 : Ozzy Osbourne – No More Tears ; Def Leppard – Love Bites ; Europe – Rock the Night
- rkh-10 : Alain Bashung – La nuit je mens ; Louise Attaque – Les nuits parisiennes ; Matmatah – L'apologie

</details>

<!-- /test:rock-hymnes-facile -->

<!-- test:tubes-d-ete-facile -->
## Tubes d'été (`tubes-d-ete-facile`)

level `easy` · decade `all` · genre `pop`

**Écrit**, non figé.

| n° | Niveau visé | Artiste – titre | nb_fan | Position | rank | Extrait | Origine |
|---|---|---|---|---|---|---|---|
| 1 | Facile | Los Del Rio – Macarena | 0 | 1 | 807 135 | oui | gardé |
| 2 | Facile | Magic System – Premier Gaou | 826 470 | 2 | 810 585 | oui | gardé |
| 3 | Facile | Mika – Relax, Take It Easy | 1 077 348 | 2 | 842 845 | oui | gardé |
| 4 | Facile | Bob Sinclar – Love Generation | 1 921 463 | 3 | 769 293 | oui | gardé |
| 5 | Facile | Daddy Yankee – Gasolina | 7 169 905 | 1 | 909 706 | oui | gardé |
| 6 | Facile | Shaggy – Boombastic | 876 363 | 3 | 755 266 | oui | gardé |
| 7 | Facile | Enrique Iglesias – Bailando | 5 961 237 | 1 | 828 116 | oui | réserve |
| 8 | Facile | Kungs – This Girl | 750 011 | 1 | 870 017 | oui | réserve |
| 9 | Facile | Wejdene – Anissa | 526 454 | 2 | 809 244 | oui | gardé |
| 10 | Facile | Shakira – Waka Waka (This Time for Africa) | 11 785 032 | 3 | 920 103 | oui | gardé |

**Remplacements**

- n° 7 : Bailando – Enrique Iglesias → Enrique Iglesias – Bailando (Spanish Version) (réserve) ; écarté : introuvable chez Deezer
- n° 8 : This Girl – Kungs → Kungs – This Girl (Kungs Vs. Cookin' On 3 Burners) (Kungs Vs. Cookin' On 3 Burners) (réserve) ; écarté : introuvable chez Deezer

<details><summary>Leurres</summary>

- ete-01 : Zion & Lennox – Yo Voy ; Aventura – Ella Y Yo ; Don Omar – Salió El Sol
- ete-02 : Black M – La légende Black ; Keen' V – Rien qu'une fois ; Thierry Hazard – Le jerk
- ete-03 : Lost Frequencies – Reality ; Jain – Makeba ; O-Zone – Dragostea din tei
- ete-04 : Martin Solveig – Intoxicated ; Duck Sauce – Barbra Streisand ; Bakermat – Baianá
- ete-05 : Nicky Jam – El Amante ; Arcangel – Sigues Con El ; DJ Snake – Loco Contigo
- ete-06 : Gyptian – Hold You (Hold Yuh) ; Sean Paul – Get Busy ; Beenie Man – King Of The Dancehall
- ete-07 : KAROL G – Si Antes Te Hubiera Conocido ; Lucenzo – Baila Pa Mi ; Chino & Nacho – Andas En Mi Cabeza
- ete-08 : Ofenbach – Overdrive ; Calvin Harris – How Deep Is Your Love ; Mosimann – Ghosts
- ete-09 : Lynda – Passe ton chemin ; Imen Es – 1ère fois ; Eva – Cœur noir
- ete-10 : Nelly Furtado – Promiscuous ; Pitbull – Timber ; Becky G – Shower

</details>

<!-- /test:tubes-d-ete-facile -->

<!-- test:variete-francaise-80-90-facile -->
## Variété française des années 80-90 (`variete-francaise-80-90-facile`)

level `easy` · decade `1980` (époque 1980–1999) · genre `chanson`

**Écrit**, non figé.

| n° | Niveau visé | Artiste – titre | nb_fan | Position | rank | Extrait | Origine |
|---|---|---|---|---|---|---|---|
| 1 | Facile | Jean-Jacques Goldman – Je te donne | 1 880 120 | 2 | 905 909 | oui | candidat |
| 2 | Facile | Mylène Farmer – Désenchantée | 971 412 | 2 | 902 989 | oui | candidat |
| 3 | Facile | Francis Cabrel – Encore et encore | 1 359 155 | 2 | 913 288 | oui | candidat |
| 4 | Facile | Indochine – J'ai demandé à la lune | 1 300 768 | 2 | 918 744 | oui | réserve |
| 5 | Facile | Florent Pagny – Savoir aimer | 1 072 152 | 1 | 873 054 | oui | réserve |
| 6 | Facile | Céline Dion – Pour que tu m'aimes encore | 3 738 362 | 1 | 997 318 | oui | candidat |
| 7 | Facile | Alain Souchon – Foule sentimentale | 597 561 | 1 | 857 875 | oui | candidat |
| 8 | Facile | Michel Berger – Quelques mots d’amour | 523 184 | 4 | 785 587 | oui | réserve |
| 9 | Facile | Laurent Voulzy – Belle-Île-en-Mer Marie-Galante | 434 141 | 5 | 712 771 | oui | candidat |
| 10 | Facile | Alain Bashung – Osez Joséphine | 444 988 | 3 | 741 255 | oui | candidat |

**Remplacements**

- n° 4 : Daniel Balavoine – SOS d'un terrien en détresse → Indochine – J'ai demandé à la lune (réserve) ; écarté : introuvable chez Deezer (enregistrement studio original avec extrait, ni remix ni version refaite)
- n° 5 : Patricia Kaas – Mon mec à moi → Florent Pagny – Savoir aimer (réserve) ; écarté : niveau mesuré D (fans 129552, position 1, rang 759074)
- n° 8 : France Gall – Ella, elle l’a → Michel Berger – Quelques mots d'amour (Remasterisé en 2002) (réserve) ; écarté : morceau déjà bonne réponse d’un autre test

**Titres écartés (réserves)**

- Jean-Jacques Goldman – Encore un matin : niveau mesuré M (fans 1880120, position 16, rang 750560)
- Étienne Daho – Week-end à Rome : niveau mesuré D (fans 283835, position 1, rang 753076)

<details><summary>Leurres</summary>

- vf89-01 : Carole Fredericks – A nos actes manqués ; Axelle Red – Sensualité ; Johnny Hallyday – L'envie
- vf89-02 : Daniel Balavoine – L'Aziza ; Vanessa Paradis – Joe le taxi ; Marc Lavoine – Le parking des anges
- vf89-03 : Renaud – Morgane de toi ; Jean-Louis Aubert – Temps à nouveau ; Julien Clerc – Mélissa
- vf89-04 : De Palmas – Sur la route ; Telephone – Un autre monde ; Larusso – Tu m'oublieras
- vf89-05 : Michel Sardou – Être une femme ; Lara Fabian – Tout ; Stephan Eicher – Déjeuner en paix
- vf89-06 : Tina Arena – Aller Plus Haut ; Louise Attaque – J't'emmène au vent ; Julie Pietri – Eve Lève-Toi
- vf89-07 : Bernard Lavilliers – Idées noires ; Véronique Sanson – Rien que de l'eau ; Eddy Mitchell – Couleur menthe à l'eau
- vf89-08 : France Gall – Résiste ; Les Rita Mitsouko – C'est comme ça ; Pierre Bachelet – Les corons
- vf89-09 : Patrick Bruel – Place des grands hommes ; Tryo – J'ai rien prévu pour demain ; Matmatah – Lambé An Dro
- vf89-10 : Dalida – Mourir sur scène ; Cookie Dingler – Femme libérée ; Manau – La tribu de Dana

</details>

<!-- /test:variete-francaise-80-90-facile -->

<!-- test:rap-us-classiques-facile -->
## Rap US : les classiques (`rap-us-classiques-facile`)

level `easy` · decade `all` (époque 1988–2018) · genre `rap`

**Écrit**, non figé.

| n° | Niveau visé | Artiste – titre | nb_fan | Position | rank | Extrait | Origine |
|---|---|---|---|---|---|---|---|
| 1 | Facile | Eminem – Lose Yourself | 19 163 517 | 1 | 980 436 | oui | candidat |
| 2 | Facile | OutKast – Ms. Jackson (explicite) | 925 557 | 1 | 899 315 | oui | réserve |
| 3 | Facile | The Notorious B.I.G. – Juicy | 1 968 153 | 3 | 756 210 | oui | candidat |
| 4 | Facile | Dr. Dre – Still D.R.E. (explicite) | 4 497 665 | 1 | 943 997 | oui | candidat |
| 5 | Facile | Nelly – Hot In Herre (explicite) | 1 611 740 | 3 | 753 015 | oui | réserve |
| 6 | Facile | Kanye West – Stronger (explicite) | 4 558 526 | 4 | 848 755 | oui | candidat |
| 7 | Facile | JAY-Z – Empire State Of Mind (explicite) | 3 581 264 | 1 | 947 001 | oui | candidat |
| 8 | Facile | 50 Cent – In Da Club (explicite) | 7 884 554 | 1 | 924 879 | oui | candidat |
| 9 | Facile | Coolio – Gangsta's Paradise | 279 436 | 1 | 968 342 | oui | candidat |
| 10 | Facile | Missy Elliott – Get Ur Freak On | 846 930 | 1 | 987 058 | oui | réserve |

**Remplacements**

- n° 2 : 2Pac – California Love → Outkast – Ms. Jackson (réserve) ; écarté : caractères absents des polices ou titre grossier
- n° 5 : Snoop Dogg – Drop It Like It's Hot → Nelly – Hot In Herre (réserve) ; écarté : niveau mesuré M (fans 7989143, position 8, rang 698902)
- n° 10 : Kendrick Lamar – HUMBLE. → Missy Elliott – Get Ur Freak On (réserve) ; écarté : niveau mesuré M (fans 6195751, position 6, rang 816161)

<details><summary>Leurres</summary>

- rus-01 : 2Pac – California Love ; Lil Wayne – Love Me ; The Game – Hate It Or Love It
- rus-02 : Busta Rhymes – I Know What You Want ; Ice Cube – It Was A Good Day ; Mobb Deep – Shook Ones, Pt. II
- rus-03 : Snoop Dogg – Who Am I (What’s My Name)? ; Warren G – Regulate ; DMX – X Gon' Give It To Ya
- rus-04 : Nas – The Message ; Method Man – Da Rockwilder ; Bone Thugs-N-Harmony – Tha Crossroads
- rus-05 : Fat Joe – What's Luv? ; Timbaland – Give It To Me ; Ludacris – Area Codes
- rus-06 : A$AP Rocky – Everyday ; Kendrick Lamar – Swimming Pools (Drank) ; Wiz Khalifa – Black and Yellow
- rus-07 : LL Cool J – Hey Lover ; Drake – God's Plan ; Tyler, The Creator – See You Again
- rus-08 : G-Unit – Poppin' Them Thangs ; Fabolous – Can't Let You Go ; Lloyd Banks – On Fire
- rus-09 : N.W.A – Straight Outta Compton ; Akon – Smack That (Clean) ; Flo Rida – Low
- rus-10 : J. Cole – No Role Modelz ; Soulja Boy – Crank That (Soulja Boy) ; Cypress Hill – Insane in the Brain

</details>

<!-- /test:rap-us-classiques-facile -->

<!-- test:annees-70-facile -->
## Années 70 : les tubes (`annees-70-facile`)

level `easy` · decade `1970` · genre `pop`

**Écrit**, non figé.

| n° | Niveau visé | Artiste – titre | nb_fan | Position | rank | Extrait | Origine |
|---|---|---|---|---|---|---|---|
| 1 | Facile | ABBA – Dancing Queen | 3 203 089 | 1 | 941 096 | oui | candidat |
| 2 | Facile | Bee Gees – Stayin' Alive | 2 618 959 | 1 | 923 327 | oui | candidat |
| 3 | Facile | Eagles – Hotel California | 1 399 805 | 1 | 977 590 | oui | candidat |
| 4 | Facile | Queen – Don't Stop Me Now | 12 852 230 | 2 | 942 478 | oui | réserve |
| 5 | Facile | Earth, Wind & Fire – September | 1 274 334 | 1 | 934 544 | oui | candidat |
| 6 | Facile | Boney M. – Daddy Cool | 956 924 | 1 | 864 901 | oui | candidat |
| 7 | Facile | Donna Summer – Hot Stuff | 852 848 | 1 | 784 022 | oui | candidat |
| 8 | Facile | Chic – Le Freak | 392 942 | 1 | 735 820 | oui | candidat |
| 9 | Facile | Fleetwood Mac – Dreams | 1 683 602 | 2 | 907 653 | oui | candidat |
| 10 | Facile | Elton John – Your Song | 3 017 981 | 2 | 876 287 | oui | candidat |

**Remplacements**

- n° 4 : Village People – Y.M.C.A. → Queen – Don't Stop Me Now (réserve) ; écarté : introuvable chez Deezer (enregistrement studio original avec extrait, ni remix ni version refaite)

<details><summary>Leurres</summary>

- a70f-01 : Electric Light Orchestra – Mr. Blue Sky ; Billy Joel – Vienna ; Rod Stewart – Da Ya Think I'm Sexy?
- a70f-02 : Led Zeppelin – Stairway to Heaven ; Lynyrd Skynyrd – Sweet Home Alabama ; Pink Floyd – Wish You Were Here
- a70f-03 : Dire Straits – Sultans Of Swing ; America – A Horse with No Name ; Eric Clapton – Cocaine
- a70f-04 : Toto – Hold the Line ; The Rolling Stones – Miss You ; Blue Öyster Cult – (Don't Fear) The Reaper
- a70f-05 : Barry White – You're The First, The Last, My Everything ; The Jacksons – Blame It on the Boogie ; Kool & The Gang – Ladies Night
- a70f-06 : Gloria Gaynor – Never Can Say Goodbye ; 10cc – I'm Not In Love ; Creedence Clearwater Revival – Have You Ever Seen The Rain
- a70f-07 : Diana Ross – Ain't No Mountain High Enough ; Blondie – Heart Of Glass ; The Doors – Riders on the Storm
- a70f-08 : Alice Cooper – School's Out ; Bill Withers – Lean On Me ; George Harrison – My Sweet Lord
- a70f-09 : Bob Marley & The Wailers – Three Little Birds ; John Travolta – You're The One That I Want ; Black Sabbath – Paranoid
- a70f-10 : AC/DC – T.N.T. ; Iggy Pop – The Passenger ; The Cure – Boys Don't Cry

</details>

<!-- /test:annees-70-facile -->

<!-- test:annees-60-facile -->
## Années 60 : les tubes (`annees-60-facile`)

level `easy` · decade `1960` · genre `pop`

**Écrit**, non figé.

| n° | Niveau visé | Artiste – titre | nb_fan | Position | rank | Extrait | Origine |
|---|---|---|---|---|---|---|---|
| 1 | Facile | The Beatles – Hey Jude | 8 160 495 | 2 | 859 208 | oui | candidat |
| 2 | Facile | The Rolling Stones – Paint It, Black | 7 119 941 | 2 | 929 006 | oui | candidat |
| 3 | Facile | The Beach Boys – Good Vibrations | 725 830 | 1 | 781 458 | oui | candidat |
| 4 | Facile | Elvis Presley – Suspicious Minds | 3 274 548 | 1 | 758 683 | oui | candidat |
| 5 | Facile | Simon & Garfunkel – The Sound of Silence | 1 170 165 | 1 | 844 727 | oui | candidat |
| 6 | Facile | Aretha Franklin – Respect | 1 873 801 | 2 | 868 206 | oui | candidat |
| 7 | Facile | The Animals – The House of the Rising Sun | 358 561 | 1 | 930 182 | oui | réserve |
| 8 | Facile | Louis Armstrong – What a Wonderful World | 2 066 501 | 1 | 803 233 | oui | réserve |
| 9 | Facile | Ben E. King – Stand By Me | 141 963 | 1 | 930 546 | oui | candidat |
| 10 | Facile | Otis Redding – (Sittin' On) The Dock of the Bay | 1 041 691 | 1 | 846 545 | oui | candidat |

**Remplacements**

- n° 7 : Nancy Sinatra – These Boots Are Made for Walkin' → The Animals – The House of the Rising Sun (réserve) ; écarté : niveau mesuré D (fans 134783, position 1, rang 788199)
- n° 8 : The Doors – Light My Fire → Louis Armstrong – What A Wonderful World (réserve) ; écarté : niveau mesuré M (fans 3812397, position 6, rang 672257)

**Titres écartés (réserves)**

- The Kinks – You Really Got Me : niveau mesuré D (fans 211, position 1, rang 676009)

<details><summary>Leurres</summary>

- a60f-01 : The Doors – Break on Through (To the Other Side) ; Bob Dylan – Blowin' in the Wind ; The Kinks – Sunny Afternoon
- a60f-02 : Creedence Clearwater Revival – Proud Mary ; Janis Joplin – Kozmic Blues ; Cream – Sunshine Of Your Love
- a60f-03 : The Turtles – Happy Together ; Donovan – Season of the Witch ; The Moody Blues – Nights In White Satin
- a60f-04 : Neil Diamond – Sweet Caroline ; The Righteous Brothers – Unchained Melody ; Chuck Berry – You Never Can Tell
- a60f-05 : The Mamas & The Papas – Dream A Little Dream Of Me ; Leonard Cohen – Suzanne ; Steppenwolf – Born To Be Wild
- a60f-06 : Etta James – At Last ; Marvin Gaye – I Heard It Through The Grapevine ; Sam Cooke – A Change Is Gonna Come
- a60f-07 : Big Brother & The Holding Company – Piece of My Heart ; Jefferson Airplane – White Rabbit ; Shocking Blue – Venus
- a60f-08 : Roy Orbison – Oh, Pretty Woman ; Dusty Springfield – Son Of A Preacher Man ; Jackson 5 – Who's Loving You
- a60f-09 : The Supremes – You Can't Hurry Love ; The Temptations – My Girl ; Four Tops – I Can't Help Myself (Sugar Pie, Honey Bunch)
- a60f-10 : James Brown – I Got You (I Feel Good) ; Joe Cocker – With A Little Help From My Friends ; Buffalo Springfield – For What It's Worth

</details>

<!-- /test:annees-60-facile -->

<!-- test:annees-2020-facile -->
## Années 2020 : les tubes (`annees-2020-facile`)

level `easy` · decade `2020` · genre `pop`

**Écrit**, non figé.

| n° | Niveau visé | Artiste – titre | nb_fan | Position | rank | Extrait | Origine |
|---|---|---|---|---|---|---|---|
| 1 | Facile | The Weeknd – Blinding Lights | 14 771 271 | 1 | 984 833 | oui | candidat |
| 2 | Facile | Dua Lipa – Levitating | 8 804 953 | 2 | 902 185 | oui | candidat |
| 3 | Facile | Harry Styles – As It Was | 2 210 396 | 1 | 969 095 | oui | candidat |
| 4 | Facile | Miley Cyrus – Flowers | 7 254 199 | 1 | 966 114 | oui | candidat |
| 5 | Facile | Tones And I – Dance Monkey | 551 510 | 2 | 921 950 | oui | candidat |
| 6 | Facile | Glass Animals – Heat Waves | 324 362 | 1 | 948 600 | oui | candidat |
| 7 | Facile | Måneskin – Beggin | 1 011 678 | 2 | 946 093 | oui | candidat |
| 8 | Facile | RnBoi – Mon bébé | 320 059 | 2 | 997 284 | oui | découverte (playlist « HITS 2026 (Playlist tubes du moment, hits radio) ») |
| 9 | Facile | Soolking – Suavemente | 1 892 438 | 3 | 878 636 | oui | candidat |
| 10 | Facile | Ariana Grande – Hate that i made you love me | 13 458 947 | 1 | 999 011 | oui | découverte (playlist « HITS 2026 (Playlist tubes du moment, hits radio) ») |

**Remplacements**

- n° 8 : Stromae – L'enfer → RnBoi – MON BÉBÉ (découverte, playlist « HITS 2026 (Playlist tubes du moment, hits radio) ») ; écarté : niveau mesuré M (fans 3498811, position 7, rang 832701)
- n° 10 : Taylor Swift – Anti-Hero → Ariana Grande – hate that i made you love me (découverte, playlist « HITS 2026 (Playlist tubes du moment, hits radio) ») ; écarté : niveau mesuré M (fans 12765298, position 13, rang 806376)

**Titres écartés (réserves)**

- Olivia Rodrigo – drivers license : paroles explicites (refusées hors rap)
- Ed Sheeran – Bad Habits : niveau mesuré M (fans 20952164, position 15, rang 745162)
- Angèle – Bruxelles je t’aime : niveau mesuré M (fans 1753963, position 18, rang 864533)
- Aya Nakamura – Djadja : niveau mesuré M (fans 2773396, position 14, rang 878016)

<details><summary>Leurres</summary>

- a20f-01 : Justin Bieber – DAISIES ; Sam Smith – Unholy ; Tory Lanez – The Color Violet
- a20f-02 : Zara Larsson – Midnight Sun ; Ed Sheeran – Bad Habits ; Lady Gaga – The Dead Dance
- a20f-03 : Olivia Rodrigo – stupid song ; Billie Eilish – WILDFLOWER ; sombr – 12 to 12
- a20f-04 : Taylor Swift – Opalite ; Camila Cabello – Bam Bam ; Charlie Puth – Light Switch
- a20f-05 : OneRepublic – I Ain't Worried ; Lewis Capaldi – Forget Me ; Rag'n'Bone Man – Anywhere Away from Here
- a20f-06 : Milky Chance – Camouflage ; Damiano David – The First Time ; Olivia Dean – So Easy (To Fall In Love)
- a20f-07 : Benson Boone – Beautiful Things ; Imagine Dragons – Enemy ; Twenty One Pilots – Drag Path
- a20f-08 : Angèle – Au revoir ; Eva – Sur la piste ; Bamby – Pas Jalouse
- a20f-09 : Grand Corps Malade – Mais je t'aime ; Joseph Kamel – Beau ; Mentissa – Et Bam
- a20f-10 : Sabrina Carpenter – Tears ; Meghan Trainor – Made You Look ; GIMS – PARISIENNE

</details>

<!-- /test:annees-2020-facile -->

<!-- test:electro-dance-hymnes-facile -->
## Électro et dance : les hymnes (`electro-dance-hymnes-facile`)

level `easy` · decade `all` · genre `electro`

**Écrit**, non figé.

| n° | Niveau visé | Artiste – titre | nb_fan | Position | rank | Extrait | Origine |
|---|---|---|---|---|---|---|---|
| 1 | Facile | Daft Punk – Around the World | 5 230 239 | 5 | 830 730 | oui | gardé |
| 2 | Facile | David Guetta – Titanium | 20 159 844 | 4 | 956 365 | oui | gardé |
| 3 | Facile | Calvin Harris – Summer | 12 341 528 | 3 | 901 999 | oui | gardé |
| 4 | Facile | Swedish House Mafia – Don't You Worry Child | 2 171 834 | 3 | 867 392 | oui | gardé |
| 5 | Facile | Martin Garrix – Animals | 7 599 814 | 2 | 839 789 | oui | gardé |
| 6 | Facile | Darude – Sandstorm | 57 069 | 1 | 827 812 | oui | gardé |
| 7 | Facile | Alan Walker – Faded | 4 059 108 | 1 | 878 556 | oui | gardé |
| 8 | Facile | Avicii – Levels | 8 374 495 | 1 | 898 187 | oui | gardé |
| 9 | Facile | Benny Benassi – Satisfaction | 357 785 | 1 | 746 763 | oui | gardé |
| 10 | Facile | Eric Prydz – Call on Me | 209 394 | 1 | 828 441 | oui | gardé |

<details><summary>Leurres</summary>

- edh-01 : Justice – Phantom ; Bob Sinclar – World Hold On (Children of the Sky) ; Fatboy Slim – Right Here, Right Now
- edh-02 : Martin Solveig – All Stars ; Ofenbach – Head Shoulders Knees & Toes ; Alesso – Heroes (we could be)
- edh-03 : Galantis – Runaway (U & I) ; Robin Schulz – Speechless ; Tiësto – The Business
- edh-04 : Armin van Buuren – Blah Blah Blah ; Axwell – Whatever Turns You On ; Sebastian Ingrosso – Reload
- edh-05 : The Chainsmokers – Closer ; R3HAB – Believe (Shooting Stars) ; Dvbbs – Tsunami
- edh-06 : ATB – 9Pm (Till I Come) ; Paul van Dyk – For An Angel ; Alex Gaudino – Destination Calabria
- edh-07 : Kygo – Firestone ; Steve Aoki – Azukita ; Kshmr – Bonfire
- edh-08 : ZEDD – Clarity ; Afrojack – Allein ; Stardust – Music Sounds Better With You
- edh-09 : Bingo Players – Rattle ; Deorro – Five More Hours ; Jack Ü – Where Are Ü Now
- edh-10 : Duke Dumont – Won't Look Back ; Deadmau5 – I Remember ; Dynoro – In My Mind

</details>

<!-- /test:electro-dance-hymnes-facile -->

<!-- test:chansons-de-noel-facile -->
## Chansons de Noël (`chansons-de-noel-facile`)

level `easy` · decade `all` · genre `pop`

**Écrit**, non figé.

| n° | Niveau visé | Artiste – titre | nb_fan | Position | rank | Extrait | Origine |
|---|---|---|---|---|---|---|---|
| 1 | Facile | Mariah Carey – All I Want for Christmas Is You | 3 463 888 | 1 | 880 090 | oui | candidat |
| 2 | Facile | Wham! – Last Christmas | 373 861 | 2 | 873 405 | oui | candidat |
| 3 | Facile (exception : mesuré Difficile) | Tino Rossi – Petit papa Noël | 31 269 | 1 | 627 948 | oui | candidat |
| 4 | Facile (exception : mesuré Difficile) | Brenda Lee – Rockin' Around the Christmas Tree | 77 406 | 1 | 669 988 | oui | candidat |
| 5 | Facile (exception : mesuré Difficile) | Slade – Merry Xmas Everybody | 57 297 | 2 | 413 031 | oui | candidat |
| 6 | Facile (exception : mesuré Difficile) | José Feliciano – Feliz Navidad | 75 285 | 1 | 660 252 | oui | candidat |
| 7 | Facile (exception : mesuré Difficile) | Chris Rea – Driving Home for Christmas | 202 123 | 3 | 621 668 | oui | candidat |
| 8 | Facile (exception : mesuré Difficile) | Band Aid – Do They Know It's Christmas? | 5 348 | 1 | 580 578 | oui | candidat |
| 9 | Facile (exception : mesuré Difficile) | Andy Williams – It's the Most Wonderful Time of the Year | 43 859 | 1 | 726 867 | oui | candidat |
| 10 | Facile | John Lennon – Happy Xmas (War Is Over) | 2 608 968 | 5 | 647 914 | oui | candidat |

<details><summary>Leurres</summary>

- noel-01 : Sia – Snowman ; Ariana Grande – Santa Tell Me ; Kelly Clarkson – Underneath the Tree
- noel-02 : The Ronettes – Sleigh Ride ; Dean Martin – Let It Snow! Let It Snow! Let It Snow! ; Justin Bieber – Mistletoe
- noel-03 : Johnny Hallyday – Mon plus beau Noël ; La Compagnie Créole – Bons baisers de Fort-de-France ; Dalida – Vive le vent
- noel-04 : Michael Bublé – It's Beginning to Look a Lot Like Christmas ; Frank Sinatra – Jingle Bells ; Bobby Helms – Jingle Bell Rock
- noel-05 : Bing Crosby – White Christmas ; Jackson 5 – I Saw Mommy Kissing Santa Claus ; Train – Shake Up Christmas
- noel-06 : Nat King Cole – The Christmas Song (Merry Christmas To You) ; Coldplay – Christmas Lights ; Taylor Swift – Christmas Tree Farm
- noel-07 : Paul McCartney – Wonderful Christmastime ; Elton John – Step Into Christmas ; Shakin' Stevens – Merry Christmas Everyone
- noel-08 : Gene Autry – Rudolph the Red-Nosed Reindeer ; Burl Ives – A Holly Jolly Christmas ; Darlene Love – Christmas (Baby Please Come Home)
- noel-09 : Sabrina Carpenter – A Nonsense Christmas ; Eartha Kitt – Santa Baby ; Leona Lewis – One More Sleep
- noel-10 : Elvis Presley – Blue Christmas ; Chuck Berry – Run Rudolph Run ; Gwen Stefani – You Make It Feel Like Christmas

</details>

<!-- /test:chansons-de-noel-facile -->

<!-- test:musiques-films-series-facile -->
## Musiques de films et séries (`musiques-films-series-facile`)

level `easy` · decade `all` · genre `pop`

**Écrit**, non figé.

| n° | Niveau visé | Artiste – titre | nb_fan | Position | rank | Extrait | Origine |
|---|---|---|---|---|---|---|---|
| 1 | Facile (exception : mesuré Moyen) | John Williams – Star Wars: Main Title | 893 822 | 45 | 150 791 | oui | candidat |
| 2 | Facile (exception : mesuré Difficile) | Klaus Badelt – He's a Pirate | 280 066 | 1 | 770 970 | oui | candidat |
| 3 | Facile (exception : mesuré Moyen) | Ramin Djawadi – Game of Thrones | 546 495 | 15 | 437 425 | oui | candidat |
| 4 | Facile (exception : mesuré Difficile) | Lalo Schifrin – Mission: Impossible | 34 817 | 1 | 359 732 | oui | candidat |
| 5 | Facile (exception : mesuré Difficile) | Monty Norman – James Bond Theme | 272 | 1 | 386 588 | oui | candidat |
| 6 | Facile (exception : mesuré Difficile) | Bill Conti – Gonna Fly Now | 28 145 | 2 | 586 137 | oui | candidat |
| 7 | Facile | Ray Parker Jr. – Ghostbusters | 20 493 | 1 | 962 783 | oui | candidat |
| 8 | Facile | Yann Tiersen – Comptine d'un autre été, l'après-midi | 601 203 | 1 | 881 766 | oui | candidat |
| 9 | Facile (exception : mesuré Difficile) | Bruno Coulais – Vois sur ton chemin | 100 960 | 1 | 756 157 | oui | candidat |
| 10 | Facile (exception : mesuré Difficile) | Nino Rota – Love Theme From "The Godfather" | 53 695 | 1 | 546 920 | oui | candidat |

<details><summary>Leurres</summary>

- bof-01 : Howard Shore – Concerning Hobbits ; Alan Silvestri – The Avengers ; Hans Zimmer – Time
- bof-02 : James Newton Howard – The Hanging Tree ; Michael Andrews – Mad World ; Ludovico Einaudi – Fly
- bof-03 : Mike Oldfield – Tubular Bells (Opening Theme / From "The Exorcist") ; Vangelis – Conquest of Paradise ; Henry Mancini – The Pink Panther Theme
- bof-04 : Jan Hammer – Miami Vice Theme ; Harold Faltermeyer – Axel F ; Simple Minds – Don't You (Forget About Me)
- bof-05 : Enya – May It Be ; Justin Hurwitz – Mia & Sebastian’s Theme ; Will Smith – Men In Black
- bof-06 : Stealers Wheel – Stuck In The Middle With You ; Kyle Dixon & Michael Stein – Stranger Things ; Smash Mouth – All Star
- bof-07 : Lana Del Rey – Young And Beautiful ; Berlin – Take My Breath Away (Love Theme from "Top Gun") ; John Carpenter – Halloween Theme
- bof-08 : CharlElie Couture – Je Suis Ton Ami ; Alabina – Alabina ; Ennio Morricone – Chi Mai
- bof-09 : Vladimir Cosma – Le grand blond ; Francis Lai – Un Homme Et Une Femme ; Debbie Davis – L'histoire de la vie
- bof-10 : Bee Gees – Night Fever ; Nancy Sinatra – Bang Bang ; Kenny Loggins – Footloose

</details>

<!-- /test:musiques-films-series-facile -->

<!-- test:disney-facile -->
## Disney : les chansons cultes (`disney-facile`)

level `easy` · decade `all` · genre `pop`

**Écrit**, non figé.

| n° | Niveau visé | Artiste – titre | nb_fan | Position | rank | Extrait | Origine |
|---|---|---|---|---|---|---|---|
| 1 | Facile | Anaïs Delva – Libérée, délivrée | 156 201 | 1 | 936 885 | oui | candidat |
| 2 | Facile (exception : mesuré Difficile) | Dimitri Rougeul – Hakuna Matata | 1 492 | 1 | 786 826 | oui | candidat |
| 3 | Facile (exception : mesuré Difficile) | Karine Costa – Ce rêve bleu | 2 923 | 1 | 765 790 | oui | candidat |
| 4 | Facile (exception : mesuré Difficile) | Lucie Dolène – Histoire éternelle | 1 331 | 1 | 767 517 | oui | candidat |
| 5 | Facile (exception : mesuré Difficile) | Henri Salvador – Sous l'océan | 97 281 | 1 | 799 604 | oui | candidat |
| 6 | Facile (exception : mesuré Difficile) | Jean Stout – Il en faut peu pour être heureux | 693 | 1 | 753 666 | oui | candidat |
| 7 | Facile | Cerise Calixte – Le bleu lumière | 16 317 | 1 | 873 395 | oui | candidat |
| 8 | Facile | Sharon Laloum – Ne parlons pas de Bruno | 989 | 1 | 827 990 | oui | candidat |
| 9 | Facile (exception : mesuré Difficile) | Laura Mayne – L'air du vent | 64 | 1 | 797 850 | oui | candidat |
| 10 | Facile (exception : mesuré Difficile) | José Germain – Tout le monde veut devenir un cat | 334 | 1 | 710 104 | oui | candidat |

<details><summary>Leurres</summary>

- dsn-01 : Maïdi Roth – L'Amour Brille Sous Les Étoiles ; Maéva Méline – Où est la vraie vie? ; Coralie Thuilier – Je Voudrais un Bonhomme de Neige
- dsn-02 : Guillaume Beaujolais – L’Amour Est un Cadeau ; Patrick Fiori – Comme un homme ; Emmylou Homs – Le Renouveau
- dsn-03 : Kelly Marot – Nous Sommes Un ; Mimi Félixine – De Zéro En Héros ; Charlotte Hervieux – Dans un autre monde
- dsn-04 : Claire Guyot – Partir là-bas ; Jean Piat – Soyez Prêtes ; Emmanuel Curtil – En Été
- dsn-05 : Marie-Thérèse Orain – Honneur à tous ; Pierre Marret – La patrouille des éléphants ; Donald Reignoux – J'ai perdu le nord
- dsn-06 : Bernard Alane – Nuits d'Arabie ; Sophie Delmas – N’écoute que moi ; Marie Galey – Réflexion
- dsn-07 : Rachel Pignot – Sifflez en travaillant ; Jean-Claude Corbel – Gaston ; Maurice Chevalier – Les Aristochats
- dsn-08 : Jean-Claude Donda – Heigh-Ho! ; Richard Darbois – Prince Ali ; China Moses – Au Bout du Rêve
- dsn-09 : Camille – Le Festin ; Francis Lalanne – Rien qu'un Jour ; Emmanuel Dahl – Le Monde Qui Est Le Mien
- dsn-10 : Michel Roux – Chem-chem Cheminée ; Bénédicte Lecroard – Je ne savais pas ; Debbie Davis – L'histoire de la vie

</details>

<!-- /test:disney-facile -->

<!-- test:generiques-dessins-animes-facile -->
## Génériques de dessins animés (`generiques-dessins-animes-facile`)

level `easy` · decade `all` (époque 1975–2005) · genre `pop`

**Écrit**, non figé.

| n° | Niveau visé | Artiste – titre | nb_fan | Position | rank | Extrait | Origine |
|---|---|---|---|---|---|---|---|
| 1 | Facile (exception : mesuré Difficile) | Bernard Minet – Dragon Ball et Dragon Ball Z | 11 422 | 2 | 387 960 | oui | candidat |
| 2 | Facile (exception : mesuré Difficile) | Bernard Minet – Les chevaliers du zodiaque | 11 422 | 1 | 458 010 | oui | candidat |
| 3 | Facile (exception : mesuré Difficile) | Isabelle Guillard – Signé Cat's Eyes | 116 | 1 | 535 116 | oui | candidat |
| 4 | Facile (exception : mesuré Difficile) | Jacques Cardona – Les mystérieuses cités d'or | 6 174 | 1 | 504 178 | oui | candidat |
| 5 | Facile (exception : mesuré Difficile) | Les Goldies – Goldorak : La légende d'Actarus | 1 368 | 1 | 311 095 | oui | candidat |
| 6 | Facile (exception : mesuré Difficile) | Jacques Cardona – Inspecteur Gadget | 6 174 | 1 | 521 070 | oui | candidat |
| 7 | Facile (exception : mesuré Difficile) | Éric Charden – Albator, le corsaire de l'espace | 2 551 | 2 | 443 428 | oui | candidat |
| 8 | Facile (exception : mesuré Difficile) | Lionel Leroy – Ulysse 31 | 1 382 | 1 | 426 664 | oui | candidat |
| 9 | Facile (exception : mesuré Difficile) | Jean-Paul Césari – Nicky Larson | 517 | 1 | 464 761 | oui | candidat |
| 10 | Facile (exception : mesuré Difficile) | Dominique Poulain – Au pays de Candy | 408 | 1 | 413 953 | oui | candidat |

<details><summary>Leurres</summary>

- gen-01 : Elfie – Tom Sawyer: Le petit monde de Tom Sawyer ; Noam – Les entrechats sont là! ; Olivier Constantin – Cobra
- gen-02 : Nick Carr – Jayce et les conquérants de la lumière ; Dorothée – Les Schtroumpfs ; Claude Lombard – Flo et les Robinson Suisses
- gen-03 : Peter Lorne – Denver le dernier dinosaure ; Vladimir Cosma – Les mondes engloutis ; Ricet Barrier – Voici venir les Barbapapa
- gen-04 : Charlotte – Mes tendres années ; Richard Simon – Capitaine Flam: La chevauchée du Capitaine Flam ; Les Minipouss – Les Minipouss
- gen-05 : Bernard Denimal – Ken le survivant ; The Edwin Davids Jazz Band – La panthère rose ; Valérie Barouille – BécéBégé
- gen-06 : Marie Dauphin – Clémentine ; Stephanie – Les bisous des Bisounours ; H. Saban – Les maîtres de l'univers
- gen-07 : Daniele Hazan – L'ours Gabby et les Petits Malins ; Michel Legrand – Il était une fois...l'espace ; Marie Dauphin – Lady Oscar
- gen-08 : Noam – Les quatre fantastiques ; Stéphanie Barre – La chanson de mon petit poney ; Francine Chantereau – La chanson de Lamu
- gen-09 : Alexandra – La chanson d'Heidi ; Emmanuelle – Poupée de bois ; Bernard Denimal – Galaxy Express
- gen-10 : Céline Pouzet – Rahan ; Junior Family – But pour Rudy ; Paolo Tuci – Creamy, Merveilleuse Creamy

</details>

<!-- /test:generiques-dessins-animes-facile -->
