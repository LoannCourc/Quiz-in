# Plan : « Dessine-moi » (4e mini-jeu, type Pictionary)

Statut : **plan validé (7 octobre 2026). Lot 1 (prototype) codé, à tester sur téléphone et sur la box.** Les règles passeront dans la spec (§ 19) au lot 3, avant le moteur.

**Décisions du développeur** :
- D1 : l'hôte qui joue devine mais ne dessine pas (Skia plus tard, build groupé).
- D2 : TV obligatoire.
- D3 : 4, 6 ou 8 manches (8 par défaut), chacun dessine au plus une fois ; en Groupe, un multiple du nombre d'équipes.
- D4 : dessinateur, 1 000 points au plus, en proportion des devineurs qui ont trouvé.
- D5 et D6 : catégorie et nombre de lettres affichés sur la TV, jamais les propositions fausses.
- D7 : changer de mot seulement avant le premier trait.
- D8 : l'hôte peut annuler une manche.
- D9 : « Annuler » (le dernier trait) et « Tout effacer ».
- D10 : en Groupe, chaque équipe dessine autant de fois.
- D11 : fin 2 s après que tout le monde a trouvé.
- Les deux écarts du § 0 (seau calculé une fois, texte compact) sont acceptés.

**Lot 1, ce qui existe** :
- Logique pure `shared/drawing/`, avec les tests `tests/unit/drawing.test.ts` :
  - `palette` (surface, 12 couleurs, 3 épaisseurs) ;
  - `simplify` (lissage) ;
  - `encoding` (`DrawingWriter` et `DrawingDoc`) ;
  - `raster` (grille et seau) ;
  - `render` (`DrawingRenderer`, rendu incrémental) ;
  - `recording` (dessin enregistré).
- Téléphone :
  - `components/player/draw/DrawingCanvas.web.tsx`, avec son remplaçant dans l'app `DrawingCanvas.tsx` ;
  - outils `DrawingTools.tsx` ;
  - démo `/debug/draw` (développement seulement).
- TV : banc d'essai `screens/DrawBenchScreen.tsx`, sur le site publié par `?drawbench=1` (ou `1.5`, `2`) ou par le message Cast `{ "drawBench": true | 1.5 | 2 }` (`cast-sender.html`, étape 6). Il rejoue `receiver/src/lib/drawing/benchRecording.json`, une maison enregistrée sur `/debug/draw` : 126 paquets, 10,2 Ko, 28 opérations, 10 seaux, 2 annulations.
- Bord des seaux : la grille du seau a des cases de 2 points logiques, et ce crénelage se voit au bord des seaux sur un grand écran. Si c'est gênant sur la box, on peut passer la grille à 640 × 480 (4 fois plus de cases), décision au lot 2.

## 0. En bref

- **Pas de nouvel APK pour commencer.** Presque tous les dessinateurs sont des joueurs sur le **site des joueurs** (navigateur) : le `<canvas>` HTML y est natif, rapide, sans dépendance. Seul **l'hôte qui joue** (app Android) n'a aucun moyen de dessiner dans l'APK actuel (ni SVG, ni Skia, ni WebView). Proposition : l'hôte qui joue devine mais ne dessine pas (décision D1). Un APK avec Skia viendra plus tard, si besoin, groupé avec un autre build.
- **Deux changements par rapport à l'orientation proposée :**
  1. Pour le seau, le téléphone du dessinateur calcule la zone une seule fois et l'**envoie toute faite** (lignes de pixels compressées). La TV ne fait que la peindre. Le résultat est identique par construction, sans avoir à garantir que deux navigateurs calculent pareil (les traits lissés diffèrent d'un navigateur à l'autre).
  2. Le dessin est envoyé en **chaînes compactes** plutôt qu'en tableaux JSON : les règles de la base peuvent alors en limiter la taille (`length <= N`), ce qu'elles ne savent pas faire sur un tableau.
- **Premier lot = prototype sans Firebase.** Le dessin au doigt se teste sur votre téléphone, et la box rejoue un dessin enregistré avec le panneau `?perf=1`. Le transport en direct par Firebase arrive au lot 2, car il demande une règle de base à déployer.

## 1. Modules natifs et choix du canvas

### Ce qu'il y a dans l'APK de développement (`app/package.json`)

| Module natif | Utile pour le dessin ? |
|---|---|
| `react-native-gesture-handler` 2.32, `react-native-reanimated` 4.5.1, `react-native-worklets` 0.10.1 | Oui, pour **capter** le doigt de façon fluide (gestes sur le fil natif). Mais rien pour **dessiner**. |
| `expo-image` | Afficher une image, pas dessiner. |
| `expo-web-browser` | Ouvre un onglet Chrome externe, sans échange avec l'app : inutilisable pour dessiner. |
| `react-native-google-cast`, `expo-keep-awake`, `expo-clipboard`… | Sans rapport. |
| **Absents** : `react-native-svg`, `@shopify/react-native-skia`, `react-native-webview` | En ajouter un **impose un nouvel APK** (build EAS). |

### Options, du téléphone du joueur (navigateur) à celui de l'hôte (Android)

| Option | Où | Avantages | Risques | Nouvel APK ? |
|---|---|---|---|---|
| **`<canvas>` HTML** (composant `.web.tsx`) | Site des joueurs | Natif au navigateur, très fluide, pointeurs et tactile, lecture des pixels possible. Même API que la TV. | Empêcher le défilement et le zoom pendant le dessin (`touch-action: none`) ; à vérifier sur iPhone Safari. | **Non** |
| **Skia** (`@shopify/react-native-skia`) | App de l'hôte | Le plus fluide en natif, dessin sur le fil UI avec reanimated, que nous avons déjà. | Gros module (plusieurs Mo), compatibilité avec Expo 57 et React Native 0.86 **à vérifier dans la doc au moment voulu** ; un build EAS. | **Oui** |
| **`react-native-svg`** | App de l'hôte | Léger, connu. | Un tracé qui grandit à chaque mouvement se re-rend : moins fluide que Skia sur un long trait. | **Oui** |
| **WebView** + canvas | App de l'hôte | Réutilise le canvas web tel quel. | Module natif, échanges WebView ↔ app à gérer, latence. | **Oui** |
| **Traits en `View`** (segments tournés) | App de l'hôte | Aucun module. | Des centaines de vues, saccades ; seau impossible sans des centaines de rectangles. Non recommandé. | Non |

**Recommandation :**
- Site des joueurs : `<canvas>` HTML.
- Hôte qui joue : **pas de dessin au MVP** (décision D1). Il devine comme les autres et son tour de dessin est sauté.
- Si vous voulez que l'hôte dessine : **Skia**, ajouté dans **un seul** build EAS, idéalement le même que celui de la publication Cast (chantier d), pour ne pas gâcher de build (4 sur 15 utilisés).
- Le format des données et le calcul du seau sont conçus pour être indépendants de la plateforme : brancher Skia plus tard ne changera ni la base ni la TV.

## 2. Données Firebase

### Coordonnées et encodage
- Surface logique fixe de **640 × 480**, en entiers. Le téléphone et la TV mettent à l'échelle.
- Palette fixe de 12 couleurs (index 0 à 11, l'index 0 étant le fond blanc) et 4 épaisseurs (index 0 à 3). Aucune couleur libre : c'est plus court et ça se valide.
- Trait : points lissés par Ramer-Douglas-Peucker (tolérance d'environ 1,5 px), puis codés en différences (`dx`, `dy`) en base 36.
- **Gomme** : un trait de la couleur du fond (index 0).
- **Seau** : calculé sur le téléphone, sur une grille logique de **320 × 240**. Les traits y sont tracés par notre propre code TypeScript (Bresenham épaissi, sans lissage), donc le résultat est déterministe et testable. On remplit la zone, puis on l'envoie en **segments horizontaux** (`y, x, longueur`, compressés). La TV peint ces segments avec `fillRect` (échelle ×2). Elle ne recalcule rien, donc le résultat est identique par construction.
- **Annuler** : opération `u` qui retire la dernière opération entière (trait ou seau). Côté TV, on repeint depuis le début en rejouant la liste (voir les risques).
- **Tout effacer** (à valider, D9) : opération `x`.

### Arborescence (sous `sessions/{code}/`)

| Nœud | Contenu | Écrit par | Lu par |
|---|---|---|---|
| `drawTurn` | `{ drawer: uid, round: n, wordLength, category?, changedWord?: true }` (pour la manche en cours) | hôte | tous (champ public) |
| `drawing/{chunk}` | `"<seq>:<ops>"`, une chaîne de 4 000 caractères au plus, `{chunk}` de `0` à `399` | dessinateur seulement, pendant la manche | tous (champ public) |
| `drawFound/{uid}` | heure (serveur) à laquelle le joueur a trouvé | hôte | tous (qui a trouvé, jamais quoi) |
| `drawSecret` | `{ word, category }` | hôte | **hôte et dessinateur seulement** |
| `drawWordChange` | `true`, une seule fois | dessinateur | hôte |
| `drawGuess/{uid}` | `{ text, count, at }`, réécrit à chaque essai | ce joueur | **hôte seulement** (comme `answers`) |
| `drawHint/{uid}` | `"close"` ou `"wrong"` (« Tu es proche ! », « Pas ça… ») | hôte | **ce joueur seulement** |

- `drawing`, `drawFound` et `drawHint` ne concernent que la manche en cours. L'hôte les vide au début de la manche suivante et à « Rejouer ». Le mot est publié à la révélation dans `reveal.correctAnswer`, comme aujourd'hui.
- Les nouveaux champs publics (`drawTurn`, `drawing`, `drawFound`) s'ajoutent à `shared/publicFields.ts`. Leurs règles de lecture doivent être déployées avant les sites.
- `drawSecret` et `drawHint` ne sont **pas** des champs publics : seuls le dessinateur et le joueur concerné s'y abonnent, avec une lecture dédiée.
- La liste des mots est dans le code (`shared/`, environ 200 mots). Elle est donc visible dans le code du site, mais ça ne révèle pas le mot tiré, qui ne vit que dans `drawSecret`.

### Format d'une opération (dans la chaîne `<ops>`, séparées par `|`)
```
s<id>,<couleur>,<épaisseur>:<x0>,<y0>;<dx>,<dy>;…   début d'un trait
c<id>:<dx>,<dy>;…                                   suite du même trait (il dure plus de 300 ms)
f<couleur>:<y>,<x>,<n>;<dy>,<x>,<n>;…               seau (segments, grille 320 × 240)
u                                                    annuler la dernière opération
x                                                    tout effacer (si D9)
```
Le numéro de paquet `seq` permet à la TV de les appliquer dans l'ordre même s'ils arrivent en désordre.

### Volume estimé
- Environ 40 s de dessin actif sur 75 s. Un téléphone échantillonne vers 60 Hz, soit environ 2 400 points bruts. Après lissage, il en reste **600 à 1 000**, à environ 4 caractères par point : **3 à 5 Ko**.
- Un seau occupe 1 à 4 Ko selon la forme. Avec 3 seaux, une manche fait **10 à 20 Ko** au total.
- Un paquet toutes les 300 ms donne au plus 250 paquets, de 50 à 300 octets chacun.
- Pour la TV et chaque joueur, c'est négligeable. Les devineurs ne téléchargent même pas le dessin : seule la TV s'y abonne.

### Latence
- 300 ms de regroupement, plus 100 à 300 ms d'aller-retour Firebase, donnent **0,3 à 0,7 s** de retard sur la TV. C'est acceptable pour un Pictionary.
- Si c'est trop lent sur la box, le regroupement peut descendre à 150 ms. Je le mesurerai au lot 2, avec un horodatage par paquet affiché dans `?perf=1`.

### Règles de sécurité (à écrire avec leurs tests sur l'émulateur)
- `drawing/$chunk` :
  - écriture seulement si `auth.uid == drawTurn.drawer` et `status == 'question'` ;
  - `$chunk` correspond à `^([0-9]|[1-9][0-9]|[1-3][0-9][0-9])$` ;
  - la valeur est une chaîne de 4 000 caractères au plus, et la création seulement (`!data.exists()`) : un paquet n'est jamais réécrit.
- `drawSecret` : lecture par `auth.uid == hostUid || auth.uid == drawTurn.drawer` ; écriture par l'hôte seul.
- `drawGuess/$uid` :
  - écriture par ce joueur seul, pendant `question`, et s'il n'est pas le dessinateur ;
  - en Groupe, seulement s'il est de l'équipe du dessinateur ;
  - `count == data.count + 1` et `count <= 15` (15 essais par manche) ;
  - `at == now` et au moins 1,5 s depuis l'essai précédent (`now >= data.at + 1500`) : contre le « mitraillage » de mots ;
  - texte de 40 caractères au plus.
- `drawHint/$uid` : lecture par `auth.uid == $uid` ; écriture par l'hôte.
- `drawWordChange` : écriture par le dessinateur, une seule fois (`!data.exists()`), avant son premier trait (`!root…drawing.exists()`).

## 3. Risques et comment je les teste

| Risque | Parade | Test |
|---|---|---|
| **Dessin au doigt saccadé** (site des joueurs) | Canvas tracé à chaque événement de pointeur (sans React entre le doigt et le trait) ; points intermédiaires `getCoalescedEvents` ; envoi groupé à part. | Prototype (lot 1) sur votre téléphone Android et un iPhone : trait suivi au doigt, aucun défilement ni zoom de la page. |
| **Rendu sur la box** (Chromium 92) | Canvas 2D de 640 × 480 agrandi en CSS ; seuls les nouveaux paquets sont dessinés ; aucune animation sur le canvas. | Banc d'essai du lot 1 sur la box : dessin enregistré rejoué en temps réel avec `?perf=1` (images/s, tâches longues), en 1080p et 720p, musique active. |
| **Annuler oblige à tout repeindre** | Repeindre en rejouant la liste. Si c'est trop lent sur la box, garder une image intermédiaire (`getImageData`) toutes les 30 opérations. | Banc d'essai : 20 annulations d'affilée sur un dessin de 300 opérations, avec la mesure de la plus longue tâche. |
| **Seau différent sur le téléphone et la TV** | Calculé une seule fois (téléphone), envoyé en segments (voir § 2). | Tests unitaires du remplissage (formes fermées, fuites par un trou, bords) ; sur le prototype, comparaison téléphone et TV. |
| **Seau qui « fuit » ou laisse un liseré** | La grille logique trace les traits un peu plus épais que l'écran (+1 px) ; la TV peint les seaux **sous** les traits suivants. | Tests unitaires et captures. |
| **Volume de données** | Lissage, chaînes compactes, limites des règles (4 000 caractères × 400 paquets au plus). | Mesure du volume réel d'une manche au lot 2 (compteur dans `?perf=1`). |
| **Tricherie : écrire le mot en lettres** | Impossible à empêcher techniquement. Consigne sur l'écran du dessinateur (« Ni lettres ni chiffres ») ; l'hôte peut annuler la manche (D8). | — |
| **Tricherie : lire le mot** | Seuls l'hôte et le dessinateur peuvent lire `drawSecret`. La TV ne le lit jamais. | Tests des règles : un devineur, un autre joueur et la TV ne peuvent pas le lire. |
| **Tricherie : essayer beaucoup de mots** | 15 essais au plus, 1,5 s d'écart (règles). | Tests des règles. |
| **Dessinateur déconnecté** | L'hôte voit `connected = false` pendant la manche : il l'annule, sans points pour personne, puis passe à la suite. | Tests du moteur et partie sur l'émulateur. |
| **Pas de TV** (plan B absent) | Décision D2. | — |

## 4. Lots (un commit local chacun)

| Lot | Contenu | Effort (mon travail) | Votre test |
|---|---|---|---|
| **0. Spec** | § 19 de la spec avec vos décisions. | 0,5 j | Relecture |
| **1. Prototype du dessin, sans Firebase** | Logique pure `shared/drawing/` : encodage, lissage, grille et seau, segments, avec tests. Page de démo `/debug/draw` du site des joueurs (canvas, couleurs, épaisseurs, gomme, seau, annuler), avec un bouton qui exporte le dessin. Banc d'essai de la TV, comme le test du son : message Cast `{ "drawBench": true }` depuis `cast-sender.html`, qui rejoue un dessin enregistré en temps réel, avec `?perf=1`. | 2 j | Dessiner sur votre téléphone (Expo web sur le réseau local) ; lancer le banc d'essai sur la box. **Point d'arrêt : on ne continue qu'avec votre accord.** |
| **2. Transport en direct** | Champs `drawTurn` et `drawing`, règles et tests sur l'émulateur ; le téléphone envoie par paquets ; la TV affiche en direct (mode de test `?drawtest=1`). Latence et volume dans `?perf=1`. | 1 j | Déployer les règles, puis dessiner sur le téléphone et regarder la box. |
| **3. Moteur et règles du jeu** | Type `draw` (mode et type de jeu) ; tours de dessin ; fin anticipée ; changement de mot ; annulation si le dessinateur est déconnecté ; jugement (`answerMatching` : pluriel, « proche ») ; points ; Groupe ; série non comptée ; règles et tests. | 2 j | Tests seulement. |
| **4. Mots** | Environ 200 mots faciles à moyens en 8 à 10 catégories (`shared/drawWords.ts` ou `content/`) ; relecture `docs/relecture-dessine-moi.md`. | 0,5 j | Relecture de la liste. |
| **5. TV** | Écran de dessin (« Léa dessine ! », dessin en grand, chrono, devineurs allumés quand ils trouvent, indice) ; révélation (mot, dessin final, points) ; Groupe ; sons. | 1,5 j | Box, 1080p et 720p, 20 joueurs. |
| **6. Téléphones** | Dessinateur (mot, outils, canvas, « Changer de mot ») ; devineur (champ, « Pas ça… », « Tu es proche ! », « Trouvé ! ») ; spectateur en Groupe ; hôte qui joue (selon D1). Mesures à 320, 360 et 412 px. | 2 j | Partie réelle. |
| **7. Catalogue, réglages et finitions** | Onglet ou carte « Dessine-moi » ; réglages (manches, D3) ; démos ; docs ; CLAUDE.md ; partie complète sur l'émulateur avec la vraie TV. | 1 j | Partie en famille. |

Au total : environ **10 à 11 jours** de travail de mon côté, plus vos tests. Le seul lot qui demande un déploiement avant d'être testé est le lot 2 (règles de la base). Aucun lot n'impose de build EAS si D1 = « l'hôte ne dessine pas ».

## 5. Décisions dont j'ai besoin

- **D1. L'hôte qui joue dessine-t-il ?**
  - (a) Non au MVP, sans APK (recommandé) : il devine, et son tour est sauté.
  - (b) Oui, avec Skia, dans un build EAS groupé avec la publication Cast.
- **D2. Partie sans TV :**
  - (a) Dessine-moi exige une TV : le lancement est refusé sans TV présente (`isTvPresent`).
  - (b) Le dessin s'affiche aussi sur les téléphones des devineurs (même code de rejeu qu'à la TV, plus de données par téléphone).
- **D3. Nombre de manches.** « Chacun dessine une fois » donne 20 manches d'environ 1 min 45 à 20 joueurs, soit plus de 35 min.
  - Proposition : un réglage « Nombre de manches », par défaut le plus petit de 8 et du nombre de joueurs. Chacun dessine au plus une fois, dans un ordre tiré au hasard.
- **D4. Points du dessinateur.** 300 par devineur donne 5 700 points à 20 joueurs, contre 1 000 au plus pour un devineur : le classement serait faussé.
  - Proposition : 1 000 × la part de devineurs qui ont trouvé (1 000 si tous trouvent, 0 si personne).
- **D5. Indices sur la TV :** la catégorie (« Animal ») et le nombre de lettres (« _ _ _ _ _ ») ? Proposition : oui aux deux.
- **D6. Propositions fausses affichées sur la TV ?** Proposition : non, elles aideraient trop les autres (et l'affichage d'un mot proche donnerait presque la réponse). Seuls les noms de ceux qui ont trouvé s'allument.
- **D7. Changer de mot :** une fois, et seulement avant le premier trait (sinon le dessin déjà fait renseigne sur l'ancien mot). D'accord ?
- **D8. L'hôte peut-il annuler une manche** (mot écrit en lettres, problème technique) ? Cela ajoute un bouton dans ses contrôles.
- **D9. Bouton « Tout effacer »** en plus d'« Annuler » ? Proposition : oui, il ne coûte qu'une opération.
- **D10. Groupe :** le nombre de manches est arrondi à un multiple du nombre d'équipes, et les équipes dessinent chacune leur tour (toutes autant). Les équipes qui ne devinent pas gagnent 0 pour cette manche (elles regardent). Comme chaque équipe a autant de manches, la moyenne reste équitable. D'accord ?
- **D11. Fin anticipée :** la manche s'arrête 2 s après que tous les devineurs connectés ont trouvé (comme le vote du Bluff) ?

## 6. Impacts

- **Moteur et types** (`shared/`) :
  - `answerMode` et `gameType` `draw` ; les `Record<AnswerMode, …>` à compléter (durées, réglages imposés `settingsForGameType`, sans Contrôle ni Rapidité) ;
  - la phase `question` sert de manche de dessin (75 s), suivie de `reveal` et `scores` comme aujourd'hui ;
  - la série n'est pas mise à jour en Dessine-moi (`nextStreak` non appelé) : à écrire dans la spec ;
  - `publicFields` : ajout de `drawTurn`, `drawing` et `drawFound`.
- **Groupe** : seule l'équipe du dessinateur devine ; les autres voient « L'équipe Rose devine, regardez la TV ! » ; le score d'équipe reste la moyenne par question (`teamPoints`) ; la rotation alterne les équipes (D10).
- **Sons (TV)** : réutilisation de l'existant :
  - `questionShown` au début de la manche ;
  - `answerPop` quand quelqu'un trouve, `allAnswered` quand tous ont trouvé ;
  - `clockTick` et `buzzer` à la fin ;
  - `fanfare` ou `miss` à la révélation ;
  - musique de jeu pendant la manche.
  - Un éventuel son « Trouvé ! » propre au jeu serait un ajout facultatif (synthétisé, pas de fichier).
- **Écrans TV** : écran de dessin (le dessin occupe l'essentiel ; nom du dessinateur en grand ; chrono ; devineurs allumés ; indice D5), révélation (mot très gros, dessin final, points), classement inchangé, Groupe (couleur de l'équipe qui devine). Le canvas est la seule partie non CSS : à mesurer sur la box (lot 1).
- **Écrans des téléphones** : dessinateur, devineur, spectateur en Groupe, attente du joueur dont ce n'est pas le tour. La révélation affiche le mot et les points ; aucun rang (une fonction par écran).
- **Hôte** : contrôles (Passer = fin de manche, éventuellement Annuler la manche, D8) ; réglage du nombre de manches ; carte du catalogue.
- **Docs** : spec § 19, `docs/sons.md` (déclencheurs), `docs/relecture-dessine-moi.md` (mots), CLAUDE.md, ce plan mis à jour au fil des lots.
- **Performance** : seule la TV reçoit le dessin. Rien ne change pour les téléphones des devineurs, sauf si D2 = (b).
