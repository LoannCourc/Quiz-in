# Relecture : saisie libre

Pour chaque question, la réponse attendue et les variantes acceptées quand les joueurs **tapent** leur réponse
(mode Réponse libre). À compléter dans `content/quizzes/*.json`, puis `npm run build` et réimport.

## Ce que la correction automatique accepte déjà

- Majuscules, accents, ponctuation et espaces ignorés ; article initial retiré (le, la, les, l', un, une, des, du, de la, the) ;
  « & », « and » et « et » équivalents.
- Fautes de frappe : une à partir de 5 lettres, deux à partir de 10 lettres.
- Réponse « proche » (une faute de plus, ou l'une contient l'autre : « Hugo » pour « Victor Hugo ») : **refusée**,
  mais mise en évidence pour l'hôte en Contrôle, qui peut l'accepter.
- Blind test : le titre (aussi sans sa parenthèse), l'artiste, et leurs alias (`music.titleAliases`, `music.artistAliases`).

## Comment ajouter une variante

- Quiz classique : ajouter le texte dans `acceptedAnswers` (par exemple le nom seul, le nombre en chiffres et en lettres).
  Le build refuse une variante qui ferait accepter une mauvaise proposition.
- Blind test : ajouter un alias dans `music.titleAliases` ou `music.artistAliases`.

## Signalements

7 questions classiques sur 150 sont signalées :

- **définition** : la réponse est une phrase (« Ne pas venir à un rendez-vous »). Des variantes courtes existent déjà
  (« ne pas venir », « faire faux bond ») : vérifier qu'elles couvrent ce que les joueurs taperont.
- **longue** : même la variante la plus courte fait 4 mots ou plus, difficile à taper à l'identique.
- **nombre** : seulement en chiffres ou seulement en lettres ; ajouter l'autre écriture (les années ne sont pas signalées).
- **nom propre** : question sur une personne, une seule écriture acceptée ; ajouter le nom seul si on veut
  l'accepter sans Contrôle (avec Contrôle, il apparaît « à vérifier » pour l'hôte).

## Quiz classiques

### Cinéma : les films cultes (`cinema-films-cultes`)

| # | Question | Réponse attendue | Variantes acceptées | À revoir |
|---|---|---|---|---|
| 1 | Dans « Titanic » (1997), quel acteur incarne Jack Dawson ? | **Leonardo DiCaprio** | leonardo dicaprio · dicaprio |  |
| 2 | Quel réalisateur a signé « Les Dents de la mer » (1975) ? | **Steven Spielberg** | steven spielberg · spielberg |  |
| 3 | Dans « Le Fabuleux Destin d'Amélie Poulain », dans quel quartier de Paris vit Amélie ? | **Montmartre** | montmartre |  |
| 4 | Dans « Retour vers le futur », quelle voiture sert de machine à remonter le temps ? | **Une DeLorean** | delorean · de lorean · dmc delorean |  |
| 5 | Dans « Le Seigneur des anneaux », quel hobbit porte l'Anneau jusqu'au Mordor ? | **Frodon** | frodon · frodo · frodon sacquet |  |
| 6 | Quel film français de 2011 raconte l'amitié entre un riche tétraplégique et son aide à domicile ? | **Intouchables** | intouchables · les intouchables |  |
| 7 | Dans quel film de la saga « Star Wars » Dark Vador révèle-t-il à Luke qu'il est son père ? | **L'Empire contre-attaque** | l'empire contre-attaque · empire contre-attaque · episode 5 · episode v |  |
| 8 | Quel acteur incarne Hannibal Lecter dans « Le Silence des agneaux » (1991) ? | **Anthony Hopkins** | anthony hopkins · hopkins |  |
| 9 | Combien d'Oscars le film « Titanic » a-t-il remportés ? | **11** | 11 · onze |  |
| 10 | Qui joue le capitaine Jack Sparrow dans « Pirates des Caraïbes » ? | **Johnny Depp** | johnny depp · depp |  |

### Cuisine et gastronomie (`cuisine-gastronomie`)

| # | Question | Réponse attendue | Variantes acceptées | À revoir |
|---|---|---|---|---|
| 1 | Quel est l'ingrédient principal du guacamole ? | **L'avocat** | avocat · l'avocat · avocats |  |
| 2 | De quelle région française la choucroute est-elle la grande spécialité ? | **L'Alsace** | alsace · l'alsace |  |
| 3 | Quel fromage est indispensable à une tartiflette ? | **Le reblochon** | reblochon · le reblochon |  |
| 4 | Quelle épice, l'une des plus chères au monde, provient d'une fleur de crocus ? | **Le safran** | safran · le safran |  |
| 5 | Quelle sauce associe jaunes d'œufs, beurre, échalote, vinaigre et estragon ? | **La béarnaise** | béarnaise · sauce béarnaise · la béarnaise |  |
| 6 | De quel pays les sushis sont-ils la spécialité emblématique ? | **Le Japon** | japon · le japon |  |
| 7 | En cuisine, que désigne une « julienne » ? | **Des légumes taillés en fins bâtonnets** | légumes en bâtonnets · des légumes taillés en fins bâtonnets · fins bâtonnets · bâtonnets |  |
| 8 | Quel gâteau breton porte un nom qui signifie « gâteau au beurre » ? | **Le kouign-amann** | kouign-amann · kouign amann |  |
| 9 | Le canelé, petit gâteau parfumé au rhum et à la vanille, est une spécialité de quelle ville ? | **Bordeaux** | bordeaux |  |
| 10 | Quel légume donne au bortsch sa couleur rouge ? | **La betterave** | betterave · la betterave |  |

### Culture générale : les bases (`culture-generale-1`)

| # | Question | Réponse attendue | Variantes acceptées | À revoir |
|---|---|---|---|---|
| 1 | Quelle planète est la plus proche du Soleil ? | **Mercure** | mercure |  |
| 2 | Combien de pattes a une araignée ? | **8** | 8 · huit |  |
| 3 | Quel est le plus long fleuve de France ? | **La Loire** | loire |  |
| 4 | Quelle est la capitale de l'Italie ? | **Rome** | rome |  |
| 5 | Quel est le plus grand océan du monde ? | **Le Pacifique** | pacifique · océan pacifique |  |
| 6 | Qui a peint La Joconde ? | **Léonard de Vinci** | léonard de vinci · de vinci · vinci |  |
| 7 | En quelle année un homme a-t-il marché sur la Lune pour la première fois ? | **1969** | 1969 |  |
| 8 | Quel est le symbole chimique de l'or ? | **Au** | au |  |
| 9 | Combien de joueurs une équipe de football a-t-elle sur le terrain ? | **11** | 11 · onze |  |
| 10 | Quel est le plus grand animal du monde ? | **La baleine bleue** | baleine bleue · rorqual bleu · baleine |  |

### Dessins animés et Disney (`dessins-animes-disney`)

| # | Question | Réponse attendue | Variantes acceptées | À revoir |
|---|---|---|---|---|
| 1 | Dans « Le Roi lion », comment s'appelle le jeune lion ? | **Simba** | simba |  |
| 2 | Quelle petite fée accompagne Peter Pan ? | **La fée Clochette** | clochette · fée clochette · la fée clochette |  |
| 3 | Dans « La Reine des neiges », comment s'appelle le bonhomme de neige ? | **Olaf** | olaf |  |
| 4 | Quel animal est Dumbo ? | **Un éléphant** | éléphant · un éléphant · éléphanteau · un éléphanteau |  |
| 5 | Dans « Toy Story », comment s'appelle le cow-boy ? | **Woody** | woody · shérif woody |  |
| 6 | Dans « Le Monde de Nemo », quel poisson est Nemo ? | **Un poisson-clown** | poisson-clown · un poisson-clown |  |
| 7 | Comment s'appelle la souris la plus célèbre de Disney ? | **Mickey** | mickey · mickey mouse |  |
| 8 | Dans « Cendrillon », en quoi la fée transforme-t-elle la citrouille ? | **En carrosse** | carrosse · un carrosse · en carrosse |  |
| 9 | Dans « Aladdin », comment s'appelle le petit singe d'Aladdin ? | **Abu** | abu |  |
| 10 | Comment s'appellent les petits personnages jaunes de « Moi, moche et méchant » ? | **Les Minions** | minions · les minions |  |

### Géographie de la France (`geographie-france`)

| # | Question | Réponse attendue | Variantes acceptées | À revoir |
|---|---|---|---|---|
| 1 | Quelle est la plus haute montagne de France ? | **Le mont Blanc** | mont blanc · le mont blanc |  |
| 2 | Quelle ville est surnommée la « Ville rose » ? | **Toulouse** | toulouse |  |
| 3 | Quelle mer borde la ville de Marseille ? | **La mer Méditerranée** | méditerranée · mer méditerranée · la méditerranée |  |
| 4 | Quel fleuve traverse Paris ? | **La Seine** | seine · la seine |  |
| 5 | Quelle ville est le chef-lieu de la région Bretagne ? | **Rennes** | rennes |  |
| 6 | Dans quelle région se trouve le Mont-Saint-Michel ? | **La Normandie** | normandie · la normandie |  |
| 7 | Quelle chaîne de montagnes sépare la France de l'Espagne ? | **Les Pyrénées** | pyrénées · les pyrénées |  |
| 8 | Quelle île est surnommée l'« île de Beauté » ? | **La Corse** | corse · la corse |  |
| 9 | Avec combien de pays la France métropolitaine partage-t-elle une frontière terrestre ? | **8** | 8 · huit |  |
| 10 | Après Paris, quelle est la ville la plus peuplée de France ? | **Marseille** | marseille |  |

### Géographie du monde (`geographie-monde`)

| # | Question | Réponse attendue | Variantes acceptées | À revoir |
|---|---|---|---|---|
| 1 | Quel est le plus long fleuve d'Afrique ? | **Le Nil** | nil · le nil |  |
| 2 | Quelle est la capitale de l'Australie ? | **Canberra** | canberra |  |
| 3 | Dans quel pays se trouve le site inca du Machu Picchu ? | **Le Pérou** | pérou · le pérou |  |
| 4 | Quelle est la capitale du Canada ? | **Ottawa** | ottawa |  |
| 5 | Quel est le plus haut sommet du monde ? | **L'Everest** | everest · l'everest · mont everest |  |
| 6 | Quel est le plus grand désert chaud du monde ? | **Le Sahara** | sahara · le sahara |  |
| 7 | Quelle est la capitale de la Nouvelle-Zélande ? | **Wellington** | wellington |  |
| 8 | Quel détroit sépare l'Espagne du Maroc ? | **Le détroit de Gibraltar** | gibraltar · détroit de gibraltar |  |
| 9 | Quel est le plus grand pays du monde par sa superficie ? | **La Russie** | russie · la russie |  |
| 10 | Dans quel pays se trouve la ville de Tombouctou ? | **Le Mali** | mali · le mali |  |

### Histoire de France (`histoire-de-france`)

| # | Question | Réponse attendue | Variantes acceptées | À revoir |
|---|---|---|---|---|
| 1 | En quelle année a eu lieu la prise de la Bastille ? | **1789** | 1789 |  |
| 2 | Quel roi de France était surnommé le « Roi-Soleil » ? | **Louis XIV** | louis xiv · louis 14 · louis quatorze |  |
| 3 | En quelle année Jeanne d'Arc a-t-elle été brûlée à Rouen ? | **1431** | 1431 |  |
| 4 | Quel traité, signé en 1919, met fin à la Première Guerre mondiale entre les Alliés et l'Allemagne ? | **Le traité de Versailles** | traité de versailles · versailles |  |
| 5 | Quel roi de France remporte la bataille de Marignan en 1515 ? | **François Ier** | françois ier · françois 1er · françois premier · françois 1 |  |
| 6 | Quel édit, signé par Henri IV en 1598, accorde des droits aux protestants ? | **L'édit de Nantes** | édit de nantes · nantes |  |
| 7 | Quelle ordonnance de 1539 impose l'usage du français dans les actes officiels ? | **L'ordonnance de Villers-Cotterêts** | villers-cotterêts · ordonnance de villers-cotterêts |  |
| 8 | En quelle année les Françaises ont-elles voté pour la première fois ? | **1945** | 1945 |  |
| 9 | Quelle victoire de Philippe Auguste, en 1214, renforce le pouvoir royal ? | **Bouvines** | bouvines · bataille de bouvines |  |
| 10 | En quelle année Napoléon Bonaparte est-il sacré empereur ? | **1804** | 1804 |  |

### Jeux vidéo (`jeux-video`)

| # | Question | Réponse attendue | Variantes acceptées | À revoir |
|---|---|---|---|---|
| 1 | Quel plombier moustachu est la mascotte de Nintendo ? | **Mario** | mario · super mario |  |
| 2 | Dans « Pac-Man », que mange le héros en parcourant le labyrinthe ? | **Des pac-gommes** | pac-gommes · des pac-gommes · pac-gomme · gommes · pastilles |  |
| 3 | Dans « Tetris », de combien de carrés chaque pièce est-elle formée ? | **4** | 4 · quatre |  |
| 4 | Dans « The Legend of Zelda », comment s'appelle le héros que l'on dirige ? | **Link** | link |  |
| 5 | Dans « Minecraft », quelle créature verte explose quand elle s'approche du joueur ? | **Le Creeper** | creeper · le creeper |  |
| 6 | Dans « Pokémon », de quel type est Pikachu ? | **Électrik** | électrik · électrique |  |
| 7 | Quelle princesse Mario doit-il souvent sauver des griffes de Bowser ? | **Peach** | peach · princesse peach |  |
| 8 | Dans quelle série de jeux incarne-t-on l'aventurière Lara Croft ? | **Tomb Raider** | tomb raider |  |
| 9 | En quelle année la première Game Boy est-elle sortie au Japon ? | **1989** | 1989 |  |
| 10 | Quelle entreprise française est à l'origine de la série « Assassin's Creed » ? | **Ubisoft** | ubisoft |  |

### Langue française : expressions et orthographe (`langue-francaise`)

| # | Question | Réponse attendue | Variantes acceptées | À revoir |
|---|---|---|---|---|
| 1 | Que signifie l'expression « poser un lapin » ? | **Ne pas venir à un rendez-vous** | ne pas venir à un rendez-vous · ne pas venir · faire faux bond | définition |
| 2 | Que désigne le mot « thuriféraire » au sens figuré ? | **Un flatteur, un admirateur zélé** | un flatteur, un admirateur zélé · flatteur · un flatteur · admirateur · adulateur |  |
| 3 | Que signifie « tirer les vers du nez » à quelqu'un ? | **Le faire parler pour obtenir des secrets** | le faire parler pour obtenir des secrets · le faire parler · faire parler · obtenir des secrets · soutirer des informations | définition |
| 4 | Quel est le pluriel de « cheval » ? | **Des chevaux** | chevaux · des chevaux |  |
| 5 | Combien de « p » faut-il pour écrire « hippopotame » ? | **Trois** | trois · 3 |  |
| 6 | Quel mot désigne l'obligation de choisir entre deux solutions aussi difficiles l'une que l'autre ? | **Un dilemme** | dilemme |  |
| 7 | Que signifie l'adjectif « sibyllin » ? | **Obscur, difficile à comprendre** | obscur, difficile à comprendre · obscur · énigmatique · mystérieux · difficile à comprendre | définition |
| 8 | Que signifie l'expression « faire chou blanc » ? | **Échouer, ne rien obtenir** | échouer, ne rien obtenir · échouer · ne rien obtenir · rater · échec | définition |
| 9 | Quel est le féminin du nom « vengeur » ? | **Vengeresse** | vengeresse · une vengeresse |  |
| 10 | Quelle figure de style consiste à exagérer volontairement, comme dans « mourir de rire » ? | **L'hyperbole** | hyperbole · l'hyperbole |  |

### Musique : culture et histoire (`musique-culture`)

| # | Question | Réponse attendue | Variantes acceptées | À revoir |
|---|---|---|---|---|
| 1 | Combien de cordes compte une guitare classique ? | **6** | 6 · six |  |
| 2 | Quel groupe britannique réunissait John, Paul, George et Ringo ? | **Les Beatles** | beatles · les beatles · the beatles |  |
| 3 | Quel compositeur, devenu sourd, a écrit la Neuvième Symphonie et son « Ode à la joie » ? | **Beethoven** | beethoven · ludwig van beethoven |  |
| 4 | Combien de touches compte un piano classique moderne ? | **88** | 88 · quatre-vingt-huit |  |
| 5 | Quelle chanteuse française était surnommée « la Môme » ? | **Édith Piaf** | édith piaf · piaf |  |
| 6 | Combien de lignes compte une portée de musique ? | **5** | 5 · cinq |  |
| 7 | De quel pays le compositeur Frédéric Chopin était-il originaire ? | **La Pologne** | pologne · la pologne |  |
| 8 | Quel chanteur américain était surnommé le « King » du rock'n'roll ? | **Elvis Presley** | elvis presley · elvis · presley |  |
| 9 | De quel instrument jouait principalement le jazzman Miles Davis ? | **La trompette** | trompette · la trompette |  |
| 10 | Qui a composé « La Marseillaise » ? | **Rouget de Lisle** | rouget de lisle · claude joseph rouget de lisle |  |

### Pour les experts : culture pointue (`culture-pointue`)

| # | Question | Réponse attendue | Variantes acceptées | À revoir |
|---|---|---|---|---|
| 1 | Quel est le plus petit État du monde par sa superficie ? | **Le Vatican** | vatican · le vatican · cité du vatican |  |
| 2 | Qui a écrit « À la recherche du temps perdu » ? | **Marcel Proust** | marcel proust · proust |  |
| 3 | Quel peintre a réalisé « La Persistance de la mémoire », le tableau aux montres molles ? | **Salvador Dalí** | salvador dalí · dalí |  |
| 4 | Quelle est la capitale de la Mongolie ? | **Oulan-Bator** | oulan-bator · oulan bator · ulaanbaatar |  |
| 5 | Combien de faces possède un icosaèdre ? | **20** | 20 · vingt |  |
| 6 | Quel philosophe grec fut le précepteur d'Alexandre le Grand ? | **Aristote** | aristote |  |
| 7 | Quel compositeur français a écrit le « Boléro » ? | **Maurice Ravel** | maurice ravel · ravel |  |
| 8 | En quelle année le mur de Berlin est-il tombé ? | **1989** | 1989 |  |
| 9 | Quel élément chimique a pour symbole la lettre W ? | **Le tungstène** | tungstène · le tungstène · wolfram |  |
| 10 | Quel écrivain colombien a écrit « Cent ans de solitude » ? | **Gabriel García Márquez** | gabriel garcía márquez · garcía márquez · márquez |  |

### Sciences et nature (`sciences-nature`)

| # | Question | Réponse attendue | Variantes acceptées | À revoir |
|---|---|---|---|---|
| 1 | Quel gaz les plantes absorbent-elles pour réaliser la photosynthèse ? | **Le dioxyde de carbone** | dioxyde de carbone · co2 · gaz carbonique |  |
| 2 | Quel gaz forme la couche qui protège la Terre d'une grande partie des rayons ultraviolets ? | **L'ozone** | ozone · l'ozone |  |
| 3 | Combien d'os compte le squelette d'un adulte ? | **206** | 206 | nombre : en lettres aussi ? |
| 4 | Quelle est la plus grande planète du système solaire ? | **Jupiter** | jupiter |  |
| 5 | Combien de chromosomes contient une cellule humaine ordinaire (hors cellules reproductrices) ? | **46** | 46 · quarante-six |  |
| 6 | Quel organe du corps humain produit l'insuline ? | **Le pancréas** | pancréas · le pancréas |  |
| 7 | À quelle vitesse la lumière se déplace-t-elle dans le vide, environ ? | **300 000 km/s** | 300 000 km/s · 300 000 · 300000 | nombre : en lettres aussi ? |
| 8 | Quel scientifique a découvert la pénicilline, le premier antibiotique ? | **Alexander Fleming** | alexander fleming · fleming |  |
| 9 | Quel est l'élément chimique le plus abondant dans l'Univers ? | **L'hydrogène** | hydrogène · l'hydrogène |  |
| 10 | Comment appelle-t-on un animal qui se nourrit à la fois de plantes et de viande ? | **Un omnivore** | omnivore · un omnivore |  |

### Séries cultes (`series-cultes`)

| # | Question | Réponse attendue | Variantes acceptées | À revoir |
|---|---|---|---|---|
| 1 | Dans « Friends », dans quelle ville vivent les six amis ? | **New York** | new york · manhattan |  |
| 2 | Dans « Game of Thrones », comment s'appelle le trône que se disputent les grandes familles ? | **Le Trône de fer** | trône de fer · le trône de fer |  |
| 3 | Dans « Breaking Bad », quel métier exerce Walter White au début de la série ? | **Professeur de chimie** | professeur de chimie · prof de chimie · professeur |  |
| 4 | Dans « Les Simpson », quel est le prénom du père de famille ? | **Homer** | homer · homer simpson |  |
| 5 | Dans « Kaamelott », quel personnage est le roi de Bretagne ? | **Arthur** | arthur · le roi arthur |  |
| 6 | Dans la série « Lupin » (2021), quel acteur incarne Assane Diop ? | **Omar Sy** | omar sy | nom propre : nom seul ? |
| 7 | Dans la version américaine de « The Office », dans quelle ville se trouve l'agence Dunder Mifflin ? | **Scranton** | scranton |  |
| 8 | Quelle série britannique suit le gang des Shelby à Birmingham, après la Première Guerre mondiale ? | **Peaky Blinders** | peaky blinders |  |
| 9 | Dans la série « Sherlock » de la BBC, quel acteur joue Sherlock Holmes ? | **Benedict Cumberbatch** | benedict cumberbatch · cumberbatch |  |
| 10 | Combien de saisons compte la série « Friends » ? | **10** | 10 · dix |  |

### Spécial enfants : les animaux (`enfants-animaux`)

| # | Question | Réponse attendue | Variantes acceptées | À revoir |
|---|---|---|---|---|
| 1 | Quel animal fait « meuh » ? | **La vache** | vache · la vache |  |
| 2 | Comment appelle-t-on le bébé de la poule ? | **Le poussin** | poussin · le poussin |  |
| 3 | Quel est l'animal le plus rapide à la course ? | **Le guépard** | guépard · le guépard |  |
| 4 | Quel petit animal à coquille laisse une trace brillante derrière lui ? | **L'escargot** | escargot · l'escargot |  |
| 5 | Combien de pattes a un insecte ? | **6** | 6 · six |  |
| 6 | Où vit le manchot empereur ? | **En Antarctique** | antarctique · en antarctique · pôle sud · au pôle sud |  |
| 7 | Comment appelle-t-on le bébé du cheval ? | **Le poulain** | poulain · le poulain |  |
| 8 | Comment s'appelle la maison des abeilles ? | **La ruche** | ruche · la ruche |  |
| 9 | Quel reptile peut changer de couleur ? | **Le caméléon** | caméléon · le caméléon |  |
| 10 | Quel mammifère sait voler comme un oiseau ? | **La chauve-souris** | chauve-souris · la chauve-souris |  |

### Sport : grands moments (`sport-grands-moments`)

| # | Question | Réponse attendue | Variantes acceptées | À revoir |
|---|---|---|---|---|
| 1 | Tous les combien d'années ont lieu les Jeux olympiques d'été ? | **4 ans** | 4 ans · 4 · quatre ans · quatre |  |
| 2 | En quelle année la France a-t-elle remporté sa première Coupe du monde de football ? | **1998** | 1998 |  |
| 3 | Dans quel sport parle-t-on d'« albatros » pour un coup réussi ? | **Le golf** | golf · le golf |  |
| 4 | Quel tournoi du Grand Chelem de tennis se joue sur terre battue ? | **Roland-Garros** | roland-garros · roland garros |  |
| 5 | Quelle couleur de maillot porte le leader du classement général du Tour de France ? | **Le jaune** | jaune · maillot jaune · le jaune |  |
| 6 | Quel athlète jamaïcain remporte le 100 mètres aux Jeux olympiques de Pékin, en 2008 ? | **Usain Bolt** | usain bolt · bolt |  |
| 7 | Combien de points vaut un essai au rugby à XV ? | **5** | 5 · cinq |  |
| 8 | Quel nageur américain remporte huit médailles d'or aux Jeux olympiques de Pékin, en 2008 ? | **Michael Phelps** | michael phelps · phelps |  |
| 9 | En quelle année ont eu lieu les premiers Jeux olympiques modernes, à Athènes ? | **1896** | 1896 |  |
| 10 | Quel pilote français a été quatre fois champion du monde de Formule 1 ? | **Alain Prost** | alain prost · prost |  |

## Blind tests

En Réponse libre, la question demande le titre, l'artiste, ou les deux (`ask`) ; avec « les deux », chaque partie juste
rapporte la moitié des points. Les alias ajoutés couvrent les surnoms et noms seuls courants.

### Années 2000 (`annees-2000`)

| # | Demande | Titre | Artiste | Alias |
|---|---|---|---|---|
| 1 | Titre | Hips Don't Lie | Shakira |  |
| 2 | Artiste | Toxic | Britney Spears | Britney |
| 3 | Titre | I Gotta Feeling | The Black Eyed Peas |  |
| 4 | Artiste | Viva la Vida | Coldplay |  |
| 5 | Titre | One More Time | Daft Punk |  |
| 6 | Artiste | Can't Get You Out of My Head | Kylie Minogue | Kylie |
| 7 | Titre | On s'attache | Christophe Maé |  |
| 8 | Artiste | Umbrella | Rihanna |  |
| 9 | Titre | Aserejé | Las Ketchup |  |
| 10 | Artiste | Crazy | Gnarls Barkley |  |

### Années 2010 (`annees-2010`)

| # | Demande | Titre | Artiste | Alias |
|---|---|---|---|---|
| 1 | Titre | Happy | Pharrell Williams |  |
| 2 | Artiste | Rolling in the Deep | Adele |  |
| 3 | Titre | Despacito | Luis Fonsi |  |
| 4 | Artiste | Shape of You | Ed Sheeran |  |
| 5 | Titre | Wake Me Up | Avicii |  |
| 6 | Artiste | Est-ce que tu m'aimes ? | Maître Gims | Gims |
| 7 | Titre | Gangnam Style | PSY |  |
| 8 | Artiste | Jour 1 | Louane |  |
| 9 | Titre | Believer | Imagine Dragons |  |
| 10 | Artiste | Get Lucky | Daft Punk |  |

### Années 80 (`annees-80`)

| # | Demande | Titre | Artiste | Alias |
|---|---|---|---|---|
| 1 | Titre | Billie Jean | Michael Jackson |  |
| 2 | Artiste | Take On Me | a-ha | Aha |
| 3 | Titre | Girls Just Want to Have Fun | Cyndi Lauper |  |
| 4 | Artiste | The Final Countdown | Europe |  |
| 5 | Titre | La Isla Bonita | Madonna |  |
| 6 | Artiste | Wake Me Up Before You Go-Go | Wham! |  |
| 7 | Titre | Voyage, voyage | Desireless |  |
| 8 | Artiste | Quand la musique est bonne | Jean-Jacques Goldman | Goldman · JJ Goldman |
| 9 | Titre | Africa | Toto |  |
| 10 | Artiste | Eye of the Tiger | Survivor |  |

### Années 90 (`annees-90`)

| # | Demande | Titre | Artiste | Alias |
|---|---|---|---|---|
| 1 | Titre | What Is Love | Haddaway |  |
| 2 | Artiste | Wannabe | Spice Girls |  |
| 3 | Titre | Livin' la Vida Loca | Ricky Martin |  |
| 4 | Artiste | Believe | Cher |  |
| 5 | Titre | The Sign | Ace of Base |  |
| 6 | Artiste | Tu m'oublieras | Larusso |  |
| 7 | Titre | Wonderwall | Oasis |  |
| 8 | Artiste | I Will Always Love You | Whitney Houston | Whitney |
| 9 | Titre | I Want It That Way | Backstreet Boys |  |
| 10 | Artiste | Freed from Desire | Gala |  |

### Chanson française (`chansons-francaises`)

| # | Demande | Titre | Artiste | Alias |
|---|---|---|---|---|
| 1 | Titre | Les Copains d'abord | Georges Brassens |  |
| 2 | Artiste | Ne me quitte pas | Jacques Brel | Brel |
| 3 | Titre | L'Aigle noir | Barbara |  |
| 4 | Artiste | Emmenez-moi | Charles Aznavour | Aznavour |
| 5 | Titre | Le Poinçonneur des Lilas | Serge Gainsbourg |  |
| 6 | Artiste | La Montagne | Jean Ferrat | Ferrat |
| 7 | Titre | Les Lacs du Connemara | Michel Sardou |  |
| 8 | Artiste | Paroles, paroles | Dalida |  |
| 9 | Titre | Mistral gagnant | Renaud |  |
| 10 | Artiste | Non, je ne regrette rien | Édith Piaf | Piaf |

### Disco et funk (`disco-funk`)

| # | Demande | Titre | Artiste | Alias |
|---|---|---|---|---|
| 1 | Titre | I Will Survive | Gloria Gaynor |  |
| 2 | Artiste | Stayin' Alive | Bee Gees |  |
| 3 | Titre | Le Freak | Chic |  |
| 4 | Artiste | September | Earth, Wind & Fire | EWF |
| 5 | Titre | Born to Be Alive | Patrick Hernandez |  |
| 6 | Artiste | We Are Family | Sister Sledge |  |
| 7 | Titre | Superstition | Stevie Wonder |  |
| 8 | Artiste | Funkytown | Lipps Inc. |  |
| 9 | Titre | Don't Stop 'Til You Get Enough | Michael Jackson |  |
| 10 | Artiste | I Feel Love | Donna Summer |  |

### Hits de l'été (`hits-ete`)

| # | Demande | Titre | Artiste | Alias |
|---|---|---|---|---|
| 1 | Titre | Lambada | Kaoma |  |
| 2 | Artiste | Macarena | Los del Río |  |
| 3 | Titre | Dragostea din tei | O-Zone |  |
| 4 | Artiste | Mambo No. 5 | Lou Bega |  |
| 5 | Titre | Premier Gaou | Magic System |  |
| 6 | Artiste | Cheerleader | OMI |  |
| 7 | Titre | Makeba | Jain |  |
| 8 | Artiste | In the Summertime | Mungo Jerry |  |
| 9 | Titre | Summer | Calvin Harris |  |
| 10 | Artiste | Hello | Martin Solveig |  |

### Pop internationale (`pop-internationale`)

| # | Demande | Titre | Artiste | Alias |
|---|---|---|---|---|
| 1 | Titre | Dancing Queen | ABBA |  |
| 2 | Artiste | I'm Still Standing | Elton John | Elton |
| 3 | Titre | Just the Way You Are | Bruno Mars |  |
| 4 | Artiste | Roar | Katy Perry |  |
| 5 | Titre | Shake It Off | Taylor Swift |  |
| 6 | Artiste | Don't Start Now | Dua Lipa |  |
| 7 | Titre | Blinding Lights | The Weeknd |  |
| 8 | Artiste | Hung Up | Madonna |  |
| 9 | Titre | Angels | Robbie Williams |  |
| 10 | Artiste | Someone You Loved | Lewis Capaldi |  |

### Rap français (`rap-francais`)

| # | Demande | Titre | Artiste | Alias |
|---|---|---|---|---|
| 1 | Titre | Caroline | MC Solaar |  |
| 2 | Artiste | Je danse le Mia | IAM | I Am |
| 3 | Titre | Angela | Saïan Supa Crew |  |
| 4 | Artiste | Ma France à moi | Diam's | Diams |
| 5 | Titre | Gibraltar | Abd al Malik |  |
| 6 | Artiste | Dommage | Bigflo & Oli |  |
| 7 | Titre | Cosmo | Soprano |  |
| 8 | Artiste | Avant qu'elle parte | Sexion d'Assaut |  |
| 9 | Titre | La terre est ronde | Orelsan |  |
| 10 | Artiste | Sur ma route | Black M |  |

### Rock : les classiques (`rock-classiques`)

| # | Demande | Titre | Artiste | Alias |
|---|---|---|---|---|
| 1 | Titre | We Will Rock You | Queen |  |
| 2 | Artiste | Back in Black | AC/DC | ACDC |
| 3 | Titre | (I Can't Get No) Satisfaction | The Rolling Stones |  |
| 4 | Artiste | Smoke on the Water | Deep Purple |  |
| 5 | Titre | Hey Jude | The Beatles |  |
| 6 | Artiste | Sultans of Swing | Dire Straits |  |
| 7 | Titre | Sweet Child O' Mine | Guns N' Roses | Guns and Roses |
| 8 | Artiste | Come as You Are | Nirvana |  |
| 9 | Titre | Sweet Home Alabama | Lynyrd Skynyrd |  |
| 10 | Artiste | With or Without You | U2 |  |

### Tubes francophones (`tubes-francophones`)

| # | Demande | Titre | Artiste | Alias |
|---|---|---|---|---|
| 1 | Les deux | La vie en rose | Édith Piaf | Piaf |
| 2 | Les deux | Les Champs-Élysées | Joe Dassin |  |
| 3 | Les deux | Que je t'aime | Johnny Hallyday | Johnny |
| 4 | Les deux | Alexandrie Alexandra | Claude François | Cloclo |
| 5 | Les deux | Ella, elle l'a | France Gall |  |
| 6 | Les deux | Pour que tu m'aimes encore | Céline Dion | Céline |
| 7 | Les deux | Alors on danse | Stromae |  |
| 8 | Les deux | Je veux | Zaz |  |
| 9 | Les deux | Dernière danse | Indila |  |
| 10 | Les deux | Andalouse | Kendji Girac | Kendji |
