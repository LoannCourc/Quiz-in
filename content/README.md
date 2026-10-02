# Contenu des quiz

Un fichier par quiz dans `quizzes/`, nommé d'après son identifiant (`culture-generale-1.json`).

## Format (spec, section 8)

```json
{
  "id": "culture-generale-1",
  "title": "Culture générale : les bases",
  "theme": "Culture générale",
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
- `reviewStatus` : note de relecture, jamais importée dans la base.
- Au moins 10 questions. `explanation` et `timeLimit` (en secondes) sont facultatifs.
- Chaque question doit marcher dans les deux modes : la bonne proposition doit être acceptée en
  réponse libre, et aucune mauvaise proposition ne doit l'être. Le script le vérifie.
- Règles de contenu : texte original, faits vérifiés auprès de deux sources, public familial.

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
