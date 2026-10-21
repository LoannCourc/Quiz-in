# Contenu des quiz

Un fichier par quiz dans `quizzes/`, nommé d'après son identifiant (`culture-generale-1.json`).

## Guide : ajouter, corriger ou supprimer un quiz

Résumé de A à Z. Le détail de chaque champ est dans les sections suivantes et dans `docs/schema-contenu.md`.

### Fichiers à modifier

- **Un fichier par quiz** : `content/quizzes/<id>.json`. C'est le seul fichier à créer pour un quiz classique.
- Facultatif : `content/featuredTheme.json` (thème de la carte « Thème de la semaine »).
- Blind test en plus : `content/music-check/<id>.json` (vérification des morceaux, écrit par les scripts, coché
  ensuite).
- Rien à modifier dans `app/`, `receiver/` ni `shared/` pour un quiz dans un thème existant.

### Quiz classique : exemple minimal

```json
{
  "id": "histoire-de-france-3",
  "title": "Histoire de France : les rois",
  "theme": "Histoire",
  "description": "Dix questions sur les rois de France, de Clovis à Louis XVI.",
  "audience": "all",
  "poster": "red",
  "addedAt": "2026-10-21",
  "questions": [
    {
      "id": "hf3-01",
      "text": "Quel roi a été surnommé le Roi-Soleil ?",
      "options": ["Louis XIII", "Louis XIV", "Henri IV", "François Ier"],
      "correctIndex": 1,
      "acceptedAnswers": ["Louis XIV", "Louis 14"],
      "difficulty": 1
    }
  ]
}
```

Il faut **au moins 10 questions** (ici une seule, pour la forme).

- **Obligatoires (quiz)** :
  - `id` : minuscules, chiffres et tirets, identique au nom du fichier ;
  - `title`, `theme` : un des 8 thèmes, écrit exactement (liste dans `docs/schema-contenu.md`) ;
  - `description` : 160 caractères au plus ;
  - `audience` : `all`, `kids`, `experts` ;
  - `poster` : `pink`, `blue`, `green`, `orange`, `red`, `cyan`, `violet`, `gold` ;
  - `addedAt` : `AAAA-MM-JJ` ;
  - `questions`.
- **Facultatifs (quiz)** :
  - `level` : `easy`, `medium`, `hard` (sinon déduit des difficultés) ;
  - `featuredRank` : 1 à 10, Top 10 ;
  - `icon` : identifiant de `shared/themeIcons.ts` ;
  - `reviewStatus` : note de relecture, jamais importée.
- **Obligatoires (question)** :
  - `id` : unique dans le quiz, minuscules, chiffres et tirets, 32 caractères au plus ;
  - `text` : 140 caractères au plus ;
  - `options` : exactement 4, 80 caractères au plus chacune ;
  - `correctIndex` : 0 à 3 ;
  - `acceptedAnswers` : non vide, contient la bonne réponse ;
  - `difficulty` : 1, 2 ou 3.
- **Facultatifs (question)** : `explanation` (300 caractères au plus), `timeLimit` (1 à 300 s).

### Blind test : exemple minimal

```json
{
  "id": "rock-annees-90-bis",
  "gameType": "blindTest",
  "title": "Rock des années 90",
  "theme": "Musique",
  "description": "Guitares saturées et refrains de stade : dix tubes rock des années 90.",
  "audience": "all",
  "poster": "orange",
  "genre": "rock",
  "decade": 1990,
  "addedAt": "2026-10-21",
  "questions": [
    {
      "id": "r90-01",
      "text": "Quel est ce titre ?",
      "ask": "title",
      "options": ["Zombie – The Cranberries", "Wonderwall – Oasis", "Creep – Radiohead", "Song 2 – Blur"],
      "correctIndex": 0,
      "acceptedAnswers": ["Zombie"],
      "difficulty": 1,
      "music": { "artist": "The Cranberries", "title": "Zombie" }
    }
  ]
}
```

Il faut aussi au moins 10 questions ici (exemple de forme seulement : ces morceaux sont déjà pris, et le build refuse un morceau utilisé dans deux blind tests). En plus des champs du quiz classique :

- **Obligatoires** :
  - `gameType` : `"blindTest"` ;
  - `genre` : `pop`, `rock`, `rap`, `chanson`, `discoFunk`, `electro` ;
  - `decade` : `1960` à `2020`, ou `"all"` ;
  - dans chaque question, `ask` (`title`, `artist` ou `both`) avec l'énoncé imposé : « Quel est ce titre ? »,
    « Quel artiste ? » ou « Quel est ce morceau ? » ;
  - dans chaque question, `music` (`artist` et `title` écrits comme chez Deezer) ;
  - les propositions écrites « Titre – Artiste », avec un tiret demi-cadratin entouré d'espaces.
- **Facultatifs** :
  - `level` : `easy`, `medium`, `hard` ou `impossible` ;
  - `icon` (par exemple `cassette`, `guitar`) ;
  - dans `music` : `startS` (0 à 10), `titleAliases`, `artistAliases`, `displayTitle`, `displayArtist`.

**Vérifier les morceaux** avant la construction, dans `content/` :

1. `npm run music:lookup -- rock-annees-90-bis` (cherche chez Deezer, écrit `music-check/rock-annees-90-bis.json` et
   `.md`).
2. `npm run music:verify -- rock-annees-90-bis` (coche ce qui passe tous les contrôles automatiques).
3. `npm run music:decoys -- rock-annees-90-bis` (vérifie que les mauvaises propositions existent chez Deezer).
4. Écouter un échantillon, puis `npm run music:review -- <lot> rock-annees-90-bis` pour la relecture.

Un blind test dont un morceau n'est pas vérifié n'est pas importé : le build l'annonce et importe les autres.

### Règles vérifiées par la construction

Le build refuse tout le contenu (aucun fichier généré) à la première erreur. Il vérifie :

- **Champs** : présents, valeurs autorisées, longueurs, au moins 10 questions, `id` de quiz égal au nom du
  fichier, `id` de questions uniques et bien formés, `icon` connue, `featuredRank` unique par onglet,
  `featuredTheme.json` qui nomme un thème existant.
- **Réponse libre** :
  - la bonne proposition doit être acceptée par `acceptedAnswers` ;
  - aucune mauvaise proposition ne doit l'être.
- **Caractères** : tout texte affiché doit exister dans les polices de la TV, du site des joueurs et de
  l'appli. Concrètement : alphabet français et ponctuation courante ; pas de ő, ł, ń, ř, ō. Le build donne le
  caractère, la question et la police en cause.
- **Blind test** :
  - `genre` et `decade` présents ;
  - énoncé conforme à `ask` ;
  - toutes les propositions en « Titre – Artiste », et ce séparateur interdit ailleurs ;
  - alias qui ne font pas accepter une mauvaise proposition ;
  - `displayTitle` et `displayArtist` identiques à Deezer une fois normalisés ;
  - avec un `level`, toutes les questions à la même difficulté.
- **Variété des blind tests** :
  - dans un blind test, 40 titres différents et chaque artiste une seule fois ;
  - un morceau dans un seul blind test ;
  - une mauvaise proposition n'est jamais la bonne réponse d'un autre blind test ;
  - « Impossible » : un artiste n'est bonne réponse qu'une fois.
- **Bluff** : leurres distincts entre eux et de la vraie réponse, 100 caractères au plus, aucun mot interdit.
- **Avertissements**, qui n'empêchent pas l'import :
  - énoncé de type « Lequel de ces… » ;
  - extrait qui s'arrête avant la fin du chrono en Réponse libre ;
  - leurre de Bluff très ressemblant.

### Construire

```powershell
cd content
npm run build
```

Fichiers générés dans `content/import/`, jamais versionnés :

- `quizzes.json` : fiches du catalogue, avec les champs calculés `levelCounts` et `featuredTheme` ;
- `questions.json` : questions et bonnes réponses.

Chacun contient **tous** les quiz valides.

### Importer dans la console Firebase

Console Firebase → Realtime Database → Données (détail plus bas, « Générer et importer ») :

1. Ouvrir le nœud **`/quizzes`** et vérifier le chemin affiché en haut. Menu ⋮ → « Importer JSON » →
   `import/quizzes.json`.
2. Même chose sur **`/questions`** avec `import/questions.json`.

- **Jamais à la racine** : cela effacerait les parties en cours (`sessions`) et la configuration (`config`).
- L'import **remplace tout le nœud** : c'est voulu, les fichiers contiennent tout le contenu.
- Toujours importer les deux nœuds, dans cet ordre, même pour une petite correction : une fiche sans questions
  (ou l'inverse) donnerait une partie vide.
- Éviter d'importer pendant une partie en cours.

### Nouveau build de l'app : quand ?

- **Pas de nouveau build** (ni APK, ni iOS, ni déploiement des sites). Il suffit de construire puis d'importer
  dans ces cas :
  - nouveau quiz, blind test ou Bluff dans un thème existant ;
  - correction d'une question ;
  - suppression d'un quiz ;
  - changement de `featuredRank`, de `featuredTheme.json`, d'`addedAt` ;
  - `icon` déjà présente dans `shared/themeIcons.ts`.

  L'app lit le catalogue dans la base à chaque ouverture.
- **Nouveau build nécessaire** (code à modifier, puis build de l'app et déploiement du site des joueurs ; c'est
  une demande de développement, pas seulement du contenu) :
  - **nouveau thème** : le texte du `theme` doit être ajouté à la table de `shared/themeIcons.ts` avec son
    icône dessinée, sa couleur `AppColors.themeChips` et, si le nom est long, un nom court dans `strings.ts`.
    Sans ça, le test `themeIcons.test.ts` échoue et le thème s'affiche avec un « ? » ;
  - nouvelle icône de quiz, nouveau genre ou nouvelle décennie de blind test, nouvelle couleur d'affiche ;
  - nouvelle valeur d'`audience` ou de niveau ;
  - tout nouveau champ dans le format.
- **Polices** : si un caractère manque dans une police, on le remplace dans le texte, on ne change pas de police.

### Corriger un quiz

1. Modifier le fichier dans `content/quizzes/`.
2. **Ne jamais changer l'`id` du quiz ni celui d'une question déjà publiée** : ils servent à retenir les
   questions déjà jouées et les tirages en cours. Pour remplacer une question par une autre, lui donner un
   nouvel `id` (par exemple `hf3-11`).
3. Blind test : changer l'artiste ou le titre d'un morceau annule sa vérification. Relancer `music:lookup`,
   puis `music:verify`. Pour une simple faute d'orthographe affichée, utiliser `displayTitle` ou
   `displayArtist` plutôt que de toucher à `music.title`.
4. `npm run build`, puis réimporter `/quizzes` puis `/questions`.

### Supprimer un quiz

1. Supprimer `content/quizzes/<id>.json` (blind test : aussi `music-check/<id>.json`, `<id>.md` et
   `<id>-pairs.*` s'ils existent).
2. S'il était le seul quiz du thème de `featuredTheme.json`, changer ce thème.
3. `npm run build`, puis réimporter `/quizzes` puis `/questions` : l'import complet le retire de la base.
   Ne jamais supprimer un quiz à la main dans la console : les fichiers générés sont la seule référence.

## Format (spec, section 8)

```json
{
  "id": "culture-generale-1",
  "title": "Culture générale : les bases",
  "theme": "Culture générale",
  "description": "Histoire, sciences, arts et vie quotidienne : un quiz pour tous les âges.",
  "audience": "all",
  "poster": "pink",
  "addedAt": "2026-10-04",
  "featuredRank": 1,
  "reviewStatus": "provisoire, à vérifier",
  "questions": [
    {
      "id": "cg1-01",
      "text": "Quelle planète est la plus proche du Soleil ?",
      "options": ["Mars", "Mercure", "Vénus", "La Terre"],
      "correctIndex": 1,
      "acceptedAnswers": ["mercure"],
      "difficulty": 1,
      "explanation": "Mercure orbite à environ 58 millions de km du Soleil.",
      "timeLimit": 30
    }
  ]
}
```

- `id` : minuscules, chiffres et tirets ; identique au nom du fichier.
- `theme` : texte court ; chaque thème distinct devient une puce de filtre du catalogue.
- `description` : 160 caractères au plus, affichée sur la fiche du quiz.
- `audience` : `all` (Tout public), `kids` (Enfants) ou `experts` (Experts).
- `poster` : couleur de l'affiche, parmi `pink`, `blue`, `green`, `orange`, `red`, `cyan`, `violet`, `gold`.
- `addedAt` : date d'ajout `AAAA-MM-JJ` (rangée « Nouveautés » : les plus récents d'abord).
- `featuredRank` : facultatif, place de 1 à 10 dans le « Top 10 cette semaine », choisie à la main.
  Une place ne peut être donnée qu'à un seul quiz du même onglet (quiz ou blind test). Pour changer
  le Top 10 : modifier les fichiers, régénérer, puis réimporter `/quizzes`.
- `reviewStatus` : note de relecture, jamais importée dans la base.
- Au moins 10 questions. `explanation` et `timeLimit` (en secondes) sont facultatifs.
- Chaque question doit marcher dans les deux modes : la bonne proposition doit être acceptée en
  réponse libre, et aucune mauvaise proposition ne doit l'être. Le script le vérifie.
- Réponse libre (les joueurs tapent leur réponse) : `acceptedAnswers` liste les écritures acceptées en
  plus de la bonne proposition (nom seul, nombre en chiffres et en lettres, forme courte d'une
  définition). Inutile d'ajouter les variantes de casse, d'accents, de ponctuation, d'article initial
  ou les petites fautes de frappe : la correction automatique les accepte déjà (spec 6.3).
  Pas d'énoncé qui suppose les propositions sous les yeux (« Lequel de ces… », « parmi ») : le script
  l'affiche en avertissement. Relecture : `docs/relecture-saisie-libre.md`.
- Règles de contenu : texte original, faits vérifiés auprès de deux sources, public familial.

## Bluff (spec 16)

Un quiz Bluff a `"gameType": "bluff"`. Ses questions n'ont pas de propositions : `answer` (la vraie réponse,
une phrase de 100 caractères au plus), `acceptedAnswers` (ses autres écritures, éventuellement vide) et `decoys`
(2 ou 3 leurres crédibles et faux, des phrases de même ton et de même longueur, 100 caractères au plus). Pas de `options`, `correctIndex`, `music` ni `ask`.

- Le build refuse un leurre qui vaudrait la vraie réponse (exact ou à une faute près), un leurre en double ou
  un mot interdit ; il signale un leurre très ressemblant.
- Une bonne question : réponse courte et peu connue, énoncé qui ne la trahit pas.
- Relecture : `docs/relecture-bluff.md`.

## Blind test (spec 15)

Un blind test a `"gameType": "blindTest"`. Chaque question a un champ `ask` (ce qu'elle demande) et
l'énoncé qui va avec, quatre propositions du même genre et de la même époque, et un champ `music` sans
identifiant. **Toutes les propositions s'écrivent « Titre – Artiste »** (tiret demi-cadratin « – »
entouré d'espaces) : en Choix multiples, le téléphone et la TV affichent le titre en gros et l'artiste
dessous. Le build refuse une proposition sans artiste, et ce séparateur dans un quiz qui n'est pas un
blind test. `ask` ne décide que de l'énoncé et de ce qu'il faut écrire en Réponse libre :

- `"ask": "title"`, « Quel est ce titre ? » : en Réponse libre, on écrit le titre ;
- `"ask": "artist"`, « Quel artiste ? » : en Réponse libre, on écrit l'artiste ;
- `"ask": "both"`, « Quel est ce morceau ? » (« Tubes francophones ») : en Réponse libre, deux champs
  (titre et artiste), chacun rapporte la moitié des points.

Compléter des propositions qui n'ont que le titre ou que l'artiste : `npm run music:pairs -- <quizId>`
écrit un brouillon `music-check/<quizId>-pairs.json` (et `.md` lisible) d'après Deezer : l'artiste d'un
titre, ou le titre le plus écouté d'un artiste. À relire et corriger dans le `.json` (époque, artiste
d'origine, doublons), puis `npm run music:pairs -- <quizId> --apply` réécrit la ligne `options` des
questions. La bonne proposition vient toujours du champ `music`, jamais de Deezer.

Dans un même quiz, alterner titre et artiste, et équilibrer les positions des bonnes réponses (A, B, C, D).

```json
"ask": "artist",
"music": { "artist": "Maître Gims", "title": "Est-ce que tu m'aimes ?", "startS": 5, "artistAliases": ["Gims"] }
```

- `titleAliases`, `artistAliases` (facultatifs) : autres écritures acceptées en Réponse libre (surnom, nom
  seul, sigle collé : « Gims », « ACDC »). Le titre sans sa parenthèse est déjà accepté. Le script refuse
  un alias qui ferait accepter une mauvaise proposition.

- `startS` (facultatif, 0 par défaut) : début de l'extrait dans la preview de 30 s. L'extrait joue
  pendant tout le timer de la question (20 s) : `startS + timer` ≤ 30, soit `startS` de 0 à 10. En
  Réponse libre (timer de 30 s), seul `startS` = 0 couvre tout le chrono : au-delà, le script avertit
  que l'extrait s'arrête avant la fin.
- Les `acceptedAnswers` contiennent ce que demande la question dans la bonne proposition (son titre, son
  artiste, ou « titre – artiste » pour `both`), pour qu'elle soit acceptée en réponse libre.
- Mauvaises propositions : tubes ou artistes de la même époque (au plus un titre du même artiste), jamais
  la bonne réponse d'une autre question du quiz ni l'artiste d'un autre morceau du quiz.
- Un morceau n'apparaît que dans un seul blind test. Public familial : aucun morceau à paroles explicites.

Les identifiants Deezer ne sont **jamais** écrits dans le quiz :

1. `npm run music:lookup -- <quizId>` (réseau) : recherche chaque morceau dans l'API Deezer et écrit
   `music-check/<quizId>.json` (à cocher) et `music-check/<quizId>.md` (lecture, avec les liens).
   Le morceau proposé a un extrait, n'est pas marqué explicite par Deezer et est choisi dans cet ordre :
   le bon artiste, le titre exact, une version originale (pas de live, remix, reprise, karaoké ni
   réenregistrement), puis la plus écoutée (popularité Deezer, indiquée dans le `.md`).
2. Écouter chaque lien, vérifier la version et le passage joué (`startS`). Si une alternative est
   meilleure, la copier dans `found`. Puis passer `verified` à `true`.
3. `npm run build` : un blind test n'est importé que si tous ses morceaux sont vérifiés (et aucun
   n'est explicite) ; sinon il
   est exclu, avec la liste de ce qui manque (les autres quiz sont importés normalement).

Changer l'artiste ou le titre d'un morceau annule sa vérification : relancer `music:lookup`.
Un morceau déjà vérifié et inchangé est conservé tel quel.

## Générer et importer

1. Depuis `content/` : `npm run build`. Le script vérifie tous les quiz et écrit
   `import/quizzes.json` et `import/questions.json` (non versionnés).
2. Console Firebase → Realtime Database → Données.
3. Ouvrir le nœud **`quizzes`** : clic sur la clé, ou ajout de `~2Fquizzes` à la fin de l'adresse
   de la page s'il n'existe pas encore. Vérifier que le chemin affiché en haut est bien `/quizzes`.
4. Menu ⋮ → « Importer JSON » → `import/quizzes.json`.
5. Même chose sur le nœud **`questions`** avec `import/questions.json`.

L'import **remplace tout le contenu du nœud choisi** : les fichiers générés contiennent donc tous
les quiz. **Ne jamais importer à la racine de la base** : cela effacerait les parties en cours
(`sessions`) et tout le reste.
