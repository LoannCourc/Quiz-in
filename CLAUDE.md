# Quiz'in

Quiz'in est une application de quiz pour soirées entre amis et en famille. L'hôte choisit un quiz dans l'app Android, l'affiche sur la TV via Google Cast, et les joueurs répondent en silence depuis leur téléphone (navigateur, sans installation) en scannant un QR code.

**Source de vérité : `docs/spec.md`.** Lis-la avant toute fonctionnalité. Si le code et la spec divergent, ou si la spec est ambiguë, pose la question avant de coder. Toute évolution de règle se fait d'abord dans la spec.

## État d'avancement
- Phase 0 (préparation) : terminée.
- Phase 1 (bases React/TypeScript + Firebase) : à venir.
- Mettre à jour cette section à chaque fin de phase.

## Stack
- **App hôte + client joueur web** : Expo (React Native) + TypeScript. Le même code est exporté en web pour les joueurs.
- **Récepteur TV (Google Cast)** : projet web séparé, Vite + TypeScript, avec le SDK Cast Receiver.
- **Backend** : Firebase (Realtime Database, authentification anonyme, Hosting).
- **Plateformes MVP** : app hôte Android uniquement. Joueurs via navigateur.

## Structure du dépôt (prévue, créée au fil des phases)
- `app/` : projet Expo (app hôte et client joueur web).
- `receiver/` : projet Vite du récepteur TV.
- `shared/` : types TypeScript et constantes communs (voir plus bas).
- `docs/` : spec et documentation.

Le partage de `shared/` entre `app/` et `receiver/` (chemin relatif ou workspaces npm) sera décidé en phase 1.

## Environnement du développeur
- Windows, terminal PowerShell, dossier de travail `C:\dev\quiz-in`.
- Test sur un téléphone Android avec Expo Go (jusqu'à la phase 4, qui demandera un build de développement pour le Cast).

## Commandes
À compléter en phase 1, dès que les projets existent. Scripts prévus : lancer l'app, lancer le récepteur, vérifier le typage (`typecheck`), vérifier le style (`lint`).

## Conventions de code
- TypeScript en mode `strict`. Pas de `any` sans justification en commentaire.
- Identifiants (variables, fonctions, fichiers) en anglais ; commentaires et textes affichés en français.
- Composants React : fichiers en `PascalCase.tsx`. Autres fichiers : `camelCase.ts`.
- Types et constantes utilisés à plusieurs endroits : dans `shared/`.
- Constantes de jeu (durées, `MAX_PLAYERS = 20`, points) : dans `shared/`, jamais écrites en dur dans les composants.
- Tous les textes affichés dans un fichier dédié (préparation à la traduction).
- Fonctions courtes, nommées pour ce qu'elles font. Pas de code mort ni de commentaire inutile.

## Règles d'architecture (issues de la spec)
- **L'hôte est l'autorité de la partie** : il fait avancer les états, valide les réponses et calcule les points.
- **La bonne réponse n'est jamais envoyée aux joueurs avant la révélation.** Les questions complètes ne sont lisibles que par l'hôte.
- Un joueur n'écrit que sa propre réponse, et seulement pendant l'état QUESTION.
- Le temps de réponse (option Rapidité) se mesure avec l'horodatage du serveur.
- Le récepteur TV est une simple page d'affichage, sans interaction. Il se teste d'abord dans un navigateur, puis sur la vraie TV.
- Animations TV légères (CSS) pour tourner sur de vieux Chromecast.

## Règles de travail
Le développeur est expérimenté en gestion de projet et en Unity/C#, mais **débutant en React Native, TypeScript et Firebase**.
- **Avance par petites étapes**, une seule à la fois, et dis ce que tu vas faire avant de le faire.
- **Explique toute notion nouvelle** (hook, état, navigation, règle de sécurité Firebase…) en 2 à 3 phrases simples, en français, au moment où elle apparaît.
- **Demande avant** d'installer une dépendance, de supprimer ou de renommer un fichier, de modifier la configuration Firebase ou ses règles de sécurité, ou de changer la structure du dépôt.
- **Ne devine pas une API.** Pour Expo, Firebase ou le Cast, vérifie la documentation à jour. Si tu n'es pas sûr, dis-le.
- **Après chaque étape qui fonctionne**, propose un message de commit en français. Ne fais pas de `git push` sans demande explicite.
- **Jamais de secrets dans le dépôt** : clés privées, comptes de service, fichiers `.env` (à lister dans `.gitignore`).
- Quand une tâche est terminée, résume en 2 ou 3 phrases ce qui a changé et comment le vérifier.
- Respecte le périmètre de la spec : ce qui est P1 ou P2 ne se développe pas avant demande.
