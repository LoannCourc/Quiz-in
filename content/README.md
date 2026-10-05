# Contenu des quiz

Un fichier par quiz dans `quizzes/`, nommé d'après son identifiant (`culture-generale-1.json`).

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

## Blind test (spec 15)

Un blind test a `"gameType": "blindTest"`. Chaque question a un champ `ask` (ce qu'elle demande) et
l'énoncé qui va avec, quatre propositions du même genre et de la même époque, et un champ `music` sans
identifiant :

- `"ask": "title"`, « Quel est ce titre ? » : propositions = titres ; la bonne proposition cite le titre ;
- `"ask": "artist"`, « Quel artiste ? » : propositions = artistes ; la bonne proposition cite l'artiste ;
- `"ask": "both"`, « Quel est ce morceau ? » (« Tubes francophones ») : propositions « Titre – Artiste » ;
  en Réponse libre, deux champs (titre et artiste), chacun rapporte la moitié des points.

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
- Les `acceptedAnswers` contiennent la bonne proposition (titre, artiste, ou « titre – artiste »), pour
  qu'elle soit acceptée en réponse libre.
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
