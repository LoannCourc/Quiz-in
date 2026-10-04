# [Quiz'In] — Spécification du MVP

Version 0.5 — 4 octobre 2026
Statut : brouillon à valider. Les points marqués **[À VALIDER]** sont des propositions à confirmer ; la section 12 les regroupe.

---

## 1. Vision

**Problème.** Organiser un quiz à la maison est compliqué : il faut trouver les questions, un moyen de les afficher, un moyen de répondre. Quand on joue à voix haute devant la TV, ceux qui parlent fort dominent et les plus discrets s'effacent.

**Solution.** Une application tout-en-un : l'hôte choisit un quiz dans l'app et l'affiche sur la TV ; chaque joueur répond en silence sur son téléphone ; les réponses sont révélées en même temps pour tout le monde.

**Cible.** Les familles et les groupes d'amis, en soirée à la maison.

**Promesses au joueur.**
- **Simple** : rejoindre une partie en moins d'une minute, sans compte ni installation.
- **Équitable** : tout le monde répond en même temps, sans se couvrir la voix.
- **Fun** : animations, classement, ambiance de soirée.

**Vision long terme.** Trois types de jeu : quiz, blind test, « N'oubliez pas les paroles ». **Le MVP ne contient que le quiz.**

---

## 2. Périmètre du MVP

### 2.1 Plateformes du MVP
- **App de l'hôte** : Android (Expo / React Native).
- **Joueurs** : navigateur web (Android, iPhone, ordinateur). Aucune installation requise.
- **Écran TV** : Google Cast (Chromecast ou TV avec Chromecast intégré).
- **iOS** : une app hôte iOS est hors MVP (build iOS = Mac ou service de build cloud, plus un compte Apple Developer payant). Les joueurs sur iPhone participent via le navigateur dès le MVP. **[À VALIDER]**

### 2.2 Fonctionnalités par priorité

| Priorité | Fonctionnalité |
|---|---|
| **P0** (indispensable) | Catalogue de quiz avec filtres thème et difficulté |
| | Partie de 10 questions |
| | Deux modes de réponse : **Réponse libre** et **Choix multiples** (4 choix) |
| | Option **Rapidité** |
| | Affichage sur TV via Cast, avec lobby (QR code + code de salle) |
| | Rejoindre par QR code ou code, pseudo + avatar prédéfini |
| | L'hôte joue aussi en tant que joueur |
| | Validation automatique des réponses libres |
| | Classement après chaque question et classement final |
| | Reconnexion d'un joueur en cours de partie |
| **P1** (si le temps le permet) | Option **Contrôle** (validation des réponses par les joueurs) |
| | Animations TV enrichies, sons |
| | Exclure un joueur depuis l'app hôte |
| **P2** (après le MVP) | Option **Groupe** (équipes) |
| | App hôte iOS, redirection QR vers l'app joueur |
| | Blind test, « N'oubliez pas les paroles » |
| | Quiz créés par l'hôte, paiement, abonnement |

---

## 3. Rôles

| Rôle | Appareil | Ce qu'il fait |
|---|---|---|
| **Hôte** | App Android | Choisit le quiz et les options, lance l'affichage sur la TV, administre la partie (lancer, passer, pause, terminer), et joue comme les autres. |
| **Joueur** | Navigateur (ou app, plus tard) | Rejoint en scannant le QR code ou avec le code, choisit pseudo et avatar, répond aux questions. |
| **Écran TV** | Chromecast / TV | Affichage uniquement : lobby, questions, révélations, classements. Aucune interaction. |
| **Serveur** | Firebase | Garde l'état de la partie et synchronise tous les écrans en temps réel. |

---

## 4. Parcours

### 4.1 Hôte
1. Ouvre l'app et arrive sur le **catalogue** de quiz (maquette « S2 ») : « QUIZ'IN » et une recherche par titre ; un sélecteur de type de jeu (seul « Quiz » est actif au MVP ; « Blind test » et « Paroles » sont visibles, marqués « bientôt », non cliquables) ; des puces de thème (« Tout » puis un thème par thème présent) qui filtrent les rangées ; des rangées d'affiches qui défilent horizontalement : « Top 10 cette semaine » (ordre choisi à la main, gros chiffres), « Nouveautés », « Faciles, pour tout le monde », « Pour les experts ». Une rangée vide n'est pas affichée. Les affiches portent la couleur du quiz et son titre, sans emoji.
2. Ouvre la **fiche d'un quiz** : grande affiche, titre, « N questions · environ X min · jusqu'à 20 joueurs », pastilles (difficulté, public, type de jeu), description, et le bouton **« Choisir ce quiz »**, visible sans défiler. Ce bouton crée la partie avec les réglages par défaut (Choix multiples, Rapidité) et ouvre le salon.
3. **Réglages de la partie** (facultatif) : un lien discret « Réglages » de la fiche ouvre une feuille :
   - **Mode de réponse** : *Réponse libre* (les joueurs écrivent) ou *Choix multiples* (4 propositions).
   - **Options** : Rapidité (P0), Contrôle (P1), Groupe (P2).
   - **Règles de compatibilité** : Contrôle n'est disponible qu'en Réponse libre. En Choix multiples, au maximum deux options sont actives ; en Réponse libre, les trois peuvent l'être.
4. Arrive dans le **salon** : titre et méta du quiz, carte « Code de la partie », bouton **« Afficher sur la TV »** (icône Cast ; il choisit sa TV dans la liste Cast ; une fois connectée, le bouton passe au second plan et affiche « TV connectée »), lien discret **« Je n'ai pas de TV »** (masqué quand la TV est connectée), liste des joueurs (avatar, pseudo, étiquette HÔTE) et **« Lancer la partie »** toujours visible en bas : seule la liste défile.
   - Le lien des joueurs et le QR code ne sont **pas** affichés par défaut. « Je n'ai pas de TV » ouvre le bloc **« Rejoindre sans TV »** : QR code et lien `quizin-play.web.app/join/CODE`, « Copier le lien », « Partager » (partage du téléphone), « Masquer », et le lien de l'écran pour le plan B (section 6.6). Ce bloc est replié à chaque ouverture du salon.
5. La TV affiche le **lobby** : QR code, code de salle, joueurs qui arrivent.
6. L'hôte choisit son propre pseudo et avatar (formulaire au-dessus de la liste, puis lien « Modifier » sur sa ligne) : il rejoint comme joueur. S'il ne s'inscrit pas, il peut quand même lancer la partie avec au moins 2 joueurs connectés.
7. Quand tout le monde est là, il appuie sur **« Lancer la partie »** (minimum 2 joueurs, hôte compris).
8. Pendant la partie, il joue et dispose de boutons admin : **Passer** (avance à l'étape suivante), **Pause**, **Terminer**.
9. À la fin : classement final, puis **Rejouer** (même quiz) ou **Retour au catalogue**.

### 4.2 Joueur
1. Scanne le **QR code** affiché sur la TV (ou ouvre l'adresse et saisit le code de salle).
2. Une **page web** s'ouvre, sans installation. Il saisit un **pseudo** (2 à 12 caractères) et choisit un **avatar** dans une liste prédéfinie.
3. Il attend dans le lobby et voit les autres arriver. Tant que la partie n'est pas lancée, il peut modifier son pseudo et son avatar (mêmes règles qu'à l'inscription).
4. À chaque **question**, son téléphone affiche le compte à rebours et :
   - en *Réponse libre* : un champ de saisie et un bouton « Valider » ;
   - en *Choix multiples* : les 4 propositions, en texte lisible, sous forme de gros boutons.
5. Une fois validée, la réponse est **définitive**. Le téléphone affiche « Réponse envoyée ».
6. À la **révélation**, il voit si sa réponse est juste, les points gagnés et son rang.
7. À la fin, il voit le classement final.

### 4.3 Écran TV (séquence des écrans)
1. **Lobby** : QR code, code, avatars et pseudos des joueurs connectés.
2. **Démarrage** : compte à rebours 3-2-1.
3. **Question** : énoncé, difficulté, propositions (en Choix multiples), compte à rebours, indicateur discret de réponses reçues (avatars qui s'illuminent, sans montrer les réponses).
4. **Révélation** : bonne réponse, explication si elle existe, répartition des réponses (en Choix multiples) ou liste des réponses (en Réponse libre).
5. **Validation** *(P1, option Contrôle)* : vote des joueurs sur les réponses libres.
6. **Classement** : top 5 et progression après chaque question.
7. **Fin** : podium et classement complet.
8. **États spéciaux** : pause, « l'hôte se reconnecte… », partie terminée.

---

## 5. États d'une partie et transitions

| État | Sortie déclenchée par | Condition |
|---|---|---|
| **LOBBY** | Hôte (bouton « Lancer ») | Au moins 2 joueurs |
| **STARTING** (3 s) | Automatique | Fin du compte à rebours |
| **QUESTION** | Automatique | Fin du chrono, **ou** tous les joueurs connectés ont répondu (délai de 2 s). L'hôte peut aussi forcer « Passer » |
| **REVEAL** (6 s) | Automatique | Fin du délai. L'hôte peut avancer plus tôt |
| **VALIDATION** *(P1, 15 s)* | Automatique | Fin du délai ou action de l'hôte |
| **SCORES** (5 s, dont 1,5 s d'annonce plein écran de la question suivante) | Automatique | Fin du délai, ou l'hôte avance. S'il reste des questions, retour à QUESTION, sinon passage à END |
| **PAUSED** | Hôte (bouton) ou déconnexion de l'hôte | L'hôte reprend. La partie revient à l'état mémorisé dans `pausedFrom`, avec le temps restant `remainingMs` (la nouvelle fin de phase est recalculée à partir de l'heure du serveur) |
| **END** | Hôte | « Rejouer » : retour au lobby avec le même code et les mêmes joueurs, scores remis à zéro, mêmes questions. « Quitter » : suppression immédiate de la partie |

Les durées sont des constantes de configuration, ajustables après les tests.

---

## 6. Règles du jeu

### 6.1 Durées
- **Choix multiples** : 20 secondes par question.
- **Réponse libre** : 30 secondes par question.
- Chaque question peut surcharger sa durée.
- **Durée d'une partie** : 10 questions représentent environ 5 à 7 minutes selon le mode de réponse (10 questions au MVP, décision 12.5).

### 6.2 Points
- **Bonne réponse** : 100 points.
- **Option Rapidité** : bonus proportionnel au temps restant. `points = 100 + arrondi(100 × temps restant / durée de la question)`, soit de 100 à 200 points.
- **Mauvaise réponse ou absence de réponse** : 0 point.
- Le temps de réponse est mesuré avec l'horodatage du **serveur**, pas celui du téléphone.
- Pause pendant une question : le bonus de rapidité des réponses données avant la pause est légèrement surévalué, plafonné à 100 (approximation acceptée au MVP).

### 6.3 Validation des réponses libres
- **Automatique (P0)** : la réponse du joueur est normalisée (minuscules, sans accents ni ponctuation, sans article initial) puis comparée à la liste des réponses acceptées de la question.
- **Tolérance aux fautes** : une faute de frappe est acceptée pour les réponses de 5 lettres ou plus. À affiner après les tests.
- **Contrôle (P1)** : après la révélation, les réponses libres s'affichent sur la TV. Chaque joueur peut voter ✓ ou ✗ sur les réponses des autres. Une réponse est acceptée à la majorité des votes. En cas d'égalité, la décision est en faveur du joueur. Ce vote prime sur la validation automatique.

### 6.4 Équipes (P2, option Groupe)
- Les équipes sont formées dans le lobby. Chaque joueur répond toujours sur son téléphone.
- Score d'équipe = **moyenne** des scores individuels (pour ne pas avantager les grandes équipes). **[À VALIDER]**

### 6.5 Classement
- En cas d'égalité, les joueurs partagent le même rang et le suivant est sauté (1er, 1er, 3e).
- Le classement est mis à jour **après chaque révélation**, pas pendant la question, pour ne pas influencer les joueurs.

### 6.6 Joueurs et connexion
- **Nombre de joueurs** : 2 à 20, hôte compris. Cette limite est une constante, relevable plus tard. Elle protège la lisibilité du classement sur la TV et les coûts. **[À VALIDER]**
- **Pseudo** : 2 à 12 caractères, sans espace au début ni à la fin (l'app le nettoie avec `trim()` avant l'envoi ; les règles de la base refusent un pseudo mal formé), unique dans la partie sans tenir compte de la casse, filtre de base contre les mots interdits. L'app joueur vérifie l'unicité avant l'inscription ; l'hôte la vérifie en plus et retire un joueur en double.
- **Avatar** : choisi dans une liste prédéfinie d'environ 24. Pas d'envoi de photo.
- **Rejoindre après le lancement** : impossible, sauf reconnexion d'un joueur déjà présent.
- **Joueur déconnecté** : il garde son score, peut revenir avec le même pseudo et retrouve l'état en cours. Il obtient 0 point aux questions manquées.
- **Hôte déconnecté** : s'il quitte l'écran de la partie ou met l'app en arrière-plan, la partie se met en pause. En cas de coupure (app fermée, réseau perdu), le serveur note l'heure de son départ ; joueurs et TV affichent « L'hôte a perdu la connexion… ». À son retour, la partie est en pause et l'hôte la reprend lui-même. S'il ne revient pas dans les 5 minutes, la partie est supprimée par un joueur ou la TV encore connecté (en fin de partie, sans message d'absence, ce nettoyage s'applique aussi).
  - Le serveur peut mettre jusqu'à une minute à détecter la coupure. Dès qu'il perd la connexion, le téléphone de l'hôte gèle la partie (aucune transition, contrôles masqués, message « Connexion perdue… la partie est en attente »). Au retour du réseau, il met la partie en pause avec le temps qui restait au moment de la perte.
  - Joueurs et TV : si une phase (3-2-1, question, révélation, classement) dépasse son échéance de plus de 5 s sans changer, ils affichent « En attente de l'hôte… » à la place du chrono figé. Le message d'absence ci-dessus reste prioritaire.
- **Cast interrompu** : la question ne s'affiche que sur la TV. Si la session Cast se termine sans que l'hôte l'ait demandé, la partie se met en pause (même pause que le bouton Pause) et l'hôte voit « Cast interrompu : reconnecte la TV, puis reprends ». Il relance le Cast : la TV reprend à l'état courant, car l'état est stocké sur le serveur. La reprise est manuelle.
- **Affichage TV sans Cast (plan B)** : l'adresse du récepteur avec le code (`https://quiz-in-7dbd6.web.app/?code=CODE`, copiable depuis le bloc « Rejoindre sans TV » du salon de l'hôte) s'ouvre dans n'importe quel navigateur en plein écran, par exemple sur un PC branché en HDMI. L'affichage est identique à celui du Cast, de 1280×720 à 1920×1080.
- **Code de salle** : 4 caractères, sans caractères ambigus (pas de O/0, I/1). Le QR code encode un lien du type `https://quizin-play.web.app/join/CODE` (site Firebase Hosting des joueurs, distinct de celui du récepteur TV). Une partie est supprimée automatiquement 24 heures après sa fin, ou dès que l'hôte quitte la partie.

### 6.7 Animations et sons
- **Pendant la question** : animations **discrètes** qui ne distraient pas ceux qui réfléchissent. Exemple : les avatars de ceux qui ont répondu s'illuminent, fond légèrement animé.
- **Pendant la révélation et le classement** : animations plus riches (confettis, montée au podium) pour amuser ceux qui ont fini de répondre.
- **Sons** : désactivés par défaut au MVP.
- **Performance** : animations légères (CSS), pour tourner sur de vieux Chromecast.

---

## 7. Modèle de données (première version)

Base : Firebase Realtime Database.

```
quizzes/{quizId}                      // lisible par tout utilisateur connecté
  title, theme, gameType: "quiz", language: "fr"
  difficulty: 2.3                     // moyenne des questions
  difficultyLabel: "Moyen"
  questionCount: 10, estimatedMinutes: 6     // durée estimée en Choix multiples (mode par défaut)
  description                         // 160 caractères au plus
  audience: "all|kids|experts"        // Tout public, Enfants, Experts
  poster: "pink|blue|green|orange|red|cyan|violet|gold"   // palette du dégradé de l'affiche
  addedAt: "AAAA-MM-JJ"               // rangée « Nouveautés »
  featuredRank?: 1 à 10               // place dans le « Top 10 cette semaine », choisie à la main (pas de statistiques)
  // Champs d'affichage facultatifs à la lecture : valeur par défaut si absents (fiches importées avant leur ajout)

questions/{quizId}/{index}            // chargé par l'hôte seul ; lisible par tout utilisateur connecté au MVP (voir « Limites connues »)
  (voir section 8)

sessions/{code}
  hostUid, quizId
  status: "lobby|starting|question|reveal|validation|scores|paused|ended"
  settings: { answerMode: "free|choice", speedBonus, control, teams }
  currentIndex
  questionCount                       // écrit par l'hôte au lancement uniquement, public en lecture
  phaseStartedAt, phaseEndsAt         // horodatage serveur
  pausedFrom?, remainingMs?           // renseignés en PAUSED : état à reprendre et temps restant de la phase
  hostLeftAt?                         // heure serveur du départ de l'hôte (écrite par onDisconnect), public ; effacée à son retour
  currentQuestion: { text, options?, difficulty, timeLimit }   // SANS la bonne réponse
  reveal: { correctAnswer, explanation, stats }                // publié à la révélation
    stats.choiceCounts?: [n0, n1, n2, n3]                      // Choix multiples : réponses par proposition
    stats.freeAnswers?: [{ playerId, value }]                  // Réponse libre : objets extensibles (masquage par l'hôte en P1)
    results?: { [uid]: { correct, points } }                   // résultat de chaque joueur ayant répondu (✓/✗, points gagnés)
    // reveal reste en place pendant SCORES et est effacé au passage à la question suivante
  players/{uid}: { name, avatar, score, rank, connected }
    // name, avatar : écrits par le joueur, dans le lobby uniquement
    // connected : écrit par le joueur (voir « Présence ») ; score, rank : écrits par l'hôte
  answers/{index}/{uid}: { value, submittedAt, correct, points }   // lisible UNIQUEMENT par l'hôte
    // value, submittedAt : écrits une seule fois par le joueur, en QUESTION, pour la question courante
    // value : texte de 1 à 60 caractères (Réponse libre) ou index 0 à 3 (Choix multiples)
    // submittedAt : horodatage serveur, au plus phaseEndsAt + 1 000 ms (tolérance réseau)
    // correct, points : écrits par l'hôte
  answeredBy/{index}/{uid}: true      // lisible par tout utilisateur connecté
    // écrit par le joueur en même temps que sa réponse : indique QUI a répondu, jamais QUOI
```

**Accès** (règles de sécurité dans `database.rules.json`)
- `sessions` n'est jamais lisible en entier. Seul l'hôte (`hostUid`) peut lire `sessions/{code}` d'un bloc. Les autres (joueurs, TV) lisent chaque champ séparément ; tous sauf `answers` sont lisibles par un utilisateur connecté.
- L'hôte écrit tout le reste de la session. `hostUid` est fixé à la création et ne change plus.
- `currentQuestion` refuse tout champ autre que `text`, `options`, `difficulty`, `timeLimit` : la bonne réponse ne peut pas y être publiée par erreur.

**Présence**
- Chaque joueur écrit `connected: true` à chaque connexion (détectée via `.info/connected`) et enregistre auprès du serveur une écriture `connected: false` à exécuter s'il se déconnecte (`onDisconnect`). C'est le serveur Firebase qui l'exécute : la présence se met à jour même si le téléphone se met en veille ou perd le réseau.
- « Tous les joueurs connectés ont répondu » (section 5) se calcule avec `players/*/connected` et `answeredBy/{currentIndex}`.

**Limites connues du MVP**
- **Catalogue lisible** : `questions/` doit être lu par l'hôte, et n'importe quel utilisateur anonyme peut devenir hôte. Le catalogue (avec les bonnes réponses) est donc lisible par tout utilisateur connecté. Un joueur averti pourrait le consulter ; c'est accepté pour une soirée entre amis. Correction possible plus tard : servir les questions par une Cloud Function.
- Les règles ne peuvent ni compter les joueurs (`MAX_PLAYERS`) ni garantir l'unicité du pseudo : c'est l'hôte qui le vérifie et retire un joueur en trop.
- **Écrans de l'hôte sur le web** : le site des joueurs est construit à partir du même code que l'app hôte. L'accueil (catalogue) et l'écran de test redirigent vers `/join`, mais les écrans de l'hôte (`/quiz/...`, `/host/...`) restent atteignables par leur adresse directe. L'app hôte est prévue pour Android ; la protection contre la création de parties en masse (Firebase App Check) viendra après le MVP.
- **Reprise d'un joueur** : elle repose sur sa session anonyme Firebase, conservée par le navigateur. Le joueur retrouve sa place en revenant depuis le même navigateur sur le même appareil. Changer d'appareil ou de navigateur, ou effacer les données du site, crée un nouvel uid : il ne peut pas reprendre sa place.

**Principes**
- **L'hôte est l'autorité de la partie** : il fait avancer les états, calcule la validité des réponses et les points. Il garde donc l'écran allumé pendant la partie.
- **La bonne réponse n'est jamais envoyée aux joueurs avant la révélation.** Seul l'hôte charge le catalogue de questions, et il publie la bonne réponse au moment de la révélation. Cela évite la triche en inspectant le navigateur (voir la limite connue sur le catalogue ci-dessus).
- **Un joueur ne peut écrire que sa propre réponse**, et seulement pendant l'état QUESTION. Les réponses des autres ne lui sont pas lisibles avant la révélation.
- **Authentification anonyme** pour tout le monde (hôte, joueurs, TV).

---

## 8. Format d'une question

| Champ | Description |
|---|---|
| `id` | Identifiant unique |
| `text` | Énoncé (140 caractères maximum, lisible sur TV) |
| `options` | 4 propositions, une seule correcte |
| `correctIndex` | Position de la bonne proposition |
| `acceptedAnswers` | Liste des réponses acceptées en Réponse libre |
| `difficulty` | 1 (Facile), 2 (Moyen), 3 (Difficile) |
| `explanation` | Optionnel, affichée à la révélation |
| `timeLimit` | Optionnel, remplace la durée par défaut |
| `media` | Réservé pour plus tard (image, audio, vidéo) |

**Le mode de réponse est un réglage de la partie, pas du quiz.** Chaque question doit donc fonctionner dans les deux modes : une réponse courte et sans ambiguïté en libre, quatre propositions plausibles en choix multiples.

**Exemple**
```json
{
  "id": "q-0001",
  "text": "Quelle planète est la plus proche du Soleil ?",
  "options": ["Mars", "Mercure", "Vénus", "La Terre"],
  "correctIndex": 1,
  "acceptedAnswers": ["mercure"],
  "difficulty": 1,
  "explanation": "Mercure orbite à environ 58 millions de km du Soleil."
}
```

**Difficulté**
- La difficulté de chaque question est affichée à côté de l'énoncé.
- Celle du quiz est la moyenne des difficultés de ses questions : moins de 1,67 → Facile, jusqu'à 2,33 → Moyen, au-delà → Difficile.

**Règles de contenu**
- Contenu original, jamais copié d'un quiz existant.
- Faits vérifiés auprès d'au moins deux sources.
- Contenu adapté à un public familial.
- Textes en français.

---

## 9. Contraintes techniques

- **Stack** : Expo (React Native) + TypeScript pour l'app et le client joueur web ; Vite + TypeScript pour le récepteur TV ; Firebase (Realtime Database, authentification anonyme, Hosting).
- **Réseau** : Internet requis pour tous. L'hôte et la TV doivent être sur le **même réseau local** pour le Cast. Les joueurs peuvent être sur n'importe quel réseau, y compris en 4G/5G.
- **Latence** : un changement d'état doit apparaître sur tous les écrans en moins d'une seconde.
- **Lisibilité TV** : texte très grand et fort contraste, lisible à 3 mètres, marges de sécurité autour de l'écran.
- **Langues** : français au MVP, mais tous les textes dans un fichier dédié pour faciliter les traductions.
- **Confidentialité** : uniquement pseudo et avatar, aucun compte, aucun e-mail. Données de partie supprimées sous 24 h. Une politique de confidentialité sera nécessaire pour publier sur les stores. Pas de chat ni d'envoi d'images, car la cible inclut des mineurs.
- **Réponses libres affichées sur la TV** : filtre de base, et l'hôte peut masquer une réponse (P1).

---

## 10. Critères de réussite du MVP

**Fonctionnels**
- L'hôte choisit un quiz et ses options, puis l'affiche sur sa TV.
- Les joueurs se connectent et répondent.
- On joue une partie jusqu'au bout et on voit le classement final.

**Mesurables** (sur au moins 5 parties tests de 4 à 8 joueurs, dont 2 avec enfants ou personnes âgées)
- 80 % des joueurs rejoignent en moins d'une minute.
- 3 parties sur 4 vont jusqu'au bout.
- Aucun plantage bloquant sur l'ensemble des tests.
- Mise à jour des écrans en moins d'une seconde.

**Qualitatifs**
- Au moins 7 joueurs sur 10 disent qu'ils rejoueraient.

---

## 11. Décisions prises dans cette version

1. Le MVP est un quiz seul de 10 questions (pas de blind test ni de paroles).
2. L'hôte est joueur et administrateur.
3. Le mode de réponse (libre ou choix multiples) se règle à chaque partie.
4. Rejoindre en scannant un QR code, sans compte, avec pseudo et avatar prédéfini.
5. Les joueurs passent par le navigateur au MVP.
6. Réponse définitive après validation.
7. Égalités : même rang.
8. Classement mis à jour après chaque révélation.
9. Le client joueur ne lit jamais `questions/` ; la bonne réponse n'est publiée qu'à la révélation (dans `reveal`). La lisibilité du catalogue par un utilisateur connecté est une limite acceptée au MVP (section 7).
10. Réponse libre : 60 caractères maximum.
11. Le nom reste « Quiz'in ». Logo retenu : variante C (anneau doré, queue rose en diagonale), fichier source `docs/design/logo-1024.png` ; il sert d'icône d'application, d'écran de démarrage, de favicon et d'icône Cast (`docs/design/cast-icon-512.png`).

---

## 12. Questions ouvertes

1. **Quiz'In** -> Le nom reste « Quiz'in » (logo : décision 11).
2. **Joueurs sans limite ou plafonnés à 20 ?** Proposition : 20 au MVP. -> 20 est la limite du nombre de joueurs pour le MVP.
3. **iOS** : confirmer que l'app hôte iOS est reportée et que les joueurs iPhone passent par le web -> Confirmé. 
4. **Redirection du QR code vers l'app** pour ceux qui l'ont installée : proposition de la reporter après le MVP, car elle demande des liens profonds (Android App Links / iOS Universal Links) et un domaine configuré -> Confirmé.
5. **Durée de partie** : rester à 10 questions (environ 10 minutes) ou viser 15 à 20 questions pour atteindre 15 à 20 minutes ? -> Pour le MVP, rester à 10 questions. 
6. **Contrôle** : valider le vote à la majorité, ou une autre règle ? -> Les joueurs décident eux mêmes, pas besoin de faire de règles spécifiques.
7. **Groupe** : score d'équipe en moyenne ou en somme ? Équipes choisies par les joueurs ou assignées aléatoirement ? -> En moyenne + les équipes peuvent soit être choisies par les joueurs soient assignées aléatoirement
8. **Priorités** : valider que Contrôle (P1) et Groupe (P2) sortent du premier MVP. -> Validé.
9. **Quiz de lancement** : quels thèmes pour les 10 premiers quiz ? -> Culture G classique

---

## 13. Après le MVP (feuille de route indicative)

- Option Groupe (équipes).
- App hôte iOS et redirection du QR code vers l'app joueur.
- Quiz créés par l'hôte (anniversaires, mariages, réunions de famille).
- Packs thématiques et de saison, modèle freemium pour l'hôte.
- Blind test (voir 14, chantier c) et « N'oubliez pas les paroles » (après étude des droits musicaux).
- Mode bars et événements.
- Option d'accessibilité « afficher la question sur le téléphone », pour les joueurs qui voient mal la TV (au MVP, l'énoncé n'est lu que sur la TV).
- Option hôte pour ne pas afficher le classement entre les questions (classement tous les N tours, ou seulement à la fin). Demandera un champ dans `settings`, une vérification des règles et une mise à jour de la machine d'états.

---

## 14. Prochains chantiers validés

À traiter dans cet ordre. Aucun ne se code sans un message dédié du développeur pour ce chantier.

a. **Nouveau catalogue de l'hôte** (maquette « S2 ») : sélecteur de jeux en haut (Quiz actif ; Blind test et Paroles marqués « bientôt ») ; puces de thème ; Top 10 de la semaine avec gros chiffres ; rangées d'affiches par thème ; fiche du quiz avec un bouton « Choisir ce quiz ».
b. **Salon de l'hôte** : le lien et le QR code des joueurs sont masqués par défaut sur le téléphone de l'hôte et n'apparaissent qu'après un appui sur « Je n'ai pas de TV » (la TV reste le moyen normal de rejoindre).
c. **Mode blind test** (plus tard) : extraits de 30 secondes fournis par l'API Deezer, usage gratuit et non commercial, avec mention de Deezer. La source audio doit être interchangeable (pas de dépendance directe à Deezer dans le moteur de jeu). **En attente de la réponse écrite de Deezer avant toute publication.**
d. **Publication de l'application Cast** (aujourd'hui limitée aux appareils de test enregistrés).
