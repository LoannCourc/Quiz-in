# Musiques allégées : préparation (rien n'est appliqué)

Option C du lot b (`docs/plan-fiabilite-tv.md`), préparée en attendant les mesures à 20 joueurs avec musique active. **À n'appliquer que si les seuils ne sont pas tenus** (minuteur ≤ 1,2 s, transition ≤ 1 s, ≥ 30 images/s) et après validation à l'oreille.

## Ce que joue la box aujourd'hui

La TV décode chaque fichier en entier, le rééchantillonne à 32 kHz et le **mixe déjà en mono** (`MUSIC_SAMPLE_RATE` et `decodeMusic`, `receiver/src/lib/sound/musicPlayer.ts`). La stéréo des fichiers n'est donc jamais entendue. Passer les fichiers en mono ne change rien à l'écoute ; seul le passage de 32 à 24 kHz est à juger à l'oreille.

Un fichier stéréo coûte cher au décodage :
- `decodeAudioData` produit d'abord une copie stéréo complète ;
- notre code la mixe ensuite en mono sur le fil principal (celui qui dessine l'écran).

Le pic de mémoire atteint donc environ 3 fois la taille décodée. Un fichier déjà mono saute ces deux étapes : le code le garde tel quel.

## Fichiers et cibles

Fichiers lus le 6 octobre 2026. Cible commune : **mono, 24 kHz, Ogg Vorbis qualité 4** (environ 50 à 60 kb/s en mono).

| Fichier | Rôle | Aujourd'hui | Décodé aujourd'hui (pic) | Cible | Décodé allégé (pic) | Fichier allégé (estimé) |
|---|---|---|---|---|---|---|
| `Waiting_sound.ogg` | salon, pause (boucle) | 33,7 s, stéréo 48 kHz, 69 kb/s, 0,28 Mo | 4,1 Mo (12,3) | mono 24 kHz, durée inchangée | 3,1 Mo (3,1) | 0,23 Mo |
| `Salon_music.ogg` | questions en choix multiples (boucle) | 137,1 s, stéréo 48 kHz, 115 kb/s, 1,87 Mo | 16,7 Mo (50,2) | mono 24 kHz ; **boucle de 68 s en option** | 12,6 Mo (12,6) ; boucle de 68 s : 6,2 Mo | 0,94 Mo ; boucle de 68 s : 0,46 Mo |
| `Bluffecriture_sound.ogg` | écriture du Bluff, saisie libre (boucle) | 69,9 s, stéréo 44,1 kHz, 115 kb/s, 0,96 Mo | 8,5 Mo (25,6) | mono 24 kHz, durée inchangée | 6,4 Mo (6,4) | 0,48 Mo |
| `Bluffvote_sound.ogg` | vote et révélation du Bluff (boucle) | 96,0 s, stéréo 44,1 kHz, 105 kb/s, 1,20 Mo | 11,7 Mo (35,2) | mono 24 kHz ; **boucle de 48 s en option** | 8,8 Mo (8,8) ; boucle de 48 s : 4,4 Mo | 0,66 Mo ; boucle de 48 s : 0,33 Mo |
| `Findepartie_sound.ogg` | jingle de fin (une fois) | 16,7 s, stéréo 44,1 kHz, 117 kb/s, 0,23 Mo | 2,0 Mo (6,1) | mono 24 kHz | 1,5 Mo (1,5) | 0,11 Mo |
| **Total** | | 4,7 Mo | 43,1 Mo (pic de décodage jusqu'à 50 Mo) | | 32,4 Mo ; boucles raccourcies : 21,6 Mo | environ 2,4 Mo ; boucles raccourcies : environ 1,6 Mo |

Gains attendus :
- **Décodage** : environ 4 fois moins d'échantillons à décoder (1 canal à 24 kHz au lieu de 2 à 44,1 ou 48 kHz). Le mixage mono sur le fil principal disparaît (65 ms sur PC pour `Salon_music`, sans doute plusieurs centaines de ms sur la box). Ces durées sont **estimées** à partir du nombre d'échantillons ; à mesurer sur la box avec le panneau (ligne « Dernier décodage »).
- **Pic de mémoire** : divisé par 4 (plus de copie stéréo).
- **Mémoire gardée** : divisée par 1,33 grâce à 24 kHz. Elle l'est par 2 de plus sur les boucles raccourcies (Bluff : 26 Mo aujourd'hui, environ 18 Mo, puis 14 Mo avec la boucle du vote raccourcie).
- **Téléchargement** : environ deux fois moins de données sur le réseau de la box.

Code à changer le jour où on applique (petit, à faire avec les fichiers) :
- `MUSIC_SAMPLE_RATE` passe de 32 000 à 24 000. Sans cela, un fichier à 24 kHz serait remonté à 32 kHz et le gain de mémoire gardée serait perdu ; le gain sur le pic et le mixage mono resterait.
- Nouveaux noms de fichiers (par exemple `Salon_music_v2.ogg`) dans `shared/musicTracks.ts` : le cache de `/music/**` dure un jour, un nouveau nom évite d'attendre.

Les boucles raccourcies sont **facultatives**. Il faut couper à la fin d'une phrase musicale pour que le retour au début ne s'entende pas. C'est un travail d'oreille : à ne garder que si la boucle est parfaite.

## Licence Pixabay : modifier les fichiers est autorisé

Conditions de Pixabay (Content License, version du 18 novembre 2024 : pixabay.com/service/terms) :
- **Accordé** : le droit « irrévocable, mondial, perpétuel, non exclusif et gratuit de télécharger, utiliser, copier, **modifier ou adapter** le contenu, à des fins commerciales ou non ». Aucune mention de l'auteur n'est obligatoire (Quiz'in les crédite déjà dans « À propos et crédits »).
- **Interdit** : vendre ou distribuer le contenu « tel quel » (« Standalone » : sans apport créatif, sous une forme proche de l'original). Les conditions précisent qu'appliquer un filtre ou recadrer ne suffit pas à en sortir, mais qu'intégrer le contenu dans une œuvre (images, vidéo, texte, montage) en sort.
  - Ici, les musiques sont la bande-son d'un jeu, intégrées à la TV : c'est une utilisation dans une œuvre, pas une distribution « tel quel ».
  - Le passage en mono et à 24 kHz ne change rien à cette analyse : il n'est ni exigé ni interdit.
  - Limite connue : les fichiers restent téléchargeables un par un depuis le site public de la TV, comme toute ressource web. C'est le cas aujourd'hui aussi.
- Je ne suis pas juriste : en remplissant `docs/sons-licences.md` (colonne « Diffusion web autorisée », aujourd'hui « à vérifier »), ouvre la page de chaque morceau sur Pixabay. Vérifie qu'aucune mention particulière n'y figure, par exemple un morceau enregistré auprès d'un service d'identification de contenu, et note la date.

## Procédure d'écoute (à valider à l'oreille)

Outil : **Audacity** (gratuit, audacityteam.org), à installer sur le PC. Rien ne s'installe dans le dépôt.

### 1. Préparer trois versions de chaque morceau

Dans un dossier hors du dépôt, par exemple `C:\dev\sons-essai\` :

1. Ouvrir le fichier d'origine (`receiver\public\music\Salon_music.ogg`) dans Audacity.
2. **Référence** (ce que joue la TV aujourd'hui) : Fichier → Exporter l'audio → format « Fichiers Ogg Vorbis », Canaux : **Mono**, Fréquence : **32000 Hz**, Qualité : **10** (la plus haute, pour n'entendre que l'effet du mono 32 kHz). Nom : `Salon_music-ref32.ogg`.
3. **Allégé** : même chemin, Canaux : **Mono**, Fréquence : **24000 Hz**, Qualité : **4**. Nom : `Salon_music-24k.ogg`.
4. En option, une variante **22 050 Hz** (qualité 4) : `Salon_music-22k.ogg`, pour savoir si l'on peut descendre encore.

Si la fenêtre d'export n'a pas les champs Canaux et Fréquence (ancienne version d'Audacity) :
- Pistes → Mixage → Mixer la piste stéréo en mono ;
- puis régler la fréquence du projet en bas à gauche (ou Audio → Paramètres) avant d'exporter.

### 2. Écouter au casque sur le PC, à l'aveugle

1. Ouvrir la référence et l'allégé dans le même projet Audacity : deux pistes alignées.
2. Une autre personne lance, au hasard et sans dire laquelle, l'une des deux pistes (bouton **Solo** de la piste), 10 fois de suite, sur le même passage de 15 s.
3. Noter à chaque fois « référence » ou « allégé ».

Si tu reconnais l'allégé 7 fois sur 10 ou moins, la différence est négligeable. Écouter surtout les cymbales, les voix et les aigus brillants : c'est là que 24 kHz s'entend (rien au-dessus de 12 kHz).

### 3. Écouter sur la TV, par le vrai lecteur de la box

C'est la validation qui compte : haut-parleurs de la TV, même décodage que pendant une partie.

1. Copier temporairement les versions d'essai dans `receiver\public\music\` (dossier ignoré par Git), avec des noms d'essai : `essai-Salon_music-24k.ogg`, `essai-Salon_music-ref32.ogg`.
2. Déployer la TV : `firebase deploy --only hosting:tv`. Le build signale des « fichiers inattendus » : c'est normal pour un essai.
3. Sur le PC : `npm run dev` dans `receiver/`, puis `http://localhost:5173/cast-sender.html`.
   - Connexion à « TV Salon » (étape 1).
   - Étape 4, champ « Fichier déployé avec la TV » : `music/essai-Salon_music-ref32.ogg`, puis « Tester la musique ».
   - Même chose avec `music/essai-Salon_music-24k.ogg`.
   - L'écran de test affiche le temps de décodage, la mémoire, puis fait tourner la musique en boucle (on entend le raccord). Note le temps de décodage : c'est la mesure du gain sur la box.
   - Il décode avec le réglage actuel de la TV (32 kHz). La mémoire affichée pour l'allégé reste donc celle d'un 32 kHz, et le temps inclut sa remontée à 32 kHz. Le gain dû au mono (ni copie stéréo ni mixage) est déjà visible ; celui des 24 kHz n'apparaîtra qu'avec le changement de `MUSIC_SAMPLE_RATE`.
4. Écouter depuis le canapé, au volume habituel d'une partie, en alternant 3 ou 4 fois.
5. **Après l'essai** : retirer les fichiers `essai-*` de `receiver\public\music\`, puis redéployer la TV pour qu'ils disparaissent du site.

### 4. Pour une boucle raccourcie (facultatif)

1. Dans Audacity, sélectionner la portion à garder, en commençant et finissant sur un temps fort (début de mesure).
2. Sélection → Aux passages par zéro (touche Z), pour éviter un clic au raccord.
3. Écouter le raccord en boucle : Maj + Espace joue la sélection en boucle. Aucun saut ni clic ne doit s'entendre.
4. Exporter comme l'allégé (mono, 24 kHz, qualité 4), puis tester sur la TV comme à l'étape 3, en laissant tourner deux ou trois boucles.

### 5. Ce que tu valides

Pour chaque morceau :
- 24 kHz acceptable, ou 32 kHz à garder ;
- 22 kHz acceptable, oui ou non ;
- boucle raccourcie retenue, oui ou non ;
- temps de décodage relevé sur la box (référence / allégé).

Avec ces réponses, et seulement si les mesures à 20 joueurs l'exigent, j'appliquerai les fichiers retenus et le changement de `MUSIC_SAMPLE_RATE`.
