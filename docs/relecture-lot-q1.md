# Relecture du lot Q1 : 10 quiz

Lot Q1 du plan de contenu (octobre 2026) : 10 quiz de 10 questions, ajoutés le 2026-10-14, tous marqués « provisoire, à relire (lot Q1) ». En cas de différence, c'est le fichier JSON de `content/quizzes/` qui fait foi.

- Quiz faciles et moyens : faits classiques, certitude « sûr » ou « à vérifier » ; tout doute a été retiré.
- Quiz difficiles (et questions de difficulté 3 vérifiées en ligne) : une ou deux sources par réponse.
- Après relecture : `npm run build` dans `content/`, puis réimport de `/quizzes` puis de `/questions` (jamais la racine).

## À vérifier en priorité (0)

Aucune question marquée « à vérifier » : les points douteux rencontrés pendant la rédaction ont été retirés ou reformulés (voir la fin du document).

## Les 10 quiz

| Quiz | Identifiant | Thème | Niveau | Public | Moyenne |
|---|---|---|---|---|---|
| Jeux de société | `jeux-de-societe` | Loisirs | Facile | Tout public | 1,4 |
| Le corps humain | `corps-humain` | Sciences et nature | Moyen | Tout public | 1,9 |
| Fleuves, lacs et montagnes | `fleuves-montagnes` | Géographie | Moyen | Tout public | 1,8 |
| Châteaux et chevaliers | `moyen-age` | Histoire | Facile | Tout public | 1,3 |
| Le XXe siècle | `vingtieme-siecle` | Histoire | Moyen | Tout public | 1,7 |
| Les instruments de musique | `instruments-musique` | Musique | Facile | Tout public | 1,3 |
| Grands compositeurs | `musique-classique` | Musique | Difficile | Experts | 2,3 |
| Le football | `football` | Sport | Moyen | Tout public | 1,7 |
| Les Jeux olympiques | `jeux-olympiques` | Sport | Difficile | Experts | 2,4 |
| Les petits curieux | `petits-curieux` | Culture générale | Facile | Enfants | 1,1 |

## Toutes les questions

### Jeux de société (`jeux-de-societe`)

- `jds-01` (difficulté 1, sûr) Aux échecs, quelle pièce ne se déplace qu'en diagonale ?
  **B. Le fou** — autres : La tour · Le cavalier · Le roi
  Chaque joueur a deux fous : l'un reste sur les cases blanches, l'autre sur les noires.
- `jds-02` (difficulté 1, sûr) Combien de cases compte un échiquier ?
  **D. 64** — autres : 49 · 81 · 100
  Huit rangées de huit cases.
- `jds-03` (difficulté 1, sûr) Au Monopoly, dans l'édition française classique, quelle est la rue la plus chère ?
  **A. La rue de la Paix** — autres : L'avenue des Champs-Élysées · L'avenue Foch · Le boulevard de Belleville
  Elle ferme le plateau, juste avant la case Départ.
- `jds-04` (difficulté 2, sûr) Sur un dé à six faces classique, combien font deux faces opposées additionnées ?
  **C. 7** — autres : 6 · 8 · 12
  Le 1 fait face au 6, le 2 au 5 et le 3 au 4.
- `jds-05` (difficulté 1, sûr) Au Scrabble, combien de lettres chaque joueur a-t-il sur son chevalet ?
  **C. 7** — autres : 5 · 8 · 10
  Poser les sept lettres d'un coup rapporte une prime de 50 points.
- `jds-06` (difficulté 2, sûr) Aux dames internationales, combien de cases compte le damier ?
  **A. 100** — autres : 64 · 81 · 144
  Le damier international mesure dix cases sur dix.
- `jds-07` (difficulté 1, sûr) Au Cluedo, que faut-il découvrir en plus du coupable et du lieu du crime ?
  **D. L'arme** — autres : Le mobile · L'heure · Le témoin
  Chandelier, poignard, revolver… une seule arme est la bonne.
- `jds-08` (difficulté 1, sûr) Quel jeu consiste à aligner quatre jetons de sa couleur dans une grille posée à la verticale ?
  **B. Puissance 4** — autres : Othello · Le morpion · Mastermind
  Les jetons tombent jusqu'en bas de la colonne choisie.
- `jds-09` (difficulté 2, sûr) Au Mastermind classique, combien de pions forment le code secret à deviner ?
  **A. 4** — autres : 3 · 5 · 6
  Dans la version d'origine, le code compte quatre pions de six couleurs possibles.
- `jds-10` (difficulté 2, sûr) Aux échecs, comment s'appelle le coup où le roi et une tour bougent en même temps ?
  **C. Le roque** — autres : Le pat · La promotion · Le gambit
  Le roi se déplace de deux cases vers la tour, qui passe de l'autre côté du roi.

### Le corps humain (`corps-humain`)

- `ch-01` (difficulté 2, sûr) Quel est le plus grand organe du corps humain ?
  **D. La peau** — autres : Le foie · Les poumons · L'intestin
  Chez un adulte, elle couvre près de 2 m².
- `ch-02` (difficulté 1, sûr) Combien de cavités compte le cœur humain ?
  **A. 4** — autres : 2 · 3 · 6
  Deux oreillettes en haut, deux ventricules en bas.
- `ch-03` (difficulté 1, sûr) Quel est l'os le plus long du corps humain ?
  **C. Le fémur** — autres : Le tibia · L'humérus · La colonne vertébrale
  Il relie la hanche au genou.
- `ch-04` (difficulté 2, sûr) Dans quelle partie de l'oreille se trouve l'étrier, le plus petit os du corps ?
  **C. L'oreille moyenne** — autres : L'oreille externe · L'oreille interne · Le conduit auditif
  Avec le marteau et l'enclume, il transmet les vibrations du tympan.
- `ch-05` (difficulté 1, sûr) Quelles cellules du sang transportent l'oxygène ?
  **A. Les globules rouges** — autres : Les globules blancs · Les plaquettes · Les neurones
  On les appelle aussi hématies ; elles contiennent l'hémoglobine.
- `ch-06` (difficulté 2, sûr) Combien de dents compte la denture complète d'un adulte, dents de sagesse comprises ?
  **D. 32** — autres : 28 · 30 · 36
  Sans les quatre dents de sagesse, il en reste 28.
- `ch-07` (difficulté 3, sûr) Comment s'appelle le clapet qui ferme la trachée quand on avale ?
  **B. L'épiglotte** — autres : La luette · Le larynx · L'œsophage
  Il évite que les aliments partent « de travers », vers les poumons.
- `ch-08` (difficulté 2, sûr) Quel muscle, sous les poumons, est le principal muscle de la respiration ?
  **A. Le diaphragme** — autres : Le pectoral · L'abdominal · Le trapèze
  En se contractant, il descend et fait entrer l'air dans les poumons.
- `ch-09` (difficulté 2, sûr) Quelle vitamine, désignée par une lettre, la peau fabrique-t-elle grâce au soleil ?
  **C. D** — autres : C · A · K
  Elle aide à fixer le calcium dans les os.
- `ch-10` (difficulté 3, sûr) Comment s'appelle l'os du talon ?
  **B. Le calcanéum** — autres : Le métatarse · La rotule · Le péroné
  C'est le plus gros os du pied.

### Fleuves, lacs et montagnes (`fleuves-montagnes`)

- `fm-01` (difficulté 1, sûr) Quel fleuve traverse Londres ?
  **A. La Tamise** — autres : Le Rhin · La Severn · La Clyde
  Le célèbre Tower Bridge l'enjambe.
- `fm-02` (difficulté 2, sûr) Dans quel pays se trouve le Kilimandjaro ?
  **C. La Tanzanie** — autres : Le Kenya · L'Éthiopie · L'Ouganda
  Ce volcan est le point culminant de l'Afrique.
- `fm-03` (difficulté 1, sûr) Quelle chaîne de montagnes longe toute la côte ouest de l'Amérique du Sud ?
  **C. La cordillère des Andes** — autres : Les Rocheuses · L'Atlas · L'Himalaya
  Elle traverse sept pays, du Venezuela à l'Argentine.
- `fm-04` (difficulté 2, sûr) Quel fleuve traverse Vienne, Budapest et Belgrade avant de se jeter dans la mer Noire ?
  **A. Le Danube** — autres : Le Rhin · La Vistule · L'Elbe
  Il traverse ou longe dix pays d'Europe.
- `fm-05` (difficulté 1, sûr) Dans quel pays se trouve le volcan Etna ?
  **D. L'Italie** — autres : La Grèce · L'Espagne · L'Islande
  Il domine l'est de la Sicile.
- `fm-06` (difficulté 2, sûr) Quel est le plus grand lac d'Afrique ?
  **B. Le lac Victoria** — autres : Le lac Tanganyika · Le lac Tchad · Le lac Malawi
  Il est partagé entre l'Ouganda, le Kenya et la Tanzanie.
- `fm-07` (difficulté 2, sûr) À Lyon, quelle rivière rejoint le Rhône ?
  **A. La Saône** — autres : L'Isère · La Durance · Le Doubs
  Les deux cours d'eau se rejoignent au confluent, au sud de la presqu'île.
- `fm-08` (difficulté 2, sûr) Quelle chaîne de montagnes sert traditionnellement de limite entre l'Europe et l'Asie ?
  **C. L'Oural** — autres : Le Caucase · Les Carpates · L'Altaï
  Elle traverse la Russie du nord au sud.
- `fm-09` (difficulté 3, sûr) Quel fleuve, le plus long d'Europe, se jette dans la mer Caspienne ?
  **B. La Volga** — autres : Le Danube · Le Dniepr · L'Oural
  Elle coule entièrement en Russie, sur environ 3 500 km.
- `fm-10` (difficulté 2, sûr) Quel désert s'étend sur le sud de la Mongolie et le nord de la Chine ?
  **D. Le désert de Gobi** — autres : Le Kalahari · L'Atacama · Le Namib
  C'est un désert froid, aux hivers glacials.

### Châteaux et chevaliers (`moyen-age`)

- `ma-01` (difficulté 1, sûr) Comment appelle-t-on le fossé rempli d'eau qui entoure certains châteaux forts ?
  **C. Les douves** — autres : Les remparts · La herse · Les créneaux
  On le franchissait par un pont-levis.
- `ma-02` (difficulté 1, sûr) Comment s'appelle la grande tour principale d'un château fort ?
  **C. Le donjon** — autres : La tourelle · Le beffroi · Le clocher
  C'était le dernier refuge du seigneur en cas d'attaque.
- `ma-03` (difficulté 2, sûr) Quel roi d'Angleterre a été surnommé « Cœur de Lion » ?
  **A. Richard Ier** — autres : Henri II · Jean sans Terre · Édouard Ier
  Il a participé à la troisième croisade.
- `ma-04` (difficulté 1, sûr) Quel souverain a été couronné empereur à Rome le jour de Noël de l'an 800 ?
  **D. Charlemagne** — autres : Clovis · Hugues Capet · Pépin le Bref
  Il a été couronné par le pape Léon III.
- `ma-05` (difficulté 2, sûr) En quelle année a eu lieu la bataille d'Hastings, qui ouvre à Guillaume le Conquérant les portes de l'Angleterre ?
  **B. 1066** — autres : 1166 · 966 · 1214
  Guillaume, duc de Normandie, y bat le roi Harold.
- `ma-06` (difficulté 1, sûr) Comment appelle-t-on les expéditions militaires parties d'Europe vers Jérusalem à partir de la fin du XIe siècle ?
  **A. Les croisades** — autres : Les invasions · Les pèlerinages · Les conquêtes
  La première croisade est lancée en 1095.
- `ma-07` (difficulté 2, sûr) Quel roi de France, mort près de Tunis en 1270, a été proclamé saint ?
  **C. Louis IX** — autres : Philippe le Bel · Charles V · Charles VII
  On l'appelle aussi Saint Louis.
- `ma-08` (difficulté 1, sûr) Comment appelait-on le jeune noble au service d'un chevalier, avant d'être adoubé à son tour ?
  **B. L'écuyer** — autres : Le vassal · Le serf · Le troubadour
  Il s'occupait des armes et du cheval de son maître.
- `ma-09` (difficulté 1, sûr) Comment a-t-on surnommé l'épidémie qui a ravagé l'Europe au milieu du XIVe siècle ?
  **D. La peste noire** — autres : La grippe espagnole · La lèpre rouge · Le choléra blanc
  Elle aurait tué entre un tiers et la moitié des Européens.
- `ma-10` (difficulté 1, sûr) Quelle longue broderie raconte la conquête de l'Angleterre par Guillaume le Conquérant ?
  **A. La tapisserie de Bayeux** — autres : La tapisserie de l'Apocalypse · La Dame à la licorne · Le suaire de Turin
  Elle mesure près de 70 mètres de long.

### Le XXe siècle (`vingtieme-siecle`)

- `xx-01` (difficulté 1, sûr) En quelle année a commencé la Première Guerre mondiale ?
  **C. 1914** — autres : 1912 · 1916 · 1918
  Elle éclate en août 1914, un mois après l'attentat de Sarajevo.
- `xx-02` (difficulté 3, sûr) Quelle conférence de février 1945 réunit Roosevelt, Churchill et Staline en Crimée ?
  **A. La conférence de Yalta** — autres : La conférence de Potsdam · La conférence de Téhéran · La conférence de Munich
  Les trois Alliés y préparent l'après-guerre en Europe.
- `xx-03` (difficulté 1, sûr) À quelle date les Alliés débarquent-ils en Normandie ?
  **D. Le 6 juin 1944** — autres : Le 8 mai 1945 · Le 18 juin 1940 · Le 25 août 1944
  Le « Jour J », sur cinq plages de la côte normande.
- `xx-04` (difficulté 1, sûr) Quel général lance, depuis Londres, l'appel du 18 juin 1940 ?
  **B. Charles de Gaulle** — autres : Philippe Leclerc · Jean de Lattre de Tassigny · Philippe Pétain
  Il appelle les Français à poursuivre le combat.
- `xx-05` (difficulté 2, sûr) Quel homme, libéré en 1990 après 27 ans de prison, devient président de l'Afrique du Sud en 1994 ?
  **A. Nelson Mandela** — autres : Desmond Tutu · Frederik de Klerk · Thabo Mbeki
  Il reçoit le prix Nobel de la paix en 1993.
- `xx-06` (difficulté 2, sûr) Quelle crise de 1962 oppose les États-Unis et l'URSS autour de missiles installés dans une île des Caraïbes ?
  **C. La crise de Cuba** — autres : La crise de Berlin · La crise de Suez · La crise de Corée
  Pendant treize jours, le monde craint une guerre nucléaire.
- `xx-07` (difficulté 2, sûr) En quelle année l'Union soviétique a-t-elle été dissoute ?
  **B. 1991** — autres : 1989 · 1985 · 1993
  Elle disparaît officiellement fin décembre 1991.
- `xx-08` (difficulté 2, sûr) Quel traité, signé en 1957, crée la Communauté économique européenne ?
  **D. Le traité de Rome** — autres : Le traité de Maastricht · Le traité de Paris · Le traité de Lisbonne
  Six pays le signent, dont la France et l'Allemagne de l'Ouest.
- `xx-09` (difficulté 1, sûr) Quel président américain a été assassiné à Dallas en 1963 ?
  **A. John F. Kennedy** — autres : Abraham Lincoln · Richard Nixon · Lyndon Johnson
  Il est tué le 22 novembre 1963.
- `xx-10` (difficulté 2, sûr) Comment s'appelle le premier satellite artificiel, lancé par l'URSS en 1957 ?
  **C. Spoutnik** — autres : Vostok · Apollo · Soyouz
  Son « bip-bip » radio est capté dans le monde entier.

### Les instruments de musique (`instruments-musique`)

- `im-01` (difficulté 1, sûr) Quel instrument a des touches noires et blanches ?
  **A. Le piano** — autres : La harpe · La flûte · Le violon
  Les touches noires jouent les dièses et les bémols.
- `im-02` (difficulté 1, sûr) À quelle famille d'instruments appartient le violon ?
  **D. Les cordes** — autres : Les cuivres · Les bois · Les percussions
  On frotte ses cordes avec un archet.
- `im-03` (difficulté 1, sûr) Quel instrument à vent porte le nom de son inventeur, Adolphe Sax ?
  **B. Le saxophone** — autres : La clarinette · Le trombone · Le hautbois
  Adolphe Sax, facteur belge, le fait breveter en 1846.
- `im-04` (difficulté 2, sûr) Combien de cordes compte un violon ?
  **A. 4** — autres : 3 · 5 · 6
  Elles sont accordées en sol, ré, la, mi.
- `im-05` (difficulté 2, sûr) Quel est le plus grand instrument à cordes frottées de l'orchestre ?
  **C. La contrebasse** — autres : Le violoncelle · L'alto · La viole
  On en joue debout ou assis sur un tabouret haut.
- `im-06` (difficulté 1, sûr) Quel instrument est fait de lames de bois que l'on frappe avec des baguettes ?
  **B. Le xylophone** — autres : Le triangle · Le tambourin · Les maracas
  Son nom vient du grec « xylon », le bois.
- `im-07` (difficulté 1, sûr) Avec son sac et ses tuyaux, quel instrument est le symbole musical de l'Écosse ?
  **D. La cornemuse** — autres : L'accordéon · L'harmonica · Le banjo
  Le musicien souffle dans le sac, qui alimente les tuyaux.
- `im-08` (difficulté 1, sûr) Comment s'appelle la fine tige que tient le chef d'orchestre ?
  **A. La baguette** — autres : L'archet · Le diapason · Le métronome
  Elle sert à marquer la mesure et les départs.
- `im-09` (difficulté 2, sûr) Quel instrument de la famille des cuivres possède une coulisse ?
  **C. Le trombone** — autres : La trompette · Le cor · Le tuba
  En faisant glisser la coulisse, on change la note.
- `im-10` (difficulté 1, sûr) Combien de musiciens compte un quatuor ?
  **C. 4** — autres : 3 · 5 · 8
  Le quatuor à cordes réunit deux violons, un alto et un violoncelle.

### Grands compositeurs (`musique-classique`)

- `mc-01` (difficulté 1, sûr) Quel compositeur italien a écrit « Les Quatre Saisons » ?
  **D. Antonio Vivaldi** — autres : Arcangelo Corelli · Domenico Scarlatti · Giuseppe Verdi
  Ces quatre concertos pour violon sont publiés en 1725 à Amsterdam.
  Sources : <https://imslp.org/wiki/Le_quattro_stagioni_(Vivaldi,_Antonio)> ; <https://www.classiquenews.com/les-quatre-saisons-de-vivaldi-1725/>
- `mc-02` (difficulté 2, sûr) Dans quel opéra de Mozart chante Papageno, l'oiseleur ?
  **B. La Flûte enchantée** — autres : Don Giovanni · Les Noces de Figaro · Così fan tutte
  L'œuvre est créée à Vienne en 1791.
  Sources : <https://www.larousse.fr/encyclopedie/oeuvre/wd/119754> ; <https://fr.vikidia.org/wiki/La_Fl%C3%BBte_enchant%C3%A9e>
- `mc-03` (difficulté 3, sûr) Quel compositeur a écrit la « Symphonie fantastique », créée à Paris en 1830 ?
  **A. Hector Berlioz** — autres : Camille Saint-Saëns · Charles Gounod · Franz Liszt
  Elle est créée le 5 décembre 1830 au Conservatoire de Paris.
  Sources : <https://www.universalis.fr/encyclopedie/symphonie-fantastique/> ; <https://www.aspenmusicfestival.com/program_notes/view/hector-berlioz-symphonie-fantastique-op.-14>
- `mc-04` (difficulté 2, sûr) Quel compositeur français a écrit l'opéra « Carmen » ?
  **C. Georges Bizet** — autres : Jules Massenet · Jacques Offenbach · Léo Delibes
  L'opéra est créé en 1875 à l'Opéra-Comique, à Paris.
  Sources : <https://www.opera-comique.com/sites/default/files/2023-04/2023_Programme_Carmen_Web.pdf> ; <https://en.wikipedia.org/wiki/1875_in_music>
- `mc-05` (difficulté 2, sûr) Quel compositeur russe a écrit la musique du ballet « Le Lac des cygnes » ?
  **B. Piotr Ilitch Tchaïkovski** — autres : Igor Stravinsky · Sergueï Prokofiev · Nikolaï Rimski-Korsakov
  Le ballet, commandé en 1875, est créé à Moscou en 1877.
  Sources : <https://suzannetreister.net/suzyWWW/TT_ResearchProjects/swanlake/OP-SwanLake-Tchaik.html> ; <https://en.tchaikovsky-research.net/pages/Georges_Bizet>
- `mc-06` (difficulté 3, sûr) Quel compositeur a dédié six concertos au margrave de Brandebourg en 1721 ?
  **D. Jean-Sébastien Bach** — autres : Georg Friedrich Haendel · Georg Philipp Telemann · Joseph Haydn
  Ce sont les six « Concertos brandebourgeois ».
  Sources : <https://en.wikipedia.org/wiki/Brandenburg_Concertos> ; <https://imslp.org/wiki/6_Bandenburg_Concertos_(Bach,_Johann_Sebastian)>
- `mc-07` (difficulté 2, sûr) Dans quelle ville Mozart est-il né ?
  **A. Salzbourg** — autres : Vienne · Munich · Prague
  Il y naît le 27 janvier 1756.
  Sources : <https://www.operadeparis.fr/artistes/wolfgang-amadeus-mozart> ; <https://salzburg.info/fr/salzbourg/mozart/wolfgang-amadeus-mozart>
- `mc-08` (difficulté 2, sûr) Quel compositeur a écrit « Le Carnaval des animaux » ?
  **C. Camille Saint-Saëns** — autres : Claude Debussy · Maurice Ravel · Erik Satie
  Il l'a composé en 1886 et en a interdit l'exécution publique de son vivant.
  Sources : <https://en.wikipedia.org/wiki/The_Carnival_of_the_Animals> ; <https://fr.vikidia.org/wiki/Le_carnaval_des_animaux>
- `mc-09` (difficulté 3, sûr) Quel compositeur norvégien a écrit « Dans l'antre du roi de la montagne », pour la pièce « Peer Gynt » ?
  **C. Edvard Grieg** — autres : Jean Sibelius · Carl Nielsen · Antonín Dvořák
  La musique de scène date de 1875 ; la pièce est d'Henrik Ibsen.
  Sources : <https://en.wikipedia.org/wiki/In_the_Hall_of_the_Mountain_King> ; <https://cso.org/experience/article/20886/how-griegs-in-the-hall-of-the-mountain-king-h>
- `mc-10` (difficulté 3, sûr) De quel opéra de Verdi vient le chœur des esclaves hébreux, « Va, pensiero » ?
  **A. Nabucco** — autres : La Traviata · Aïda · Rigoletto
  L'opéra est créé à la Scala de Milan en 1842.
  Sources : <https://www.music-opera.com/fr/oeuvre/verdi-nabucco.html> ; <https://www.maisondelaradioetdelamusique.fr/sites/default/files/linked_media/va-pensiero-FP.pdf>

### Le football (`football`)

- `fb-01` (difficulté 1, sûr) Combien de minutes dure un match de football, sans les prolongations ni le temps additionnel ?
  **B. 90** — autres : 80 · 100 · 120
  Deux mi-temps de 45 minutes.
- `fb-02` (difficulté 2, sûr) Quel pays a remporté la première Coupe du monde de football, en 1930 ?
  **A. L'Uruguay** — autres : Le Brésil · L'Argentine · L'Italie
  Le pays organisateur bat l'Argentine en finale.
- `fb-03` (difficulté 1, sûr) Quel joueur français marque deux buts de la tête en finale de la Coupe du monde 1998 ?
  **C. Zinédine Zidane** — autres : Thierry Henry · Emmanuel Petit · Lilian Thuram
  Emmanuel Petit inscrit le troisième but, en fin de match.
- `fb-04` (difficulté 1, sûr) De quelle couleur est le carton qui signifie une expulsion ?
  **B. Rouge** — autres : Jaune · Blanc · Noir
  Deux cartons jaunes dans le même match valent aussi un rouge.
- `fb-05` (difficulté 2, sûr) À combien de mètres de la ligne de but se trouve le point de penalty ?
  **D. 11** — autres : 9 · 13 · 16
  Il est placé à l'intérieur de la surface de réparation.
- `fb-06` (difficulté 1, sûr) Dans quelle ville se trouve le stade Vélodrome ?
  **A. Marseille** — autres : Lyon · Bordeaux · Saint-Étienne
  C'est le stade de l'Olympique de Marseille.
- `fb-07` (difficulté 2, sûr) Quel club français a remporté la Ligue des champions en 1993 ?
  **C. L'Olympique de Marseille** — autres : Le Paris Saint-Germain · L'AS Monaco · Les Girondins de Bordeaux
  L'OM bat le Milan AC 1-0 en finale, à Munich.
- `fb-08` (difficulté 3, sûr) Quel joueur a reçu le tout premier Ballon d'or, en 1956 ?
  **C. Stanley Matthews** — autres : Alfredo Di Stéfano · Raymond Kopa · Ferenc Puskás
  L'ailier anglais de Blackpool devance Di Stéfano et Kopa.
  Sources : <https://en.wikipedia.org/wiki/1956_Ballon_d%27Or> ; <https://www.topendsports.com/sport/soccer/awards/ballondor-1956.htm>
- `fb-09` (difficulté 2, sûr) Quel joueur brésilien, trois fois champion du monde, était surnommé « le Roi » ?
  **A. Pelé** — autres : Garrincha · Ronaldo · Zico
  Il gagne la Coupe du monde en 1958, 1962 et 1970.
- `fb-10` (difficulté 2, sûr) Comment appelle-t-on le fait de marquer trois buts dans un même match ?
  **D. Un coup du chapeau** — autres : Un grand chelem · Un triplé d'or · Une lucarne
  En anglais, on parle de « hat-trick ».

### Les Jeux olympiques (`jeux-olympiques`)

- `jo-01` (difficulté 2, sûr) Dans quelle ville se sont tenus, en 1924, les Jeux reconnus comme les premiers Jeux olympiques d'hiver ?
  **A. Chamonix** — autres : Saint-Moritz · Oslo · Grenoble
  Appelés d'abord « Semaine internationale des sports d'hiver », ils ont ensuite été reconnus comme les premiers Jeux d'hiver.
  Sources : <https://www.larousse.fr/encyclopedie/divers/wd/185488> ; <https://www.universalis.fr/encyclopedie/chamonix-jeux-olympiques-de-1924-contexte-organisation-bilan/>
- `jo-02` (difficulté 3, sûr) En quelle année Paris a-t-elle accueilli les Jeux olympiques d'été pour la première fois ?
  **C. 1900** — autres : 1908 · 1912 · 1924
  Ces Jeux, mêlés à l'Exposition universelle, s'étalent sur plus de cinq mois.
  Sources : <https://en.wikipedia.org/wiki/1900_Summer_Olympics> ; <https://www.paris.fr/pages/sur-les-traces-des-jeux-olympiques-parisiens-de-1900-et-1924-24239>
- `jo-03` (difficulté 2, sûr) Quel athlète américain remporte quatre médailles d'or aux Jeux de Berlin, en 1936 ?
  **B. Jesse Owens** — autres : Carl Lewis · Jim Thorpe · Bob Beamon
  100 m, 200 m, saut en longueur et relais 4 × 100 m.
  Sources : <https://worldathletics.org/news/iaaf-news/jesse-owens-olympic-medal-1936-auction> ; <https://www.larousse.fr/encyclopedie/divers/wd/185471>
- `jo-04` (difficulté 2, sûr) Quelle gymnaste roumaine obtient la première note parfaite de 10 aux Jeux de Montréal, en 1976 ?
  **D. Nadia Comăneci** — autres : Olga Korbut · Simona Amânar · Larissa Latynina
  Le tableau, incapable d'afficher 10, indique « 1.00 ».
  Sources : <https://www.ksl.com/article/50004151/in-1976-comanecis-perfect-10s-made-her-the-perfect-one> ; <https://www.si.com/olympics/video/2013/03/02/02-6>
- `jo-05` (difficulté 2, sûr) Combien d'épreuves compte l'heptathlon féminin ?
  **A. 7** — autres : 5 · 8 · 10
  Trois courses, deux sauts et deux lancers, sur deux jours.
  Sources : <https://fr.vikidia.org/wiki/Heptathlon> ; <https://fr.wiktionary.org/wiki/heptathlon>
- `jo-06` (difficulté 3, sûr) Dans quelle ville Bob Beamon réussit-il son saut en longueur de 8,90 m, en 1968 ?
  **C. Mexico** — autres : Tokyo · Munich · Rome
  Il bat l'ancien record du monde de 55 cm.
  Sources : <https://en.wikipedia.org/wiki/Bob_Beamon> ; <https://olympics.com/en/news/week-in-olympic-history-14-20-october>
- `jo-07` (difficulté 2, sûr) Quelle ville française accueille les Jeux olympiques d'hiver de 1992 ?
  **C. Albertville** — autres : Grenoble · Chamonix · Annecy
  Ce sont les derniers Jeux d'hiver organisés la même année que les Jeux d'été.
  Sources : <https://en.wikipedia.org/wiki/1992_Winter_Olympics> ; <https://olympics.com/en/olympic-games/albertville-1992>
- `jo-08` (difficulté 2, sûr) Quel nageur français remporte quatre titres individuels aux Jeux de Paris 2024 ?
  **A. Léon Marchand** — autres : Florent Manaudou · Maxime Grousset · Yannick Agnel
  400 m et 200 m quatre nages, 200 m papillon et 200 m brasse.
  Sources : <https://www.npr.org/2024/08/03/nx-s1-5062365/leon-marchand-france-swimmer-olympic-gold> ; <https://www.clickondetroit.com/sports/2024/08/02/leon-marchand-completes-his-dominating-run-through-the-paris-olympics-capturing-4th-swimming-gold/>
- `jo-09` (difficulté 3, sûr) Quelle discipline fait ses débuts olympiques aux Jeux de Paris 2024, place de la Concorde ?
  **D. Le breaking** — autres : Le skateboard · L'escalade · Le surf
  Skateboard, escalade et surf étaient déjà apparus à Tokyo.
  Sources : <https://parisjetaime.com/article/le-breaking-a-paris-a1592> ; <https://sportmag.fr/paris-2024-le-breaking-discipline-renversante>
- `jo-10` (difficulté 3, sûr) Quel pays accueille en 1964 les premiers Jeux olympiques organisés en Asie ?
  **B. Le Japon** — autres : La Corée du Sud · La Chine · L'Inde
  Les Jeux se tiennent à Tokyo, en octobre 1964.
  Sources : <https://olympics.com/cio/heritage/heritage-actuel/tokyo-1964> ; <https://www.nippon.com/fr/column/g00213/>

### Les petits curieux (`petits-curieux`)

- `pc-01` (difficulté 2, sûr) Quel est le plus petit des continents ?
  **C. L'Océanie** — autres : L'Europe · L'Antarctique · L'Amérique du Sud
  Elle regroupe l'Australie et de nombreuses îles du Pacifique.
- `pc-02` (difficulté 1, sûr) Quelle couleur obtient-on en mélangeant du bleu et du jaune ?
  **B. Le vert** — autres : Le violet · L'orange · Le marron
  Le bleu et le rouge donnent du violet ; le rouge et le jaune, de l'orange.
- `pc-03` (difficulté 1, sûr) Combien de couleurs compte-t-on traditionnellement dans un arc-en-ciel ?
  **D. 7** — autres : 5 · 6 · 9
  Rouge, orange, jaune, vert, bleu, indigo et violet.
- `pc-04` (difficulté 1, sûr) Combien de mois compte une année ?
  **A. 12** — autres : 10 · 11 · 13
  De janvier à décembre.
- `pc-05` (difficulté 1, sûr) En quelle saison les feuilles de beaucoup d'arbres tombent-elles ?
  **C. En automne** — autres : En hiver · Au printemps · En été
  Elles jaunissent et rougissent avant de tomber.
- `pc-06` (difficulté 1, sûr) Que devient l'eau quand elle gèle ?
  **C. De la glace** — autres : De la vapeur · Du sable · De la neige fondue
  L'eau gèle à 0 °C.
- `pc-07` (difficulté 1, sûr) Combien de côtés a un triangle ?
  **A. 3** — autres : 4 · 5 · 6
  Le carré en a quatre, le pentagone cinq.
- `pc-08` (difficulté 1, sûr) Quel astre nous éclaire pendant la journée ?
  **D. Le Soleil** — autres : La Lune · L'étoile Polaire · Mars
  C'est une étoile, très proche de nous.
- `pc-09` (difficulté 1, sûr) Dans quel conte une jeune fille perd-elle une pantoufle de verre ?
  **B. Cendrillon** — autres : Blanche-Neige · La Belle au bois dormant · Le Petit Chaperon rouge
  Le prince la retrouve grâce à cette pantoufle.
- `pc-10` (difficulté 1, sûr) Quel fruit jaune et courbé les singes adorent-ils dans les dessins animés ?
  **A. La banane** — autres : La poire · Le citron · L'ananas
  Elle pousse en grappes appelées « régimes ».

## Reformulé ou écarté pendant la rédaction

- Chamonix 1924 : l'événement s'appelait d'abord « Semaine internationale des sports d'hiver » et n'a été reconnu comme Jeux olympiques qu'ensuite ; l'énoncé dit « reconnus comme les premiers Jeux olympiques d'hiver ».
- Arc-en-ciel : « traditionnellement » sept couleurs (convention héritée de Newton), d'où le mot dans l'énoncé.
- Écartés : « pays qui a gagné le plus de Coupes du monde » et tout record encore détenu (la réponse peut changer), la question sur le nombre de symphonies de Beethoven (trop proche d'une question existante).
