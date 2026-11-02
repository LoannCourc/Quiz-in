# Blind tests après la refonte (lot BT-8)

Généré le 2026-11-01 par `scripts/blind-tests/generate.mjs` et `report.mjs`. Mesures Deezer : fans de l'artiste (`nb_fan`), position du morceau chez l'artiste (la meilleure entre le top Deezer et le classement par rang), rang de la piste (`rank`).

## Seuils (calibrés sur les 12 références rap français)

- Connu : 300 000 fans ou plus.
- Facile : position ≤ 5, et artiste connu ou rang ≥ 800 000.
- Moyen : artiste connu, position ≥ 6.
- Difficile : artiste moins connu, rang ≥ 600 000 ou position ≤ 2.
- Impossible : artiste moins connu, rang < 550 000 et position ≥ 6.

## Années 80 : les tubes (`annees-80-facile`)

level `easy` · decade `1980` · genre `pop`

**Figé le 2026-11-01** (content/frozen-blind-tests.json : le build refuse tout changement).

| n° | Niveau visé | Artiste – titre | nb_fan | Position | Rang | Extrait | Origine |
|---|---|---|---|---|---|---|---|
| 1 | Facile | Michael Jackson – Billie Jean | 13 238 945 | 2 | 971 418 | oui | candidat |
| 2 | Facile | a-ha – Take on Me | 1 181 498 | 1 | 988 080 | oui | candidat |
| 3 | Facile | Cyndi Lauper – Girls Just Want to Have Fun | 1 054 726 | 1 | 945 998 | oui | candidat |
| 4 | Facile | Europe – The Final Countdown | 859 887 | 1 | 847 358 | oui | candidat |
| 5 | Facile | Toto – Africa | 985 510 | 1 | 964 180 | oui | candidat |
| 6 | Facile | Survivor – Eye of the Tiger | 262 336 | 1 | 898 987 | oui | candidat |
| 7 | Facile | Desireless – Voyage voyage | 55 091 | 1 | 915 543 | oui | candidat |
| 8 | Facile | Wham! – Wake Me Up Before You Go-Go | 373 861 | 1 | 875 311 | oui | candidat |
| 9 | Facile | Indochine – L'aventurier | 1 300 768 | 1 | 935 412 | oui | candidat |
| 10 | Facile | Bon Jovi – Livin' On A Prayer | 5 289 775 | 1 | 936 708 | oui | candidat |

<details><summary>Leurres</summary>

- a80f-01 : Prince – Batdance ; George Michael – Careless Whisper ; Madonna – Like a Prayer
- a80f-02 : Eurythmics – Sweet Dreams (Are Made of This) ; Alphaville – Forever Young ; Tears for Fears – Everybody Wants To Rule The World
- a80f-03 : Elton John – I'm Still Standing ; Roxette – It Must Have Been Love ; Bonnie Tyler – Holding Out for a Hero
- a80f-04 : Van Halen – Jump ; Whitesnake – Is This Love ; Scorpions – Rock You Like a Hurricane (2011)
- a80f-05 : Journey – Don't Stop Believin' ; Billy Joel – Uptown Girl ; Billy Idol – Rebel Yell
- a80f-06 : Starship – Nothing's Gonna Stop Us Now ; Def Leppard – Pour Some Sugar On Me ; Soft Cell – Tainted Love
- a80f-07 : Gérard Blanc – Une autre histoire ; Francis Cabrel – Encore et encore ; Michel Berger – La groupie du pianiste
- a80f-08 : The Pointer Sisters – I'm So Excited ; Culture Club – Karma Chameleon ; Pet Shop Boys – It's a Sin
- a80f-09 : Telephone – Un autre monde ; Marc Lavoine – Elle a les yeux revolver ; Jean-Jacques Goldman – Là-bas
- a80f-10 : Guns N' Roses – Sweet Child O' Mine ; Queen – Under Pressure ; Bryan Adams – Heaven

</details>

## Années 90 : les tubes (`annees-90-facile`)

level `easy` · decade `1990` · genre `pop`

**Figé le 2026-11-01** (content/frozen-blind-tests.json : le build refuse tout changement).

| n° | Niveau visé | Artiste – titre | nb_fan | Position | Rang | Extrait | Origine |
|---|---|---|---|---|---|---|---|
| 1 | Facile | Spice Girls – Wannabe | 410 990 | 1 | 918 044 | oui | candidat |
| 2 | Facile | Backstreet Boys – I Want It That Way | 1 149 488 | 2 | 899 965 | oui | candidat |
| 3 | Facile | Oasis – Wonderwall | 4 713 808 | 1 | 988 464 | oui | candidat |
| 4 | Facile | Nirvana – Smells Like Teen Spirit | 10 098 982 | 1 | 985 641 | oui | candidat |
| 5 | Facile | Cher – Believe | 564 174 | 1 | 862 715 | oui | réserve |
| 6 | Facile | Whitney Houston – I Will Always Love You | 3 938 413 | 1 | 852 884 | oui | candidat |
| 7 | Facile | Britney Spears – ...Baby One More Time | 5 469 842 | 1 | 956 742 | oui | candidat |
| 8 | Facile | Aqua – Barbie Girl | 120 871 | 1 | 845 916 | oui | candidat |
| 9 | Facile | Ricky Martin – Livin' la Vida Loca | 2 218 904 | 1 | 715 451 | oui | candidat |
| 10 | Facile | Haddaway – What Is Love | 104 514 | 1 | 908 164 | oui | candidat |

**Remplacements**

- n° 5 : Céline Dion – My Heart Will Go On → Cher – Believe (réserve) ; écarté : niveau mesuré M (fans 3738362, position 15, rang 885872)

<details><summary>Leurres</summary>

- a90f-01 : Christina Aguilera – Genie In a Bottle ; *NSYNC – I Want You Back ; Scorpions – Wind Of Change
- a90f-02 : Mariah Carey – All I Want for Christmas Is You ; Westlife – Flying Without Wings ; Radiohead – Karma Police
- a90f-03 : Red Hot Chili Peppers – Californication ; The Cranberries – Zombie ; The Verve – Bitter Sweet Symphony
- a90f-04 : Metallica – Enter Sandman ; AC/DC – Thunderstruck ; Guns N' Roses – Knockin' On Heaven's Door
- a90f-05 : Bryan Adams – (Everything I Do) I Do It For You ; The Offspring – Pretty Fly (For A White Guy) ; Lou Bega – Mambo No. 5 (a Little Bit of...)
- a90f-06 : Toni Braxton – Un-Break My Heart ; Boyz II Men – End Of The Road ; Janet Jackson – That's The Way Love Goes
- a90f-07 : Jennifer Lopez – Let's Get Loud ; Mazzy Star – Fade Into You ; Depeche Mode – Enjoy the Silence
- a90f-08 : Corona – The Rhythm Of The Night ; Gala – Freed From Desire ; Robbie Williams – Angels
- a90f-09 : TLC – Waterfalls ; Destiny's Child – Bills, Bills, Bills ; Beck – Loser
- a90f-10 : Snap! – Rhythm Is A Dancer ; Aerosmith – I Don't Want To Miss A Thing ; Blur – Song 2

</details>

## Années 2000 : les tubes (`annees-2000-facile`)

level `easy` · decade `2000` · genre `pop`

**Figé le 2026-11-01** (content/frozen-blind-tests.json : le build refuse tout changement).

| n° | Niveau visé | Artiste – titre | nb_fan | Position | Rang | Extrait | Origine |
|---|---|---|---|---|---|---|---|
| 1 | Facile | Shakira – Hips Don't Lie | 11 785 032 | 4 | 918 364 | oui | candidat |
| 2 | Facile | Britney Spears – Toxic | 5 469 842 | 1 | 972 750 | oui | candidat |
| 3 | Facile | Black Eyed Peas – I Gotta Feeling | 6 118 590 | 1 | 928 910 | oui | candidat |
| 4 | Facile | Coldplay – Viva La Vida | 18 440 893 | 1 | 951 268 | oui | candidat |
| 5 | Facile | Daft Punk – One More Time | 5 230 239 | 4 | 896 666 | oui | candidat |
| 6 | Facile | Rihanna – Umbrella | 18 138 011 | 4 | 958 984 | oui | candidat |
| 7 | Facile | Linkin Park – In the End | 12 265 470 | 1 | 982 895 | oui | candidat |
| 8 | Facile | Christophe Maé – On s'attache | 1 098 065 | 2 | 924 953 | oui | candidat |
| 9 | Facile | Kylie Minogue – Can't Get You out of My Head | 1 425 766 | 1 | 860 867 | oui | réserve |
| 10 | Facile | Beyoncé – Crazy In Love | 12 866 806 | 1 | 927 130 | oui | réserve |

**Remplacements**

- n° 9 : OutKast – Hey Ya! → Kylie Minogue – Can't Get You out of My Head (réserve) ; écarté : paroles explicites (refusées hors rap)
- n° 10 : Las Ketchup – Aserejé → Beyoncé – Crazy In Love (feat. JAŸ-Z) (réserve) ; écarté : introuvable chez Deezer (enregistrement studio original avec extrait, ni remix ni version refaite)

<details><summary>Leurres</summary>

- a00f-01 : Nelly Furtado – Maneater ; Hoobastank – The Reason ; Madonna – Hung Up
- a00f-02 : Kesha – TiK ToK ; Katy Perry – I Kissed A Girl ; Gwen Stefani – The Sweet Escape
- a00f-03 : Flo Rida – Right Round ; Sean Paul – Temperature ; Timbaland – The Way I Are
- a00f-04 : OneRepublic – Apologize ; Maroon 5 – She Will Be Loved ; Snow Patrol – Chasing Cars
- a00f-05 : Bob Sinclar – Rock This Party (Everybody Dance Now) ; Modjo – Lady (Hear Me Tonight) ; The Supermen Lovers – Starlight (The Fame)
- a00f-06 : USHER – Yeah! ; Justin Timberlake – SexyBack ; Jason Derulo – Whatcha Say
- a00f-07 : Evanescence – Bring Me To Life ; Green Day – Wake Me up When September Ends ; Limp Bizkit – Behind Blue Eyes
- a00f-08 : Calogero – Face à la mer ; Gregoire – Toi + Moi ; Joyce Jonathan – Je ne sais pas
- a00f-09 : Christina Aguilera – Hurt ; M.I.A. – Paper Planes ; Shaggy – It Wasn't Me
- a00f-10 : Mary J. Blige – Family Affair ; Alicia Keys – No One ; Ne-Yo – So Sick

</details>

## Années 2010 : les tubes (`annees-2010-facile`)

level `easy` · decade `2010` · genre `pop`

**Figé le 2026-11-01** (content/frozen-blind-tests.json : le build refuse tout changement).

| n° | Niveau visé | Artiste – titre | nb_fan | Position | Rang | Extrait | Origine |
|---|---|---|---|---|---|---|---|
| 1 | Facile | Pharrell Williams – Happy | 3 235 780 | 2 | 923 864 | oui | candidat |
| 2 | Facile | Adele – Rolling in the Deep | 15 509 911 | 2 | 972 160 | oui | candidat |
| 3 | Facile | Ed Sheeran – Shape of You | 20 952 164 | 1 | 968 208 | oui | candidat |
| 4 | Facile | Avicii – Wake Me Up | 8 374 495 | 1 | 921 155 | oui | candidat |
| 5 | Facile | Luis Fonsi – Despacito | 3 151 512 | 1 | 843 059 | oui | candidat |
| 6 | Facile | Imagine Dragons – Believer | 9 555 798 | 2 | 946 141 | oui | candidat |
| 7 | Facile | Mark Ronson – Uptown Funk | 756 745 | 1 | 951 385 | oui | réserve |
| 8 | Facile | Daft Punk – Get Lucky | 5 230 239 | 1 | 954 234 | oui | candidat |
| 9 | Facile | Louane – Jour 1 | 1 994 737 | 4 | 856 224 | oui | réserve |
| 10 | Facile | Christophe Maé – Tombé sous le charme | 1 098 065 | 5 | 888 507 | oui | découverte (playlist « Les tubes des années 2010 ») |

**Remplacements**

- n° 7 : GIMS – Est-ce que tu m'aimes ? (Pilule bleue) → Mark Ronson – Uptown Funk (feat. Bruno Mars) (réserve) ; écarté : niveau mesuré M (fans 6993274, position 9, rang 944583)
- n° 9 : PSY – Gangnam Style → Louane – Jour 1 (réserve) ; écarté : caractères absents des polices ou titre grossier
- n° 10 : Stromae – Papaoutai → Christophe Maé – Tombé sous le charme (découverte, playlist « Les tubes des années 2010 ») ; écarté : niveau mesuré M (fans 3498811, position 6, rang 903633)

**Réserves écartées**

- Katy Perry – Roar : niveau mesuré M (fans 9815238, position 8, rang 896113)
- Maroon 5 – Sugar : paroles explicites (refusées hors rap)

<details><summary>Leurres</summary>

- a10f-01 : Alicia Keys – Girl on Fire ; Justin Timberlake – CAN'T STOP THE FEELING! ; Black Eyed Peas – Just Can’t Get Enough
- a10f-02 : Lady Gaga – Shallow ; Bruno Mars – Locked out of Heaven ; Lewis Capaldi – Someone You Loved
- a10f-03 : P!nk – Just Give Me a Reason ; Maroon 5 – Moves Like Jagger (Studio Recording From "The Voice" Performance) ; Shawn Mendes – Treat You Better
- a10f-04 : The Chainsmokers – Don't Let Me Down ; Calvin Harris – Feel So Close ; Robin Schulz – Sugar
- a10f-05 : Enrique Iglesias – DUELE EL CORAZON ; Reik – Amigos Con Derechos ; Cali Y El Dandee – Por Fin Te Encontré
- a10f-06 : Sia – Chandelier ; Coldplay – Hymn for the Weekend ; Rag'n'Bone Man – Human
- a10f-07 : Gotye – Somebody That I Used To Know ; Dua Lipa – Love Again ; DJ Snake – Let Me Love You
- a10f-08 : Billie Eilish – lovely ; Drake – One Dance ; John Legend – All of Me
- a10f-09 : M. Pokora – Juste une photo de toi ; Hoshi – Amour censure ; Marwa Loud – Fallait Pas
- a10f-10 : Zaz – Je veux ; Fréro Delavega – Le chant des sirènes ; Soprano – Le coach

</details>

## Chanson française : les classiques (`chanson-francaise-classiques`)

level `easy` · decade `all` · genre `chanson`

**Figé le 2026-11-01** (content/frozen-blind-tests.json : le build refuse tout changement).

| n° | Niveau visé | Artiste – titre | nb_fan | Position | Rang | Extrait | Origine |
|---|---|---|---|---|---|---|---|
| 1 | Facile | Edith Piaf – La Vie en Rose | 659 986 | 3 | 739 389 | oui | candidat |
| 2 | Facile | Jacques Brel – Ne me quitte pas | 797 027 | 4 | 729 479 | oui | candidat |
| 3 | Facile | Charles Aznavour – La bohème | 1 075 352 | 2 | 940 092 | oui | candidat |
| 4 | Facile | Joe Dassin – Les Champs-Elysées | 684 846 | 4 | 863 251 | oui | candidat |
| 5 | Facile | Claude François – Comme d'habitude | 412 638 | 2 | 773 702 | oui | candidat |
| 6 | Facile | Michel Sardou – Les lacs du Connemara | 860 004 | 1 | 901 854 | oui | candidat |
| 7 | Facile | Renaud – Mistral gagnant | 1 365 839 | 1 | 949 716 | oui | candidat |
| 8 | Facile | Dalida – Paroles… paroles… | 609 778 | 2 | 869 683 | oui | candidat |
| 9 | Facile | Francis Cabrel – Je l'aime à mourir | 1 359 155 | 2 | 919 317 | oui | réserve |
| 10 | Facile | Georges Brassens – Les copains d'abord | 662 189 | 1 | 812 689 | oui | candidat |

**Remplacements**

- n° 9 : Jacques Dutronc – Il est cinq heures, Paris s'éveille → Francis Cabrel – Je l'aime à mourir (Remastered) (réserve) ; écarté : niveau mesuré D (fans 219888, position 2, rang 710958)

**Réserves écartées**

- Édith Piaf – Non, je ne regrette rien : artiste déjà présent dans ce test

<details><summary>Leurres</summary>

- cfc-01 : Henri Salvador – Une chanson douce (Le Loup, la biche et le chevalier) ; Jean Ferrat – Aimer à perdre la raison ; Bourvil – La Tendresse
- cfc-02 : Alain Souchon – J'ai dix ans ; Hugues Aufray – Céline ; Jacques Dutronc – Il est cinq heures, Paris s'éveille
- cfc-03 : Michel Delpech – Le chasseur (Les oies sauvages) ; Eddy Mitchell – Couleur menthe à l'eau ; Julien Clerc – Ma préférence
- cfc-04 : Pierre Bachelet – Elle est d'ailleurs ; Johnny Hallyday – Requiem pour un fou ; Serge Lama – Je suis malade
- cfc-05 : Richard Anthony – Amoureux de ma femme ; Dave – Du côte de chez Swann ; Gérard Lenorman – Si J'Etais President
- cfc-06 : France Gall – Résiste ; Daniel Balavoine – Le chanteur ; Michel Fugain – Fais comme l'oiseau
- cfc-07 : Pierre Perret – Au café du canal ; Véronique Sanson – Chanson sur ma drôle de vie ; Les Rita Mitsouko – Marcia Baïla
- cfc-08 : Christophe – Les mots bleus ; Françoise Hardy – Le temps de l'amour ; Sylvie Vartan – L'amour c'est comme une cigarette
- cfc-09 : Jean-Jacques Goldman – Envole-moi ; Gilbert Montagné – Les sunlights des tropiques ; Gold – Plus près des étoiles
- cfc-10 : Nino Ferrer – Le sud ; Barbara – L'Aigle Noir ; Serge Gainsbourg – Je suis venu te dire que je m'en vais

</details>

## Rap français : les tubes (`rap-francais-facile`)

level `easy` · decade `all` · genre `rap`

**Figé le 2026-11-01** (content/frozen-blind-tests.json : le build refuse tout changement).

| n° | Niveau visé | Artiste – titre | nb_fan | Position | Rang | Extrait | Origine |
|---|---|---|---|---|---|---|---|
| 1 | Facile | MC Solaar – Bouge de là | 306 253 | 5 | 672 859 | oui | candidat |
| 2 | Facile | Sexion d'Assaut – Wati by Night | 2 651 021 | 1 | 961 517 | oui | réserve |
| 3 | Facile | Nekfeu – On verra | 2 904 453 | 1 | 909 075 | oui | candidat |
| 4 | Facile | Kaaris – Zoo (explicite) | 2 153 526 | 1 | 920 083 | oui | réserve |
| 5 | Facile | Black M – Sur ma route | 2 699 336 | 1 | 909 409 | oui | réserve |
| 6 | Facile | Maes – Madrina (explicite) | 2 207 153 | 5 | 877 211 | oui | réserve |
| 7 | Facile | La Fouine – Jamais lâcher (explicite) | 2 126 695 | 2 | 988 659 | oui | découverte (playlist « Rap Fr | Rap Francais 2026 | Hits Rap |MAKALA, L2B ») |
| 8 | Facile | Lomepal – Trop beau (explicite) | 1 183 815 | 1 | 897 715 | oui | candidat |
| 9 | Facile | Naps – La kiffance (explicite) | 2 830 833 | 3 | 868 694 | oui | candidat |
| 10 | Facile | 13 Organisé – Bande organisée (explicite) | 381 285 | 1 | 968 734 | oui | candidat |

**Remplacements**

- n° 2 : Booba – DKR → Sexion d'Assaut – Wati by Night (réserve) ; écarté : niveau mesuré M (fans 6300300, position 16, rang 789852)
- n° 4 : PNL – Le monde ou rien → Kaaris – Zoo (réserve) ; écarté : niveau mesuré M (fans 6020915, position 12, rang 903342)
- n° 5 : Soprano – Mon Everest → Black M – Sur ma route (réserve) ; écarté : niveau mesuré M (fans 3158906, position 11, rang 797094)
- n° 6 : Niska – Réseaux → Maes – Madrina (réserve) ; écarté : niveau mesuré M (fans 4662873, position 7, rang 928311)
- n° 7 : Orelsan – Basique → La Fouine – Jamais lâcher (découverte, playlist « Rap Fr | Rap Francais 2026 | Hits Rap |MAKALA, L2B ») ; écarté : niveau mesuré M (fans 2729341, position 6, rang 902200)

<details><summary>Leurres</summary>

- rff-01 : Oxmo Puccino – L'enfant seul ; IAM – Demain, c'est loin ; Suprême NTM – Ma Benz
- rff-02 : Diam's – La Boulette (Génération Nan Nan) ; Rohff – Charisme (avec Wallen) ; Sinik – Une époque formidable
- rff-03 : Vald – Désaccordé ; A2H – Le cœur des filles ; S-Crew – J’aurais pas dû
- rff-04 : Gradur – D'or et de platine ; Niska – Chasse à l'homme ; SCH – Je la connais
- rff-05 : MZ – Les princes ; Kalash Criminel – Arrêt du cœur ; Lacrim – Ce soir ne sors pas
- rff-06 : Jul – C'est la cité ; Naza – Tout donner ; Shay – Sans Coeur
- rff-07 : Niro – Mon amour ma musique ; Alonzo – TOUT VA BIEN ; Dosseh – Habitué
- rff-08 : Makala – Saïgon ; Bigflo & Oli – Coup de vieux ; No Limit – LA RUE
- rff-09 : Mister V – Jamais ; MHD – Afro Trap Pt. 7 (La puissance) ; Rim'K – Ainsi va la rue
- rff-10 : Mister You – A Toi... ; Kofs – Ma fille ; Soso Maness – Le G

</details>

## Chansons de fête (`chansons-de-fete-facile`)

level `easy` · decade `all` · genre `chanson`

**Non figé** : en attente de validation.

| n° | Niveau visé | Artiste – titre | nb_fan | Position | Rang | Extrait | Origine |
|---|---|---|---|---|---|---|---|
| 1 | Facile (exception : mesuré non classé) | Les Quatre Barbus – Chevaliers de la table ronde | 1 595 | 3 | 310 735 | oui | candidat |
| 2 | Facile (exception : mesuré Moyen) | Georges Brassens – Le gorille | 662 189 | 7 | 636 613 | oui | candidat |
| 3 | Facile (exception : mesuré non classé) | Pierre Perret – Les jolies colonies de vacances | 77 510 | 4 | 485 387 | oui | candidat |
| 4 | Facile (exception : mesuré Difficile) | Patrick Sébastien – Les sardines | 54 793 | 2 | 725 990 | oui | candidat |
| 5 | Facile (exception : mesuré Difficile) | Annie Cordy – Tata Yoyo | 30 590 | 2 | 659 104 | oui | candidat |
| 6 | Facile | Claude François – Alexandrie Alexandra | 412 638 | 1 | 749 894 | oui | candidat |
| 7 | Facile (exception : mesuré Difficile) | Plastic Bertrand – Ça plane pour moi | 10 084 | 1 | 734 114 | oui | candidat |
| 8 | Facile (exception : mesuré Difficile) | La Compagnie Créole – Ça fait rire les oiseaux | 81 091 | 2 | 744 592 | oui | candidat |
| 9 | Facile (exception : mesuré Difficile) | Gipsy Kings – Bamboléo | 259 358 | 2 | 780 144 | oui | candidat |
| 10 | Facile | Gloria Gaynor – I Will Survive | 597 946 | 1 | 868 007 | oui | candidat |

<details><summary>Leurres</summary>

- fete-01 : Hugues Aufray – Santiano ; Corynne Charby – Boule de flipper ; Les Musclés – La fête au village
- fete-02 : Les Forbans – Chante ; Philippe Lavil – Il tape sur des bambous ; Les Négresses Vertes – Voilà l'été
- fete-03 : Michel Fugain – Fais comme l'oiseau ; Les Charlots – Merci Patron ; Licence IV – Viens boire un p'tit coup à la maison
- fete-04 : Peter & Sloane – Besoin De Rien, Envie De Toi ; Jean-Pierre Mader – Macumba ; François Feldman – Les valses de Vienne
- fete-05 : Tri Yann – La Jument De Michao ; Lio – Le banana split ; Michel Sardou – En chantant
- fete-06 : Il Etait Une Fois – J'ai encore rêvé d'elle ; Joe Dassin – Siffler sur la colline ; Jean-Luc Lahaye – Femme que j'aime
- fete-07 : Gold – Capitaine abandonné ; Matmatah – Lambé An Dro ; Zebda – Tomber la chemise
- fete-08 : Gilbert Montagné – On va s'aimer ; Magic System – Premier Gaou ; Cookie Dingler – Femme libérée
- fete-09 : Los Del Rio – Macarena ; Los Lobos – La Bamba ; Ricky Martin – María
- fete-10 : Boney M. – Rasputin ; Village People – YMCA ; Kool & The Gang – Celebration

</details>

## Années 80 : tous niveaux (`annees-80-mixte`)

level `mixed` · decade `1980` · genre `pop`

**Figé le 2026-11-01** (content/frozen-blind-tests.json : le build refuse tout changement).

| n° | Niveau visé | Artiste – titre | nb_fan | Position | Rang | Extrait | Origine |
|---|---|---|---|---|---|---|---|
| 1 | Facile | Queen – Another One Bites The Dust | 12 852 230 | 4 | 918 200 | oui | gardé |
| 2 | Facile | Bonnie Tyler – Total Eclipse of the Heart | 598 874 | 1 | 961 966 | oui | gardé |
| 3 | Moyen | Michael Jackson – The Way You Make Me Feel | 13 238 945 | 21 | 814 533 | oui | gardé |
| 4 | Moyen | Madonna – Papa Don't Preach | 4 927 526 | 23 | 683 597 | oui | gardé |
| 5 | Moyen | Depeche Mode – Everything Counts | 3 289 427 | 10 | 664 439 | oui | gardé |
| 6 | Difficile | Opus – Live Is Life | 16 666 | 1 | 771 215 | oui | gardé |
| 7 | Difficile | Men Without Hats – The Safety Dance | 10 734 | 1 | 580 137 | oui | gardé |
| 8 | Difficile | Falco – Rock Me Amadeus | 104 779 | 2 | 572 835 | oui | gardé |
| 9 | Impossible | Odyssey – Use It Up And Wear It Out | 24 178 | 8 | 208 566 | oui | découverte (playlist « Tubes oubliés des années 80 ») |
| 10 | Impossible | Samantha Fox – Naughty Girls (Need Love Too) | 22 316 | 6 | 203 683 | oui | découverte (playlist « Tubes oubliés des années 80 ») |

**Remplacements**

- n° 9 : Hit That Perfect Beat – Bronski Beat → Odyssey – Use It Up And Wear It Out (découverte, playlist « Tubes oubliés des années 80 ») ; écarté : niveau mesuré non classé (fans 197983, position 7, rang 362257)
- n° 10 : Louise – The Human League → Samantha Fox – Naughty Girls (Need Love Too) (découverte, playlist « Tubes oubliés des années 80 ») ; écarté : niveau mesuré non classé (fans 205898, position 9, rang 261786)

**Réserves écartées**

- Kajagoogoo – Hang On Now : niveau mesuré D (fans 13858, position 2, rang 176029)
- Men Without Hats – Pop Goes the World : niveau mesuré D (fans 10734, position 2, rang 357504)

<details><summary>Leurres</summary>

- a80m-01 : David Bowie – Modern Love ; Bruce Springsteen – Dancing in the Dark ; Elton John – Sacrifice
- a80m-02 : Kim Carnes – Bette Davis Eyes ; Cyndi Lauper – Time After Time ; Alphaville – Big in Japan
- a80m-03 : Stevie Wonder – Master Blaster (Jammin') ; Whitney Houston – Greatest Love of All ; Phil Collins – Sussudio
- a80m-04 : Prince – Sign 'O' the Times ; Cher – Just Like Jesse James ; Pet Shop Boys – What Have I Done to Deserve This?
- a80m-05 : The Cure – Pictures Of You ; Duran Duran – Hungry Like the Wolf ; Tears for Fears – Change
- a80m-06 : Sandra – Maria Magdalena ; Peter Schilling – Major Tom ; Secret Service – Flash In The Night
- a80m-07 : Real Life – Send Me An Angel ; Thompson Twins – Hold Me Now ; Ultravox – Vienna
- a80m-08 : Nena – Nur geträumt ; Heinz Rudolf Kunze – Dein ist mein ganzes Herz ; Hubert Kah – Sternenhimmel
- a80m-09 : Nina Hagen – My Way ; Five Star – System Addict ; Gene Loves Jezebel – The Motion of Love
- a80m-10 : Bananarama – I Want You Back ; Dead or Alive – It's Been a Long Time ; Baltimora – Running For Your Love

</details>

## Années 90 : tous niveaux (`annees-90-mixte`)

level `mixed` · decade `1990` · genre `pop`

**Figé le 2026-11-01** (content/frozen-blind-tests.json : le build refuse tout changement).

| n° | Niveau visé | Artiste – titre | nb_fan | Position | Rang | Extrait | Origine |
|---|---|---|---|---|---|---|---|
| 1 | Facile | Eiffel 65 – Blue (Da Ba Dee) | 85 362 | 1 | 873 407 | oui | candidat |
| 2 | Facile | R.E.M. – Losing My Religion | 2 671 100 | 1 | 973 013 | oui | découverte (playlist « 90s Hits ») |
| 3 | Moyen | Spice Girls – Mama | 410 990 | 8 | 534 700 | oui | candidat |
| 4 | Moyen | Britney Spears – Sometimes | 5 469 842 | 20 | 656 022 | oui | candidat |
| 5 | Moyen | Red Hot Chili Peppers – Give It Away | 7 725 611 | 10 | 790 816 | oui | candidat |
| 6 | Difficile | Whigfield – Saturday Night | 30 067 | 1 | 679 512 | oui | candidat |
| 7 | Difficile | Scatman John – Scatman (ski-ba-bop-ba-dop-bop) | 32 950 | 1 | 793 311 | oui | candidat |
| 8 | Difficile | Dr. Alban – It's My Life | 86 894 | 1 | 656 198 | oui | candidat |
| 9 | Impossible | Ocean Colour Scene – Better Day | 45 169 | 9 | 238 772 | oui | découverte (playlist « 90's One hit wonder ») |
| 10 | Impossible | Culture Beat – Crying in the Rain | 62 460 | 6 | 343 046 | oui | candidat |

**Remplacements**

- n° 2 : Chumbawamba – Tubthumping → R.E.M. – Losing My Religion (découverte, playlist « 90s Hits ») ; écarté : niveau mesuré D (fans 16771, position 1, rang 730695)
- n° 9 : Corona – Baby Baby → Ocean Colour Scene – Better Day (découverte, playlist « 90's One hit wonder ») ; écarté : niveau mesuré D (fans 77495, position 2, rang 574476)

**Réserves écartées**

- Dr. Alban – Sing Hallelujah : niveau mesuré D (fans 86894, position 2, rang 458986)
- La Bouche – Sweet Dreams : niveau mesuré D (fans 76866, position 2, rang 639457)

<details><summary>Leurres</summary>

- a90m-01 : Alice DJ – Better Off Alone ; Gala – Freed From Desire ; Soundgarden – Black Hole Sun
- a90m-02 : Oasis – Don't Look Back In Anger ; The Cranberries – Linger ; U2 – One
- a90m-03 : Christina Aguilera – Come On Over (All I Want Is You) ; Cher – Walking in Memphis ; *NSYNC – Sailing
- a90m-04 : Jennifer Lopez – Waiting for Tonight ; Madonna – Frozen ; Nirvana – All Apologies
- a90m-05 : Green Day – When I Come Around ; Guns N' Roses – Civil War ; Foo Fighters – My Hero
- a90m-06 : Real McCoy – Another Night ; Ace of Base – Beautiful Life ; 2 Brothers on the 4th Floor – Dreams (Will Come Alive)
- a90m-07 : Ann Lee – 2 Times ; Reel 2 Real – I Like to Move It ; Vengaboys – Boom, Boom, Boom, Boom!!
- a90m-08 : Playahitty – The Summer Is Magic (John Marks 2008 Radio Edit) ; 2 Unlimited – No Limit ; DJ BoBo – Let the Dream Come True
- a90m-09 : Levellers – The Devil Went Down to Georgia ; Billy Bragg – Walt Whitman's Niece ; S Club – Friday Night
- a90m-10 : Masterboy – Feel the fire ; La Bouche – You Won't Forget Me ; Corona – Don't Go Breaking My Heart

</details>

## Années 2000 : tous niveaux (`annees-2000-mixte`)

level `mixed` · decade `2000` · genre `pop`

**Figé le 2026-11-01** (content/frozen-blind-tests.json : le build refuse tout changement).

| n° | Niveau visé | Artiste – titre | nb_fan | Position | Rang | Extrait | Origine |
|---|---|---|---|---|---|---|---|
| 1 | Facile | Gnarls Barkley – Crazy | 136 252 | 1 | 900 321 | oui | gardé |
| 2 | Facile | Avril Lavigne – Complicated | 5 718 972 | 1 | 871 298 | oui | gardé |
| 3 | Moyen | Coldplay – In My Place | 18 440 893 | 16 | 809 984 | oui | gardé |
| 4 | Moyen | P!nk – Get the Party Started | 4 673 952 | 16 | 698 679 | oui | gardé |
| 5 | Moyen | Beyoncé – Baby Boy | 12 866 806 | 16 | 741 202 | oui | gardé |
| 6 | Difficile | Natasha Bedingfield – These Words | 159 155 | 3 | 620 068 | oui | gardé |
| 7 | Difficile | Crazy Frog – Axel F | 155 686 | 1 | 789 997 | oui | gardé |
| 8 | Difficile | Just Jack – Starz In Their Eyes | 25 733 | 2 | 519 376 | oui | gardé |
| 9 | Impossible | General Elektriks – Bloodshot Eyes | 42 049 | 6 | 408 037 | oui | découverte (artiste lié) |
| 10 | Impossible | Razorlight – Who Needs Love | 76 557 | 7 | 386 873 | oui | découverte (artiste lié) |

**Remplacements**

- n° 9 : An End Has a Start – Editors → General Elektriks – Bloodshot Eyes (découverte, artiste lié) ; écarté : niveau mesuré non classé (fans 240010, position 6, rang 470289)
- n° 10 : Over And Over – Hot Chip → Razorlight – Who Needs Love (découverte, artiste lié) ; écarté : niveau mesuré non classé (fans 143143, position 7, rang 467575)

**Réserves écartées**

- Vanessa Carlton – White Houses : niveau mesuré non classé (fans 55726, position 5, rang 260704)
- Natasha Bedingfield – Single : niveau mesuré non classé (fans 159155, position 17, rang 203582)

<details><summary>Leurres</summary>

- a00m-01 : M.I.A. – Paper Planes ; MGMT – Kids ; Nelly Furtado – Say It Right
- a00m-02 : The Calling – Wherever You Will Go ; Thirty Seconds to Mars – The Kill ; Kelly Clarkson – Because of You
- a00m-03 : Sia – Breathe Me ; U2 – Vertigo ; Maroon 5 – This Love
- a00m-04 : OneRepublic – All The Right Moves ; James Blunt – Same Mistake ; Christina Aguilera – Ain't No Other Man
- a00m-05 : The Pussycat Dolls – I Don't Need A Man ; Destiny's Child – Soldier ; Janet Jackson – Call On Me
- a00m-06 : Sugababes – About You Now ; Fountains of Wayne – Stacy's Mom ; La Roux – Bulletproof
- a00m-07 : Jet – Are You Gonna Be My Girl ; Laurent Wolf – No Stress ; Kevin Lyttle – Turn Me On
- a00m-08 : The Asteroids Galaxy Tour – Around the Bend ; Jack Peñate – Pull My Heart Away ; Kat DeLuna – Run The Show
- a00m-09 : Django Django – Storm ; Gush – My Favorite Song ; Outlines – Now That I'm Free
- a00m-10 : Starsailor – Alcoholic ; Gavin DeGraw – More Than Anyone ; Dead By Sunrise – Walking in Circles

</details>

## Années 2010 : tous niveaux (`annees-2010-mixte`)

level `mixed` · decade `2010` · genre `pop`

**Figé le 2026-11-01** (content/frozen-blind-tests.json : le build refuse tout changement).

| n° | Niveau visé | Artiste – titre | nb_fan | Position | Rang | Extrait | Origine |
|---|---|---|---|---|---|---|---|
| 1 | Facile | Lorde – Royals | 2 093 680 | 1 | 876 369 | oui | gardé |
| 2 | Facile | Carly Rae Jepsen – Call Me Maybe | 2 511 317 | 1 | 947 822 | oui | gardé |
| 3 | Moyen | Ed Sheeran – Lego House | 20 952 164 | 34 | 626 396 | oui | gardé |
| 4 | Moyen | The Weeknd – Die For You | 14 771 271 | 10 | 918 224 | oui | gardé |
| 5 | Moyen | Imagine Dragons – On Top Of The World | 9 555 798 | 9 | 846 652 | oui | gardé |
| 6 | Difficile | First Aid Kit – My Silver Lining | 156 140 | 1 | 793 466 | oui | gardé |
| 7 | Difficile | Cobra Starship – You Make Me Feel... | 166 178 | 1 | 784 650 | oui | gardé |
| 8 | Difficile | Michael Kiwanuka – Home Again | 221 818 | 1 | 759 517 | oui | gardé |
| 9 | Impossible | Fink – Pilgrim | 69 001 | 10 | 394 808 | oui | gardé |
| 10 | Impossible | Laura Marling – I Feel Your Love | 89 720 | 48 | 138 024 | oui | découverte (playlist « Best Folk & Indies / 2000s 2010s ») |

**Remplacements**

- n° 10 : Unconditional – Nick Mulvey → Laura Marling – I Feel Your Love (découverte, playlist « Best Folk & Indies / 2000s 2010s ») ; écarté : niveau mesuré non classé (fans 134487, position 11, rang 378733)

**Réserves écartées**

- Of Monsters and Men – Mountain Sound : niveau mesuré F (fans 561150, position 4, rang 549912)
- Bastille – Flaws : niveau mesuré M (fans 2252070, position 15, rang 440748)

<details><summary>Leurres</summary>

- a10m-01 : Suki Waterhouse – Good Looking ; Lana Del Rey – Video Games ; Harry Styles – Watermelon Sugar
- a10m-02 : Katy Perry – Dark Horse ; Taylor Swift – Shake It Off ; Lady Gaga – Bloody Mary
- a10m-03 : Shawn Mendes – Imagination ; James Blunt – Monsters ; Charlie Puth – Done for Me
- a10m-04 : Ariana Grande – One Last Time ; Coldplay – Something Just Like This ; Calvin Harris – One Kiss
- a10m-05 : Sia – The Greatest ; Maroon 5 – Maps ; Dua Lipa – Break My Heart
- a10m-06 : Iron & Wine – Call It Dreaming ; The Staves – Facing West ; José González – With The Ink Of A Ghost
- a10m-07 : Kadebostany – Castle in the Snow ; Fitz and The Tantrums – Out of My League ; Feder – Goodbye
- a10m-08 : Saint Motel – My Type ; Talisco – The Keys ; Børns – Electric Love
- a10m-09 : Half Moon Run – I Can't Figure Out What's Going On ; Villagers – The Soul Serene ; Emilíana Torrini – Autumn Sun
- a10m-10 : Smallpools – Lovetap! ; Bear's Den – The Star of Bethnal Green ; MisterWives – Queens

</details>

## Chanson française : tous niveaux (`chanson-francaise-mixte`)

level `mixed` · decade `all` · genre `chanson`

**Figé le 2026-11-01** (content/frozen-blind-tests.json : le build refuse tout changement).

| n° | Niveau visé | Artiste – titre | nb_fan | Position | Rang | Extrait | Origine |
|---|---|---|---|---|---|---|---|
| 1 | Facile | Céline Dion – Prière païenne | 3 738 362 | 3 | 963 895 | oui | gardé |
| 2 | Facile | France Gall – Ella, elle l'a | 826 518 | 1 | 928 160 | oui | gardé |
| 3 | Moyen | Jacques Brel – Mathilde | 797 027 | 8 | 642 947 | oui | gardé |
| 4 | Moyen | Serge Gainsbourg – Couleur café | 875 376 | 6 | 645 810 | oui | gardé |
| 5 | Moyen | Francis Cabrel – L'encre de tes yeux | 1 359 155 | 6 | 874 599 | oui | gardé |
| 6 | Difficile | Hervé Vilard – Capri c'est fini | 70 514 | 4 | 637 242 | oui | gardé |
| 7 | Difficile | Michel Delpech – Pour un flirt | 283 296 | 2 | 784 802 | oui | gardé |
| 8 | Difficile | Daniel Guichard – Mon vieux | 43 884 | 1 | 799 122 | oui | gardé |
| 9 | Impossible | Patrick Juvet – Faut pas rêver | 13 476 | 8 | 337 106 | oui | découverte (playlist « Années 60-70 Chansons françaises ») |
| 10 | Impossible | Le Big Bazar – Les gentils, les méchants | 7 380 | 6 | 186 971 | oui | découverte (playlist « Années 60-70 Chansons françaises ») |

**Remplacements**

- n° 9 : Les dingues et les paumés – Hubert-Félix Thiéfaine → Patrick Juvet – Faut pas rêver (découverte, playlist « Années 60-70 Chansons françaises ») ; écarté : niveau mesuré non classé (fans 230300, position 14, rang 541047)
- n° 10 : Ballade de Johnny-Jane – Jane Birkin → Le Big Bazar – Les gentils, les méchants (From "Je ne sais rien mais je dirai tout") (découverte, playlist « Années 60-70 Chansons françaises ») ; écarté : niveau mesuré non classé (fans 123447, position 6, rang 513550)

**Réserves écartées**

- Hervé Vilard – Fais-la rire : artiste déjà présent dans ce test
- Pierre Bachelet – Elle est d'ailleurs : niveau mesuré F (fans 284120, position 1, rang 850594)

<details><summary>Leurres</summary>

- cfm-01 : Johnny Hallyday – Allumer le feu ; Florent Pagny – Et un jour une femme ; Gilbert Montagné – Les sunlights des tropiques
- cfm-02 : Joe Dassin – Dans les yeux d'Émilie ; Dalida – Mourir sur scène ; Daniel Balavoine – Tous les cris les S.O.S.
- cfm-03 : Charles Aznavour – Les deux guitares ; Georges Brassens – Mourir pour des idées ; Edith Piaf – Sous le ciel de Paris
- cfm-04 : Barbara – La dame brune ; Bernard Lavilliers – La salsa ; Alain Souchon – Le bagad de Lann-Bihoué
- cfm-05 : Jean-Jacques Goldman – Au bout de mes rêves ; Eddy Mitchell – Il ne rentre pas ce soir ; Julien Clerc – Femmes... Je vous aime
- cfm-06 : Mireille Mathieu – Une femme amoureuse ; Gérard Lenorman – Michèle ; Sylvie Vartan – La plus belle pour aller danser
- cfm-07 : Michel Polnareff – Lettre à France ; Gilbert Bécaud – Et maintenant ; Nicolas Peyrac – Et mon père
- cfm-08 : Pierre Bachelet – En l'an 2001 ; Serge Lama – D'aventures en aventures ; Michel Fugain – Je n'aurai pas le temps
- cfm-09 : Dave – La décision ; Salvatore Adamo – J'avais oublié que les roses sont roses ; Stone & Charden – Il y a du soleil sur la France
- cfm-10 : Marie-Paule Belle – Je Veux Pleurer Comme Soraya ; Francis Lemarque – Quand un soldat ; Yves Simon – La Movida

</details>

## Rap français : tous niveaux (`rap-francais-mixte`)

level `mixed` · decade `all` · genre `rap`

**Figé le 2026-11-01** (content/frozen-blind-tests.json : le build refuse tout changement).

| n° | Niveau visé | Artiste – titre | nb_fan | Position | Rang | Extrait | Origine |
|---|---|---|---|---|---|---|---|
| 1 | Facile | IAM – Je danse le Mia | 781 583 | 1 | 853 410 | oui | candidat |
| 2 | Facile | Ninho – La vie qu'on mène | 9 028 656 | 2 | 969 796 | oui | candidat |
| 3 | Moyen | Damso – Autotune (explicite) | 5 157 984 | 12 | 884 344 | oui | candidat |
| 4 | Moyen | Vald – Superman (explicite) | 1 407 813 | 37 | 595 188 | oui | candidat |
| 5 | Moyen | Orelsan – Jour meilleur | 2 729 341 | 10 | 873 136 | oui | candidat |
| 6 | Difficile | La Fève – Loyal (explicite) | 243 637 | 27 | 684 770 | oui | candidat |
| 7 | Difficile | Ino Casablanca – Oranj (explicite) | 44 058 | 25 | 645 634 | oui | candidat |
| 8 | Difficile | BEN plg – Chaque jour un peu plus (explicite) | 77 486 | 16 | 736 656 | oui | candidat |
| 9 | Impossible | Juice – Sans Toi | 10 462 | 7 | 479 093 | oui | candidat |
| 10 | Impossible | Dakeez – Adrénaline | 14 143 | 11 | 512 941 | oui | candidat |

<details><summary>Leurres</summary>

- rfm-01 : Suprême NTM – Laisse pas traîner ton fils ; Oxmo Puccino – L'enfant seul ; Rohff – Qui est l'exemple ?
- rfm-02 : Gazo – KAT ; Da Uzi – Crois-moi ; Bouss – Biff pas d'love
- rfm-03 : Nekfeu – Dans l'univers ; Jok'air – Quoi de neuf bébé ; MZ – Ma substance
- rfm-04 : Georgio – Dans mon élément ; Kaaris – C'EST NOUS LES YAYA ; La Fouine – Désert
- rfm-05 : Bigflo & Oli – Sur la lune ; Columbine – Temps électrique ; Casseurs Flowters – 22h31 - Fais les backs
- rfm-06 : Moji x Sboy – Regarde-moi ; HOUDI – PAS DE PROBLÈME ; Yvnnis – MAL AIMÉS
- rfm-07 : Romsii – Opéra ; Tuerie – Là où on dort heureux ; nelick – JOYSTICK
- rfm-08 : Bekar – Quand il neigeait encore ; ISHA – Fin de ce monde ; B.B. Jacques – De la lune
- rfm-09 : Coelho – C'EST MORT ; sean – Plus jeune ; Krisy – Le toast
- rfm-10 : MadeInParis – j'ai besoin de thérapie ; USKY – Béni ; YG Pablo – Monde à dos

</details>

## Chanson française : faces cachées (`chanson-francaise-impossible`)

level `impossible` · decade `all` · genre `chanson`

**Figé le 2026-11-01** (content/frozen-blind-tests.json : le build refuse tout changement).

| n° | Niveau visé | Artiste – titre | nb_fan | Position | Rang | Extrait | Origine |
|---|---|---|---|---|---|---|---|
| 1 | Impossible | Karpatt – Pétales | 24 667 | 49 | 134 070 | oui | candidat |
| 2 | Impossible | Alexis HK – Nous | 49 997 | 49 | 122 964 | oui | candidat |
| 3 | Impossible | Yves Jamait – Les mêmes | 48 240 | 50 | 215 069 | oui | candidat |
| 4 | Impossible | Les Wriggles – Le complot | 82 779 | 18 | 220 222 | oui | candidat |
| 5 | Impossible | Volo – Pas de requiem | 42 478 | 41 | 211 939 | oui | candidat |
| 6 | Impossible | Marcel et son Orchestre – Cerf-volant | 52 107 | 41 | 72 886 | oui | candidat |
| 7 | Impossible | Carmen Maria Vega – Aigre-doux | 31 017 | 16 | 252 681 | oui | candidat |
| 8 | Impossible | Pauline Croze – Quelle heure est-il ? | 44 707 | 49 | 154 460 | oui | candidat |
| 9 | Impossible | Archimède – Hendaye | 33 535 | 28 | 232 845 | oui | candidat |
| 10 | Impossible | Les Tit' Nassels – J'écris | 26 725 | 49 | 73 871 | oui | candidat |

<details><summary>Leurres</summary>

- cfi-01 : Monsieur Roux – La vie est dure mais ta peau est douce ; Les Blerots De R.A.V.E.L. – Le vilain petit cowboy ; Mon Côté Punk – C'est peut-être
- cfi-02 : Les Elles – Tonton Amédée ; Zaza Fournier – 16 ans et demi ; Batlik – Au bord de l'abîme
- cfi-03 : Marie Cherrier – Pas D'Ma Faute ; Les Blaireaux – Le gardien de musée ; Barcella – Les fausses promesses
- cfi-04 : Oldelaf Et Monsieur D – Super héros ; Debout Sur Le Zinc – Ça va aller ; Ridan – 60 millions d'amis
- cfi-05 : SOAN – Les z'anges ; Les Ogres de Barback – Salut à toi (Chant) ; Tété – La ballade de Oogie Tsuggie (Les temps changent)
- cfi-06 : Beautés Vulgaires – Si et seulement si ; Les Caméléons – Tous à l'usine ; As de Trêfle – Aujourd'hui c'est dimanche
- cfi-07 : Féloche – Reste avec moi ; Clarika – Je ne te dirai pas ; Emily Loizeau – Le poids de l'existence
- cfi-08 : L (Raphaële Lannadère) – La Micheline ; Luce – J'Aime La Pluie ; Daphné – Portrait D'Un Vertige
- cfi-09 : Blankass – Si possible heureux (en duo avec Gauvain Sers) ; MAUSS – Je ne t'aime plus ; Kaolin – Sur le coeur
- cfi-10 : La ruelle en chantier – L'Opéra ; Le Pied De La Pompe – Je sais que tu m'aimes ; La Belle Bleue – Colère

</details>

## Rap français : faces cachées (`rap-francais-impossible`)

level `impossible` · decade `all` · genre `rap`

**Figé le 2026-11-01** (content/frozen-blind-tests.json : le build refuse tout changement).

| n° | Niveau visé | Artiste – titre | nb_fan | Position | Rang | Extrait | Origine |
|---|---|---|---|---|---|---|---|
| 1 | Impossible | Krisy – Sisyphe (explicite) | 86 371 | 24 | 356 111 | oui | gardé |
| 2 | Impossible | Hippocampe Fou – La thune de ma femme | 69 583 | 14 | 380 536 | oui | découverte (playlist « Les pépites Rap FR des Ambassadeurs ») |
| 3 | Impossible | Hologram Lo' – LV Dans Le BOLT (explicite) | 20 219 | 12 | 512 788 | oui | gardé |
| 4 | Impossible | Davodka – Au bord de l'eau | 94 625 | 9 | 493 247 | oui | gardé |
| 5 | Impossible | NeS – Tout prendre | 69 111 | 14 | 486 134 | oui | gardé |
| 6 | Impossible | Cherry Pie – Génération z (explicite) | 19 614 | 32 | 471 765 | oui | gardé |
| 7 | Impossible | GAL – Moimême (explicite) | 5 004 | 17 | 460 037 | oui | gardé |
| 8 | Impossible | Swift Guad – Comme Freud (explicite) | 60 894 | 9 | 455 097 | oui | gardé |
| 9 | Impossible | Sheldon – Les fées | 16 811 | 8 | 451 088 | oui | gardé |
| 10 | Impossible | Ol'Kainry – Penny et shaq (explicite) | 63 745 | 10 | 338 620 | oui | découverte (playlist « Fines Plumes ») |

**Remplacements**

- n° 2 : L'autre univers – Lujipeka → Hippocampe Fou – La thune de ma femme (découverte, playlist « Les pépites Rap FR des Ambassadeurs ») ; écarté : niveau mesuré non classé (fans 223171, position 34, rang 492510)
- n° 10 : Freestyle d'amour – Houdi → Ol'Kainry – PENNY ET SHAQ (découverte, playlist « Fines Plumes ») ; écarté : niveau mesuré non classé (fans 118904, position 45, rang 447086)

<details><summary>Leurres</summary>

- rfi-01 : sean – Les crocodiles ; Tuerie – Numéro Vert ; Juice – Apogée
- rfi-02 : Malo – MÉDICATION ; Coelho – PERDU DANS LE VENT ; Jewel Usain – Les journées se ressemblent
- rfi-03 : Al-Walid – Le thème ; Tedax Max – Sirènes ; B.B. Jacques – PÉTALES
- rfi-04 : James Loup – J'VOULAIS ÊTRE GRAND ; Ikaz Boi – 46 ET DEMI ; MadeInParis – Le monde est à toi
- rfi-05 : Wallace Cleaver – Le cœur à papa ; Zuukou mayzie – La Bible, dans Fury ; Yvnnis – Pas du genre a guinguin
- rfi-06 : Lucci – C'est des faux ; Nelick – Fille que j'aime ; Jeune Lion – Lion le tsunami
- rfi-07 : Sopico – La nuit ; Souffrance – À plus tard ; Myth Syzer – Toujours un peu froid
- rfi-08 : Celestino – les photos du frigo ; USKY – Le jour d'après ; Mademoiselle Lou – Les voix
- rfi-09 : ISHA – Tard le soir ; Arma Jackson – Été sans fin ; 808noche – Argentée
- rfi-10 : Gen – PLUS RIEN ; Lyele – €€€ ; 34murphy – j'reviens d'en bas

</details>

