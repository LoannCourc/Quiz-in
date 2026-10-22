# Statistiques d'usage anonymes

Compteurs agrégés écrits par l'app de l'hôte dans la Realtime Database (`/stats`), lus sur une page privée
(cible Hosting `admin`). Aucun SDK d'analytics, aucun enregistrement par partie, rien qui permette de retrouver une
personne, un appareil ou une partie.

- Logique : `shared/stats.ts` (chemins de chaque événement, garde anti-double-compte, interrupteur), testée par
  `tests/unit/stats.test.ts`.
- Envoi : `app/src/lib/stats.ts`, appelé par `launchGame` et `runTransition` (`app/src/lib/hostGame.ts`).
- Règles : nœud `stats` de `database.rules.json`, testées par `tests/rules/rules.test.ts` (bloc « Statistiques »).
- Page : `admin/` (`public/` servi tel quel, calculs dans `public/statsView.js`, testés par
  `tests/unit/adminStatsView.test.ts`).

## Arbre `/stats`

Chaque feuille est un nombre, augmenté de 1 à la fois.

```
/stats
  modes/{quiz|bluff|draw}/started              parties démarrées
  modes/{quiz|bluff|draw}/completed            parties terminées (fin normale, après la dernière question)
  modes/{quiz|bluff|draw}/reached/{0..29}      parties arrivées à la question (ou manche) i
  quizzes/{quizId}/started, completed          quiz fixe (quizId doit exister dans /quizzes)
  pools/{themes|mix}/started, completed        partie tirée dans des thèmes (Quiz) ou un mélange (Bluff)
  playerCounts/{1..20}                         parties lancées avec N joueurs connectés (hôte compris s'il joue)
  questions/{quizId}/{questionId}/answered     réponses données à la question
  questions/{quizId}/{questionId}/correct      bonnes réponses
  daily/{AAAA-MM-JJ}/started, completed        par jour (UTC, heure du serveur)
```

Taille : environ 50 Ko pour 1 200 questions, quelques Ko pour le reste, environ 15 Ko par an pour les jours.

## Ce que l'app envoie

| Événement | Compteurs augmentés de 1 |
|---|---|
| Lancement | `modes/{jeu}/started`, `daily/{jour}/started`, `playerCounts/{N}` ; à part : `quizzes/{quizId}/started` ou `pools/{themes\|mix}/started` (Dessine-moi : ni l'un ni l'autre) |
| Question ou manche n° i affichée | `modes/{jeu}/reached/{i}` |
| Révélation (Quiz, Bluff) | une écriture par réponse donnée : `questions/{quizId}/{questionId}/answered`, et `…/correct` si elle est bonne. Bluff : réponse = vote, bonne = vote pour la vraie réponse. Partie tirée : la question compte dans son vrai quiz. |
| Fin normale | `modes/{jeu}/completed`, `daily/{jour}/completed` ; à part : `quizzes/{quizId}/completed` ou `pools/{…}/completed` |

- **Jamais** : uid, prénom, avatar, code de partie, identifiant d'appareil, texte d'une réponse, heure précise.
  L'adresse IP et le jeton anonyme accompagnent la requête comme toute écriture de l'app ; ils ne sont pas stockés.
- **Blind test** : jamais compté.
- **Abandons** : aucune écriture au départ de l'hôte. Les parties abandonnées se lisent dans la courbe `reached`
  (arrivées à la question i moins arrivées à la question i + 1). « Terminer la partie » avant la fin compte donc
  comme un abandon. Le nettoyage planifié ne compte rien.
- **Jamais en développement** (`__DEV__` : build de développement, écrans `/debug`) : seules les builds publiées
  (preview, production) écrivent.
- **Doubles comptes** : chaque événement est compté une seule fois par partie (garde en mémoire) ; Changer de jeu
  ouvre une nouvelle partie ; après une relance de l'app, la partie reprise compte à part.
- **Sans attente** : un échec (réseau, refus) est ignoré, le jeu n'attend jamais.
- **Limite** : les règles n'acceptent que + 1, mais n'importe quel utilisateur connecté peut en envoyer à volonté.
  Les chiffres sont indicatifs.

## Couper les statistiques

Console Firebase → Realtime Database → Données → `config` → ajouter `statsEnabled` : `false` (booléen). L'app le
lit au lancement de chaque partie : plus rien n'est écrit, sans nouvelle build. Pour les rétablir : `true`, ou
supprimer la clé. Si la lecture échoue (réseau), l'app écrit comme d'habitude.

## Accès à la page : liste `admins/{uid}`

La lecture de `/stats` est réservée aux comptes listés dans `admins` (`admins/{uid}` : `true`). Ce nœud n'est ni
lisible ni modifiable depuis une app ou une page : seulement depuis la console. Aucun uid ni mot de passe dans le
dépôt.

Créer le compte (une fois) :

1. Console Firebase → Authentication → Sign-in method → « Adresse e-mail/Mot de passe » → activer → Enregistrer.
2. Authentication → Users → « Ajouter un utilisateur » : ton e-mail et un mot de passe fort (gardé dans ton
   gestionnaire de mots de passe).
3. Copier l'**UID de l'utilisateur** affiché dans la liste.
4. Realtime Database → Données → à la racine, ajouter `admins`, puis dans `admins` la clé `<UID copié>` avec la
   valeur `true` (booléen, pas le texte « true »).

N'importe qui peut créer un compte e-mail sur le projet une fois l'option activée : sans entrée dans `admins`, ce
compte ne lit rien (la page affiche « Accès refusé »). Retirer un accès : supprimer sa clé dans `admins`.

## Page d'administration

- Adresse : `https://quizin-admin.web.app` (site Hosting `quizin-admin`, cible `admin`). Aucun lien depuis les
  autres sites ; `noindex` (balise et en-tête `X-Robots-Tag`), `robots.txt` qui bloque tout, politique de sécurité
  stricte (`firebase.json`) : scripts de la page et de `www.gstatic.com` seulement, connexions vers la base et
  l'authentification Firebase seulement.
- Sans dépendance npm : SDK Firebase 12.19.0 (version de l'app) chargé depuis gstatic, configuration lue sur
  `/__/firebase/init.json` (servie par Firebase Hosting pour le projet ; aucune clé dans le dépôt).
- Lecture : `/stats`, puis le titre des quiz concernés (`quizzes/{id}/title`) et les questions des quiz affichés
  dans les classements de questions. Rien n'est écrit.
- Contenu : totaux et taux de parties terminées, jeux et quiz les plus joués, courbe d'abandon par jeu, nombre de
  joueurs, questions les plus dures et les plus faciles (au moins 20 réponses, réglable), tendance des 30 derniers
  jours (UTC).

### Essai local (émulateurs, données fictives)

Dans trois terminaux, à la racine du dépôt :

```
firebase emulators:start --only database,auth --project demo-quiz-in
npm --prefix admin run demo-data
npm --prefix admin run serve
```

Puis `http://localhost:5181` : compte `admin@demo.test` / `demo-admin-123` (accès), `visiteur@demo.test` /
`demo-visiteur-123` (accès refusé). En local, la page se branche sur les émulateurs (bandeau « Émulateur local »).
`demo-data` n'écrit que sur `127.0.0.1` dans le projet fictif `demo-quiz-in` (adresses écrites en dur, sans option) ;
il reprend les titres de `content/import/` s'ils ont été générés (`npm run build` dans `content/`). L'émulateur
n'applique `database.rules.json` qu'à l'espace de noms `demo-quiz-in-default-rtdb`, celui qu'utilisent la page et
le script.

### Mise en ligne (c'est le développeur qui déploie)

Une seule fois :

```
firebase hosting:sites:create quizin-admin
firebase target:apply hosting admin quizin-admin
```

Puis, après chaque modification de la page : `firebase deploy --only hosting:admin`. Les règles (`firebase deploy
--only database`) doivent être déployées avant.
