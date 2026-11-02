# Tester le nouveau contenu sans la production

Objectif : jouer de vraies parties avec les 50 blind tests (nouveau contenu, nouveau code, `config/blindTestV2Enabled`
ouvert) sans rien importer ni modifier dans le projet de production `quiz-in-7dbd6`.

## Méthode retenue : un projet Firebase de test

| Méthode | Pour | Contre |
|---|---|---|
| **Projet Firebase de test** (retenue) | vraie base, vraies règles, vraie connexion anonyme, plusieurs vrais téléphones, son Deezer réel ; aucun code à changer | projet à créer dans la console (5 min) ; pas de Cast (voir plus bas) |
| Émulateur Firebase | rien à créer | l'app hôte et le site des joueurs ne savent pas s'y brancher (seule la TV le sait) : code à ajouter ; téléphones à relier au PC (émulateur ouvert sur le réseau local) ; données perdues à l'arrêt |
| Réglage local dans le build de développement | — | impossible sans importer le nouveau contenu en production : exclu |

Le projet de test est isolé : ses clés ne servent qu'à lui, son contenu et son interrupteur `blindTestV2Enabled` n'ont
aucun effet sur la production. Coût : gratuit (offre Spark), largement suffisant.

## Ce que ça implique

| Écran | En test | Pourquoi |
|---|---|---|
| **Téléphone de l'hôte** | build de développement déjà installé (APK « Quiz'in »), relié à Metro sur le PC ; le code JS vient du PC, donc le nouveau code | `app/.env.development.local` remplace les clés de `app/.env`, seulement pour `npx expo start` |
| **TV** | navigateur du PC (plan B) branché en HDMI, ou onglet Chrome casté sur la TV : `http://localhost:5173/?code=CODE` | le bouton Cast de l'app ouvre le récepteur publié (`quiz-in-7dbd6.web.app`), branché sur la base de production : la partie de test y serait introuvable. **Ne pas utiliser le bouton Cast pendant le test.** |
| **Téléphones des joueurs** | navigateur sur le site des joueurs servi par le PC : `http://IP-DU-PC:8081/join/CODE` (même Wi-Fi), adresse tapée à la main | le QR code et le lien « Partager » de l'app pointent vers `quizin-play.web.app` (production) : ne pas les utiliser |
| **Son des blind tests** | joué par la TV (onglet du navigateur), extraits Deezer réels ; cliquer une fois sur le bandeau du plan B pour autoriser le son | l'hôte récupère les adresses d'extrait chez Deezer depuis le téléphone, comme en production |
| **Statistiques** | aucune écriture (`__DEV__`) | — |

Le build de développement contient-il tout le code natif du nouveau code ? Oui : cette branche n'ajoute aucune
dépendance native (react-native-svg et expo-screen-orientation sont déjà dans l'APK 6). Rien à reconstruire.

## Préparation (fait)

- `scripts/test-project/seed.mjs` : importe `content/import/quizzes.json` sur `/quizzes`, `questions.json` sur
  `/questions` et met `/config/blindTestV2Enabled` à `true`, **dans le projet de test seulement** ; refuse
  `quiz-in-7dbd6` et `default` ; sans `--execute`, affiche les commandes sans rien faire.
- `content/import/` est à jour : 50 blind tests, build réussi.
- Aucune modification de `.firebaserc` n'est nécessaire : le test n'utilise pas l'hébergement du projet de test
  (TV et site des joueurs servis par le PC).

## Pas à pas (à faire par toi)

### 1. Créer le projet de test (console Firebase, une fois)

1. Ajouter un projet, par exemple `quiz-in-test` (sans Google Analytics).
2. Build > Authentication > Commencer > Anonyme : activer.
3. Build > Realtime Database > Créer une base de données : emplacement **europe-west1** (comme la production), démarrer
   en mode verrouillé (les vraies règles arrivent à l'étape 2).
4. Paramètres du projet > Vos applications > Web (`</>`) : enregistrer « Quiz'in test », copier la configuration.

### 2. Règles et contenu (depuis la racine, PowerShell)

```powershell
firebase deploy --only database --project quiz-in-test
node scripts/test-project/seed.mjs quiz-in-test            # vérifier les commandes affichées
node scripts/test-project/seed.mjs quiz-in-test --execute
```

`--project quiz-in-test` est obligatoire sur chaque commande : sans lui, la CLI vise la production (`default`).

### 3. Brancher l'app hôte et le site des joueurs sur le projet de test

Créer `app/.env.development.local` (ignoré par Git) avec la configuration du projet de test :

```
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=quiz-in-test.firebaseapp.com
EXPO_PUBLIC_FIREBASE_DATABASE_URL=https://quiz-in-test-default-rtdb.europe-west1.firebasedatabase.app
EXPO_PUBLIC_FIREBASE_PROJECT_ID=quiz-in-test
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=quiz-in-test.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
```

Expo ne lit ce fichier qu'en développement (`npx expo start`) : ni `npm run export:web` (site des joueurs publié) ni
un build EAS ne le lisent. Puis, dans `app/` :

```powershell
npx expo start --clear          # téléphone de l'hôte : ouvrir l'app « Quiz'in » (build de développement)
npx expo start --web --clear    # site des joueurs sur http://IP-DU-PC:8081 (dans un second terminal si besoin)
```

`--clear` : sinon Metro peut garder en cache les anciennes clés.

### 4. Brancher la TV sur le projet de test

Créer `receiver/.env.test` (ignoré par Git) avec les mêmes valeurs, préfixe `VITE_` (`VITE_FIREBASE_API_KEY`…).
Vite ne le lit qu'avec `--mode test` ; le build publié (`npm run build`) ne le lit jamais. Dans `receiver/` :

```powershell
npm run dev -- --mode test
```

Ouvrir `http://localhost:5173/?code=CODE` dans Chrome sur le PC branché à la TV (ou caster l'onglet).

### 5. Partie de test

Créer une partie de blind test dans l'app (tuile Blind test ouverte : `blindTestV2Enabled` vaut `true` dans le projet
de test), ouvrir la TV avec le code, faire rejoindre les joueurs par `http://IP-DU-PC:8081/join/CODE`. À vérifier : les
trois niveaux (« Facile », « Tous niveaux », « Impossible »), l'affichage « Titre – Artiste », la pastille « Paroles
explicites » (rap US, rap français), le son de chaque question, la réponse libre (alias : « Le Roi Lion » pour un titre
Disney, « Yo Voy A Llegar »).

### 6. Après le test

Supprimer `app/.env.development.local` et `receiver/.env.test` (sinon les prochaines sessions de développement
resteraient sur le projet de test). Le projet de test peut rester pour les prochains tests.

## Garde-fous

- Aucune commande de ce document ne vise `quiz-in-7dbd6` : chacune porte `--project quiz-in-test`.
- `seed.mjs` refuse la production et n'écrit que trois nœuds, jamais la racine.
- Les fichiers de clés de test ne sont lus ni par l'export du site des joueurs, ni par le build de la TV, ni par EAS.
