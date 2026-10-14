# Relecture du lot B3 : 5 Bluff

Lot B3 du plan de contenu (octobre 2026) : 5 quiz Bluff de 10 questions, ajoutés le 2026-10-14, tous marqués « provisoire, à relire (lot B3) ». En cas de différence, c'est le fichier JSON de `content/quizzes/` qui fait foi.

- Chaque vraie réponse a été vérifiée en ligne (une ou deux sources par question, URL ci-dessous). Les anecdotes contestées sont présentées comme telles dans l'énoncé (« selon la légende », « selon… »).
- Les leurres sont inventés : ils doivent être crédibles mais faux.
- Après relecture : `npm run build` dans `content/`, puis réimport de `/quizzes` puis de `/questions` (jamais la racine).

## À vérifier en priorité (0)

Aucune question marquée « à vérifier » : les faits sans source fiable ont été retirés ou reformulés (voir la fin du document).

## Les 5 Bluff

| Quiz | Identifiant | Catégorie |
|---|---|---|
| Séries et télé | `bluff-series-tele` | Cinéma et séries |
| Tubes et chansons | `bluff-tubes-insolites` | Musique |
| Traditions du sport | `bluff-traditions-sport` | Sport |
| Science insolite | `bluff-science-insolite` | Sciences et nature |
| L'origine des mots | `bluff-origines-mots` | Culture générale |

## Toutes les questions

### Séries et télé (`bluff-series-tele`)

- `bse-01` (difficulté 2, sûr) Quel mot d'Homer Simpson est entré dans l'Oxford English Dictionary, en 2001 ?
  **« D'oh! », son cri d'agacement, écrit sans apostrophe.**
  Leurres : « Ay caramba », emprunté à Bart. · « Woohoo », son cri de joie. · « Mmm donuts », écrit en un seul mot.
  Sources : <https://abcnews.go.com/US/story?id=93098> ; <https://Www.wikipedia.org/wiki/D%27oh>
- `bse-02` (difficulté 1, sûr) Quel objet s'est glissé par erreur dans une scène de banquet de « Game of Thrones », en 2019 ?
  **Un gobelet de café en carton, posé devant Daenerys.**
  Leurres : Une montre au poignet d'un figurant. · Un téléphone portable dans la main d'un garde. · Une paire de baskets aux pieds d'un soldat.
  Sources : <https://www.journaldugeek.com/2019/05/06/game-of-thrones-saison-8-gobelet-starbucks-oublie-scene-de-lepisode-4/> ; <https://www.sudradio.fr/medias/game-of-thrones-le-gobelet-netait-pas-un-starbucks>
- `bse-03` (difficulté 3, sûr) Où « Breaking Bad » devait-elle d'abord se dérouler, avant Albuquerque ?
  **À Riverside, en Californie : le Nouveau-Mexique offrait des avantages fiscaux.**
  Leurres : À Las Vegas, mais les casinos ont refusé le tournage. · À Miami, trop humide pour les décors du désert. · À Phoenix, la ville natale du créateur.
  Sources : <https://patch.com/california/murrieta/breaking-bad-could-have-been-set-in-riverside-county> ; <https://www.soapcentral.com/shows/i-today-years-old-i-found-breaking-bad-wasn-t-originally-set-albuquerque-city>
- `bse-04` (difficulté 2, sûr) Pourquoi Phoebe porte-t-elle des triplés dans « Friends » ?
  **L'actrice Lisa Kudrow était vraiment enceinte : la série l'a intégré.**
  Leurres : Le producteur avait perdu un pari contre les scénaristes. · Les fans l'avaient réclamé lors d'un vote. · Pour remplacer un épisode annulé pendant une grève.
  Sources : <https://www.cineserie.com/news/people/que-deviennent-ils/que-devient-lisa-kudrow-2179320/> ; <https://www.empireonline.com/people/lisa-kudrow/5/>
- `bse-05` (difficulté 2, sûr) Selon les explications les plus citées, pourquoi les Simpson sont-ils jaunes ?
  **Pour attirer l'œil au premier regard, même en zappant.**
  Leurres : La peinture jaune était la seule disponible au studio. · En hommage aux taxis new-yorkais. · La série devait d'abord être sponsorisée par une moutarde.
  Sources : <https://www.letemps.ch/culture/simpson-marque-jaune> ; <https://www.letribunaldunet.fr/humour/savez-vous-pourquoi-les-simpson-sont-jaunes.html>
- `bse-06` (difficulté 2, sûr) Pourquoi Fort Boyard, le décor du jeu télévisé, n'a-t-il jamais servi à défendre la côte ?
  **Avant la fin des travaux, les canons portaient assez loin pour s'en passer.**
  Leurres : Il s'enfonçait d'un mètre par an dans le sable. · Les soldats refusaient d'y vivre à cause du mal de mer. · Ses canons avaient été tournés par erreur vers la terre.
  Sources : <https://en.wikipedia.org/wiki/Fort_Boyard_(fortification)> ; <https://www.howitworksdaily.com/the-unusual-history-of-fort-boyard/>
- `bse-07` (difficulté 2, sûr) Qu'avait de particulier Peter Falk, l'acteur de l'inspecteur Columbo ?
  **Il avait un œil de verre, depuis une opération à l'âge de 3 ans.**
  Leurres : Il était daltonien et ne voyait pas son imperméable beige. · Il ne savait pas conduire : sa voiture était tirée. · Il était gaucher mais jouait toujours de la main droite.
  Sources : <https://stljewishlight.org/arts-entertainment/our-favorite-jews-peter-falk> ; <https://jta.org/2011/06/26/united-states/actor-peter-falk-tvs-columbo-dies>
- `bse-08` (difficulté 2, sûr) D'où vient le salut vulcain de Spock, dans « Star Trek » ?
  **D'un geste de bénédiction juive que l'acteur avait vu enfant, à la synagogue.**
  Leurres : D'un signe de la langue des signes qui veut dire « paix ». · D'un tour de magie que l'acteur faisait à ses enfants. · D'un salut militaire d'une armée de l'Antiquité.
  Sources : <https://qz.com/352855/the-secret-history-behind-leonard-nimoys-spock-salute> ; <https://www.startrek.com/news/live-long-and-prosper-jewish-history-month>
- `bse-09` (difficulté 2, sûr) Quel record détient « Doctor Who », lancée en 1963 ?
  **Plus longue série de science-fiction de l'histoire, selon le Guinness.**
  Leurres : Plus grand nombre d'acteurs pour un même rôle : 40. · Plus long épisode de série : 9 heures d'affilée. · Plus de spectateurs pour une série en noir et blanc.
  Sources : <https://en.wikipedia.org/wiki/Doctor_Who> ; <https://www.sliceofscifi.com/2006/09/29/the-debate-is-over-doctor-who-guinness-winner/>
- `bse-10` (difficulté 2, sûr) Combien de temps duraient les épisodes des premières saisons de « Kaamelott » ?
  **3 minutes 30 secondes, à l'heure du dîner sur M6.**
  Leurres : 52 minutes, comme une série classique. · 1 minute, comme une publicité. · 26 minutes, sans aucune coupure.
  Sources : <https://en.wikipedia.org/wiki/Kaamelott> ; <https://www.allocine.fr/article/fichearticle_gen_carticle=18400733.html>

### Tubes et chansons (`bluff-tubes-insolites`)

- `bti-01` (difficulté 1, sûr) Quel record « Gangnam Style » a-t-elle établi en 2012 ?
  **Première vidéo YouTube à dépasser un milliard de vues.**
  Leurres : Chanson la plus courte classée numéro un. · Premier clip tourné entièrement sous l'eau. · Chanson traduite dans le plus de langues en un an.
  Sources : <https://www.guinnessworldrecords.com/world-records/107048-first-video-to-receive-one-billion-views> ; <https://www.history.com/this-day-in-history/December-21/gangnam-style-first-youtube-video-to-hit-one-billion-views>
- `bti-02` (difficulté 2, sûr) Comment « Bohemian Rhapsody », jugée trop longue pour la radio, a-t-elle percé en 1975 ?
  **Un animateur de Londres l'a passée 14 fois en deux jours.**
  Leurres : Queen l'a jouée en direct dans le métro de Londres. · Elle a d'abord été vendue en cassette dans les stations-service. · Elle a été choisie pour une publicité de voiture.
  Sources : <https://officialcharts.com/chart-news/queen-bohemian-rhapsody-50-years/> ; <https://mentalfloss.com/article/70634/10-operatic-facts-about-bohemian-rhapsody>
- `bti-03` (difficulté 3, sûr) De quelle chanson « Les Champs-Élysées », de Joe Dassin, est-elle l'adaptation ?
  **« Waterloo Road », une chanson anglaise sur une rue de Londres.**
  Leurres : « Broadway Boogie », sur une avenue de New York. · « La Rambla », une chanson espagnole sur Barcelone. · « Unter den Linden », une marche allemande.
  Sources : <https://en.wikipedia.org/wiki/Les_Champs-%C3%89lys%C3%A9es_(song)> ; <https://www.theculturetrip.com/europe/france/articles/9-great-french-covers-of-english-songs>
- `bti-04` (difficulté 2, sûr) Quel événement raconte « Smoke on the Water », de Deep Purple ?
  **L'incendie du casino de Montreux, pendant un concert de Frank Zappa, en 1971.**
  Leurres : Un feu de forêt vu depuis un bateau sur le lac de Genève. · La fumée d'un barbecue qui a gâché leur premier concert. · L'explosion d'un ferry sur la Tamise.
  Sources : <https://www.npr.org/sections/parallels/2015/03/08/391246315/a-swiss-town-a-casino-fire-and-smoke-on-the-water> ; <https://ultimateclassicrock.com/frank-zappa-fire-smoke-on-the-water/>
- `bti-05` (difficulté 2, sûr) Qu'avait d'unique le clip de « Happy », de Pharrell Williams, en 2013 ?
  **Il durait 24 heures : la chanson y tournait en boucle.**
  Leurres : Il était filmé en une seule prise, sans aucun montage. · Il avait été tourné entièrement par des enfants. · Il n'est resté visible qu'une seule journée.
  Sources : <https://factmag.com/2013/11/21/watch-pharrells-24-hour-music-video-for-happy> ; <https://www.ozap.com/actu/pharrell-williams-devoile-un-clip-de-24-heures/450246>
- `bti-06` (difficulté 2, sûr) Pour qui Paul McCartney a-t-il écrit « Hey Jude » ?
  **Pour Julian, le fils de John Lennon : elle s'appelait d'abord « Hey Jules ».**
  Leurres : Pour son chien, qui s'appelait Jude. · Pour une fan qui lui écrivait chaque semaine. · Pour sa sœur Judith, partie vivre en Australie.
  Sources : <https://en.wikipedia.org/wiki/Hey_Jude> ; <https://classicsongoftheday.com/hey-jude-the-beatles/>
- `bti-07` (difficulté 2, sûr) Qu'a de particulier l'hymne européen, tiré de l'« Ode à la joie » de Beethoven ?
  **Il n'a pas de paroles officielles : seule la musique a été retenue.**
  Leurres : Il se chante dans toutes les langues de l'Union en même temps. · Il dure exactement une minute, pas plus. · Il change de chef d'orchestre chaque année.
  Sources : <https://www.coe.int/fr/web/documents-records-archives-information/hymne-europeen> ; <https://european-union.europa.eu/principles-countries-history/symbols/european-anthem_fr>
- `bti-08` (difficulté 2, sûr) Quand a été enregistrée la chanson « We Are the World », en 1985 ?
  **En une nuit, juste après la cérémonie des American Music Awards.**
  Leurres : Sur trois mois, chaque chanteur dans un studio différent. · Pendant un concert géant, devant le public. · Le jour de Noël, dans une église de Los Angeles.
  Sources : <https://britannica.com/topic/We-Are-the-World> ; <https://loopinsight.com/2015/01/28/we-are-the-world-was-recorded-30-years-ago-today-heres-the-backstory>
- `bti-09` (difficulté 2, sûr) Comment Keith Richards a-t-il trouvé le riff de « Satisfaction » ?
  **En dormant : il l'a joué à moitié endormi et enregistré sur cassette.**
  Leurres : En entendant une sirène de police dans la rue. · En réparant la guitare de Mick Jagger. · En reprenant l'air d'une publicité pour une lessive.
  Sources : <https://en.wikipedia.org/wiki/(I_Can%27t_Get_No)_Satisfaction> ; <https://www.biography.com/musicians/keith-richards-satisfaction-rolling-stones>
- `bti-10` (difficulté 3, sûr) De quelle chanson vient « Le lion est mort ce soir » ?
  **De « Mbube », une chanson zouloue de Solomon Linda, enregistrée en 1939.**
  Leurres : D'une berceuse du Kenya chantée aux enfants. · D'un chant de chasseurs inuits. · D'un air de jazz de La Nouvelle-Orléans.
  Sources : <https://www.rollingstone.com/feature/in-the-jungle-inside-the-long-hidden-genealogy-of-the-lion-sleeps-tonight-108274/> ; <https://www.southafrica.info/about/arts/mbube-210206>

### Traditions du sport (`bluff-traditions-sport`)

- `btr-01` (difficulté 2, sûr) Quelle a été la toute première mascotte officielle de la Coupe du monde, en 1966 ?
  **World Cup Willie, un lion vêtu du drapeau britannique.**
  Leurres : Un bulldog nommé Winston. · Un ours en casque de policier anglais. · Un corbeau de la tour de Londres.
  Sources : <https://www.guinnessworldrecords.com/world-records/481402-first-fifa-world-cup-official-mascot> ; <https://www.fourfourtwo.com/us/features/world-cup-willie-story-1966-mascot>
- `btr-02` (difficulté 3, sûr) À quels Jeux a eu lieu le premier relais de la flamme olympique ?
  **À Berlin, en 1936 : la torche était partie d'Olympie.**
  Leurres : À Athènes, en 1896, pour les premiers Jeux modernes. · À Paris, en 1924, sur les Champs-Élysées. · À Londres, en 1948, à travers la Manche.
  Sources : <https://olympics.com/en/news/the-amazing-story-of-the-olympic-flame> ; <https://www.universalis.fr/encyclopedie/jeux-olympiques-le-relais-de-la-flamme-olympique/>
- `btr-03` (difficulté 2, sûr) Pourquoi le maillot du leader du Tour de France est-il jaune ?
  **C'était la couleur du papier de L'Auto, le journal qui organisait la course.**
  Leurres : Pour être vu de loin par les voitures, la nuit. · Parce que le premier leader adorait les tournesols. · C'était le seul tissu disponible en 1919.
  Sources : <https://www.europe1.fr/sport/maillot-jaune-vert-blanc-ou-a-pois-quelles-sont-les-origines-des-couleurs-des-tuniques-du-tour-de-france-4191215> ; <https://www.lcl.fr/decouvrir-lcl/newsroom/tdf-2019-etape-13-100ans>
- `btr-04` (difficulté 2, sûr) Quelle tradition entoure la coupe Stanley, le trophée du hockey nord-américain ?
  **Chaque membre de l'équipe gagnante passe une journée avec le trophée.**
  Leurres : Le capitaine doit dormir avec elle la première nuit. · L'entraîneur doit y boire un litre de lait. · Elle est fondue et refaite chaque année.
  Sources : <https://thehockeynews.com/nhl/new-jersey-devils/latest-news/origin-of-the-day-with-the-cup-tradition> ; <https://www.nhl.com/fr/news/les-noms-des-hurricanes-graves-sur-la-coupe-stanley>
- `btr-05` (difficulté 1, sûr) Quelle règle de tenue s'impose aux joueurs de Wimbledon ?
  **Ils doivent être habillés presque entièrement en blanc, même les sous-vêtements visibles.**
  Leurres : Ils doivent porter une cravate à la cérémonie d'ouverture. · Les casquettes sont interdites sur le court central. · Les chaussettes doivent être aux couleurs de leur pays.
  Sources : <https://www.mentalfloss.com/sports/why-do-wimbledon-players-wear-all-white> ; <https://www.si.com/onsi/athlete-lifestyle/wimbledons-strict-dress-code-explained-why-players-still-have-to-wear-white>
- `btr-06` (difficulté 2, sûr) D'où vient le nom de la Coupe de l'America, la célèbre course de voile ?
  **De la goélette « America », victorieuse de la première course, en 1851.**
  Leurres : Du continent américain, d'où partait la première course. · D'une riche héritière nommée America Vanderbilt. · D'un navire britannique coulé par les Américains.
  Sources : <https://www.larousse.fr/encyclopedie/divers/Coupe_de_l_America/105159> ; <https://www.universalis.fr/encyclopedie/coupe-de-l-america-america-s-cup/>
- `btr-07` (difficulté 2, sûr) D'où viennent les Harlem Globetrotters ?
  **De Chicago : « Harlem » a été choisi pour annoncer une équipe de joueurs noirs.**
  Leurres : De Harlem, à New York, d'un club de quartier. · D'un cirque itinérant de Floride. · D'une université de Californie.
  Sources : <https://www.wttw.com/playlist/2018/06/06/harlem-actually-chicago-globetrotters> ; <https://sabr.org/bioproj/person/abe-saperstein>
- `btr-08` (difficulté 3, sûr) Quelle était la longueur de la plus longue étape du premier Tour de France, en 1903 ?
  **471 km, entre Nantes et Paris.**
  Leurres : 250 km, de Lyon à Marseille. · 800 km, en deux jours sans arrêt. · 320 km, de Bordeaux à Toulouse.
  Sources : <https://en.wikipedia.org/wiki/1903_Tour_de_France> ; <https://bikeraceinfo.com/tdf/tdf1903.html>
- `btr-09` (difficulté 2, sûr) Quel numéro portait Michael Jordan lors de son retour en NBA, en 1995 ?
  **Le 45, son numéro au baseball : son 23 avait été retiré.**
  Leurres : Le 99, pour marquer les esprits. · Le 32, tiré au sort par son équipe. · Le 1, pour sa nouvelle carrière.
  Sources : <https://www.siriusxm.com/blog/flashbackfriday-im-back> ; <https://www.thescore.com/nba/news/723050/photo-limited-release-of-jordans-no-45-jersey-commemorates-1995-return>
- `btr-10` (difficulté 2, sûr) Quel animal a été la première mascotte officielle des Jeux olympiques, en 1972 ?
  **Waldi, un teckel aux couleurs olympiques, à Munich.**
  Leurres : Un ours brun, symbole de Berlin. · Un aigle nommé Adlerchen. · Un renard des Alpes appelé Fuchsi.
  Sources : <https://en.wikipedia.org/wiki/Waldi> ; <https://fr.vikidia.org/wiki/Jeux_olympiques_d%27%C3%A9t%C3%A9_de_1972>

### Science insolite (`bluff-science-insolite`)

- `bsci-01` (difficulté 2, sûr) Pourquoi la banane est-elle très légèrement radioactive ?
  **Elle contient du potassium, dont une petite partie est radioactive.**
  Leurres : Elle pousse sur des sols volcaniques. · Sa peau absorbe les rayons du soleil. · Ses graines dégagent un gaz radioactif.
  Sources : <https://en.wikipedia.org/wiki/Banana_equivalent_dose> ; <https://boingboing.net/2010/08/27/bananas-are-radioact.html/amp>
- `bsci-02` (difficulté 3, sûr) Sur Vénus, qu'est-ce qui dure plus longtemps qu'une année ?
  **Un tour sur elle-même : 243 jours, contre 225 pour faire le tour du Soleil.**
  Leurres : Un orage : certains durent deux ans. · Une nuit : le Soleil ne s'y lève que tous les cinq ans. · Une éclipse, qui dure plusieurs mois.
  Sources : <https://fr.vikidia.org/wiki/V%C3%A9nus_(plan%C3%A8te)> ; <https://www.futura-sciences.com/sciences/definitions/astronomie-periode-rotation-15192/>
- `bsci-03` (difficulté 1, sûr) Qu'a d'étonnant le corps du poulpe ?
  **Il a trois cœurs et du sang bleu.**
  Leurres : Il respire par la peau et n'a pas de poumons ni de branchies. · Il a des dents sur chaque ventouse. · Il voit dans le noir grâce à ses ventouses.
  Sources : <https://reporterre.net/Tout-savoir-sur-le-poulpe-en-5-faits-etonnants> ; <https://www.futura-sciences.com/planete/definitions/zoologie-poulpe-9551/>
- `bsci-04` (difficulté 2, sûr) Combien pèserait une cuillère à café de matière d'étoile à neutrons ?
  **Des centaines de millions de tonnes, voire davantage.**
  Leurres : Environ 10 kilos, comme un seau d'eau. · Autant qu'un éléphant, 5 tonnes. · Presque rien : c'est surtout du vide.
  Sources : <https://www.futura-sciences.com/sciences/definitions/univers-etoile-neutrons-32/> ; <https://cordis.europa.eu/project/rcn/100123/brief/fr>
- `bsci-05` (difficulté 1, sûr) Que fait la tour Eiffel quand il fait très chaud ?
  **Elle grandit d'une quinzaine de centimètres : le métal se dilate.**
  Leurres : Elle penche de deux mètres vers le nord. · Elle siffle : le vent chante dans ses rivets chauds. · Elle rapetisse : sa peinture se rétracte.
  Sources : <https://www.futura-sciences.com/planete/questions-reponses/monuments-tour-eiffel-change-t-elle-taille-12124/> ; <https://interestingengineering.com/culture/the-eiffel-tower-grow-taller-each-summer>
- `bsci-06` (difficulté 1, sûr) Voit-on la Grande Muraille de Chine à l'œil nu depuis l'espace ?
  **Non : même le premier astronaute chinois ne l'a pas vue.**
  Leurres : Oui, c'est la seule construction humaine visible. · Oui, mais seulement la nuit, grâce à ses lampes. · Seulement depuis la Lune, par temps clair.
  Sources : <https://www.nbcnews.com/id/wbna4515544> ; <https://www.futura-sciences.com/sciences/questions-reponses/espace-grande-muraille-chine-divisible-depuis-espace-vrai-faux-21652/>
- `bsci-07` (difficulté 2, sûr) Quelle est la température d'un éclair ?
  **Environ 30 000 °C, plusieurs fois plus que la surface du Soleil.**
  Leurres : Environ 100 °C, comme l'eau qui bout. · Environ 1 000 °C, comme de la lave. · Moins de 0 °C : c'est un phénomène froid.
  Sources : <https://dailygeekshow.com/temperature-foudre-superieure-soleil/> ; <https://www.meteomedia.com/fr/nouvelles/science/earth-science/5-secrets-electrisants-a-propos-des-eclairs?g=2>
- `bsci-08` (difficulté 2, sûr) Comment Alexander Fleming a-t-il découvert la pénicilline, en 1928 ?
  **En rentrant de vacances : une moisissure avait tué les bactéries d'une boîte oubliée.**
  Leurres : En analysant la boue d'un champ de bataille. · En goûtant un fromage moisi au laboratoire. · En cherchant un remède pour son chien malade.
  Sources : <https://www.worldhistory.org/trans/fr/2-2490/decouverte-de-la-penicilline/> ; <https://www.slate.fr/story/266000/decouverte-accident-hasard-penicilline-alexander-fleming-histoire-antibiotique-traitement-bacteries-medecine>
- `bsci-09` (difficulté 2, sûr) De quoi est né le Post-it ?
  **D'une colle ratée, trop faible, et d'un choriste qui perdait ses marque-pages.**
  Leurres : D'un papier peint qui se décollait tout seul. · D'une étiquette de médicament qui ne collait pas. · D'un pansement raté inventé par un dentiste.
  Sources : <https://www.moma.org/collection/works/4720> ; <https://www.mnhs.org/mnopedia/search/index/thing/post-it-notes>
- `bsci-10` (difficulté 2, sûr) Selon le récit le plus connu, comment est né le four à micro-ondes ?
  **Un ingénieur a vu fondre une barre chocolatée dans sa poche, près d'un radar.**
  Leurres : Un cuisinier avait laissé une assiette sur une télévision allumée. · Un pilote réchauffait son repas sur le moteur de son avion. · Un médecin chauffait du lait avec une machine à rayons X.
  Sources : <https://www.futura-sciences.com/sciences/personnalites/physique-percy-spencer-1067/> ; <https://greatpatent.com/a-melted-candy-bar-in-his-pocket-led-to-the-microwave-oven>

### L'origine des mots (`bluff-origines-mots`)

- `bom-01` (difficulté 2, sûr) D'où vient le mot « boycott » ?
  **D'un régisseur irlandais, le capitaine Boycott, mis à l'écart par tout un village en 1880.**
  Leurres : D'un mot hollandais qui veut dire « tourner le dos ». · D'un roi d'Écosse qui refusait de payer ses dettes. · D'un marchand de thé ruiné par ses clients.
  Sources : <https://www.ebsco.com/research-starters/history/irish-tenant-farmers-stage-first-boycott> ; <https://lepetitjournal.com/dublin/actualites/le-boycott-vient-irlande-75831>
- `bom-02` (difficulté 2, sûr) D'où vient le mot « silhouette » ?
  **D'Étienne de Silhouette, un ministre des Finances de 1759 connu pour ses économies.**
  Leurres : D'un peintre qui ne dessinait que les ombres. · D'une danseuse de l'Opéra très mince. · D'un mot italien qui veut dire « petite ombre ».
  Sources : <https://www.etymonline.com/word/silhouette> ; <https://wordhistories.net/2018/03/30/silhouette-uncertain-origin/>
- `bom-03` (difficulté 2, sûr) D'où vient le mot « poubelle » ?
  **Du préfet Eugène Poubelle, qui imposa les boîtes à ordures à Paris en 1883.**
  Leurres : D'un mot breton qui veut dire « petit seau ». · D'une marque de seaux en fer-blanc. · Du quartier parisien où vivaient les chiffonniers.
  Sources : <https://www.herodote.net/almanach-ID-445.php> ; <https://www.retronews.fr/societe/echo-de-presse/2020/09/01/le-tres-impopulaire-arrete-poubelle>
- `bom-04` (difficulté 2, sûr) Joseph-Ignace Guillotin a-t-il inventé la guillotine ?
  **Non : il l'a proposée comme mort égale pour tous ; un chirurgien l'a conçue.**
  Leurres : Oui, et il en a été la première victime. · Oui, en s'inspirant d'un coupe-papier. · Oui, pour remplacer la pendaison, jugée trop lente.
  Sources : <https://www.smithsonianmag.com/smart-news/joseph-guillotin-opposed-capital-punishment-180962630/> ; <https://www.historytoday.com/archive/months-past/death-joseph-ignace-guillotin>
- `bom-05` (difficulté 3, sûr) D'où viendrait l'expression « OK », apparue dans un journal de Boston en 1839 ?
  **D'une plaisanterie : « oll korrect », écriture fautive de « all correct ».**
  Leurres : Des initiales d'un général, Otto Kessler. · Des wagons de marchandises marqués « Outgoing Kargo ». · D'un mot amérindien qui veut dire « c'est ainsi ».
  Sources : <https://www.smithsonianmag.com/smart-news/how-word-ok-was-invented-175-years-ago-180953258/> ; <https://www.mentalfloss.com/language/words/whats-real-origin-ok>
- `bom-06` (difficulté 2, sûr) D'où vient le mot « robot » ?
  **Du tchèque « robota », la corvée, dans une pièce de théâtre de 1920.**
  Leurres : Du nom d'un inventeur japonais, Robo Tanaka. · D'une abréviation anglaise, « Remote Operated Bot ». · D'un mot latin qui veut dire « homme de fer ».
  Sources : <https://www.sciencefriday.com/segments/the-origin-of-the-word-robot/> ; <https://www.sciencefocus.com/future-technology/where-does-the-word-robot-come-from>
- `bom-07` (difficulté 2, sûr) D'où vient le nom du maillot « bikini », lancé en 1946 ?
  **D'un atoll du Pacifique où les États-Unis venaient de faire un essai atomique.**
  Leurres : D'une plage de Saint-Tropez. · D'un mot hawaïen qui veut dire « petit tissu ». · Du prénom de la fille de son créateur.
  Sources : <https://www.smithsonianmag.com/smithsonian-institution/how-wake-testing-atomic-bomb-became-thing-180955346/> ; <https://en.wikipedia.org/wiki/Bikini>
- `bom-08` (difficulté 1, sûr) D'où vient le mot « denim » ?
  **De la « serge de Nîmes », un tissu de la ville de Nîmes.**
  Leurres : Du nom de l'ouvrier qui a cousu le premier jean. · D'un mot anglais qui veut dire « bleu de travail ». · D'une ville de l'Inde où poussait le coton.
  Sources : <https://nimes-tourisme.com/app/uploads/2026/03/aux-origines-du-denim.pdf> ; <https://scmp.com/magazines/post-magazine/short-reads/article/3260788/where-jeans-and-denim-come-clues-are-names>
- `bom-09` (difficulté 2, sûr) D'où vient le mot « nicotine » ?
  **De Jean Nicot, un ambassadeur qui fit connaître le tabac en France vers 1560.**
  Leurres : D'une île grecque célèbre pour son tabac. · Du chimiste qui l'a isolée, Nikolaï Kotine. · D'un mot amérindien qui veut dire « fumée ».
  Sources : <https://en.wikipedia.org/wiki/Jean_Nicot> ; <https://europeana.eu/en/blog/how-did-nicotine-get-its-name>
- `bom-10` (difficulté 2, sûr) D'où vient le mot « mansarde » ?
  **De l'architecte François Mansart, qui popularisa les toits brisés.**
  Leurres : D'un mot italien qui veut dire « petite maison ». · D'une famille Mansard qui louait des chambres à Paris. · D'un ordre de moines qui vivaient sous les toits.
  Sources : <https://dictionnaire-academie.fr/article/A9M0576> ; <https://vitrinelinguistique.oqlf.gouv.qc.ca/fiche-gdt/fiche/8363021/toit-mansarde>

## Reformulé ou écarté pendant la rédaction

- Game of Thrones : le gobelet a souvent été dit « Starbucks » ; la production dit qu'il venait de la cantine, d'où « un gobelet de café ». Leurre écarté : la bouteille d'eau oubliée dans le dernier épisode (vrai, autre erreur).
- Simpson : l'explication du zapping est la plus citée, sans déclaration précise de Matt Groening ; l'énoncé dit « selon les explications les plus citées ».
- Micro-ondes : l'histoire de la barre chocolatée est l'anecdote la plus connue, des archives montrent un travail plus méthodique ; l'énoncé dit « selon le récit le plus connu ».
- Vénus : 243 jours est la rotation par rapport aux étoiles ; la journée « solaire » ne dure qu'environ 117 jours. L'énoncé parle d'« un tour sur elle-même ».
- Étoile à neutrons : estimations de 10 millions à 6 milliards de tonnes selon les sources ; la réponse dit « des centaines de millions de tonnes, voire davantage ».
- OK : l'origine « oll korrect » est l'explication retenue par les historiens de la langue ; le leurre amérindien reprend une théorie populaire réfutée (voulu).
- Leurres écartés car vrais ailleurs : l'éternuement de Fleming (découverte du lysozyme), le numéro de lycée de Jordan, le chien de McCartney, Footix (mascotte de 1998), le lait de l'Indianapolis 500 (gardé comme leurre pour la coupe Stanley, où il est faux).
