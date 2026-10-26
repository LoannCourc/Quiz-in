# Mises à jour de l'app : popup « Une mise à jour est disponible »

Procédure pour le développeur. Règles du jeu : spec, section 21.

## Ce que fait l'app

À chaque lancement, sur l'accueil seulement (jamais pendant une partie, au salon, à l'écran de fin, ni sur le
site des joueurs), l'app lit `config/appVersion/android` (ou `ios`) et compare **sa version** (`version` de
`app/app.json`, par exemple `1.1.0`) aux valeurs saisies :

| Version de l'app | Ce qui s'affiche |
| --- | --- |
| égale ou plus récente que `latest` | rien |
| plus ancienne que `latest` | feuille « Une mise à jour est disponible » (« Mettre à jour », « Plus tard ») : au plus une fois par jour, trois fois au plus par valeur de `latest` |
| plus ancienne que `minimum` | écran « Mise à jour nécessaire » à la place de l'accueil, avec seulement « Mettre à jour » |

Lecture impossible, hors ligne, `enabled` différent de `true`, valeurs invalides (version mal écrite,
`minimum` plus récente que `latest`, adresse hors de `https://play.google.com/` ou `https://apps.apple.com/`) :
**rien ne s'affiche**, rien n'est bloqué.

## Numéro de version : à changer à chaque publication

- L'app compare `version` de `app/app.json` (lue par `Constants.expoConfig.version`). **Toute version publiée
  sur un store doit avoir un nouveau numéro**, même un simple correctif : `1.1.0` devient `1.1.1`. Sinon le
  popup ne voit pas la différence.
- Le versionCode Android (et le numéro de build iOS) n'y est **pas lié** : EAS le gère seul
  (`appVersionSource: "remote"` et `autoIncrement` dans `app/eas.json`). Il augmente à chaque build de
  production, que `version` change ou non. Seul `version` compte pour le popup ; c'est aussi le « nom de
  version » affiché par le Play Store.

## Valeurs dans la console Firebase

Realtime Database → nœud `config` → ajouter l'enfant `appVersion` (ou le modifier). Saisir les valeurs **en
texte** pour les versions (`"1.1.0"`, avec les guillemets dans l'import JSON), et `true` / `false` (booléen)
pour `enabled`. Aucune règle d'écriture : seule la console peut modifier ce nœud.

### À la sortie publique de la 1.1.0

```json
{
  "android": {
    "latest": "1.1.0",
    "minimum": "1.0.0",
    "storeUrl": "https://play.google.com/store/apps/details?id=com.herocorp.quizin",
    "enabled": true
  },
  "ios": {
    "latest": "1.1.0",
    "minimum": "1.0.0",
    "storeUrl": "https://apps.apple.com/app/id6820975402",
    "enabled": false
  }
}
```

`latest` vaut la version publiée : **aucun popup pour les premiers utilisateurs**. iOS reste à
`enabled: false` tant que la fiche App Store n'est pas publique.

## Ordre à respecter pour une nouvelle version (exemple : 1.1.1)

1. Changer `version` dans `app/app.json` (`1.1.0` → `1.1.1`), faire le build de production, le publier.
2. Attendre que la version soit **en ligne et visible** sur le store (la fiche affiche « 1.1.1 »).
3. **Seulement ensuite**, dans la console : `android/latest` → `"1.1.1"`. Les téléphones en 1.1.0 verront la
   feuille au prochain lancement de l'app.

Monter `latest` avant que la version soit en ligne enverrait les joueurs sur une fiche qui ne propose pas
encore la mise à jour.

## `minimum` : seulement pour un changement du protocole de partie

- `minimum` bloque l'app (écran obligatoire). À monter **uniquement** quand une ancienne version ne peut plus
  jouer avec les nouvelles (format de partie changé, règles de la base incompatibles…), **jamais pour pousser**
  une mise à jour : pour ça, `latest` suffit.
- **Jamais** une valeur de `minimum` qui n'est pas déjà en ligne sur le store : les joueurs seraient bloqués
  sans pouvoir se mettre à jour.
- `minimum` doit toujours être inférieure ou égale à `latest` (sinon la config est ignorée).
- Une partie déjà en cours n'est jamais interrompue : le contrôle se fait à l'accueil, au lancement.

## Tester sur un téléphone (build preview)

1. Console : `android` avec `latest: "1.2.0"`, `minimum: "1.0.0"`, `storeUrl` ci-dessus, `enabled: true`.
2. Fermer complètement l'app (la retirer des apps récentes), la rouvrir : la feuille apparaît.
3. « Plus tard », fermer et rouvrir l'app : plus rien ce jour-là. Pour la revoir tout de suite : passer
   `latest` à `"1.2.1"` (nouvelle valeur, compte remis à zéro).
4. `minimum: "1.2.0"` : l'écran « Mise à jour nécessaire » s'affiche ; « Mettre à jour » ouvre le Play Store.
5. Mode avion, puis rouvrir l'app : rien, l'accueil s'affiche normalement.
6. Remettre les valeurs de la sortie (ci-dessus) à la fin du test.

## En cas d'erreur

- Le plus rapide : `android/enabled` → `false`. Plus rien ne s'affiche au prochain lancement de l'app.
- Ou supprimer le nœud `config/appVersion` : même effet.
- Une valeur mal saisie (version illisible, `minimum` au-dessus de `latest`, autre adresse) est ignorée par
  l'app : rien ne s'affiche, rien n'est bloqué.
