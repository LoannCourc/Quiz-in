# Blind tests : lot 3

Mesures Deezer : fans de l'artiste (`nb_fan`), position du morceau chez l'artiste (la meilleure entre le top Deezer et le classement par rang), rang de la piste (`rank`). Seuils : `scripts/blind-tests/thresholds.json` (calibrés au lot 1, plafond de 100 000 fans en Impossible).

<!-- synthese -->
## Synthèse (2 novembre 2026)

**15 tests écrits** (lot `BT-10`, `addedAt` 2026-11-02), tous « Tous niveaux » (2 F, 3 M, 3 D, 2 I). Pour chacun : `npm run music:verify` 10/10, `npm run music:decoys` sans manque, `npm run build` réussi. **Non figés.** « Classique et opéra » (test 35) **retiré du lot** le 2 novembre 2026 (option b : la méthode ne s'applique pas, Deezer range les enregistrements sous le nom des interprètes), **remplacé par « Rock français : tous niveaux »** (`rock-francais-mixte`, voir plus bas).

Règles propres au lot, contrôlées sur le contenu final :
- aucune bonne réponse n'est un titre déjà utilisé dans un autre test (bonne réponse ou leurre) : 0 cas ;
- aucun leurre ne reprend un leurre d'un test figé : 0 cas.

| Test | Genre du contenu | Remplacements | Remarques |
|---|---|---|---|
| Le grand mélange | `pop` | 5 | « Tainted Love », « Forever Young », « Come On Eileen » mesurés « Facile » |
| Rock : tous niveaux | `rock` | 6 | « Stairway to Heaven » déjà leurre (années 70) |
| Rap US : tous niveaux | `rap` | 4 | époque 1985-2015 |
| RnB et soul : tous niveaux | `pop` | 3 | genre Deezer R&B, soul ou funk exigé |
| Électro et French touch : tous niveaux | `electro` | 5 | « Lady », « Music Sounds Better With You » mesurés « Facile » |
| Variété française : tous niveaux | `chanson` | 9 | époque 1970-2026, `decade` `all` |
| Années 70 : tous niveaux | `pop` | 3 | |
| Années 2020 : tous niveaux | `pop` | 5 | 3 candidats aux paroles explicites |
| Films et séries : tous niveaux | `pop` | 0 (4 écarts à la demande) | test à thème, 6 exceptions de niveau |
| Disney : tous niveaux | `pop` | 0 (6 écarts à la demande) | test à thème, 7 exceptions de niveau |
| Latino et reggaeton : tous niveaux | `pop` | 8 | genre Deezer latino exigé |
| Reggae et ska : tous niveaux | `pop` | 6 | genre Deezer reggae, ska ou dancehall exigé |
| Metal et hard rock : tous niveaux | `rock` | 7 | « Enter Sandman » déjà leurre (années 90) |
| Jazz et swing : tous niveaux | `pop` | 6 | « What a Wonderful World » déjà bonne réponse (années 60) |
| Rock français : tous niveaux | `rock` | 0 (artistes de départ) | leurres « Moyen » élargis, voir plus bas |

Genres : aucun genre ajouté (décision du lot 2). RnB, latino, reggae, jazz, années 70 et 2020, films et Disney sont rangés en `pop`, le metal en `rock`, la variété en `chanson`. Le genre Deezer exigé des remplaçants et des leurres (`deezerGenre`) n'est utilisé que par le générateur.

### Tests à thème : exceptions de niveau (limitées à ces deux tests)

Méthode du lot 2 : titres du catalogue acceptés quel que soit leur niveau mesuré, pourvu qu'ils aient un extrait ; leurres choisis à la main dans le thème (`decoyList` de `scripts/blind-tests/catalogueLot3.mjs`), sans condition de niveau, chacun vérifié chez Deezer ; le film ou la série est accepté en réponse libre.

**Films et séries**

| n° | Niveau visé | Titre | Niveau mesuré |
|---|---|---|---|
| 2 | Facile | The Good, The Bad And The Ugly – Ennio Morricone | Moyen |
| 3 | Moyen | Light of the Seven – Ramin Djawadi | Facile |
| 5 | Moyen | This is Halloween – Danny Elfman | Facile |
| 6 | Difficile | Chariots of Fire – Vangelis | non classé |
| 9 | Impossible | Dare – Stan Bush | non classé |
| 10 | Impossible | Crockett's Theme – Jan Hammer | Difficile |

Écarts à la demande (titres déjà utilisés dans un autre test) : « Time » → « Cornfield Chase » (Hans Zimmer, Interstellar) ; « Concerning Hobbits » → « Light of the Seven » (Game of Thrones) ; « Axel F » → « The Heat Is On » (Le Flic de Beverly Hills) ; « Take My Breath Away » → « Never Ending Story » (Limahl, L'Histoire sans fin), après « Danger Zone », lui-même devenu leurre de « Le grand mélange ».

**Disney**

| n° | Niveau visé | Titre | Niveau mesuré |
|---|---|---|---|
| 1 | Facile | Je voudrais déjà être roi – Dimitri Rougeul (Le Roi Lion) | Difficile |
| 2 | Facile | Je veux y croire – Maéva Méline (Raiponce) | Difficile |
| 3 | Moyen | Pour les hommes – Anthony Kavanagh (Vaiana) | Facile |
| 4 | Moyen | Je suis ton meilleur ami – Richard Darbois (Aladdin) | Difficile |
| 5 | Moyen | Être un homme comme vous – Jean Stout (Le Livre de la jungle) | Difficile |
| 9 | Impossible | Jungle Jazz – Phil Collins (Tarzan) | Moyen |
| 10 | Impossible | Á Upendi – Marcel Boungou (Le Roi Lion 2) | Difficile |

Écarts à la demande : versions françaises d'origine de « Voilà » (« Pour les hommes »), « Ami comme moi » (« Je suis ton meilleur ami ») et « I Wan'na Be Like You » (« Être un homme comme vous ») ; « L'histoire de la vie », « Dans un autre monde », « Comme un homme » (Mulan), « Rien qu'un jour » (Le Bossu de Notre-Dame) et « Le monde qui est le mien » (Hercule) déjà utilisés dans un autre test → « Je voudrais déjà être roi », « Je veux y croire », « Une belle fille à aimer » (Mulan), « Les Cloches de Notre-Dame », « Jamais je n'avouerai » (Hercule) ; « Not in Nottingham » (Robin des Bois) absent en français chez Deezer et « Il vit en toi » (Le Roi Lion 2) introuvable → « Á Upendi ». « Jungle Jazz » (Phil Collins) vient de l'album « Tarzan Original Soundtrack » : langue de l'extrait à vérifier à l'écoute.

### Rock français : tous niveaux (remplace « Classique et opéra »)

Artistes de départ de ta demande, titre choisi chez chacun dans la zone de son niveau (Facile : top 5 ; Moyen et Impossible : position 6 ou plus ; Difficile : titre 1 ou 2), mesuré au niveau visé ; aucune réserve utilisée, aucun artiste remplacé.

| n° | Niveau | Bonne réponse | Fans | Position |
|---|---|---|---|---|
| 1 | Facile | New York avec toi – Téléphone | 780 279 | 2 |
| 2 | Facile | L'homme pressé – Noir Désir | 1 052 339 | 2 |
| 3 | Moyen | Ma petite entreprise – Alain Bashung | 444 988 | 6 |
| 4 | Moyen | Amours – Louise Attaque | 983 421 | 6 |
| 5 | Moyen | Soledad – Mano Negra | 572 208 | 6 |
| 6 | Difficile | Rimini – Les Wampas | 92 953 | 2 |
| 7 | Difficile | Song For Jedi – Dionysos | 130 923 | 1 |
| 8 | Difficile | L'enfer des dieux – Mass Hysteria | 93 443 | 1 |
| 9 | Impossible | Houlala ! – Ludwig Von 88 | 50 847 | 6 |
| 10 | Impossible | Le Rap Des Garçons Bouchers – Les Garçons Bouchers | 25 264 | 6 |

Le choix automatique saute les titres déjà utilisés dans un autre test (bonne réponse ou leurre) : contrôle final, 0 bonne réponse déjà utilisée, 0 leurre de test figé. Indochine, Les Thugs, Sheriff et Pigalle restent en réserve (Les Sheriff et Pigalle apparaissent en leurres).

**Écarts, propres à ce test :**
- Leurres des 3 questions « Moyen » : « Facile » ou « Difficile » acceptés (`decoyLevels`). Les titres « Moyen » de rock français sont presque tous ceux des groupes déjà bonnes réponses (Noir Désir, Téléphone, Mano Negra, Bashung : un artiste par test), les autres sont de la variété.
- Genre Deezer : « Chanson française » accepté (Deezer range Matmatah et Kyo en « Chanson française », Trust en « Pop », Indochine en « Disco ») ; les artistes de variété passés par ce biais sont exclus (Cabrel, Voulzy, Goldman, Tryo, Julien Doré…).
- Écart d'époque toléré de 25 ans (rock français de 1978 à 2010) ; titres des artistes de départ ajoutés au réservoir (`seedTracks`).
- Corrections d'outils : « (en concert) » refusé comme version live (« Les yeux de ma mère » d'Arno) ; « putain », « chier », « cons » ajoutés au filtre des titres grossiers ; `music:verify` ne prend plus « Club » seul pour une version club (« 666.667 Club », album studio de Noir Désir).

### Retouches en patch du 2 novembre 2026 (`generate.mjs --patch --replace-listed`)

Seule la bonne réponse visée a changé, avec ses trois leurres (choisis de nouveau) ; les neuf autres questions de chaque test sont identiques (vérifié par comparaison des fichiers). Remplaçants pris dans des réserves du thème, mesurés au niveau visé.

| Test | Question | Niveau | Retiré (hors thème) | Remplacé par | Mesure |
|---|---|---|---|---|---|
| Électro et French touch | eft-02 | Facile | Soon – Mosimann | Sunset Lover – Petit Biscuit | Facile |
| Latino et reggaeton | lat-02 | Facile | El Merengue – Marshmello | El Perdón – Nicky Jam | Facile |
| Metal et hard rock | mhr-07 | Difficile | End of You – Poppy | Princess of the Night – Saxon | Difficile |

Réserves écartées avant ces choix : « Digital Love » et « Chantaje » (mesurés « Moyen »), « Nightcall », « Échame la Culpa », « I Wanna Be Somebody » (déjà bonnes réponses), « Instant Crush » et « Balls to the Wall » (artiste déjà dans le test), « Tusa » (explicite), « Rock the Night » et « Kickstart My Heart » (mesurés « Facile »). « Grey Hun » (The HU) et « Four to the Floor » (Starsailor) gardés à ta demande.

### Retouches en patch du 2 novembre 2026 (2)

Seule la question visée a changé dans chaque test (comparaison des fichiers avant/après).

| Test | Question | Niveau | Retiré | Remplacé par | Mesure | Raison |
|---|---|---|---|---|---|---|
| Rap US | rum-09 | Impossible | Play That Funky Music – Vanilla Ice | Warm It Up, Kane – Big Daddy Kane | 45 179 fans, position 6 | reprise de Wild Cherry (bonne réponse des années 70) |
| Latino | lat-06 | Difficile | Papi Chulo – Lorna (profil à 108 fans, single de 2016, ISRC d'auto-distribution) | Papi Chulo... Te Traigo El Mmmm – Lorna (single original, profil à 10 246 fans) | position 1, rang 667 530 | mauvais profil, autre enregistrement |
| Années 2020 | a20m-08 | Difficile | Material Lover – Sienna Spiro | Breaking Me – Topic | 155 140 fans, position 2 | position 7 : « Difficile » seulement par le rang |

- « Yo Voy A Legar » (DJ Nelson, lat-10) : la faute est dans le titre Deezer de la piste retenue. L'édition titrée « Yo Voy a Llegar » existe, mais c'est le 5e titre de DJ Nelson (pas « Impossible ») ; le build exige que le titre affiché soit celui de Deezer une fois normalisé, « Legar » reste donc affiché. « Yo Voy A Llegar » est accepté en réponse libre (`titleAliases`) ; la question n'a pas changé autrement.
- Remplaçants écartés en route : « Put Your Records On » (Ritt Momney, reprise de Corinne Bailey Rae) ; leurres « Seven Nation Army » (Gaullin) et « Lovefool » (Twocolors), reprises. « Surrender » (Gaullin), leurre de a20m-08 : à confirmer à l'écoute.
- Contrôles ajoutés : le générateur refuse une bonne réponse dont le titre (sans précisions entre parenthèses) est déjà bonne réponse d'un autre test, quel que soit l'artiste ; le build l'avertit (sans bloquer : trois cas sont deux chansons différentes, « Suavemente », « Saturday Night », « Satisfaction »). Option `strictHard` (Difficile = titre 1 ou 2 de l'artiste). « (Radio Version) » reconnu comme même enregistrement ; « Mashup » refusé ; « (con …) » retiré des titres affichés.

### À relire en priorité

« Material Lover – Sienna Spiro » (2020, Difficile), trouvé automatiquement. « Jungle Jazz » (Disney) : langue de l'extrait à vérifier à l'écoute.

### Corrections des outils (aucun effet sur les tests figés, jamais régénérés)

- Une même œuvre sous deux noms d'artiste n'est plus acceptée deux fois comme bonne réponse (« Take Five » de The Dave Brubeck Quartet et de Dave Brubeck) ; « and » et « & » comparés à l'identique dans les noms (« Benny Goodman and His Orchestra » = « … & His Orchestra »).
- Filtre des titres grossiers élargi (« I Smell Pussy », « Superhoes », « Me So Horny » étaient passés) ; mentions « (Dirty) » et « (1999 Digital Remaster) » reconnues.
- Exclusions par test : artistes français ou allemands dans les questions en anglais, reprises (Pat Benesta, Till Lindemann en espagnol), version dub (Jack Johnson), titres seulement explicites ou introuvables par `music:decoys`.

<!-- test:le-grand-melange -->
## Le grand mélange (`le-grand-melange`)

level `mixed` · decade `all` · genre `pop`

**Écrit**, non figé.

| n° | Niveau visé | Artiste – titre | nb_fan | Position | rank | Extrait | Origine |
|---|---|---|---|---|---|---|---|
| 1 | Facile | Michael Jackson – Thriller | 13 238 945 | 1 | 975 901 | oui | candidat |
| 2 | Facile | Adele – Someone Like You | 15 509 911 | 4 | 924 311 | oui | candidat |
| 3 | Moyen | Elton John – Tiny Dancer | 3 017 981 | 6 | 778 361 | oui | réserve |
| 4 | Moyen | David Bowie – Ashes to Ashes | 2 475 935 | 10 | 716 647 | oui | candidat |
| 5 | Moyen | Stevie Wonder – Sir Duke | 2 457 324 | 8 | 728 276 | oui | candidat |
| 6 | Difficile | Nik Kershaw – Wouldn’t It Be Good | 21 332 | 1 | 679 977 | oui | réserve |
| 7 | Difficile | Kim Wilde – Kids in America | 170 607 | 2 | 754 969 | oui | réserve |
| 8 | Difficile | Huey Lewis & The News – The Power Of Love | 7 664 | 1 | 799 076 | oui | découverte (playlist « 80s Party Hits ») |
| 9 | Impossible | Eddie Cochran – Milk Cow Blues | 45 092 | 16 | 146 242 | oui | découverte (playlist « greatest hits of all time ») |
| 10 | Impossible | The Korgis – If I Had You | 6 364 | 6 | 210 507 | oui | candidat |

**Remplacements**

- n° 3 : Amy Winehouse – You Know I'm No Good → Elton John – Tiny Dancer (réserve) ; écarté : niveau mesuré F (fans 3882145, position 2, rang 898647)
- n° 6 : Soft Cell – Tainted Love → Nik Kershaw – Wouldn't It Be Good (réserve) ; écarté : niveau mesuré F (fans 364471, position 1, rang 897920)
- n° 7 : Alphaville – Forever Young → Kim Wilde – Kids In America (réserve) ; écarté : niveau mesuré F (fans 315271, position 1, rang 960598)
- n° 8 : Dexys Midnight Runners – Come On Eileen → Huey Lewis & The News – The Power Of Love (découverte, playlist « 80s Party Hits ») ; écarté : niveau mesuré F (fans 22406, position 1, rang 825415)
- n° 9 : Nena – Nur geträumt → Eddie Cochran – Milk Cow Blues (découverte, playlist « greatest hits of all time ») ; écarté : niveau mesuré D (fans 124776, position 2, rang 574018)

**Titres écartés (réserves)**

- Prince – When Doves Cry : niveau mesuré F (fans 1375707, position 4, rang 753625)
- Cutting Crew – (I Just) Died in Your Arms : niveau mesuré F (fans 28160, position 1, rang 861935)

<details><summary>Leurres</summary>

- gm-01 : Jackson 5 – I Want You Back ; Earth, Wind & Fire – Boogie Wonderland ; Whitney Houston – I Wanna Dance with Somebody (Who Loves Me)
- gm-02 : Ed Sheeran – Azizam ; Birdy – People Help the People ; Sia – Unstoppable
- gm-03 : Fleetwood Mac – Silver Springs ; Queen – I Want To Break Free ; Bruce Springsteen – Glory Days
- gm-04 : The Rolling Stones – Who You Callin' Crazy ; The Police – Don't Stand So Close To Me ; Blondie – Spectral Eyes
- gm-05 : Marvin Gaye – Got To Give It Up (Pt. 1) ; James Brown – (Call Me) Super Bad ; Diana Ross – You Are Everything
- gm-06 : Ultravox – Dancing with Tears in My Eyes ; Bananarama – Venus ; ABC – The Look Of Love, Pt.1
- gm-07 : Cock Robin – When Your Heart Is Weak ; Frankie Goes to Hollywood – Relax ; Al Corley – Square Rooms
- gm-08 : Kenny Loggins – Danger Zone ; Don Henley – The Boys Of Summer ; Daryl Hall & John Oates – I Can't Go for That (No Can Do)
- gm-09 : Elvis Costello & The Attractions – Lip Service ; The Christians – Greenbank Drive ; Japan – Alien
- gm-10 : Gilbert O'Sullivan – Our Own Baby ; Eric Carmen – Love Is All That Matters ; Boy George – Love Hurts

</details>

<!-- /test:le-grand-melange -->

<!-- test:rock-mixte -->
## Rock : tous niveaux (`rock-mixte`)

level `mixed` · decade `all` · genre `rock`

**Écrit**, non figé.

| n° | Niveau visé | Artiste – titre | nb_fan | Position | rank | Extrait | Origine |
|---|---|---|---|---|---|---|---|
| 1 | Facile | AC/DC – Back In Black | 9 964 433 | 2 | 966 294 | oui | candidat |
| 2 | Facile | Starsailor – Four to the Floor | 33 999 | 1 | 987 179 | oui | découverte (playlist « 2000s Rock ») |
| 3 | Moyen | Queen – Tie Your Mother Down | 12 852 230 | 43 | 447 294 | oui | réserve |
| 4 | Moyen | Foo Fighters – Monkey Wrench | 4 600 120 | 12 | 591 415 | oui | candidat |
| 5 | Moyen | Aerosmith – Dude (Looks Like a Lady) | 5 344 699 | 7 | 646 001 | oui | candidat |
| 6 | Difficile | Boston – More Than a Feeling | 234 251 | 1 | 709 459 | oui | réserve |
| 7 | Difficile | Thin Lizzy – The Boys Are Back in Town | 165 902 | 1 | 704 042 | oui | réserve |
| 8 | Difficile | Free – All Right Now | 51 825 | 1 | 704 963 | oui | candidat |
| 9 | Impossible | CAN – Spoon | 32 009 | 6 | 305 516 | oui | découverte (playlist « 70s Alternative ») |
| 10 | Impossible | Styx – Miss America | 92 205 | 13 | 301 840 | oui | découverte (playlist « Classic Rock Deep Cuts ») |

**Remplacements**

- n° 2 : Led Zeppelin – Stairway to Heaven → Starsailor – Four to the Floor (découverte, playlist « 2000s Rock ») ; écarté : morceau déjà leurre d’un test existant
- n° 3 : Deep Purple – Highway Star → Queen – Tie Your Mother Down (réserve) ; écarté : niveau mesuré F (fans 2023741, position 3, rang 736151)
- n° 6 : Kansas – Carry on Wayward Son → Boston – More Than a Feeling (réserve) ; écarté : niveau mesuré F (fans 377580, position 2, rang 761688)
- n° 7 : Steppenwolf – Born To Be Wild → Thin Lizzy – The Boys Are Back In Town (réserve) ; écarté : niveau mesuré F (fans 245773, position 1, rang 844758)
- n° 9 : Cheap Trick – Surrender → CAN – Spoon (découverte, playlist « 70s Alternative ») ; écarté : niveau mesuré D (fans 66459, position 2, rang 574638)
- n° 10 : Blue Öyster Cult – Burnin' for You → Styx – Miss America (découverte, playlist « Classic Rock Deep Cuts ») ; écarté : niveau mesuré non classé (fans 143921, position 4, rang 536110)

**Titres écartés (réserves)**

- Queen – Another One Bites the Dust : morceau déjà bonne réponse d’un autre test
- The Rolling Stones – Paint It, Black : morceau déjà bonne réponse d’un autre test
- Bachman-Turner Overdrive – Takin’ Care of Business : niveau mesuré D (fans 23029, position 2, rang 485980)

<details><summary>Leurres</summary>

- rkm-01 : Scorpions – Still Loving You ; Guns N' Roses – Don't Cry ; Lynyrd Skynyrd – Free Bird
- rkm-02 : Stereophonics – Have A Nice Day ; Nirvana – Come As You Are ; System of a Down – Lonely Day
- rkm-03 : Deep Purple – Knocking At Your Back Door ; Pink Floyd – Set the Controls for the Heart of the Sun ; The Who – In A Hand Or A Face
- rkm-04 : The Smashing Pumpkins – Cherub Rock ; Pearl Jam – Better Man ; Red Hot Chili Peppers – The Adventures Of Rain Dance Maggie
- rkm-05 : Bon Jovi – Never Say Goodbye ; Led Zeppelin – The Ocean ; Van Halen – Why Can't This Be Love
- rkm-06 : Asia – Heat Of The Moment ; Foreigner – Urgent ; Uriah Heep – Lady in Black
- rkm-07 : Status Quo – Whatever You Want ; Rainbow – Since You Been Gone ; Jethro Tull – Aqualung
- rkm-08 : James Gang – Funk #49 ; Ten Years After – I'd love to change the world ; Humble Pie – 30 Days In The Hole
- rkm-09 : The Guess Who – Undun ; UFO – Love to Love ; Ted Nugent – Stormtroopin'
- rkm-10 : Eddie Money – I Wanna Go Back ; Cheap Trick – Taxman, Mr. Thief ; Grand Funk Railroad – I'm Your Captain/Closer To Home

</details>

<!-- /test:rock-mixte -->

<!-- test:rap-us-mixte -->
## Rap US : tous niveaux (`rap-us-mixte`)

level `mixed` · decade `all` (époque 1985–2015) · genre `rap`

**Écrit**, non figé.

| n° | Niveau visé | Artiste – titre | nb_fan | Position | rank | Extrait | Origine |
|---|---|---|---|---|---|---|---|
| 1 | Facile | Snoop Dogg – Young, Wild & Free (explicite) | 7 989 143 | 2 | 840 193 | oui | gardé |
| 2 | Facile | 2Pac – Changes (explicite) | 4 142 903 | 2 | 845 298 | oui | gardé |
| 3 | Moyen | JAY-Z – Dirt Off Your Shoulder (explicite) | 3 581 264 | 12 | 616 246 | oui | gardé |
| 4 | Moyen | Eminem – Sing for the Moment (explicite) | 19 163 517 | 12 | 838 913 | oui | gardé |
| 5 | Moyen | Ludacris – Stand Up (explicite) | 2 212 356 | 6 | 509 280 | oui | gardé |
| 6 | Difficile | House Of Pain – Jump Around | 161 316 | 1 | 784 922 | oui | gardé |
| 7 | Difficile | Kris Kross – Jump | 16 711 | 1 | 651 222 | oui | gardé |
| 8 | Difficile | Sir Mix-A-Lot – Baby Got Back | 23 300 | 1 | 565 415 | oui | gardé |
| 9 | Impossible | Big Daddy Kane – Warm It Up, Kane | 45 179 | 6 | 292 527 | oui | découverte (artiste lié) |
| 10 | Impossible | Jurassic 5 – Quality Control | 62 691 | 6 | 383 884 | oui | gardé |

**Remplacements**

- n° 9 : Play That Funky Music – Vanilla Ice → Big Daddy Kane – Warm It Up, Kane (découverte, artiste lié) ; écarté : retiré à la relecture (hors thème)

<details><summary>Leurres</summary>

- rum-01 : 50 Cent – Ayo Technology ; The Notorious B.I.G. – Hypnotize ; Dr. Dre – What's The Difference
- rum-02 : The Game – How We Do ; Ice Cube – You Know How We Do It ; Nas – If I Ruled the World (Imagine That)
- rum-03 : Kanye West – Don't Like.1 ; Outkast – Player's Ball ; Ja Rule – New York
- rum-04 : Lil Wayne – 6 Foot 7 Foot ; DMX – I Can Feel It ; G-Unit – My Buddy
- rum-05 : Busta Rhymes – Arab Money ; T.I. – Why You Wanna ; Nelly – N Dey Say
- rum-06 : EPMD – Da Joint ; Delinquent Habits – Return of the Tres ; The Beatnuts – Se Acabo
- rum-07 : Naughty by Nature – Hip Hop Hooray ; Geto Boys – Mind Playing Tricks on Me ; Erick Sermon – Music
- rum-08 : Salt-N-Pepa – Push It ; Run-DMC – It's Tricky ; Snow – Informer
- rum-09 : Das EFX – Mic Checka ; Lost Boyz – Music Makes Me High ; Keith Murray – High As Hell (Explicit)
- rum-10 : Funkdoobiest – Crazy Puerto Rican ; Chingy – Gettin' It ; Da Brat – Let's All Get High

</details>

<!-- /test:rap-us-mixte -->

<!-- test:rnb-soul-mixte -->
## RnB et soul : tous niveaux (`rnb-soul-mixte`)

level `mixed` · decade `all` · genre `pop`

**Écrit**, non figé.

| n° | Niveau visé | Artiste – titre | nb_fan | Position | rank | Extrait | Origine |
|---|---|---|---|---|---|---|---|
| 1 | Facile | Alicia Keys – Fallin' | 5 813 689 | 1 | 918 692 | oui | candidat |
| 2 | Facile | Beyoncé – Single Ladies (Put a Ring on It) | 12 866 806 | 4 | 867 385 | oui | candidat |
| 3 | Moyen | Usher – U Got It Bad | 7 229 878 | 8 | 693 145 | oui | candidat |
| 4 | Moyen | Bruno Mars – Leave The Door Open | 12 846 211 | 15 | 885 966 | oui | découverte (playlist « Retro Soul ») |
| 5 | Moyen | Mary J. Blige – Real Love | 1 528 439 | 10 | 539 506 | oui | candidat |
| 6 | Difficile | Soul II Soul – Back to Life | 43 754 | 1 | 581 293 | oui | candidat |
| 7 | Difficile | Lisa Stansfield – All Around the World | 87 078 | 1 | 657 972 | oui | candidat |
| 8 | Difficile | Rose Royce – Car Wash | 32 948 | 1 | 601 334 | oui | candidat |
| 9 | Impossible | Jalen Ngonda – Just Like You Used To | 18 705 | 6 | 529 585 | oui | découverte (playlist « Retro Soul ») |
| 10 | Impossible | Leon Bridges – Bet Ain't Worth the Hand | 95 580 | 16 | 519 986 | oui | découverte (playlist « Retro Soul ») |

**Remplacements**

- n° 4 : Marvin Gaye – Mercy Mercy Me (The Ecology) → Bruno Mars – Leave The Door Open (découverte, playlist « Retro Soul ») ; écarté : niveau mesuré F (fans 1949971, position 5, rang 692924)
- n° 9 : Joyce Sims – Come into My Life → Jalen Ngonda – Just Like You Used To (découverte, playlist « Retro Soul ») ; écarté : niveau mesuré D (fans 1933, position 1, rang 487781)
- n° 10 : Surface – Happy → Leon Bridges – Bet Ain't Worth the Hand (découverte, playlist « Retro Soul ») ; écarté : niveau mesuré D (fans 18661, position 1, rang 446261)

**Titres écartés (réserves)**

- Alicia Keys – No One : niveau mesuré F (fans 5813689, position 4, rang 878144)
- Aretha Franklin – Think : niveau mesuré F (fans 1873801, position 3, rang 730292)
- Surface – Shower Me with Your Love : niveau mesuré non classé (fans 18661, position 4, rang 244542)

<details><summary>Leurres</summary>

- rnb-01 : Mariah Carey – Obsessed ; Toni Braxton – He Wasn't Man Enough ; Kelly Rowland – Commander
- rnb-02 : Jennifer Lopez – Ain't Your Mama ; Ne-Yo – Because Of You ; Ciara – Like a Boy
- rnb-03 : Ashanti – Body On Me ; Trey Songz – I Need A Girl ; Brandy – Put It Down
- rnb-04 : John Legend – Her ; Justin Timberlake – Selfish ; Stevie Wonder – It's Easier
- rnb-05 : Aaliyah – Rock The Boat ; Destiny's Child – Cater 2 U ; Monica – Why I Love You So Much
- rnb-06 : Cameo – Word Up ; Alexander O'Neal – Sunshine ; The Brand New Heavies – Never Stop
- rnb-07 : Billy Ocean – When the Going Gets Tough, The Tough Get Going ; Bell Biv DeVoe – Poison ; Joe – Ride wit U
- rnb-08 : Olivier St.Louis – Steady ; Tevin Campbell – Can We Talk ; Angie Stone – Heaven Help
- rnb-09 : Isaac Hayes – Run Fay Run ; Terrace Martin – From My Heart and My Soul ; Michael McDonald – For Once In My Life
- rnb-10 : Otis Kane – Keeps Me Going ; India.Arie – I Am Not My Hair ; Harold Melvin & The Blue Notes – Don't Give Me Up

</details>

<!-- /test:rnb-soul-mixte -->

<!-- test:electro-french-touch-mixte -->
## Électro et French touch : tous niveaux (`electro-french-touch-mixte`)

level `mixed` · decade `all` · genre `electro`

**Écrit**, non figé.

| n° | Niveau visé | Artiste – titre | nb_fan | Position | rank | Extrait | Origine |
|---|---|---|---|---|---|---|---|
| 1 | Facile | Kavinsky – Nightcall | 498 568 | 1 | 967 923 | oui | gardé |
| 2 | Facile | Petit Biscuit – Sunset Lover | 539 107 | 1 | 849 584 | oui | réserve |
| 3 | Moyen | Air – Kelly Watch the Stars | 343 500 | 8 | 582 769 | oui | gardé |
| 4 | Moyen | Justice – Genesis | 813 518 | 6 | 777 611 | oui | gardé |
| 5 | Moyen | Martin Solveig – Everybody | 1 667 525 | 6 | 600 110 | oui | gardé |
| 6 | Difficile | Superfunk – Lucky Star | 7 816 | 1 | 755 893 | oui | gardé |
| 7 | Difficile | Benjamin Diamond – In Your Arms (We Gonna Make It) | 7 149 | 2 | 434 161 | oui | gardé |
| 8 | Difficile | Cassius – Toop Toop | 135 639 | 1 | 714 389 | oui | gardé |
| 9 | Impossible | Kid Francescoli – Summer Days | 63 322 | 7 | 536 042 | oui | gardé |
| 10 | Impossible | Alex Gopher – Brain Leech | 11 251 | 6 | 289 500 | oui | gardé |

**Remplacements**

- n° 2 : Soon – Mosimann → Petit Biscuit – Sunset Lover (réserve) ; écarté : retiré à la relecture (hors thème)

**Titres écartés (réserves)**

- Daft Punk – Digital Love : niveau mesuré M (fans 5230239, position 13, rang 758096)
- Kavinsky – Nightcall : morceau déjà bonne réponse d’un autre test
- Daft Punk – Instant Crush : artiste déjà présent dans ce test

<details><summary>Leurres</summary>

- eft-01 : Daft Punk – Veridis Quo ; Bebe Rexha – Sad Girls ; Pitbull – Give Me Everything
- eft-02 : Breakbot – Baby I'm Yours ; Ofenbach – Miles Away ; Jaden Bojsen – Upside Down
- eft-03 : Moby – Go ; Avicii – Superlove ; Alesso – Years
- eft-04 : The Chemical Brothers – Escape Velocity ; Calvin Harris – Under Control ; David Guetta – Hey Mama
- eft-05 : Robin Schulz – Shed a Light ; Bob Sinclar – Rock the Boat ; Benny Benassi – Cinema
- eft-06 : Armand van Helden – I Want Your Soul ; Michael Gray – The Weekend ; Junior Jack – Stupidisco
- eft-07 : Modjo – Chillin' ; The Swiss – Bubble Bath ; Demon – Midnight Funk
- eft-08 : Lifelike – Night Patrol ; Alan Braxe – Intro ; Etienne de Crécy – You
- eft-09 : French 79 – Joyride ; VIZE – One Last Time ; Mont Rouge – Dopamine
- eft-10 : Busy P – Pedrophilia ; Todd Terje – Ragysh ; Para One – Elevation

</details>

<!-- /test:electro-french-touch-mixte -->

<!-- test:variete-francaise-mixte -->
## Variété française : tous niveaux (`variete-francaise-mixte`)

level `mixed` · decade `all` (époque 1970–2026) · genre `chanson`

**Écrit**, non figé.

| n° | Niveau visé | Artiste – titre | nb_fan | Position | rank | Extrait | Origine |
|---|---|---|---|---|---|---|---|
| 1 | Facile | Stromae – Alors on danse | 3 498 811 | 2 | 952 441 | oui | réserve |
| 2 | Facile | Indila – Dernière danse | 1 587 748 | 1 | 949 336 | oui | réserve |
| 3 | Moyen | Céline Dion – On ne change pas | 3 738 362 | 8 | 930 134 | oui | réserve |
| 4 | Moyen | Calogero – Si seulement je pouvais lui manquer | 1 177 087 | 6 | 834 209 | oui | découverte (playlist « chanson francaise annee 2000  ») |
| 5 | Moyen | Francis Cabrel – Octobre | 1 359 155 | 8 | 820 704 | oui | candidat |
| 6 | Difficile | Jeanne Mas – En rouge et noir | 101 900 | 1 | 797 936 | oui | découverte (playlist « Années 80 : variété française | Tubes 80s ») |
| 7 | Difficile | Chagrin D'Amour – Chacun fait (c'qui lui plait) | 7 557 | 1 | 788 851 | oui | découverte (playlist « Années 80 : variété française | Tubes 80s ») |
| 8 | Difficile | Elsa Lunghini – T'en va pas | 44 453 | 1 | 785 304 | oui | découverte (playlist « Années 80 : variété française | Tubes 80s ») |
| 9 | Impossible | François Feldman – Le mal de toi | 80 511 | 6 | 534 346 | oui | découverte (artiste lié) |
| 10 | Impossible | Carole Fredericks – Je l'aime aussi | 52 498 | 12 | 462 446 | oui | découverte (artiste lié) |

**Remplacements**

- n° 1 : Aya Nakamura – Djadja → Stromae – Alors on danse (Radio Edit) (réserve) ; écarté : niveau mesuré M (fans 2773396, position 14, rang 878016)
- n° 2 : Angèle – Balance ton quoi → Indila – Dernière danse (réserve) ; écarté : niveau mesuré M (fans 1753963, position 11, rang 934949)
- n° 3 : Jean-Jacques Goldman – Quand la musique est bonne → Céline Dion – On ne change pas (réserve) ; écarté : niveau mesuré F (fans 1880120, position 1, rang 947197)
- n° 4 : Mylène Farmer – Libertine → Calogero – Si seulement je pouvais lui manquer (découverte, playlist « chanson francaise annee 2000  ») ; écarté : niveau mesuré F (fans 971412, position 5, rang 784458)
- n° 6 : Images – Les démons de minuit → Jeanne Mas – En rouge et noir (découverte, playlist « Années 80 : variété française | Tubes 80s ») ; écarté : niveau mesuré F (fans 89280, position 1, rang 909446)
- n° 7 : Début De Soirée – Nuit de folie → Chagrin D'Amour – Chacun fait (c'qui lui plait) (découverte, playlist « Années 80 : variété française | Tubes 80s ») ; écarté : introuvable chez Deezer (enregistrement studio original avec extrait, ni remix ni version refaite)
- n° 8 : Axelle Red – Sensualité → Elsa Lunghini – T'en va pas (découverte, playlist « Années 80 : variété française | Tubes 80s ») ; écarté : niveau mesuré F (fans 189385, position 2, rang 877692)
- n° 9 : Jean-Pierre Mader – Disparue → François Feldman – Le mal de toi (découverte, artiste lié) ; écarté : niveau mesuré D (fans 29096, position 2, rang 675601)
- n° 10 : Gilbert Montagné – The Fool → Carole Fredericks – Je l'aime aussi (découverte, artiste lié) ; écarté : niveau mesuré non classé (fans 190945, position 5, rang 541063)

**Titres écartés (réserves)**

- Patrick Bruel – Casser la voix : niveau mesuré F (fans 913406, position 2, rang 624122)
- Gold – Capitaine abandonné : morceau déjà leurre d’un test existant
- Émile et Images – Jusqu’au bout de la nuit : introuvable chez Deezer (enregistrement studio original avec extrait, ni remix ni version refaite)
- Pauvres Martins – Mama Lova : introuvable chez Deezer (enregistrement studio original avec extrait, ni remix ni version refaite)
- Jean-Pierre Mader – Jalousie : niveau mesuré non classé (fans 29096, position 4, rang 259067)

<details><summary>Leurres</summary>

- vfm-01 : Angèle – Une seule vie ; Grand Corps Malade – Le prochain rêve ; -M- – Qui de nous deux
- vfm-02 : M. Pokora – Égaré ; Jeck – La recette ; Jeremy Frerot – Frérot
- vfm-03 : Johnny Hallyday – Diego, libre dans sa tête ; Pascal Obispo – Tombé pour elle (L'île aux oiseaux) ; Florent Pagny – Le soldat
- vfm-04 : Indochine – Le chant des cygnes ; Jean-Jacques Goldman – Il changeait la vie ; Zazie – J'envoie valser
- vfm-05 : Daniel Balavoine – Quand on arrive en ville ; Renaud – Dès que le vent soufflera ; France Gall – Musique
- vfm-06 : Patricia Kaas – Mon mec à moi ; Philippe Lafontaine – Cœur de loup ; Images – Maîtresse
- vfm-07 : Thierry Pastor – Le coup de folie ; Niagara – L'amour à la plage ; Lio – Fallait pas commencer
- vfm-08 : Axelle Red – Chanter pour elles ; Roch Voisine – Hélène ; Herbert Léonard – Pour le plaisir
- vfm-09 : Gold – Pour toi la musique ; François Valéry – Qu'Est-ce Qu'On a Dansé Sur Cette Chanson ; Jean-Luc Lahaye – L'amour pour qui
- vfm-10 : Soldat Louis – Du rhum des femmes ; Francis Lalanne – Rentre chez toi ; Partenaire Particulier – Je N Oublierai Jamais

</details>

<!-- /test:variete-francaise-mixte -->

<!-- test:annees-70-mixte -->
## Années 70 : tous niveaux (`annees-70-mixte`)

level `mixed` · decade `1970` · genre `pop`

**Écrit**, non figé.

| n° | Niveau visé | Artiste – titre | nb_fan | Position | rank | Extrait | Origine |
|---|---|---|---|---|---|---|---|
| 1 | Facile | ABBA – Mamma Mia | 3 203 089 | 4 | 840 813 | oui | candidat |
| 2 | Facile | Elton John – Rocket Man (I Think It’s Going to Be a Long, Long Time) | 3 017 981 | 3 | 862 452 | oui | candidat |
| 3 | Moyen | Eagles – Lyin’ Eyes | 1 399 805 | 12 | 510 772 | oui | réserve |
| 4 | Moyen | Fleetwood Mac – Rhiannon | 1 683 602 | 9 | 698 014 | oui | candidat |
| 5 | Moyen | David Bowie – Rebel Rebel | 2 475 935 | 8 | 735 151 | oui | candidat |
| 6 | Difficile | Wild Cherry – Play That Funky Music | 15 872 | 1 | 676 492 | oui | candidat |
| 7 | Difficile | Hot Chocolate – You Sexy Thing | 20 109 | 1 | 711 066 | oui | candidat |
| 8 | Difficile | Looking Glass – Brandy (You're a Fine Girl) | 5 951 | 1 | 627 511 | oui | candidat |
| 9 | Impossible | T-Connection – Saturday Night | 1 804 | 8 | 153 436 | oui | découverte (playlist « Disco 70's/80"s ») |
| 10 | Impossible | Gibson Brothers – Non Stop Dance | 2 990 | 8 | 138 698 | oui | découverte (playlist « Disco 70's/80"s ») |

**Remplacements**

- n° 3 : Eagles – Take It Easy → Eagles – Lyin' Eyes (2013 Remaster) (réserve) ; écarté : niveau mesuré F (fans 1399805, position 2, rang 776127)
- n° 9 : Racey – Some Girls → T-Connection – Saturday Night (découverte, playlist « Disco 70's/80"s ») ; écarté : niveau mesuré D (fans 1870, position 1, rang 408547)
- n° 10 : Showaddywaddy – Under the Moon of Love → Gibson Brothers – Non Stop Dance (découverte, playlist « Disco 70's/80"s ») ; écarté : niveau mesuré D (fans 5390, position 1, rang 387337)

**Titres écartés (réserves)**

- Racey – Lay Your Love on Me : niveau mesuré non classé (fans 1870, position 3, rang 268340)

<details><summary>Leurres</summary>

- a70m-01 : Bee Gees – How Deep Is Your Love ; Boney M. – Sunny ; Billy Joel – Honesty
- a70m-02 : Rod Stewart – Maggie May ; Electric Light Orchestra – Livin' Thing ; America – A Horse with No Name
- a70m-03 : Eric Clapton – Knockin' On Heaven's Door ; Joe Cocker – Woman To Woman ; Bruce Springsteen – Badlands
- a70m-04 : The Rolling Stones – Beast Of Burden ; The Doors – Love Her Madly ; Bob Dylan – The Man in Me
- a70m-05 : Queen – We Will Rock You ; The Police – Can't Stand Losing You ; The Who – Who Are You
- a70m-06 : Average White Band – Pick up the Pieces ; Parliament – Flash Light ; The Brothers Johnson – Strawberry Letter 23
- a70m-07 : Cliff Richard – Devil Woman ; Tina Charles – I Love to Love ; Robert Palmer – Every Kinda People
- a70m-08 : Seals and Crofts – Summer Breeze ; 10cc – Dreadlock Holiday ; The Doobie Brothers – Listen to the Music
- a70m-09 : Loggins & Messina – Be Free ; The Three Degrees – Givin' Up Givin' In ; Leo Sayer – The Dancer
- a70m-10 : Sly Stone – Green Eyed Monster Girl ; Showaddywaddy – Heartbeat ; Three Dog Night – Black And White

</details>

<!-- /test:annees-70-mixte -->


<!-- test:annees-2020-mixte -->
## Années 2020 : tous niveaux (`annees-2020-mixte`)

level `mixed` · decade `2020` · genre `pop`

**Écrit**, non figé.

| n° | Niveau visé | Artiste – titre | nb_fan | Position | rank | Extrait | Origine |
|---|---|---|---|---|---|---|---|
| 1 | Facile | The Weeknd – Save Your Tears | 14 771 271 | 3 | 955 918 | oui | gardé |
| 2 | Facile | Lewis Capaldi – Before You Go | 1 213 759 | 2 | 875 126 | oui | gardé |
| 3 | Moyen | Dua Lipa – Physical | 8 804 953 | 13 | 765 688 | oui | gardé |
| 4 | Moyen | Harry Styles – Adore You | 2 210 396 | 7 | 823 628 | oui | gardé |
| 5 | Moyen | Stromae – Santé | 3 498 811 | 11 | 820 081 | oui | gardé |
| 6 | Difficile | Surf Mesa – ily (i love you baby) | 19 636 | 1 | 737 652 | oui | gardé |
| 7 | Difficile | SAINt JHN – Roses | 138 254 | 1 | 584 434 | oui | gardé |
| 8 | Difficile | Topic – Breaking Me | 155 140 | 2 | 766 277 | oui | réserve |
| 9 | Impossible | BENEE – Glitter | 67 826 | 7 | 456 416 | oui | gardé |
| 10 | Impossible | Remi Wolf – Moon So High | 15 539 | 8 | 515 736 | oui | gardé |

**Remplacements**

- n° 8 : Material Lover – Sienna Spiro → Topic – Breaking Me (réserve) ; écarté : retiré à la relecture (hors thème)

<details><summary>Leurres</summary>

- a20m-01 : Ariana Grande – Petal ; Sam Smith – My Guy ; SZA – Kill Bill
- a20m-02 : Benson Boone – Mystical Magical ; Ella Henderson – Let’s Go Home Together ; Ed Sheeran – Bad Habits
- a20m-03 : Lady Gaga – Disease ; Miley Cyrus – Angels Like You ; Zara Larsson – Blue Moon
- a20m-04 : Olivia Rodrigo – less ; Taylor Swift – I Knew It, I Knew You ; Gracie Abrams – Look at My Life
- a20m-05 : Angèle – Bruxelles je t’aime ; Eddy de Pretto – Petite musique ; MIKA – C’est la Vie
- a20m-06 : Sam Feldt – Memories ; Zerb – Location ; Drove – Home
- a20m-07 : Benjamin Ingrosso – Kite ; Ashe – Sweet Caroline ; Robyn – Talk To Me, Zara
- a20m-08 : Joel Corry – Whisper ; Gaullin – Surrender ; twocolors – Cynical
- a20m-09 : Lola Young – Penny Out of Nothing ; Hard Life – Ocean view ; Gus Dapperton – PhD Rockstar
- a20m-10 : Claire Rosinkranz – Jayden ; Michelle – Fool 4 u ; Between Friends – Eyes on my baby

</details>

<!-- /test:annees-2020-mixte -->

<!-- test:latino-reggaeton-mixte -->
## Latino et reggaeton : tous niveaux (`latino-reggaeton-mixte`)

level `mixed` · decade `all` · genre `pop`

**Écrit**, non figé.

| n° | Niveau visé | Artiste – titre | nb_fan | Position | rank | Extrait | Origine |
|---|---|---|---|---|---|---|---|
| 1 | Facile | Luis Fonsi – Échame la Culpa | 3 151 512 | 2 | 730 181 | oui | gardé |
| 2 | Facile | Nicky Jam – El Perdón | 6 434 839 | 1 | 818 485 | oui | gardé |
| 3 | Moyen | J Balvin – Ginza | 10 349 217 | 12 | 679 565 | oui | gardé |
| 4 | Moyen | Bad Bunny – CAFé CON RON | 8 061 254 | 7 | 931 555 | oui | gardé |
| 5 | Moyen | Wisin & Yandel – Sexy Movimiento | 3 349 126 | 11 | 569 374 | oui | gardé |
| 6 | Difficile | Lorna – Papi Chulo... Te Traigo El Mmmm | 10 246 | 1 | 667 530 | oui | réserve |
| 7 | Difficile | Elvis Crespo – Suavemente | 127 672 | 2 | 702 022 | oui | gardé |
| 8 | Difficile | Ovy On The Drums – YO y TÚ | 172 636 | 3 | 720 003 | oui | gardé |
| 9 | Impossible | Ilegales – Mi Vicio | 31 076 | 9 | 163 499 | oui | gardé |
| 10 | Impossible | DJ Nelson – Yo Voy A Legar | 75 306 | 6 | 284 219 | oui | gardé |

**Remplacements**

- n° 6 : Papi Chulo – Lorna → Lorna – Papi Chulo... Te Traigo El Mmmm (Radio Version) (réserve) ; écarté : retiré à la relecture (hors thème)

<details><summary>Leurres</summary>

- lat-01 : Maluma – Coco loco ; Justin Quiles – Loco ; Marc Anthony – Vivir Mi Vida
- lat-02 : Daddy Yankee – Con Calma ; Andy Rivera – Mi Mundo Entero ; Don Omar – Salió El Sol
- lat-03 : Ozuna – Vaina Loca ; Karol G – El makinon ; Sech – Si Te Vas
- lat-04 : Yandel – Te Suelto el Pelo ; Rosalía – Yo x Ti, Tu x Mi ; Pitbull – El Taxi
- lat-05 : Zion – Amor Genuino ; Tito El Bambino – Entre Tu y Yo ; Zion & Lennox – Te Mueves
- lat-06 : Carlos Baute – Colgando en tus manos (con Marta Sánchez) ; Ismael Rivera – Las Tumbas ; Diana Fuentes – Te Toque Sin Querer
- lat-07 : Fuego – Una Vaina Loca ; Aleks Syntek – Duele El Amor ; Alex Gargolas – Donde Estan las Gatas
- lat-08 : Pastor Lopez – El Ausente ; SBM – Mi Primera Bachata ; Osmani Garcia "La Voz" – Mi Fidelidad
- lat-09 : El Taiger – El Gavilan ; DJ Unic – El Vecino ; Jacob Forever – Que Viva el Amor
- lat-10 : El Chacal – Mi Corazon Es Tuyo ; Divan – Feliz Con El ; Srta. Dayana – Hola Mi Amor

</details>

<!-- /test:latino-reggaeton-mixte -->

<!-- test:reggae-ska-mixte -->
## Reggae et ska : tous niveaux (`reggae-ska-mixte`)

level `mixed` · decade `all` · genre `pop`

**Écrit**, non figé.

| n° | Niveau visé | Artiste – titre | nb_fan | Position | rank | Extrait | Origine |
|---|---|---|---|---|---|---|---|
| 1 | Facile | Bob Marley & The Wailers – Is This Love | 12 305 171 | 3 | 873 346 | oui | réserve |
| 2 | Facile | UB40 – Red Red Wine | 1 179 434 | 1 | 824 524 | oui | candidat |
| 3 | Moyen | Damian Marley – Looks Are Deceiving | 2 440 866 | 6 | 559 897 | oui | découverte (playlist « Reggae Essentials ») |
| 4 | Moyen | Sean Paul – Like Glue | 3 768 432 | 14 | 679 855 | oui | candidat |
| 5 | Moyen | Peter Tosh – Mystic Man | 711 175 | 6 | 497 822 | oui | découverte (playlist « Reggae Essentials ») |
| 6 | Difficile | The Specials – Ghost Town | 124 098 | 1 | 700 411 | oui | réserve |
| 7 | Difficile | Desmond Dekker – Israelites | 63 202 | 1 | 501 184 | oui | candidat |
| 8 | Difficile | Musical Youth – Pass the Dutchie | 33 724 | 1 | 757 137 | oui | candidat |
| 9 | Impossible | Kanka – A ticket to die ! | 53 961 | 8 | 407 044 | oui | découverte (playlist « Dub Essentials ») |
| 10 | Impossible | Iration – Falling | 18 541 | 6 | 249 880 | oui | découverte (playlist « Reggae Classics 70s 80s & 90s | Reggae Music Hits ») |

**Remplacements**

- n° 1 : Bob Marley & The Wailers – Three Little Birds → Bob Marley & The Wailers – Is This Love (réserve) ; écarté : morceau déjà leurre d’un test existant
- n° 3 : Jimmy Cliff – Many Rivers to Cross → Damian Marley – Looks Are Deceiving (découverte, playlist « Reggae Essentials ») ; écarté : niveau mesuré F (fans 1038197, position 2, rang 601673)
- n° 5 : Toots & The Maytals – Pressure Drop → Peter Tosh – Mystic Man (2002 Remaster) (découverte, playlist « Reggae Essentials ») ; écarté : niveau mesuré F (fans 468471, position 4, rang 463874)
- n° 6 : Inner Circle – Bad Boys → The Specials – Ghost Town (réserve) ; écarté : niveau mesuré F (fans 317829, position 1, rang 779156)
- n° 9 : Eddy Grant – Living on the Front Line → Kanka – A ticket to die ! (découverte, playlist « Dub Essentials ») ; écarté : introuvable chez Deezer (enregistrement studio original avec extrait, ni remix ni version refaite)
- n° 10 : Bad Manners – Lip Up Fatty → Iration – Falling (découverte, playlist « Reggae Classics 70s 80s & 90s | Reggae Music Hits ») ; écarté : niveau mesuré D (fans 30411, position 1, rang 372152)

**Titres écartés (réserves)**

- Jimmy Cliff – The Harder They Come : niveau mesuré F (fans 1038197, position 4, rang 544285)
- Madness – Our House : niveau mesuré D (fans 263132, position 1, rang 744598)
- Shaggy – Oh Carolina : niveau mesuré M (fans 876363, position 17, rang 430602)
- Bad Manners – Special Brew : niveau mesuré D (fans 30411, position 2, rang 309655)

<details><summary>Leurres</summary>

- rgs-01 : Alpha Blondy – Jerusalem ; Max Romeo – Chase The Devil ; Toots & The Maytals – 54-46 Was My Number
- rgs-02 : Jimmy Cliff – Many Rivers To Cross ; Burning Spear – Marcus Garvey ; Gregory Isaacs – Cool Down The Pace
- rgs-03 : Alborosie – Dub For The Radicals ; Ziggy Marley – Circle of Peace ; Stephen Marley – Winning
- rgs-04 : Shaggy – Mad Mad World ; Beenie Man – Romie ; Gyptian – Nah Let Go
- rgs-05 : Tiken Jah Fakoly – Djourou ; Konshens – We No Worry 'bout Them ; Inner Circle – Rock with You
- rgs-06 : The Beat – Mirror in the Bathroom ; The Toasters – Frankenska ; The Bodysnatchers – Easy Life
- rgs-07 : John Holt – Police In Helicopter ; Derrick Morgan – Do the Beng Beng ; Ken Boothe – Speak Softly Love
- rgs-08 : Ini Kamoze – Here Comes The Hotstepper ; Sister Nancy – Bam Bam ; Anthony B – World A Reggae Music
- rgs-09 : Third World – Try Jah Love ; Spice – Jim Screechie ; INNA DE YARD – Skylarking
- rgs-10 : The Skatalites – Addis Ababa ; Prince Buster – Enjoy Yourself ; Cornell Campbell – The Sun Stop Shining

</details>

<!-- /test:reggae-ska-mixte -->

<!-- test:metal-hard-rock-mixte -->
## Metal et hard rock : tous niveaux (`metal-hard-rock-mixte`)

level `mixed` · decade `all` · genre `rock`

**Écrit**, non figé.

| n° | Niveau visé | Artiste – titre | nb_fan | Position | rank | Extrait | Origine |
|---|---|---|---|---|---|---|---|
| 1 | Facile | Metallica – Master of Puppets | 8 178 464 | 4 | 781 207 | oui | gardé |
| 2 | Facile | Iron Maiden – The Trooper | 3 796 251 | 3 | 784 417 | oui | gardé |
| 3 | Moyen | Linkin Park – One Step Closer | 12 265 470 | 12 | 881 494 | oui | gardé |
| 4 | Moyen | Black Sabbath – Children of the Grave | 3 044 318 | 9 | 524 158 | oui | gardé |
| 5 | Moyen | AC/DC – Shoot to Thrill | 9 964 433 | 7 | 780 015 | oui | gardé |
| 6 | Difficile | W.A.S.P. – I Wanna Be Somebody | 153 509 | 2 | 471 181 | oui | gardé |
| 7 | Difficile | Saxon – Princess of the Night | 138 368 | 2 | 523 355 | oui | réserve |
| 8 | Difficile | Ratt – Round and Round | 97 599 | 1 | 502 598 | oui | gardé |
| 9 | Impossible | Bad Wolves – Paint It Red | 85 742 | 7 | 423 413 | oui | gardé |
| 10 | Impossible | The HU – Grey Hun | 80 393 | 18 | 373 100 | oui | gardé |

**Remplacements**

- n° 7 : End of You – Poppy → Saxon – Princess of the Night (réserve) ; écarté : retiré à la relecture (hors thème)

**Titres écartés (réserves)**

- Europe – Rock the Night : niveau mesuré F (fans 859887, position 4, rang 522866)
- W.A.S.P. – I Wanna Be Somebody : morceau déjà bonne réponse d’un autre test
- Mötley Crüe – Kickstart My Heart : niveau mesuré F (fans 829350, position 1, rang 714749)
- Accept – Balls to the Wall : artiste déjà présent dans ce test

<details><summary>Leurres</summary>

- mhr-01 : Aerosmith – Walk This Way ; Ozzy Osbourne – Crazy Train ; Guns N' Roses – Paradise City
- mhr-02 : Motörhead – Hellraiser ; Mötley Crüe – Kickstart My Heart ; Megadeth – Symphony Of Destruction
- mhr-03 : Evanescence – Sweet Sacrifice ; Bon Jovi – Wanted Dead Or Alive ; TOOL – Stinkfist
- mhr-04 : KISS – Lick It Up ; Van Halen – Eruption ; Alice Cooper – Welcome to My Nightmare
- mhr-05 : Deep Purple – Black Night ; Def Leppard – Rock Of Ages ; Led Zeppelin – The Rover
- mhr-06 : Quiet Riot – Metal Health (Bang Your Head) ; Accept – Princess Of The Dawn ; Bruce Dickinson – Tears of the Dragon
- mhr-07 : Rainbow – Catch The Rainbow ; Manowar – Battle Hymn ; Queensrÿche – Silent Lucidity
- mhr-08 : Cinderella – Nobody's Fool ; Poison – Nothin' But A Good Time ; Warrant – Heaven
- mhr-09 : Pop Evil – Take It All ; Spiritbox – Perfect Soul ; Extreme – RISE
- mhr-10 : Emigrate – Rainbow ; Paradise Lost – Hallowed Land ; Heaven Shall Burn – Protector

</details>

<!-- /test:metal-hard-rock-mixte -->

<!-- test:jazz-swing-mixte -->
## Jazz et swing : tous niveaux (`jazz-swing-mixte`)

level `mixed` · decade `all` · genre `pop`

**Écrit**, non figé.

| n° | Niveau visé | Artiste – titre | nb_fan | Position | rank | Extrait | Origine |
|---|---|---|---|---|---|---|---|
| 1 | Facile | Grover Washington, Jr. – Just the Two of Us | 82 103 | 1 | 820 911 | oui | découverte (playlist « The essentials of Jazz, Soul, Blues & Lounge Music ») |
| 2 | Facile | Frank Sinatra – Fly Me To The Moon | 2 489 086 | 1 | 816 266 | oui | candidat |
| 3 | Moyen | Duke Ellington – Take the "A" Train | 357 801 | 21 | 310 560 | oui | réserve |
| 4 | Moyen | Miles Davis – Freddie Freeloader | 1 119 082 | 6 | 495 620 | oui | candidat |
| 5 | Moyen | Nina Simone – Sinnerman | 2 564 501 | 8 | 658 745 | oui | candidat |
| 6 | Difficile | The Dave Brubeck Quartet – Take Five | 104 152 | 1 | 564 084 | oui | candidat |
| 7 | Difficile | Glenn Miller – In the Mood | 122 182 | 1 | 637 565 | oui | réserve |
| 8 | Difficile | Peggy Lee – Fever | 241 425 | 1 | 737 379 | oui | découverte (playlist « Jazz Crooners ») |
| 9 | Impossible | Clifford Brown – Jordu | 34 190 | 6 | 310 007 | oui | découverte (playlist « 50's Jazz ») |
| 10 | Impossible | Michel Petrucciani – Face's Face | 61 603 | 8 | 305 872 | oui | découverte (playlist « Jazz Club ») |

**Remplacements**

- n° 1 : Louis Armstrong – What A Wonderful World → Grover Washington, Jr. – Just the Two of Us (découverte, playlist « The essentials of Jazz, Soul, Blues & Lounge Music ») ; écarté : morceau déjà bonne réponse d’un autre test
- n° 3 : Ella Fitzgerald – Cheek To Cheek → Duke Ellington – Take the "A" Train (réserve) ; écarté : niveau mesuré F (fans 1257759, position 2, rang 633660)
- n° 7 : Chet Baker – My Funny Valentine → Glenn Miller – In The Mood (réserve) ; écarté : niveau mesuré F (fans 529476, position 1, rang 579629)
- n° 8 : Vince Guaraldi Trio – Linus and Lucy → Peggy Lee – Fever (découverte, playlist « Jazz Crooners ») ; écarté : niveau mesuré I (fans 11892, position 7, rang 316926)
- n° 9 : Bill Evans – Peace Piece → Clifford Brown – Jordu (découverte, playlist « 50's Jazz ») ; écarté : niveau mesuré non classé (fans 272792, position 11, rang 375686)
- n° 10 : Wes Montgomery – Four On Six → Michel Petrucciani – Face's Face (découverte, playlist « Jazz Club ») ; écarté : niveau mesuré non classé (fans 123753, position 13, rang 271677)

**Titres écartés (réserves)**

- Louis Armstrong – La vie en rose : niveau mesuré M (fans 2066501, position 19, rang 513905)
- Stan Getz – The Girl from Ipanema : niveau mesuré F (fans 349395, position 1, rang 786893)
- Herbie Hancock – Cantaloupe Island : niveau mesuré F (fans 429551, position 1, rang 672608)
- Wes Montgomery – Bumpin’ on Sunset : niveau mesuré non classé (fans 123753, position 5, rang 396458)

<details><summary>Leurres</summary>

- jzz-01 : Herbie Hancock – Cantaloupe Island ; Al Jarreau – Mornin' ; George Benson – Breezin'
- jzz-02 : Louis Armstrong – That Old Feeling ; Ella Fitzgerald – I've Got You Under My Skin ; Sarah Vaughan – Lullaby Of Birdland
- jzz-03 : Chet Baker – Everything Happens to Me ; John Coltrane – They Say It's Wonderful ; Chick Corea – Return To Forever
- jzz-04 : Billie Holiday – I'll Be Seeing You ; Tony Bennett – Cheek To Cheek ; Etta James – All I Could Do Was Cry
- jzz-05 : Ray Charles – Ev'ry Time We Say Goodbye ; Stan Getz – But Beautiful ; Dean Martin – Night Train to Memphis
- jzz-06 : Oscar Peterson – Just One Of Those Things ; Bill Evans – Skating In Central Park ; Art Blakey – Moanin'
- jzz-07 : Benny Goodman and His Orchestra – Sing, Sing, Sing ; Cab Calloway – Minnie the Moocher (Theme Song) ; Fats Waller – Ain't Misbehavin'
- jzz-08 : Dinah Washington – It's a Mean Old Man's World ; Mel Tormé – Comin' Home Baby ; Nancy Wilson – (You Don't Know) How Glad I Am
- jzz-09 : Dexter Gordon – Home Run ; Sonny Stitt – I Got Rhythm ; Wayne Shorter – Beauty and the Beast
- jzz-10 : Oscar Peterson Trio – I Feel Pretty ; Ahmad Jamal – Dolphin Dance ; Roy Hargrove – Joy Is Sorrow Unmasked

</details>

<!-- /test:jazz-swing-mixte -->

<!-- test:films-series-mixte -->
## Films et séries : tous niveaux (`films-series-mixte`)

level `mixed` · decade `all` · genre `pop`

**Écrit**, non figé.

| n° | Niveau visé | Artiste – titre | nb_fan | Position | rank | Extrait | Origine |
|---|---|---|---|---|---|---|---|
| 1 | Facile | Hans Zimmer – Cornfield Chase | 2 144 085 | 1 | 870 201 | oui | candidat |
| 2 | Facile (exception : mesuré Moyen) | Ennio Morricone – The Good, The Bad And The Ugly | 688 054 | 6 | 590 319 | oui | candidat |
| 3 | Moyen (exception : mesuré Facile) | Ramin Djawadi – Light of the Seven | 546 495 | 1 | 710 085 | oui | candidat |
| 4 | Moyen | John Williams – Duel of the Fates | 893 822 | 7 | 608 496 | oui | candidat |
| 5 | Moyen (exception : mesuré Facile) | Danny Elfman – This is Halloween | 419 027 | 5 | 437 190 | oui | candidat |
| 6 | Difficile (exception : mesuré non classé) | Vangelis – Chariots of Fire | 211 346 | 3 | 560 590 | oui | candidat |
| 7 | Difficile | Glenn Frey – The Heat Is On | 15 034 | 1 | 598 596 | oui | candidat |
| 8 | Difficile | Limahl – Never Ending Story | 8 900 | 1 | 780 084 | oui | candidat |
| 9 | Impossible (exception : mesuré non classé) | Stan Bush – Dare | 3 162 | 3 | 305 024 | oui | candidat |
| 10 | Impossible (exception : mesuré Difficile) | Jan Hammer – Crockett's Theme | 7 663 | 1 | 598 480 | oui | candidat |

<details><summary>Leurres</summary>

- fsm-01 : Alexandre Desplat – Lily's Theme ; John Powell – Test Drive ; James Horner – For The Love Of A Princess
- fsm-02 : Deniece Williams – Let's Hear It for the Boy ; Steve Jablonsky – Arrival to Earth ; Harold Faltermeyer – Top Gun Anthem
- fsm-03 : Howard Shore – The Breaking of the Fellowship ; Michael Giacchino – Married Life ; Thomas Newman – Any Other Name
- fsm-04 : Alan Silvestri – The Avengers ; Clint Mansell – Lux Aeterna ; Ludwig Goransson – Can You Hear The Music
- fsm-05 : Hildur Guðnadóttir – Bathroom Dance ; Joe Hisaishi – One Summer's Day ; John Parr – St Elmo's Fire
- fsm-06 : Giorgio Moroder – Chase ; Peter Cetera – Glory of Love ; Tina Turner – We Don't Need Another Hero (Thunderdome)
- fsm-07 : Lisa Gerrard – Now We Are Free ; Irene Cara – Flashdance...What a Feeling ; Michael Sembello – Maniac
- fsm-08 : Klaus Doldinger – Das Boot ; Ludovico Einaudi – Fly ; Kyle Dixon & Michael Stein – Stranger Things
- fsm-09 : Mike Oldfield – Tubular Bells (Opening Theme / From "The Exorcist") ; Henry Mancini – The Pink Panther Theme ; Simple Minds – Don't You (Forget About Me)
- fsm-10 : Enya – May It Be ; Justin Hurwitz – Mia & Sebastian’s Theme ; John Carpenter – Halloween Theme

</details>

<!-- /test:films-series-mixte -->

<!-- test:disney-mixte -->
## Disney : tous niveaux (`disney-mixte`)

level `mixed` · decade `all` · genre `pop`

**Écrit**, non figé.

| n° | Niveau visé | Artiste – titre | nb_fan | Position | rank | Extrait | Origine |
|---|---|---|---|---|---|---|---|
| 1 | Facile (exception : mesuré Difficile) | Dimitri Rougeul – Je Voudrais Déjà être Roi | 1 492 | 1 | 755 292 | oui | candidat |
| 2 | Facile (exception : mesuré Difficile) | Maéva Méline – Je veux y croire | 17 494 | 1 | 765 876 | oui | candidat |
| 3 | Moyen (exception : mesuré Facile) | Anthony Kavanagh – Pour les hommes | 11 481 | 1 | 837 497 | oui | candidat |
| 4 | Moyen (exception : mesuré Difficile) | Richard Darbois – Je suis ton meilleur ami | 1 102 | 3 | 627 860 | oui | candidat |
| 5 | Moyen (exception : mesuré Difficile) | Jean Stout – Être un homme comme vous | 693 | 1 | 659 419 | oui | candidat |
| 6 | Difficile | Mimi Félixine – Jamais Je N'avouerai | 1 570 | 1 | 717 422 | oui | candidat |
| 7 | Difficile | Marie Galey – Une belle fille à aimer | 266 | 1 | 588 115 | oui | candidat |
| 8 | Difficile | Bernard Alane – Les Cloches de Notre-Dame | 405 | 1 | 638 562 | oui | candidat |
| 9 | Impossible (exception : mesuré Moyen) | Phil Collins – Jungle Jazz | 2 853 536 | 21 | 539 145 | oui | candidat |
| 10 | Impossible (exception : mesuré Difficile) | MARCEL BOUNGOU – Á Upendi | 1 958 | 1 | 664 149 | oui | candidat |

<details><summary>Leurres</summary>

- dsm-01 : Jean-Luc Guizonne – Notre terre ; Cast of Frozen – Le Cœur de Glace ; Alan Menken – Le vaurien
- dsm-02 : Emmylou Homs – Point d'avenir sans nous ; Charlotte Hervieux – Dans un autre monde ; Frédérique Tirmont – Toujours Dans Mon Coeur
- dsm-03 : Rachel Pignot – Un jour, mon prince viendra ; Henri Salvador – Embrasse-la ; Assitan Dembele – Le Gospel Pur II
- dsm-04 : Jean-Claude Corbel – Gaston ; Maurice Chevalier – Les Aristochats ; Jean-Claude Donda – Heigh-Ho!
- dsm-05 : Donald Reignoux – J'ai perdu le nord ; Pierre Marret – La patrouille des éléphants ; Sophie Delmas – N’écoute que moi
- dsm-06 : Claire Guyot – Partir là-bas ; Kelly Marot – Nous Sommes Un ; Jean Piat – Soyez Prêtes
- dsm-07 : Francis Lalanne – Rien qu'un Jour ; Emmanuel Dahl – Le Monde Qui Est Le Mien ; Michel Roux – Chem-chem Cheminée
- dsm-08 : China Moses – Au Bout du Rêve ; Camille – Le Festin ; Emmanuel Curtil – En Été
- dsm-09 : Bénédicte Lecroard – Je ne savais pas ; Debbie Davis – L'histoire de la vie ; Patrick Fiori – Comme un homme
- dsm-10 : Guillaume Beaujolais – L’Amour Est un Cadeau ; CharlElie Couture – Je Suis Ton Ami ; Coralie Thuilier – Je Voudrais un Bonhomme de Neige

</details>

<!-- /test:disney-mixte -->

<!-- test:rock-francais-mixte -->
## Rock français : tous niveaux (`rock-francais-mixte`)

level `mixed` · decade `all` · genre `rock`

**Écrit**, non figé.

| n° | Niveau visé | Artiste – titre | nb_fan | Position | rank | Extrait | Origine |
|---|---|---|---|---|---|---|---|
| 1 | Facile | Telephone – New York avec toi | 780 279 | 2 | 837 305 | oui | artiste de départ |
| 2 | Facile | Noir Désir – L'homme pressé | 1 052 339 | 2 | 791 205 | oui | artiste de départ |
| 3 | Moyen | Alain Bashung – Ma petite entreprise | 444 988 | 6 | 641 870 | oui | artiste de départ |
| 4 | Moyen | Louise Attaque – Amours | 983 421 | 6 | 682 474 | oui | artiste de départ |
| 5 | Moyen | Mano Negra – Soledad | 572 208 | 6 | 547 181 | oui | artiste de départ |
| 6 | Difficile | Les Wampas – Rimini | 92 953 | 2 | 665 452 | oui | artiste de départ |
| 7 | Difficile | Dionysos – Song For Jedi | 130 923 | 1 | 670 521 | oui | artiste de départ |
| 8 | Difficile | Mass Hysteria – L'enfer des dieux | 93 443 | 1 | 549 824 | oui | artiste de départ |
| 9 | Impossible | Ludwig Von 88 – Houlala ! | 50 847 | 6 | 366 722 | oui | artiste de départ |
| 10 | Impossible | Les Garçons Bouchers – Le Rap Des Garçons Bouchers | 25 264 | 6 | 205 831 | oui | artiste de départ |

<details><summary>Leurres</summary>

- rkf-01 : Les Rita Mitsouko – Les histoires d'a ; Kyo – Le chemin ; BB Brunes – Dis-moi
- rkf-02 : Saez – J'accuse ; Matmatah – Les moutons ; Indochine – La vie est belle
- rkf-03 : Hubert-Félix Thiéfaine – Je t'en remets au vent ; Arno – Les yeux de ma mère ; Les Fatals Picards – Le retour à la terre
- rkf-04 : Luke – La sentinelle ; -M- – À toi ; Tété – À la faveur de l'automne
- rkf-05 : Les Négresses Vertes – Zobi la mouche ; Pigalle – Madame Louise, elle est exquise ; Raoul Petite – Dans ton kulte
- rkf-06 : Bérurier Noir – Salut à toi ; Les Sales Majestés – Sois pauvre et tais toi ! ; Les Sheriff – Jouer avec le feu
- rkf-07 : Mademoiselle K – Ça me vexe ; Eiffel – A Tout Moment La Rue ; Tarmac – La ballade des gens qui sont nés quelque part
- rkf-08 : No One Is Innocent – La peau ; Ultra Vomit – La Puissance du Pouvoir ; AqME – "Si" n'existe pas
- rkf-09 : La Souris Déglinguée – Rock’n’roll vengeance ; Parabellum – Momo (la p'tite balle du sam'di soir) ; Les Betteraves – Nain de jardin
- rkf-10 : Les Satellites – Riches et célèbres ; Gogol Premier – C'est vraiment fou la disco ; Molodoï – Vive L'Armée du Salut

</details>

<!-- /test:rock-francais-mixte -->
