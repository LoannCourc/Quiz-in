# Relecture du lot Q3 : 10 quiz

Lot Q3 du plan de contenu (octobre 2026) : 10 quiz de 10 questions, ajoutés le 2026-10-14, tous marqués « provisoire, à relire (lot Q3) ». En cas de différence, c'est le fichier JSON de `content/quizzes/` qui fait foi.

- Quiz faciles et moyens : faits classiques, certitude « sûr » ou « à vérifier » ; tout doute a été retiré. Questions de difficulté 3 : vérifiées en ligne.
- Quiz difficiles : deux sources par réponse.
- Après relecture : `npm run build` dans `content/`, puis réimport de `/quizzes` puis de `/questions` (jamais la racine).

## À vérifier en priorité (0)

Aucune question marquée « à vérifier » : les points douteux rencontrés pendant la rédaction ont été retirés ou reformulés (voir la fin du document).

## Les 10 quiz

| Quiz | Identifiant | Thème | Niveau | Public | Moyenne |
|---|---|---|---|---|---|
| Les films d'animation | `films-animation` | Cinéma et séries | Facile | Enfants | 1,4 |
| Le cinéma français | `cinema-francais` | Cinéma et séries | Moyen | Tout public | 1,7 |
| Le cinéma des experts | `cinema-experts` | Cinéma et séries | Difficile | Experts | 2,5 |
| Inventeurs et inventions | `inventions` | Culture générale | Facile | Tout public | 1,5 |
| Peintres et chefs-d'œuvre | `arts-peintres` | Culture générale | Moyen | Tout public | 1,8 |
| Les animaux du monde | `animaux-du-monde` | Sciences et nature | Facile | Tout public | 1,3 |
| Chimie et physique | `chimie-physique` | Sciences et nature | Difficile | Experts | 2,3 |
| Comptines et chansons d'enfance | `comptines` | Musique | Facile | Enfants | 1,2 |
| La cuisine du monde | `cuisine-du-monde` | Loisirs | Moyen | Tout public | 1,8 |
| La Rome antique | `rome-antique` | Histoire | Moyen | Tout public | 1,7 |

## Toutes les questions

### Les films d'animation (`films-animation`)

- `fa-01` (difficulté 1, sûr) Dans « Shrek », quel animal bavard accompagne l'ogre ?
  **B. Un âne** — autres : Un cheval · Un chat · Un dragon
  Il ne s'arrête presque jamais de parler.
- `fa-02` (difficulté 1, sûr) Dans « Ratatouille », quel animal rêve de devenir un grand chef ?
  **D. Un rat** — autres : Un hamster · Un lapin · Un écureuil
  Il s'appelle Rémy et cuisine à Paris.
- `fa-03` (difficulté 1, sûr) Dans « Là-haut », qu'est-ce qui fait s'envoler la maison de Carl ?
  **A. Des ballons** — autres : Une fusée · Un hélicoptère · Un cerf-volant
  Des milliers de ballons gonflés à l'hélium.
- `fa-04` (difficulté 1, sûr) Dans « Kung Fu Panda », comment s'appelle le panda ?
  **C. Po** — autres : Bao · Ping · Shifu
  Shifu est son maître de kung-fu.
- `fa-05` (difficulté 2, sûr) Dans « Vice-versa », quelle émotion est représentée par un personnage tout bleu ?
  **C. La Tristesse** — autres : La Colère · La Peur · Le Dégoût
  La Colère est rouge et le Dégoût est vert.
- `fa-06` (difficulté 1, sûr) Dans « Cars », comment s'appelle la voiture de course rouge ?
  **A. Flash McQueen** — autres : Martin · Sally · Doc Hudson
  Martin, sa dépanneuse rouillée, est son meilleur ami.
- `fa-07` (difficulté 2, sûr) Dans « Monstres et Cie », que récoltent les monstres pour produire de l'énergie ?
  **D. Les cris des enfants** — autres : Les jouets · Les rêves · Les bonbons
  À la fin du film, ils découvrent que les rires sont encore plus efficaces.
- `fa-08` (difficulté 2, sûr) Dans « WALL-E », quel est le travail du petit robot resté sur Terre ?
  **B. Compacter les déchets** — autres : Cuisiner · Livrer le courrier · Réparer des fusées
  Il range les déchets en cubes, jour après jour.
- `fa-09` (difficulté 1, sûr) Dans « L'Âge de glace », quel animal court sans cesse après son gland ?
  **A. Un écureuil** — autres : Un castor · Une souris · Un lapin
  Il s'appelle Scrat.
- `fa-10` (difficulté 2, sûr) Dans « Mon voisin Totoro », quel véhicule magique a la forme d'un chat ?
  **C. Un bus** — autres : Un train · Un bateau · Un avion
  On l'appelle le Chat-bus.

### Le cinéma français (`cinema-francais`)

- `cf-01` (difficulté 1, sûr) Dans « Les Visiteurs » (1993), quel acteur joue Jacquouille la Fripouille ?
  **D. Christian Clavier** — autres : Jean Reno · Gérard Jugnot · Thierry Lhermitte
  Jean Reno joue son maître, Godefroy de Montmirail.
- `cf-02` (difficulté 1, sûr) Quel film de Dany Boon, sorti en 2008, se déroule chez les « Ch'tis » ?
  **A. Bienvenue chez les Ch'tis** — autres : Camping · Les Bronzés · Le Dîner de cons
  Un directeur de poste est muté à Bergues, dans le Nord.
- `cf-03` (difficulté 1, sûr) Quel acteur partage l'affiche de « La Grande Vadrouille » (1966) avec Bourvil ?
  **C. Louis de Funès** — autres : Fernandel · Jean Gabin · Lino Ventura
  Ils avaient déjà formé un duo dans « Le Corniaud ».
- `cf-04` (difficulté 2, sûr) Quel réalisateur a signé « Le Grand Bleu » et « Léon » ?
  **C. Luc Besson** — autres : Jean-Pierre Jeunet · Jacques Audiard · Claude Lelouch
  Il a aussi réalisé « Le Cinquième Élément ».
- `cf-05` (difficulté 2, sûr) Dans « Le Dîner de cons », comment s'appelle le personnage joué par Jacques Villeret ?
  **A. François Pignon** — autres : Pierre Brochant · Juste Leblanc · Lucien Cheval
  Pierre Brochant, joué par Thierry Lhermitte, l'invite au fameux dîner.
- `cf-06` (difficulté 2, sûr) Pour quel film muet et en noir et blanc Jean Dujardin a-t-il reçu l'Oscar du meilleur acteur ?
  **D. The Artist** — autres : Intouchables · OSS 117 · Le Discours d'un roi
  Le film remporte aussi l'Oscar du meilleur film.
- `cf-07` (difficulté 2, sûr) Dans « Astérix et Obélix : Mission Cléopâtre » (2002), qui joue l'architecte Numérobis ?
  **B. Jamel Debbouze** — autres : Gérard Darmon · Alain Chabat · Édouard Baer
  Alain Chabat réalise le film et joue Jules César.
- `cf-08` (difficulté 3, sûr) Quel réalisateur de la Nouvelle Vague a signé « Les Quatre Cents Coups » (1959) ?
  **A. François Truffaut** — autres : Jean-Luc Godard · Claude Chabrol · Éric Rohmer
  Le film lui vaut le prix de la mise en scène à Cannes, en 1959.
  Sources : <https://www.festival-cannes.com/f/les-quatre-cents-coups-3/> ; <https://www.cnc.fr/cinema/actualites/les-quatre-cents-coups-fete-ses-60-ans_989382>
- `cf-09` (difficulté 2, sûr) Quelle actrice française a reçu l'Oscar de la meilleure actrice pour « La Môme » ?
  **C. Marion Cotillard** — autres : Juliette Binoche · Isabelle Huppert · Audrey Tautou
  Elle y incarne Édith Piaf.
- `cf-10` (difficulté 1, sûr) Dans quelle ville se tient le plus célèbre festival de cinéma de France ?
  **B. Cannes** — autres : Deauville · Nice · Biarritz
  La récompense suprême y est la Palme d'or.

### Le cinéma des experts (`cinema-experts`)

- `cx-01` (difficulté 3, sûr) Quel film remporte le tout premier Oscar du meilleur film, lors de la cérémonie de 1929 ?
  **A. Les Ailes** — autres : Le Chanteur de jazz · Metropolis · L'Aurore
  C'est le seul film muet à avoir remporté cet Oscar.
  Sources : <https://www.oscars.org/oscars/ceremonies/1929/memorable-moments> ; <https://www.mentalfloss.com/entertainment/movies/best-picture-oscar-winning-movie-facts>
- `cx-02` (difficulté 2, sûr) Quel réalisateur a signé « 2001 : l'Odyssée de l'espace » (1968) ?
  **C. Stanley Kubrick** — autres : Steven Spielberg · George Lucas · Ridley Scott
  Il en a écrit le scénario avec Arthur C. Clarke.
  Sources : <https://fr.vikidia.org/wiki/2001_:_L%27Odyss%C3%A9e_de_l%27espace> ; <https://www.techno-science.net/fr/definitions/2001-l-odyssee-de-l-espace>
- `cx-03` (difficulté 2, sûr) Quel film d'Alfred Hitchcock contient la célèbre scène de la douche ?
  **C. Psychose** — autres : Les Oiseaux · Vertigo · Fenêtre sur cour
  La scène dure environ 45 secondes et compte 78 plans.
  Sources : <https://www.cnc.fr/cinema/actualites/psychose-toujours-plus_1663467> ; <https://www.lalibre.be/culture/cinema/2020/09/05/il-y-a-60-ans-avec-psychose-alfred-hitchcock-bouleversait-la-face-du-cinema-EBFOQXNNE5BJBNBHGRMM3ROMTE/>
- `cx-04` (difficulté 3, sûr) Dans quel film de Federico Fellini Anita Ekberg se baigne-t-elle dans la fontaine de Trevi ?
  **A. La Dolce Vita** — autres : Huit et demi · Amarcord · La Strada
  Le film sort en 1960.
  Sources : <https://www.theday.com/?p=121374> ; <https://news.artnet.com/art-world/watch-la-dolce-vita-actress-anita-ekberg-in-the-famous-trevi-fountain-scene-217951?amp=1>
- `cx-05` (difficulté 2, sûr) Quel est le premier long métrage d'animation des studios Disney, sorti en 1937 ?
  **D. Blanche-Neige et les Sept Nains** — autres : Pinocchio · Fantasia · Bambi
  Sa production a duré environ quatre ans.
  Sources : <https://www.larousse.fr/encyclopedie/film/Blanche-Neige_et_les_sept_nains/1357> ; <https://fr.vikidia.org/wiki/Blanche-Neige_et_les_Sept_Nains>
- `cx-06` (difficulté 3, sûr) Quel acteur a reçu l'Oscar du meilleur acteur pour « My Left Foot », « There Will Be Blood » et « Lincoln » ?
  **B. Daniel Day-Lewis** — autres : Jack Nicholson · Anthony Hopkins · Tom Hanks
  Il est le premier acteur à remporter trois fois cet Oscar.
  Sources : <https://www.aljazeera.com/features/2013/2/25/day-lewis-wins-third-best-actor-oscar> ; <https://www.thewrap.com/awards/article/daniel-day-lewis-wins-best-actor-oscar-78966>
- `cx-07` (difficulté 2, sûr) Dans quel film Marlon Brando incarne-t-il Vito Corleone ?
  **A. Le Parrain** — autres : Sur les quais · Apocalypse Now · Un tramway nommé Désir
  Il refuse l'Oscar du meilleur acteur obtenu pour ce rôle.
  Sources : <https://www.guinnessworldrecords.com/world-records/71745-most-oscars-awarded-for-portrayal-of-same-character> ; <https://local10.com/entertainment/movies/brando-the-godfather-return-to-theaters-for-45th-anniversary>
- `cx-08` (difficulté 2, sûr) Quel cinéaste japonais a réalisé « Les Sept Samouraïs » (1954) ?
  **C. Akira Kurosawa** — autres : Yasujirō Ozu · Kenji Mizoguchi · Takeshi Kitano
  Le film inspire le western « Les Sept Mercenaires » (1960).
  Sources : <https://britannica.com/topic/Seven-Samurai> ; <https://bristol.ac.uk/Depts/Union/Finefilms/samurai.htm>
- `cx-09` (difficulté 3, sûr) Quel film de 1927 est le premier long métrage à faire entendre des dialogues synchronisés ?
  **B. Le Chanteur de jazz** — autres : Les Ailes · Metropolis · Le Mécano de la « General »
  Il ne contient que quelques minutes de dialogues ; le reste est chanté ou muet.
  Sources : <https://www.britannica.com/print/article/302090> ; <https://www.euronews.com/2023/10/06/culture-re-view-how-the-jazz-singer-ended-cinemas-silent-era>
- `cx-10` (difficulté 3, sûr) Quelle actrice a remporté quatre fois l'Oscar de la meilleure actrice ?
  **D. Katharine Hepburn** — autres : Meryl Streep · Ingrid Bergman · Bette Davis
  Elle n'est jamais venue chercher ses statuettes.
  Sources : <https://www.smithsonianmag.com/smithsonian-institution/from-morning-glory-to-on-golden-pond-four-oscars-for-kate-hepburn-13658833/> ; <https://www.rtbf.be/article/cinq-legendes-du-cinema-qui-ont-marque-l-histoire-des-oscars-9850531>

### Inventeurs et inventions (`inventions`)

- `inv-01` (difficulté 1, sûr) Quels frères ont inventé le cinématographe en 1895 ?
  **C. Les frères Lumière** — autres : Les frères Pathé · Les frères Wright · Les frères Grimm
  Ils sont originaires de Lyon.
- `inv-02` (difficulté 1, sûr) Quel Français a inventé une écriture en points en relief pour les aveugles ?
  **C. Louis Braille** — autres : Valentin Haüy · Charles Barbier · Louis Pasteur
  Il était lui-même devenu aveugle enfant.
- `inv-03` (difficulté 1, sûr) Quel savant français a mis au point le vaccin contre la rage ?
  **A. Louis Pasteur** — autres : Claude Bernard · Marie Curie · Ambroise Paré
  Il le teste avec succès en 1885.
- `inv-04` (difficulté 2, sûr) Quels frères réussissent le premier vol d'un avion motorisé, en 1903 ?
  **D. Les frères Wright** — autres : Les frères Montgolfier · Les frères Lumière · Les frères Renault
  Le vol a lieu aux États-Unis, en Caroline du Nord.
- `inv-05` (difficulté 2, sûr) Qui met au point, vers 1450, l'imprimerie à caractères mobiles en Europe ?
  **B. Gutenberg** — autres : Léonard de Vinci · Galilée · Copernic
  Il imprime notamment une célèbre Bible.
- `inv-06` (difficulté 1, sûr) Quelle machine volante les frères Montgolfier font-ils s'élever en 1783 ?
  **A. Un ballon à air chaud** — autres : Un planeur · Un hélicoptère · Un dirigeable
  On l'appelle depuis une montgolfière.
- `inv-07` (difficulté 2, sûr) Quel inventeur dépose en 1876 le brevet du téléphone ?
  **C. Alexander Graham Bell** — autres : Thomas Edison · Nikola Tesla · Guglielmo Marconi
  D'autres inventeurs travaillaient alors sur des appareils proches.
- `inv-08` (difficulté 2, sûr) Quelle marque de stylo à bille doit son nom à son fondateur, Marcel Bich ?
  **B. Bic** — autres : Parker · Waterman · Stabilo
  Le nom a été raccourci pour être facile à retenir.
- `inv-09` (difficulté 1, sûr) Dans quel pays le papier a-t-il été inventé, il y a environ 2 000 ans ?
  **D. La Chine** — autres : L'Égypte · L'Inde · La Grèce
  Les Égyptiens, eux, écrivaient sur du papyrus.
- `inv-10` (difficulté 2, sûr) Quel physicien italien a laissé son nom au volt, après avoir inventé la pile électrique ?
  **A. Alessandro Volta** — autres : Galilée · Guglielmo Marconi · Enrico Fermi
  Il présente sa pile en 1800.

### Peintres et chefs-d'œuvre (`arts-peintres`)

- `ap-01` (difficulté 1, sûr) Quel peintre néerlandais a peint « Les Tournesols » ?
  **C. Vincent Van Gogh** — autres : Rembrandt · Johannes Vermeer · Piet Mondrian
  Il en a peint plusieurs versions, à Arles notamment.
- `ap-02` (difficulté 2, sûr) Quel musée parisien, installé dans une ancienne gare, expose de nombreux impressionnistes ?
  **A. Le musée d'Orsay** — autres : Le Louvre · Le Centre Pompidou · Le Petit Palais
  La gare avait été construite pour l'Exposition universelle de 1900.
- `ap-03` (difficulté 2, sûr) Quel peintre a donné son nom à l'impressionnisme avec « Impression, soleil levant » ?
  **D. Claude Monet** — autres : Auguste Renoir · Edgar Degas · Camille Pissarro
  Un critique s'est moqué du titre, et le mot est resté.
- `ap-04` (difficulté 1, sûr) Quel sculpteur a réalisé « Le Penseur » ?
  **B. Auguste Rodin** — autres : Camille Claudel · Aristide Maillol · Michel-Ange
  Une version en bronze se trouve au musée Rodin, à Paris.
- `ap-05` (difficulté 1, sûr) Quel artiste espagnol a peint « Guernica » ?
  **A. Pablo Picasso** — autres : Joan Miró · Francisco de Goya · Diego Velázquez
  Le tableau dénonce le bombardement de la ville en 1937.
- `ap-06` (difficulté 2, sûr) Quel artiste a peint le plafond de la chapelle Sixtine, au Vatican ?
  **C. Michel-Ange** — autres : Raphaël · Léonard de Vinci · Le Caravage
  Il y travaille de 1508 à 1512.
- `ap-07` (difficulté 2, sûr) Quel peintre a réalisé « La Jeune Fille à la perle » ?
  **B. Johannes Vermeer** — autres : Rembrandt · Frans Hals · Pieter Bruegel
  Le tableau est conservé à La Haye, aux Pays-Bas.
- `ap-08` (difficulté 2, sûr) Quel peintre norvégien a peint « Le Cri » ?
  **D. Edvard Munch** — autres : Gustav Klimt · Egon Schiele · Paul Gauguin
  Il en a réalisé plusieurs versions.
- `ap-09` (difficulté 2, sûr) Comment s'appelle le mouvement de Picasso et Braque, fait de formes géométriques ?
  **A. Le cubisme** — autres : Le fauvisme · Le surréalisme · Le pointillisme
  Il naît au début du XXe siècle.
- `ap-10` (difficulté 3, sûr) Quel peintre a fait scandale en 1863 avec « Le Déjeuner sur l'herbe » ?
  **C. Édouard Manet** — autres : Gustave Courbet · Auguste Renoir · Paul Cézanne
  Refusé au Salon officiel, le tableau est montré au Salon des refusés.
  Sources : <https://en.wikipedia.org/wiki/Le_D%C3%A9jeuner_sur_l%27herbe> ; <https://www.britannica.com/print/article/351399>

### Les animaux du monde (`animaux-du-monde`)

- `am-01` (difficulté 1, sûr) Quel animal d'Australie transporte son petit dans une poche ?
  **A. Le kangourou** — autres : Le koala · L'émeu · Le wombat
  Le koala et le wombat ont aussi une poche, mais c'est le kangourou qui est célèbre pour ses bonds.
- `am-02` (difficulté 1, sûr) Quel animal est le plus grand en hauteur ?
  **D. La girafe** — autres : L'éléphant · Le chameau · L'ours brun
  Un mâle peut dépasser 5 mètres.
- `am-03` (difficulté 1, sûr) Quel grand oiseau d'Afrique ne vole pas mais court très vite ?
  **B. L'autruche** — autres : Le flamant rose · Le pélican · La cigogne
  C'est le plus grand oiseau du monde.
- `am-04` (difficulté 1, sûr) Quel animal noir et blanc se nourrit presque uniquement de bambou ?
  **A. Le panda géant** — autres : Le zèbre · Le blaireau · Le pingouin
  Il vit dans les montagnes de Chine.
- `am-05` (difficulté 1, sûr) Combien de bosses a un dromadaire ?
  **C. 1** — autres : 2 · 3 · 0
  Le chameau de Bactriane, lui, en a deux.
- `am-06` (difficulté 2, sûr) Quel est le plus grand félin du monde ?
  **B. Le tigre** — autres : Le lion · Le jaguar · Le léopard
  Le tigre de Sibérie est le plus massif.
- `am-07` (difficulté 1, sûr) Quel est le plus gros animal terrestre ?
  **D. L'éléphant d'Afrique** — autres : L'hippopotame · Le rhinocéros · La girafe
  Un mâle peut peser plus de 6 tonnes.
- `am-08` (difficulté 2, sûr) Quel petit oiseau est capable de voler en arrière ?
  **A. Le colibri** — autres : Le moineau · L'hirondelle · Le pic-vert
  Ses ailes battent si vite qu'on les entend bourdonner.
- `am-09` (difficulté 1, sûr) Quel reptile à carapace peut vivre plus de cent ans ?
  **C. La tortue** — autres : Le crocodile · Le lézard · Le serpent
  Les tortues géantes des Galápagos vivent très longtemps.
- `am-10` (difficulté 2, sûr) Quel mammifère pond des œufs et possède un bec de canard ?
  **C. L'ornithorynque** — autres : Le castor · La loutre · Le tatou
  Il vit en Australie, dans les rivières.

### Chimie et physique (`chimie-physique`)

- `cp-01` (difficulté 2, sûr) Quel est le symbole chimique du fer ?
  **D. Fe** — autres : F · Fr · Ir
  Il vient du latin « ferrum ».
  Sources : <https://www.larousse.fr/encyclopedie/divers/wd/51621> ; <https://www.universalis.fr/encyclopedie/fer-l-element-metallique/>
- `cp-02` (difficulté 2, sûr) Quel gaz représente environ 78 % de l'air sec ?
  **B. L'azote** — autres : L'oxygène · Le dioxyde de carbone · L'argon
  L'oxygène en représente environ 21 %.
  Sources : <https://www.futura-sciences.com/sante/actualites/vie-respire-t-on-vraiment-quotidien-91643/> ; <https://www.larousse.fr/dictionnaires/college/air/935>
- `cp-03` (difficulté 2, sûr) Quelle est l'unité de mesure de la résistance électrique ?
  **A. L'ohm** — autres : Le volt · L'ampère · Le watt
  Elle porte le nom du physicien allemand Georg Ohm.
  Sources : <https://en.wikipedia.org/wiki/Ohm> ; <https://www.lalanguefrancaise.com/dictionnaire/definition/ohm>
- `cp-04` (difficulté 2, sûr) Quel métal est liquide à température ambiante ?
  **C. Le mercure** — autres : Le plomb · L'étain · Le zinc
  Il fond vers -39 °C.
  Sources : <https://www.bag.admin.ch/dam/bag/fr/dokumente/chem/themen-a-z/factsheet-quecksilber.pdf.download.pdf/factsheet-quecksilber_fr.pdf> ; <https://www.universalis.fr/encyclopedie/mercure-element-chimique/>
- `cp-05` (difficulté 2, sûr) Quelle scientifique reçoit le prix Nobel de physique en 1903, puis celui de chimie en 1911 ?
  **B. Marie Curie** — autres : Irène Joliot-Curie · Lise Meitner · Rosalind Franklin
  Elle est la seule personne récompensée dans deux sciences différentes.
  Sources : <https://www.herodote.net/Deux_fois_Prix_Nobel-synthese-424.php> ; <https://www.futura-sciences.com/sciences/actualites/chimie-il-y-100-ans-marie-curie-recevait-prix-nobel-chimie-28474/>
- `cp-06` (difficulté 3, sûr) Quel physicien découvre les rayons X en 1895 ?
  **D. Wilhelm Röntgen** — autres : Henri Becquerel · Max Planck · Ernest Rutherford
  Cette découverte lui vaut le premier prix Nobel de physique, en 1901.
  Sources : <https://www.worldhistory.org/trans/fr/2-2497/decouverte-des-rayons-x/> ; <https://resolve.cambridge.org/core/services/aop-cambridge-core/content/view/CEAD42213C7DBCCC11ADA5182FB71D8A/S003384519500007Xa.pdf/editorial.pdf>
- `cp-07` (difficulté 2, sûr) Quel gaz noble donne leur lumière rouge-orangé aux enseignes qui portent son nom ?
  **A. Le néon** — autres : L'argon · L'hélium · Le krypton
  Les autres couleurs viennent d'autres gaz ou de revêtements fluorescents.
  Sources : <https://franco.wiki/fr/N%C3%A9on.html> ; <https://www.futura-sciences.com/sciences/definitions/chimie-tube-neon-11156/>
- `cp-08` (difficulté 3, sûr) Quel chimiste russe publie en 1869 le premier tableau périodique des éléments ?
  **C. Dmitri Mendeleïev** — autres : Antoine Lavoisier · Amedeo Avogadro · John Dalton
  Il y laisse des cases vides pour des éléments encore inconnus.
  Sources : <https://www.futura-sciences.com/sciences/definitions/chimie-tableau-mendeleiev-4425/> ; <https://fr.vikidia.org/wiki/Table_p%C3%A9riodique_des_%C3%A9l%C3%A9ments>
- `cp-09` (difficulté 3, sûr) À quelle vitesse, environ, le son se propage-t-il dans l'air à 15 °C ?
  **C. 340 m/s** — autres : 100 m/s · 1 500 m/s · 3 000 m/s
  Dans l'eau, il va environ quatre fois plus vite.
  Sources : <https://areq.net/lang/fr/Vitesse_du_son.html> ; <https://ent2d.ac-bordeaux.fr/disciplines/physique-chimie/wp-content/uploads/sites/82/2017/07/mission-passer-le-mur-du-son_sujet-eleve.pdf>
- `cp-10` (difficulté 2, sûr) Quelle particule de l'atome porte une charge électrique négative ?
  **A. L'électron** — autres : Le proton · Le neutron · Le photon
  Les protons, dans le noyau, portent une charge positive.
  Sources : <https://www.schoolmouv.fr/definitions/electron/definition> ; <https://www.larousse.fr/encyclopedie/divers/%C3%A9lectron/46271>

### Comptines et chansons d'enfance (`comptines`)

- `cpt-01` (difficulté 1, sûr) Complète la comptine : « Au clair de la lune, mon ami… »
  **B. Pierrot** — autres : Pinocchio · Arlequin · Guignol
  « … prête-moi ta plume pour écrire un mot. »
- `cpt-02` (difficulté 2, sûr) Complète la comptine : « Frère Jacques, dormez-vous ? Sonnez les… »
  **A. matines** — autres : cloches · trompettes · sirènes
  Les matines sont une prière du petit matin.
- `cpt-03` (difficulté 1, sûr) Complète la comptine : « Une souris verte qui courait dans… »
  **C. l'herbe** — autres : le pré · la cour · le bois
  « … je l'attrape par la queue, je la montre à ces messieurs. »
- `cpt-04` (difficulté 1, sûr) Complète la chanson : « Il était un petit navire qui n'avait ja-ja-jamais… »
  **B. navigué** — autres : nagé · coulé · voyagé
  « Ohé, ohé ! »
- `cpt-05` (difficulté 1, sûr) Complète la chanson : « Sur le pont d'…, on y danse, on y danse »
  **D. Avignon** — autres : Paris · Nantes · Lyon
  Le pont Saint-Bénézet ne traverse plus tout le Rhône.
- `cpt-06` (difficulté 2, sûr) Complète la chanson : « À la claire fontaine, m'en allant… »
  **A. promener** — autres : chanter · danser · rêver
  « … j'ai trouvé l'eau si belle que je m'y suis baigné. »
- `cpt-07` (difficulté 1, sûr) Complète la comptine : « Promenons-nous dans les bois, pendant que le… n'y est pas »
  **C. loup** — autres : renard · ogre · chasseur
  « Loup, y es-tu ? »
- `cpt-08` (difficulté 1, sûr) Complète la comptine : « Meunier, tu dors, ton… va trop vite »
  **C. moulin** — autres : voisin · chemin · jardin
  « … ton moulin va trop fort. »
- `cpt-09` (difficulté 1, sûr) Complète la chanson : « Alouette, gentille alouette, alouette, je te… »
  **A. plumerai** — autres : chanterai · garderai · suivrai
  Chaque couplet ajoute une partie de l'oiseau : la tête, le bec…
- `cpt-10` (difficulté 1, sûr) Complète la comptine : « Ainsi font, font, font les petites… »
  **D. marionnettes** — autres : souris · fourmis · poupées
  On la chante en faisant tourner ses mains.

### La cuisine du monde (`cuisine-du-monde`)

- `cdm-01` (difficulté 1, sûr) De quel pays la paella est-elle la grande spécialité ?
  **A. L'Espagne** — autres : L'Italie · Le Portugal · Le Mexique
  Elle vient de la région de Valence.
- `cdm-02` (difficulté 1, sûr) Quel plat italien, né à Naples, est une galette garnie cuite au four ?
  **C. La pizza** — autres : La lasagne · Le risotto · La polenta
  La pizza Margherita reprend les couleurs du drapeau italien.
- `cdm-03` (difficulté 2, sûr) Quel est l'ingrédient principal du houmous ?
  **B. Le pois chiche** — autres : La lentille · L'aubergine · Le haricot rouge
  On l'écrase avec du tahini, du citron et de l'ail.
- `cdm-04` (difficulté 2, sûr) De quel pays le goulasch est-il un plat emblématique ?
  **D. La Hongrie** — autres : La Pologne · L'Autriche · La Roumanie
  Ce ragoût de bœuf est parfumé au paprika.
- `cdm-05` (difficulté 2, sûr) Quelle boisson japonaise est faite à partir de riz fermenté ?
  **A. Le saké** — autres : Le soju · Le thé matcha · Le miso
  On le boit chaud ou froid.
- `cdm-06` (difficulté 1, sûr) Comment s'appelle la semoule de blé dur des grands plats d'Afrique du Nord ?
  **C. Le couscous** — autres : Le boulgour · Le quinoa · Le tapioca
  Il est inscrit au patrimoine culturel immatériel de l'UNESCO.
- `cdm-07` (difficulté 3, sûr) Quel plat péruvien est fait de poisson cru mariné dans du citron vert ?
  **C. Le ceviche** — autres : Le tajine · Le chili con carne · La feijoada
  L'acidité du citron « cuit » la chair du poisson.
  Sources : <https://www.lalanguefrancaise.com/dictionnaire/definition/ceviche> ; <https://www.slate.fr/story/159526/cuisine-vraie-recette-ceviche>
- `cdm-08` (difficulté 2, sûr) De quel pays la moussaka est-elle une spécialité ?
  **A. La Grèce** — autres : La Turquie · Le Liban · L'Italie
  Elle associe aubergines, viande hachée et béchamel.
- `cdm-09` (difficulté 2, sûr) Quelle épice donne sa couleur jaune à de nombreux currys ?
  **D. Le curcuma** — autres : Le cumin · La cannelle · La muscade
  On le surnomme parfois « safran des Indes ».
- `cdm-10` (difficulté 2, sûr) Quelle soupe froide à base de tomate vient d'Andalousie ?
  **B. Le gaspacho** — autres : Le minestrone · La soupe miso · Le velouté
  On la sert bien fraîche en été.

### La Rome antique (`rome-antique`)

- `ra-01` (difficulté 1, sûr) Selon la légende, quels jumeaux ont fondé Rome ?
  **C. Romulus et Rémus** — autres : Castor et Pollux · Caïn et Abel · Hercule et Thésée
  Ils auraient été nourris par une louve.
- `ra-02` (difficulté 1, sûr) Quel grand amphithéâtre de Rome accueillait les combats de gladiateurs ?
  **B. Le Colisée** — autres : Le Panthéon · Le Forum · Le Capitole
  Il pouvait accueillir plusieurs dizaines de milliers de spectateurs.
- `ra-03` (difficulté 1, sûr) Quel général romain a conquis la Gaule ?
  **D. Jules César** — autres : Pompée · Hannibal · Marc Antoine
  Il raconte cette conquête dans « La Guerre des Gaules ».
- `ra-04` (difficulté 2, sûr) Quel chef gaulois se rend à César après le siège d'Alésia, en 52 av. J.-C. ?
  **A. Vercingétorix** — autres : Ambiorix · Brennus · Astérix
  Il est emmené prisonnier à Rome.
- `ra-05` (difficulté 2, sûr) Quelle ville romaine est ensevelie par l'éruption du Vésuve, en 79 ?
  **C. Pompéi** — autres : Ostie · Ravenne · Carthage
  Herculanum est détruite par la même éruption.
- `ra-06` (difficulté 2, sûr) Qui est le premier empereur romain ?
  **C. Auguste** — autres : Néron · Caligula · Tibère
  Il s'appelait d'abord Octave ; il est le petit-neveu de César.
- `ra-07` (difficulté 1, sûr) Quelle langue parlaient les Romains ?
  **A. Le latin** — autres : Le grec · Le gaulois · L'étrusque
  Le français, l'italien et l'espagnol en descendent.
- `ra-08` (difficulté 2, sûr) Quel célèbre aqueduc romain se trouve près de Nîmes ?
  **D. Le pont du Gard** — autres : Le pont d'Avignon · Le pont Valentré · Le viaduc de Millau
  Il franchit le Gardon sur trois rangées d'arches.
- `ra-09` (difficulté 2, sûr) Comment s'appelait l'assemblée qui conseillait les dirigeants de Rome ?
  **B. Le Sénat** — autres : Le Parlement · La Diète · Le Conseil des Cinq-Cents
  Ses membres étaient appelés sénateurs.
- `ra-10` (difficulté 3, sûr) En quelle année l'Empire romain d'Occident prend-il fin, avec la déposition de Romulus Augustule ?
  **A. 476** — autres : 410 · 1453 · 395
  Le chef Odoacre dépose le jeune empereur en septembre 476.
  Sources : <https://catalogue.bnf.fr/ark:/12148/cb170338925> ; <https://fr.vikidia.org/wiki/Romulus_Augustule>

## Reformulé ou écarté pendant la rédaction

- Le Chanteur de jazz : souvent appelé « premier film parlant », il n'a que quelques minutes de dialogues ; l'énoncé dit « premier long métrage à faire entendre des dialogues synchronisés ».
- Blanche-Neige : premier long métrage d'animation de Disney, pas le premier de l'histoire du cinéma ; l'énoncé le précise.
- Téléphone : brevet de Bell en 1876, d'autres inventeurs travaillaient sur des appareils proches ; l'énoncé parle du brevet.
- Ch'tis : écarté « Rien à déclarer » et « La Ch'tite famille » des propositions (autres films de Dany Boon dans le Nord).
- Peintres : « Monet » et « Manet » ne figurent jamais ensemble dans les propositions (une lettre d'écart : la réponse libre les confondrait).
- Vitesse du son : « 34 m/s » écarté des propositions (trop proche de « 340 m/s » pour la réponse libre).
- 476 : la fin de l'Empire d'Occident est parfois datée de 480 (mort de Julius Nepos) ; l'énoncé lie la date à la déposition de Romulus Augustule.
