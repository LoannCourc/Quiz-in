# Sons de Quiz'in

Règles : spec 17. Ce document liste chaque son, son déclencheur et son volume. Les volumes des effets codés viennent de `shared/sound.ts` (`SOUND_EFFECTS`) : toute modification se fait d'abord là, puis ici.

## Volumes

- **Volume général** : réglé par l'hôte (20, 40, 60, 80 ou 100 ; 60 par défaut), avec une courbe adoucie (`masterGain` : (volume / 100) ^ 1,5).
- **Canal musique** : 35 % du volume général. **Canal effets** : 80 %.
- **Volume d'un effet** : relatif au canal effets (colonne « Volume » ci-dessous).
- **Ducking** : musique à 30 % en 150 ms pendant un effet marqué « oui », retour en 600 ms.

## Effets de la TV

Synthétisés dans le code (`receiver/src/lib/sound/effects.ts`), sans fichier. Déclencheurs : `shared/sound.ts` (`soundCues` pour les changements d'état, `timedCues` pour les sons programmés sur l'horloge du serveur). Aucun son au premier état reçu (TV ouverte ou reconnectée en pleine partie) ; un changement de phase ne sonne que si elle a commencé il y a moins de 2 s ; un son programmé en retard de plus de 400 ms est abandonné ; jamais l'entrée d'une phase à la reprise après une pause.

| Identifiant | Son | Déclencheur | Volume | Ducking |
|---|---|---|---|---|
| `playerJoined` | « bloop-bloop » montant | salon : un nouveau joueur dans `players` | 0,6 | non |
| `teamDraw` | roulette qui ralentit, puis gong | nouveau tirage des équipes (`teamDrawAt`) | 0,8 | oui |
| `countdown` | bip franc | `starting` : 3, 2, 1 (une fois par seconde) | 0,8 | oui |
| `questionShown` | souffle puis accord de cuivres | entrée dans `question` (et dans `vote` du Bluff) | 0,8 | non |
| `answerPop` | « pop » très court | un joueur de plus a répondu (`answeredBy`), a une proposition acceptée (`bluffedBy`) ou a voté (`votedBy`) | 0,4 | non |
| `allAnswered` | petit arpège brillant | le dernier joueur connecté a fini (à la place du « pop ») | 0,7 | non |
| `clockTick` | tic sec | 5 dernières secondes de `question` et `vote` ; rien en blind test ni quand tout le monde a fini | 0,45 | non |
| `buzzer` | buzzer grave | fin du chrono (mêmes exceptions que le tic) | 0,8 | oui |
| `fanfare` | trois notes puis accord tenu | entrée dans `reveal` (hors Bluff), au moins un joueur a trouvé | 0,9 | oui |
| `miss` | « wah-wah » qui descend | entrée dans `reveal` (hors Bluff), personne n'a trouvé | 0,8 | oui |
| `cardFlip` | « flip » | révélation du Bluff : chaque fausse proposition retournée (toutes les 2 s, même calendrier que l'écran : `bluffRevealTimeline`) | 0,6 | non |
| `trapped` | « pouet-pouet » de cuivres graves | 350 ms après une carte retournée qui a des votants | 0,7 | oui |
| `bluffTruth` | accord éclatant et scintillement | révélation du Bluff : la vraie réponse | 0,9 | oui |
| `pointsUp` | notes qui montent vite | entrée dans `scores` | 0,5 | non |
| `rankShuffle` | glissement | 700 ms après l'entrée dans `scores`, si un rang a changé | 0,5 | non |
| `drumroll` | roulement de caisse claire (3 s) | entrée dans `ended` en Suspense (podium affiché à la fin du roulement) | 0,8 | oui |
| `tada` | « ta-daa » puis applaudissements | entrée dans `ended` ; en Suspense, à la fin du roulement | 1 | oui |
| `paused` | deux notes qui descendent | passage à `paused` | 0,7 | non |
| `resumed` | deux notes qui montent | sortie de `paused` (sauf vers `ended`) | 0,7 | non |

Niveaux mesurés par l'auto-test (`?sounds=1&selftest=1`, volume 100) : crête de 0,12 à 0,57, aucun effet saturé.

## Musiques de la TV (lot 3)

Fichiers du développeur (OGG), jamais versionnés : déposés dans `receiver/public/music/` avant `firebase deploy --only hosting:tv`. Crédits : `docs/sons-licences.md`.

| Phase | Musique | Type | Remarque |
|---|---|---|---|
| Salon, tirage des équipes | `Waiting_sound.ogg` (34 s) | boucle | aussi avant un blind test |
| Question et révélation, choix multiples | `Salon_music.ogg` (137 s) | boucle | volume bas ; jamais en blind test |
| Question et révélation, saisie libre (Contrôle compris) | `Bluffecriture_sound.ogg` (70 s) | boucle | jamais en blind test |
| Bluff, écriture | `Bluffecriture_sound.ogg` | boucle | |
| Bluff, vote | `Bluffvote_sound.ogg` (96 s) | boucle | |
| Classement entre les questions | `Classement_sound.ogg` (10 s) | jingle, une fois | puis la musique de la phase suivante |
| Classement final | `Findepartie_sound.ogg` (17 s) | jingle, une fois | puis silence |
| Question et révélation d'un blind test | aucune | | l'extrait Deezer joue seul |

Contraintes : boucles sans coupure, OGG Vorbis, moins de 1,5 Mo par fichier, moins de 5 Mo en tout. Mesures du 5 octobre 2026 : `Salon_music.ogg` 1,87 Mo (au-delà), environ 50 Mo une fois décodé (137 s, stéréo, 48 kHz) ; total 5,7 Mo (au-delà). À raccourcir avant le lot 3.

## Effets des téléphones (lot 4)

Désactivés par défaut, activés par chaque joueur sur son téléphone : proposition envoyée, refus, vote envoyé, « Bien vu ! », « Piégé ! », avec une vibration de 30 à 50 ms (Android). Hôte : vibration seule.

## Tester

- **Navigateur** (dans `receiver/`, `npm run dev`) : galerie `http://localhost:5173/?sounds=1` (chaque effet, réglages, boucle témoin, ducking) ; `?sounds=1&selftest=1` calcule chaque effet hors ligne et affiche sa durée, sa crête et son niveau moyen (« SATURÉ » au-delà de 1, « MUET » si rien ne sort). La démo `?status=lobby` joue aussi les effets quand on change d'état dans le panneau (après un premier clic).
- **Box** (mode Cast) : `receiver/cast-sender.html`, étape 4. « Tester les effets » affiche si le son démarre sans geste et joue chaque effet. « Tester la musique » télécharge un fichier déployé avec la TV (`music/essai.ogg`), le décode (durée, taille, mémoire), le joue en boucle 20 s et baisse la musique à 8 s (ducking).
