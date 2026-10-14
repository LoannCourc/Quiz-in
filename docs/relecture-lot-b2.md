# Relecture du lot B2 : 5 Bluff

Lot B2 du plan de contenu (octobre 2026) : 5 quiz Bluff de 10 questions, ajoutés le 2026-10-14, tous marqués « provisoire, à relire (lot B2) ». En cas de différence, c'est le fichier JSON de `content/quizzes/` qui fait foi.

- Chaque vraie réponse a été vérifiée en ligne (une ou deux sources par question, URL ci-dessous). Les anecdotes contestées sont présentées comme telles dans l'énoncé (« selon la légende », « selon… »).
- Les leurres sont inventés : ils doivent être crédibles mais faux.
- Après relecture : `npm run build` dans `content/`, puis réimport de `/quizzes` puis de `/questions` (jamais la racine).

## À vérifier en priorité (0)

Aucune question marquée « à vérifier » : les faits sans source fiable ont été retirés ou reformulés (voir la fin du document).

## Les 5 Bluff

| Quiz | Identifiant | Catégorie |
|---|---|---|
| Drôles d'histoires de cinéma | `bluff-histoires-cinema` | Cinéma et séries |
| Instruments et partitions | `bluff-instruments-records` | Musique |
| Records et règles du sport | `bluff-records-sport` | Sport |
| Frontières insolites | `bluff-frontieres-insolites` | Géographie |
| Histoires de cuisine | `bluff-histoires-cuisine` | Loisirs |

## Toutes les questions

### Drôles d'histoires de cinéma (`bluff-histoires-cinema`)

- `bhc-01` (difficulté 2, sûr) Pendant la Seconde Guerre mondiale, en quoi étaient faites les statuettes des Oscars ?
  **En plâtre peint, à cause de la pénurie de métal.**
  Leurres : En bois doré, sculpté à la main. · En chocolat recouvert de feuille d'or. · En verre soufflé, trop fragile pour voyager.
  Sources : <https://www.oscars.org/oscars/statuette> ; <https://www.brandeis.edu/library/archives/essays/special-collections/oscars.html>
- `bhc-02` (difficulté 2, sûr) De quelle couleur étaient les souliers magiques de Dorothy dans le livre « Le Magicien d'Oz » ?
  **Argentés : le film les a faits rouges pour briller en Technicolor.**
  Leurres : Dorés, comme la route de briques jaunes. · Verts, comme la Cité d'émeraude. · Bleus, la couleur préférée de l'auteur.
  Sources : <https://si.edu/object/dorothys-ruby-slippers:nmah_670130> ; <https://en.wikipedia.org/wiki/Ruby_slippers>
- `bhc-03` (difficulté 2, sûr) Comment Walt Disney voulait-il d'abord appeler Mickey ?
  **Mortimer : sa femme trouvait ce nom trop prétentieux.**
  Leurres : Marty, comme son coiffeur. · Mouse Junior, tout simplement. · Maxime, en souvenir d'un voyage en France.
  Sources : <https://en.wikipedia.org/wiki/Mickey_Mouse> ; <https://www.rtbf.be/article/la-minute-historique-il-y-a-pres-de-100-ans-mickey-mouse-a-failli-porter-un-autre-nom-11764150>
- `bhc-04` (difficulté 3, sûr) Comment Alfred Hitchcock apparaît-il dans « Lifeboat » (1944), tourné entièrement dans un canot ?
  **Sur une publicité pour un régime, dans un journal, en photos avant-après.**
  Leurres : En noyé qui passe à côté du canot. · Dans le reflet d'une bouteille de whisky. · En portrait tatoué sur le bras d'un marin.
  Sources : <https://filmsite.org/hitchcockcameos2.html> ; <https://www.mentalfloss.com/article/25468/quick-10-10-alfred-hitchcock-cameos>
- `bhc-05` (difficulté 2, sûr) D'où vient le nom de R2-D2, dans « Star Wars » ?
  **D'un code de montage : « Reel 2, Dialogue 2 », bobine 2, piste 2.**
  Leurres : Des initiales des deux enfants de George Lucas. · D'une plaque d'immatriculation vue à Los Angeles. · D'un modèle d'aspirateur des années 1970.
  Sources : <https://www.lucasfilm.com/news/history-in-objects-reel-2-dialog-2/> ; <https://mentalfloss.com/article/89844/origins-behind-8-star-wars-character-and-species-names>
- `bhc-06` (difficulté 2, sûr) Quel animal donne la partie aiguë du rugissement du tyrannosaure de « Jurassic Park » ?
  **Un bébé éléphant, mélangé à un alligator et à d'autres animaux.**
  Leurres : Un chat siamois, ralenti dix fois. · Un cochon, mélangé au moteur d'un camion. · Un aigle, enregistré dans un zoo.
  Sources : <https://slashfilm.com/1310511/jurassic-park-got-t-rex-roar-from-combination-of-three-different-animals> ; <https://www.allocine.fr/article/fichearticle_gen_carticle=1000176572.html>
- `bhc-07` (difficulté 2, sûr) Quels bonbons E.T. suit-il pour entrer dans la maison d'Elliott ?
  **Des Reese's Pieces : le fabricant des M&M's aurait refusé.**
  Leurres : Des guimauves, les seules qu'Elliott avait. · Des réglisses, collées les unes aux autres. · Des chewing-gums à la fraise.
  Sources : <https://faroutmagazine.co.uk/why-does-e-t-eat-reeces-pieces/> ; <https://www.tastingtable.com/2108371/steven-spielberg-et-movie-reeses-pieces-history>
- `bhc-08` (difficulté 1, sûr) Selon la légende, que s'est-il passé lors des premières projections de « L'Arrivée d'un train en gare de La Ciotat » ?
  **Des spectateurs auraient fui, croyant que le train allait les écraser.**
  Leurres : Le projecteur aurait pris feu au passage du train. · Le public aurait réclamé le film trois fois de suite. · Un conducteur de train aurait porté plainte pour son image.
  Sources : <https://www.letemps.ch/cyber/cinema-couleur-cendre> ; <https://www.larousse.fr/encyclopedie/film/lArriv%C3%A9e_dun_train_en_gare_de_La_Ciotat/780>
- `bhc-09` (difficulté 2, sûr) Comment « Toy Story 2 » a-t-il été sauvé, après l'effacement accidentel de ses fichiers en 1998 ?
  **Une employée en congé maternité en gardait une copie sur son ordinateur, chez elle.**
  Leurres : Un stagiaire l'avait gravé en secret sur des CD. · Les animateurs ont tout refait en trois semaines. · Un concurrent en avait volé une copie et l'a rendue.
  Sources : <https://archive.techdirt.com/articles/20120514/17243918918/how-toy-story-2-almost-got-deleted-except-that-one-person-made-home-backup.shtml> ; <https://www.techspot.com/news/112848-how-pixar-nearly-deleted-toy-story-2-single.html>
- `bhc-10` (difficulté 1, sûr) Quel film remporte le tout premier Oscar du meilleur film d'animation, en 2002 ?
  **Shrek, face à « Monstres et Cie ».**
  Leurres : Le Roi lion, récompensé des années après sa sortie. · Toy Story, premier film tout en images de synthèse. · Le Voyage de Chihiro, film japonais.
  Sources : <https://www.allocine.fr/article/fichearticle_gen_carticle=704483.html> ; <https://www.rtbf.be/article/il-etait-une-fois-les-20-ans-de-shrek-10813538>

### Instruments et partitions (`bluff-instruments-records`)

- `bir-01` (difficulté 3, sûr) Comment s'appelait le piano à son invention, vers 1700 ?
  **Un « clavecin qui joue doux et fort » : gravicembalo col piano e forte.**
  Leurres : Un « tambour à cordes », car on frappe les cordes. · Un « orgue de salon », sans tuyaux. · Une « harpe couchée », jouée avec des touches.
  Sources : <https://fortepian.instrumenty.edu.pl/en/history/gravicembalo-col-piano-e-forte> ; <https://www.encyclopedia.com/history/encyclopedias-almanacs-transcripts-and-maps/bartolomeo-cristofori>
- `bir-02` (difficulté 2, sûr) Sur quel air Mozart a-t-il écrit douze variations pour piano ?
  **« Ah ! vous dirai-je, maman », l'air de « Twinkle, Twinkle, Little Star ».**
  Leurres : « Au clair de la lune », pour sa sœur. · « Frère Jacques », sous le titre « Bruder Jakob ». · « Il était une bergère », un air de Vienne.
  Sources : <https://britannica.com/topic/Twelve-Variations-on-Ah-vous-dirai-je-Maman> ; <https://www.music-scores.com/blog/twinkle/>
- `bir-03` (difficulté 2, sûr) Selon le récit, que s'est-il passé à la fin de la création de la Neuvième Symphonie de Beethoven, en 1824 ?
  **Sourd, il n'entendait pas les applaudissements : une chanteuse l'a tourné vers le public.**
  Leurres : Il a dirigé tout le concert dos au public, en silence. · Il a quitté la salle avant la fin, croyant à un échec. · Il a demandé de rejouer l'œuvre entière le soir même.
  Sources : <https://www.rtbf.be/article/pourquoi-la-neuvieme-symphonie-de-beethoven-est-elle-une-uvre-revolutionnaire-11384253> ; <https://www.larousse.fr/encyclopedie/oeuvre/wd/135067>
- `bir-04` (difficulté 2, sûr) Selon une hypothèse répandue, à qui la « Lettre à Élise » était-elle vraiment dédiée ?
  **À une Thérèse : un éditeur aurait mal lu l'écriture de Beethoven.**
  Leurres : À sa cuisinière, qui s'appelait Élise. · À la fille de son éditeur, âgée de six ans. · À une élève anglaise nommée Alice.
  Sources : <https://en.wikipedia.org/wiki/F%C3%BCr_Elise> ; <https://classicfm.com/composers/beethoven/guides/therese-malfatti-1792-1851-and-beethovens-fur-elis>
- `bir-05` (difficulté 2, sûr) Quels sont les premiers mots enregistrés par Edison sur son phonographe, en 1877 ?
  **Une comptine : « Mary had a little lamb ».**
  Leurres : « Allô, allô, m'entendez-vous ? » · Les premières notes de l'hymne américain. · « Bonne année 1878 ! », pour un ami.
  Sources : <https://www.erudit.org/fr/revues/cd/1989-v5-n2-cd1039466/7508ac.pdf> ; <https://www.historyofinformation.com/detail.php?id=509>
- `bir-06` (difficulté 2, sûr) Qu'a de particulier le thérémine, inventé vers 1920 ?
  **On en joue sans le toucher, en bougeant les mains près de deux antennes.**
  Leurres : On en joue avec les pieds, comme un orgue. · Il ne joue qu'une seule note, plus ou moins fort. · Il se joue à deux, chacun tenant une poignée.
  Sources : <https://sensorwiki.org/instruments/theremin> ; <https://bibliotheques.paris.fr/musique/vous-avez-dit-theremine.aspx>
- `bir-07` (difficulté 2, sûr) Combien de fois la partition de « Vexations », d'Erik Satie, invite-t-elle à jouer son motif ?
  **840 fois : un concert complet a duré plus de 18 heures.**
  Leurres : 100 fois, une pour chaque année du siècle. · Jusqu'à ce que le dernier spectateur soit parti. · 12 fois, une par mois de l'année.
  Sources : <https://en.wikipedia.org/wiki/Vexations> ; <https://boweryboyshistory.com/?p=1098>
- `bir-08` (difficulté 2, sûr) Pourquoi le batteur des Beatles s'appelle-t-il Ringo ?
  **À cause des nombreuses bagues (« rings ») qu'il portait aux doigts.**
  Leurres : C'était le nom de son premier chien. · Il sonnait les cloches (« ring ») de son église. · Un journaliste l'avait confondu avec un boxeur.
  Sources : <https://fr.vikidia.org/wiki/Ringo_Starr> ; <https://www.universalis.fr/encyclopedie/ringo-starr/>
- `bir-09` (difficulté 2, sûr) Combien l'étudiant qui a dessiné la langue des Rolling Stones a-t-il été payé, en 1970 ?
  **50 livres, puis 200 de plus deux ans après, pour le succès du logo.**
  Leurres : Rien : il a été payé en places de concert. · Un pourcentage sur chaque t-shirt vendu. · 10 000 livres, une fortune pour l'époque.
  Sources : <https://www.theglobeandmail.com/arts/rolling-stones-put-their-mouth-where-the-money-is/article18249074> ; <https://en.wikipedia.org/wiki/Tongue_and_lips_logo>
- `bir-10` (difficulté 1, sûr) Pourquoi surnommait-on Vivaldi « le Prêtre roux » ?
  **Il avait été ordonné prêtre et avait les cheveux roux.**
  Leurres : Il célébrait la messe en habit rouge. · Il buvait du vin rouge pendant ses concerts. · Il habitait le quartier des teinturiers de Venise.
  Sources : <https://www.larousse.fr/encyclopedie/musdico/Antonio_Vivaldi/170571> ; <https://www.rtbf.be/article/antonio-vivaldi-le-pretre-roux-qui-faisait-danser-les-saisons-11553927>

### Records et règles du sport (`bluff-records-sport`)

- `brs-01` (difficulté 2, sûr) Combien de temps a duré le match entre John Isner et Nicolas Mahut, à Wimbledon en 2010 ?
  **11 heures et 5 minutes, réparties sur trois jours.**
  Leurres : 6 heures, sans aucune pause. · Deux jours entiers, à cause de la pluie. · 14 heures, un record battu depuis.
  Sources : <https://en.wikipedia.org/wiki/Isner%E2%80%93Mahut_match_at_the_2010_Wimbledon_Championships> ; <https://www.tennismajors.com/wimbledon-news/june-24-2010-the-day-marathon-men-isner-and-mahut-completed-the-longest-match-in-history-267343.html>
- `brs-02` (difficulté 2, sûr) Pourquoi le marathon mesure-t-il 42,195 km ?
  **En 1908, on l'a allongé pour partir sous les fenêtres du château de Windsor.**
  Leurres : C'est la distance exacte entre Marathon et Athènes. · Un mile a été ajouté par une erreur de mesure. · Le premier vainqueur s'était perdu et avait couru plus.
  Sources : <https://www.universalis.fr/encyclopedie/1908-4es-jeux-olympiques-d-ete/19-24-juillet/> ; <https://www.marathons.com/grand-format/running-pourquoi-la-distance-dun-marathon-est-elle-de-42195-km/>
- `brs-03` (difficulté 2, sûr) Comment s'appelait le volley-ball à son invention, en 1895 ?
  **La « mintonette ».**
  Leurres : Le « tennis-ballon ». · La « paume volante ». · Le « filet-ball ».
  Sources : <https://www.volleyhall.org/william-g-morgan> ; <https://www.fivb.com/volleyball/the-game/history/>
- `brs-04` (difficulté 2, sûr) Qui était Roland Garros, dont le stade de tennis porte le nom ?
  **Un aviateur, le premier à traverser la Méditerranée en avion, en 1913.**
  Leurres : Le premier champion de France de tennis. · L'architecte qui a dessiné les courts en terre battue. · Le maire de Paris qui a offert le terrain.
  Sources : <https://www.herodote.net/Un_aviateur_feru_de_mecanique-synthese-2036.php> ; <https://fr.vikidia.org/wiki/Roland_Garros>
- `brs-05` (difficulté 2, sûr) Qu'a fait le Français Lucien Laurent le 13 juillet 1930, en Uruguay ?
  **Il a marqué le tout premier but de l'histoire de la Coupe du monde.**
  Leurres : Il a arbitré la finale de la première Coupe du monde. · Il a été le premier joueur expulsé d'une Coupe du monde. · Il a dessiné le premier ballon officiel du tournoi.
  Sources : <https://inside.fifa.com/fr/news/lucien-laurent-le-tout-premier> ; <https://www.fff.fr/equipe-nationale/joueur/8841-laurent-lucien/fiche.html>
- `brs-06` (difficulté 2, sûr) D'où vient le surnom de « lanterne rouge » donné au dernier du Tour de France ?
  **Du feu rouge accroché au dernier wagon des trains.**
  Leurres : D'une lampe qu'il devait porter pour rouler de nuit. · Du maillot rouge qu'il portait autrefois. · D'un café parisien où il recevait un repas offert.
  Sources : <https://en.wikipedia.org/wiki/Lanterne_rouge> ; <https://mprnews.org/story/2015/07/11/npr-thread-books-lanterne-rouge>
- `brs-07` (difficulté 1, sûr) Comment concouraient les athlètes des Jeux olympiques antiques ?
  **Nus : le mot « gymnase » vient du grec « gymnos », nu.**
  Leurres : Masqués, pour que les juges ne les reconnaissent pas. · Avec des sandales lestées de plomb. · En armure, pour rappeler la guerre.
  Sources : <https://fr.vikidia.org/wiki/Gymnase_(Gr%C3%A8ce_antique)> ; <https://www.slate.fr/story/213366/athletes-olympiques-concourir-nus-tradition-grece-antique>
- `brs-08` (difficulté 1, sûr) Pourquoi les lutteurs de sumo jettent-ils du sel avant leurs combats ?
  **Pour purifier l'arène, selon une tradition shinto.**
  Leurres : Pour que leurs pieds ne glissent pas sur la terre battue. · Pour saluer la mer, d'où venaient les premiers lutteurs. · Pour compter les combats gagnés pendant le tournoi.
  Sources : <https://www.japan-experience.com/fr/preparer-voyage/savoir/comprendre-le-japon/le-sumo> ; <https://www.worldhistory.org/trans/fr/1-15881/sumo/>
- `brs-09` (difficulté 1, sûr) D'où vient le nom « ping-pong » ?
  **Du bruit de la balle sur la raquette, puis sur la table.**
  Leurres : De ses deux inventeurs chinois, Ping et Pong. · D'une marque de raquettes japonaise. · D'un mot anglais qui veut dire « aller-retour ».
  Sources : <https://www.lalanguefrancaise.com/dictionnaire/definition/ping-pong> ; <https://languagelog.ldc.upenn.edu/nll/?p=43424>
- `brs-10` (difficulté 2, sûr) Pourquoi un parcours de golf compte-t-il 18 trous ?
  **En 1764, St Andrews a fusionné des trous trop courts et est passé de 22 à 18.**
  Leurres : C'est le nombre de gorgées d'une bouteille de whisky. · Il fallait 18 balles pour remplir un seau réglementaire. · Un roi d'Écosse avait 18 enfants, un trou chacun.
  Sources : <https://www.golfdigest.com/story/did-you-know-why-does-a-golf-course-have-18-holes> ; <https://en.wikipedia.org/wiki/Old_Course_at_St_Andrews>

### Frontières insolites (`bluff-frontieres-insolites`)

- `bfi-01` (difficulté 2, sûr) Qu'a de particulier Point Roberts, une petite ville américaine ?
  **Par la route, on ne peut l'atteindre qu'en traversant le Canada.**
  Leurres : Elle n'a pas de rues, seulement des canaux. · Elle change d'État américain chaque année. · Elle est construite sur un ancien porte-avions.
  Sources : <https://cottagelife.com/general/point-roberts-wash-a-quirky-enclave-across-the-border-from-vancouver/> ; <https://www.kuow.org/stories/ferry-service-boosted-to-u-s-enclave-of-point-roberts-which-is-cut-off-by-canada>
- `bfi-02` (difficulté 2, sûr) Qu'a d'étonnant la ville de Llívia, dans les Pyrénées ?
  **C'est une ville espagnole entièrement entourée par la France.**
  Leurres : Elle ne reçoit jamais d'ombre à midi. · Ses habitants votent à la fois en France et en Espagne. · Elle appartient à Andorre depuis un pari perdu.
  Sources : <https://www.revueconflits.com/llivia-le-village-espagnol-insere-en-france/> ; <https://www.presse-citron.net/au-beau-milieu-de-la-france-il-existe-un-village-espagnol-le-saviez-vous/>
- `bfi-03` (difficulté 2, sûr) Où la Bolivie, qui n'a aucun accès à la mer, entretient-elle une marine militaire ?
  **Sur le lac Titicaca, à près de 3 800 mètres d'altitude.**
  Leurres : Sur l'Amazone, dans un port loué au Brésil. · Dans un port chilien prêté une semaine par an. · En mer, sur des navires loués à l'Argentine.
  Sources : <https://foreignpolicy.com/2008/08/28/a-navy-without-an-ocean/> ; <https://countryreports.org/fr/articles/bolivia-travel-guide>
- `bfi-04` (difficulté 3, sûr) Quelle dimension de l'Australie dépasse celle de la Lune ?
  **Sa largeur : environ 4 000 km, contre 3 474 km pour le diamètre de la Lune.**
  Leurres : Sa surface, deux fois plus grande. · Son périmètre, plus long que l'équateur lunaire. · Son plus haut sommet, plus haut que les montagnes lunaires.
  Sources : <https://www.snopes.com/fact-check/australia-wider-than-earths-moon/> ; <https://www.universal-sci.com/headlines/2019/7/26/how-big-is-the-moon-let-me-compare->
- `bfi-05` (difficulté 2, sûr) Qu'a d'unique la république de Nauru, dans le Pacifique ?
  **Elle n'a pas de capitale officielle : le gouvernement siège à Yaren.**
  Leurres : Elle n'a ni routes ni voitures, seulement des vélos. · Elle a deux drapeaux, un pour le jour et un pour la nuit. · Elle est dirigée par un conseil de dix enfants.
  Sources : <https://www.universalis.fr/encyclopedie/nauru/> ; <https://fr.vikidia.org/wiki/Nauru>
- `bfi-06` (difficulté 3, sûr) Qu'ont en commun le Liechtenstein et l'Ouzbékistan ?
  **Ils sont doublement enclavés : tous leurs voisins sont eux aussi privés de mer.**
  Leurres : Ils n'ont aucune rivière sur leur territoire. · Leur capitale est la ville la plus haute du pays. · Ils interdisent les voitures le dimanche.
  Sources : <https://www.techno-science.net/fr/definitions/enclave> ; <https://fr.vikidia.org/wiki/Ouzb%C3%A9kistan>
- `bfi-07` (difficulté 2, sûr) Quelle part des lacs du monde se trouve au Canada ?
  **Environ 60 % : plus que dans tout le reste du monde réuni.**
  Leurres : Environ 10 %, surtout près des Grands Lacs. · Un quart, presque tous gelés toute l'année. · Un tiers, partagé avec les États-Unis.
  Sources : <https://www.asc-csa.gc.ca/eng/multimedia/search/image/17643> ; <https://dailygeekshow.com/lacs-canada/>
- `bfi-08` (difficulté 1, sûr) Pourquoi flotte-t-on sans effort dans la mer Morte ?
  **Son eau est environ huit fois plus salée que celle de l'océan.**
  Leurres : Des bulles de gaz remontent sans cesse du fond. · Une source chaude pousse l'eau vers le haut. · Le fond n'est qu'à un mètre de profondeur partout.
  Sources : <https://fr.vikidia.org/wiki/Mer_Morte> ; <https://figaronautisme.meteoconsult.fr/actus-nautisme-lifestyle/2026-08-14/91070-la-mer-morte-pourquoi-cette-mer-nen-est-pas-vraiment-une>
- `bfi-09` (difficulté 2, sûr) Combien de fuseaux horaires traversent la Russie ?
  **11, de Kaliningrad au Kamtchatka.**
  Leurres : 5, un par grande région. · 24, un pour chaque heure. · Un seul : tout le pays vit à l'heure de Moscou.
  Sources : <https://www.voyageursdumonde.fr/voyage-sur-mesure/voyages/guide-voyage/russie/infos-pratiques/guide-de-voyage> ; <https://www.thewomtravel.fr/destinations/actualites-voyage/fuseau-horaire-curiosites.html>
- `bfi-10` (difficulté 1, sûr) Quelle forme a le territoire du Chili ?
  **Une bande d'environ 4 300 km de long sur 180 km de large en moyenne.**
  Leurres : Un carré presque parfait de 1 000 km de côté. · Un anneau autour d'un immense lac central. · Un triangle dont chaque côté touche un océan.
  Sources : <https://www.terdav.com/guide-voyage/chili/carte-identite> ; <https://fr.vikidia.org/wiki/Chili_(pays)>

### Histoires de cuisine (`bluff-histoires-cuisine`)

- `bch-01` (difficulté 1, sûr) Selon la légende, pourquoi le comte de Sandwich se faisait-il servir de la viande entre deux tranches de pain ?
  **Pour manger sans quitter sa table de jeu.**
  Leurres : Pour cacher sa viande à son médecin. · Pour nourrir son cheval pendant une course. · Pour déjeuner sur un bateau qui tanguait.
  Sources : <https://www.britannica.com/print/article/522257> ; <https://www.history.com/.amp/news/sandwich-inventor-john-montagu-earl-of-sandwich>
- `bch-02` (difficulté 2, sûr) De quelles couleurs étaient le plus souvent les carottes avant le XVIIe siècle ?
  **Violettes, jaunes ou blanches : l'orange a été sélectionnée aux Pays-Bas.**
  Leurres : Rouge vif, comme les radis. · Noires, et on n'en mangeait que les feuilles. · Vertes, car on les récoltait avant maturité.
  Sources : <https://www.academie-agriculture.fr/sites/default/files/publications/encyclopedie/la_carotte_cultivee.pdf> ; <https://www.futura-sciences.com/planete/definitions/botanique-carotte-7429/>
- `bch-03` (difficulté 2, sûr) Selon la tradition, pour qui la pizza Margherita a-t-elle été créée, en 1889 ?
  **Pour la reine Marguerite d'Italie, aux couleurs du drapeau italien.**
  Leurres : Pour une serveuse de Naples nommée Margherita. · Pour la fille du pizzaïolo, le jour de ses noces. · Pour une chanteuse d'opéra en tournée à Naples.
  Sources : <https://www.nationalgeographic.com/history/history-magazine/article/pizza-margherita-may-be-fit-for-a-queen-but-was-it-named-after-one> ; <https://www.historyhit.com/origins-of-the-margherita-pizza/>
- `bch-04` (difficulté 2, sûr) Qu'était le ketchup à l'origine, en Asie ?
  **Une sauce de poisson fermentée, sans aucune tomate.**
  Leurres : Une confiture de mangue épicée. · Un sirop de riz contre la toux. · Une pâte de piment pour conserver la viande.
  Sources : <https://www.alimentarium.org/fr/node/1295> ; <https://www.chowhound.com/1485336/ketchup-history-original-ingredients>
- `bch-05` (difficulté 1, sûr) Que signifie le mot italien « tiramisu » ?
  **« Tire-moi vers le haut », c'est-à-dire « remonte-moi le moral ».**
  Leurres : « Petit nuage de Trévise ». · « Gâteau du dimanche », en dialecte vénitien. · « Café des amoureux ».
  Sources : <https://www.europe1.fr/node/763342> ; <https://www.routard.com/fr/mag/dossier/a/recette-du-tiramisu-classique>
- `bch-06` (difficulté 2, sûr) Où sont nés les cookies aux pépites de chocolat, vers 1938 ?
  **Dans une auberge du Massachusetts, le Toll House Inn.**
  Leurres : Dans une usine de biscuits pour soldats. · Dans les cuisines de la Maison-Blanche. · Dans une boulangerie française de New York.
  Sources : <https://www.saturdayeveningpost.com/2025/09/missing-in-history-cookie-queen-ruth-graves-wakefield/> ; <https://omeka.flo.org/fsu/s/cookbook-collection/page/About_Ruth_Wakefield>
- `bch-07` (difficulté 2, sûr) Qui a inventé l'esquimau glacé Popsicle, en 1905 ?
  **Un garçon de 11 ans, qui avait oublié sa boisson dehors une nuit froide.**
  Leurres : Un vendeur de glaces de Coney Island. · Un médecin qui voulait soigner les maux de gorge. · Un explorateur de retour du pôle Nord.
  Sources : <https://www.history.com/news/frozen-history-the-story-of-the-popsicle> ; <https://www.mentalfloss.com/article/66615/how-distracted-11-year-old-invented-popsicle>
- `bch-08` (difficulté 2, sûr) Comment le Coca-Cola a-t-il d'abord été vendu, en 1886 ?
  **Comme une boisson tonique, dans une pharmacie d'Atlanta.**
  Leurres : Comme une limonade pour enfants, dans les fêtes foraines. · Comme un colorant pour les gâteaux. · Comme une boisson réservée à l'armée.
  Sources : <https://coca-cola.com/xf/en/about-us/faq/how-was-coca-cola-invented> ; <https://www.todayifoundout.com/index.php/2013/03/this-day-in-history-civil-war-veteran-and-morphine-addict-john-pemberton-invents-coca-cola-2/>
- `bch-09` (difficulté 2, sûr) Pourquoi l'ancêtre du Nutella a-t-il été inventé, après la Seconde Guerre mondiale ?
  **Le cacao manquait : on l'a mélangé à des noisettes, abondantes dans le Piémont.**
  Leurres : Pour écouler les stocks de lait en poudre de l'armée. · Pour remplacer le beurre, interdit pendant la guerre. · Pour un concours de pâtissiers organisé à Turin.
  Sources : <https://www.ebsco.com/research-starters/history/nutella/> ; <https://www.lsa-conso.fr/produits/nutella,133344>
- `bch-10` (difficulté 2, sûr) Selon la légende, comment est née la tarte Tatin ?
  **Une des sœurs Tatin aurait oublié la pâte et l'aurait ajoutée par-dessus les pommes.**
  Leurres : Un client aurait renversé sa tarte et exigé de la manger ainsi. · Elle serait née d'un pari entre deux chefs parisiens. · Elle aurait été servie à l'envers à un roi qui mangeait couché.
  Sources : <https://www.slate.fr/story/93575/vraie-recette-tarte-tatin> ; <https://www.slate.fr/story/109065/hasards-serendipite-recettes>

## Reformulé ou écarté pendant la rédaction

- Écartés faute de source fiable : le titre provisoire « King of the Jungle » du « Roi lion », le record de 22 Oscars de Walt Disney (seulement des sites peu fiables), les 127 prises de « Shining » (chiffre contesté), l'origine viennoise du croissant (légende sans document).
- Légendes présentées comme telles dans l'énoncé : la panique devant le train des frères Lumière, le comte de Sandwich à sa table de jeu, la pizza Margherita (lettre de 1889 contestée), la tarte Tatin, le récit de Beethoven tourné vers le public, la « Lettre à Élise » (hypothèse Thérèse).
- E.T. : le refus de Mars est contesté par l'entreprise, d'où « aurait refusé ».
- Golf : le leurre du whisky reprend une légende répandue mais fausse (18 gorgées) : c'est voulu.
- Mer Morte : profondeur et altitude varient selon l'année ; la réponse ne cite que la salinité (environ huit fois celle de l'océan).
- Liechtenstein et Ouzbékistan : leurres écartés parce qu'en partie vrais (même air d'hymne que le Royaume-Uni pour le Liechtenstein, fondation en 1719).
