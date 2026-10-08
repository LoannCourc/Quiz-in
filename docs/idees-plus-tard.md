# Idées pour plus tard

Études faites en octobre 2026, sans code. Rien à développer avant l'accord écrit du développeur.

## 1. Quiz perso : éditeur sur le téléphone de l'hôte

**Décision** : retenu, **après l'APK 6**, 4 à 5 jours.

### Aujourd'hui
- Les quiz sont écrits dans `content/` (JSON), générés par `npm run build`, puis importés à la main dans `/quizzes` (fiches) et `/questions` (questions et bonnes réponses). La base est en lecture seule pour les clients.
- L'hôte lit les questions (`useGameQuestions`), les valide (`shared/quizValidation.ts`), et le moteur publie une question à la fois (`currentQuestion`, sans la bonne réponse). Les joueurs ne lisent jamais les questions.

### Ce qui change
- Le moteur tourne déjà sur le téléphone de l'hôte : un quiz perso peut partir de ce téléphone **sans règle Firebase ni nouveau nœud** dans la base.
- Identifiant distinct (`local-…`) pour que « Rejouer » relise le quiz sur le téléphone et non dans la base.

### Stockage : sur le téléphone seulement
- AsyncStorage (déjà installé).
- Réinstallation ou effacement des données de l'app : les quiz sont perdus. Changement de téléphone : ils ne suivent pas.
- Firebase n'y changerait rien : la connexion est anonyme, l'identifiant change à la réinstallation. Garder les quiz demanderait de vrais comptes (connexion Google), un chantier à part entière.

### Périmètre minimal
- Titre, thème (parmi les 8 thèmes classiques), 10 questions, 4 réponses, la bonne réponse.
- Aperçu d'une question (même écran que le joueur).
- Modifier, supprimer.
- Section « Mes quiz » dans le catalogue du Quiz, fiche, lancement de la partie.
- Repère « déjà fait » (lot E), comme pour les quiz du catalogue.

### Coût : 4 à 5 jours
| Tâche | Jours |
|---|---|
| Modèle, stockage, validation (mêmes limites que les quiz du catalogue) | 0,5 |
| Éditeur (titre, thème, questions, réponses, bonne réponse) | 1,5 à 2 |
| Aperçu | 0,5 |
| « Mes quiz », fiche, modifier, supprimer, lancement | 1 |
| Tests et vérifications sur téléphone | 1 |

### Risques
- **Règles Firebase** : aucune modification.
- **Abus** : le quiz n'est vu que par la soirée de l'hôte, sans partage public ; pas de modération. Le filtre des mots interdits de la TV (`shared/answerFilter.ts`) existe déjà.
- **Taille** : environ 5 Ko par quiz, négligeable.
- **Validation** : mêmes contrôles que le contenu du catalogue ; énoncés longs déjà gérés sur la TV (jusqu'à 140 caractères).
- **APK** : pas de nouvelle dépendance native, donc pas de build EAS.

### À reporter
Partage entre hôtes, sauvegarde en ligne, import et export, images, nombre de questions libre, saisie libre avec synonymes, Bluff perso.

## 2. Blind test perso

**Décision** : **non pour l'instant**, en attente de l'accord écrit de Deezer.

### Aujourd'hui
- **Source** : un blind test liste des identifiants de morceaux Deezer, avec titre, artiste et variantes acceptées (`music.titleAliases`, `artistAliases`). `npm run music:lookup` les cherche, le développeur les vérifie (`content/music-check/`) ; un blind test non vérifié est exclu du build.
- **Lecture** : en partie, l'app de l'hôte demande à l'API Deezer l'adresse de l'extrait de 30 s (depuis l'app Android seulement : l'API refuse les appels d'un navigateur ; l'adresse expire au bout d'environ 15 min). L'adresse est publiée avec la question, la TV la joue (`receiver/src/lib/tvAudioPlayer.ts`). **Aucun son hébergé par Quiz'in.**
- **Réponses** : titre ou artiste, avec variantes, jugés par `shared/answerMatching.ts` ; Contrôle de l'hôte en option.

### Avec la même technique
Faisable sans héberger de son :
- L'hôte cherche dans le catalogue Deezer depuis l'app, choisit 10 morceaux.
- On enregistre seulement l'identifiant, le titre et l'artiste, sur le téléphone (comme le quiz perso).
- Variantes acceptées tirées d'un titre nettoyé automatiquement (« feat. », « Remastered », parenthèses).
- Morceaux explicites exclus grâce à l'indicateur fourni par Deezer.

### Coût : 4 à 5 jours en plus du quiz perso (7 à 8 jours seul)
| Tâche | Jours |
|---|---|
| Recherche et choix des morceaux | 2 |
| Nettoyage des titres | 0,5 |
| Intégration à l'éditeur | 1 |
| Tests | 1 |

Écouter un extrait sur le téléphone avant de le choisir demande une bibliothèque audio native (l'app n'en a pas), donc un build EAS. Sans écoute, l'hôte choisit sur le titre seul.

### Risques
- **Conditions d'utilisation de Deezer** : point bloquant. On attend déjà leur réponse écrite pour le blind test actuel ; laisser chercher dans tout le catalogue est un usage différent, à leur demander explicitement.
- **Stockage** : des identifiants seulement, négligeable.
- **Modération** : l'hôte choisit pour sa soirée ; filtre des morceaux explicites et des mots interdits sur la TV.

### Questions à poser à Deezer
1. Les utilisateurs peuvent-ils chercher dans le catalogue et composer leurs propres blind tests ?
2. Les extraits peuvent-ils être joués en groupe, sur une TV via le Cast ?
3. Peut-on garder les identifiants des morceaux sur le téléphone ?
4. Quel nombre de requêtes est autorisé (limite exacte inconnue) ?
5. Quelle mention de Deezer faut-il afficher, et où ?
6. L'app est gratuite et non commerciale : ces conditions restent-elles valables si cela change ?

### Héberger des sons fournis par les utilisateurs : déconseillé
- Ce serait de la musique commerciale redistribuée par Quiz'in : responsabilité de droits d'auteur (SACEM).
- Il faudrait modérer chaque fichier envoyé.
- Stockage et bande passante payants.
- Plus lourd pour la TV.
