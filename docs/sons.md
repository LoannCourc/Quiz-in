# Sons de Quiz'in

Règles : spec 17. Ce document liste chaque son, son déclencheur et son volume. Les volumes des effets codés viennent de `shared/sound.ts` (`SOUND_EFFECTS`) : toute modification se fait d'abord là, puis ici.

## Volumes

- **Volume général** : réglé par l'hôte (20, 40, 60, 80 ou 100 ; 60 par défaut), avec une courbe adoucie (`masterGain` : (volume / 100) ^ 1,5).
- **Canal musique** : 35 % du volume général. **Canal effets** : 80 %.
- **Volume d'un effet** : relatif au canal effets (colonne « Volume » ci-dessous).
- **Ducking** : musique à 30 % en 150 ms pendant un effet marqué « oui », retour en 600 ms.

## Effets de la TV

Synthétisés dans le code (`receiver/src/lib/sound/effects.ts`), sans fichier. « Prévu » : valeur de départ, réglée à l'oreille au lot indiqué.

| Identifiant | Son | Déclencheur | Volume | Ducking | Lot |
|---|---|---|---|---|---|
| `playerJoined` | « bloop-bloop » montant | salon : un nouveau joueur dans `players` | 0,6 | non | 1 |
| `questionShown` | souffle puis accord majeur | passage à `question` (nouvelle question, pas une reprise) | 0,8 | non | 1 |
| `paused` | deux notes qui descendent | passage à `paused` | 0,7 | non | 1 |
| `resumed` | deux notes qui montent | sortie de `paused` (sauf vers `ended`) | 0,7 | non | 1 |
| décompte | « 3, 2, 1 » | `starting`, chaque seconde avant `phaseEndsAt` | 0,8 prévu | oui | 2 |
| un joueur a répondu | petit « pop » | `answeredBy` (ou `bluffedBy`, `votedBy`) augmente | 0,4 prévu | non | 2 |
| tous ont répondu | accord bref | ce nombre atteint le nombre de joueurs connectés | 0,7 prévu | non | 2 |
| tic du chrono | tic discret | 5 dernières secondes de `question` et `vote` (pas en blind test) | 0,4 prévu | non | 2 |
| buzzer | buzzer | fin du chrono (pas si tout le monde a répondu, pas en blind test) | 0,8 prévu | oui | 2 |
| fanfare | fanfare courte | révélation, au moins un joueur a trouvé | 0,9 prévu | oui | 2 |
| raté | « wah-wah » | révélation, personne n'a trouvé | 0,8 prévu | oui | 2 |
| points | notes montantes | entrée dans `scores` | 0,5 prévu | non | 2 |
| classement | glissement | `scores`, un rang a changé | 0,5 prévu | non | 2 |
| carte retournée | « flip » | révélation du Bluff, toutes les 2 s (même calendrier que l'écran) | 0,6 prévu | non | 2 |
| vraie réponse | accord éclatant | révélation du Bluff, fin des cartes retournées | 0,9 prévu | oui | 2 |
| piégé | rire de cuivres | carte retournée qui a des votants | 0,7 prévu | oui | 2 |
| roulement de tambour | roulement | `ended` en Suspense, avant le podium | 0,8 prévu | oui | 2 |
| tada | tada et applaudissements | `ended` | 1 prévu | oui | 2 |
| tirage des équipes | roulette puis gong | écran du tirage des équipes | 0,8 prévu | oui | 2 |

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

- **Navigateur** (dans `receiver/`, `npm run dev`) : galerie `http://localhost:5173/?sounds=1` (chaque effet, réglages, boucle témoin, ducking). La démo `?status=lobby` joue aussi les effets quand on change d'état dans le panneau (après un premier clic).
- **Box** (mode Cast) : `receiver/cast-sender.html`, étape 4. « Tester les effets » affiche si le son démarre sans geste et joue chaque effet. « Tester la musique » télécharge un fichier déployé avec la TV (`music/essai.ogg`), le décode (durée, taille, mémoire), le joue en boucle 20 s et baisse la musique à 8 s (ducking).
