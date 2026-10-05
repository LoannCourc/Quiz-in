# Relecture : Bluff

Deux quiz Bluff de 10 questions, à relire avant l'import (spec 16). Fichiers sources :
`content/quizzes/bluff-culture-generale.json` et `content/quizzes/bluff-sciences-nature.json`.

## Ce qu'il faut vérifier

- **Le fait** : la vraie réponse est exacte (deux sources).
- **La vraie réponse** est courte et peu connue : si tout le monde la devine, la question ne sert à rien.
- **L'énoncé** ne la trahit pas (pas d'indice involontaire).
- **Les leurres** sont crédibles, mais **faux**. Un leurre qui serait vrai lui aussi fausse le vote. Ils sont tous
  acceptés comme propositions de joueur (vérifié par les tests).
- **Les écritures acceptées** : un joueur qui tape l'une d'elles (exacte ou à une faute près) voit « Tu as trouvé
  la vraie réponse ! ». Un mot seul de la réponse, ou une réponse seulement ressemblante, reste accepté comme fausse
  réponse.

Après une correction : `npm run build` dans `content/` (le build refuse un leurre qui vaudrait la vraie réponse),
puis réimport de `/quizzes` et de `/questions`.

## Bluff : mots rares et faits insolites (`bluff-culture-generale`, Culture générale)

| # | Question | Vraie réponse | Autres écritures acceptées | Leurres | À vérifier |
|---|---|---|---|---|---|
| 1 | Comment appelle-t-on le petit embout rigide au bout d'un lacet ? | **Un ferret** | Ferret | Un lacelot · Une pointelle · Un bouterol |  |
| 2 | Quel était le tout premier nom du jeu qui a inspiré le Monopoly, breveté en 1904 ? | **The Landlord's Game** | Landlord's Game · Landlords Game · Le Jeu du propriétaire | Magie Immobilière · Capital Express · Rue de la Paix | La traduction « Le Jeu du propriétaire » est acceptée comme vraie réponse (les maquettes s'en servaient comme fausse réponse) : à garder ou retirer. |
| 3 | Comment appelle-t-on la peur des mots trop longs ? | **Hippopotomonstrosesquippedaliophobie** | — | Macrologophobie · Grandiverbophobie · Polysyllabophobie | Mot réel mais rare (36 lettres, la limite est 40). |
| 4 | Comment appelle-t-on la petite zone lisse entre les deux sourcils ? | **La glabelle** | Glabelle | Le sourcillon · La frontelle · L'intercil |  |
| 5 | Quel est le vrai nom du symbole « # » en typographie ? | **Le croisillon** | Croisillon | Le grillon · Le carreau · Le treillis | Un joueur écrira souvent « dièse » : accepté comme fausse réponse, c'est voulu. |
| 6 | Comment appelle-t-on la petite gouttière verticale entre le nez et la lèvre supérieure ? | **Le philtrum** | Philtrum | Le nasillon · La fossette labiale · Le labrel |  |
| 7 | En 1932, l'armée australienne a mené une véritable « guerre » contre quels animaux ? | **Les émeus** | Émeus · Émeu · Emeus · Emeu | Les kangourous · Les lapins · Les dingos | « Emu War », novembre-décembre 1932. |
| 8 | Comment appelle-t-on un collectionneur d'étiquettes de camembert ? | **Un tyrosémiophile** | Tyrosémiophile · Tyrosemiophile | Un caséophile · Un fromagiophile · Un camembertiste |  |
| 9 | Comment appelle-t-on l'odeur de la terre après la pluie ? | **Le pétrichor** | Pétrichor · Petrichor | L'ombrine · La pluviance · L'humidor | « Humidor » existe (boîte à cigares) : faux ici, à garder ou changer. |
| 10 | Quel est le prénom de la femme peinte par Léonard de Vinci dans « La Joconde » ? | **Lisa** | Lisa Gherardini · Mona Lisa | Lucia · Beatrice · Caterina | Réponse assez connue des amateurs d'art : peut-être trop facile. |

## Bluff : animaux et phénomènes surprenants (`bluff-sciences-nature`, Sciences et nature)

| # | Question | Vraie réponse | Autres écritures acceptées | Leurres | À vérifier |
|---|---|---|---|---|---|
| 1 | De quelle couleur est le sang du homard ? | **Bleu** | Bleue · Bleuté · Bleutée | Vert · Jaune · Violet | Le sang est presque incolore sans oxygène, bleu avec : la formulation « bleu » est l'usage courant. |
| 2 | Combien de cœurs possède une pieuvre ? | **Trois** | 3 · Trois cœurs · 3 cœurs | Deux · Cinq · Huit |  |
| 3 | Quelle forme ont les crottes du wombat, un marsupial australien ? | **Des cubes** | Cube · Cubes · Cubique · Cubiques · En cube · En forme de cube | Des spirales · Des triangles · Des anneaux |  |
| 4 | Quel animal a des empreintes digitales presque impossibles à distinguer de celles d'un humain ? | **Le koala** | Koala · Koalas | Le raton laveur · Le paresseux · La loutre | Les grands singes ont aussi des empreintes, mais c'est le koala qui est cité comme « presque identique » : aucun singe parmi les leurres. |
| 5 | Quel est le seul oiseau capable de voler en marche arrière ? | **Le colibri** | Colibri · Colibris · Oiseau-mouche | Le martinet · L'hirondelle · La mésange | Assez connu : la plus facile du quiz (difficulté 1). |
| 6 | Quel animal microscopique a survécu à dix jours dans le vide spatial, en 2007 ? | **Le tardigrade** | Tardigrade · Tardigrades · Ourson d'eau · Oursons d'eau | Le rotifère géant · La puce des glaces · Le cafard des neiges | Mission FOTON-M3 (septembre 2007). « Rotifère » existe, mais pas de rotifère géant spatial. |
| 7 | De quelle couleur est la peau de l'ours polaire, sous sa fourrure ? | **Noire** | Noir | Rose · Grise · Blanche |  |
| 8 | Comment appelle-t-on les « faux soleils » qui apparaissent parfois de chaque côté du Soleil ? | **Des parhélies** | Parhélie · Parhélies · Parhelie · Parhelies | Des héliomirages · Des gémellies · Des solstices | « Solstices » existe, mais n'a rien à voir : à garder ou changer. |
| 9 | Quels pigments, présents dans leur nourriture, donnent leur couleur rose aux flamants ? | **Les caroténoïdes** | Caroténoïdes · Caroténoïde · Carotenoides · Carotenoide | Les anthocyanes · Les xanthelles · Les rosanines | « Anthocyanes » sont de vrais pigments (des plantes), mais pas ceux des flamants. |
| 10 | Quel animal possède les plus grands yeux du règne animal ? | **Le calmar colossal** | Calmar colossal · Calamar colossal · Calmar géant · Calamar géant | La baleine bleue · Le requin-baleine · Le cachalot | Calmar colossal et calmar géant ont des yeux de taille très proche (environ 27 cm) : les deux sont acceptés. |

## Explications affichées à la révélation

Chaque question a une courte explication (dans les fichiers sources, champ `explanation`) : à relire avec le fait.
