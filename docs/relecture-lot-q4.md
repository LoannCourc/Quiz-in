# Relecture du lot Q4 : 10 quiz

Lot Q4 du plan de contenu (octobre 2026) : 10 quiz de 10 questions, ajoutés le 2026-10-14, tous marqués « provisoire, à relire (lot Q4) ». En cas de différence, c'est le fichier JSON de `content/quizzes/` qui fait foi.

- Quiz faciles et moyens : faits classiques, certitude « sûr » ou « à vérifier » ; tout doute a été retiré. Questions de difficulté 3 : vérifiées en ligne.
- Quiz difficiles : deux sources par réponse.
- Après relecture : `npm run build` dans `content/`, puis réimport de `/quizzes` puis de `/questions` (jamais la racine).

## À vérifier en priorité (0)

Aucune question marquée « à vérifier » : les points douteux rencontrés pendant la rédaction ont été retirés ou reformulés (voir la fin du document).

## Les 10 quiz

| Quiz | Identifiant | Thème | Niveau | Public | Moyenne |
|---|---|---|---|---|---|
| Les grandes sagas du cinéma | `sagas-cinema` | Cinéma et séries | Moyen | Tout public | 1,5 |
| La mythologie grecque | `mythologie-grecque` | Culture générale | Moyen | Tout public | 1,7 |
| Météo et climat | `meteo-climat` | Sciences et nature | Facile | Tout public | 1,5 |
| La Seconde Guerre mondiale | `seconde-guerre-mondiale` | Histoire | Difficile | Experts | 2,4 |
| Les sports d'hiver | `sports-hiver` | Sport | Facile | Tout public | 1,6 |
| Le rugby | `rugby` | Sport | Moyen | Tout public | 1,6 |
| Rock et pop internationale | `rock-pop` | Musique | Moyen | Tout public | 1,7 |
| Villes et régions de France | `villes-de-france` | Géographie | Facile | Tout public | 1,4 |
| Pays du monde | `pays-du-monde` | Géographie | Difficile | Experts | 2,4 |
| Jouets d'hier et d'aujourd'hui | `jouets` | Loisirs | Facile | Tout public | 1,4 |

## Toutes les questions

### Les grandes sagas du cinéma (`sagas-cinema`)

- `sg-01` (difficulté 1, sûr) Dans « Harry Potter », dans quelle maison de Poudlard Harry est-il envoyé ?
  **B. Gryffondor** — autres : Serpentard · Poufsouffle · Serdaigle
  C'est le Choixpeau magique qui répartit les élèves.
- `sg-02` (difficulté 1, sûr) Quel est le matricule de l'agent secret James Bond ?
  **D. 007** — autres : 001 · 700 · 070
  Le double zéro signifie qu'il a le « permis de tuer ».
- `sg-03` (difficulté 1, sûr) Quel archéologue au chapeau et au fouet est incarné par Harrison Ford ?
  **A. Indiana Jones** — autres : Han Solo · Rick Deckard · Allan Quatermain
  Harrison Ford joue aussi Han Solo dans « Star Wars ».
- `sg-04` (difficulté 1, sûr) Dans « Star Wars », quel petit maître Jedi vert parle en inversant ses phrases ?
  **C. Yoda** — autres : Obi-Wan Kenobi · Chewbacca · R2-D2
  « Puissant tu deviendras. »
- `sg-05` (difficulté 1, sûr) Dans « Jurassic Park » (1993), quel dinosaure géant poursuit la jeep des héros ?
  **C. Le tyrannosaure** — autres : Le vélociraptor · Le tricératops · Le brachiosaure
  Son reflet apparaît dans le rétroviseur : « les objets sont plus proches qu'ils ne paraissent ».
- `sg-06` (difficulté 2, sûr) Dans quelle ville vit le boxeur Rocky Balboa ?
  **A. Philadelphie** — autres : Chicago · Boston · Détroit
  Il s'entraîne en montant les marches du musée d'art de la ville.
- `sg-07` (difficulté 2, sûr) Dans « Pirates des Caraïbes », comment s'appelle le navire de Jack Sparrow ?
  **D. Le Black Pearl** — autres : Le Hollandais volant · La Revanche de la Reine Anne · L'Endeavour
  On le reconnaît à ses voiles noires.
- `sg-08` (difficulté 2, sûr) Quel acteur incarne James Bond dans le tout premier film de la série, « James Bond 007 contre Dr No » (1962) ?
  **B. Sean Connery** — autres : Roger Moore · Daniel Craig · Pierce Brosnan
  Il joue Bond dans sept films.
- `sg-09` (difficulté 2, sûr) Dans « Le Seigneur des anneaux », comment Gollum appelle-t-il l'Anneau ?
  **A. « Mon précieux »** — autres : « Mon trésor » · « Mon maître » · « Mon ombre »
  L'Anneau l'a rendu obsédé pendant des siècles.
- `sg-10` (difficulté 2, sûr) Dans « Matrix », quelle pilule Neo avale-t-il pour découvrir la vérité ?
  **C. La rouge** — autres : La bleue · La verte · La jaune
  La bleue l'aurait renvoyé à sa vie ordinaire.

### La mythologie grecque (`mythologie-grecque`)

- `mg-01` (difficulté 1, sûr) Qui est le roi des dieux de l'Olympe ?
  **D. Zeus** — autres : Hadès · Apollon · Arès
  Il lance la foudre.
- `mg-02` (difficulté 1, sûr) Quelle créature aux cheveux de serpents change en pierre ceux qui la regardent ?
  **A. Méduse** — autres : La Chimère · L'Hydre · La Sphinge
  Persée lui coupe la tête en la regardant dans un bouclier.
- `mg-03` (difficulté 2, sûr) Quel héros grec tue le Minotaure dans le labyrinthe ?
  **C. Thésée** — autres : Persée · Jason · Achille
  Le labyrinthe se trouvait en Crète.
- `mg-04` (difficulté 2, sûr) Quelle princesse donne à Thésée un fil pour ressortir du labyrinthe ?
  **C. Ariane** — autres : Pénélope · Hélène · Médée
  D'où l'expression « le fil d'Ariane ».
- `mg-05` (difficulté 2, sûr) Quel héros rusé imagine le cheval de Troie ?
  **A. Ulysse** — autres : Agamemnon · Hector · Pâris
  Son long retour vers Ithaque est raconté dans « L'Odyssée ».
- `mg-06` (difficulté 2, sûr) Quelle déesse de la sagesse est la protectrice d'Athènes ?
  **D. Athéna** — autres : Aphrodite · Héra · Artémis
  Le Parthénon lui était consacré.
- `mg-07` (difficulté 1, sûr) Où se trouve le seul point faible d'Achille ?
  **B. Au talon** — autres : Au genou · À l'épaule · Au cœur
  Sa mère l'avait plongé dans le Styx en le tenant par le talon.
- `mg-08` (difficulté 2, sûr) Quel Titan vole le feu aux dieux pour le donner aux hommes ?
  **A. Prométhée** — autres : Atlas · Cronos · Hypérion
  Zeus le punit en l'enchaînant à un rocher.
- `mg-09` (difficulté 2, sûr) Comment s'appelle la femme qui, en ouvrant une jarre interdite, libère tous les maux du monde ?
  **C. Pandore** — autres : Psyché · Perséphone · Cassandre
  Seule l'Espérance reste au fond.
- `mg-10` (difficulté 2, sûr) Quel chien à trois têtes garde l'entrée des Enfers ?
  **B. Cerbère** — autres : Pégase · Le Minotaure · Charybde
  Héraclès le capture lors de son dernier travail.

### Météo et climat (`meteo-climat`)

- `met-01` (difficulté 1, sûr) Quel instrument mesure la température ?
  **A. Le thermomètre** — autres : Le baromètre · L'anémomètre · Le pluviomètre
  L'anémomètre, lui, mesure la vitesse du vent.
- `met-02` (difficulté 1, sûr) Comment appelle-t-on les grains de glace qui tombent parfois pendant un orage ?
  **C. La grêle** — autres : La neige · La bruine · La rosée
  Certains grêlons peuvent être aussi gros qu'une balle de golf.
- `met-03` (difficulté 1, sûr) Quel phénomène lumineux accompagne le tonnerre pendant un orage ?
  **C. L'éclair** — autres : L'arc-en-ciel · L'aurore · Le halo
  On voit l'éclair avant d'entendre le tonnerre, car la lumière va plus vite que le son.
- `met-04` (difficulté 1, sûr) À combien de degrés Celsius l'eau pure gèle-t-elle ?
  **A. 0** — autres : -10 · 4 · 10
  C'est le point de départ de l'échelle Celsius.
- `met-05` (difficulté 1, sûr) Comment appelle-t-on un tourbillon de vent très violent en forme d'entonnoir ?
  **D. Une tornade** — autres : Une mousson · Une brise · Une averse
  Elle naît sous un nuage d'orage.
- `met-06` (difficulté 2, sûr) Quel vent froid et sec descend la vallée du Rhône vers la Méditerranée ?
  **B. Le mistral** — autres : La tramontane · Le sirocco · Le foehn
  La tramontane souffle plutôt sur le Languedoc et le Roussillon.
- `met-07` (difficulté 2, sûr) Quel instrument mesure la pression de l'air ?
  **A. Le baromètre** — autres : Le thermomètre · L'hygromètre · L'anémomètre
  Une pression qui baisse annonce souvent du mauvais temps.
- `met-08` (difficulté 2, sûr) Comment appelle-t-on les cyclones tropicaux de l'Atlantique Nord et des Caraïbes ?
  **C. Les ouragans** — autres : Les typhons · Les moussons · Les blizzards
  Dans le nord-ouest du Pacifique, on parle de typhons.
- `met-09` (difficulté 2, sûr) Comment appelle-t-on la fine couche de glace qui blanchit l'herbe les matins froids ?
  **B. Le givre** — autres : La rosée · La brume · Le verglas
  La rosée, elle, est faite de gouttelettes d'eau liquide.
- `met-10` (difficulté 2, sûr) Comment s'appelle la saison des grandes pluies en Inde et en Asie du Sud ?
  **D. La mousson** — autres : La sécheresse · La canicule · La banquise
  Elle est apportée par des vents venus de l'océan.

### La Seconde Guerre mondiale (`seconde-guerre-mondiale`)

- `sgm-01` (difficulté 2, sûr) Quel est le nom de code du plan de débarquement allié en Normandie ?
  **C. Overlord** — autres : Torch · Market Garden · Barbarossa
  Son volet naval s'appelait « Neptune ».
  Sources : <https://www.defense.gouv.fr/chemins-memoire/histoire-memoires/ressources-historiques/seconde-guerre-mondiale/operations-militaires/1944-10> ; <https://www.herodote.net/Quel_etait_le_nom_de_code_du_debarquement_de_Normandie_-devinettes-406.php>
- `sgm-02` (difficulté 2, sûr) Quelle bataille, de l'été 1942 à février 1943, marque un tournant sur le front de l'Est ?
  **C. Stalingrad** — autres : Koursk · Leningrad · Moscou
  La 6e armée allemande y est encerclée puis capitule.
  Sources : <https://fr.vikidia.org/wiki/Bataille_de_Stalingrad> ; <https://www.worldhistory.org/trans/fr/2-2696/bataille-de-stalingrad/>
- `sgm-03` (difficulté 3, sûr) Quelle bataille navale de juin 1942 marque un tournant dans la guerre du Pacifique ?
  **A. Midway** — autres : Guadalcanal · Okinawa · Iwo Jima
  Le Japon y perd quatre porte-avions.
  Sources : <https://www.universalis.fr/encyclopedie/bataille-de-midway/> ; <https://www.worldhistory.org/trans/fr/2-2964/bataille-de-midway/>
- `sgm-04` (difficulté 2, sûr) De quelle ville du Nord les soldats alliés sont-ils évacués vers l'Angleterre, fin mai 1940 ?
  **D. Dunkerque** — autres : Calais · Boulogne-sur-Mer · Le Havre
  L'opération Dynamo sauve environ 340 000 soldats.
  Sources : <https://explore.britannica.com/study/timeline-of-the-dunkirk-evacuation> ; <https://www.defense.gouv.fr/chemins-memoire/histoire-memoires/ressources-historiques/seconde-guerre-mondiale/operations-militaires/1939-1940-9>
- `sgm-05` (difficulté 3, sûr) Quel est le nom de code de l'invasion de l'URSS par l'Allemagne, le 22 juin 1941 ?
  **B. Barbarossa** — autres : Overlord · Typhon · Citadelle
  Le nom rend hommage à l'empereur Frédéric Barberousse.
  Sources : <https://www.herodote.net/22_juin_1941-evenement-19410622.php> ; <https://www.worldhistory.org/trans/fr/1-24188/operation-barbarossa/>
- `sgm-06` (difficulté 2, sûr) Quel chef de la Résistance, qui en a unifié les mouvements, est arrêté à Caluire en juin 1943 ?
  **A. Jean Moulin** — autres : Pierre Brossolette · Lucie Aubrac · Henri Frenay
  Il meurt quelques semaines plus tard, après avoir été torturé.
  Sources : <https://www.lyoncapitale.fr/Actualite/21-juin-1943-Jean-Moulin-trahi-et-arrete> ; <https://fr.vikidia.org/wiki/Jean_Moulin>
- `sgm-07` (difficulté 2, sûr) Quelle bataille aérienne de 1940 oppose la Royal Air Force à la Luftwaffe ?
  **C. La bataille d'Angleterre** — autres : La bataille de France · La bataille de l'Atlantique · La bataille des Ardennes
  L'échec allemand fait reporter l'invasion de la Grande-Bretagne.
  Sources : <https://www.worldhistory.org/trans/fr/1-22787/bataille-dangleterre/> ; <https://www.canada.ca/fr/force-aerienne/services/histoire-patrimoine/bataille-angleterre/histoire.html>
- `sgm-08` (difficulté 3, sûr) Quel général allemand, chef de l'Afrikakorps, est surnommé le « Renard du désert » ?
  **B. Erwin Rommel** — autres : Heinz Guderian · Erich von Manstein · Gerd von Rundstedt
  Il combat en Afrique du Nord à partir de 1941.
  Sources : <https://www.universalis.fr/encyclopedie/erwin-rommel/> ; <https://www.defense.gouv.fr/chemins-memoire/histoire-memoires/personnalites/personnalites-lettre-n-lettre-w/erwin-rommel>
- `sgm-09` (difficulté 3, sûr) Dans quelle ville allemande Truman, Staline et Churchill, puis Attlee, se réunissent-ils en juillet 1945 ?
  **D. Potsdam** — autres : Berlin · Nuremberg · Munich
  La conférence se tient au château de Cecilienhof.
  Sources : <https://www.herodote.net/17_juillet_2_aout_1945-evenement-19450717.php> ; <https://www.cvce.eu/en/obj/la_conference_de_potsdam_17_juillet_au_2_aout_1945-fr-68fef0e8-4d6c-411e-9284-4b11291782d6.html>
- `sgm-10` (difficulté 2, sûr) Quelle ville japonaise est frappée par la seconde bombe atomique, le 9 août 1945 ?
  **A. Nagasaki** — autres : Hiroshima · Kokura · Osaka
  Kokura était la cible prévue, mais les nuages l'ont épargnée.
  Sources : <https://fr.vikidia.org/wiki/Bombardements_atomiques_d%27Hiroshima_et_de_Nagasaki> ; <https://www.history.com/this-day-in-history/August-9/atomic-bomb-dropped-on-nagasaki>

### Les sports d'hiver (`sports-hiver`)

- `shv-01` (difficulté 1, sûr) Dans quel sport fait-on glisser de lourdes pierres sur la glace en balayant devant elles ?
  **C. Le curling** — autres : Le hockey · Le bobsleigh · La luge
  Le balayage aide la pierre à aller plus loin.
- `shv-02` (difficulté 1, sûr) Au hockey sur glace, avec quoi joue-t-on à la place d'une balle ?
  **A. Un palet** — autres : Un ballon · Un volant · Une bille
  Au Québec, on l'appelle la rondelle.
- `shv-03` (difficulté 1, sûr) Quelle épreuve de ski consiste à descendre en passant entre des portes très rapprochées ?
  **D. Le slalom** — autres : Le saut · Le biathlon · Le ski de fond
  Le slalom géant a des portes plus espacées.
- `shv-04` (difficulté 2, sûr) Quel sport associe le ski de fond et le tir à la carabine ?
  **B. Le biathlon** — autres : Le combiné nordique · Le triathlon · Le pentathlon
  Le combiné nordique, lui, associe ski de fond et saut à ski.
- `shv-05` (difficulté 1, sûr) Comment appelle-t-on la planche sur laquelle on descend les pistes, les deux pieds attachés ?
  **A. Le snowboard** — autres : Le ski alpin · Le patin · Le bobsleigh
  On dit aussi « surf des neiges ».
- `shv-06` (difficulté 2, sûr) Quelle épreuve se pratique à plat ventre sur une luge, la tête la première ?
  **C. Le skeleton** — autres : La luge · Le bobsleigh · Le curling
  En luge, on descend sur le dos, les pieds en avant.
- `shv-07` (difficulté 2, sûr) Quel skieur français remporte trois médailles d'or aux Jeux de Grenoble, en 1968 ?
  **B. Jean-Claude Killy** — autres : Luc Alphand · Alexis Pinturault · Émile Allais
  Il gagne la descente, le slalom et le slalom géant.
- `shv-08` (difficulté 1, sûr) Comment s'appelle la remontée mécanique où l'on s'assoit sur une banquette suspendue ?
  **D. Le télésiège** — autres : Le téléski · Le téléphérique · Le funiculaire
  Au téléski, on reste debout sur ses skis.
- `shv-09` (difficulté 3, sûr) En patinage artistique, quel saut, le seul à partir vers l'avant, porte le prénom d'un patineur norvégien ?
  **A. L'axel** — autres : Le lutz · Le salchow · La boucle
  Il doit son nom à Axel Paulsen ; on y fait une rotation et demie.
  Sources : <https://vitrinelinguistique.oqlf.gouv.qc.ca/fiche-gdt/fiche/8351541/axel> ; <https://www.universalis.fr/encyclopedie/sport-disciplines-le-patinage/2-le-patinage-artistique/>
- `shv-10` (difficulté 2, sûr) Au hockey sur glace, combien de joueurs par équipe sont sur la glace, gardien compris ?
  **C. 6** — autres : 5 · 7 · 11
  Un gardien et cinq joueurs de champ.

### Le rugby (`rugby`)

- `rg-01` (difficulté 1, sûr) Combien de joueurs une équipe de rugby à XV aligne-t-elle sur le terrain ?
  **A. 15** — autres : 11 · 13 · 7
  Le rugby à XIII et le rugby à 7 se jouent avec moins de joueurs.
- `rg-02` (difficulté 1, sûr) Comment s'appelle la danse maorie que les All Blacks exécutent avant leurs matchs ?
  **D. Le haka** — autres : Le hula · La samba · La gigue
  Les All Blacks sont l'équipe de Nouvelle-Zélande.
- `rg-03` (difficulté 1, sûr) Quel tournoi annuel oppose la France, l'Angleterre, l'Écosse, le pays de Galles, l'Irlande et l'Italie ?
  **B. Le Tournoi des Six Nations** — autres : La Coupe du monde · Le Rugby Championship · La Coupe d'Europe
  L'Italie l'a rejoint en 2000.
- `rg-04` (difficulté 2, sûr) Combien de points rapporte une transformation réussie ?
  **A. 2** — autres : 1 · 3 · 5
  Elle se tente juste après un essai.
- `rg-05` (difficulté 2, sûr) Combien de points rapporte un drop réussi ?
  **C. 3** — autres : 1 · 2 · 5
  Le ballon doit rebondir au sol juste avant d'être frappé.
- `rg-06` (difficulté 1, sûr) Dans quelle direction les passes à la main doivent-elles être faites ?
  **B. Vers l'arrière** — autres : Vers l'avant · En diagonale vers l'avant · Dans n'importe quelle direction
  Une passe vers l'avant est un « en-avant », sanctionné par l'arbitre.
- `rg-07` (difficulté 1, sûr) Comment s'appelle la phase où les avants des deux équipes se lient et poussent face à face ?
  **D. La mêlée** — autres : La touche · L'essai · La chandelle
  Le demi de mêlée y introduit le ballon.
- `rg-08` (difficulté 2, sûr) Quelle équipe nationale est surnommée les « Springboks » ?
  **A. L'Afrique du Sud** — autres : La Nouvelle-Zélande · L'Australie · L'Argentine
  Le springbok est une antilope d'Afrique australe.
- `rg-09` (difficulté 3, sûr) Quel nom porte le trophée remis au vainqueur de la Coupe du monde de rugby ?
  **C. Le trophée Webb Ellis** — autres : Le bouclier de Brennus · La Calcutta Cup · La coupe Bledisloe
  Il honore William Webb Ellis, présenté comme l'inventeur du rugby.
  Sources : <https://www.sudradio.fr/sport-rugby/rugby/un-francais-a-dessine-le-trophee-webb-ellis> ; <https://www.defense-92.fr/animation-commercial/le-trophee-de-la-coupe-du-monde-de-rugby-sinvite-a-la-defense-76685>
- `rg-10` (difficulté 2, sûr) Comment appelle-t-on le fait de gagner tous ses matchs du Tournoi des Six Nations ?
  **C. Le Grand Chelem** — autres : La Triple Couronne · Le doublé · La cuillère de bois
  La cuillère de bois revient à l'équipe qui perd tous ses matchs.

### Rock et pop internationale (`rock-pop`)

- `rp-01` (difficulté 1, sûr) Quel groupe britannique avait Freddie Mercury pour chanteur ?
  **D. Queen** — autres : The Who · Genesis · Deep Purple
  Le groupe a signé « Bohemian Rhapsody ».
- `rp-02` (difficulté 1, sûr) De quel pays vient le groupe ABBA ?
  **B. La Suède** — autres : La Norvège · Le Danemark · Les Pays-Bas
  Il remporte l'Eurovision en 1974 avec « Waterloo ».
- `rp-03` (difficulté 2, sûr) Quel guitariste gaucher joue l'hymne américain au festival de Woodstock, en 1969 ?
  **A. Jimi Hendrix** — autres : Eric Clapton · Carlos Santana · Jimmy Page
  Sa version distordue est restée célèbre.
- `rp-04` (difficulté 2, sûr) Quel groupe publie l'album « The Dark Side of the Moon » en 1973 ?
  **C. Pink Floyd** — autres : Led Zeppelin · Genesis · Yes
  Sa pochette montre un prisme qui décompose la lumière.
- `rp-05` (difficulté 1, sûr) Quel groupe irlandais a pour chanteur Bono ?
  **B. U2** — autres : The Cranberries · Coldplay · Oasis
  Le groupe vient de Dublin.
- `rp-06` (difficulté 2, sûr) Quel groupe de Seattle, emmené par Kurt Cobain, a popularisé le grunge ?
  **D. Nirvana** — autres : Pearl Jam · Soundgarden · Foo Fighters
  Son album « Nevermind » sort en 1991.
- `rp-07` (difficulté 2, sûr) Quel album de Michael Jackson, sorti en 1982, contient « Billie Jean » et « Beat It » ?
  **A. Thriller** — autres : Bad · Off the Wall · Dangerous
  Son clip, avec des zombies, est entré dans l'histoire.
- `rp-08` (difficulté 2, sûr) Quel chanteur britannique a créé le personnage de Ziggy Stardust ?
  **C. David Bowie** — autres : Elton John · Freddie Mercury · Mick Jagger
  Ziggy Stardust est une rock star venue de l'espace.
- `rp-09` (difficulté 1, sûr) Quelle chanteuse est surnommée la « reine de la pop » ?
  **C. Madonna** — autres : Cher · Cyndi Lauper · Kylie Minogue
  Elle débute au début des années 1980.
- `rp-10` (difficulté 3, sûr) Sous quel nom de scène est connu Reginald Dwight, l'auteur de « Your Song » ?
  **A. Elton John** — autres : George Michael · Phil Collins · Rod Stewart
  Il emprunte son nom à deux musiciens qu'il admirait.
  Sources : <https://www.nrj.fr/artistes/elton-john/biographie> ; <https://www.universalis.fr/encyclopedie/elton-john/>

### Villes et régions de France (`villes-de-france`)

- `vf-01` (difficulté 2, sûr) Quelle ville accueille chaque été un célèbre festival de théâtre, dans la cour du palais des Papes ?
  **B. Avignon** — autres : Cannes · Deauville · Annecy
  Le festival a été créé par Jean Vilar en 1947.
- `vf-02` (difficulté 1, sûr) Quelle ville d'Alsace accueille le Parlement européen ?
  **A. Strasbourg** — autres : Colmar · Mulhouse · Metz
  Sa cathédrale est l'une des plus hautes de France.
- `vf-03` (difficulté 1, sûr) Quelle région est célèbre pour ses champs de lavande ?
  **C. La Provence** — autres : La Bretagne · La Normandie · L'Auvergne
  Ils fleurissent en violet au début de l'été.
- `vf-04` (difficulté 2, sûr) Quelle ville est surnommée la « capitale des Gaules » ?
  **B. Lyon** — autres : Marseille · Bordeaux · Reims
  Elle s'appelait Lugdunum à l'époque romaine.
- `vf-05` (difficulté 1, sûr) De quelle région la crêpe et le cidre sont-ils deux grands symboles ?
  **D. La Bretagne** — autres : L'Alsace · La Provence · La Bourgogne
  Les galettes salées sont faites de farine de sarrasin.
- `vf-06` (difficulté 2, sûr) Quelle ville du Nord organise chaque septembre une immense braderie ?
  **A. Lille** — autres : Roubaix · Amiens · Arras
  On y mange traditionnellement des moules-frites.
- `vf-07` (difficulté 1, sûr) Quelle ville accueille chaque année la course automobile des 24 Heures ?
  **C. Le Mans** — autres : Reims · Pau · Nevers
  Les voitures roulent jour et nuit pendant 24 heures.
- `vf-08` (difficulté 1, sûr) Quelle ville de la Côte d'Azur est célèbre pour sa promenade des Anglais ?
  **C. Nice** — autres : Cannes · Antibes · Menton
  Elle longe la baie des Anges.
- `vf-09` (difficulté 2, sûr) Quelle ville de l'Aude est célèbre pour sa cité médiévale fortifiée ?
  **A. Carcassonne** — autres : Narbonne · Perpignan · Béziers
  Ses remparts ont été restaurés au XIXe siècle par Viollet-le-Duc.
- `vf-10` (difficulté 1, sûr) Quelle ville, au bord de la Garonne, abrite la Cité du Vin ?
  **D. Bordeaux** — autres : Toulouse · Agen · Libourne
  Sa région viticole est connue dans le monde entier.

### Pays du monde (`pays-du-monde`)

- `pm-01` (difficulté 3, sûr) Quel pays a le seul drapeau national qui n'est ni rectangulaire ni carré ?
  **A. Le Népal** — autres : Le Bhoutan · La Suisse · Le Vatican
  Il est formé de deux fanions triangulaires superposés.
  Sources : <https://crwflags.com/fotw/Flags/np.html> ; <https://currentaffairs.adda247.com/which-is-the-only-national-flag-in-the-world-that-is-neither-square-nor-rectangular/>
- `pm-02` (difficulté 3, sûr) En plus de la Bolivie, quel pays d'Amérique du Sud n'a aucun accès à la mer ?
  **C. Le Paraguay** — autres : L'Uruguay · L'Équateur · Le Suriname
  Ses voisins sont le Brésil, la Bolivie et l'Argentine.
  Sources : <https://www.larousse.fr/encyclopedie/pays/Paraguay/137021> ; <https://www.techno-science.net/fr/definitions/paraguay>
- `pm-03` (difficulté 3, sûr) Quel royaume est entièrement entouré par l'Afrique du Sud ?
  **B. Le Lesotho** — autres : L'Eswatini · Le Botswana · La Namibie
  L'Eswatini touche aussi le Mozambique.
  Sources : <https://www.larousse.fr/encyclopedie/pays/Lesotho/129619> ; <https://axl.cefan.ulaval.ca/afrique/lesotho.htm>
- `pm-04` (difficulté 2, sûr) Quel pays a pour capitale Addis-Abeba ?
  **D. L'Éthiopie** — autres : Le Kenya · L'Érythrée · La Somalie
  La ville accueille aussi le siège de l'Union africaine.
  Sources : <https://fr.vikidia.org/wiki/Addis-Abeba> ; <https://telquel.ma/2022/02/03/loin-de-la-guerre-la-capitale-ethiopienne-addis-abeba-accueille-le-sommet-de-lunion-africaine_1752850>
- `pm-05` (difficulté 2, sûr) Quels pays le détroit de Béring sépare-t-il ?
  **A. La Russie et les États-Unis** — autres : Le Canada et la Russie · Le Japon et la Russie · Les États-Unis et le Canada
  Il sépare la Sibérie de l'Alaska, sur environ 85 km.
  Sources : <https://cnes.fr/detroit-de-bering-fenetre-frontiere-interface-geostrategiques-entre-oceans-glacial-arctique-ocean> ; <https://fr.vikidia.org/wiki/D%C3%A9troit_de_B%C3%A9ring>
- `pm-06` (difficulté 3, sûr) Quelle ville est la capitale constitutionnelle de la Bolivie ?
  **C. Sucre** — autres : La Paz · Santa Cruz · Cochabamba
  La Paz est le siège du gouvernement.
  Sources : <https://www.universalis.fr/atlas/amerique/amerique-du-sud/bolivie> ; <https://fr.vikidia.org/wiki/Sucre_(Bolivie)>
- `pm-07` (difficulté 2, sûr) En plus du Vatican, quel micro-État est entièrement enclavé dans l'Italie ?
  **C. Saint-Marin** — autres : Monaco · Le Liechtenstein · Andorre
  C'est l'une des plus anciennes républiques du monde.
  Sources : <https://www.larousse.fr/encyclopedie/pays/Saint-Marin/142522> ; <https://fr.vikidia.org/wiki/Saint-Marin>
- `pm-08` (difficulté 2, sûr) Quelle est la capitale de la Turquie ?
  **A. Ankara** — autres : Istanbul · Izmir · Antalya
  Elle remplace Istanbul en 1923, à la naissance de la République.
  Sources : <https://www.larousse.fr/encyclopedie/ville/Ankara/105544> ; <https://en.sigmalive.com/on-this-day-ankara-becomes-the-capital-of-turkey-1923/>
- `pm-09` (difficulté 2, sûr) Dans quel pays se trouve le désert d'Atacama, l'un des plus arides du monde ?
  **D. Le Chili** — autres : Le Mexique · L'Australie · La Namibie
  Certaines de ses stations météo n'ont jamais mesuré de pluie.
  Sources : <https://fr.vikidia.org/wiki/D%C3%A9sert_d%27Atacama> ; <https://chile.travel/fr/zones/desert-atacama-et-altiplano/>
- `pm-10` (difficulté 2, sûr) Quel pays a pour capitale Hanoï ?
  **B. Le Viêt Nam** — autres : Le Laos · Le Cambodge · La Thaïlande
  Hô Chi Minh-Ville est plus peuplée, mais Hanoï est la capitale.
  Sources : <https://lepetitjournal.com/hanoi/comprendre-vietnam/histoire-hanoi-ville-courbe-fleuve-353430> ; <https://areq.net/lang/fr/Hano%C3%AF.html>

### Jouets d'hier et d'aujourd'hui (`jouets`)

- `jx-01` (difficulté 1, sûr) Quelle marque danoise fabrique des petites briques en plastique à emboîter ?
  **C. Lego** — autres : Playmobil · Meccano · Kapla
  Son nom vient du danois « leg godt », « joue bien ».
- `jx-02` (difficulté 1, sûr) Quel casse-tête cubique aux faces colorées a été inventé par Ernő Rubik ?
  **B. Le Rubik's Cube** — autres : Le tangram · Le sudoku · Le Mastermind
  Il a été inventé en Hongrie en 1974.
- `jx-03` (difficulté 1, sûr) Comment s'appelle la poupée mannequin lancée par Mattel en 1959 ?
  **D. Barbie** — autres : Sindy · Bratz · Polly Pocket
  Son ami s'appelle Ken.
- `jx-04` (difficulté 1, sûr) Quel jouet monte et descend le long d'une ficelle enroulée ?
  **A. Le yo-yo** — autres : La toupie · Le cerf-volant · Le diabolo
  On le fait remonter d'un petit coup de poignet.
- `jx-05` (difficulté 2, sûr) Quelle marque allemande fabrique de petits personnages en plastique d'environ 7,5 cm ?
  **C. Playmobil** — autres : Lego · Schleich · Kapla
  Les premiers personnages sont sortis en 1974.
- `jx-06` (difficulté 1, sûr) Quel jouet tourne longtemps sur sa pointe quand on le lance ?
  **C. La toupie** — autres : La balle · Le yo-yo · La bille
  Elle finit par tomber en ralentissant.
- `jx-07` (difficulté 2, sûr) Quel jouet électronique des années 1990 était un petit animal virtuel à nourrir et à soigner ?
  **A. Le Tamagotchi** — autres : La Game Boy · Le Walkman · Le Pokédex
  Il venait du Japon et tenait dans la main.
- `jx-08` (difficulté 1, sûr) Quel jeu consiste à retirer des blocs de bois d'une tour sans la faire tomber ?
  **D. Le Jenga** — autres : Le Mikado · Le Kapla · Les dominos
  Au Mikado, ce sont des baguettes que l'on retire une à une.
- `jx-09` (difficulté 2, sûr) Quel président américain a donné son surnom à l'ours en peluche « teddy bear » ?
  **B. Theodore Roosevelt** — autres : Abraham Lincoln · George Washington · John F. Kennedy
  « Teddy » était le surnom de Theodore Roosevelt.
- `jx-10` (difficulté 2, sûr) Quel grand cerceau, que l'on fait tourner autour de la taille, a fait fureur à la fin des années 1950 ?
  **A. Le hula-hoop** — autres : Le frisbee · Le skateboard · La corde à sauter
  Il faut onduler des hanches pour qu'il ne tombe pas.

## Reformulé ou écarté pendant la rédaction

- Jurassic Park : écarté « sur quelle île se trouve le parc » (Isla Nublar), faute de source fiable autre que des sites de fans ; remplacé par la poursuite du tyrannosaure.
- Débarquement : « Overlord » désigne le plan d'ensemble, « Neptune » son volet naval (une source citait Neptune pour le débarquement entier).
- Pays du monde : « combien de pays d'Amérique du Sud sont enclavés » remplacé par « en plus de la Bolivie, quel pays… », plus facile à vérifier ; aucune question de « plus grand » ou « plus peuplé » (classements qui peuvent changer).
- Atacama : « l'un des plus arides du monde », les sources nuancent « le plus aride » (hors régions polaires).
