# Relecture des quiz

Document de relecture des 15 quiz de `content/quizzes/` (10 questions chacun, tous marqués « provisoire, à vérifier »). Généré à partir des fichiers sources : en cas de différence, c'est le fichier JSON qui fait foi.

- **Bonne réponse** en gras avec sa lettre (A à D), puis les trois autres propositions.
- **Fait à vérifier** : ce qu'il faut contrôler (question et explication), idéalement dans deux sources.
- ⚠️ **Pas certain à 100 %** : point à trancher en priorité.
- Après correction : `npm run build` dans `content/`, puis réimport de `/quizzes` et `/questions`. Une fois un quiz relu, retirer son `reviewStatus` ou le passer à « relu ».
- Points marqués ⚠️ : 18.

Les questions du quiz existant « Culture générale : les bases » n'ont pas été modifiées. Seule remarque : la bonne réponse y est presque toujours en position B.

## Niveau de chaque quiz (tri « Plus faciles »)

Niveau choisi pour chaque quiz (champ `level` de son fichier : `easy`, `medium` ou `hard`), affiché sur sa fiche et utilisé par le tri « Plus faciles » et les rangées « Faciles » et « Pour les experts ». Proposé d'après la moyenne des questions (1 facile, 2 moyen, 3 difficile) et le public visé. Pour le changer : modifier `level` dans le fichier, `npm run build`, puis réimport de `/quizzes`.

| Quiz | Identifiant | Niveau | Moyenne des questions | OK ? |
|---|---|---|---|---|
| Cinéma : les films cultes | `cinema-films-cultes` | Moyen | 2,0 | |
| Cuisine et gastronomie | `cuisine-gastronomie` | Moyen | 1,9 | |
| Culture générale : les bases | `culture-generale-1` | Facile | 1,2 | |
| Pour les experts : culture pointue | `culture-pointue` | Difficile | 2,5 | |
| Dessins animés et Disney | `dessins-animes-disney` | Facile | 1,3 | |
| Spécial enfants : les animaux | `enfants-animaux` | Facile | 1,3 | |
| Géographie de la France | `geographie-france` | Facile | 1,5 | |
| Géographie du monde | `geographie-monde` | Moyen | 2,0 | |
| Histoire de France | `histoire-de-france` | Difficile | 2,4 | |
| Jeux vidéo | `jeux-video` | Moyen | 2,0 | |
| Langue française : expressions et orthographe | `langue-francaise` | Difficile | 2,5 | |
| Musique : culture et histoire | `musique-culture` | Moyen | 1,9 | |
| Sciences et nature | `sciences-nature` | Moyen | 1,9 | |
| Séries cultes | `series-cultes` | Moyen | 2,0 | |
| Sport : grands moments | `sport-grands-moments` | Moyen | 1,8 | |

## 1. Culture générale : les bases

`culture-generale-1` · thème « Culture générale » · Facile (moyenne 1,2) · Tout public · affiche rose · ajouté le 2026-10-04 · Top 10 n° 1

> Histoire, sciences, arts et vie quotidienne : un quiz pour tous les âges, idéal pour lancer la soirée.

1. Quelle planète est la plus proche du Soleil ? (difficulté facile)  
   Bonne réponse : **Mercure** (B) — autres : Mars · Vénus · La Terre  
   Explication affichée : Mercure orbite à environ 58 millions de km du Soleil.  
   Fait à vérifier : Mercure est la planète la plus proche du Soleil (environ 58 millions de km).  
   Réponses acceptées en réponse libre : « mercure »
2. Combien de pattes a une araignée ? (difficulté facile)  
   Bonne réponse : **8** (B) — autres : 6 · 10 · 12  
   Explication affichée : Les araignées ne sont pas des insectes (6 pattes) mais des arachnides.  
   Réponses acceptées en réponse libre : « 8 », « huit »
3. Quel est le plus long fleuve de France ? (difficulté facile)  
   Bonne réponse : **La Loire** (B) — autres : La Seine · Le Rhône · La Garonne  
   Explication affichée : La Loire mesure environ 1 000 km, entièrement en France.  
   Fait à vérifier : La Loire (environ 1 000 km) est le plus long fleuve de France.  
   ⚠️ **Pas certain à 100 %** : quiz existant : la longueur de la Loire varie selon les sources (1 006 à 1 012 km).  
   Réponses acceptées en réponse libre : « loire »
4. Quelle est la capitale de l'Italie ? (difficulté facile)  
   Bonne réponse : **Rome** (B) — autres : Milan · Venise · Naples  
   Réponses acceptées en réponse libre : « rome »
5. Quel est le plus grand océan du monde ? (difficulté facile)  
   Bonne réponse : **Le Pacifique** (D) — autres : L'Atlantique · L'océan Indien · L'Arctique  
   Explication affichée : Le Pacifique couvre environ un tiers de la surface de la Terre.  
   Fait à vérifier : Le Pacifique couvre environ un tiers de la surface de la Terre.  
   Réponses acceptées en réponse libre : « pacifique », « océan pacifique »
6. Qui a peint La Joconde ? (difficulté facile)  
   Bonne réponse : **Léonard de Vinci** (B) — autres : Michel-Ange · Raphaël · Botticelli  
   Explication affichée : Léonard de Vinci l'a peinte au début du XVIe siècle. Elle est exposée au Louvre.  
   Fait à vérifier : La Joconde, de Léonard de Vinci (début du XVIe siècle), est au Louvre.  
   Réponses acceptées en réponse libre : « léonard de vinci », « de vinci », « vinci »
7. En quelle année un homme a-t-il marché sur la Lune pour la première fois ? (difficulté moyenne)  
   Bonne réponse : **1969** (B) — autres : 1959 · 1979 · 1989  
   Explication affichée : Neil Armstrong, commandant de la mission Apollo 11, en juillet 1969.  
   Fait à vérifier : Premiers pas sur la Lune : juillet 1969, Neil Armstrong (Apollo 11).  
   Réponses acceptées en réponse libre : « 1969 »
8. Quel est le symbole chimique de l'or ? (difficulté moyenne)  
   Bonne réponse : **Au** (B) — autres : Or · Ag · Fe  
   Explication affichée : Au vient du latin aurum. Ag est l'argent, Fe le fer.  
   Fait à vérifier : Au = or (aurum), Ag = argent, Fe = fer.  
   Réponses acceptées en réponse libre : « au »
9. Combien de joueurs une équipe de football a-t-elle sur le terrain ? (difficulté facile)  
   Bonne réponse : **11** (C) — autres : 9 · 10 · 12  
   Explication affichée : Dix joueurs de champ et un gardien de but.  
   Réponses acceptées en réponse libre : « 11 », « onze »
10. Quel est le plus grand animal du monde ? (difficulté facile)  
   Bonne réponse : **La baleine bleue** (B) — autres : L'éléphant d'Afrique · La girafe · Le requin-baleine  
   Explication affichée : La baleine bleue peut dépasser 25 mètres de long.  
   Fait à vérifier : La baleine bleue (plus de 25 m) est le plus grand animal du monde.  
   Réponses acceptées en réponse libre : « baleine bleue », « rorqual bleu », « baleine »

## 2. Cinéma : les films cultes

`cinema-films-cultes` · thème « Cinéma et séries » · Moyen (moyenne 2,0) · Tout public · affiche rouge · ajouté le 2026-09-12 · Top 10 n° 2

> Répliques, acteurs et scènes inoubliables : dix questions sur les films que tout le monde a vus (ou croit avoir vus).

1. Dans « Titanic » (1997), quel acteur incarne Jack Dawson ? (difficulté facile)  
   Bonne réponse : **Leonardo DiCaprio** (B) — autres : Brad Pitt · Matt Damon · Johnny Depp  
   Explication affichée : Leonardo DiCaprio donne la réplique à Kate Winslet, qui joue Rose.  
   Fait à vérifier : Leonardo DiCaprio joue Jack Dawson, Kate Winslet joue Rose (Titanic, 1997).  
   Réponses acceptées en réponse libre : « leonardo dicaprio », « dicaprio »
2. Quel réalisateur a signé « Les Dents de la mer » (1975) ? (difficulté moyenne)  
   Bonne réponse : **Steven Spielberg** (A) — autres : George Lucas · Ridley Scott · James Cameron  
   Explication affichée : Steven Spielberg n'avait pas 30 ans lors de la sortie du film.  
   Fait à vérifier : « Les Dents de la mer » (Jaws) est réalisé par Steven Spielberg et sort en 1975 ; Spielberg a moins de 30 ans (né en décembre 1946).  
   Réponses acceptées en réponse libre : « steven spielberg », « spielberg »
3. Dans « Le Fabuleux Destin d'Amélie Poulain », dans quel quartier de Paris vit Amélie ? (difficulté moyenne)  
   Bonne réponse : **Montmartre** (C) — autres : Le Marais · Belleville · Saint-Germain-des-Prés  
   Explication affichée : Amélie habite et travaille à Montmartre, au café des Deux Moulins.  
   Fait à vérifier : Amélie habite Montmartre et travaille au café des Deux Moulins (rue Lepic).  
   Réponses acceptées en réponse libre : « montmartre »
4. Dans « Retour vers le futur », quelle voiture sert de machine à remonter le temps ? (difficulté moyenne)  
   Bonne réponse : **Une DeLorean** (D) — autres : Une Ford Mustang · Une Chevrolet Camaro · Une Porsche 911  
   Explication affichée : Doc Brown a transformé une DeLorean DMC-12 : il faut atteindre 88 miles à l'heure.  
   Fait à vérifier : La machine à voyager dans le temps est une DeLorean DMC-12, qui doit atteindre 88 miles/h.  
   Réponses acceptées en réponse libre : « delorean », « de lorean », « dmc delorean »
5. Dans « Le Seigneur des anneaux », quel hobbit porte l'Anneau jusqu'au Mordor ? (difficulté moyenne)  
   Bonne réponse : **Frodon** (A) — autres : Bilbon · Pippin · Merry  
   Explication affichée : Frodon Sacquet, aidé de son fidèle ami Sam.  
   Fait à vérifier : Dans la traduction française, le porteur de l'Anneau s'appelle Frodon Sacquet ; Bilbon, Pippin et Merry ne le portent pas jusqu'au Mordor.  
   ⚠️ **Pas certain à 100 %** : Sam porte brièvement l'Anneau dans le livre et le film (il n'est pas parmi les propositions). Pas d'ambiguïté dans les choix, mais un joueur pointilleux pourrait le signaler.  
   Réponses acceptées en réponse libre : « frodon », « frodo », « frodon sacquet »
6. Quel film français de 2011 raconte l'amitié entre un riche tétraplégique et son aide à domicile ? (difficulté moyenne)  
   Bonne réponse : **Intouchables** (B) — autres : Bienvenue chez les Ch'tis · Le Dîner de cons · La Grande Vadrouille  
   Explication affichée : Avec François Cluzet et Omar Sy, réalisé par Olivier Nakache et Éric Toledano.  
   Fait à vérifier : « Intouchables » sort en 2011, avec François Cluzet et Omar Sy, réalisé par Olivier Nakache et Éric Toledano.  
   Réponses acceptées en réponse libre : « intouchables », « les intouchables »
7. Dans quel film de la saga « Star Wars » Dark Vador révèle-t-il à Luke qu'il est son père ? (difficulté difficile)  
   Bonne réponse : **L'Empire contre-attaque** (C) — autres : Un nouvel espoir · Le Retour du Jedi · La Menace fantôme  
   Explication affichée : Sorti en 1980, c'est le cinquième épisode de la saga et le deuxième tourné.  
   Fait à vérifier : La révélation « Je suis ton père » a lieu dans « L'Empire contre-attaque » (1980), épisode V, deuxième film tourné.  
   Réponses acceptées en réponse libre : « l'empire contre-attaque », « empire contre-attaque », « episode 5 », « episode v »
8. Quel acteur incarne Hannibal Lecter dans « Le Silence des agneaux » (1991) ? (difficulté moyenne)  
   Bonne réponse : **Anthony Hopkins** (D) — autres : Jack Nicholson · Robert De Niro · Al Pacino  
   Explication affichée : Le rôle lui a valu l'Oscar du meilleur acteur.  
   Fait à vérifier : Anthony Hopkins joue Hannibal Lecter dans « Le Silence des agneaux » (1991) et reçoit l'Oscar du meilleur acteur.  
   Réponses acceptées en réponse libre : « anthony hopkins », « hopkins »
9. Combien d'Oscars le film « Titanic » a-t-il remportés ? (difficulté difficile)  
   Bonne réponse : **11** (C) — autres : 7 · 9 · 13  
   Explication affichée : Onze statuettes, dont celle du meilleur film : un record partagé avec « Ben-Hur » et « Le Retour du roi ».  
   Fait à vérifier : « Titanic » remporte 11 Oscars dont meilleur film ; record partagé avec « Ben-Hur » (1959) et « Le Retour du roi » (2003).  
   Réponses acceptées en réponse libre : « 11 », « onze »
10. Qui joue le capitaine Jack Sparrow dans « Pirates des Caraïbes » ? (difficulté facile)  
   Bonne réponse : **Johnny Depp** (A) — autres : Orlando Bloom · Geoffrey Rush · Javier Bardem  
   Fait à vérifier : Johnny Depp joue Jack Sparrow ; Orlando Bloom, Geoffrey Rush et Javier Bardem jouent d'autres rôles dans la saga.  
   Réponses acceptées en réponse libre : « johnny depp », « depp »

## 3. Séries cultes

`series-cultes` · thème « Cinéma et séries » · Moyen (moyenne 2,0) · Tout public · affiche bleu · ajouté le 2026-09-19 · Top 10 n° 3

> Des Simpson à Kaamelott en passant par Friends : avez-vous bien regardé toutes les saisons ?

1. Dans « Friends », dans quelle ville vivent les six amis ? (difficulté facile)  
   Bonne réponse : **New York** (C) — autres : Los Angeles · Chicago · Boston  
   Explication affichée : Ils se retrouvent au Central Perk, un café de Manhattan.  
   Fait à vérifier : Les personnages de « Friends » vivent à New York (Manhattan) et se retrouvent au Central Perk.  
   Réponses acceptées en réponse libre : « new york », « manhattan »
2. Dans « Game of Thrones », comment s'appelle le trône que se disputent les grandes familles ? (difficulté moyenne)  
   Bonne réponse : **Le Trône de fer** (A) — autres : Le Trône d'or · Le Trône de pierre · Le Trône de glace  
   Explication affichée : Il a été forgé avec les épées des ennemis vaincus. C'est aussi le titre français des romans.  
   Fait à vérifier : Le trône convoité s'appelle le Trône de fer, forgé avec les épées des vaincus ; c'est le titre français des romans de George R. R. Martin.  
   Réponses acceptées en réponse libre : « trône de fer », « le trône de fer »
3. Dans « Breaking Bad », quel métier exerce Walter White au début de la série ? (difficulté moyenne)  
   Bonne réponse : **Professeur de chimie** (B) — autres : Pharmacien · Médecin · Avocat  
   Explication affichée : Il enseigne la chimie dans un lycée d'Albuquerque, au Nouveau-Mexique.  
   Fait à vérifier : Walter White est professeur de chimie dans un lycée d'Albuquerque (Nouveau-Mexique) au début de la série.  
   Réponses acceptées en réponse libre : « professeur de chimie », « prof de chimie », « professeur »
4. Dans « Les Simpson », quel est le prénom du père de famille ? (difficulté facile)  
   Bonne réponse : **Homer** (D) — autres : Bart · Ned · Abraham  
   Explication affichée : Homer travaille à la centrale nucléaire de Springfield.  
   Fait à vérifier : Le père s'appelle Homer et travaille à la centrale nucléaire de Springfield.  
   Réponses acceptées en réponse libre : « homer », « homer simpson »
5. Dans « Kaamelott », quel personnage est le roi de Bretagne ? (difficulté moyenne)  
   Bonne réponse : **Arthur** (B) — autres : Perceval · Karadoc · Léodagan  
   Explication affichée : Arthur Pendragon, joué par Alexandre Astier, créateur de la série. Léodagan est roi de Carmélide.  
   Fait à vérifier : Arthur (Alexandre Astier) est roi de Bretagne ; Léodagan est roi de Carmélide.  
   Réponses acceptées en réponse libre : « arthur », « le roi arthur »
6. Dans la série « Lupin » (2021), quel acteur incarne Assane Diop ? (difficulté moyenne)  
   Bonne réponse : **Omar Sy** (A) — autres : Jamel Debbouze · Ahmed Sylla · Vincent Cassel  
   Explication affichée : Assane Diop s'inspire du gentleman cambrioleur Arsène Lupin, héros de Maurice Leblanc.  
   Fait à vérifier : Dans « Lupin » (Netflix, 2021), Omar Sy incarne Assane Diop.  
   Réponses acceptées en réponse libre : « omar sy »
7. Dans la version américaine de « The Office », dans quelle ville se trouve l'agence Dunder Mifflin ? (difficulté difficile)  
   Bonne réponse : **Scranton** (C) — autres : Pittsburgh · Stamford · Philadelphie  
   Explication affichée : Scranton, en Pennsylvanie. L'agence de Stamford fusionne avec elle dans la saison 3.  
   Fait à vérifier : L'agence Dunder Mifflin de la série est à Scranton (Pennsylvanie) ; celle de Stamford fusionne avec elle pendant la saison 3.  
   Réponses acceptées en réponse libre : « scranton »
8. Quelle série britannique suit le gang des Shelby à Birmingham, après la Première Guerre mondiale ? (difficulté moyenne)  
   Bonne réponse : **Peaky Blinders** (D) — autres : Downton Abbey · Sherlock · The Crown  
   Explication affichée : Tommy Shelby y est joué par Cillian Murphy.  
   Fait à vérifier : « Peaky Blinders » suit la famille Shelby à Birmingham à partir de 1919 ; Tommy Shelby est joué par Cillian Murphy.  
   Réponses acceptées en réponse libre : « peaky blinders »
9. Dans la série « Sherlock » de la BBC, quel acteur joue Sherlock Holmes ? (difficulté moyenne)  
   Bonne réponse : **Benedict Cumberbatch** (B) — autres : Martin Freeman · Tom Hiddleston · Matt Smith  
   Explication affichée : Martin Freeman y joue le docteur Watson.  
   Fait à vérifier : Benedict Cumberbatch joue Sherlock ; Martin Freeman joue Watson.  
   Réponses acceptées en réponse libre : « benedict cumberbatch », « cumberbatch »
10. Combien de saisons compte la série « Friends » ? (difficulté difficile)  
   Bonne réponse : **10** (C) — autres : 8 · 9 · 12  
   Explication affichée : Dix saisons, diffusées aux États-Unis de 1994 à 2004.  
   Fait à vérifier : « Friends » compte 10 saisons, diffusées de 1994 à 2004.  
   Réponses acceptées en réponse libre : « 10 », « dix »

## 4. Géographie de la France

`geographie-france` · thème « Géographie » · Facile (moyenne 1,5) · Tout public · affiche vert · ajouté le 2026-09-05 · Top 10 n° 10

> Montagnes, fleuves, villes et régions : un tour de France en dix questions, accessible à tous.

1. Quelle est la plus haute montagne de France ? (difficulté facile)  
   Bonne réponse : **Le mont Blanc** (B) — autres : Le mont Ventoux · Le puy de Dôme · Le Vignemale  
   Explication affichée : Le mont Blanc culmine à environ 4 800 m, à la frontière franco-italienne.  
   Fait à vérifier : Le mont Blanc (environ 4 805 m) est le plus haut sommet de France.  
   ⚠️ **Pas certain à 100 %** : le sommet du mont Blanc est à la frontière franco-italienne, et le tracé exact au sommet est contesté entre les deux pays. La réponse reste la bonne, mais l'explication dit « à la frontière » sans entrer dans le débat.  
   Réponses acceptées en réponse libre : « mont blanc », « le mont blanc »
2. Quelle ville est surnommée la « Ville rose » ? (difficulté facile)  
   Bonne réponse : **Toulouse** (A) — autres : Lyon · Bordeaux · Montpellier  
   Explication affichée : À cause de la brique rose de nombreux bâtiments.  
   Fait à vérifier : Toulouse est surnommée la « Ville rose » à cause de la brique.  
   Réponses acceptées en réponse libre : « toulouse »
3. Quelle mer borde la ville de Marseille ? (difficulté facile)  
   Bonne réponse : **La mer Méditerranée** (C) — autres : La Manche · La mer du Nord · La mer Baltique  
   Réponses acceptées en réponse libre : « méditerranée », « mer méditerranée », « la méditerranée »
4. Quel fleuve traverse Paris ? (difficulté facile)  
   Bonne réponse : **La Seine** (D) — autres : La Loire · Le Rhône · La Garonne  
   Réponses acceptées en réponse libre : « seine », « la seine »
5. Quelle ville est le chef-lieu de la région Bretagne ? (difficulté moyenne)  
   Bonne réponse : **Rennes** (A) — autres : Brest · Nantes · Quimper  
   Explication affichée : Nantes, souvent citée, est en Pays de la Loire depuis la création des régions.  
   Fait à vérifier : Rennes est le chef-lieu de la région Bretagne ; Nantes (Loire-Atlantique) fait partie des Pays de la Loire.  
   ⚠️ **Pas certain à 100 %** : l'explication dit que Nantes est en Pays de la Loire « depuis la création des régions » : à vérifier (rattachement dès les années 1950-1960).  
   Réponses acceptées en réponse libre : « rennes »
6. Dans quelle région se trouve le Mont-Saint-Michel ? (difficulté moyenne)  
   Bonne réponse : **La Normandie** (B) — autres : La Bretagne · Les Pays de la Loire · Les Hauts-de-France  
   Explication affichée : Il se trouve dans la Manche, tout près de la limite avec la Bretagne.  
   Fait à vérifier : Le Mont-Saint-Michel est dans la Manche, donc en Normandie.  
   Réponses acceptées en réponse libre : « normandie », « la normandie »
7. Quelle chaîne de montagnes sépare la France de l'Espagne ? (difficulté moyenne)  
   Bonne réponse : **Les Pyrénées** (C) — autres : Les Alpes · Le Jura · Les Vosges  
   Réponses acceptées en réponse libre : « pyrénées », « les pyrénées »
8. Quelle île est surnommée l'« île de Beauté » ? (difficulté facile)  
   Bonne réponse : **La Corse** (D) — autres : L'île de Ré · L'île d'Oléron · Belle-Île-en-Mer  
   Fait à vérifier : La Corse est surnommée l'« île de Beauté ».  
   Réponses acceptées en réponse libre : « corse », « la corse »
9. Avec combien de pays la France métropolitaine partage-t-elle une frontière terrestre ? (difficulté moyenne)  
   Bonne réponse : **8** (C) — autres : 5 · 6 · 10  
   Explication affichée : Belgique, Luxembourg, Allemagne, Suisse, Italie, Monaco, Andorre et Espagne.  
   Fait à vérifier : Pays frontaliers de la France métropolitaine : Belgique, Luxembourg, Allemagne, Suisse, Italie, Monaco, Andorre, Espagne (8).  
   Réponses acceptées en réponse libre : « 8 », « huit »
10. Après Paris, quelle est la ville la plus peuplée de France ? (difficulté moyenne)  
   Bonne réponse : **Marseille** (B) — autres : Lyon · Toulouse · Nice  
   Explication affichée : En nombre d'habitants de la commune. Lyon passe devant si l'on compte toute l'agglomération.  
   Fait à vérifier : Marseille est la deuxième commune la plus peuplée ; l'unité urbaine (ou l'aire d'attraction) de Lyon dépasse celle de Marseille.  
   ⚠️ **Pas certain à 100 %** : la comparaison Lyon/Marseille à l'échelle de l'agglomération dépend de la définition INSEE (unité urbaine, aire d'attraction) : vérifier les chiffres récents ou retirer cette phrase de l'explication.  
   Réponses acceptées en réponse libre : « marseille »

## 5. Géographie du monde

`geographie-monde` · thème « Géographie » · Moyen (moyenne 2,0) · Tout public · affiche cyan · ajouté le 2026-09-08 · Top 10 n° 5

> Capitales trompeuses, fleuves géants et déserts immenses : le tour du monde sans quitter le canapé.

1. Quel est le plus long fleuve d'Afrique ? (difficulté moyenne)  
   Bonne réponse : **Le Nil** (C) — autres : Le Congo · Le Niger · Le Zambèze  
   Explication affichée : Le Nil mesure environ 6 650 km et se jette dans la Méditerranée en Égypte.  
   Fait à vérifier : Le Nil est le plus long fleuve d'Afrique (environ 6 650 km) et se jette dans la Méditerranée.  
   ⚠️ **Pas certain à 100 %** : longueur du Nil : les sources varient (6 650 à 6 850 km). La réponse n'est pas en cause.  
   Réponses acceptées en réponse libre : « nil », « le nil »
2. Quelle est la capitale de l'Australie ? (difficulté moyenne)  
   Bonne réponse : **Canberra** (A) — autres : Sydney · Melbourne · Perth  
   Explication affichée : Canberra a été choisie comme compromis entre Sydney et Melbourne, les deux grandes rivales.  
   Fait à vérifier : Canberra est la capitale de l'Australie, choisie comme compromis entre Sydney et Melbourne.  
   Réponses acceptées en réponse libre : « canberra »
3. Dans quel pays se trouve le site inca du Machu Picchu ? (difficulté moyenne)  
   Bonne réponse : **Le Pérou** (B) — autres : Le Mexique · La Bolivie · Le Chili  
   Fait à vérifier : Le Machu Picchu est au Pérou.  
   Réponses acceptées en réponse libre : « pérou », « le pérou »
4. Quelle est la capitale du Canada ? (difficulté moyenne)  
   Bonne réponse : **Ottawa** (D) — autres : Toronto · Montréal · Vancouver  
   Explication affichée : Ottawa est en Ontario, à la limite du Québec.  
   Fait à vérifier : Ottawa (Ontario) est la capitale du Canada, à la limite du Québec.  
   Réponses acceptées en réponse libre : « ottawa »
5. Quel est le plus haut sommet du monde ? (difficulté facile)  
   Bonne réponse : **L'Everest** (A) — autres : Le K2 · Le Kilimandjaro · L'Aconcagua  
   Explication affichée : Environ 8 850 m, à la frontière entre le Népal et la Chine.  
   Fait à vérifier : L'Everest culmine à environ 8 849 m, à la frontière entre le Népal et la Chine.  
   ⚠️ **Pas certain à 100 %** : altitude de l'Everest : 8 848,86 m depuis la mesure de 2020 ; l'explication dit « environ 8 850 m ».  
   Réponses acceptées en réponse libre : « everest », « l'everest », « mont everest »
6. Quel est le plus grand désert chaud du monde ? (difficulté moyenne)  
   Bonne réponse : **Le Sahara** (C) — autres : Le désert de Gobi · Le Kalahari · L'Atacama  
   Explication affichée : « Chaud » car l'Antarctique, désert froid, est encore plus vaste.  
   Fait à vérifier : Le Sahara est le plus grand désert chaud ; l'Antarctique (désert froid) est plus vaste.  
   Réponses acceptées en réponse libre : « sahara », « le sahara »
7. Quelle est la capitale de la Nouvelle-Zélande ? (difficulté difficile)  
   Bonne réponse : **Wellington** (B) — autres : Auckland · Christchurch · Queenstown  
   Explication affichée : Auckland est la plus grande ville, mais la capitale est Wellington.  
   Fait à vérifier : Wellington est la capitale de la Nouvelle-Zélande ; Auckland est la plus grande ville.  
   Réponses acceptées en réponse libre : « wellington »
8. Quel détroit sépare l'Espagne du Maroc ? (difficulté moyenne)  
   Bonne réponse : **Le détroit de Gibraltar** (D) — autres : Le Bosphore · Le détroit d'Ormuz · Le détroit de Magellan  
   Fait à vérifier : Le détroit de Gibraltar sépare l'Espagne du Maroc.  
   Réponses acceptées en réponse libre : « gibraltar », « détroit de gibraltar »
9. Quel est le plus grand pays du monde par sa superficie ? (difficulté facile)  
   Bonne réponse : **La Russie** (C) — autres : Le Canada · La Chine · Les États-Unis  
   Explication affichée : Environ 17 millions de km², près de deux fois le Canada.  
   Fait à vérifier : La Russie fait environ 17 millions de km², le Canada environ 10 millions.  
   Réponses acceptées en réponse libre : « russie », « la russie »
10. Dans quel pays se trouve la ville de Tombouctou ? (difficulté difficile)  
   Bonne réponse : **Le Mali** (A) — autres : Le Niger · La Mauritanie · Le Sénégal  
   Explication affichée : Ancienne cité caravanière au bord du Sahara, inscrite au patrimoine mondial de l'Unesco.  
   Fait à vérifier : Tombouctou est au Mali et inscrite au patrimoine mondial de l'Unesco.  
   Réponses acceptées en réponse libre : « mali », « le mali »

## 6. Sciences et nature

`sciences-nature` · thème « Sciences et nature » · Moyen (moyenne 1,9) · Tout public · affiche violet · ajouté le 2026-09-29 · hors Top 10

> Corps humain, planètes, chimie et grandes découvertes : de quoi briller avec quelques souvenirs de cours.

1. Quel gaz les plantes absorbent-elles pour réaliser la photosynthèse ? (difficulté facile)  
   Bonne réponse : **Le dioxyde de carbone** (B) — autres : L'oxygène · L'azote · L'hélium  
   Explication affichée : Avec la lumière et l'eau, elles en font des sucres et rejettent de l'oxygène.  
   Fait à vérifier : La photosynthèse absorbe du dioxyde de carbone et rejette de l'oxygène.  
   Réponses acceptées en réponse libre : « dioxyde de carbone », « co2 », « gaz carbonique »
2. Quel gaz forme la couche qui protège la Terre d'une grande partie des rayons ultraviolets ? (difficulté moyenne)  
   Bonne réponse : **L'ozone** (D) — autres : L'azote · L'argon · Le méthane  
   Fait à vérifier : La couche d'ozone filtre une grande partie des UV.  
   Réponses acceptées en réponse libre : « ozone », « l'ozone »
3. Combien d'os compte le squelette d'un adulte ? (difficulté moyenne)  
   Bonne réponse : **206** (B) — autres : 106 · 306 · 406  
   Explication affichée : Un nouveau-né en a davantage : certains os se soudent pendant la croissance.  
   Fait à vérifier : Un squelette adulte compte 206 os ; un nouveau-né en a davantage.  
   Réponses acceptées en réponse libre : « 206 »
4. Quelle est la plus grande planète du système solaire ? (difficulté facile)  
   Bonne réponse : **Jupiter** (A) — autres : Saturne · Neptune · Uranus  
   Fait à vérifier : Jupiter est la plus grande planète du système solaire.  
   Réponses acceptées en réponse libre : « jupiter »
5. Combien de chromosomes contient une cellule humaine ordinaire (hors cellules reproductrices) ? (difficulté difficile)  
   Bonne réponse : **46** (B) — autres : 23 · 48 · 64  
   Explication affichée : 46 chromosomes, soit 23 paires. Les ovules et spermatozoïdes n'en ont que 23.  
   Fait à vérifier : Une cellule humaine ordinaire compte 46 chromosomes (23 paires) ; les gamètes en ont 23.  
   ⚠️ **Pas certain à 100 %** : cas général : certaines personnes ont un nombre différent de chromosomes (trisomies). Formulation « cellule humaine ordinaire » à garder.  
   Réponses acceptées en réponse libre : « 46 », « quarante-six »
6. Quel organe du corps humain produit l'insuline ? (difficulté moyenne)  
   Bonne réponse : **Le pancréas** (A) — autres : Le foie · Les reins · La rate  
   Explication affichée : L'insuline fait baisser le taux de sucre dans le sang.  
   Fait à vérifier : L'insuline est produite par le pancréas et fait baisser la glycémie.  
   Réponses acceptées en réponse libre : « pancréas », « le pancréas »
7. À quelle vitesse la lumière se déplace-t-elle dans le vide, environ ? (difficulté moyenne)  
   Bonne réponse : **300 000 km/s** (C) — autres : 1 000 km/s · 150 000 km/s · 1 million de km/s  
   Explication affichée : Environ 300 000 km par seconde : la lumière du Soleil met un peu plus de 8 minutes à nous parvenir.  
   Fait à vérifier : Vitesse de la lumière dans le vide : environ 300 000 km/s ; la lumière du Soleil met environ 8 min 20 s à nous parvenir.  
   Réponses acceptées en réponse libre : « 300 000 km/s », « 300 000 », « 300000 »
8. Quel scientifique a découvert la pénicilline, le premier antibiotique ? (difficulté moyenne)  
   Bonne réponse : **Alexander Fleming** (D) — autres : Louis Pasteur · Marie Curie · Robert Koch  
   Explication affichée : En 1928, en remarquant qu'une moisissure empêchait des bactéries de se développer.  
   Fait à vérifier : Alexander Fleming découvre la pénicilline en 1928.  
   Réponses acceptées en réponse libre : « alexander fleming », « fleming »
9. Quel est l'élément chimique le plus abondant dans l'Univers ? (difficulté difficile)  
   Bonne réponse : **L'hydrogène** (C) — autres : L'hélium · L'oxygène · Le carbone  
   Explication affichée : L'hydrogène représente environ les trois quarts de la masse de la matière ordinaire.  
   Fait à vérifier : L'hydrogène représente environ 74 % de la masse de la matière ordinaire de l'Univers.  
   Réponses acceptées en réponse libre : « hydrogène », « l'hydrogène »
10. Comment appelle-t-on un animal qui se nourrit à la fois de plantes et de viande ? (difficulté facile)  
   Bonne réponse : **Un omnivore** (A) — autres : Un herbivore · Un carnivore · Un insectivore  
   Explication affichée : L'être humain, l'ours ou le cochon sont omnivores.  
   Fait à vérifier : Définition d'omnivore ; l'humain, l'ours et le cochon sont omnivores.  
   Réponses acceptées en réponse libre : « omnivore », « un omnivore »

## 7. Histoire de France

`histoire-de-france` · thème « Histoire » · Difficile (moyenne 2,4) · Experts · affiche or · ajouté le 2026-08-29 · hors Top 10

> Rois, batailles, traités et grandes dates : un quiz exigeant pour les passionnés d'histoire.

1. En quelle année a eu lieu la prise de la Bastille ? (difficulté facile)  
   Bonne réponse : **1789** (A) — autres : 1776 · 1792 · 1799  
   Explication affichée : Le 14 juillet 1789, date devenue la fête nationale.  
   Fait à vérifier : Prise de la Bastille : 14 juillet 1789.  
   Réponses acceptées en réponse libre : « 1789 »
2. Quel roi de France était surnommé le « Roi-Soleil » ? (difficulté facile)  
   Bonne réponse : **Louis XIV** (C) — autres : Louis XIII · Henri IV · François Ier  
   Explication affichée : Louis XIV a régné 72 ans, de 1643 à 1715, et a fait de Versailles le siège du pouvoir.  
   Fait à vérifier : Louis XIV, le « Roi-Soleil », règne de 1643 à 1715 (72 ans).  
   Réponses acceptées en réponse libre : « louis xiv », « louis 14 », « louis quatorze »
3. En quelle année Jeanne d'Arc a-t-elle été brûlée à Rouen ? (difficulté difficile)  
   Bonne réponse : **1431** (B) — autres : 1415 · 1453 · 1429  
   Explication affichée : Le 30 mai 1431, deux ans après avoir fait lever le siège d'Orléans (1429).  
   Fait à vérifier : Jeanne d'Arc est brûlée à Rouen le 30 mai 1431 ; levée du siège d'Orléans en 1429.  
   Réponses acceptées en réponse libre : « 1431 »
4. Quel traité, signé en 1919, met fin à la Première Guerre mondiale entre les Alliés et l'Allemagne ? (difficulté moyenne)  
   Bonne réponse : **Le traité de Versailles** (D) — autres : Le traité de Paris · Le traité de Francfort · Le traité de Westphalie  
   Explication affichée : Signé le 28 juin 1919 dans la galerie des Glaces du château de Versailles.  
   Fait à vérifier : Traité de Versailles signé le 28 juin 1919 dans la galerie des Glaces.  
   Réponses acceptées en réponse libre : « traité de versailles », « versailles »
5. Quel roi de France remporte la bataille de Marignan en 1515 ? (difficulté difficile)  
   Bonne réponse : **François Ier** (A) — autres : Louis XII · Henri II · Charles VIII  
   Explication affichée : Victoire en Italie, au début de son règne, contre les Suisses alliés du duc de Milan.  
   Fait à vérifier : Bataille de Marignan (1515) gagnée par François Ier contre les Suisses défendant le duché de Milan.  
   ⚠️ **Pas certain à 100 %** : les Suisses combattaient pour le duc de Milan Maximilien Sforza : formulation de l'explication à vérifier.  
   Réponses acceptées en réponse libre : « françois ier », « françois 1er », « françois premier », « françois 1 »
6. Quel édit, signé par Henri IV en 1598, accorde des droits aux protestants ? (difficulté difficile)  
   Bonne réponse : **L'édit de Nantes** (C) — autres : L'édit de Fontainebleau · L'édit de Saint-Germain · L'édit de Villers-Cotterêts  
   Explication affichée : Il met fin aux guerres de Religion. Louis XIV le révoque en 1685 par l'édit de Fontainebleau.  
   Fait à vérifier : Édit de Nantes (1598, Henri IV), révoqué par l'édit de Fontainebleau (1685, Louis XIV).  
   Réponses acceptées en réponse libre : « édit de nantes », « nantes »
7. Quelle ordonnance de 1539 impose l'usage du français dans les actes officiels ? (difficulté difficile)  
   Bonne réponse : **L'ordonnance de Villers-Cotterêts** (B) — autres : L'ordonnance de Blois · L'ordonnance de Moulins · L'ordonnance d'Amboise  
   Explication affichée : Signée par François Ier, c'est l'un des plus anciens textes encore en vigueur en France.  
   Fait à vérifier : Ordonnance de Villers-Cotterêts (1539, François Ier), dont certains articles sont encore en vigueur.  
   ⚠️ **Pas certain à 100 %** : l'explication dit « l'un des plus anciens textes encore en vigueur » : vrai pour quelques articles (110 et 111) ; formulation à valider.  
   Réponses acceptées en réponse libre : « villers-cotterêts », « ordonnance de villers-cotterêts »
8. En quelle année les Françaises ont-elles voté pour la première fois ? (difficulté difficile)  
   Bonne réponse : **1945** (D) — autres : 1919 · 1936 · 1958  
   Explication affichée : Le droit de vote est accordé en avril 1944 ; elles votent pour la première fois aux municipales d'avril 1945.  
   Fait à vérifier : Droit de vote des femmes accordé par l'ordonnance du 21 avril 1944 ; premier vote aux municipales du 29 avril 1945.  
   Réponses acceptées en réponse libre : « 1945 »
9. Quelle victoire de Philippe Auguste, en 1214, renforce le pouvoir royal ? (difficulté difficile)  
   Bonne réponse : **Bouvines** (C) — autres : Crécy · Azincourt · Poitiers  
   Explication affichée : Il y bat une coalition menée par l'empereur germanique Otton IV.  
   Fait à vérifier : Bouvines (27 juillet 1214) : Philippe Auguste bat la coalition menée par l'empereur Otton IV.  
   Réponses acceptées en réponse libre : « bouvines », « bataille de bouvines »
10. En quelle année Napoléon Bonaparte est-il sacré empereur ? (difficulté moyenne)  
   Bonne réponse : **1804** (A) — autres : 1799 · 1810 · 1815  
   Explication affichée : Le 2 décembre 1804, à Notre-Dame de Paris. En 1799, il devient Premier consul.  
   Fait à vérifier : Sacre de Napoléon le 2 décembre 1804 à Notre-Dame ; Premier consul en 1799.  
   Réponses acceptées en réponse libre : « 1804 »

## 8. Sport : grands moments

`sport-grands-moments` · thème « Sport » · Moyen (moyenne 1,8) · Tout public · affiche orange · ajouté le 2026-09-15 · Top 10 n° 8

> Jeux olympiques, Coupe du monde, Tour de France et légendes du sport : les exploits qui ont marqué l'histoire.

1. Tous les combien d'années ont lieu les Jeux olympiques d'été ? (difficulté facile)  
   Bonne réponse : **4 ans** (C) — autres : 2 ans · 3 ans · 5 ans  
   Explication affichée : Une période de quatre ans s'appelle une olympiade.  
   Fait à vérifier : Les JO d'été ont lieu tous les 4 ans (olympiade).  
   Réponses acceptées en réponse libre : « 4 ans », « 4 », « quatre ans », « quatre »
2. En quelle année la France a-t-elle remporté sa première Coupe du monde de football ? (difficulté facile)  
   Bonne réponse : **1998** (A) — autres : 1984 · 2006 · 2018  
   Explication affichée : Victoire 3-0 contre le Brésil au Stade de France, le 12 juillet 1998.  
   Fait à vérifier : France - Brésil 3-0 au Stade de France le 12 juillet 1998.  
   Réponses acceptées en réponse libre : « 1998 »
3. Dans quel sport parle-t-on d'« albatros » pour un coup réussi ? (difficulté moyenne)  
   Bonne réponse : **Le golf** (D) — autres : Le tennis · Le cricket · Le bowling  
   Explication affichée : Un albatros, c'est finir un trou en trois coups de moins que le par.  
   Fait à vérifier : Au golf, un albatros = trois coups sous le par sur un trou.  
   Réponses acceptées en réponse libre : « golf », « le golf »
4. Quel tournoi du Grand Chelem de tennis se joue sur terre battue ? (difficulté facile)  
   Bonne réponse : **Roland-Garros** (B) — autres : Wimbledon · L'US Open · L'Open d'Australie  
   Explication affichée : Il se dispute chaque printemps à Paris. Wimbledon se joue sur gazon.  
   Fait à vérifier : Roland-Garros se joue sur terre battue, Wimbledon sur gazon.  
   Réponses acceptées en réponse libre : « roland-garros », « roland garros »
5. Quelle couleur de maillot porte le leader du classement général du Tour de France ? (difficulté facile)  
   Bonne réponse : **Le jaune** (A) — autres : Le vert · Le blanc à pois rouges · Le blanc  
   Explication affichée : Le vert récompense le meilleur sprinteur, le maillot à pois le meilleur grimpeur.  
   Fait à vérifier : Maillot jaune = leader du classement général ; vert = classement par points ; à pois = meilleur grimpeur.  
   Réponses acceptées en réponse libre : « jaune », « maillot jaune », « le jaune »
6. Quel athlète jamaïcain remporte le 100 mètres aux Jeux olympiques de Pékin, en 2008 ? (difficulté moyenne)  
   Bonne réponse : **Usain Bolt** (C) — autres : Asafa Powell · Yohan Blake · Tyson Gay  
   Explication affichée : Il remporte aussi le 100 m aux Jeux de Londres (2012) et de Rio (2016).  
   Fait à vérifier : Usain Bolt gagne le 100 m à Pékin (2008), Londres (2012) et Rio (2016).  
   Réponses acceptées en réponse libre : « usain bolt », « bolt »
7. Combien de points vaut un essai au rugby à XV ? (difficulté moyenne)  
   Bonne réponse : **5** (C) — autres : 3 · 4 · 7  
   Explication affichée : Cinq points, plus deux si la transformation est réussie.  
   Fait à vérifier : Un essai vaut 5 points au rugby à XV, la transformation 2 points.  
   Réponses acceptées en réponse libre : « 5 », « cinq »
8. Quel nageur américain remporte huit médailles d'or aux Jeux olympiques de Pékin, en 2008 ? (difficulté moyenne)  
   Bonne réponse : **Michael Phelps** (B) — autres : Ryan Lochte · Mark Spitz · Matt Biondi  
   Explication affichée : Il bat le record de sept titres en une édition, établi par Mark Spitz en 1972.  
   Fait à vérifier : Michael Phelps gagne 8 médailles d'or à Pékin (2008), battant les 7 de Mark Spitz (1972).  
   Réponses acceptées en réponse libre : « michael phelps », « phelps »
9. En quelle année ont eu lieu les premiers Jeux olympiques modernes, à Athènes ? (difficulté difficile)  
   Bonne réponse : **1896** (A) — autres : 1900 · 1912 · 1924  
   Explication affichée : Ils sont relancés à l'initiative du Français Pierre de Coubertin.  
   Fait à vérifier : Premiers JO modernes : Athènes, 1896, à l'initiative de Pierre de Coubertin.  
   Réponses acceptées en réponse libre : « 1896 »
10. Quel pilote français a été quatre fois champion du monde de Formule 1 ? (difficulté difficile)  
   Bonne réponse : **Alain Prost** (D) — autres : Jean Alesi · René Arnoux · Didier Pironi  
   Explication affichée : Alain Prost a été sacré en 1985, 1986, 1989 et 1993.  
   Fait à vérifier : Alain Prost est champion du monde de F1 en 1985, 1986, 1989 et 1993.  
   Réponses acceptées en réponse libre : « alain prost », « prost »

## 9. Musique : culture et histoire

`musique-culture` · thème « Musique » · Moyen (moyenne 1,9) · Tout public · affiche rose · ajouté le 2026-09-22 · Top 10 n° 7

> Instruments, compositeurs et légendes de la chanson : un quiz musical où l'on n'écoute rien, on réfléchit.

1. Combien de cordes compte une guitare classique ? (difficulté facile)  
   Bonne réponse : **6** (B) — autres : 4 · 7 · 12  
   Fait à vérifier : Une guitare classique a 6 cordes.  
   Réponses acceptées en réponse libre : « 6 », « six »
2. Quel groupe britannique réunissait John, Paul, George et Ringo ? (difficulté facile)  
   Bonne réponse : **Les Beatles** (A) — autres : Les Rolling Stones · Queen · The Who  
   Explication affichée : John Lennon, Paul McCartney, George Harrison et Ringo Starr, originaires de Liverpool.  
   Fait à vérifier : Les Beatles : John Lennon, Paul McCartney, George Harrison, Ringo Starr, de Liverpool.  
   Réponses acceptées en réponse libre : « beatles », « les beatles », « the beatles »
3. Quel compositeur, devenu sourd, a écrit la Neuvième Symphonie et son « Ode à la joie » ? (difficulté moyenne)  
   Bonne réponse : **Beethoven** (C) — autres : Mozart · Bach · Chopin  
   Explication affichée : L'« Ode à la joie » est devenue l'hymne de l'Union européenne.  
   Fait à vérifier : Beethoven, devenu sourd, compose la 9e symphonie (« Ode à la joie »), devenue l'hymne européen.  
   Réponses acceptées en réponse libre : « beethoven », « ludwig van beethoven »
4. Combien de touches compte un piano classique moderne ? (difficulté moyenne)  
   Bonne réponse : **88** (C) — autres : 66 · 76 · 96  
   Explication affichée : 52 touches blanches et 36 noires.  
   Fait à vérifier : Un piano moderne standard a 88 touches : 52 blanches et 36 noires.  
   Réponses acceptées en réponse libre : « 88 », « quatre-vingt-huit »
5. Quelle chanteuse française était surnommée « la Môme » ? (difficulté moyenne)  
   Bonne réponse : **Édith Piaf** (D) — autres : Barbara · Dalida · Juliette Gréco  
   Explication affichée : Ses débuts lui valent le surnom de « la Môme Piaf » ; « piaf » veut dire moineau en argot.  
   Fait à vérifier : Édith Piaf débute sous le nom de « la Môme Piaf » ; « piaf » = moineau en argot.  
   Réponses acceptées en réponse libre : « édith piaf », « piaf »
6. Combien de lignes compte une portée de musique ? (difficulté moyenne)  
   Bonne réponse : **5** (B) — autres : 4 · 6 · 7  
   Fait à vérifier : Une portée compte 5 lignes.  
   Réponses acceptées en réponse libre : « 5 », « cinq »
7. De quel pays le compositeur Frédéric Chopin était-il originaire ? (difficulté moyenne)  
   Bonne réponse : **La Pologne** (D) — autres : L'Autriche · La Hongrie · La Russie  
   Explication affichée : Né près de Varsovie en 1810, il a passé la seconde moitié de sa vie à Paris.  
   Fait à vérifier : Chopin naît en 1810 près de Varsovie (Pologne) et vit à Paris de 1831 à sa mort en 1849.  
   ⚠️ **Pas certain à 100 %** : Chopin a une mère polonaise et un père français : « originaire de Pologne » est exact (né et élevé en Pologne).  
   Réponses acceptées en réponse libre : « pologne », « la pologne »
8. Quel chanteur américain était surnommé le « King » du rock'n'roll ? (difficulté facile)  
   Bonne réponse : **Elvis Presley** (A) — autres : Chuck Berry · Johnny Cash · Buddy Holly  
   Fait à vérifier : Elvis Presley est surnommé « the King ».  
   Réponses acceptées en réponse libre : « elvis presley », « elvis », « presley »
9. De quel instrument jouait principalement le jazzman Miles Davis ? (difficulté difficile)  
   Bonne réponse : **La trompette** (B) — autres : Le saxophone · Le piano · La contrebasse  
   Fait à vérifier : Miles Davis jouait de la trompette.  
   Réponses acceptées en réponse libre : « trompette », « la trompette »
10. Qui a composé « La Marseillaise » ? (difficulté difficile)  
   Bonne réponse : **Rouget de Lisle** (C) — autres : Hector Berlioz · Charles Gounod · Jean-Baptiste Lully  
   Explication affichée : Écrite à Strasbourg en 1792 sous le titre « Chant de guerre pour l'armée du Rhin ».  
   Fait à vérifier : Rouget de Lisle compose « La Marseillaise » à Strasbourg en 1792 (« Chant de guerre pour l'armée du Rhin »).  
   Réponses acceptées en réponse libre : « rouget de lisle », « claude joseph rouget de lisle »

## 10. Dessins animés et Disney

`dessins-animes-disney` · thème « Cinéma et séries » · Facile (moyenne 1,3) · Enfants · affiche orange · ajouté le 2026-09-26 · Top 10 n° 4

> Simba, Olaf, Woody et les Minions : un quiz pour les petits (et les grands qui connaissent les chansons par cœur).

1. Dans « Le Roi lion », comment s'appelle le jeune lion ? (difficulté facile)  
   Bonne réponse : **Simba** (A) — autres : Mufasa · Scar · Nala  
   Explication affichée : Mufasa est son papa, Scar son méchant oncle et Nala son amie.  
   Fait à vérifier : Dans « Le Roi lion » : Simba (héros), Mufasa (père), Scar (oncle), Nala (amie).  
   Réponses acceptées en réponse libre : « simba »
2. Quelle petite fée accompagne Peter Pan ? (difficulté facile)  
   Bonne réponse : **La fée Clochette** (C) — autres : La fée Marraine · La fée Carabosse · La fée Mélusine  
   Fait à vérifier : La fée qui accompagne Peter Pan s'appelle la fée Clochette.  
   Réponses acceptées en réponse libre : « clochette », « fée clochette », « la fée clochette »
3. Dans « La Reine des neiges », comment s'appelle le bonhomme de neige ? (difficulté facile)  
   Bonne réponse : **Olaf** (B) — autres : Sven · Kristoff · Hans  
   Explication affichée : Sven est le renne de Kristoff.  
   Fait à vérifier : Olaf est le bonhomme de neige ; Sven est le renne de Kristoff.  
   Réponses acceptées en réponse libre : « olaf »
4. Quel animal est Dumbo ? (difficulté facile)  
   Bonne réponse : **Un éléphant** (D) — autres : Une souris · Un ourson · Un chiot  
   Explication affichée : Un petit éléphant qui vole grâce à ses très grandes oreilles.  
   Fait à vérifier : Dumbo est un éléphanteau qui vole avec ses oreilles.  
   Réponses acceptées en réponse libre : « éléphant », « un éléphant », « éléphanteau », « un éléphanteau »
5. Dans « Toy Story », comment s'appelle le cow-boy ? (difficulté facile)  
   Bonne réponse : **Woody** (A) — autres : Buzz · Rex · Zigzag  
   Explication affichée : Buzz l'Éclair est son ami astronaute.  
   Fait à vérifier : Woody est le cow-boy, Buzz l'Éclair l'astronaute.  
   Réponses acceptées en réponse libre : « woody », « shérif woody »
6. Dans « Le Monde de Nemo », quel poisson est Nemo ? (difficulté moyenne)  
   Bonne réponse : **Un poisson-clown** (B) — autres : Un poisson-chirurgien · Un poisson rouge · Un poisson-lune  
   Explication affichée : Orange avec des bandes blanches. Son amie Dory est un poisson-chirurgien bleu.  
   Fait à vérifier : Nemo est un poisson-clown ; Dory est un poisson-chirurgien bleu.  
   Réponses acceptées en réponse libre : « poisson-clown », « un poisson-clown »
7. Comment s'appelle la souris la plus célèbre de Disney ? (difficulté facile)  
   Bonne réponse : **Mickey** (C) — autres : Jerry · Speedy · Stuart  
   Fait à vérifier : Mickey est la souris de Disney (Jerry, Speedy et Stuart viennent d'autres studios).  
   Réponses acceptées en réponse libre : « mickey », « mickey mouse »
8. Dans « Cendrillon », en quoi la fée transforme-t-elle la citrouille ? (difficulté moyenne)  
   Bonne réponse : **En carrosse** (D) — autres : En château · En robe de bal · En cheval  
   Fait à vérifier : La fée transforme la citrouille en carrosse.  
   Réponses acceptées en réponse libre : « carrosse », « un carrosse », « en carrosse »
9. Dans « Aladdin », comment s'appelle le petit singe d'Aladdin ? (difficulté moyenne)  
   Bonne réponse : **Abu** (B) — autres : Iago · Rajah · Zazu  
   Explication affichée : Iago est le perroquet de Jafar, Rajah le tigre de Jasmine.  
   Fait à vérifier : Abu est le singe d'Aladdin ; Iago le perroquet de Jafar ; Rajah le tigre de Jasmine ; Zazu vient du « Roi lion ».  
   Réponses acceptées en réponse libre : « abu »
10. Comment s'appellent les petits personnages jaunes de « Moi, moche et méchant » ? (difficulté facile)  
   Bonne réponse : **Les Minions** (C) — autres : Les Schtroumpfs · Les Trolls · Les Gremlins  
   Fait à vérifier : Les Minions viennent de « Moi, moche et méchant » (studio Illumination, pas Disney).  
   Réponses acceptées en réponse libre : « minions », « les minions »

## 11. Spécial enfants : les animaux

`enfants-animaux` · thème « Sciences et nature » · Facile (moyenne 1,3) · Enfants · affiche vert · ajouté le 2026-10-01 · hors Top 10

> Bébés animaux, cris de la ferme et champions de la nature : un quiz tout doux pour les plus jeunes.

1. Quel animal fait « meuh » ? (difficulté facile)  
   Bonne réponse : **La vache** (A) — autres : Le mouton · Le cochon · La chèvre  
   Réponses acceptées en réponse libre : « vache », « la vache »
2. Comment appelle-t-on le bébé de la poule ? (difficulté facile)  
   Bonne réponse : **Le poussin** (B) — autres : Le caneton · Le chaton · L'agneau  
   Réponses acceptées en réponse libre : « poussin », « le poussin »
3. Quel est l'animal le plus rapide à la course ? (difficulté facile)  
   Bonne réponse : **Le guépard** (C) — autres : Le lion · Le cheval · Le lièvre  
   Explication affichée : Le guépard peut dépasser 100 km/h, mais seulement sur une courte distance.  
   Fait à vérifier : Le guépard est l'animal terrestre le plus rapide (plus de 100 km/h sur une courte distance).  
   Réponses acceptées en réponse libre : « guépard », « le guépard »
4. Quel petit animal à coquille laisse une trace brillante derrière lui ? (difficulté facile)  
   Bonne réponse : **L'escargot** (D) — autres : La coccinelle · La fourmi · La sauterelle  
   Explication affichée : Il avance en glissant sur du mucus, une sorte de bave qui le protège.  
   Réponses acceptées en réponse libre : « escargot », « l'escargot »
5. Combien de pattes a un insecte ? (difficulté moyenne)  
   Bonne réponse : **6** (B) — autres : 4 · 8 · 10  
   Explication affichée : Les araignées en ont 8 : ce ne sont pas des insectes.  
   Fait à vérifier : Un insecte a 6 pattes, une araignée 8.  
   Réponses acceptées en réponse libre : « 6 », « six »
6. Où vit le manchot empereur ? (difficulté moyenne)  
   Bonne réponse : **En Antarctique** (A) — autres : Au pôle Nord · En Afrique · En Amazonie  
   Explication affichée : Il vit tout près du pôle Sud. Il n'y a pas de manchots au pôle Nord.  
   Fait à vérifier : Le manchot empereur vit en Antarctique ; aucun manchot au pôle Nord.  
   Réponses acceptées en réponse libre : « antarctique », « en antarctique », « pôle sud », « au pôle sud »
7. Comment appelle-t-on le bébé du cheval ? (difficulté moyenne)  
   Bonne réponse : **Le poulain** (C) — autres : Le veau · Le chiot · Le faon  
   Explication affichée : Le veau est le bébé de la vache, le faon celui de la biche.  
   Fait à vérifier : Poulain (cheval), veau (vache), faon (biche).  
   Réponses acceptées en réponse libre : « poulain », « le poulain »
8. Comment s'appelle la maison des abeilles ? (difficulté facile)  
   Bonne réponse : **La ruche** (D) — autres : Le nid · Le terrier · La tanière  
   Réponses acceptées en réponse libre : « ruche », « la ruche »
9. Quel reptile peut changer de couleur ? (difficulté facile)  
   Bonne réponse : **Le caméléon** (B) — autres : Le crocodile · La tortue · Le serpent  
   ⚠️ **Pas certain à 100 %** : d'autres reptiles (certains lézards, comme les anoles) changent aussi un peu de couleur ; parmi les propositions, seul le caméléon convient.  
   Réponses acceptées en réponse libre : « caméléon », « le caméléon »
10. Quel mammifère sait voler comme un oiseau ? (difficulté facile)  
   Bonne réponse : **La chauve-souris** (C) — autres : Le hérisson · La taupe · Le castor  
   Explication affichée : C'est le seul mammifère capable de vraiment voler.  
   Fait à vérifier : La chauve-souris est le seul mammifère capable de vol actif.  
   Réponses acceptées en réponse libre : « chauve-souris », « la chauve-souris »

## 12. Cuisine et gastronomie

`cuisine-gastronomie` · thème « Loisirs » · Moyen (moyenne 1,9) · Tout public · affiche rouge · ajouté le 2026-09-02 · Top 10 n° 9

> Spécialités régionales, sauces, épices et gestes du chef : un quiz qui donne faim, à faire avant le dîner.

1. Quel est l'ingrédient principal du guacamole ? (difficulté facile)  
   Bonne réponse : **L'avocat** (A) — autres : La tomate · Le concombre · Le poivron  
   Explication affichée : Une recette d'origine mexicaine, avec du citron vert, de l'oignon et de la coriandre.  
   Fait à vérifier : Le guacamole est à base d'avocat (recette mexicaine).  
   Réponses acceptées en réponse libre : « avocat », « l'avocat », « avocats »
2. De quelle région française la choucroute est-elle la grande spécialité ? (difficulté facile)  
   Bonne réponse : **L'Alsace** (C) — autres : La Bretagne · La Provence · L'Auvergne  
   Fait à vérifier : La choucroute est une spécialité alsacienne.  
   Réponses acceptées en réponse libre : « alsace », « l'alsace »
3. Quel fromage est indispensable à une tartiflette ? (difficulté moyenne)  
   Bonne réponse : **Le reblochon** (B) — autres : Le comté · Le roquefort · Le camembert  
   Explication affichée : Un fromage de Haute-Savoie, fondu sur des pommes de terre, des lardons et des oignons.  
   Fait à vérifier : La tartiflette se fait avec du reblochon (fromage savoyard).  
   Réponses acceptées en réponse libre : « reblochon », « le reblochon »
4. Quelle épice, l'une des plus chères au monde, provient d'une fleur de crocus ? (difficulté moyenne)  
   Bonne réponse : **Le safran** (D) — autres : Le cumin · Le curcuma · Le paprika  
   Explication affichée : On récolte à la main les stigmates de la fleur : il en faut des milliers pour quelques grammes.  
   Fait à vérifier : Le safran vient des stigmates de Crocus sativus, récoltés à la main.  
   Réponses acceptées en réponse libre : « safran », « le safran »
5. Quelle sauce associe jaunes d'œufs, beurre, échalote, vinaigre et estragon ? (difficulté difficile)  
   Bonne réponse : **La béarnaise** (A) — autres : La hollandaise · La mayonnaise · La béchamel  
   Explication affichée : La hollandaise lui ressemble, mais se fait au jus de citron, sans échalote ni estragon.  
   Fait à vérifier : Béarnaise : jaunes d'œufs, beurre, échalote, vinaigre, estragon ; la hollandaise se fait au citron.  
   Réponses acceptées en réponse libre : « béarnaise », « sauce béarnaise », « la béarnaise »
6. De quel pays les sushis sont-ils la spécialité emblématique ? (difficulté facile)  
   Bonne réponse : **Le Japon** (C) — autres : La Chine · La Corée · La Thaïlande  
   ⚠️ **Pas certain à 100 %** : les origines lointaines du sushi sont en Asie du Sud-Est et en Chine (poisson fermenté dans le riz) ; la formulation « spécialité emblématique » évite le débat.  
   Réponses acceptées en réponse libre : « japon », « le japon »
7. En cuisine, que désigne une « julienne » ? (difficulté moyenne)  
   Bonne réponse : **Des légumes taillés en fins bâtonnets** (B) — autres : Une sauce au vin blanc · Un gâteau roulé · Une soupe froide  
   Fait à vérifier : Une julienne = légumes taillés en fins bâtonnets.  
   Réponses acceptées en réponse libre : « légumes en bâtonnets », « des légumes taillés en fins bâtonnets », « fins bâtonnets », « bâtonnets »
8. Quel gâteau breton porte un nom qui signifie « gâteau au beurre » ? (difficulté moyenne)  
   Bonne réponse : **Le kouign-amann** (D) — autres : Le clafoutis · Le canelé · Le baba  
   Explication affichée : En breton, « kouign » veut dire gâteau et « amann » beurre.  
   Fait à vérifier : Kouign-amann : « kouign » = gâteau, « amann » = beurre, en breton.  
   Réponses acceptées en réponse libre : « kouign-amann », « kouign amann »
9. Le canelé, petit gâteau parfumé au rhum et à la vanille, est une spécialité de quelle ville ? (difficulté moyenne)  
   Bonne réponse : **Bordeaux** (C) — autres : Lyon · Nantes · Lille  
   Fait à vérifier : Le canelé (rhum, vanille) est une spécialité de Bordeaux.  
   Réponses acceptées en réponse libre : « bordeaux »
10. Quel légume donne au bortsch sa couleur rouge ? (difficulté difficile)  
   Bonne réponse : **La betterave** (B) — autres : La tomate · Le poivron · Le radis  
   Explication affichée : Le bortsch est une soupe très répandue en Europe de l'Est.  
   Fait à vérifier : Le bortsch doit sa couleur rouge à la betterave.  
   Réponses acceptées en réponse libre : « betterave », « la betterave »

## 13. Jeux vidéo

`jeux-video` · thème « Loisirs » · Moyen (moyenne 2,0) · Tout public · affiche cyan · ajouté le 2026-10-03 · Top 10 n° 6

> Mario, Pikachu, Lara Croft et les Creepers : un quiz pour les joueurs de toutes les générations de consoles.

1. Quel plombier moustachu est la mascotte de Nintendo ? (difficulté facile)  
   Bonne réponse : **Mario** (A) — autres : Luigi · Yoshi · Toad  
   Explication affichée : Luigi est son frère, Yoshi son fidèle dinosaure.  
   Fait à vérifier : Mario est la mascotte de Nintendo ; Luigi est son frère.  
   Réponses acceptées en réponse libre : « mario », « super mario »
2. Dans « Pac-Man », que mange le héros en parcourant le labyrinthe ? (difficulté moyenne)  
   Bonne réponse : **Des pac-gommes** (B) — autres : Des pièces d'or · Des champignons · Des étoiles  
   Explication affichée : Les super pac-gommes lui permettent un moment de manger les fantômes.  
   Fait à vérifier : En français, Pac-Man mange des « pac-gommes » ; les super pac-gommes permettent de manger les fantômes.  
   ⚠️ **Pas certain à 100 %** : « pac-gommes » est le terme français courant, mais pas toujours celui des versions officielles. À vérifier selon les éditions.  
   Réponses acceptées en réponse libre : « pac-gommes », « des pac-gommes », « pac-gomme », « gommes », « pastilles »
3. Dans « Tetris », de combien de carrés chaque pièce est-elle formée ? (difficulté difficile)  
   Bonne réponse : **4** (B) — autres : 3 · 5 · 6  
   Explication affichée : Le nom du jeu vient de « tétra », quatre en grec, et de « tennis », le sport préféré de son créateur.  
   Fait à vérifier : Chaque pièce de Tetris (tétromino) est formée de 4 carrés.  
   ⚠️ **Pas certain à 100 %** : l'explication sur l'origine du nom (« tétra » + « tennis ») est souvent citée : la vérifier, ou la retirer en cas de doute.  
   Réponses acceptées en réponse libre : « 4 », « quatre »
4. Dans « The Legend of Zelda », comment s'appelle le héros que l'on dirige ? (difficulté moyenne)  
   Bonne réponse : **Link** (D) — autres : Zelda · Ganon · Epona  
   Explication affichée : Zelda est la princesse, Ganon le grand méchant et Epona la jument de Link.  
   Fait à vérifier : Le héros de « Zelda » s'appelle Link ; Zelda est la princesse, Ganon le méchant, Epona la jument.  
   Réponses acceptées en réponse libre : « link »
5. Dans « Minecraft », quelle créature verte explose quand elle s'approche du joueur ? (difficulté facile)  
   Bonne réponse : **Le Creeper** (C) — autres : Le zombie · L'Enderman · Le squelette  
   Fait à vérifier : Le Creeper est la créature verte qui explose dans Minecraft.  
   Réponses acceptées en réponse libre : « creeper », « le creeper »
6. Dans « Pokémon », de quel type est Pikachu ? (difficulté moyenne)  
   Bonne réponse : **Électrik** (A) — autres : Feu · Plante · Eau  
   Fait à vérifier : En français, Pikachu est de type Électrik.  
   Réponses acceptées en réponse libre : « électrik », « électrique »
7. Quelle princesse Mario doit-il souvent sauver des griffes de Bowser ? (difficulté moyenne)  
   Bonne réponse : **Peach** (C) — autres : Daisy · Zelda · Harmonie  
   Explication affichée : La princesse Peach règne sur le Royaume Champignon.  
   Fait à vérifier : Mario sauve la princesse Peach de Bowser ; Harmonie est le nom français de Rosalina.  
   Réponses acceptées en réponse libre : « peach », « princesse peach »
8. Dans quelle série de jeux incarne-t-on l'aventurière Lara Croft ? (difficulté moyenne)  
   Bonne réponse : **Tomb Raider** (D) — autres : Uncharted · Prince of Persia · Resident Evil  
   Fait à vérifier : Lara Croft est l'héroïne de « Tomb Raider ».  
   Réponses acceptées en réponse libre : « tomb raider »
9. En quelle année la première Game Boy est-elle sortie au Japon ? (difficulté difficile)  
   Bonne réponse : **1989** (B) — autres : 1985 · 1993 · 1996  
   Explication affichée : Elle était vendue avec « Tetris » en Amérique du Nord et en Europe.  
   Fait à vérifier : La Game Boy sort au Japon le 21 avril 1989.  
   ⚠️ **Pas certain à 100 %** : l'explication dit que la Game Boy était vendue avec Tetris en Amérique du Nord et en Europe : vrai pour l'Amérique du Nord, à vérifier pour l'Europe.  
   Réponses acceptées en réponse libre : « 1989 »
10. Quelle entreprise française est à l'origine de la série « Assassin's Creed » ? (difficulté moyenne)  
   Bonne réponse : **Ubisoft** (C) — autres : Activision · Electronic Arts · Square Enix  
   Explication affichée : Le premier épisode a été développé par son studio de Montréal et est sorti en 2007.  
   Fait à vérifier : Ubisoft est une entreprise française ; « Assassin's Creed » (2007) est développé par Ubisoft Montréal.  
   Réponses acceptées en réponse libre : « ubisoft »

## 14. Pour les experts : culture pointue

`culture-pointue` · thème « Culture générale » · Difficile (moyenne 2,5) · Experts · affiche violet · ajouté le 2026-08-25 · hors Top 10

> Littérature, art, sciences et géographie : dix questions corsées pour départager les grosses têtes de la soirée.

1. Quel est le plus petit État du monde par sa superficie ? (difficulté moyenne)  
   Bonne réponse : **Le Vatican** (A) — autres : Monaco · Saint-Marin · Le Liechtenstein  
   Explication affichée : Moins d'un demi-kilomètre carré, enclavé dans Rome.  
   Fait à vérifier : Le Vatican (environ 0,44 km²) est le plus petit État du monde.  
   Réponses acceptées en réponse libre : « vatican », « le vatican », « cité du vatican »
2. Qui a écrit « À la recherche du temps perdu » ? (difficulté moyenne)  
   Bonne réponse : **Marcel Proust** (C) — autres : Gustave Flaubert · Émile Zola · Honoré de Balzac  
   Explication affichée : Un cycle de sept romans, célèbre notamment pour l'épisode de la madeleine.  
   Fait à vérifier : Marcel Proust a écrit « À la recherche du temps perdu » (7 tomes).  
   Réponses acceptées en réponse libre : « marcel proust », « proust »
3. Quel peintre a réalisé « La Persistance de la mémoire », le tableau aux montres molles ? (difficulté difficile)  
   Bonne réponse : **Salvador Dalí** (B) — autres : René Magritte · Joan Miró · Max Ernst  
   Explication affichée : Une œuvre surréaliste de 1931, conservée au MoMA de New York.  
   Fait à vérifier : « La Persistance de la mémoire » est de Salvador Dalí (1931), conservée au MoMA.  
   Réponses acceptées en réponse libre : « salvador dalí », « dalí »
4. Quelle est la capitale de la Mongolie ? (difficulté difficile)  
   Bonne réponse : **Oulan-Bator** (D) — autres : Almaty · Bichkek · Tachkent  
   Explication affichée : Almaty est au Kazakhstan, Bichkek au Kirghizistan, Tachkent en Ouzbékistan.  
   Fait à vérifier : Oulan-Bator est la capitale de la Mongolie ; Almaty (Kazakhstan, ancienne capitale), Bichkek (Kirghizistan), Tachkent (Ouzbékistan).  
   Réponses acceptées en réponse libre : « oulan-bator », « oulan bator », « ulaanbaatar »
5. Combien de faces possède un icosaèdre ? (difficulté difficile)  
   Bonne réponse : **20** (C) — autres : 12 · 16 · 24  
   Explication affichée : Vingt faces triangulaires : c'est la forme du dé à vingt faces des jeux de rôle.  
   Fait à vérifier : Un icosaèdre a 20 faces triangulaires (dé d20).  
   Réponses acceptées en réponse libre : « 20 », « vingt »
6. Quel philosophe grec fut le précepteur d'Alexandre le Grand ? (difficulté difficile)  
   Bonne réponse : **Aristote** (A) — autres : Platon · Socrate · Diogène  
   Explication affichée : Aristote avait lui-même été l'élève de Platon, lui-même disciple de Socrate.  
   Fait à vérifier : Aristote fut le précepteur d'Alexandre le Grand ; il fut l'élève de Platon, lui-même disciple de Socrate.  
   Réponses acceptées en réponse libre : « aristote »
7. Quel compositeur français a écrit le « Boléro » ? (difficulté moyenne)  
   Bonne réponse : **Maurice Ravel** (B) — autres : Claude Debussy · Erik Satie · Georges Bizet  
   Explication affichée : Créé en 1928, il répète le même thème en montant peu à peu en puissance.  
   Fait à vérifier : Le « Boléro » est de Maurice Ravel, créé en 1928.  
   Réponses acceptées en réponse libre : « maurice ravel », « ravel »
8. En quelle année le mur de Berlin est-il tombé ? (difficulté facile)  
   Bonne réponse : **1989** (C) — autres : 1985 · 1987 · 1991  
   Explication affichée : Dans la nuit du 9 au 10 novembre 1989.  
   Fait à vérifier : Chute du mur de Berlin : nuit du 9 au 10 novembre 1989.  
   Réponses acceptées en réponse libre : « 1989 »
9. Quel élément chimique a pour symbole la lettre W ? (difficulté difficile)  
   Bonne réponse : **Le tungstène** (D) — autres : Le vanadium · Le xénon · Le tellure  
   Explication affichée : W vient de « wolfram », son autre nom, encore utilisé en allemand.  
   Fait à vérifier : W est le symbole du tungstène, appelé aussi wolfram.  
   Réponses acceptées en réponse libre : « tungstène », « le tungstène », « wolfram »
10. Quel écrivain colombien a écrit « Cent ans de solitude » ? (difficulté difficile)  
   Bonne réponse : **Gabriel García Márquez** (B) — autres : Jorge Luis Borges · Pablo Neruda · Mario Vargas Llosa  
   Explication affichée : Prix Nobel de littérature en 1982 ; le roman se déroule dans le village imaginaire de Macondo.  
   Fait à vérifier : Gabriel García Márquez (colombien) écrit « Cent ans de solitude » ; prix Nobel en 1982 ; village de Macondo.  
   Réponses acceptées en réponse libre : « gabriel garcía márquez », « garcía márquez », « márquez »

## 15. Langue française : expressions et orthographe

`langue-francaise` · thème « Culture générale » · Difficile (moyenne 2,5) · Experts · affiche or · ajouté le 2026-10-02 · hors Top 10

> Expressions imagées, mots rares, pluriels et pièges d'orthographe : un quiz pour les amoureux de la langue.

1. Que signifie l'expression « poser un lapin » ? (difficulté facile)  
   Bonne réponse : **Ne pas venir à un rendez-vous** (B) — autres : Faire une blague · Partir très vite · Dire un mensonge  
   Fait à vérifier : Sens de « poser un lapin » : ne pas venir à un rendez-vous.  
   Réponses acceptées en réponse libre : « ne pas venir à un rendez-vous », « ne pas venir », « faire faux bond »
2. Que désigne le mot « thuriféraire » au sens figuré ? (difficulté difficile)  
   Bonne réponse : **Un flatteur, un admirateur zélé** (A) — autres : Un marchand de tissus · Un soldat romain · Un guérisseur  
   Explication affichée : Au sens propre, le thuriféraire porte l'encensoir ; au figuré, il « encense » quelqu'un.  
   Fait à vérifier : Thuriféraire : au propre, porteur de l'encensoir ; au figuré, flatteur.  
   ⚠️ **Pas certain à 100 %** : définition à confirmer dans un dictionnaire (Larousse ou Robert) ; la réponse « admirateur zélé » est un peu plus large que « flatteur ».  
   Réponses acceptées en réponse libre : « un flatteur, un admirateur zélé », « flatteur », « un flatteur », « admirateur », « adulateur »
3. Que signifie « tirer les vers du nez » à quelqu'un ? (difficulté moyenne)  
   Bonne réponse : **Le faire parler pour obtenir des secrets** (C) — autres : Le soigner · Le faire rire · Le punir  
   Fait à vérifier : Sens de « tirer les vers du nez » : faire parler quelqu'un pour obtenir des informations.  
   Réponses acceptées en réponse libre : « le faire parler pour obtenir des secrets », « le faire parler », « faire parler », « obtenir des secrets », « soutirer des informations »
4. Quel est le pluriel de « cheval » ? (difficulté moyenne)  
   Bonne réponse : **Des chevaux** (D) — autres : Des chevals · Des chevails · Des chevales  
   Explication affichée : La plupart des noms en -al font leur pluriel en -aux. Exceptions : bals, carnavals, festivals…  
   Fait à vérifier : Pluriel de cheval : chevaux ; exceptions en -als : bals, carnavals, festivals, chacals, récitals…  
   Réponses acceptées en réponse libre : « chevaux », « des chevaux »
5. Lequel de ces noms d'animaux est correctement orthographié ? (difficulté moyenne)  
   Bonne réponse : **Rhinocéros** (A) — autres : Hipopotame · Crocrodile · Giraphe  
   Explication affichée : On écrit hippopotame, crocodile et girafe.  
   Fait à vérifier : Orthographes correctes : rhinocéros, hippopotame, crocodile, girafe.  
   Réponses acceptées en réponse libre : « rhinocéros »
6. Lequel de ces mots est correctement orthographié ? (difficulté difficile)  
   Bonne réponse : **Connexion** (C) — autres : Aggrandir · Dilemne · Bizzare  
   Explication affichée : On écrit agrandir, dilemme et bizarre.  
   Fait à vérifier : Orthographes correctes : connexion, agrandir, dilemme, bizarre.  
   Réponses acceptées en réponse libre : « connexion »
7. Que signifie l'adjectif « sibyllin » ? (difficulté difficile)  
   Bonne réponse : **Obscur, difficile à comprendre** (D) — autres : Très rapide · Moqueur · Généreux  
   Explication affichée : Comme les oracles des sibylles, les prophétesses de l'Antiquité.  
   Fait à vérifier : Sens de « sibyllin » : obscur, énigmatique ; vient des sibylles.  
   Réponses acceptées en réponse libre : « obscur, difficile à comprendre », « obscur », « énigmatique », « mystérieux », « difficile à comprendre »
8. Que signifie l'expression « faire chou blanc » ? (difficulté difficile)  
   Bonne réponse : **Échouer, ne rien obtenir** (B) — autres : Réussir du premier coup · Rougir de honte · Cuisiner pour rien  
   Fait à vérifier : Sens de « faire chou blanc » : échouer, ne rien obtenir.  
   Réponses acceptées en réponse libre : « échouer, ne rien obtenir », « échouer », « ne rien obtenir », « rater », « échec »
9. Quel est le féminin du nom « vengeur » ? (difficulté difficile)  
   Bonne réponse : **Vengeresse** (C) — autres : Vengeuse · Vengeure · Vengeante  
   Explication affichée : Comme « enchanteur, enchanteresse » ou « pécheur, pécheresse ».  
   Fait à vérifier : Féminin de « vengeur » : vengeresse.  
   ⚠️ **Pas certain à 100 %** : certains dictionnaires admettent aussi « vengeuse » dans un usage rare ou familier. « Vengeresse » est la forme recommandée ; si « vengeuse » est jugé correct, remplacer cette proposition par une autre (par exemple « Vengeresse » contre « Vengeante », « Vengeure », « Vengeatrice »).  
   Réponses acceptées en réponse libre : « vengeresse », « une vengeresse »
10. Quelle figure de style consiste à exagérer volontairement, comme dans « mourir de rire » ? (difficulté difficile)  
   Bonne réponse : **L'hyperbole** (A) — autres : La litote · La métaphore · L'oxymore  
   Explication affichée : La litote fait l'inverse : elle dit moins pour suggérer plus (« ce n'est pas mauvais »).  
   Fait à vérifier : Hyperbole = exagération ; litote = dire moins pour suggérer plus.  
   Réponses acceptées en réponse libre : « hyperbole », « l'hyperbole »

