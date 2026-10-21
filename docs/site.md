# Site vitrine Quiz'in

Site statique de présentation (accueil, aide, pages légales), en français et en anglais. Dossier `site/`, sans
dépendance npm : un script Node génère les pages HTML.

- Adresse actuelle : https://quizin-site.web.app (site Firebase Hosting `quizin-site`, cible `site`).
- Domaine prévu : `quizin-app.com` (OVH), voir « Relier le domaine » plus bas.
- Aucune autre adresse ne change : TV `quiz-in-7dbd6.web.app`, joueurs `quizin-play.web.app`.

## Commandes (dans `site/`)

- `npm run build` : génère `site/dist/` (ignoré par Git).
- `npm run check` : construit, puis vérifie que toutes les langues ont les mêmes clés, que les liens et ancres internes
  existent, que `data/games.json` est complet, et liste les marqueurs à compléter.
- `npm run serve` : aperçu local sur http://localhost:5180 (mêmes adresses que Firebase : `/aide` sert `aide.html`).

## Où modifier quoi

| Quoi | Fichier |
|---|---|
| Adresse du site, indexation, langues, e-mail, liens des stores, blind test | `site/config.json` |
| Tous les textes et les adresses des pages d'une langue | `site/i18n/fr.json`, `site/i18n/en.json` |
| Jeux affichés | `site/data/games.json` |
| Mise en page | `site/src/templates/*.mjs`, styles `site/src/assets/site.css` |
| Images, polices, icônes | `site/src/assets/` |

- **Ajouter une langue** : copier `i18n/en.json` en `i18n/xx.json`, traduire, changer `lang`, `locale`, `label` et les
  `paths` (préfixe `/xx/`), puis ajouter `"xx"` à `languages` dans `config.json`. Le build crée les pages, le lien de
  bascule et les balises hreflang. Image de partage : `src/assets/og-image-xx.jpg` (1200×630).
- **Ajouter un jeu** : une entrée dans `data/games.json` (id, visible, couleurs, motif, nom et description dans chaque
  langue). Un nouveau dessin de carte s'ajoute dans `src/templates/motifs.mjs`.
- **Blind test** : caché tant que `showBlindTest` vaut `false` (pas avant l'accord de Deezer et la validation des stores).
- **Liens des stores** : `storeLinks.googlePlay` et `storeLinks.appStore`. Tant qu'ils valent `null`, les boutons
  disent « Bientôt sur » et mènent à `/bientot`. À la publication : mettre les liens et remplacer les boutons par les
  badges officiels de Google et d'Apple.
- **Date de mise à jour des pages légales** : `legalUpdated` dans `config.json` (`"2026-11-03"` → « 3 novembre 2026 »
  et « November 3, 2026 » sur les trois pages). Tant qu'elle vaut `null`, les pages affichent `[DATE À COMPLÉTER]` et
  le build la compte comme un marqueur.
- **Textes légaux** : dans `legal` des fichiers de langue. Les marqueurs `[À COMPLÉTER]`, `[À VÉRIFIER]`, `[TO FILL IN]`,
  `[TO CHECK]` et `[DATE …]` sont listés par `npm run check`.

## Indexation

- `indexable: false` (tant que le domaine n'est pas relié) : balise `noindex` sur chaque page, pas de `sitemap.xml`.
- `indexable: true` : plus de `noindex`, `sitemap.xml` généré. **Le build échoue** s'il reste un marqueur à compléter.
- Adresse canonique, hreflang et Open Graph sont construits à partir de `siteUrl`.

## Langue

- `/` en français, `/en/` en anglais ; chaque page a son équivalent (`paths` des fichiers de langue).
- Première visite de `/` : le script `assets/lang.js` (généré) envoie vers la langue du navigateur (`location.replace`),
  sauf pour les robots connus et si un choix est mémorisé.
- Bascule FR | EN : mémorisée dans le navigateur (`localStorage`, clé `quizin-site:lang`). Aucun cookie.

## Déploiement (c'est le développeur qui déploie)

```
firebase deploy --only hosting:site
```

Le build se lance seul avant l'envoi (`predeploy`). Jamais `firebase deploy` sans `--only`.

La cible `site` doit pointer vers le seul site `quizin-site` dans `.firebaserc` (vérifier avec `firebase target`) ;
sinon : `firebase target:clear hosting site`, puis `firebase target:apply hosting site quizin-site`.

## Relier le domaine quizin-app.com (au moment venu)

Les valeurs exactes (texte de vérification, adresses IP) sont affichées par la console Firebase : les recopier telles
quelles, ne pas les reprendre d'un autre projet.

1. Acheter `quizin-app.com` chez OVH.
2. Console Firebase → Hosting → site `quizin-site` → « Ajouter un domaine personnalisé » → `quizin-app.com`
   (sans cocher la redirection). Firebase affiche les enregistrements DNS à créer (TXT de vérification, A).
3. OVH → Web Cloud → Noms de domaine → `quizin-app.com` → Zone DNS :
   - supprimer les enregistrements A, AAAA et CNAME créés par défaut par OVH sur le domaine nu (`@`) et sur `www` ;
   - ajouter l'enregistrement TXT et les enregistrements A indiqués par Firebase.
4. Revenir dans Firebase et lancer la vérification. La propagation DNS et le certificat HTTPS prennent de quelques
   minutes à 24 heures.
5. Ajouter un second domaine `www.quizin-app.com`, en cochant « Rediriger vers un domaine existant » →
   `quizin-app.com`. Créer chez OVH l'enregistrement demandé pour `www`.
6. Dans `site/config.json` : `siteUrl` → `https://quizin-app.com`. Quand les textes légaux sont complets :
   `indexable` → `true`. Puis `firebase deploy --only hosting:site`.
7. Vérifier : `https://quizin-app.com`, `https://www.quizin-app.com` (redirigé), `/en/`, `/legal/confidentialite`,
   et l'aperçu de partage (image et titre) dans une messagerie.

`quizin-site.web.app` reste accessible ensuite ; l'adresse canonique indique aux moteurs de recherche la version à garder.

## Images

L'image de partage (`og-image-fr.jpg`, `og-image-en.jpg`, 1200×630) et `apple-touch-icon.png` (180×180, depuis
`app/assets/images/icon-ios.png`) ont été produites avec Chrome sans fenêtre à partir de l'illustration du hero. Le
script de génération n'est pas dans le dépôt : en cas de changement, refaire une capture 1200×630 de même composition.
