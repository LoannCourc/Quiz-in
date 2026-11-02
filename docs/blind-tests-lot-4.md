# Blind tests : lot 4

Mesures Deezer : fans de l'artiste (`nb_fan`), position du morceau chez l'artiste (la meilleure entre le top Deezer et le classement par rang), rang de la piste (`rank`). Seuils : `scripts/blind-tests/thresholds.json` (calibrés au lot 1, plafond de 100 000 fans en Impossible).

<!-- synthese -->
## Synthèse (2 novembre 2026)

**8 tests écrits** (lot `BT-11`, `addedAt` 2026-11-02), tous « Impossible » (10 × difficulté 4, `audience` `experts`). Pour chacun : `npm run music:verify` 10/10, `npm run music:decoys` sans manque, `npm run build` réussi. **Non figés.** Bonnes réponses : 674 à 92 367 fans (plafond 100 000), en position 6 ou plus chez leur artiste. Règles du lot contrôlées sur le contenu final : aucune bonne réponse déjà utilisée dans un autre test, aucun leurre repris d'un test figé, aucun artiste « Impossible » bonne réponse d'un autre blind test (règle du build).

Méthode (tes notes « l'artiste est une piste de départ ») : titre demandé s'il passe ; sinon, ou sans titre, premier titre du top Deezer de l'artiste en position 6 ou plus qui passe (`pickFromArtist`, artiste homonyme le plus suivi, titres crédités à lui seul) ; sinon un artiste de réserve, sinon un artiste proche trouvé par l'API.

| Test | Genre / décennie du contenu | Titre demandé gardé | Autre titre de l'artiste | Réserve | Artiste trouvé par l'API |
|---|---|---|---|---|---|
| Rock indé : faces cachées | `rock` / `all` (2000-2022) | 2 | 7 | 0 | 1 (Wilco, pour Viet Cong) |
| Pop internationale oubliée | `pop` / 2000 (1998-2010) | 0 | 7 | 0 | 3 (Five, Jewel, Sugababes) |
| Rap US underground | `rap` / `all` (1998-2020) | 4 | 5 | 0 | 1 (Isaiah Rashad) |
| Rap français old school | `rap` / 1990 (1990-2006) | — | 8 | 2 (Ministère A.M.E.R., Passi) | 0 |
| Variété française oubliée | `chanson` / 1980 (1980-1999) | — | 8 | 2 (Léopold Nord & Vous, Les Forbans) | 0 |
| Électro pointue | `electro` / `all` | — | 9 | 1 (Surgeon) | 0 |
| Années 80 oubliées | `pop` / 1980 | — | 9 | 1 (Johnny Hates Jazz) | 0 |
| Nouvelle scène française | `chanson` / `all` (2012-2026) | — | 9 | 1 (Jeanne Added) | 0 |

**Artistes de départ écartés** (détail dans chaque section) : au-dessus du plafond de 100 000 fans, Natalie Imbruglia (207 085), Hilary Duff (603 296), Jedi Mind Tricks (103 448), Fonky Family (270 842), Lunatic (174 301), Jeanne Mas (101 912), L'Impératrice, La Femme ; aucun titre en position 6 ou plus qui passe, Viet Cong, Blue, Peter & Sloane, Joniece Jamison, Actress ; **Nik Kershaw** : bonne réponse de « Le grand mélange » (lot 3), interdit en « Impossible » par la règle du build ; **Bagarre** : tous ses titres sont sur l'album « CLUB 12345 », refusé par `music:verify` (« club » y signale une autre version).

**Titres demandés écartés** : ceux de tes listes étaient presque tous le morceau le plus connu de leur artiste (position 1 ou 2, mesurés « Difficile » : « Beautiful Blue Sky », « Before the World Was Big », « It's Real », « None Shall Pass »…), ce qui est hors de la définition « Impossible » (position 6 ou plus).

### À écouter en priorité

- Homonymes corrigés en cours de route (« Lunatic » à 39 fans, « Ménélik » à 17, « Last Train » à 61, « Lio » à 3 : d'autres artistes du même nom) ; vérifier à l'écoute que chaque extrait est bien de l'artiste attendu, surtout « Lio – Saisons », « Menelik – Tranquille », « X-Men – J'attaque du mic », « Secteur A – Boyblacka ».
- Électro : morceaux longs, extrait de 30 s à juger (ta remarque).
- Lot 2, deux pistes prises sur des EP de remix, seules éditions chez Deezer (version d'origine attendue) : « Call on Me » (Eric Prydz, album « Call On Me (Remixes) ») et « Premier Gaou » (Magic System, « Premier Gaou, The Remixes »).

### Corrections des outils

- Recherche par artiste de départ (`pickFromArtist`) : homonyme le plus suivi, seuls les titres crédités à l'artiste (le top de X-Men contenait un titre de Kyo Itachi, celui de Carl Craig un titre de Green Velvet).
- Album d'une autre version refusé (instrumental, live, karaoké, unplugged, acoustique, reprise) : « Mr. Slow Flow » (Evidence) venait de « The Weatherman LP (Instrumental) ». Contrôle fait sur tous les blind tests : aucune autre piste concernée, hors les deux EP de remix ci-dessus.
- « (RMX) », « (Mixed) » refusés comme autres versions ; « (Featuring …) » reconnu par `music:verify` ; « Shake Ya Ass » ajouté au filtre des titres grossiers.
- Un artiste exclu d'un test l'est aussi comme bonne réponse (K-pop retrouvée par l'API dans la pop internationale : BoA, Shinhwa).
- Exclusions par test : reprises (« Hopelessly Devoted to You », « Take Me Home, Country Roads », « These Boots Are Made for Walkin' », chansons de Noël), K-pop, titres de mixtapes composites, moitiés d'un duo bonne réponse (Elli Medeiros et Jacno), Richie Hawtin (Plastikman est son pseudonyme), titres introuvables par `music:decoys`.

<!-- test:rock-indie-impossible -->
## Rock indé : faces cachées (`rock-indie-impossible`)

level `impossible` · decade `all` (époque 2000–2022) · genre `rock`

**Écrit**, non figé.

| n° | Niveau visé | Artiste – titre | nb_fan | Position | rank | Extrait | Origine |
|---|---|---|---|---|---|---|---|
| 1 | Impossible | Ought – Habit | 4 839 | 6 | 108 864 | oui | artiste de départ |
| 2 | Impossible | Wilco – Impossible Germany | 92 367 | 6 | 418 692 | oui | découverte (playlist « 2000 - 2010... '00s '10s [ indie , pop , rock , el ») |
| 3 | Impossible | Girlpool – Faultline | 4 227 | 6 | 141 498 | oui | artiste de départ |
| 4 | Impossible | Yuck – Middle Sea | 12 965 | 6 | 114 784 | oui | artiste de départ |
| 5 | Impossible | Cloud Nothings – Modern Act | 18 015 | 6 | 141 127 | oui | artiste de départ |
| 6 | Impossible | Real Estate – Talking Backwards | 39 612 | 6 | 254 010 | oui | artiste de départ |
| 7 | Impossible | The Pains Of Being Pure At Heart – Belong | 19 672 | 6 | 135 781 | oui | artiste de départ |
| 8 | Impossible | Wild Nothing – Shadow | 30 306 | 7 | 204 816 | oui | candidat |
| 9 | Impossible | Beach Fossils – Daydream | 30 968 | 23 | 164 807 | oui | candidat |
| 10 | Impossible | Surfer Blood – I Was Wrong | 8 136 | 6 | 90 810 | oui | artiste de départ |

**Remplacements**

- n° 1 : Ought – Beautiful Blue Sky → Ought – Habit (artiste de départ, autre titre) ; écarté : niveau mesuré D (fans 4839, position 1, rang 215239)
- n° 2 : Viet Cong – Continental Shelf → Wilco – Impossible Germany (découverte, playlist « 2000 - 2010... '00s '10s [ indie , pop , rock , el ») ; écarté : introuvable chez Deezer (enregistrement studio original avec extrait, ni remix ni version refaite)
- n° 3 : Girlpool – Before the World Was Big → Girlpool – Faultline (artiste de départ, autre titre) ; écarté : niveau mesuré D (fans 4227, position 2, rang 241220)
- n° 4 : Yuck – Get Away → Yuck – Middle Sea (artiste de départ, autre titre) ; écarté : niveau mesuré D (fans 12965, position 1, rang 246384)
- n° 5 : Cloud Nothings – Wasted Days → Cloud Nothings – Modern Act (artiste de départ, autre titre) ; écarté : niveau mesuré D (fans 18015, position 2, rang 303237)
- n° 6 : Real Estate – It's Real → Real Estate – Talking Backwards (artiste de départ, autre titre) ; écarté : niveau mesuré D (fans 39612, position 2, rang 375290)
- n° 7 : The Pains of Being Pure at Heart – Young Adult Friction → The Pains Of Being Pure At Heart – Belong (artiste de départ, autre titre) ; écarté : niveau mesuré D (fans 19672, position 1, rang 231190)
- n° 10 : Surfer Blood – Swim → Surfer Blood – I Was Wrong (artiste de départ, autre titre) ; écarté : niveau mesuré non classé (fans 8136, position 4, rang 108777)

<details><summary>Leurres</summary>

- rii-01 : Crystal Stilts – Graveyard Orbit ; Preoccupations – Slowly ; Moon Duo – The World and the Sun
- rii-02 : Father John Misty – Hollywood Forever Cemetery Sings ; Sharon Van Etten – Like I Used To ; The Shins – A Comet Appears
- rii-03 : Palehound – Cinnamon ; Soccer Mommy – Inside Out ; Tennis – Needle And A Knife
- rii-04 : Chastity Belt – Why Try ; Built to Spill – Comes a Day ; Deerhunter – Plains
- rii-05 : The Orwells – Gotta Get Down ; Japandroids – The Nights of Wine and Roses ; Wavves – Dog
- rii-06 : STRFKR – Bury Us Alive ; Future Islands – Thrill ; Whitney – Light Upon the Lake
- rii-07 : Camera Obscura – Away with Murder ; Dum Dum Girls – Rimbaud Eyes ; The Raveonettes – The Christmas Song
- rii-08 : The Radio Dept. – Against the Tide ; Porches – Mood ; Craft Spells – Ramona
- rii-09 : Alvvays – Red Planet ; No Vacation – Linger ; GOOD MORNING – Radiovoice
- rii-10 : Born Ruffians – Nova-Leigh ; Best Coast – The End ; Peter Bjorn and John – Between The Lines

</details>

<!-- /test:rock-indie-impossible -->

<!-- test:pop-internationale-oubliee-impossible -->
## Pop internationale oubliée (`pop-internationale-oubliee-impossible`)

level `impossible` · decade `2000` (époque 1998–2010) · genre `pop`

**Écrit**, non figé.

| n° | Niveau visé | Artiste – titre | nb_fan | Position | rank | Extrait | Origine |
|---|---|---|---|---|---|---|---|
| 1 | Impossible | Atomic Kitten – Be With You | 37 966 | 6 | 279 289 | oui | artiste de départ |
| 2 | Impossible | Five – Let's Dance | 30 944 | 6 | 338 262 | oui | découverte (playlist « Boys Bands and Girls Bands of 90s 2000s ») |
| 3 | Impossible | Mandy Moore – Crossing the Line | 40 356 | 6 | 264 464 | oui | artiste de départ |
| 4 | Impossible | Michelle Branch – Are You Happy Now? | 36 370 | 6 | 338 852 | oui | artiste de départ |
| 5 | Impossible | Jewel – Standing Still | 37 536 | 6 | 267 444 | oui | découverte (playlist « Girl Bands of the 90s/2000s ») |
| 6 | Impossible | Liberty X – X | 4 568 | 6 | 78 388 | oui | artiste de départ |
| 7 | Impossible | A1 – Heaven By Your Side | 16 965 | 6 | 209 853 | oui | artiste de départ |
| 8 | Impossible | Mis-Teeq – Dance Your Cares Away | 5 272 | 6 | 137 602 | oui | artiste de départ |
| 9 | Impossible | Sugababes – Overload | 57 387 | 6 | 460 280 | oui | découverte (artiste lié) |
| 10 | Impossible | Delta Goodrem – Wings | 30 812 | 6 | 354 436 | oui | artiste de départ |

**Remplacements**

- n° 1 : Atomic Kitten – The Tide Is High → Atomic Kitten – Be With You (artiste de départ, autre titre) ; écarté : introuvable chez Deezer (enregistrement studio original avec extrait, ni remix ni version refaite)
- n° 2 : Natalie Imbruglia – Wishing I Was There → Five – Let's Dance (Radio Edit) (découverte, playlist « Boys Bands and Girls Bands of 90s 2000s ») ; écarté : niveau mesuré non classé (fans 207073, position 5, rang 349089)
- n° 3 : Mandy Moore – Candy → Mandy Moore – Crossing the Line (artiste de départ, autre titre) ; écarté : niveau mesuré non classé (fans 40356, position 4, rang 389980)
- n° 4 : Michelle Branch – Goodbye to You → Michelle Branch – Are You Happy Now? (artiste de départ, autre titre) ; écarté : niveau mesuré D (fans 36370, position 2, rang 398307)
- n° 5 : Blue – One Love → Jewel – Standing Still (découverte, playlist « Girl Bands of the 90s/2000s ») ; écarté : niveau mesuré D (fans 141977, position 2, rang 557042)
- n° 6 : Liberty X – Thinking It Over → Liberty X – X (artiste de départ, autre titre) ; écarté : niveau mesuré non classé (fans 4568, position 4, rang 191443)
- n° 7 : A1 – Caught in the Middle → A1 – Heaven By Your Side (artiste de départ, autre titre) ; écarté : niveau mesuré non classé (fans 16965, position 3, rang 325999)
- n° 8 : Mis-Teeq – Scandalous → Mis-Teeq – Dance Your Cares Away (artiste de départ, autre titre) ; écarté : introuvable chez Deezer (enregistrement studio original avec extrait, ni remix ni version refaite)
- n° 9 : Hilary Duff – Come Clean → Sugababes – Overload (découverte, artiste lié) ; écarté : niveau mesuré F (fans 603287, position 1, rang 521774)
- n° 10 : Delta Goodrem – Lost Without You → Delta Goodrem – Wings (artiste de départ, autre titre) ; écarté : niveau mesuré non classé (fans 30812, position 4, rang 454576)

<details><summary>Leurres</summary>

- pio-01 : Girls Aloud – Sexy! No No No... ; S Club – Say Goodbye ; Steps – Better Best Forgotten
- pio-02 : Geri Halliwell – Bag It Up ; B*Witched – To You I Belong ; Billie Piper – Don't Forget To Remember
- pio-03 : Jessica Simpson – When You Told Me You Loved Me ; Hanson – Love Song ; Jennifer Love Hewitt – How Do I Deal
- pio-04 : Gavin DeGraw – We Belong Together ; Tyler Hilton – You'll Ask for Me ; Vanessa Carlton – Nolita Fairytale (Main)
- pio-05 : Aly & AJ – No One ; Ronan Keating – I Love It When We Do ; Lene Marlin – Disguise
- pio-06 : Rachel Stevens – Funny How ; Samantha Mumba – Isn't It Strange ; Holly Valance – Desire
- pio-07 : 911 – Private Number ; Ashlee Simpson – Autobiography ; Jessica Mauboy – Been Waiting
- pio-08 : Shola Ama – Sym4ony ; Christina Milian – Got To Have You ; Another Level – The Rain
- pio-09 : Melanie C – Northern Star ; All Saints – Rock Steady ; Bananarama – Love, Truth & Honesty
- pio-10 : Gary Barlow – For All That You Want ; Shontelle – Battle Cry ; Daniel Powter – Song 6

</details>

<!-- /test:pop-internationale-oubliee-impossible -->

<!-- test:rap-us-underground-impossible -->
## Rap US underground (`rap-us-underground-impossible`)

level `impossible` · decade `all` (époque 1998–2020) · genre `rap`

**Écrit**, non figé.

| n° | Niveau visé | Artiste – titre | nb_fan | Position | rank | Extrait | Origine |
|---|---|---|---|---|---|---|---|
| 1 | Impossible | Aesop Rock – Mindful Solutionism | 32 375 | 6 | 207 604 | oui | artiste de départ |
| 2 | Impossible | Atmosphere – Really | 45 656 | 6 | 150 446 | oui | artiste de départ |
| 3 | Impossible | Brother Ali – Good Lord | 18 793 | 6 | 226 393 | oui | artiste de départ |
| 4 | Impossible | Sage Francis – Makeshift Patriot | 8 390 | 12 | 138 232 | oui | candidat |
| 5 | Impossible | Cannibal Ox – Raspberry Fields (explicite) | 5 116 | 6 | 118 647 | oui | artiste de départ |
| 6 | Impossible | Isaiah Rashad – Free Lunch (explicite) | 68 992 | 7 | 423 216 | oui | découverte (playlist « BACKPACK COOL RAP ») |
| 7 | Impossible | Murs – The Science (explicite) | 10 822 | 41 | 31 043 | oui | candidat |
| 8 | Impossible | Evidence – Mr. Slow Flow (explicite) | 25 340 | 51 | 18 698 | oui | candidat |
| 9 | Impossible | Masta Ace – Bklyn Masala (explicite) | 24 158 | 6 | 244 141 | oui | artiste de départ |
| 10 | Impossible | Little Brother – Whatever You Say | 10 127 | 12 | 134 593 | oui | candidat |

**Remplacements**

- n° 1 : Aesop Rock – None Shall Pass → Aesop Rock – Mindful Solutionism (artiste de départ, autre titre) ; écarté : niveau mesuré D (fans 32375, position 2, rang 351672)
- n° 2 : Atmosphere – Trying to Find a Balance → Atmosphere – Really (artiste de départ, autre titre) ; écarté : niveau mesuré non classé (fans 45656, position 4, rang 234862)
- n° 3 : Brother Ali – Forest Whitaker → Brother Ali – Good Lord (artiste de départ, autre titre) ; écarté : introuvable chez Deezer (enregistrement studio original avec extrait, ni remix ni version refaite)
- n° 5 : Cannibal Ox – Iron Galaxy → Cannibal Ox – Raspberry Fields (artiste de départ, autre titre) ; écarté : niveau mesuré D (fans 5116, position 1, rang 240131)
- n° 6 : Jedi Mind Tricks – Heavy Metal Kings → Isaiah Rashad – Free Lunch (découverte, playlist « BACKPACK COOL RAP ») ; écarté : niveau mesuré non classé (fans 103448, position 11, rang 287013)
- n° 9 : Masta Ace – Born to Roll → Masta Ace – Bklyn Masala (Featuring Leschea) (artiste de départ, autre titre) ; écarté : introuvable chez Deezer (enregistrement studio original avec extrait, ni remix ni version refaite)

<details><summary>Leurres</summary>

- rui-01 : L'Orange – O.G. Funk Rock ; Apollo Brown – H20 ; Deltron 3030 – Upgrade (A Baymar College College)
- rui-02 : PaceWon & Mr. Green – I Need Money ; Dilated Peoples – Pay Attention (Edited) ; Blackalicious – Chemical Calisthenics
- rui-03 : R.A. The Rugged Man – E.K.N.Y. (Ed Koch New York) ; Pharoahe Monch – Desire ; Hieroglyphics – At the Helm
- rui-04 : Roots Manuva – Revolution 5 ; Busdriver – Kill Your Employer (Recreational Paranoia Is the Sport of Now) ; CunninLynguists – Hourglass
- rui-05 : People Under the Stairs – Umbrellas (God Forgive Me) ; Dr. Octagon – Halfsharkalligatorhalfman ; Jaylib – Strapped
- rui-06 : Loyle Carner – Yesterday ; Key Glock – Gang Shit No Lame Shit ; Madvillain – Strange Ways
- rui-07 : DJ Kay Slay – Growing Up In These Streets ; Blueprint – Boombox ; Diamond D – Jose Feliciano
- rui-08 : Statik Selektah – 21 & Over ; Prhyme – My Calling ; Meyhem Lauren – 41mm
- rui-09 : Afu-Ra – God Of Rap ; Talib Kweli – Just Begun ; Jeru the Damaja – 99.9 Percent
- rui-10 : Slum Village – Too Much ; Elzhi – Memory Lane ; Hi-Tek – All I Need Is You

</details>

<!-- /test:rap-us-underground-impossible -->

<!-- test:rap-francais-old-school-impossible -->
## Rap français old school (`rap-francais-old-school-impossible`)

level `impossible` · decade `1990` (époque 1990–2006) · genre `rap`

**Écrit**, non figé.

| n° | Niveau visé | Artiste – titre | nb_fan | Position | rank | Extrait | Origine |
|---|---|---|---|---|---|---|---|
| 1 | Impossible | Ministère A.M.E.R. – Flirt avec le meurtre | 11 167 | 7 | 254 045 | oui | réserve (artiste) |
| 2 | Impossible | Ideal J – Orly sud in bronx (explicite) | 25 808 | 8 | 240 648 | oui | artiste de départ |
| 3 | Impossible | Secteur A – Boyblacka | 5 604 | 16 | 133 908 | oui | artiste de départ |
| 4 | Impossible | Rocca – Mash Up (explicite) | 12 855 | 7 | 265 249 | oui | artiste de départ |
| 5 | Impossible | Passi – Reviens dans ma vie | 87 022 | 7 | 493 350 | oui | réserve (artiste) |
| 6 | Impossible | K-Mel – J'écris pour ma liberté | 8 201 | 6 | 112 625 | oui | artiste de départ |
| 7 | Impossible | Les Sages Poètes De La Rue – Un homme et un micro | 41 594 | 6 | 319 870 | oui | artiste de départ |
| 8 | Impossible | Menelik – Tranquille | 21 699 | 6 | 301 232 | oui | artiste de départ |
| 9 | Impossible | X-Men – J'attaque du mic | 11 820 | 9 | 143 432 | oui | artiste de départ |
| 10 | Impossible | Busta Flex – Majeur | 41 303 | 7 | 403 063 | oui | artiste de départ |

**Remplacements**

- n° 1 : Fonky Family (artiste de départ) → Ministère A.M.E.R. – Flirt avec le meurtre (réserve (artiste)) ; écarté : artiste de départ : aucun titre en position 6 ou plus ne passe (270842 fans ; dernier refus : niveau mesuré non classé (fans 270793, position 38, rang 342504))
- n° 5 : Lunatic (artiste de départ) → Passi – Reviens dans ma vie (réserve (artiste)) ; écarté : artiste de départ : aucun titre en position 6 ou plus ne passe (174301 fans ; dernier refus : niveau mesuré non classé (fans 174295, position 17, rang 75992))

<details><summary>Leurres</summary>

- rfo-01 : ATK – J'en Place une ; Zoxea – La Ruée vers le roro ; Fabe – Détournement De Son
- rfo-02 : La Brigade – Qu'Est-Ce Tu Veux ; beat de boul – L'arnaque ; La Rumeur – Les coulisses de l'angoisse
- rfo-03 : Driver – Elle M'a Tout Volé ; Factor X – Entends mes regrets ; Lady Laistee – Faut Que J'Respire
- rfo-04 : Le 3ème Œil – Marquer l'époque ; KDD – Vie de crèv's ; Ol'Kainry – Crie mon nom
- rfo-05 : Kool Shen – On a enfoncé des portes ; Don Choa – Jusqu'au bout ; Stomy Bugsy – Mes forces décuplent quand on m'inculpe
- rfo-06 : Def Bond – Qui sait au fond ; Princess Aniès – Vis Ta Vie ; Alliance Ethnik – Star Track
- rfo-07 : Kheops – Le fainéant ; La Clinique – Tout saigne 2 ; Koma – Un parmi des millions
- rfo-08 : Saïan Supa Crew – Ils étaient une fois ; Faf Larage – La garde meurt mais ne se rend pas ; Ärsenik – Ils m'appellent
- rfo-09 : Daddy Lord C – Le sens du clan ; La Caution – Glamour sur le globe ; L'Skadrille – Frappe à ma porte
- rfo-10 : Iron Sy – Plus d'amour ; MC Jean Gab'1 – MC Jean Gabin VS Rap Français ; Sat L'Artificier – Nous contre eux II

</details>

<!-- /test:rap-francais-old-school-impossible -->

<!-- test:variete-francaise-oubliee-impossible -->
## Variété française oubliée (`variete-francaise-oubliee-impossible`)

level `impossible` · decade `1980` (époque 1980–1999) · genre `chanson`

**Écrit**, non figé.

| n° | Niveau visé | Artiste – titre | nb_fan | Position | rank | Extrait | Origine |
|---|---|---|---|---|---|---|---|
| 1 | Impossible | Corynne Charby – Elle sortait tard le soir | 6 976 | 7 | 58 010 | oui | artiste de départ |
| 2 | Impossible | Jakie Quartz – Dernière fois | 6 213 | 7 | 117 710 | oui | artiste de départ |
| 3 | Impossible | Phil Barney – Le souvenir de toi | 7 394 | 7 | 271 629 | oui | artiste de départ |
| 4 | Impossible | Elli & Jacno – On dit des choses | 3 849 | 6 | 196 266 | oui | artiste de départ |
| 5 | Impossible | Kent – Ni plus ni moins | 3 560 | 10 | 119 838 | oui | artiste de départ |
| 6 | Impossible | Gold – Diamant dort | 83 738 | 6 | 374 161 | oui | artiste de départ |
| 7 | Impossible | Cookie Dingler – Sexy rock | 12 081 | 6 | 148 363 | oui | artiste de départ |
| 8 | Impossible | Léopold Nord & Vous – Les Hippopotamtam | 1 243 | 7 | 38 194 | oui | réserve (artiste) |
| 9 | Impossible | Lio – Saisons | 1 650 | 7 | 21 412 | oui | artiste de départ |
| 10 | Impossible | Les Forbans – Lève Ton Ful De Là | 11 900 | 7 | 263 587 | oui | réserve (artiste) |

**Remplacements**

- n° 8 : Peter & Sloane (artiste de départ) → Léopold Nord & Vous – Les Hippopotamtam (réserve (artiste)) ; écarté : artiste de départ : aucun titre en position 6 ou plus ne passe (15886 fans ; dernier refus : aucun titre)
- n° 10 : Jeanne Mas (artiste de départ) → Les Forbans – Lève Ton Ful De Là (réserve (artiste)) ; écarté : artiste de départ : aucun titre en position 6 ou plus ne passe (101912 fans ; dernier refus : niveau mesuré non classé (fans 101900, position 24, rang 196845))

<details><summary>Leurres</summary>

- vfo-01 : Marie Myriam – Qu'est-ce que t'as qui va pas ? ; Gérard Blanc – Des chemins différents ; Philippe Lafontaine – Machine à larmes
- vfo-02 : Rose Laurens – Danse moi ; Début de soirée – Début de soir'rock ; Annabelle Mouloudji – B'B' d'amour
- vfo-03 : Elsa Lunghini – Rien que pour ça ; Herbert Léonard – Je serais fou de l'oublier ; Francis Lalanne – Pleure un bon coup ma p'tite Véro
- vfo-04 : Isabelle Adjani – Ok pour plus jamais ; Valerie Lemercier – Le cheval en savon ; Octobre – Élégante solution
- vfo-05 : Clarika – Beau comme garçon ; Jil Caplan – La lumière du vide ; David Koven – Doux type, tout sweet
- vfo-06 : François Feldman – C'Est Toi Qui M'As Fait ; Images – L'enfant des rizières ; Jean-Luc Lahaye – Décibelle
- vfo-07 : Valérie Lagrange – Le Jeu ; Catherine Lara – Les genoux écorchés ; Enzo Enzo – Rêves de compagnie
- vfo-08 : Muriel Dacq – Jamais toujours ; Thierry Pastor – C'est un mystère ; Partenaire Particulier – L Amour A Trois
- vfo-09 : Dennis' Twist – Ce jour-là ; Gérard Delahaye – Pour toi je ferais n'importe quoi ; Elegance – Amour chagrin
- vfo-10 : Annie Cordy – Maman, ma plus jolie chanson ; Liane Foly – Les yeux doux ; Dick Rivers – Ainsi soit-elle

</details>

<!-- /test:variete-francaise-oubliee-impossible -->

<!-- test:electro-pointue-impossible -->
## Électro pointue (`electro-pointue-impossible`)

level `impossible` · decade `all` · genre `electro`

**Écrit**, non figé.

| n° | Niveau visé | Artiste – titre | nb_fan | Position | rank | Extrait | Origine |
|---|---|---|---|---|---|---|---|
| 1 | Impossible | Autechre – Bike | 34 317 | 6 | 255 191 | oui | gardé |
| 2 | Impossible | Squarepusher – Do You Know Squarepusher | 36 556 | 6 | 233 527 | oui | gardé |
| 3 | Impossible | Plastikman – Krakpot | 23 477 | 8 | 175 839 | oui | gardé |
| 4 | Impossible | Jeff Mills – Alarms | 74 132 | 13 | 174 257 | oui | réserve (artiste) |
| 5 | Impossible | Carl Craig – Sandstorms | 36 592 | 6 | 181 957 | oui | gardé |
| 6 | Impossible | Model 500 – Huesca | 2 049 | 7 | 17 949 | oui | gardé |
| 7 | Impossible | Aril Brikha – Ex Machina | 3 869 | 6 | 93 777 | oui | gardé |
| 8 | Impossible | Andy Stott – Never the right time | 8 812 | 12 | 177 441 | oui | réserve (artiste) |
| 9 | Impossible | Surgeon – Triple Threat | 6 929 | 6 | 92 609 | oui | gardé |
| 10 | Impossible | Rival Consoles – Unfolding | 13 126 | 7 | 257 685 | oui | gardé |

**Remplacements**

- n° 4 : i4 – Jeff Mills → Jeff Mills – Alarms (réserve (artiste)) ; écarté : retiré à la relecture (hors thème)
- n° 8 : Mirror signal – Andy Stott → Andy Stott – Never the right time (réserve (artiste)) ; écarté : retiré à la relecture (hors thème)

<details><summary>Leurres</summary>

- epi-01 : Burial – Raver ; Plaid – Ladyburst ; LFO – Shut Down
- epi-02 : Floating Points – King Bromeliad ; Venetian Snares – Hajnal2 ; Skee Mask – Backcountry
- epi-03 : Ellen Allien – Turbo Dreams ; Marcel Dettmann – Dawning Revisited ; DJ Hell – Suicide Commando
- epi-04 : Ricardo Villalobos – Suesse Cheques ; Underground Resistance – I Am Ur ; Kenny Larkin – Azimuth
- epi-05 : Superpitcher – White Lightning ; John Tejada – Farther And Fainter ; Nathan Fake – Grandfathered
- epi-06 : Blake Baxter – Minimal Freak ; Paperclip People – My Neighborhood ; Maurizio – Mø5b
- epi-07 : Swayzak – Skin Diving ; Roman Flügel – Wood & Neon ; Octo Octa – Spin Girl, Let’s Activate!
- epi-08 : The Field – The Deal ; Caterina barbieri – The Landscape Listens ; Seefeel – Everydays
- epi-09 : F.U.S.E. – Slac ; Robert Hood – Untitled 4 ; Juan Atkins – Electric Dub
- epi-10 : Kiasmos – Swayed ; Gidge – New Light ; Weval – Movement

</details>

<!-- /test:electro-pointue-impossible -->

<!-- test:annees-80-oubliees-impossible -->
## Années 80 oubliées (`annees-80-oubliees-impossible`)

level `impossible` · decade `1980` · genre `pop`

**Écrit**, non figé.

| n° | Niveau visé | Artiste – titre | nb_fan | Position | rank | Extrait | Origine |
|---|---|---|---|---|---|---|---|
| 1 | Impossible | Johnny Hates Jazz – Different Seasons | 10 665 | 6 | 158 987 | oui | réserve (artiste) |
| 2 | Impossible | Thompson Twins – The Gap | 22 998 | 6 | 181 826 | oui | artiste de départ |
| 3 | Impossible | Howard Jones – Life In One Day | 18 285 | 8 | 184 592 | oui | artiste de départ |
| 4 | Impossible | Heaven 17 – Sign O’ The Times | 11 055 | 6 | 130 656 | oui | artiste de départ |
| 5 | Impossible | Visage – Mind Of A Toy | 32 918 | 8 | 179 722 | oui | artiste de départ |
| 6 | Impossible | Re-Flex – What You Deserve | 674 | 7 | 88 376 | oui | artiste de départ |
| 7 | Impossible | Classix Nouveaux – Robots Dance | 1 336 | 9 | 31 720 | oui | artiste de départ |
| 8 | Impossible | Naked Eyes – (What) In the Name of Love | 4 077 | 6 | 131 516 | oui | artiste de départ |
| 9 | Impossible | The Fixx – Deeper And Deeper | 5 584 | 7 | 132 291 | oui | artiste de départ |
| 10 | Impossible | China Crisis – Arizona Sky | 6 835 | 7 | 228 561 | oui | artiste de départ |

**Remplacements**

- n° 1 : Nik Kershaw (artiste de départ) → Johnny Hates Jazz – Different Seasons (2008 Digital Remaster) (réserve (artiste)) ; écarté : artiste de départ : aucun titre en position 6 ou plus ne passe (21340 fans ; dernier refus : artiste déjà bonne réponse d’un autre blind test (règle du build))

<details><summary>Leurres</summary>

- a80o-01 : Nik Kershaw – Gone To Pieces ; ABC – Theme From "Mantrap" ; Alison Moyet – Ordinary Girl
- a80o-02 : Ultravox – Mr. X ; Midge Ure – No Regrets ; Wang Chung – Hypnotize Me
- a80o-03 : Bananarama – Cheers Then ; A Flock of Seagulls – Nightmares ; Concrete Blonde – God Is A Bullet
- a80o-04 : The Lotus Eaters – You Don't Need Someone New ; Thomas Dolby – Dissidents ; Blancmange – That's Love, That It Is
- a80o-05 : Japan – I Second That Emotion ; Dead or Alive – Far Too Hard ; The Style Council – Headstart For Happiness
- a80o-06 : Toto Coelo – I Eat Cannibals, Pt. 2 ; Kajagoogoo – On a Plane ; Men Without Hats – Antarctica
- a80o-07 : Berlin – A Matter Of Time ; Real Life – Broken Again ; Del Amitri – Heard Through the Wall
- a80o-08 : The Motels – Counting ; 'Til Tuesday – Love In A Vacuum ; Missing Persons – Windows
- a80o-09 : Big Country – Where The Rose Is Sown ; Galaxie 500 – Leave the Planet ; Hüsker Dü – Sunshine Superman
- a80o-10 : Aztec Camera – How Men Are ; New Musik – Areas ; Scritti Politti – The "Sweetest Girl"

</details>

<!-- /test:annees-80-oubliees-impossible -->

<!-- test:nouvelle-scene-francaise-impossible -->
## Nouvelle scène française (`nouvelle-scene-francaise-impossible`)

level `impossible` · decade `all` (époque 2012–2026) · genre `chanson`

**Écrit**, non figé.

| n° | Niveau visé | Artiste – titre | nb_fan | Position | rank | Extrait | Origine |
|---|---|---|---|---|---|---|---|
| 1 | Impossible | Grand Blanc – Samedi la nuit | 15 821 | 7 | 250 403 | oui | artiste de départ |
| 2 | Impossible | Terrenoire – alma | 26 907 | 6 | 481 745 | oui | artiste de départ |
| 3 | Impossible | Voyou – Yemaya | 37 892 | 7 | 473 287 | oui | artiste de départ |
| 4 | Impossible | Kids Return – I Will Wait For You | 5 667 | 6 | 354 205 | oui | artiste de départ |
| 5 | Impossible | Mansfield.TYA – Ni morte ni connue | 41 450 | 6 | 436 276 | oui | artiste de départ |
| 6 | Impossible | Jeanne Added – Be Sensational | 80 668 | 6 | 461 737 | oui | réserve (artiste) |
| 7 | Impossible | Last Train – How Does It Feel ? | 40 170 | 7 | 472 065 | oui | artiste de départ |
| 8 | Impossible | La Maison Tellier – Là où je vis | 30 252 | 7 | 462 487 | oui | artiste de départ |
| 9 | Impossible | Sages comme des sauvages – Garçon | 13 098 | 7 | 357 887 | oui | artiste de départ |
| 10 | Impossible | Hervé – Addenda | 40 676 | 7 | 411 060 | oui | artiste de départ |

**Remplacements**

- n° 6 : Bagarre (artiste de départ) → Jeanne Added – Be Sensational (réserve (artiste)) ; écarté : artiste de départ : aucun titre en position 6 ou plus ne passe (27204 fans ; dernier refus : artiste exclu de ce test)

<details><summary>Leurres</summary>

- nsf-01 : Lescop – Dérangé ; Juniore – Bowling de Diano Marina ; Leonie Pernet – Les rênes
- nsf-02 : Tim Dup – Le visage de la nuit ; Emma Peters – C'est bon ; Coline Rio – On m'a dit
- nsf-03 : Flavien Berger – Les contremplations ; Clio – Plein les doigts ; Malik Djoudi – Tempérament
- nsf-04 : Pi Ja Ma – Imbécile ; Frànçois & The Atlas Mountains – Réveil inconnu ; Flora Fishbach – Mon copain
- nsf-05 : Sexy sushi – La Politesse ; Laura Cahen – La fièvre noire ; Jacques – Avec les mots
- nsf-06 : Dominique A – Éléor ; chien noir – Si c'est un feu ; Marie-Flore – M'en veux pas
- nsf-07 : Pierre Lapointe – L'origine du mal ; Miossec – On vient à peine de commencer ; Florent Marchet – Un jour l'occident
- nsf-08 : Alexis HK – Le dernier présent ; Emily Loizeau – Celle qui vit vers le sud ; Cyril Mokaiesh – On a besoin d'amour
- nsf-09 : Bonbon Vodou – De colère ; Matéo Langlois – La ville ; Lo'jo – La Kolèr
- nsf-10 : Foé – Bouquet de pleurs ; LE NOISEUR – 27 au Paradis ; Thibaut – Manqué

</details>

<!-- /test:nouvelle-scene-francaise-impossible -->
