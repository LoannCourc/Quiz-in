# Livraison 1.2.0 (préparation, rien n'est exécuté)

## Version

- `app/app.json` : `"version": "1.1.0"` → **`"1.2.0"`** (nouveauté visible : cœur « Soutenir Quiz'in » ; nouveau code
  des blind tests, fermé tant que `config/blindTestV2Enabled` n'est pas `true`).
- Numéros de build (versionCode Android, buildNumber iOS) : gérés par EAS (`appVersionSource: "remote"`,
  `autoIncrement` du profil `production`) : rien à changer à la main.
- 1.1.0 publiée : construite depuis `c389035` (Android, build 6) et `05d6376` (iOS, build 8), d'après
  `npx eas-cli build:list` (lecture seule, 2 novembre 2026) : le correctif des titres de « Mes badges » (340137a) y
  était déjà ; les notes de la 1.2.0 n'en parlent pas.

## Branche

Construire depuis **`main` après fusion**, pas depuis `refonte-blind-tests` :

1. Sur `refonte-blind-tests`, les trois commits (après ton accord) : « Soutenir l'app », rangement des dossiers,
   refonte des blind tests (après le gel des lots 2 à 4).
2. Commit « Version 1.2.0 » (`app/app.json`).
3. Fusion : `refonte-blind-tests` contient déjà tout `main` (main est son ancêtre, 11 commits d'avance aujourd'hui) :
   `git checkout main` puis `git merge --ff-only refonte-blind-tests`.
4. Build depuis `main` (le commit est noté par EAS dans le build : on sait ce qui est publié).

## Commandes de build (PowerShell, dans `app/`)

Vérifications avant :

```powershell
git status                                  # rien à commiter
git branch --show-current                   # main
Test-Path .env.development.local            # False (clés du projet de test : jamais dans un build)
npx eas-cli env:list production             # variables Firebase de production présentes
npm run typecheck; npm run lint
```

Builds (EAS construit dans le cloud ; numéros de build incrémentés par EAS) :

```powershell
npx eas-cli build --profile production --platform android    # app-bundle (.aab) pour Google Play
npx eas-cli build --profile production --platform ios        # .ipa pour l'App Store
```

Envoi aux stores : **seulement après ton accord**, une fois les builds testés :

```powershell
npx eas-cli submit --profile production --platform android --latest
npx eas-cli submit --profile production --platform ios --latest
```

## Notes de version (règle de `docs/notes-de-version.md` : 500 caractères au plus, jamais le blind test)

Français (170 caractères) :

```
Nouveautés de la 1.2 :
• Un cœur sur l’accueil pour soutenir Quiz’in : partage l’app ou laisse une note, et débloque les badges Partager et Noter.
• Corrections diverses.
```

English (144 characters), si la fiche a une version anglaise :

```
What’s new in 1.2:
• A heart on the home screen to support Quiz’in: share the app or rate it, and unlock the Share and Rate badges.
• Bug fixes.
```

## Mise en production du nouveau contenu (plus tard, sur ton accord explicite, après la réponse écrite de Deezer)

La 1.2.0 fonctionne avec l'ancien contenu (vérifié : 122 fiches et 1 220 questions lues par le nouveau code) et garde
le blind test fermé tant que `config/blindTestV2Enabled` est absent. L'ordre pour ouvrir le nouveau contenu :

1. `config/blindTestEnabled` à `false` (console) : les apps 1.0.1 et 1.1.0 ferment le blind test.
2. `firebase deploy --only database` (règles : difficulté 4).
3. Réimport de `/quizzes` puis `/questions` (console, `content/import/`).
4. `firebase deploy --only hosting:tv` puis `firebase deploy --only hosting:players`.
5. `config/blindTestV2Enabled` à `true` (console) : le blind test s'ouvre dans la 1.2.0.
