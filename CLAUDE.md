# Quiz'in

Quiz'in est une application de quiz pour soirées entre amis et en famille. L'hôte choisit un quiz dans l'app Android, l'affiche sur la TV via Google Cast, et les joueurs répondent en silence depuis leur téléphone (navigateur, sans installation) en scannant un QR code.

**Source de vérité : `docs/spec.md`.** Lis-la avant toute fonctionnalité. Si le code et la spec divergent, ou si la spec est ambiguë, pose la question avant de coder. Toute évolution de règle se fait d'abord dans la spec.

## État d'avancement
- Phase 0 (préparation), phase 1 (Expo + Firebase temps réel), phase 2 (récepteur TV) : terminées.
- Phase 3 (joueurs et moteur de partie, choix multiples) : **terminée** : règles de sécurité et tests, rejoindre et lobby joueur, profil, site des joueurs `quizin-play`, catalogue et création de partie, partie jouable (moteur pur `shared/hostEngine.ts`, boucle `useHostEngine`, contrôles de l'hôte, Rejouer, Quitter), direction artistique app et TV, D5 hôte absent (pause, `hostLeftAt` par onDisconnect, suppression après 5 min ; hôte hors ligne : moteur gelé ; joueurs et TV : « En attente de l'hôte… » si la phase est bloquée depuis 5 s). La réponse libre n'est pas encore jouable (lancement refusé).
- Phase 4 (Cast) : **jouable de bout en bout**, testée en famille (hôte Android, joueurs Android et iPhone, box Bouygues).
  - 4.1 mode Cast du récepteur, 4.2 build de développement EAS, 4.3 Cast dans l'app, 4.4 interruptions (arrêt du Cast en pleine question, app tuée puis rouverte) : **terminés**.
  - 4.5 vérifications sur la TV : **en grande partie couvertes** par les tests en famille. Reste à vérifier précisément : confettis dans les marges de sécurité de 5 % (rognés ou non par la TV), lisibilité du QR code à 3 m, performance sur la box (barre de temps, transitions, confettis), lobby et fin de partie au-delà de 12 joueurs (débordent en capture, voir backlog).
  - Récepteur Cast : Application ID `AA4E97E3` (non publié : seuls les appareils de test enregistrés peuvent l'afficher), URL enregistrée `https://quiz-in-7dbd6.web.app/` (sans code ; le site sans `?code=` passe en mode Cast, SDK Google chargé depuis gstatic seulement dans ce mode). Canal `urn:x-cast:com.herocorp.quizin` (`shared/cast.ts`), message JSON `{ "code": "ABCD" }`. TV de test : box Bouygues « Bouygtel 4K » (Android TV), enregistrée « TV Salon », numéro de série WDUU-WSOLO0LCMTEWDNK.
  - App hôte : `react-native-google-cast` 4.9.1 (plugin dans `app.json`, `receiverAppId` `AA4E97E3`, `expandedController: false`). `useCastGame` (un seul appel, écran de partie de l'hôte) envoie `{ code }` à chaque session ouverte ou reprise et met la partie en pause (`pauseUpdate`) quand la session Cast se termine pendant que la partie avance, sauf hors ligne. « Afficher sur la TV » appelle `showCastDialog`, qui exige l'icône Cast native (`TvCastButton`) à l'écran. Code natif isolé du web par des fichiers `.web.ts(x)`. Paquet Android `com.herocorp.quizin`.
  - EAS : profil `development` (APK). EAS utilise npm 10 (Node 22), le PC npm 11 dont le lock est refusé par le `npm ci` de npm 10 : le script `eas-build-pre-install` installe npm 11.6.2 sur EAS (à aligner si npm change sur le PC).
  - Outils : page d'émetteur de test `receiver/cast-sender.html` (`npm run dev` dans `receiver/`, puis `http://localhost:5173/cast-sender.html` dans Chrome ; absente du site déployé). Démos sans Firebase, **en développement seulement** (exclues des bundles publiés : `__DEV__` côté app, `import.meta.env.DEV` côté TV) : `/debug/player?s=<scénario>&capture=1` et `/debug/counter` (app, écrans dans `app/src/debug/`, routes `app/src/app/(host)/debug/` réduites à un aiguillage) et `receiver` sans code `?status=<état>&capture=1&players=20` (`npm run dev`).
  - Plan B sans Cast : `https://quiz-in-7dbd6.web.app/?code=CODE` dans un navigateur plein écran (PC en HDMI). Mise en page proportionnelle à l'écran : identique en 1280×720 et 1920×1080.
- Préparation de la publication : lot 1 (démos exclues des bundles publiés, site des joueurs sans traduction automatique), lot 2 (profil EAS `preview`, APK autonome), lot 3 (icône, écran de démarrage, favicon, icône Cast) : **terminés**, lot 3 testé sur APK preview (partie complète avec Cast, en 4G).
- Identité : le nom reste « Quiz'in ». Logo retenu : variante C (anneau doré, queue rose en diagonale), source `docs/design/logo-1024.png` (icône Cast : `docs/design/cast-icon-512.png`), fond `#170646`.
- **Chantier (a), nouveau catalogue S2 : codé** (lots 1 à 3, à tester sur téléphone). Écran `(host)/index.tsx` et fiche `(host)/quiz/[quizId].tsx`, composants `components/host/catalog/`, rangées et filtres purs dans `shared/catalogRows.ts`. Champs d'affichage des quiz (`description`, `audience`, `poster`, `addedAt`, `featuredRank` pour le Top 10 manuel) : facultatifs à la lecture, obligatoires dans `content/` (sauf `featuredRank`). « Choisir ce quiz » crée la partie avec les réglages par défaut ; « Réglages » ouvre une feuille. Démo avec une douzaine de quiz fictifs : `/debug/catalog` (développement seulement). Après une modification du contenu : `npm run build` dans `content/`, puis réimport de `/quizzes`.
- **Chantier (b), salon simplifié : codé** (à tester sur téléphone). `components/host/lobby/` (`HostLobby` appelé par `(host)/host/[code].tsx`) : `Screen scrollable={false}`, seule la liste des joueurs défile, « Lancer la partie » en pied fixe. Pilule Cast avec l'icône native dedans. Bloc « Rejoindre sans TV » replié par défaut (QR `qrcode-generator` en pur JS dessiné avec des View, lien, copie, partage, plan B). Démo : `/debug/lobby?players=&tv=none|connected|unavailable&host=0|1&notv=0|1` (développement seulement).
- **Prochains chantiers validés, dans cet ordre** (détail : spec 14). **Ne rien coder avant le message dédié du développeur pour chaque chantier.**
  - (c) Plus tard, mode blind test : extraits de 30 s de l'API Deezer (usage gratuit et non commercial, mention de Deezer), source audio interchangeable. En attente de la réponse écrite de Deezer avant toute publication.
  - (d) Publication de l'application Cast.
- Les questions (`questions/`) ne sont lues que par l'hôte (`useGameQuestions`), validées par `shared/quizValidation.ts`.
- Site des joueurs en `lang="fr"` (`web.lang` dans `app.json`) et sans traduction automatique (`translate="no"` et `notranslate` dans le modèle `app/public/index.html`) : la traduction remplaçait « partie » par « fête » et peut casser React.
- Mettre à jour cette section à chaque fin d'étape.
- **Backlog, seulement avec l'accord du développeur** (détail et priorités dans le point d'étape de la phase 4 ; la publication de l'application Cast est passée dans les chantiers validés ci-dessus) : mise en page TV à 13-20 joueurs ; supprimer l'ancien site Hosting `quizin-jouer` ; suppression automatique des parties après 24 h (Cloud Function) ; réponse libre ; nouveau tirage des questions au « Rejouer » ; option « afficher la question sur le téléphone » (spec 13, `QuestionCard` conservé) ; option « pas de classement entre chaque question ».
- **Limites connues** : une partie terminée sans « Quitter » n'est supprimée que si l'hôte s'est déconnecté et qu'un joueur ou la TV est encore ouvert 5 min plus tard. Coupure réseau brutale de l'hôte : le serveur peut mettre jusqu'à environ une minute à la constater (entre-temps, joueurs et TV affichent « En attente de l'hôte… ») ; une transition lancée juste avant que le téléphone de l'hôte détecte la coupure peut encore partir au retour du réseau, la pause appliquée ensuite reste cohérente. Un arrêt du Cast depuis la liste native, la notification ou la TV met aussi la partie en pause (impossible à distinguer d'une coupure).

## Stack
- **App hôte + client joueur web** : Expo (React Native) + TypeScript, routes `expo-router`. Le même code est exporté en web pour les joueurs.
- **Récepteur TV (Google Cast)** : projet web séparé, Vite + React + TypeScript, SDK Cast Web Receiver de Google en mode Cast.
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
- Test sur un téléphone Android avec le build de développement « Quiz'in » (EAS), qui remplace Expo Go depuis le bloc 4.3 (Cast).
- Clés Firebase dans `app/.env` et `receiver/.env` (non versionnés ; modèles `.env.example`).

## Commandes
- Lancer l'app (depuis `app/`) : `npx expo start`, puis ouvrir l'app de développement « Quiz'in » sur le téléphone (Expo Go ne fonctionne plus depuis l'ajout du Cast).
- Build de développement Android (depuis `app/`) : `npx eas-cli build --profile development --platform android`, puis installer l'APK avec le lien ou le QR code donné. À refaire seulement après un ajout ou une mise à jour de dépendance native, une modification de `app.json` (plugins, identifiants, icônes) ou une montée de version d'Expo ; une modification de code TS/TSX se recharge à chaud.
- Build autonome Android (depuis `app/`) : `npx eas-cli build --profile preview --platform android` : APK avec le code intégré, sans PC ni Metro. Variables Firebase lues dans l'environnement EAS « preview » (`app/.env` n'est jamais envoyé) : les envoyer ou les mettre à jour avec `npx eas-cli env:push preview --path .env`, vérifier avec `npx eas-cli env:list preview` (visibilité « plain text » ou « sensitive »). Même identifiant que le build de développement : installer l'un remplace l'autre.
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
- Quand le code lit un nouveau champ public, les règles doivent être déployées (`firebase deploy --only database`) avant de tester dans le navigateur. Après chaque changement de règles : tests d'émulateur, puis déploiement, puis test navigateur.

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
- L'hôte doit garder l'app ouverte au premier plan pendant la partie : le moteur tourne sur son téléphone (écran maintenu allumé de STARTING à END, confirmation avant de quitter l'écran).
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
