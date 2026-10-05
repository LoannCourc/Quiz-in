# Sons de Quiz'in

Règles : spec 17. Ce document liste chaque son, son déclencheur et son volume. Les volumes des effets codés viennent de `shared/sound.ts` (`SOUND_EFFECTS`) : toute modification se fait d'abord là, puis ici.

## Volumes

- **Volume général** : réglé par l'hôte (20, 40, 60, 80 ou 100 ; 60 par défaut), avec une courbe adoucie (`masterGain` : (volume / 100) ^ 1,5).
- **Canal musique** : 35 % du volume général. **Canal effets** : 80 %.
- **Volume d'un effet** : relatif au canal effets (colonne « Volume » ci-dessous).
- **Ducking** : musique à 30 % en 150 ms pendant un effet marqué « oui », retour en 600 ms.

## Effets de la TV

Synthétisés dans le code (`receiver/src/lib/sound/effects.ts`), sans fichier. Déclencheurs : `shared/sound.ts` (`soundCues` pour les changements d'état, `timedCues` pour les sons programmés sur l'horloge du serveur). Aucun son au premier état reçu (TV ouverte ou reconnectée en pleine partie) ; un changement de phase ne sonne que si elle a commencé il y a moins de 2 s ; un son programmé en retard de plus de 400 ms est abandonné ; jamais l'entrée d'une phase à la reprise après une pause.

Arrivée du classement et du podium : calendrier commun à l'écran et aux sons, `shared/rankingTimeline.ts` (délais des animations CSS calés sur l'heure du serveur, `receiver/src/hooks/useEntryDelay.ts`).

| Identifiant | Son | Déclencheur | Volume | Ducking |
|---|---|---|---|---|
| `playerJoined` | « bloop-bloop » montant | salon : un nouveau joueur dans `players` | 0,6 | non |
| `playerLeft` | « bloop » descendant, plus discret | salon : un joueur retiré de `players` | 0,4 | non |
| `teamDraw` | roulette qui ralentit, puis gong | nouveau tirage des équipes (`teamDrawAt`) | 0,8 | oui |
| `countdown` | bip franc | `starting` : 3, 2, 1 (une fois par seconde) | 0,8 | oui |
| `go` | coup grave, bip aigu tenu et accord de cuivres | première question de la partie (`starting` → `question`, question 1) ; remplace `questionShown` | 0,9 | oui |
| `questionShown` | souffle puis accord de cuivres | entrée dans `question` (questions suivantes) et dans `vote` du Bluff | 0,8 | non |
| `answerPop` | « pop » très court | un joueur de plus a répondu (`answeredBy`), a une proposition acceptée (`bluffedBy`) ou a voté (`votedBy`) | 0,4 | non |
| `allAnswered` | petit arpège brillant | le dernier joueur connecté a fini (à la place du « pop ») | 0,7 | non |
| `clockTick` | tic sec | 5 dernières secondes de `question` et `vote` ; rien en blind test ni quand tout le monde a fini | 0,45 | non |
| `buzzer` | buzzer grave | fin du chrono (mêmes exceptions que le tic) | 0,8 | oui |
| `validationStart` | trois petits bips montants (« scanner ») | Contrôle : entrée dans `validation` | 0,5 | non |
| `validated` | coup de tampon puis tintement | Contrôle : entrée dans `reveal` depuis `validation` (résultats publiés) ; la fanfare ou le « raté » suit 500 ms plus tard | 0,7 | non |
| `fanfare` | trois notes puis accord tenu | entrée dans `reveal` (hors Bluff), au moins un joueur a trouvé ; en Contrôle, 500 ms après `validated` | 0,9 | oui |
| `miss` | « wah-wah » qui descend | comme la fanfare, quand personne n'a trouvé | 0,8 | oui |
| `cardFlip` | « flip » | révélation du Bluff : chaque fausse proposition retournée (toutes les 2 s, même calendrier que l'écran : `bluffRevealTimeline`) | 0,6 | non |
| `trapped` | « pouet-pouet » de cuivres graves | 350 ms après une carte retournée qui a des votants | 0,7 | oui |
| `bluffTruth` | accord éclatant et scintillement | révélation du Bluff : la vraie réponse | 0,9 | oui |
| `pointsUp` | notes qui montent vite | entrée dans `scores` | 0,5 | non |
| `rowEnter` | note pincée, de plus en plus aiguë (gamme majeure) | `scores` : chaque ligne qui arrive, de la dernière à la première, à 400 ms puis toutes les 250 ms (5 joueurs au plus, ou les équipes) | 0,45 | non |
| `rankShuffle` | glissement | 400 ms après l'arrivée de la première place, si un rang de joueur a changé (pas en Groupe) | 0,5 | non |
| `drumroll` | roulement de caisse claire (3 s) | entrée dans `ended` en Suspense (la TV et les téléphones attendent la fin du roulement) | 0,8 | oui |
| `podiumThird` | accord court et grave | `ended` : le 3e arrive sur le podium (300 ms, après le roulement en Suspense) | 0,7 | oui |
| `podiumSecond` | accord plus haut | `ended` : le 2e arrive, 800 ms après le 3e | 0,8 | oui |
| `tada` | « ta-daa » puis applaudissements | `ended` : le 1er arrive, 800 ms après le 2e | 1 | oui |
| `replay` | souffle qui monte, puis « ping » | Rejouer : retour au salon depuis `ended` | 0,6 | non |
| `paused` | deux notes qui descendent | passage à `paused` | 0,7 | non |
| `resumed` | deux notes qui montent | sortie de `paused` (sauf vers `ended`) | 0,7 | non |

Niveaux mesurés par l'auto-test (`?sounds=1&selftest=1`, volume 100) : crête de 0,12 à 0,73, aucun effet saturé.

**Équipes validées** (`teamsValidated`, clic de verrou puis scintillement qui monte, volume 0,7, sans ducking) : « Valider les équipes » publie `teamsValidatedAt` (heure, écrit par l'hôte seul, lisible par tous, `teamsValidatedUpdate` de `shared/teams.ts`, seulement avec des équipes complètes) ; la TV joue le son à chaque nouvelle validation récente.

## Musiques de la TV (lot 3)

Fichiers du développeur (OGG), jamais versionnés : déposés dans `receiver/public/music/` avant `firebase deploy --only hosting:tv`. Crédits : `docs/sons-licences.md`. Manifeste (fichier, volume, boucle ou jingle) : `shared/musicTracks.ts` ; choix de la musique selon la phase : `musicPlan` de `shared/music.ts` ; lecture : `receiver/src/lib/sound/musicPlayer.ts`.

| Phase | Musique | Type | Volume | Remarque |
|---|---|---|---|---|
| Salon, tirage des équipes, 3-2-1 | `Waiting_sound.ogg` (34 s) | boucle | 1 | aussi dans une partie de blind test |
| Question et révélation, choix multiples | `Salon_music.ogg` (137 s) | boucle | 0,5 | jamais en blind test |
| Question, validation et révélation, saisie libre | `Bluffecriture_sound.ogg` (70 s) | boucle | 0,8 | jamais en blind test |
| Bluff, écriture | `Bluffecriture_sound.ogg` | boucle | 0,8 | |
| Bluff, vote et révélation | `Bluffvote_sound.ogg` (96 s) | boucle | 0,8 | |
| Classement entre les questions | `Classement_sound.ogg` (10 s) | jingle, une fois | 1 | dès le début du classement ; écourté par la phase suivante (fondu de sortie de 600 ms), dont la musique démarre à temps |
| Classement final | `Findepartie_sound.ogg` (17 s) | jingle, une fois | 1 | en entier, après le roulement en Suspense ; puis silence |
| Question et révélation d'un blind test | aucune | | | silence avant l'extrait (fondu de 300 ms, fini à la fin du 3-2-1 ou du classement) |

Volumes : relatifs au canal musique (35 % du volume général, ducking des effets). Fondu enchaîné de 800 ms entre deux musiques ; une même musique continue d'une phase à l'autre. Pause : 30 %.

**Mémoire de la TV.** Pistes décodées en mono à 32 kHz (`MUSIC_SAMPLE_RATE`), 32 Mo au plus en mémoire (`MUSIC_MEMORY_BUDGET_BYTES`), les moins récemment utilisées libérées au-delà ; fichiers compressés gardés (4,7 Mo). Mesures (Chrome du PC) : `Salon_music` 16,7 Mo décodée (au lieu d'environ 50 Mo en stéréo 48 kHz) ; partie de choix multiples environ 24 Mo, partie de Bluff environ 28 Mo. Pendant le décodage de `Salon_music`, le navigateur occupe brièvement environ 33 Mo de plus (stéréo avant le passage en mono).

**Tailles** (5 octobre 2026) : 4,7 Mo en tout (limite 5 Mo). `Salon_music.ogg` 1,87 Mo, au-delà de la limite de 1,5 Mo par fichier : le build l'avertit, sans bloquer.

## Effets des téléphones (lot 4)

**Activés par défaut, très discrets**, avec un interrupteur sur l'écran de saisie du pseudo et en jeu (réglage gardé sur le téléphone). Sur iPhone, rien ne sort en mode silencieux. Aucun son de téléphone pendant un blind test.

| Son | Déclencheur |
|---|---|
| bienvenue | le joueur valide son pseudo et son avatar |
| clic d'envoi | appui sur « Envoyer » (réponse, proposition de Bluff) |
| proposition envoyée | proposition de Bluff acceptée |
| refus | proposition de Bluff refusée |
| vote envoyé | vote du Bluff confirmé |
| « Bien vu ! » | révélation du Bluff, vraie réponse trouvée |
| « Piégé ! » | révélation du Bluff, piégé par une fausse réponse |

Avec une vibration de 30 à 50 ms (Android ; Safari ne vibre pas). Hôte (app Android) : vibration seule, sans dépendance.

## Tester

- **Navigateur** (dans `receiver/`, `npm run dev`) : galerie `http://localhost:5173/?sounds=1` (chaque effet, réglages, boucle témoin, ducking) ; `?sounds=1&selftest=1` calcule chaque effet hors ligne et affiche sa durée, sa crête et son niveau moyen (« SATURÉ » au-delà de 1, « MUET » si rien ne sort). Boutons « Musique : … » : chaque piste seule (boucle ou jingle), avec la mémoire des musiques décodées. La démo `?status=lobby` joue aussi les effets et les musiques quand on change d'état dans le panneau (après un premier clic) ; un fichier absent y est remplacé par la boucle témoin.
- **Box** (mode Cast) : `receiver/cast-sender.html`, étape 4. « Tester les effets » affiche si le son démarre sans geste et joue chaque effet. « Tester la musique » télécharge un fichier déployé avec la TV (par exemple `music/Salon_music.ogg`), le décode comme pendant la partie (mono, 32 kHz : durée, taille, mémoire), le joue en boucle 20 s et baisse la musique à 8 s (ducking).
