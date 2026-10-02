# Quiz'in

Quiz'in est une application de quiz pour soirées entre amis et en famille. L'hôte choisit un quiz dans l'app Android, l'affiche sur la TV via Google Cast, et les joueurs répondent en silence depuis leur téléphone (navigateur, sans installation) en scannant un QR code.

**Source de vérité : `docs/spec.md`.** Lis-la avant toute fonctionnalité. Si le code et la spec divergent, ou si la spec est ambiguë, pose la question avant de coder. Toute évolution de règle se fait d'abord dans la spec.

## État d'avancement
- Phase 0 (préparation), phase 1 (Expo + Firebase temps réel), phase 2 (récepteur TV, déployé) : terminées.
- Phase 3 (joueurs et moteur de partie) : en cours.
  - 3.1 règles de sécurité et leurs tests ; 3.2 rejoindre une partie et lobby joueur ; 3.3 modification du profil dans le lobby ; 3.4 site des joueurs (`quizin-play`) ; 3.5 fondations du moteur côté hôte (catalogue, fiche du quiz, création de partie, lobby hôte) : **terminées**.
  - 3.6 partie jouable en choix multiples, **en cours** :
    - A (l'hôte s'inscrit comme joueur, « Lancer » à 2 joueurs connectés), B (écrans du joueur, composants purs + démo `/debug/player`), C (envoi de la réponse, un seul `update()` multi-chemins) : **terminées**.
    - Ordre suivant, avec validation du développeur entre chaque bloc : **T** (test manuel de C), **DA** (direction artistique, DA1 → DA3), **D** (moteur de l'hôte, D1 → D4).
  - Les questions (`questions/`) ne sont encore lues par aucun écran ; leur validation est prête dans `shared/quizValidation.ts`.
- Mettre à jour cette section à chaque fin d'étape.
- **À faire plus tard, seulement avec l'accord du développeur** : supprimer l'ancien site Hosting `quizin-jouer` une fois `quizin-play` testé ; exclure le code de démo (`/debug/*`, `app/src/debug/`) du bundle publié avant le lancement.

## Stack
- **App hôte + client joueur web** : Expo (React Native) + TypeScript, routes `expo-router`. Le même code est exporté en web pour les joueurs.
- **Récepteur TV (Google Cast)** : projet web séparé, Vite + React + TypeScript (SDK Cast Receiver en phase 4).
- **Backend** : Firebase (Realtime Database, authentification anonyme, Hosting). Projet `quiz-in-7dbd6`.
- **Plateformes MVP** : app hôte Android uniquement. Joueurs via navigateur.

## Structure du dépôt
- `app/` : projet Expo. `src/app/` (routes : `(host)/` écrans de l'hôte, `join/` écrans joueur), `src/components/` (`host/`, `player/`, `ui/` composants communs : `Screen`, `BigButton`, `textStyles`), `src/constants/` (`strings.ts` tous les textes, `appTheme.ts` couleurs et tailles), `src/hooks/`, `src/lib/` (Firebase, création de partie…).
- `receiver/` : récepteur TV (Vite). Mode démo avec panneau de développement en `npm run dev`.
- `shared/` : types, constantes de jeu et logique pure (déroulé, points, classement, validation des réponses et des données), importés via l'alias `@shared/...` (déclaré dans les `tsconfig`, `app/metro.config.js` et `receiver/vite.config.ts`).
- `content/` : quiz sources (`quizzes/*.json`) et script qui génère les fichiers d'import (voir `content/README.md`).
- `tests/unit/` : tests Vitest de `shared/`. `tests/rules/` : tests des règles de sécurité sur l'émulateur.
- `docs/` : spec et maquettes (`design/`). `database.rules.json` : règles de sécurité. `firebase.json` / `.firebaserc` : Hosting et émulateurs.

## Environnement du développeur
- Windows, terminal PowerShell, dossier de travail `C:\dev\quiz-in`. Pas de Python installé.
- Test sur un téléphone Android avec Expo Go (jusqu'à la phase 4, qui demandera un build de développement pour le Cast).
- Clés Firebase dans `app/.env` et `receiver/.env` (non versionnés ; modèles `.env.example`).

## Commandes
- Lancer l'app (depuis `app/`) : `npx expo start`, puis scanner le QR code avec Expo Go.
- Lancer le récepteur TV (depuis `receiver/`) : `npm run dev`, puis ouvrir l'adresse affichée. Session de test à importer : `npm run test-session -- [état] [mode] [durée]`.
- Typage et style (dans `app/` ou `receiver/`) : `npm run typecheck`, `npm run lint`.
- Export web du site des joueurs (dans `app/`) : `npm run export:web` (sortie `app/dist`).
- Tests unitaires (dans `tests/unit/`) : `npm test`.
- Tests des règles (dans `tests/rules/`) : `npm test` (démarre lui-même l'émulateur Database, projet `demo-quiz-in`).
- Émulateurs à la main (à la racine) : `firebase emulators:start` (Database 9000, Auth 9099, interface 4000).
- Génération du contenu (dans `content/`) : `npm run build` → `content/import/quizzes.json` et `questions.json`.

## Déploiement (c'est le développeur qui déploie)
- Ne jamais lancer `firebase deploy` sans `--only`. Toujours une cible précise :
  - `firebase deploy --only hosting:tv` : récepteur TV (`quiz-in-7dbd6.web.app`).
  - `firebase deploy --only hosting:players` : site des joueurs (`quizin-play.web.app`).
  - `firebase deploy --only database` : règles de sécurité.
- Claude propose la commande ; il ne déploie pas lui-même. Les builds se font automatiquement avant le déploiement (`predeploy`).

## Import du contenu dans la console Firebase
- Procédure détaillée : `content/README.md`. Un nœud à la fois : `import/quizzes.json` sur `/quizzes`, puis `import/questions.json` sur `/questions`.
- **Jamais d'import à la racine** de la base : il effacerait les parties en cours et tout le reste. Vérifier le chemin affiché avant d'importer.
- L'import remplace tout le nœud : les fichiers générés contiennent toujours tous les quiz.

## Conventions de code
- TypeScript en mode `strict`. Pas de `any` sans justification en commentaire.
- Identifiants (variables, fonctions, fichiers) en anglais ; commentaires et textes affichés en français.
- Composants React : fichiers en `PascalCase.tsx`. Autres fichiers : `camelCase.ts`.
- Types et constantes utilisés à plusieurs endroits : dans `shared/`.
- Constantes de jeu (durées, `MAX_PLAYERS = 20`, points) : dans `shared/`, jamais écrites en dur dans les composants.
- Tous les textes affichés dans un fichier dédié (`app/src/constants/strings.ts`, `receiver/src/strings.ts`).
- Données lues dans la base : validées avant usage (`shared/quizValidation.ts`) ; entrées invalides ignorées et journalisées en développement seulement.
- Fonctions courtes, nommées pour ce qu'elles font. Pas de code mort ni de commentaire inutile.

## Règles d'architecture et de sécurité (issues de la spec, à ne pas défaire)
- **L'hôte est l'autorité de la partie** : il fait avancer les états, valide les réponses et calcule les points.
- **La bonne réponse n'est jamais publiée avant la révélation.** `currentQuestion` n'accepte que `text`, `options`, `difficulty`, `timeLimit` ; la bonne réponse n'apparaît que dans `reveal`. Le client joueur ne lit jamais `questions/`.
- **`answers` n'est lisible que par l'hôte.** Les autres savent seulement qui a répondu (`answeredBy`), jamais quoi.
- `sessions` n'est jamais lisible en entier ; seul l'hôte lit `sessions/{code}` d'un bloc, les autres lisent champ par champ.
- Un joueur n'écrit que sa propre réponse, et seulement pendant l'état QUESTION.
- Le temps de réponse (option Rapidité) se mesure avec l'horodatage du serveur.
- **Limite connue acceptée au MVP** : le catalogue `questions/` (avec les bonnes réponses) est lisible par tout utilisateur connecté, car n'importe quel utilisateur anonyme peut devenir hôte. Correction possible plus tard via une Cloud Function (spec 7).
- Le récepteur TV est une simple page d'affichage, sans interaction. Il se teste d'abord dans un navigateur, puis sur la vraie TV.
- Animations TV légères (CSS) pour tourner sur de vieux Chromecast.

## Direction artistique « Plateau TV » (validée)
Références : `docs/design/` (maquettes mobile et TV). Esprit plateau de jeu télévisé, festif, presque « too much », fond sombre : le joueur est toujours accaparé par l'écran.
- **Tokens centralisés, jamais de couleur en dur dans un écran** : app → `app/src/constants/appTheme.ts` et `components/ui/` (`Screen`, `BigButton`, `textStyles`) ; récepteur → un `theme.css` de variables CSS.
- **Fond** : dégradé radial `#7a35d9` (haut, centre) → `#3a1280` → `#170646`, identique sur TV.
- **Texte** : `#ffffff` sur fond sombre ; encre `#1b0a45` sur fond clair et dans les pastilles de lettre.
- **Accents** : rose `#ff3d8b`, cyan `#3fe9ff`, or `#ffd23d`, vert `#7dff9a`.
- **Réponses** : A rose `#ff6fa8`, B cyan `#3fe9ff`, C or `#ffd23d`, D vert `#7dff9a`, texte `#1b0a45`. La couleur ne porte jamais seule l'information : toujours la lettre.
- **Polices** : Bowlby One (titres, chiffres, scores) et Nunito 700/800/900 (texte), hébergées localement (aucune dépendance réseau sur la TV). Avatars : emojis.
- **Formes** : pilules (rayon 44 px sur mobile) pour les réponses, cartes arrondies (26 à 34 px), ombre dure décalée `0 7px 0 rgba(0,0,0,.35)`, contour blanc pour la sélection.
- **Règles strictes** :
  - Pas de bandeau d'ampoules, de bordure décorative haut/bas ni de bandeau « scotch » : tout ce qui n'informe pas est supprimé.
  - Titres Bowlby One accentués (RÉPONSE, RÉVÉLATION…) : `line-height` ≥ 1,3 et marge suffisante ; un accent ne touche jamais la ligne du dessus.
  - Un écran = un seul message principal, très gros.
  - TV : animations CSS uniquement (`transform`, `opacity`), pas d'ombre floue ni de `blur`. Confettis : 10 à 15 éléments CSS maximum, seulement à la révélation et à la fin.
  - La DA ne change aucune logique de jeu.

## Règles de travail
Le développeur est expérimenté en gestion de projet et en Unity/C#, mais **débutant en React Native, TypeScript et Firebase**. Sa priorité est de **livrer le MVP** : c'est toi qui écris le code, lui le relit et le teste. Il n'a pas besoin d'un cours, mais doit comprendre ce qui est fait.
- **Avance par petites étapes**, une seule à la fois, et dis ce que tu vas faire avant de le faire.
- **Explique brièvement** (2 à 3 phrases, en français) chaque choix important ou notion nouvelle (état, hook, règle de sécurité Firebase…), pour que le développeur puisse relire et déboguer le code.
- **Demande avant** d'installer une dépendance, de supprimer ou de renommer un fichier, de modifier la configuration Firebase ou ses règles de sécurité, ou de changer la structure du dépôt.
- **Ne devine pas une API.** Pour Expo, Firebase ou le Cast, vérifie la documentation à jour. Si tu n'es pas sûr, dis-le.
- **Après chaque étape qui fonctionne**, vérifie typage, lint (et export web si l'app change), puis propose un message de commit en français. Ne fais pas de `git push` sans demande explicite.
- **Jamais de secrets dans le dépôt** : clés privées, comptes de service, fichiers `.env` (listés dans `.gitignore`).
- Quand une tâche est terminée, résume en 2 ou 3 phrases ce qui a changé et comment le vérifier.
- Respecte le périmètre de la spec : ce qui est P1 ou P2 ne se développe pas avant demande.
