# Mises à jour de l'app : renseigner `config/appVersion`

Procédure pour Loann. Règles du jeu : spec, section 21.

**État au 4 novembre 2026 :** nœud vide en production, donc rien ne s'affiche. Les règles déployées autorisent déjà
sa lecture (vérifié sur la production : 401 sans connexion, 200 avec la connexion anonyme de l'app). Aucune règle
à déployer. Seule la console Firebase peut écrire ce nœud.

**Seules les versions à partir de la 1.2.3 lisent ce nœud.** Les 1.2.2 et plus anciennes ne verront jamais ni la
feuille ni l'écran, quelles que soient les valeurs. La feuille ne servira donc vraiment qu'à la sortie de la 1.2.4,
pour les téléphones en 1.2.3.

## Ce que fait l'app

Une lecture de `config/appVersion/android` (ou `ios`) par lancement, sur l'accueil seulement (jamais en partie, au
salon, à l'écran de fin, ni sur le site des joueurs), comparée à `version` de `app/app.json` :

| Version de l'app | Ce qui s'affiche |
| --- | --- |
| égale ou plus récente que `latest` | rien |
| plus ancienne que `latest` | feuille « Une mise à jour est disponible » (« Mettre à jour », « Plus tard ») : une fois par jour au plus, trois fois au plus par valeur de `latest` |
| plus ancienne que `minimum` | **écran bloquant** « Mise à jour nécessaire », avec seulement « Mettre à jour » |

Hors ligne, lecture de plus de 5 s, `enabled` différent de `true`, version mal écrite, `minimum` au-dessus de
`latest`, ou adresse hors de `https://play.google.com/` (Android) ou `https://apps.apple.com/` (iOS) : **rien ne
s'affiche, rien n'est bloqué.**

## Saisir les valeurs sans casser le reste

Realtime Database → nœud `config` → ajouter ou modifier **l'enfant** `appVersion`.

- **Jamais d'import JSON sur `/config`, ni à la racine** : l'import remplace tout le nœud. Il effacerait
  `blindTestV2Enabled`, `blindTestEnabled`, `drawEnabled` et `statsEnabled`. Un import n'est acceptable que sur le
  chemin exact `/config/appVersion`, et remplace alors les deux plateformes.
- Versions en texte (`"1.2.3"`), `enabled` en booléen (`true`, sans guillemets).

## Première fois, après la publication de la 1.2.3

Attendre que la 1.2.3 soit **en ligne et proposée** sur le store concerné, puis, pour chaque plateforme publiée :

```json
{
  "android": {
    "latest": "1.2.3",
    "minimum": "1.0.0",
    "storeUrl": "https://play.google.com/store/apps/details?id=com.herocorp.quizin",
    "enabled": true
  },
  "ios": {
    "latest": "1.2.3",
    "minimum": "1.0.0",
    "storeUrl": "https://apps.apple.com/app/id6820975402",
    "enabled": true
  }
}
```

Effet attendu : **aucun message pour personne**, les 1.2.3 étant à jour. Les deux plateformes sont indépendantes :
tant qu'iOS attend l'examen d'Apple, ne créer que `android` (ou laisser `ios` à `enabled: false`).

## Nouvelle version (exemple : 1.2.4)

1. Changer `version` dans `app/app.json`, construire et publier. **Toute version publiée a un nouveau numéro**,
   même un correctif. Le numéro de build (versionCode, build iOS) ne compte pas, EAS le gère seul.
2. Attendre que le store la propose **à tous** : déploiement progressif Android terminé (100 %), iOS en vente et non
   plus en cours d'examen.
3. **Seulement ensuite**, dans la console : `android/latest` → `"1.2.4"`. Les plateformes se traitent séparément.

Monter `latest` trop tôt envoie les joueurs sur une fiche qui ne propose rien, et consomme leurs trois rappels pour
cette version.

## `minimum` : la seule valeur qui peut bloquer quelqu'un

**Par défaut, ne pas y toucher : `"1.0.0"` ne bloque personne.** Pour inciter à mettre à jour, `latest` suffit.

Ne la monter que si une ancienne version ne peut plus jouer (format de partie ou règles devenus incompatibles). Avant
d'enregistrer, vérifier les quatre points :

1. **La version est disponible à tous sur ce store.** Sinon, les joueurs sont bloqués sans issue. Une valeur
   au-dessus de la version en ligne bloque tout le monde.
2. **Bonne plateforme** : Android et iOS ne sont pas forcément à la même version. Ne jamais recopier la valeur de
   l'une sur l'autre sans vérifier sa fiche.
3. **`minimum` ≤ `latest`** : sinon la configuration entière est ignorée (rien ne bloque, mais rien ne s'affiche).
4. **`storeUrl` s'ouvre** depuis un téléphone, sur la bonne fiche : c'est le seul bouton de l'écran bloquant.

Une partie en cours n'est jamais interrompue : le contrôle se fait à l'accueil. Mais l'hôte bloqué ne peut plus en
créer ni rejoindre depuis l'app ; les joueurs sur le site web ne sont pas concernés.

## En cas d'erreur

- Passer `android/enabled` (ou `ios/enabled`) à `false`, ou supprimer `config/appVersion`.
- L'effet arrive **au prochain lancement** : l'app lit une seule fois. Un téléphone bloqué doit fermer l'app (la
  retirer des apps récentes) et la rouvrir. Rien n'est gardé sur le téléphone pour l'écran bloquant : il se débloque
  dès que la lecture ne le demande plus.

## Tester

**Jamais sur la production une fois une 1.2.3 publiée** : `latest` ou `minimum` au-dessus de 1.2.3 toucheraient les
vrais joueurs dès leur lancement suivant. Deux possibilités :

- `/debug/update` (build de développement) : les écrans seuls, sans base.
- Le projet Firebase de test (`docs/test-hors-production.md`), avec le build de développement relié à Metro :
  1. `android` avec `latest: "1.2.4"`, `minimum: "1.0.0"`, `storeUrl` ci-dessus, `enabled: true`.
  2. Fermer complètement l'app, la rouvrir : la feuille apparaît.
  3. « Plus tard », fermer, rouvrir : plus rien ce jour-là. Pour la revoir : `latest` à `"1.2.5"` (nouvelle valeur,
     compte remis à zéro).
  4. `minimum: "1.2.4"` : l'écran bloquant ; « Mettre à jour » ouvre le Play Store.
  5. `enabled: false`, fermer, rouvrir : l'accueil revient.
  6. Mode avion, rouvrir : l'accueil normal.
