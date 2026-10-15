# Schéma du contenu : rédiger des quiz pour Quiz'in

Référence technique complète : `content/README.md` (contrôles du build).

**Qui rédige** : Claude Code rédige les questions et les vérifie avec des sources web (Bluff et quiz difficiles : une URL
par réponse dans `docs/relecture-<lot>.md`, deux sources quand c'est possible ; sans source fiable, la question est
retirée ou remplacée). Quiz faciles et moyens : faits classiques, certitude notée « sûr » ou « à vérifier », tout
doute est retiré. Le développeur relit un échantillon, en priorité les questions « à vérifier » (en tête de chaque
fichier de relecture). La règle des faits vérifiés (deux sources quand c'est possible) reste valable.
Chaque quiz est **un fichier JSON** dans `content/quizzes/`, nommé d'après son identifiant. Le Bluff aussi :
la banque d'origine (`content/sources/`) n'est plus lue, on écrit directement le JSON.

## Ce qui manque (point 1 : 20 ou 30 questions par thème)

Un thème propose 20 ou 30 questions dès que **tous ses quiz réunis** en ont autant. Le plus simple : ajouter des
quiz de 10 questions dans le thème.

| Thème (texte exact du champ `theme`) | Quiz : manque pour 20 / 30 | Bluff : manque pour 15 / 20 |
|---|---|---|
| Culture générale | 0 / 0 | 0 / 0 |
| Cinéma et séries | 0 / 0 | 0 / 0 |
| Loisirs | 0 / 0 | 0 / 0 |
| Sciences et nature | 0 / 0 | 0 / 0 |
| Géographie | 0 / 0 | 0 / 0 |
| Histoire | 0 / 0 | 0 / 0 |
| Musique | 0 / 0 | 0 / 0 |
| Sport | 0 / 0 | 0 / 0 |

Quiz : manques comblés par le lot Q1 (octobre 2026) ; chaque thème a au moins 30 questions. Bluff : état après le lot B3 (octobre 2026) : 30 questions dans chaque catégorie, 40 en Histoire.

## Règles communes à tous les jeux

- **`id` du quiz** : minuscules, chiffres et tirets (`histoire-de-france-2`), identique au nom du fichier, unique.
- **`id` des questions** : unique dans le quiz, court préfixe du quiz puis numéro (`hf2-01` à `hf2-10`). Ne jamais
  renuméroter une question déjà publiée : l'identifiant sert à mémoriser les questions déjà jouées.
- **`theme`** : un des 8 thèmes, écrit exactement : `Culture générale`, `Cinéma et séries`, `Loisirs`,
  `Sciences et nature`, `Géographie`, `Histoire`, `Musique`, `Sport`.
- **`title`** : court, sans préfixe de jeu (pas de « Bluff : »).
- **`description`** : 160 caractères au plus.
- **`audience`** : `all`, `kids` ou `experts`. **`poster`** : `pink`, `blue`, `green`, `orange`, `red`, `cyan`,
  `violet` ou `gold`. **`addedAt`** : date `AAAA-MM-JJ` (tri « Nouveautés » du Quiz et du Bluff, du plus récent au plus ancien). **`featuredRank`** (facultatif) : place 1 à 10 du Top 10. Le tri « Populaires » (Quiz et Bluff) n'est **pas une vraie statistique** : il range d'abord le Top 10 manuel (`featuredRank`), puis les autres quiz du plus récent au plus ancien ; aucune partie n'est comptée.
- **`level`** (facultatif) : `easy`, `medium` ou `hard` (sinon déduit de la moyenne des difficultés).
- **`difficulty`** de chaque question : 1, 2 ou 3.
- **`reviewStatus`** : note libre de relecture, jamais importée.
- Au moins **10 questions** par quiz. Texte original, faits vérifiés auprès de deux sources, public familial.

## Quiz (choix multiples et réponse libre)

- `options` : exactement 4 propositions ; `correctIndex` : 0 à 3 (équilibrer A, B, C, D dans un quiz).
- `acceptedAnswers` : autres écritures acceptées en réponse libre (nom seul, nombre en chiffres et en lettres).
  Inutile d'y mettre casse, accents, article ou petites fautes : déjà acceptés.
- Pas d'énoncé du type « Lequel de ces… » (il doit marcher sans les propositions).
- `explanation` (facultatif) : une phrase. `timeLimit` (facultatif) : secondes.
- La `difficulty` de chaque question (1 Facile, 2 Moyen, 3 Difficile) sert aussi au choix « Difficulté » d'une partie
  tirée dans des thèmes (écran « Ta partie ») : le build calcule pour chaque quiz le nombre de questions par niveau
  (`levelCounts`, écrit dans `import/quizzes.json`, jamais à la main).
- **Thème à la une** (carte « Thème de la semaine » du catalogue Quiz) : fichier `content/featuredTheme.json`,
  `{ "theme": "Histoire" }`, le texte exact du champ `theme` d'un quiz classique (le build refuse un thème inconnu).
  Pour changer de thème : modifier ce fichier, `npm run build`, puis réimporter `/quizzes`. Fichier absent : l'app
  prend le thème le plus joué sur le téléphone de l'hôte, sinon celui qui a le plus de questions.

```json
{
  "id": "histoire-de-france-2",
  "title": "Histoire de France : les grandes dates",
  "theme": "Histoire",
  "description": "Rois, révolutions et républiques : dix dates qui ont fait la France.",
  "audience": "all",
  "poster": "red",
  "addedAt": "2026-10-20",
  "level": "medium",
  "reviewStatus": "à relire",
  "questions": [
    {
      "id": "hf2-01",
      "text": "En quelle année Napoléon Bonaparte est-il sacré empereur ?",
      "options": ["1799", "1804", "1815", "1789"],
      "correctIndex": 1,
      "acceptedAnswers": ["1804"],
      "difficulty": 2,
      "explanation": "Le sacre a lieu le 2 décembre 1804 à Notre-Dame de Paris."
    }
  ]
}
```

## Bluff

`"gameType": "bluff"`. Pas de `options`, `correctIndex`, `music` ni `ask`.

- `answer` : la vraie réponse, une phrase de **100 caractères au plus**, courte et peu connue.
- `acceptedAnswers` : autres écritures de la vraie réponse (peut être vide).
- `decoys` : **2 ou 3** leurres crédibles et faux, même ton et même longueur, 100 caractères au plus ; jamais
  équivalents à la vraie réponse (le build le refuse).
- L'énoncé ne doit pas trahir la réponse.

```json
{
  "id": "bluff-sport-insolite",
  "gameType": "bluff",
  "title": "Sports insolites",
  "theme": "Sport",
  "description": "Des règles absurdes et des records improbables : inventez une réponse crédible, démasquez la vraie.",
  "audience": "all",
  "poster": "orange",
  "addedAt": "2026-10-20",
  "reviewStatus": "à relire",
  "questions": [
    {
      "id": "bsi-01",
      "text": "Que portaient les joueurs lors des premiers matchs officiels de hockey sur glace à Montréal ?",
      "answer": "Une balle de caoutchouc coupée en deux, à la place du palet.",
      "acceptedAnswers": [],
      "decoys": [
        "Des patins en os de bœuf attachés par des lanières de cuir.",
        "Un chapeau haut de forme, exigé par le règlement du club."
      ],
      "difficulty": 2
    }
  ]
}
```

*(Exemple de forme seulement : le fait doit être vérifié avant toute publication.)*

## Blind test

`"gameType": "blindTest"`, `"theme": "Musique"`. Chaque question a `ask` et `music`, sans identifiant Deezer.

- `ask` : `title` (« Quel est ce titre ? »), `artist` (« Quel artiste ? ») ou `both` ; alterner titre et artiste.
- `options` : 4 titres ou 4 artistes de la même époque et du même genre ; `acceptedAnswers` contient la bonne.
- `music` : `artist`, `title`, `startS` (0 à 10), `titleAliases` et `artistAliases` facultatifs.
- Un morceau n'apparaît que dans un seul blind test (le build refuse un doublon) ; aucune version explicite.
- **Variété** (octobre 2026, refusée par le build) : dans un blind test, les 40 propositions ont 40 titres
  différents (précisions entre parenthèses ignorées ; un même titre sous deux noms d'artiste, « Jimi Hendrix »
  et « The Jimi Hendrix Experience », est refusé aussi) et chaque artiste n'y apparaît qu'une fois ; une
  mauvaise proposition n'est jamais la bonne réponse d'un autre blind test. « Impossible » : un artiste n'est
  bonne réponse qu'une fois sur l'ensemble des « Impossible », et jamais s'il est bonne réponse d'un autre
  blind test des lots BT-1 à BT-6.
- Mauvaises propositions : même genre et même époque que le blind test, notoriété comparable, présentes
  chez Deezer en version d'origine (ni live, ni remix, ni reprise), non explicites, titre convenable.
  `npm run music:decoys [-- <quizId> …]` cherche chaque proposition chez Deezer (cache
  `music-check/decoys.json`, une recherche par proposition ; supprimer une entrée pour la refaire) et finit en
  erreur s'il en manque une.
- `genre` (obligatoire, un genre principal) : `pop`, `rock`, `rap`, `chanson`, `discoFunk`, `electro`.
  `decade` (obligatoire) : `1960` à `2020`, ou `all` (toutes époques).
- `level` (facultatif) : `easy`, `medium`, `hard` ou `impossible`. S'il est écrit, toutes les questions ont la
  même `difficulty` (1, 2, 3 ; Impossible : 3) : le build refuse un morceau « facile » dans un blind test
  « difficile ».
- **Impossible** (octobre 2026) : 10 titres **très peu écoutés d'artistes connus** : titres d'album et faces
  B, jamais les singles ni les tubes (hors du top 10 de l'artiste chez Deezer). Le jour de la vérification :
  - popularité Deezer du morceau (`rank`) **sous 200 000**, sur toutes ses éditions propres (ni live ni
    remix) : une édition secondaire peu écoutée ne suffit pas si l'édition principale dépasse le seuil (à titre
    de comparaison, les tubes des autres blind tests sont entre 500 000 et 900 000) ;
  - artiste à **50 000 fans ou plus** (`nb_fan`), pour que le marquage « non explicite » soit fiable ;
  - mêmes règles qu'ailleurs : version d'origine, extrait présent, paroles non explicites, genre et époque
    garantis par l'album Deezer (genre de l'album, date de sortie) ; titres vulgaires ou suggestifs écartés à
    la main, même marqués non explicites ; ni reprise, ni live, ni album hommage.
  - Les dates d'album des années 60 à 90 sont souvent celles d'une réédition chez Deezer : préférer des
    époques où la date de l'album est celle d'origine (années 2000 et 2010). Deezer range aussi beaucoup
    d'albums de chanson en « Pop » : pour le genre Chanson, l'album doit être classé « Chanson française ».
  - Les propositions sont des titres d'album d'autres artistes de la même scène (30 artistes différents des
    10 bonnes réponses), aussi peu connus, même genre et même époque.
  - L'ancienne définition (artistes à moins de 800 fans) est abandonnée : trop de reprises, de titres
    douteux et de paroles impossibles à garantir.
- `music.title` et `music.artist` : tels que Deezer les écrit (ce sont eux qui sont vérifiés).
- `music.displayTitle` et `music.displayArtist` (facultatifs) : l'orthographe affichée à l'écran quand celle
  de Deezer est fausse (accents, casse d'un titre français, ponctuation) : « Téléphone » pour « Telephone »,
  « J'traîne des pieds » pour « J'traine des pieds », « Word Up! » pour « Word Up ». Ils remplacent
  titre et artiste partout où ils s'affichent (propositions, révélation) et dans la correction de la Réponse
  libre, sans changer ce qui est vérifié. Une fois normalisés (sans accents, casse ni ponctuation), ils doivent
  être identiques au titre et à l'artiste de Deezer : le build refuse sinon (on corrige l'écriture, jamais le
  morceau). Les propositions écrivent le morceau avec cette orthographe. Les majuscules des titres anglais
  (« The Rhythm Of The Night ») ne sont pas des fautes.
- `startS` : début de l'extrait (0 à 10 avec le minuteur de 20 s).
- Alias (`titleAliases`, `artistAliases`) pour la Réponse libre : titre sans « feat. » ni parenthèses,
  autres noms de l'artiste (« Puff Daddy » pour « Diddy »). Casse, accents, article et petites fautes sont
  déjà tolérés.
- On ne stocke que des identifiants et des métadonnées : ni audio, ni lien d'extrait (ils expirent ; l'hôte
  les demande à Deezer au salon).

### Vérification des morceaux (dans `content/`)

1. `npm run music:lookup -- <quizId>` : cherche chaque morceau chez Deezer et écrit
   `music-check/<quizId>.json` (identifiant, titre et artiste affichés, album, extrait, paroles explicites,
   alternatives) et sa version lisible `.md`. Pour choisir une alternative : la copier dans `found`.
2. `npm run music:verify -- <quizId> [<quizId>…]` : coche `verified: true` avec `verifiedBy: "auto"` seulement
   si TOUS les contrôles passent : artiste et titre identiques à ceux affichés par Deezer, sans tenir compte
   des accents ni de la casse (tout autre écart est signalé ; les mentions du même enregistrement sont
   acceptées : « feat. », « Remastered », « Radio Edit », bande originale d'un film),
   version originale (ni live ni remix), extrait présent, paroles non explicites, extrait qui tient dans le
   minuteur. Sinon, la raison est affichée : remplacer le morceau.
3. `npm run music:review -- <lot> <quizId> [<quizId>…]` : écrit `docs/relecture-lot-bt-<lot>.md` (rank du
   morceau, fans de l'artiste, date de vérification, extrait, paroles, qui a vérifié, 5 morceaux à écouter en
   priorité) et signale un « Impossible » hors règle (rank de 200 000 ou plus, artiste sous 50 000 fans). Rank
   et fans changent avec le temps : ils ne sont écrits que dans la relecture, jamais dans le contenu publié.
   Relancer le script pour revérifier un « Impossible ». (Les relectures BT-1 à BT-5 ont été écrites par
   l'ancien `music:fans`, sans rank.)
4. `verifiedBy: "listened"` signifie **« approuvé par Loann »** (après écoute d'un échantillon ou relecture
   du lot) ; « auto » : contrôles automatiques passés, pas encore approuvé. Un morceau est coché `verified`
   dès que les contrôles automatiques passent ; Loann écoute un échantillon. Sans `verifiedBy` : morceau
   vérifié à l'écoute avant ce champ. Lots BT-1 à BT-5 : approuvés par Loann (octobre 2026).
5. `npm run build` : n'importe qu'un blind test dont tous les morceaux sont vérifiés.

```json
{
  "id": "annees-90-2",
  "gameType": "blindTest",
  "title": "Années 90 : le retour",
  "theme": "Musique",
  "description": "Dix tubes des années 90 à reconnaître dès les premières notes.",
  "audience": "all",
  "poster": "violet",
  "icon": "cassette",
  "genre": "pop",
  "decade": 1990,
  "level": "medium",
  "addedAt": "2026-10-20",
  "reviewStatus": "à relire",
  "questions": [
    {
      "id": "a92-01",
      "text": "Quel artiste ?",
      "ask": "artist",
      "options": ["Te garder près de moi – Alliage", "Partir un jour – 2Be3", "Raide dingue de toi – G-Squad", "Je te donne – Worlds Apart"],
      "correctIndex": 1,
      "acceptedAnswers": ["2Be3"],
      "difficulty": 2,
      "music": { "artist": "2Be3", "title": "Partir un jour", "startS": 5, "artistAliases": ["2 Be 3"] }
    }
  ]
}
```

## Après rédaction

1. Déposer le fichier dans `content/quizzes/`, puis `npm run build` dans `content/` (il signale les erreurs).
2. Réimporter **`/quizzes` puis `/questions`** dans la console Firebase (jamais la racine).
