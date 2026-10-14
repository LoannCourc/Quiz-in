# Relecture du lot Q2 : 10 quiz

Lot Q2 du plan de contenu (octobre 2026) : 10 quiz de 10 questions, ajoutés le 2026-10-14, tous marqués « provisoire, à relire (lot Q2) ». En cas de différence, c'est le fichier JSON de `content/quizzes/` qui fait foi.

- Quiz faciles et moyens : faits classiques, certitude « sûr » ou « à vérifier » ; tout doute a été retiré. Questions de difficulté 3 : vérifiées en ligne.
- Quiz difficiles : deux sources par réponse.
- Après relecture : `npm run build` dans `content/`, puis réimport de `/quizzes` puis de `/questions` (jamais la racine).

## À vérifier en priorité (0)

Aucune question marquée « à vérifier » : les points douteux rencontrés pendant la rédaction ont été retirés ou reformulés (voir la fin du document).

## Les 10 quiz

| Quiz | Identifiant | Thème | Niveau | Public | Moyenne |
|---|---|---|---|---|---|
| L'Égypte des pharaons | `egypte-ancienne` | Histoire | Facile | Tout public | 1,3 |
| Révolution et Empire | `revolution-empire` | Histoire | Difficile | Experts | 2,3 |
| Le tennis | `tennis` | Sport | Facile | Tout public | 1,5 |
| Le cyclisme et le Tour de France | `cyclisme` | Sport | Moyen | Tout public | 2,0 |
| La chanson française | `chanson-francaise` | Musique | Moyen | Tout public | 2,1 |
| Les capitales d'Europe | `capitales-europe` | Géographie | Facile | Tout public | 1,3 |
| Îles et archipels | `iles-archipels` | Géographie | Difficile | Experts | 2,3 |
| Au jardin | `au-jardin` | Loisirs | Facile | Tout public | 1,3 |
| Les jeux de cartes | `jeux-de-cartes` | Loisirs | Moyen | Tout public | 1,8 |
| Le système solaire | `systeme-solaire` | Sciences et nature | Moyen | Tout public | 2,0 |

## Toutes les questions

### L'Égypte des pharaons (`egypte-ancienne`)

- `eg-01` (difficulté 1, sûr) Grâce à quel fleuve la civilisation de l'Égypte ancienne a-t-elle pu prospérer ?
  **B. Le Nil** — autres : Le Tigre · L'Euphrate · Le Jourdain
  Ses crues annuelles fertilisaient les terres le long de ses rives.
- `eg-02` (difficulté 1, sûr) Comment appelait-on les rois de l'Égypte ancienne ?
  **D. Les pharaons** — autres : Les sultans · Les califes · Les tsars
  Ils étaient considérés comme des dieux vivants.
- `eg-03` (difficulté 1, sûr) Près de quelle ville se dressent les grandes pyramides de Gizeh ?
  **A. Le Caire** — autres : Alexandrie · Louxor · Assouan
  Gizeh fait aujourd'hui partie de l'agglomération du Caire.
- `eg-04` (difficulté 1, sûr) Quelle créature à corps de lion et tête humaine veille près des pyramides de Gizeh ?
  **C. Le Sphinx** — autres : Le griffon · La chimère · Le centaure
  Il est taillé directement dans la roche du plateau.
- `eg-05` (difficulté 2, sûr) Quel jeune pharaon est célèbre pour son tombeau découvert presque intact en 1922 ?
  **C. Toutânkhamon** — autres : Ramsès II · Khéops · Akhenaton
  Le tombeau est découvert par l'archéologue Howard Carter.
- `eg-06` (difficulté 1, sûr) Comment appelle-t-on un corps conservé par embaumement et enveloppé de bandelettes ?
  **A. Une momie** — autres : Un sarcophage · Une statue · Un fossile
  Le sarcophage, lui, est le cercueil qui la contient.
- `eg-07` (difficulté 2, sûr) Quel Français a déchiffré les hiéroglyphes grâce à la pierre de Rosette ?
  **D. Jean-François Champollion** — autres : Auguste Mariette · Gaston Maspero · Vivant Denon
  Il présente sa découverte en 1822.
- `eg-08` (difficulté 1, sûr) Quelle reine d'Égypte fut l'alliée de Jules César puis de Marc Antoine ?
  **B. Cléopâtre** — autres : Néfertiti · Hatchepsout · Néfertari
  Elle est la dernière reine de l'Égypte ancienne.
- `eg-09` (difficulté 1, sûr) Sur quel support, fabriqué à partir d'une plante, les Égyptiens écrivaient-ils ?
  **A. Le papyrus** — autres : Le parchemin · Le bambou · La soie
  La plante poussait en abondance au bord du Nil.
- `eg-10` (difficulté 2, sûr) Quel dieu égyptien à tête de chacal veillait sur l'embaumement des morts ?
  **C. Anubis** — autres : Horus · Râ · Osiris
  Horus, lui, a une tête de faucon.

### Révolution et Empire (`revolution-empire`)

- `re-01` (difficulté 2, sûr) En quelle année la Première République française est-elle proclamée ?
  **D. 1792** — autres : 1789 · 1793 · 1799
  Elle est proclamée le 21 septembre 1792, au lendemain de Valmy.
  Sources : <https://www.musee-orsay.fr/fr/node/66> ; <https://fr.vikidia.org/wiki/Premi%C3%A8re_R%C3%A9publique_(France)>
- `re-02` (difficulté 2, sûr) Quelle victoire de Napoléon, en 1805, est surnommée la « bataille des Trois Empereurs » ?
  **A. Austerlitz** — autres : Iéna · Wagram · Eylau
  Napoléon y bat le tsar Alexandre Ier et l'empereur d'Autriche François II.
  Sources : <https://www.napoleon.org/histoire-des-2-empires/dossiers-thematiques/la-victoire-dausterlitz-2-decembre-1805/> ; <https://www.herodote.net/2_decembre_1805-evenement-18051202.php>
- `re-03` (difficulté 2, sûr) Sur quelle île Napoléon est-il exilé une première fois, en 1814 ?
  **C. L'île d'Elbe** — autres : La Corse · Sainte-Hélène · L'île de Ré
  Il s'en échappe en 1815 pour les Cent-Jours.
  Sources : <https://www.napoleon.org/magazine/lieux/ile-delbe/> ; <https://www.herodote.net/6_avril_1814-evenement-18140406.php>
- `re-04` (difficulté 2, sûr) Sur quelle île Napoléon meurt-il, en 1821 ?
  **C. Sainte-Hélène** — autres : L'île d'Elbe · Malte · La Martinique
  Il y meurt le 5 mai 1821, en plein Atlantique Sud.
  Sources : <https://www.napoleon.org/jeunes-historiens/napodoc/napoleon-en-exil-a-sainte-helene-1815-1821/> ; <https://www.napoleon.org/wp-content/uploads/2016/05/saintehelenejunioriconographie.pdf>
- `re-05` (difficulté 2, sûr) Comment appelle-t-on la période de 1793-1794 marquée par de très nombreuses exécutions ?
  **A. La Terreur** — autres : La Restauration · Le Directoire · Le Consulat
  Elle prend fin avec la chute de Robespierre, en juillet 1794.
  Sources : <https://www.larousse.fr/encyclopedie/divers/la_Terreur/146370> ; <https://fr.vikidia.org/wiki/Terreur_(R%C3%A9volution_fran%C3%A7aise)>
- `re-06` (difficulté 3, sûr) Sous quel nom de mois révolutionnaire est connu le coup d'État de Bonaparte du 9 novembre 1799 ?
  **D. Brumaire** — autres : Thermidor · Germinal · Vendémiaire
  Le 18 brumaire an VIII met fin au Directoire et ouvre le Consulat.
  Sources : <https://en.wikipedia.org/wiki/Coup_of_18_Brumaire> ; <https://www.napoleon.org/en/history-of-the-two-empires/articles/18-brumaire-the-context-and-course-of-a-coup-detat>
- `re-07` (difficulté 2, sûr) Comment s'appelle le serment prêté le 20 juin 1789 à Versailles par les députés du tiers état ?
  **B. Le serment du Jeu de paume** — autres : Le serment des Horaces · Le serment de Strasbourg · Le serment du Grütli
  Ils jurent de ne pas se séparer avant d'avoir donné une constitution à la France.
  Sources : <https://fr.vikidia.org/wiki/Serment_du_Jeu_de_paume> ; <https://www.schoolmouv.fr/evenements-historiques/serment-de-jeu-de-paume-20-juin-1789/evenement-historique>
- `re-08` (difficulté 3, sûr) En quelle année Napoléon épouse-t-il Marie-Louise d'Autriche ?
  **A. 1810** — autres : 1804 · 1807 · 1812
  Le mariage religieux a lieu le 2 avril 1810, au Louvre.
  Sources : <https://www.napoleon.org/histoire-des-2-empires/chronologies/1810-le-mariage-de-napoleon-ier-et-marie-louise-dautriche/> ; <https://www.herodote.net/2_avril_1810-evenement-18100402.php>
- `re-09` (difficulté 3, sûr) Sous quel nom les Russes désignent-ils la bataille de 1812 que les Français appellent « la Moskova » ?
  **C. Borodino** — autres : Smolensk · La Bérézina · Friedland
  Elle a lieu le 7 septembre 1812, à une centaine de kilomètres de Moscou.
  Sources : <https://www.universalis.fr/encyclopedie/moskova-bataille-de-borodino/> ; <https://www.herodote.net/7_septembre_1812-evenement-18120907.php>
- `re-10` (difficulté 2, sûr) Quel texte, promulgué le 21 mars 1804, rassemble les lois civiles des Français ?
  **B. Le Code civil** — autres : Le Concordat · La Déclaration des droits de l'homme · La Constitution de l'an VIII
  On l'appelle aussi Code Napoléon.
  Sources : <https://www.napoleon.org/histoire-des-2-empires/dossiers-thematiques/la-promulgation-du-code-civil-des-francais-21-mars-1804/> ; <https://www.herodote.net/21_mars_1804-evenement-18040322.php>

### Le tennis (`tennis`)

- `tn-01` (difficulté 1, sûr) Au tennis, comment appelle-t-on un score de 40 partout ?
  **A. Égalité** — autres : Avantage · Jeu blanc · Balle de match
  Il faut ensuite gagner deux points d'affilée pour remporter le jeu.
- `tn-02` (difficulté 1, sûr) Sur quelle surface se joue le tournoi de Wimbledon ?
  **C. Le gazon** — autres : La terre battue · Le dur · La moquette
  C'est le plus ancien tournoi de tennis du monde.
- `tn-03` (difficulté 2, sûr) Quel joueur espagnol a remporté quatorze fois Roland-Garros ?
  **C. Rafael Nadal** — autres : Carlos Alcaraz · David Ferrer · Carlos Moyá
  Il a remporté son premier titre à Paris en 2005.
- `tn-04` (difficulté 1, sûr) Combien de tournois forment le Grand Chelem ?
  **A. 4** — autres : 3 · 5 · 6
  Open d'Australie, Roland-Garros, Wimbledon et US Open.
- `tn-05` (difficulté 2, sûr) Comment appelle-t-on un service gagnant que l'adversaire ne touche même pas ?
  **D. Un ace** — autres : Un let · Une volée · Un lob
  On dit aussi « un as ».
- `tn-06` (difficulté 2, sûr) Quelle compétition oppose, depuis 1900, des équipes nationales masculines de tennis ?
  **B. La coupe Davis** — autres : La coupe Hopman · La Laver Cup · Le Masters
  Elle porte le nom de son fondateur, l'Américain Dwight Davis.
- `tn-07` (difficulté 1, sûr) Dans quelle ville se joue l'US Open ?
  **A. New York** — autres : Los Angeles · Miami · Chicago
  Il se joue à Flushing Meadows, dans le quartier du Queens.
- `tn-08` (difficulté 1, sûr) Après zéro, quel est le premier score annoncé dans un jeu ?
  **C. 15** — autres : 10 · 1 · 5
  Puis viennent 30, 40 et le jeu.
- `tn-09` (difficulté 2, sûr) En simple messieurs, combien de sets faut-il gagner pour remporter un match de Grand Chelem ?
  **B. 3** — autres : 2 · 4 · 5
  Les matchs se jouent au meilleur des cinq sets.
- `tn-10` (difficulté 2, sûr) Quel Français a remporté Roland-Garros en 1983 ?
  **D. Yannick Noah** — autres : Henri Leconte · Guy Forget · Gaël Monfils
  Il bat le Suédois Mats Wilander en finale.

### Le cyclisme et le Tour de France (`cyclisme`)

- `cy-01` (difficulté 2, sûr) En quelle année a eu lieu le premier Tour de France ?
  **C. 1903** — autres : 1899 · 1910 · 1921
  Il est créé par le journal L'Auto.
- `cy-02` (difficulté 2, sûr) Quel maillot distingue le meilleur grimpeur du Tour de France ?
  **C. Le maillot à pois** — autres : Le maillot vert · Le maillot blanc · Le maillot jaune
  Il est blanc à pois rouges.
- `cy-03` (difficulté 2, sûr) De quelle couleur est le maillot du leader du classement par points, souvent un sprinteur ?
  **A. Vert** — autres : Blanc · Rouge · Bleu
  Les points se gagnent surtout aux arrivées et aux sprints intermédiaires.
- `cy-04` (difficulté 2, sûr) Quel Breton a remporté cinq fois le Tour de France, la dernière fois en 1985 ?
  **D. Bernard Hinault** — autres : Laurent Fignon · Louison Bobet · Raymond Poulidor
  On le surnommait « le Blaireau ».
- `cy-05` (difficulté 1, sûr) Comment appelle-t-on le groupe principal des coureurs pendant une course ?
  **B. Le peloton** — autres : L'échappée · La bordure · Le gruppetto
  Rouler à l'abri dans le peloton fait économiser beaucoup d'énergie.
- `cy-06` (difficulté 2, sûr) Quelle montée des Alpes, célèbre sur le Tour, compte 21 virages numérotés ?
  **A. L'Alpe d'Huez** — autres : Le col du Galibier · Le col de l'Izoard · Le col de la Madeleine
  Chaque virage porte le nom d'un vainqueur d'étape.
- `cy-07` (difficulté 2, sûr) Quel sommet du Vaucluse est surnommé le « Géant de Provence » ?
  **C. Le mont Ventoux** — autres : Le mont Aigoual · La montagne Sainte-Victoire · Le mont Lozère
  Son sommet, battu par les vents, ressemble à un paysage lunaire.
- `cy-08` (difficulté 2, sûr) Quelle course d'un jour, célèbre pour ses pavés, est surnommée « l'Enfer du Nord » ?
  **B. Paris-Roubaix** — autres : Milan-San Remo · Liège-Bastogne-Liège · Paris-Tours
  L'arrivée se juge sur le vélodrome de Roubaix.
- `cy-09` (difficulté 2, sûr) Quel coureur belge, surnommé « le Cannibale », a remporté cinq Tours de France ?
  **D. Eddy Merckx** — autres : Tom Boonen · Lucien Van Impe · Philippe Gilbert
  Il voulait gagner toutes les courses, d'où son surnom.
- `cy-10` (difficulté 3, sûr) Quel coureur a été le premier à remporter cinq fois le Tour de France ?
  **A. Jacques Anquetil** — autres : Eddy Merckx · Bernard Hinault · Louison Bobet
  Il gagne en 1957, puis de 1961 à 1964.
  Sources : <https://www.larousse.fr/encyclopedie/personnage/Jacques_Anquetil/105617> ; <https://simple.wikipedia.com/wiki/Jacques_Anquetil>

### La chanson française (`chanson-francaise`)

- `chf-01` (difficulté 1, sûr) Quel chanteur belge a écrit « Ne me quitte pas » ?
  **C. Jacques Brel** — autres : Salvatore Adamo · Julos Beaucarne · Arno
  La chanson date de 1959.
- `chf-02` (difficulté 2, sûr) Quel chanteur a interprété « La Bohème » et « Emmenez-moi » ?
  **A. Charles Aznavour** — autres : Gilbert Bécaud · Serge Reggiani · Yves Montand
  Il a chanté dans de nombreuses langues à travers le monde.
- `chf-03` (difficulté 2, sûr) Quel chanteur à la moustache et à la pipe a écrit « Les copains d'abord » ?
  **D. Georges Brassens** — autres : Jean Ferrat · Léo Ferré · Maxime Le Forestier
  Il s'accompagnait à la guitare.
- `chf-04` (difficulté 2, sûr) Quelle chanteuse a écrit et chanté « L'Aigle noir » ?
  **B. Barbara** — autres : Juliette Gréco · Anne Sylvestre · Dalida
  On la surnommait « la longue dame brune ».
- `chf-05` (difficulté 3, sûr) Quel artiste publie en 1971 l'album « Histoire de Melody Nelson » ?
  **A. Serge Gainsbourg** — autres : Michel Polnareff · Alain Bashung · Christophe
  Jane Birkin y prête sa voix au personnage de Melody.
  Sources : <https://en.wikipedia.org/wiki/Histoire_de_Melody_Nelson> ; <https://pennyblackmusic.co.uk/Home/Details?Id=19708>
- `chf-06` (difficulté 2, sûr) Quel chanteur a créé « Comme d'habitude », dont « My Way » est l'adaptation anglaise ?
  **C. Claude François** — autres : Johnny Hallyday · Michel Sardou · Eddy Mitchell
  Frank Sinatra en a fait un succès mondial sous le titre « My Way ».
- `chf-07` (difficulté 3, sûr) Avec quelle chanson France Gall remporte-t-elle l'Eurovision 1965 pour le Luxembourg ?
  **B. Poupée de cire, poupée de son** — autres : Ella, elle l'a · Résiste · Laisse tomber les filles
  La chanson est écrite par Serge Gainsbourg.
  Sources : <https://en.wikipedia.org/wiki/Poup%C3%A9e_de_cire,_poup%C3%A9e_de_son> ; <https://www.nostalgie.fr/artistes/france-gall/actus/france-gall-l-histoire-de-poupee-de-cire-poupee-de-son-354258>
- `chf-08` (difficulté 2, sûr) Quel chanteur a chanté « Le Sud » et « Le Téléfon » ?
  **D. Nino Ferrer** — autres : Michel Delpech · Joe Dassin · Hugues Aufray
  Il était d'origine italienne, né à Gênes.
- `chf-09` (difficulté 2, sûr) Quel groupe a chanté « L'Aventurier » au début des années 1980 ?
  **A. Indochine** — autres : Téléphone · Noir Désir · Les Rita Mitsouko
  Le chanteur du groupe est Nicola Sirkis.
- `chf-10` (difficulté 2, sûr) Quel écrivain et musicien a écrit la chanson « Le Déserteur » ?
  **C. Boris Vian** — autres : Jacques Prévert · Raymond Queneau · Serge Reggiani
  Il est aussi l'auteur du roman « L'Écume des jours ».

### Les capitales d'Europe (`capitales-europe`)

- `ce-01` (difficulté 1, sûr) Quelle est la capitale de l'Espagne ?
  **A. Madrid** — autres : Barcelone · Séville · Valence
  Elle se trouve au centre du pays.
- `ce-02` (difficulté 1, sûr) Quelle est la capitale de l'Allemagne ?
  **D. Berlin** — autres : Munich · Francfort · Hambourg
  Elle est redevenue la capitale de l'Allemagne réunifiée en 1990.
- `ce-03` (difficulté 1, sûr) Quelle est la capitale du Portugal ?
  **B. Lisbonne** — autres : Porto · Faro · Coimbra
  Elle est construite sur sept collines, au bord du Tage.
- `ce-04` (difficulté 1, sûr) Quelle est la capitale de la Belgique ?
  **A. Bruxelles** — autres : Anvers · Liège · Bruges
  Elle accueille aussi de nombreuses institutions européennes.
- `ce-05` (difficulté 1, sûr) Quelle est la capitale de la Grèce ?
  **C. Athènes** — autres : Thessalonique · Sparte · Héraklion
  L'Acropole la domine depuis l'Antiquité.
- `ce-06` (difficulté 1, sûr) Quelle est la capitale de l'Autriche ?
  **B. Vienne** — autres : Salzbourg · Graz · Innsbruck
  Elle est traversée par le Danube.
- `ce-07` (difficulté 2, sûr) Quelle ville accueille le gouvernement de la Suisse ?
  **D. Berne** — autres : Genève · Zurich · Lausanne
  La Suisse l'appelle officiellement « ville fédérale ».
- `ce-08` (difficulté 2, sûr) Quelle est la capitale de la Norvège ?
  **A. Oslo** — autres : Bergen · Trondheim · Stavanger
  Elle se trouve au fond d'un fjord.
- `ce-09` (difficulté 1, sûr) Quelle est la capitale de l'Irlande ?
  **C. Dublin** — autres : Cork · Galway · Belfast
  Belfast est la capitale de l'Irlande du Nord, au Royaume-Uni.
- `ce-10` (difficulté 2, sûr) Quelle est la capitale de la Pologne ?
  **C. Varsovie** — autres : Cracovie · Gdańsk · Łódź
  Elle est traversée par la Vistule.

### Îles et archipels (`iles-archipels`)

- `ia-01` (difficulté 1, sûr) Dans quel océan se trouve l'île de La Réunion ?
  **D. L'océan Indien** — autres : L'océan Atlantique · L'océan Pacifique · L'océan Arctique
  Elle fait partie de l'archipel des Mascareignes, à l'est de Madagascar.
  Sources : <https://www.larousse.fr/encyclopedie/departement/wd/138726> ; <https://www.universalis.fr/encyclopedie/ile-de-la-reunion/>
- `ia-02` (difficulté 2, sûr) De quel royaume le Groenland est-il un territoire autonome ?
  **B. Le Danemark** — autres : La Norvège · La Suède · Le Royaume-Uni
  Il dispose d'un large gouvernement autonome depuis 1979.
  Sources : <https://fr.vikidia.org/wiki/Groenland> ; <https://www.publicsenat.fr/actualites/international/menace-dannexion-par-les-etats-unis-quel-est-le-statut-du-groenland-au-danemark>
- `ia-03` (difficulté 2, sûr) Quelle est la plus grande île de la Méditerranée ?
  **A. La Sicile** — autres : La Sardaigne · Chypre · La Corse
  Elle couvre environ 25 700 km².
  Sources : <https://www.larousse.fr/encyclopedie/autre-region/Sicile/144226> ; <https://fr.vikidia.org/wiki/Sicile>
- `ia-04` (difficulté 2, sûr) À quel archipel espagnol appartient l'île de Tenerife ?
  **C. Les Canaries** — autres : Les Baléares · Les Açores · Les Bermudes
  C'est la plus grande île de l'archipel ; le Teide y culmine à 3 718 m.
  Sources : <https://fr.vikidia.org/wiki/Tenerife> ; <https://www.lonelyplanet.fr/destinations/europe/espagne/tenerife>
- `ia-05` (difficulté 2, sûr) Quel archipel portugais se trouve au milieu de l'Atlantique Nord ?
  **B. Les Açores** — autres : Les Canaries · Le Cap-Vert · Les Bermudes
  Ses neuf îles forment une région autonome du Portugal.
  Sources : <https://www.larousse.fr/encyclopedie/autre-region/A%C3%A7ores/103965> ; <https://axl.cefan.ulaval.ca/EtatsNsouverains/Acores.htm>
- `ia-06` (difficulté 3, sûr) À quel pays appartiennent les îles Galápagos ?
  **D. L'Équateur** — autres : Le Pérou · Le Chili · La Colombie
  Elles forment une province de l'Équateur, à environ 1 000 km de ses côtes.
  Sources : <https://www.universalis.fr/encyclopedie/archipel-des-galapagos/> ; <https://fr.vikidia.org/wiki/%C3%8Eles_Galapagos>
- `ia-07` (difficulté 3, sûr) Quelle île des Caraïbes est partagée entre Haïti et la République dominicaine ?
  **A. Hispaniola** — autres : Cuba · La Jamaïque · Porto Rico
  Haïti en occupe la partie ouest, la République dominicaine la partie est.
  Sources : <https://fr.vikidia.org/wiki/Hispaniola> ; <https://axl.cefan.ulaval.ca/amsudant/rep-dominicaine.htm>
- `ia-08` (difficulté 3, sûr) Quelle île de l'océan Indien est devenue en 2011 le 101e département français ?
  **C. Mayotte** — autres : La Réunion · La Martinique · La Guadeloupe
  La départementalisation est effective le 31 mars 2011.
  Sources : <https://www.maire-info.com/le-president-du-conseil-general-de-mayotte-qui-constitue-le-101e-departement-francais-et-le-cinquieme-departement-doutre-mer-a-ete-elu-article2-13619> ; <https://fr.geneawiki.com/wiki/Histoire_locale_Mayotte>
- `ia-09` (difficulté 2, sûr) À quelle collectivité française d'outre-mer appartient l'île de Tahiti ?
  **C. La Polynésie française** — autres : La Nouvelle-Calédonie · Wallis-et-Futuna · Clipperton
  Sa ville principale, Papeete, est la capitale de la Polynésie française.
  Sources : <https://fr.vikidia.org/wiki/Tahiti> ; <https://www.routard.com/fr/guide/oceanie/polynesie-francaise/archipel-de-la-societe/tahiti>
- `ia-10` (difficulté 3, sûr) Quelle île est partagée entre l'Indonésie, la Malaisie et le Brunei ?
  **A. Bornéo** — autres : Sumatra · Java · Célèbes
  La partie indonésienne, au sud, s'appelle Kalimantan.
  Sources : <https://www.larousse.fr/encyclopedie/autre-region/Born%C3%A9o/109526> ; <https://www.universalis.fr/encyclopedie/ile-de-borneo/>

### Au jardin (`au-jardin`)

- `jar-01` (difficulté 1, sûr) Quel outil sert à arroser les plantes ?
  **B. L'arrosoir** — autres : Le râteau · La brouette · La bêche
  Sa pomme percée de trous fait une pluie douce.
- `jar-02` (difficulté 1, sûr) Comment appelle-t-on le tas où les épluchures se transforment en engrais ?
  **A. Le compost** — autres : Le paillis · Le gazon · Le terrier
  Les vers de terre aident à décomposer les déchets.
- `jar-03` (difficulté 1, sûr) Quelle partie de la plante pousse sous la terre et puise l'eau ?
  **C. Les racines** — autres : Les feuilles · Les pétales · Les tiges
  Elles servent aussi à bien ancrer la plante dans le sol.
- `jar-04` (difficulté 1, sûr) Quel légume orange les lapins adorent-ils dans les dessins animés ?
  **B. La carotte** — autres : Le poireau · Le navet · Le chou
  On en mange la racine.
- `jar-05` (difficulté 1, sûr) Quel petit insecte rouge à points noirs mange les pucerons ?
  **D. La coccinelle** — autres : L'abeille · La sauterelle · La fourmi
  C'est une précieuse alliée du jardinier.
- `jar-06` (difficulté 1, sûr) En quelle saison sème-t-on la plupart des graines du potager ?
  **A. Au printemps** — autres : En été · En automne · En hiver
  Le sol se réchauffe et les jours rallongent.
- `jar-07` (difficulté 2, sûr) Quel fruit rouge pousse au ras du sol, sur des plants qui forment des stolons ?
  **C. La fraise** — autres : La cerise · La framboise · La groseille
  Les stolons sont de longues tiges qui donnent de nouveaux plants.
- `jar-08` (difficulté 1, sûr) Quelle grande fleur jaune se tourne vers le soleil quand elle est jeune ?
  **C. Le tournesol** — autres : Le pissenlit · La jonquille · La marguerite
  Ses graines donnent une huile très utilisée en cuisine.
- `jar-09` (difficulté 2, sûr) Comment appelle-t-on une plante qui repousse chaque année sans être replantée ?
  **A. Une vivace** — autres : Une annuelle · Une bisannuelle · Une grimpante
  Une annuelle, elle, vit une seule saison.
- `jar-10` (difficulté 2, sûr) Quel outil à deux lames sert à couper les tiges et les petites branches ?
  **D. Le sécateur** — autres : Le râteau · La binette · La bêche
  On le tient d'une seule main.

### Les jeux de cartes (`jeux-de-cartes`)

- `jc-01` (difficulté 1, sûr) Combien de cartes compte un jeu classique, sans les jokers ?
  **A. 52** — autres : 32 · 54 · 78
  Quatre couleurs de treize cartes.
- `jc-02` (difficulté 2, sûr) Combien de cartes utilise-t-on pour jouer à la belote ?
  **C. 32** — autres : 52 · 24 · 40
  On garde les cartes du 7 à l'as dans chaque couleur.
- `jc-03` (difficulté 2, sûr) Au tarot, combien y a-t-il d'atouts, sans compter l'Excuse ?
  **B. 21** — autres : 22 · 20 · 18
  Ils vont du Petit (le 1) au 21.
- `jc-04` (difficulté 2, sûr) Au tarot, quelle carte permet de ne pas fournir la couleur demandée ?
  **D. L'Excuse** — autres : Le Petit · Le joker · Le cavalier
  Elle est représentée par un musicien, parfois appelé le Fou.
- `jc-05` (difficulté 2, sûr) Au poker, comment appelle-t-on cinq cartes qui se suivent dans la même couleur ?
  **A. Une quinte flush** — autres : Un carré · Un full · Une couleur
  Avec l'as en tête, c'est une quinte flush royale.
- `jc-06` (difficulté 1, sûr) Quel jeu de cartes se joue seul, en rangeant les cartes par couleur et par ordre ?
  **C. Le solitaire** — autres : La belote · Le rami · Le poker
  On l'appelle aussi une patience.
- `jc-07` (difficulté 2, sûr) À la belote, que doit-on annoncer en jouant le roi et la dame d'atout ?
  **C. Belote et rebelote** — autres : Capot · Dix de der · Tierce
  L'annonce rapporte 20 points.
- `jc-08` (difficulté 2, sûr) Combien y a-t-il de figures (valets, dames et rois) dans un jeu de 52 cartes ?
  **A. 12** — autres : 16 · 8 · 13
  Trois figures dans chacune des quatre couleurs.
- `jc-09` (difficulté 3, sûr) Au tarot, comment appelle-t-on le fait de remporter le dernier pli avec le Petit ?
  **D. Le Petit au bout** — autres : Le chelem · La poignée · La garde
  Cette prime rapporte 10 points, multipliés selon le contrat.
  Sources : <https://regles2jeux.fr/les-primes-au-tarot/> ; <https://shogix.net/glossaire-lq>
- `jc-10` (difficulté 1, sûr) Combien de joueurs faut-il pour une partie de bridge classique ?
  **B. 4** — autres : 2 · 3 · 6
  Ils jouent deux contre deux, en équipes fixes.

### Le système solaire (`systeme-solaire`)

- `ss-01` (difficulté 1, sûr) Combien de planètes compte le système solaire ?
  **C. 8** — autres : 9 · 7 · 10
  Mercure, Vénus, la Terre, Mars, Jupiter, Saturne, Uranus et Neptune.
- `ss-02` (difficulté 1, sûr) Quelle planète est surnommée la « planète rouge » ?
  **B. Mars** — autres : Vénus · Jupiter · Mercure
  Sa couleur vient de l'oxyde de fer de son sol.
- `ss-03` (difficulté 1, sûr) Quelle planète est célèbre pour ses anneaux bien visibles au télescope ?
  **D. Saturne** — autres : Mars · Vénus · Mercure
  Ils sont faits de glace et de poussières.
- `ss-04` (difficulté 2, sûr) Quelle est la planète la plus chaude du système solaire ?
  **A. Vénus** — autres : Mercure · Mars · Jupiter
  Son épaisse atmosphère retient la chaleur, plus encore que sur Mercure.
- `ss-05` (difficulté 2, sûr) Depuis 2006, quel astre n'est plus considéré comme une planète, mais comme une planète naine ?
  **C. Pluton** — autres : Neptune · Mercure · La Lune
  La décision est prise par l'Union astronomique internationale.
- `ss-06` (difficulté 3, sûr) Combien de temps la lumière du Soleil met-elle, environ, pour atteindre la Terre ?
  **C. 8 minutes** — autres : 8 secondes · 8 heures · 1 seconde
  Environ 8 minutes et 20 secondes : on voit donc le Soleil tel qu'il était un peu plus tôt.
  Sources : <https://fr.vikidia.org/wiki/Soleil> ; <https://www.simplyscience.ch/fileadmin/user_upload/files/contenu/Enfants/Comics/l-annee-lumiere/annee-lumiere_A4.pdf>
- `ss-07` (difficulté 3, sûr) Quelle planète tourne presque couchée sur le côté, avec un axe incliné d'environ 98° ?
  **A. Uranus** — autres : Neptune · Saturne · Mars
  Chacun de ses pôles connaît un « été » d'une vingtaine d'années.
  Sources : <https://cnes.fr/dossiers/planete-uranus> ; <https://www.futura-sciences.com/sciences/actualites/astronomie-uranus-aurait-bascule-plusieurs-fois-34107/>
- `ss-08` (difficulté 2, sûr) Comment s'appelle la zone de petits corps rocheux située entre Mars et Jupiter ?
  **D. La ceinture d'astéroïdes** — autres : La ceinture de Kuiper · Le nuage d'Oort · La Voie lactée
  La ceinture de Kuiper, elle, se trouve au-delà de Neptune.
- `ss-09` (difficulté 2, sûr) Depuis le déclassement de Pluton, quelle est la planète la plus éloignée du Soleil ?
  **B. Neptune** — autres : Uranus · Saturne · Jupiter
  Elle met environ 165 ans à faire le tour du Soleil.
- `ss-10` (difficulté 3, sûr) Quel satellite de Jupiter est le plus grand satellite naturel du système solaire ?
  **A. Ganymède** — autres : Io · Europe · Callisto
  Il est même plus grand que la planète Mercure.
  Sources : <https://fr.vikidia.org/wiki/Ganym%C3%A8de_(satellite)> ; <https://www.techno-science.net/fr/definitions/ganymede-lune>

## Reformulé ou écarté pendant la rédaction

- Austerlitz : « bataille des Trois Empereurs » (Napoléon, Alexandre Ier, François II), sans détail sur les effectifs, que les sources donnent différemment.
- Île d'Elbe : la date d'arrivée varie légèrement selon les sources (3 ou 4 mai 1814) ; l'énoncé dit seulement « en 1814 ».
- Serment du Jeu de paume : le nombre de députés présents varie selon les sources ; il n'est pas demandé.
- Tour de France : écarté « dans quelle ville se termine le Tour » (arrivée à Nice en 2024, exception à la tradition des Champs-Élysées).
- Chanson française : « La Bohème » est chantée et composée par Aznavour mais écrite avec Jacques Plante, d'où « a interprété » plutôt que « a écrit » ; « Le Sud » posé sans année (album de 1974, succès en 1975).
- Capitales : la Suisse n'a pas de capitale officielle ; l'énoncé demande la ville qui accueille le gouvernement (Berne, « ville fédérale »).
- Îles : écarté « sur quelle île se trouve la capitale de l'Indonésie » (transfert en cours de Jakarta vers Nusantara).
- Lumière du Soleil : 8 min 19 s ou 8 min 20 s selon la distance ; la réponse dit « environ 8 minutes ».
