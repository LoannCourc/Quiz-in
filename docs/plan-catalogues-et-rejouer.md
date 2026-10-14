# Plan : nombre de questions, rejouer sans recréer de salon, catalogues Blind test (BT5) et Bluff (BL4)

Retours de test d'octobre 2026, points 1, 4, 5 et 6. Les points 2 (palette) et 3 (saisie du code) sont faits.
Chaque lot : spec d'abord, puis règles et tests d'émulateur, puis code.

## Décisions validées (Loann, octobre 2026)

- **Plan validé.** Point 4 (Changer de jeu) codé ; point 1 en cours ; points 5 et 6 après le message dédié.
- **Quiz** : interface S2 gardée (Top 10 et thèmes). Les affiches restent des quiz fixes de 10 questions (fiche, sans
  barre). La barre « Nombre de questions » n'apparaît que lorsqu'un ou plusieurs thèmes sont choisis (« Tout »
  compris) : tirage dans l'union des thèmes choisis, en évitant les questions déjà jouées.
- **Nombre de questions** : Quiz 10 / 20 / 30, Bluff 10 / 15 / 20, 10 par défaut. Une option dont l'ensemble est trop
  petit est grisée, avec la raison.
- **Scores** au changement de jeu : remis à zéro (cumul plus tard).
- **Catégories** : les 8 thèmes actuels seulement ; le Bluff n'affiche que celles qui ont du contenu.
- **Blind test** : genres Pop, Rock, Rap, Chanson, Disco/Funk, Électro (un genre principal par blind test, pas de
  « Variété ») ; niveau « Impossible » ajouté au modèle (4 niveaux), affiché dans les filtres seulement s'il contient
  au moins un blind test.
- **Questions manquantes** : rédigées par Loann et son conseiller ; Claude fournit le schéma exact et un exemple par
  jeu à la fin du point 1. On livre avec les ensembles actuels (options grisées).

## 0. État actuel (ce qui existe)

- **Une partie = un quiz.** `sessions/{code}/quizId` (obligatoire, règle `hasChildren`), questions lues par l'hôte dans
  `questions/{quizId}`, les 10 premières dans l'ordre du quiz (`selectGameQuestions`, `QUESTIONS_PER_GAME` = 10).
  L'hôte qui relance l'app relit les mêmes questions (ordre fixe) : rien n'est mémorisé dans la session.
- **Fiche d'un quiz** (`quizzes/{id}`, validée par `shared/quizValidation.ts`) : `title`, `theme` (8 thèmes), `gameType`
  (quiz, blindTest, bluff), `difficulty` (moyenne 1 à 3), `difficultyLabel`, `questionCount`, `estimatedMinutes`,
  `description`, `audience`, `poster`, `addedAt`, `featuredRank`, `icon` (facultatif), `level` (facultatif :
  easy / medium / hard, sinon déduit de la moyenne).
- **Déjà joué** : quiz lancés sur ce téléphone (`lib/playedQuizzes.ts`), par quiz, pas par question.
- **Rejouer** (`replayUpdate`) : retour au salon, même code, mêmes joueurs et équipes, **même quiz, mêmes questions**.
- La TV lit `quizzes/{quizId}/gameType` en direct (blind test) ; le joueur qui rejoint le lit une fois (`useJoinGameType`).

### Contenu réel (`content/quizzes/`, 36 fichiers de 10 questions)

| Jeu | Thème | Quiz | Questions |
|---|---|---|---|
| Quiz | Culture générale | 3 | 30 |
| Quiz | Cinéma et séries | 3 | 30 |
| Quiz | Loisirs | 2 | 20 |
| Quiz | Sciences et nature | 2 | 20 |
| Quiz | Géographie | 2 | 20 |
| Quiz | Histoire | 1 | 10 |
| Quiz | Musique | 1 | 10 |
| Quiz | Sport | 1 | 10 |
| **Quiz, tous thèmes** | | **15** | **150** |
| Bluff | Histoire | 4 | 40 |
| Bluff | Sciences et nature | 2 | 20 |
| Bluff | Culture générale | 2 | 20 |
| Bluff | Géographie | 1 | 10 |
| Bluff | Loisirs | 1 | 10 |
| **Bluff, tous thèmes** | | **10** | **100** |
| Blind test | Musique | 11 | 110 |

**Ce qui manque (tirage dans un seul thème)** :

| Thème | Quiz : manque pour 20 | Quiz : manque pour 30 | Bluff : manque pour 15 / 20 |
|---|---|---|---|
| Culture générale | 0 | 0 | 0 / 0 |
| Cinéma et séries | 0 | 0 | pas de Bluff |
| Loisirs | 0 | 10 | 5 / 10 |
| Sciences et nature | 0 | 10 | 0 / 0 |
| Géographie | 0 | 10 | 5 / 10 |
| Histoire | 10 | 20 | 0 / 0 |
| Musique | 10 | 20 | pas de Bluff |
| Sport | 10 | 20 | pas de Bluff |
**Bluff « 100+ quiz »** : la banque source (`content/sources/jaja-bluff.tsv`) compte 319 questions, soit 31 quiz de 10
au plus. 100 quiz demandent environ 700 questions de plus (rédaction ou nouvelle source). Les écrans doivent rester
fluides avec 100+ fiches, mais le catalogue n'en contiendra pas 100 tant que le contenu n'existe pas.

## 1. Nombre de questions (Quiz et Bluff)

**Pourquoi ce point n'est pas codé tout de suite** : il change le modèle de la partie (plus un seul `quizId`, un
tirage dans un ensemble de questions, mémorisé pour survivre à une relance de l'hôte) et les règles de la base
(nouveaux réglages). C'est le même socle que les points 4 et 6 : je propose de le faire en premier, avec eux.

### Modèle proposé (commun Quiz, Bluff et Rejouer)

- `settings.questionCount` : 10 / 20 / 30 en Quiz, 10 / 15 / 20 en Bluff (règle : liste fermée). Absent : 10.
- `settings.pool` : d'où viennent les questions, public (aucune réponse dedans), affiché par le salon et la TV :
  - `{ kind: 'quiz', quizId }` : un seul quiz (cas actuel, la fiche « Choisir ce quiz ») ;
  - `{ kind: 'themes', themes: [...] }` : Quiz, un ou plusieurs thèmes (identifiants sans accent) ;
  - `{ kind: 'mix', quizIds: [...] }` : Bluff, « Mon mélange » (20 quiz au plus).
- `quizId` reste obligatoire (compatibilité, TV et joueurs déjà déployés) : le quiz unique, ou le premier du tirage.
- `questionRefs` (hôte seul, jamais public) : la liste tirée, `["quizId/questionId", …]`, écrite au lancement.
  Une relance de l'app relit cette liste au lieu de retirer au sort. Rejouer la recalcule.
- **Tirage** (logique pure `shared/questionPool.ts`, testée) : d'abord les questions jamais jouées sur ce téléphone,
  au hasard ; s'il n'y en a pas assez, les plus anciennement jouées. Mémoire des questions jouées sur le téléphone de
  l'hôte (`lib/playedQuestions.ts`, AsyncStorage, comme « déjà fait » : perdue à la réinstallation).
- Option grisée si le pool choisi n'a pas assez de questions (`availableCounts(pool)`), avec « 12 questions
  disponibles » sous la barre.

### Écran

- Composant partagé `QuestionCountBar` (`components/host/catalog/`) : titre « NOMBRE DE QUESTIONS », contrôle segmenté
  (options en paramètre, désactivées selon le pool), résumé à droite (« Choisis un thème », « 3 quiz · 15 questions »),
  bouton CONTINUER grisé sans sélection. Fixe en bas ; le défilement du catalogue reçoit un padding bas égal à sa
  hauteur mesurée (rien n'est masqué).
- Quiz (S2 gardé) : la barre s'ajoute sous les rangées. **Question ouverte n° 1** (voir fin).

## 4. Rejouer sans recréer de salon (le plus important)

### Déroulé

1. Écran de fin de l'hôte : « Rejouer » (même jeu) **et** « Changer de jeu » (nouveau).
2. « Changer de jeu » : l'hôte écrit `nextGameAt` (public : « l'hôte choisit le prochain jeu ») et ouvre l'accueil
   des jeux en **mode salon** (paramètre `room=CODE` sur l'accueil, les catalogues et la fiche). Le salon reste ouvert :
   mêmes joueurs, même code, même QR.
3. Dans ce mode, « Choisir ce quiz » / « Continuer » n'appelle pas `createGame` mais `changeGameUpdate(session, pool,
   settings)` : retour au LOBBY avec le nouveau quiz, puis retour à l'écran de la partie (salon de l'hôte).
4. Annuler (retour) : `nextGameAt` est retiré, la partie reste sur l'écran de fin.

### Ce qui est remis à zéro / gardé

| Remis à zéro | Gardé |
|---|---|
| scores, rangs, séries (`players/*/score, rank, streak`) | joueurs, pseudos, avatars, connexion |
| réponses, `answeredBy`, `currentQuestion`, `reveal`, `questionCount`, `questionRefs` | code, QR, TV connectée (Cast inchangé) |
| Groupe : classement et points d'équipe (`teams`, `teamPoints`, `teamPresence`) | Groupe : équipe de chaque joueur, `teamsValidatedAt` |
| Bluff : propositions, vérifications, choix, votes, points, masquages | exclus (`banned`) : ils ne reviennent pas |
| Dessine-moi : dessin, manche, mot, essais, ordre des dessinateurs, points | son de la TV (`sound`) |

C'est exactement `replayUpdate` d'aujourd'hui, plus le nouveau `pool`, les réglages du nouveau jeu et `questionRefs`
effacé. Les réglages propres au jeu sont recalculés (`settingsForGameType` : un Bluff impose son mode) ; « Groupe »
garde son état s'il est permis par le nouveau jeu.

### Scores : défaut proposé

**Repartir de zéro** (défaut recommandé) : les jeux n'ont pas la même échelle (Dessine-moi jusqu'à 1 000 par manche,
Bluff au vote, Quiz avec ou sans Rapidité), un cumul favoriserait le jeu le plus généreux. Option « Cumuler les
scores » plus tard, si demandée : un champ `players/*/total` additionné à chaque fin, affiché seulement à la fin
(nouvelle règle, nouvel écran) ; je ne le prévois pas dans ce lot.

### Changements par partie du code

- **Règles** : `nextGameAt` (nombre, hôte seul, lisible par tous) ; `settings.pool` et `settings.questionCount`
  validés ; `questionRefs` (hôte seul, non lisible par les autres) ; `quizId` modifiable seulement en LOBBY ou à
  l'écran de fin (aujourd'hui l'hôte peut l'écrire à tout moment). Tests d'émulateur : changement de jeu, joueur qui
  ne peut ni écrire `nextGameAt` ni lire `questionRefs`.
- **Logique pure** : `changeGameUpdate` dans `shared/hostEngine.ts` (réutilise la remise à zéro de `replayUpdate`),
  `isChoosingNextGame`. `publicFields.ts` : `nextGameAt`.
- **App hôte** : bouton « Changer de jeu », mode salon des catalogues et de la fiche, `useGameQuestions` relancé sur
  le nouveau pool (déjà indexé sur `quizId`), adresses audio du blind test recalculées, « déjà fait » marqué au
  lancement comme aujourd'hui.
- **TV** : pendant `nextGameAt`, l'écran de fin s'efface vers un écran d'attente propre « L'hôte choisit le prochain
  jeu… » (code et QR visibles, avatars des joueurs, musique du salon) ; puis le salon habituel avec le nouveau jeu.
  `useBlindTestInfo` suit déjà `quizId` en direct. Démo `?status=ended&choosing=1`.
- **Page joueur** : même message sur l'écran de fin et la salle d'attente ; le type du jeu affiché (`useJoinGameType`)
  passe d'une lecture unique à une lecture en direct.
- **Spec** : sections 5 (déroulé), 6 (END) et 19 (Dessine-moi) mises à jour avant le code.

## 5. Blind test : écran BT5, prévu pour 100+ blind tests

### Métadonnées

| Donnée | Aujourd'hui | À ajouter |
|---|---|---|
| Genre | indirect : `icon` (cassette, guitare…) ; thème toujours « Musique » | `genre` obligatoire dans `content/` : liste fermée (Pop, Rock, Rap, Chanson, Disco/Funk, Électro, Variété…, à valider) |
| Époque | seulement dans le titre et l'identifiant (`annees-80`) | `decade` : `1960` … `2020` ou `all` (« Toutes époques ») |
| Difficulté | `level` facile / moyen / difficile, ou moyenne des questions (1 à 3) | `level` à 4 valeurs avec `impossible` ; obligatoire pour les blind tests |
| Compteurs | aucun | **calculés dans l'app**, pas stockés : nombre par genre, décennie, niveau, et « N joués » (mémoire du téléphone) |

« Impossible » : quatre points de difficulté, le 4e niveau en rose (`AppColors`), sur les tuiles et la liste. Il ne
change ni les points ni la durée. Les autres jeux gardent 3 niveaux (`level` reste facultatif pour eux).

### Fluidité avec 100+ éléments

- `/quizzes` est déjà lu en entier une seule fois (une fiche ≈ 0,5 Ko : 100 blind tests ≈ 50 Ko) ; aucune question
  n'est lue avant le lancement. Filtres, recherche, tris et compteurs : **dans l'app** (logique pure testée), en
  mémoire, recalculés seulement quand un filtre change (`useMemo`).
- Liste filtrée en **FlatList virtualisée** (lignes de hauteur fixe, `getItemLayout`, 10 lignes rendues d'avance) ;
  les tuiles (8 au plus par onglet) restent de simples vues.
- Pas d'index ni de requête côté base : inutile sous quelques milliers de fiches.

### Écrans

Onglets Genre / Années / Difficulté (contrôle segmenté), recherche au-dessus des tuiles, tuiles en 2 colonnes
(couleur, nombre, « N joués ») ; un appui ouvre la liste filtrée : titre de la tuile, pastille du filtre actif
retirable (✕), « Genre ▾ » et « Trier », compteur « 7 sur 22 blind tests », lignes (icône, titre, genre, points de
difficulté). Une ligne ouvre la fiche actuelle (« Choisir ce quiz »). Pas de barre « Nombre de questions » (un blind
test = ses 10 morceaux).

## 6. Bluff : écran BL4, prévu pour 100+ quiz

### Modèle de contenu

| Donnée | Aujourd'hui | À faire |
|---|---|---|
| Nom | `title` (« Bluff : bêtes de science ») | retirer le préfixe « Bluff : » des titres (l'onglet le dit déjà) |
| Catégorie | `theme`, parmi les 8 thèmes | rien (la maquette montre « Langue », qui n'est pas un des 8 thèmes : à confirmer) |
| Icône | `icon` facultatif, sinon icône du thème | rien |
| Nombre de questions | `questionCount` (10 pour chacun) | rien |
| Difficulté | `level` facultatif, sinon moyenne | rien (3 niveaux) |
| Popularité (« Populaires ») | `featuredRank` (Top 10 manuel) | ordre : `featuredRank`, puis les plus récents |

### Écran et « Mon mélange »

- Recherche « Chercher parmi N quiz », ligne « Surprends-moi » (tire au hasard 3 quiz pas encore joués et lance la
  barre sur 10 questions), pastilles de catégories qui défilent, liste « Populaires » (FlatList virtualisée) avec « + ».
- Un quiz choisi : ligne surlignée et coche cyan. **Pas de bloc de pastilles sous la recherche** : le résumé tient dans
  la barre du bas (« 3 quiz · 30 questions »), avec un lien « Voir » qui ouvre une feuille (`BottomSheet`) : liste des
  quiz choisis, croix pour en retirer un, « Tout vider ».
- Barre « Nombre de questions » 10 / 15 / 20, options grisées au-delà des questions du mélange.
- Partie : `settings.pool = { kind: 'mix', quizIds }`, tirage commun (point 1).

## Ordre proposé des lots

1. **Socle** (spec, règles, tests) : `settings.pool`, `settings.questionCount`, `questionRefs`, tirage `questionPool`,
   mémoire des questions jouées. Aucun écran nouveau, parties actuelles inchangées.
2. **Barre « Nombre de questions »** Quiz (thèmes) et Bluff (liste actuelle, avant BL4).
3. **Changer de jeu** (point 4) : hôte, TV, joueurs.
4. **Bluff BL4** et « Mon mélange ».
5. **Blind test BT5** : métadonnées `genre`, `decade`, `level` à 4 niveaux dans les 11 blind tests, puis l'écran.

## Questions ouvertes (à trancher avant le lot 1)

1. **Quiz S2 : qu'est-ce que « choisir un thème » ?** Proposition : la puce de thème (une seule, ou plusieurs ?)
   devient la sélection du pool, « Tout » compris ; un appui sur une affiche ouvre toujours la fiche du quiz (partie
   de 10 questions de ce quiz, sans la barre). À confirmer, ou maquette de l'état « thème choisi ».
2. **Scores au changement de jeu** : remise à zéro par défaut, cumul plus tard ? (proposé ci-dessus)
3. **Contenu manquant** : qui rédige les questions manquantes (20 et 30 par thème, 700 questions de Bluff) ? En
   attendant, les options sont grisées.
4. **Catégories du Bluff** : la maquette montre « Langue » ; on garde strictement les 8 thèmes actuels ?
5. **Genres des blind tests** : liste fermée à valider (proposition ci-dessus).
