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
- Un morceau n'apparaît que dans un seul blind test ; aucune version explicite.
- À venir (point 5, pas encore dans le modèle) : `genre` (Pop, Rock, Rap, Chanson, Disco/Funk, Électro),
  `decade` et le niveau `impossible`. Ne pas les écrire avant que le build les accepte.
- Après rédaction : `npm run music:lookup -- <quizId>`, écoute et vérification, puis `npm run build`.

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
  "addedAt": "2026-10-20",
  "reviewStatus": "à relire",
  "questions": [
    {
      "id": "a92-01",
      "text": "Quel artiste ?",
      "ask": "artist",
      "options": ["Alliage", "2Be3", "G-Squad", "Worlds Apart"],
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
