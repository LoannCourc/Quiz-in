# Relecture du lot B1 : 5 Bluff

Lot B1 du plan de contenu (octobre 2026) : 5 quiz Bluff de 10 questions, ajoutés le 2026-10-14, tous marqués « provisoire, à relire (lot B1) ». En cas de différence, c'est le fichier JSON de `content/quizzes/` qui fait foi.

- Chaque vraie réponse a été vérifiée en ligne (une ou deux sources par question, URL ci-dessous). Les anecdotes contestées sont présentées comme telles dans l'énoncé (« selon la légende », « selon… »).
- Les leurres sont inventés : ils doivent être crédibles mais faux.
- Après relecture : `npm run build` dans `content/`, puis réimport de `/quizzes` puis de `/questions` (jamais la racine).

## À vérifier en priorité (0)

Aucune question marquée « à vérifier » : les faits sans source fiable ont été retirés ou reformulés (voir la fin du document).

## Les 5 Bluff

| Quiz | Identifiant | Catégorie |
|---|---|---|
| Curiosités du monde | `bluff-curiosites-monde` | Géographie |
| Jeux et jouets | `bluff-jeux-jouets` | Loisirs |
| Secrets de tournage | `bluff-secrets-tournage` | Cinéma et séries |
| Les coulisses de la musique | `bluff-coulisses-musique` | Musique |
| Sport insolite | `bluff-sport-insolite` | Sport |

## Toutes les questions

### Curiosités du monde (`bluff-curiosites-monde`)

- `bcm-01` (difficulté 2, sûr) Qu'a de particulier le nom complet du village gallois surnommé Llanfair PG ?
  **Il compte 58 lettres : le plus long nom de lieu d'Europe en un seul mot.**
  Leurres : Il ne contient aucune voyelle, seulement des consonnes. · Il change d'orthographe chaque année, par tirage au sort. · Il se lit de la même façon à l'endroit et à l'envers.
  Sources : <https://www.routard.com/fr/guide/europe/pays-de-galles/north-of-wales/ile-d-anglesey-ynys-mon/llanfairpwllgwyngyll-gogerychwyrndrobwllllantysiliogogogoch> ; <https://laughingsquid.com/town-with-the-longest-name-in-europe/>
- `bcm-02` (difficulté 2, sûr) Qu'utilise le Bhoutan, en plus de la richesse produite, pour guider sa politique ?
  **Le « bonheur national brut », qui mesure le bien-être de ses habitants.**
  Leurres : Le nombre de sourires comptés chaque matin par des fonctionnaires. · La hauteur moyenne des arbres plantés par chaque habitant. · Le temps passé en famille, déclaré chaque mois.
  Sources : <https://www.letemps.ch/opinions/bonheur-national-brut-depasser-dogme-croissance> ; <https://reporterre.net/Notre-course-a-la-croissance-n-a-pas-de-sens>
- `bcm-03` (difficulté 2, sûr) Qu'est-ce que le point Nemo, dans le Pacifique Sud ?
  **Le point de l'océan le plus éloigné de toute terre, où l'on fait tomber les vieux satellites.**
  Leurres : Une fosse si profonde qu'aucun sous-marin n'en a jamais touché le fond. · Une île qui apparaît et disparaît au rythme des marées. · L'endroit où le capitaine Cook a perdu son navire.
  Sources : <https://www.slate.fr/story/165701/point-nemo-nulle-part> ; <https://www.neozone.org/insolite/ou-se-trouve-le-point-nemo-le-point-de-locean-le-plus-eloigne-de-toute-terre-emergee/>
- `bcm-04` (difficulté 2, sûr) Qu'a d'étonnant le lac Natron, en Tanzanie ?
  **Son eau très alcaline momifie les oiseaux morts sur ses rives.**
  Leurres : Son eau est si salée qu'elle ne gèle jamais, même la nuit. · Il se déplace de plusieurs mètres chaque année. · Il se vide entièrement en une nuit, une fois par siècle.
  Sources : <https://www.futura-sciences.com/planete/actualites/voyage-animaux-petrifies-lac-natron-mythe-realite-82553/> ; <https://dailygeekshow.com/animaux-petrifies-lac-natron/>
- `bcm-05` (difficulté 2, sûr) Quelle est la particularité du territoire de Bir Tawil, entre l'Égypte et le Soudan ?
  **Aucun des deux pays ne le revendique : c'est une terre sans maître.**
  Leurres : Il appartient aux deux pays à la fois, un jour sur deux. · Il est loué à une compagnie pétrolière pour 99 ans. · C'est le seul endroit du Sahara où il neige chaque hiver.
  Sources : <https://www.sporcle.com/blog/2017/09/a-history-of-bir-tawil> ; <https://opiniojuris.org/2014/07/16/man-king-daddys-little-princess-territorial-claim/>
- `bcm-06` (difficulté 2, sûr) Qu'a d'unique l'île des Faisans, sur la Bidassoa ?
  **Elle change de pays tous les six mois, entre la France et l'Espagne.**
  Leurres : Seuls les faisans ont le droit d'y vivre, par décret royal. · Elle n'est accessible qu'à marée basse, deux heures par an. · Elle a sa propre monnaie, le faisan d'argent.
  Sources : <https://www.slate.fr/societe/lexplication/pourquoi-france-espagne-echangent-ile-des-faisans-frontieres-bidassoa-histoire-rois-guerre-paix> ; <https://www.rtbf.be/article/cette-ile-passe-du-gouvernement-espagnol-a-francais-tous-les-6-mois-10902883>
- `bcm-07` (difficulté 2, sûr) Qu'ont fait les Kiribati en 1995, pour que tout le pays vive le même jour ?
  **Ils ont déplacé la ligne de changement de date autour de leurs îles.**
  Leurres : Ils ont supprimé le dimanche pour rattraper le décalage. · Ils ont adopté l'heure de Londres sur tout leur territoire. · Ils ont cédé leurs îles les plus à l'est à un pays voisin.
  Sources : <https://amusingplanet.com/2014/12/kiribati-true-land-of-rising-sun.html> ; <https://www.europe1.fr/societe/nouvel-an-ce-tout-petit-pays-est-deja-passe-en-2026-877008>
- `bcm-08` (difficulté 2, sûr) Pourquoi la rivière Caño Cristales, en Colombie, est-elle surnommée « la rivière aux cinq couleurs » ?
  **Une plante aquatique teinte son lit de rouge, de rose, de jaune et de vert.**
  Leurres : Des minerais colorés se dissolvent dans l'eau après les orages. · Cinq villages y déversent chacun une teinture différente. · Le soleil s'y reflète sur des cristaux de quartz.
  Sources : <https://colombia.travel/fr/la-macarena/cano-cristales-une-merveille-naturelle> ; <https://lepetitjournal.com/bogota/cano-cristales-riviere-aux-cinq-couleurs-une-des-nombreuses-merveilles-de-colombie-356448>
- `bcm-09` (difficulté 3, sûr) À quoi le salar d'Uyuni, en Bolivie, sert-il pour les satellites ?
  **Il est si plat qu'il sert à régler leurs altimètres.**
  Leurres : Son sel renvoie les signaux radio vers l'espace. · C'est le seul endroit sans aucun nuage de toute l'année. · Il sert de piste d'atterrissage d'urgence aux capsules.
  Sources : <https://en.wikipedia.org/wiki/Salar_de_Uyuni> ; <https://www.sierraclub.org/sierra/2008-6-november-december/field-trip/salar-de-uyuni-bolivia>
- `bcm-10` (difficulté 1, sûr) Que conserve-t-on dans un coffre-fort creusé dans une montagne du Svalbard, en Norvège ?
  **Des graines de cultures du monde entier, en cas de catastrophe.**
  Leurres : Les originaux de toutes les cartes du pôle Nord. · La réserve d'or des pays nordiques. · Des carottes de glace vieilles d'un million d'années.
  Sources : <https://www.lonelyplanet.fr/poi/norvege-lesvalbardnorvegecg-reserve-mondiale-de-semences-du-svalbard> ; <https://www.letemps.ch/sciences/environnement/reserve-mondiale-graines-prend-leau-cause-rechauffement-climatique>

### Jeux et jouets (`bluff-jeux-jouets`)

- `bjj-01` (difficulté 2, sûr) Que voulait dénoncer « The Landlord's Game », l'ancêtre du Monopoly breveté en 1904 ?
  **Les propriétaires qui s'enrichissent grâce aux loyers et aux monopoles.**
  Leurres : Les tricheurs aux cartes, très nombreux dans les trains américains. · La passion des enfants pour les jeux d'argent. · La lenteur des banques à prêter de l'argent.
  Sources : <https://en.wikipedia.org/wiki/The_Landlord%27s_Game> ; <https://www.history.com/news/monopoly-game-inventor-elizabeth-magie>
- `bjj-02` (difficulté 2, sûr) Que cachaient certains Monopoly envoyés aux prisonniers alliés, pendant la Seconde Guerre mondiale ?
  **Des cartes en soie, des boussoles et de vrais billets pour s'évader.**
  Leurres : Des messages codés de leurs familles, dans les cartes Chance. · Des graines de légumes à planter dans la cour du camp. · Des pièces de radio à assembler en secret.
  Sources : <https://snopes.com/fact-check/war-games-3/> ; <https://legacy.geog.ucsb.edu/monopoly-maps-and-the-great-escape/>
- `bjj-03` (difficulté 2, sûr) Selon la légende, d'où vient le nom du Frisbee ?
  **Des moules à tarte de la Frisbie Pie Company, que des étudiants s'amusaient à lancer.**
  Leurres : D'un chien nommé Frisbee qui rattrapait tout ce qu'on lui lançait. · Du sifflement que fait le disque en fendant l'air. · De son inventeur, un pilote nommé Fred Frisbee.
  Sources : <https://yaledailynews.com/?p=52173> ; <https://newenglandhistoricalsociety.com/the-sweet-new-england-history-of-the-frisbee/>
- `bjj-04` (difficulté 2, sûr) Combien de combinaisons différentes peut prendre un Rubik's Cube classique ?
  **Plus de 43 milliards de milliards.**
  Leurres : Environ 4 millions. · Un peu moins d'un milliard. · Exactement 362 880.
  Sources : <https://www.numberphile.com/videos/43252003274489856000-rubiks-cube-combinations> ; <https://artofproblemsolving.com/wiki/index.php/Rubiks_cube>
- `bjj-05` (difficulté 2, sûr) Au jeu de l'oie classique, sur quelles cases trouve-t-on les oies ?
  **Toutes les neuf cases : 9, 18, 27, 36, 45 et 54.**
  Leurres : Sur toutes les cases paires. · Une case sur sept, comme les jours de la semaine. · Uniquement aux quatre coins du plateau.
  Sources : <https://regles2jeux.fr/regle-du-jeu-de-loie/> ; <https://www.universalis.fr/encyclopedie/jeu-de-l-oie/>
- `bjj-06` (difficulté 2, sûr) Quel était le métier de l'inventeur du jeu Uno, en 1971 ?
  **Barbier, dans l'Ohio : il vendait ses premiers jeux dans son salon.**
  Leurres : Facteur, il testait le jeu pendant ses tournées. · Professeur de mathématiques à la retraite. · Chauffeur de taxi à New York.
  Sources : <https://en.wikipedia.org/wiki/Merle_Robbins> ; <https://www.museumofplay.org/blog/americas-favorite-game-and-success-story-uno/>
- `bjj-07` (difficulté 2, sûr) Que signifie le nom du jeu Jenga ?
  **Il vient du swahili et veut dire « construire ».**
  Leurres : C'est le prénom de la fille de son inventrice. · Il veut dire « tour qui tremble » en japonais. · C'est le nom d'une montagne d'Afrique de l'Est.
  Sources : <https://collections.vam.ac.uk/item/O27368> ; <https://en.wikipedia.org/wiki/Jenga>
- `bjj-08` (difficulté 1, sûr) Que fabriquait l'entreprise Lego avant ses briques en plastique ?
  **Des jouets en bois, comme des cubes et des petits animaux.**
  Leurres : Des boutons de vêtements en os. · Des moules à gaufres en fonte. · Des pièces de rechange pour vélos.
  Sources : <https://www.europe1.fr/node/172287> ; <https://www.historyhit.com/ole-kirk-christiansen-the-danish-carpenter-who-invented-lego/>
- `bjj-09` (difficulté 2, sûr) Comment est né le Trivial Pursuit, en 1979 ?
  **Deux amis voulaient jouer au Scrabble, mais il manquait des lettres.**
  Leurres : Un professeur l'a créé pour faire réviser ses élèves. · Deux frères l'ont imaginé pendant une panne d'électricité. · Un animateur de jeu télévisé l'a inventé pour s'entraîner.
  Sources : <https://www.thecanadianencyclopedia.ca/en/article/trivial-pursuit> ; <https://collections.vam.ac.uk/item/O224411>
- `bjj-10` (difficulté 2, sûr) Où a été publiée la première grille de mots croisés, en 1913 ?
  **Dans un journal de New York, le New York World.**
  Leurres : Dans un manuel scolaire anglais. · Sur le menu d'un restaurant parisien. · Dans le programme d'un théâtre de Londres.
  Sources : <https://fr.vikidia.org/wiki/Mots_crois%C3%A9s> ; <https://franco.wiki/fr/Arthur_Wynne.html>

### Secrets de tournage (`bluff-secrets-tournage`)

- `bst-01` (difficulté 2, sûr) Comment l'équipe des « Dents de la mer » surnommait-elle le requin mécanique ?
  **Bruce, comme l'avocat de Steven Spielberg.**
  Leurres : Moby, en hommage à la baleine blanche. · Fishy, car il sentait le poisson pourri. · Big Joe, du nom du mécanicien qui le réparait.
  Sources : <https://www.cineserie.com/tv-vod/les-dents-de-la-mer-a-45-ans-decouvrez-cinq-anecdotes-de-tournage-mordantes-3563517/> ; <https://www.cineserie.com/news/cinema/les-dents-de-la-mer-sur-paris-premiere-retour-sur-un-tournage-catastrophe-4306935/>
- `bst-02` (difficulté 2, sûr) Avec quoi a-t-on fabriqué la fausse neige du « Magicien d'Oz » (1939) ?
  **De l'amiante, un matériau aujourd'hui interdit car dangereux.**
  Leurres : Du sucre glace, renouvelé à chaque prise. · Des plumes d'oie blanchies. · Du savon râpé, qui moussait sous la pluie.
  Sources : <https://slashfilm.com/670207/filming-the-wizard-of-oz-was-actually-very-dangerous-heres-why> ; <https://dailygeekshow.com/neige-amiante-film/>
- `bst-03` (difficulté 2, sûr) Qu'a-t-on utilisé comme faux sang dans la scène de la douche de « Psychose » (1960) ?
  **Du sirop de chocolat, plus convaincant en noir et blanc.**
  Leurres : Du jus de betterave. · De l'encre de Chine diluée. · Du sang de bœuf fourni par un boucher.
  Sources : <https://en.wikipedia.org/wiki/Psycho_shower_scene> ; <https://www.bfi.org.uk/interviews/psycho-shower-scene-alfred-hitchcock>
- `bst-04` (difficulté 2, sûr) De quoi est fait le cri de Chewbacca, dans « Star Wars » ?
  **D'enregistrements d'ours, de morse et d'autres animaux mélangés.**
  Leurres : De la voix de l'acteur, passée à l'envers. · D'un violoncelle joué avec un archet en bois. · Du ronflement du réalisateur, accéléré.
  Sources : <https://en.wikipedia.org/wiki/Chewbacca> ; <https://nofilmschool.com/chewbacca-voice-real-animal-sounds-in-star-wars>
- `bst-05` (difficulté 2, sûr) Qui a réellement dessiné le portrait de Rose dans « Titanic » ?
  **James Cameron, le réalisateur : ce sont ses mains qu'on voit à l'écran.**
  Leurres : Kate Winslet elle-même, entre deux prises. · Un dessinateur de la police de Los Angeles. · Leonardo DiCaprio, qui avait pris des cours exprès.
  Sources : <https://www.parismatch.be/culture/cinema/2024/04/05/james-cameron-devoile-une-anecdote-surprenante-du-tournage-de-titanic-leonardo-dicaprio-est-tres-talentueux-mais-UCP62YVWR5G6FNJJKADDRFHQMA/> ; <https://www.thedigitalfix.com/titanic/james-cameron-drew-the-rose-nude>
- `bst-06` (difficulté 2, sûr) Qu'est-il arrivé à Viggo Mortensen en frappant un casque, dans « Les Deux Tours » ?
  **Il s'est cassé deux orteils, et son cri de douleur est resté dans le film.**
  Leurres : Le casque a volé jusque dans la caméra. · Il s'est foulé la cheville et a tourné la suite assis. · Il a brisé le casque, qui était en porcelaine.
  Sources : <https://www.cineserie.com/news/cinema/le-seigneur-des-anneaux-une-communaute-de-valeureux-accidentes-4492130/> ; <https://www.journaldugeek.com/dossier/cinq-anecdotes-pour-feter-les-20-ans-de-la-trilogie-du-seigneur-des-anneaux/>
- `bst-07` (difficulté 2, sûr) Pourquoi Indiana Jones abat-il le spadassin au lieu de se battre, dans « Les Aventuriers de l'arche perdue » ?
  **Harrison Ford était malade ce jour-là et voulait écourter la scène.**
  Leurres : Le sabre du cascadeur s'était brisé pendant la répétition. · Le producteur trouvait le combat trop violent pour les enfants. · Il faisait plus de 50 °C et le tournage devait s'arrêter.
  Sources : <https://screencrush.com/movie-myths-9/> ; <https://www.moyens.net/film/les-5-meilleures-scenes-de-la-franchise-indiana-jones-classees/>
- `bst-08` (difficulté 2, sûr) D'où viennent les signes verts qui défilent dans « Matrix » ?
  **De recettes de sushis scannées dans un livre de cuisine japonais.**
  Leurres : D'un vieux programme informatique de l'armée américaine. · Des notes de la musique du film, changées en lettres. · D'un annuaire téléphonique de Tokyo.
  Sources : <https://www.kiro7.com/news/trending-now/the-matrix-code-decoded-designer-reveals-surprising-hidden-meaning/634040828/> ; <https://www.mimikama.org/die-matrix/>
- `bst-09` (difficulté 2, sûr) Combien de temps Anthony Hopkins apparaît-il à l'écran dans « Le Silence des agneaux » ?
  **À peine plus de 16 minutes, et il a pourtant reçu l'Oscar du meilleur acteur.**
  Leurres : Plus d'une heure, presque tout le film. · Moins de 5 minutes, dans une seule scène. · Environ 45 minutes, toutes tournées en deux jours.
  Sources : <https://www.guinnessworldrecords.com/world-records/91205-shortest-screen-time-for-a-best-actor-oscar-win> ; <https://melmagazine.com/anthony-hopkins-became-a-star-by-becoming-hannibal-lecter-but-then-he-couldnt-escape-him-655109470810>
- `bst-10` (difficulté 2, sûr) D'où vient le chat que caresse Marlon Brando au début du « Parrain » ?
  **C'était un chat errant du studio, qui n'était pas prévu au scénario.**
  Leurres : C'était le chat du réalisateur, venu de chez lui. · C'était un chat dressé, vedette de publicités. · C'était une peluche animée par un marionnettiste.
  Sources : <https://www.cnc.fr/cinema/actualites/10-choses-que-vous-ne-saviez-peutetre-pas-sur-le-parrain_1658047> ; <https://vl-media.fr/le-parrain-a-50-ans-5-anecdotes-a-ressortir-pour-se-la-peter-avec-ses-potes/>

### Les coulisses de la musique (`bluff-coulisses-musique`)

- `bcmu-01` (difficulté 2, sûr) Quel était le titre provisoire de « Yesterday », des Beatles ?
  **« Scrambled Eggs », c'est-à-dire « œufs brouillés ».**
  Leurres : « Tomorrow », jusqu'à la dernière minute. · « Sad Sunday », un dimanche triste. · « Blue Morning », un matin bleu.
  Sources : <https://en.wikipedia.org/wiki/Yesterday_(song)> ; <https://www.goldradio.com/artists/the-beatles/yesterday-lyrics-meaning/>
- `bcmu-02` (difficulté 2, sûr) Que se passe-t-il pendant « 4′33″ », l'œuvre de John Cage (1952) ?
  **Le musicien ne joue pas une seule note pendant 4 minutes 33.**
  Leurres : Le pianiste joue 433 notes, toutes différentes. · Le public chante pendant que l'orchestre se tait. · Chaque musicien joue un morceau différent en même temps.
  Sources : <https://www.johncage.org/pp/John-Cage-Work-Detail.cfm?work_ID=17> ; <https://www.classical-music.com/features/works/what-is-the-point-of-john-cage-433>
- `bcmu-03` (difficulté 2, sûr) Combien de temps doit durer le concert d'orgue de John Cage commencé en 2001 à Halberstadt, en Allemagne ?
  **639 ans : il ne s'achèvera pas avant le XXVIIe siècle.**
  Leurres : 72 heures, sans aucune pause. · Un an, jour pour jour. · Aussi longtemps que vivra l'organiste.
  Sources : <https://www.european-traveler.com/germany/hear-john-cages-slowest-piece-of-music-in-the-world-in-halberstadt/> ; <https://www.taipeitimes.com/News/feat/archives/2004/07/13/2003178871>
- `bcmu-04` (difficulté 2, sûr) Que faisait Freddie Mercury avant le succès de Queen ?
  **Il vendait des vêtements d'occasion sur un marché de Londres.**
  Leurres : Il était coiffeur dans un salon de Kensington. · Il réparait des radios dans une boutique. · Il était guide dans un musée de Londres.
  Sources : <https://www.letribunaldunet.fr/people/freddie-mercury-sida-revelation-veille-de-sa-mort.html> ; <https://brianmay.com/queen-news/2014/08/boring-day-jobs-musicians-did-before-they-were-famous-freddie-mercury>
- `bcmu-05` (difficulté 2, sûr) Avec qui le groupe ABBA a-t-il dû s'entendre pour garder son nom ?
  **Une conserverie de poisson suédoise, qui s'appelait déjà Abba.**
  Leurres : Une marque suédoise de skis du même nom. · Un monastère dont les moines s'appelaient « abba ». · Un groupe de jazz norvégien plus ancien.
  Sources : <https://www.larousse.fr/encyclopedie/groupe-musical/Abba/155072> ; <https://areq.net/lang/fr/ABBA.html>
- `bcmu-06` (difficulté 2, sûr) Qu'a fait Jimi Hendrix à sa guitare au festival de Monterey, en 1967 ?
  **Il l'a arrosée de liquide à briquet et y a mis le feu.**
  Leurres : Il l'a offerte à un spectateur tiré au sort. · Il en a joué avec les pieds pendant tout un morceau. · Il l'a accordée sur scène pendant vingt minutes.
  Sources : <https://americansongwriter.com/on-this-day-in-1967-jimi-hendrix-lights-his-guitar-ablaze-for-the-first-time-and-plays-it-with-his-teeth/?nb=1> ; <https://www.guitarworld.com/features/what-happened-to-jimi-hendrixs-monterey-stratocaster>
- `bcmu-07` (difficulté 2, sûr) Pourquoi « Happy Birthday to You » a-t-elle longtemps coûté cher aux films américains ?
  **Un éditeur réclamait des droits d'auteur dessus, jusqu'en 2016.**
  Leurres : Elle était réservée à la télévision par un contrat. · Sa mélodie appartenait à une marque de gâteaux. · Il fallait payer chaque bougie montrée à l'écran.
  Sources : <https://www.rollingstone.com/music/news/warner-music-settles-happy-birthday-lawsuit-for-14-million-20160209> ; <https://en.wikipedia.org/wiki/Happy_Birthday_to_You>
- `bcmu-08` (difficulté 1, sûr) Qu'emportent les sondes Voyager, lancées en 1977 ?
  **Un disque doré avec des musiques et des sons de la Terre, pour des extraterrestres.**
  Leurres : Une boîte à musique qui joue l'hymne américain. · Les partitions complètes de Mozart gravées sur métal. · Un haut-parleur qui diffuse des chansons dans l'espace.
  Sources : <https://www.futura-sciences.com/sciences/actualites/astronomie-anniversaire-voyager-disque-or-extraterrestres-35-ans-40900/> ; <https://www.slate.fr/story/162315/nasa-golden-record-capsule-temporelle-apprendre-humains-extraterrestres>
- `bcmu-09` (difficulté 2, sûr) D'où vient le nom du groupe Led Zeppelin ?
  **D'une blague : le groupe allait couler « comme un ballon de plomb ».**
  Leurres : Du dirigeable de son premier vol, pris par le guitariste. · D'un groupe de jazz allemand des années 1920. · Du surnom du batteur, à cause de son poids.
  Sources : <https://faroutmagazine.co.uk/how-led-zeppelin-got-their-name/> ; <https://www.mentalfloss.com/entertainment/music/surprising-story-led-zeppelin-name>
- `bcmu-10` (difficulté 2, sûr) Quel morceau a été le premier joué avec un instrument dans l'espace, en 1965 ?
  **« Jingle Bells », à l'harmonica, par les astronautes de Gemini 6.**
  Leurres : « La Marseillaise », au violon. · « Happy Birthday », à la flûte. · « Twinkle, Twinkle, Little Star », au xylophone.
  Sources : <https://www.smithsonianmag.com/smithsonian-institution/sixty-years-ago-when-instruments-were-played-in-space-for-the-first-time-it-was-jingle-bells-all-the-way-180987851/> ; <https://guinnessworldrecords.com/world-records/105444-first-song-played-in-space>

### Sport insolite (`bluff-sport-insolite`)

- `bsp-01` (difficulté 2, sûr) Comment Fred Lorz a-t-il franchi en premier la ligne du marathon olympique de 1904 ?
  **Il avait fait une partie du parcours en voiture.**
  Leurres : Il avait couru pieds nus pour aller plus vite. · Il avait coupé à travers un champ de maïs. · Il était parti dix minutes avant les autres.
  Sources : <https://en.wikipedia.org/wiki/Frederick_Lorz> ; <https://www.popsci.com/health/olympic-runner-rat-poison-thomas-hicks/>
- `bsp-02` (difficulté 2, sûr) Qu'a reçu Thomas Hicks, le vrai vainqueur de ce marathon de 1904, pour tenir jusqu'au bout ?
  **Des blancs d'œufs, du cognac et de la strychnine, un poison.**
  Leurres : Un litre de café salé et des morceaux de sucre. · Des tranches de citron trempées dans du miel. · Un bain de pieds glacé à chaque kilomètre.
  Sources : <https://www.popsci.com/health/olympic-runner-rat-poison-thomas-hicks/> ; <https://en.wikipedia.org/wiki/Athletics_at_the_1904_Summer_Olympics_%E2%80%93_Men%27s_marathon>
- `bsp-03` (difficulté 1, sûr) Quelle épreuve a fait partie des Jeux olympiques de 1900 à 1920 ?
  **Le tir à la corde, par équipes.**
  Leurres : La course en sac. · Le lancer de tronc d'arbre. · La course à dos d'âne.
  Sources : <https://www.futura-sciences.com/sante/questions-reponses/sport-jeux-olympiques-10-disciplines-sportives-insolites-ont-disparu-8398/> ; <https://www.slate.fr/story/267855/tir-pigeons-natation-synchronisee-solo-epreuves-etranges-jeux-olympiques-art>
- `bsp-04` (difficulté 2, sûr) Quelle épreuve très controversée s'est tenue lors des Jeux de Paris, en 1900 ?
  **Un tir aux pigeons vivants : environ 300 oiseaux ont été tués.**
  Leurres : Une course de chevaux à travers les rues de Paris. · Un concours de plongeon depuis la tour Eiffel. · Un combat de boxe entre deux kangourous.
  Sources : <https://www.slate.fr/story/251098/fiasco-olympique-jeux-paris-1900-jo-exposition-universelle-epreuves-insolites-peche-tir-canon-pigeons> ; <https://www.slate.fr/story/267855/tir-pigeons-natation-synchronisee-solo-epreuves-etranges-jeux-olympiques-art>
- `bsp-05` (difficulté 2, sûr) Quelles médailles a-t-on décernées aux Jeux olympiques de 1912 à 1948 ?
  **Des médailles d'art : peinture, sculpture, musique, littérature et architecture.**
  Leurres : Des médailles de cuisine, pour les chefs du village olympique. · Des médailles de bonne conduite pour les supporters. · Des médailles d'élégance pour les plus belles tenues.
  Sources : <https://www.universalis.fr/encyclopedie/jeux-olympiques-les-concours-d-art-et-litterature/> ; <https://www.slate.fr/monde/59937/competition-artistique-jo>
- `bsp-06` (difficulté 3, sûr) Quelle médaille Pierre de Coubertin a-t-il remportée en 1912 ?
  **L'or en littérature, pour un poème signé de faux noms.**
  Leurres : L'argent au tir au pistolet. · Le bronze en aviron, à 49 ans. · L'or en escrime, face à son propre neveu.
  Sources : <https://www.olympedia.org/editions/6/sports/LIT> ; <https://www.smithsonianmag.com/history/poetry-was-an-official-olympic-event-for-nearly-40-years-what-happened-180984838/>
- `bsp-07` (difficulté 2, sûr) Qui a retrouvé le trophée de la Coupe du monde, volé à Londres en 1966 ?
  **Un chien nommé Pickles, sous une haie, enveloppé dans du papier journal.**
  Leurres : Un enfant qui jouait au football dans un parc. · Un éboueur, dans une poubelle près de Wembley. · Un chauffeur de taxi, sur sa banquette arrière.
  Sources : <https://inside.fifa.com/fr/news/20-mars-1966-on-a-vole-la-coupe-du-monde-2771237> ; <https://abc7ny.com/post/world-cup-stolen-pickles-the-dog-england/12578563/>
- `bsp-08` (difficulté 2, sûr) Pourquoi les quatre premiers du Tour de France 1904 ont-ils été disqualifiés ?
  **Pour tricherie : on les accusait notamment d'avoir pris le train.**
  Leurres : Ils s'étaient fait remorquer par des chevaux. · Ils avaient échangé leurs vélos en pleine course. · Ils avaient roulé de nuit, ce qui était interdit.
  Sources : <https://www.slate.fr/story/267626/tour-de-france-disparition-deuxieme-edition-1904-triche-coureurs-agressions-spectateurs-histoire-cyclisme> ; <https://www.universalis.fr/encyclopedie/maurice-garin/>
- `bsp-09` (difficulté 2, sûr) Qu'a fait l'astronaute Alan Shepard sur la Lune, en 1971 ?
  **Il a frappé deux balles de golf, d'une seule main.**
  Leurres : Il a planté le fanion de son équipe de baseball. · Il a lancé un frisbee pour mesurer la gravité. · Il a couru un 100 mètres chronométré.
  Sources : <https://www.rtbf.be/article/alan-shepard-l-homme-qui-a-joue-au-golf-sur-la-lune-10274556> ; <https://www.meteomedia.com/fr/nouvelles/science/espace/la-balle-de-golf-frappee-sur-la-lune-retrouvee-plus-de-50-ans-plus-tard>
- `bsp-10` (difficulté 2, sûr) Avec quoi James Naismith a-t-il fabriqué les premiers paniers de basket, en 1891 ?
  **Des paniers à pêches sans trou : il fallait récupérer le ballon avec une échelle.**
  Leurres : Des seaux à lait percés au fond. · Des chapeaux de paille cousus ensemble. · Des cercles de tonneau tendus de filet de pêche.
  Sources : <https://history.com/this-day-in-history/basketball-invention-james-naismith> ; <https://www.mprnews.org/story/2015/12/16/npr-gym-teacher-invented-basketball-sports-james-naismith>

## Reformulé ou écarté pendant la rédaction

- Lac Natron : on lit souvent qu'il « pétrifie » les animaux ; les sources sérieuses parlent de momification, d'où la réponse.
- Frisbee : origine « selon la légende » (moules à tarte de la Frisbie Pie Company), les historiens la jugent incertaine.
- Psychose : le sirop de chocolat est sûr, la marque (Bosco ou Hershey's) ne l'est pas : elle n'est pas citée.
- Concert de John Cage à Halberstadt : fin annoncée en 2639 ou 2640 selon les sources ; la réponse dit « pas avant le XXVIIe siècle ».
- Pigeons de 1900 : épreuve tenue pendant les Jeux de Paris mais non reconnue par le CIO ; l'énoncé ne dit pas « épreuve olympique officielle ».
- Tour de France 1904 : les causes exactes des disqualifications restent discutées ; la réponse dit « on les accusait notamment ».
- Leurres écartés parce qu'ils étaient vrais : Freddie Mercury a été bagagiste à l'aéroport (remplacé), Abba est aussi une conserverie (devenu la question), un astronaute d'Apollo 14 a lancé un javelot (non utilisé).
- Écartés faute de source fiable : la ville d'origine exacte de « La Marseillaise » comme question de Bluff, les objets d'avant Lego (planches à repasser, escabeaux : une seule source pédagogique).
