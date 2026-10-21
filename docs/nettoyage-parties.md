# Nettoyage des parties de plus de 24 h

Les parties (`sessions/{code}`) dont la date de création `createdAt` a plus de 24 heures sont supprimées chaque heure par
un workflow GitHub Actions, avec tout leur contenu (joueurs, réponses, dessins).

- Règle : `createdAt` est écrit par l'app à la création (heure du serveur), impossible à modifier ou à effacer, non
  public ; index `.indexOn: ["createdAt"]` sur `sessions` (`database.rules.json`, tests dans `tests/rules/`).
- Script : `scripts/cleanup-sessions.mjs` (`firebase-admin`, version exacte et fichier de verrouillage dans `scripts/`).
  Simulation par défaut, suppression avec `--apply`. Ne touche jamais une partie sans `createdAt`.
- Workflow : `.github/workflows/cleanup-sessions.yml`, toutes les heures à hh:17 (suppression) et à la main depuis
  l'onglet Actions (simulation, sauf si la case « Supprimer vraiment » est cochée). Permissions `contents: read`,
  aucun déclencheur sur pull request ni push.
- Journaux publics (dépôt public) : seulement le nombre de parties, leur âge, leur état et un code masqué (« K7·· »).

## Mise en service (dans cet ordre)

1. Tests des règles (`npm test` dans `tests/rules/`), puis `firebase deploy --only database`.
2. Build et publication de l'app qui écrit `createdAt`.
3. Console Firebase → Realtime Database → `sessions` : supprimer à la main les parties sans `createdAt` (créées avant
   cette version, ou par une ancienne version de l'app). Le script ne les touche jamais.
4. Pousser le workflow sur la branche par défaut (GitHub ne lance un workflow planifié que depuis elle).
5. Créer le compte de service et la clé (ci-dessous), puis le secret et la variable GitHub.
6. Lancer une simulation, puis une exécution réelle (ci-dessous). Les exécutions de chaque heure prennent le relais.
7. Retirer le marqueur [À VÉRIFIER] du nettoyage dans la politique de confidentialité (`site/i18n/*.json`).

## Compte de service et clé

1. Google Cloud Console (console.cloud.google.com) → projet `quiz-in-7dbd6` → IAM et administration → Comptes de
   service → « Créer un compte de service ». Nom : `quizin-cleanup`. Rôle : uniquement « Administrateur Firebase
   Realtime Database » (`roles/firebasedatabase.admin`). Aucun autre rôle.
2. Ouvrir le compte → onglet Clés → Ajouter une clé → Créer une clé → JSON. Le fichier se télécharge.
3. GitHub → dépôt → Settings → Secrets and variables → Actions :
   - onglet Secrets → New repository secret : nom `FIREBASE_SERVICE_ACCOUNT`, valeur : tout le contenu du fichier JSON ;
   - onglet Variables → New repository variable : nom `FIREBASE_DATABASE_URL`, valeur :
     `https://quiz-in-7dbd6-default-rtdb.europe-west1.firebasedatabase.app`.
4. Supprimer le fichier JSON du PC. Ne jamais le copier dans le dossier du dépôt.

## Premières exécutions

1. GitHub → onglet Actions → « Nettoyage des parties » → Run workflow, case « Supprimer vraiment » décochée.
   Le journal de l'étape « Nettoyage » indique le nombre de parties qui seraient supprimées. Une erreur de permission
   ici : le rôle ne suffit pas pour lire (le signaler avant toute autre action).
2. Relancer avec la case cochée, puis vérifier dans la console que les parties de plus de 24 h ont disparu.
3. Un avertissement « Using an unspecified index » dans le journal signale que les règles avec l'index ne sont pas
   déployées.

## Révoquer ou changer la clé

- Révoquer : Cloud Console → Comptes de service → `quizin-cleanup` → Clés → supprimer la clé (effet immédiat, le
  workflow échoue à l'exécution suivante).
- Tout couper : désactiver ou supprimer le compte de service, supprimer le secret GitHub, désactiver le workflow
  (onglet Actions → le workflow → « … » → Disable workflow).
- Changer de clé : créer une nouvelle clé, mettre à jour le secret, puis supprimer l'ancienne clé.

## Limites

- Durée réelle : entre 24 h et environ 25 h ; GitHub peut retarder une exécution planifiée en période de forte charge,
  voire l'abandonner (l'exécution suivante rattrape). Dans la politique : « environ 24 heures ».
- 2 000 parties au plus par exécution (20 lots de 100) ; le reste part à l'exécution suivante.
- Dépôt public : GitHub désactive les workflows planifiés après 60 jours sans activité sur le dépôt. Les réactiver dans
  l'onglet Actions → le workflow → Enable workflow.
- Une partie restée ouverte plus de 24 h serait supprimée en cours de route.
- Coût : exécuteurs GitHub gratuits pour un dépôt public ; la Realtime Database facture le volume téléchargé (une
  partie ancienne est lue en entière avant suppression, très loin des 10 Go par mois du forfait gratuit).
