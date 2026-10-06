# Plan de fiabilité de la TV (partie B)

Statut : **plan à valider**. Aucun correctif n'est codé. Seule l'instrumentation (lot 1) pourra l'être, après accord.

## Problèmes observés (tests en famille, box Bouygues « Bouygtel 4K », Cast)

| | Symptôme |
|---|---|
| B1 | La TV se met en veille pendant une partie (pendant une question ; le téléphone de l'hôte reste allumé, l'app au premier plan). |
| B2 | Le minuteur saute (par exemple de 18 à 12). |
| B3 | Les changements d'écran arrivent avec 5 à 6 s de retard. |
| B4 | L'animation de fin tourne à environ 20 à 24 images par seconde. |

## Ce que dit déjà le code

- **Récepteur Cast** (`receiver/src/lib/castReceiver.ts`) : `context.start({ disableIdleTimeout: true, skipPlayersLoad: true, … })`. Le récepteur ne se ferme donc pas faute de lecture média. `maxInactivity` garde sa valeur par défaut (10 s). Elle ne concerne que la détection d'un émetteur muet, pas la veille de l'écran.
- **Minuteur** (`components/Countdown.tsx`) :
  - chiffre recalculé à partir de l'échéance absolue `phaseEndsAt` et de l'écart avec l'heure du serveur ;
  - composant isolé, avec un `setTimeout` aligné sur la seconde ;
  - anneau en animation CSS.
  - Conséquence : un saut de 18 à 12 ne vient pas d'une dérive de calcul. **Le fil principal de la page a été bloqué (ou mis en pause) pendant environ 6 s.** C'est très probablement la même cause que B3.
- **Lecture de la base** (`hooks/useLiveSession.ts`) :
  - un abonnement par champ public ;
  - chaque champ reçu reconstruit tout l'état et provoque un rendu complet de la TV. Une transition de l'hôte écrit plusieurs champs, donc plusieurs rendus complets de suite ;
  - `players` contient tous les joueurs et `answeredBy` change à chaque réponse.
- **Son** :
  - décodage des musiques en entier par `decodeAudioData` (`lib/sound/musicPlayer.ts`) : `Salon_music.ogg` fait 1,87 Mo compressée et 16,7 Mo décodée ; 4,7 Mo de musique en tout ;
  - lecture en Web Audio, et non par un élément `<audio>` / `<video>`. Les extraits de blind test passent, eux, par un `<audio>`.

## Matériel : Bbox 4K (Android TV)

- Processeur **Marvell BG4-CT** (ARM Cortex-A53 quadricœur, entrée de gamme 2017-2018), **2 Go de RAM**, 16 Go de stockage ([androidtv-guide](https://www.androidtv-guide.com/pay-tv-provider/bouygues-telecom-bbox-4k/), [echosdunet](https://www.echosdunet.net/bouygues/equipement/bbox-4k)).
- Récepteur Cast : **Chrome 92** (mesuré sur la box, voir CLAUDE.md).
- **Résolution de rendu de la page : inconnue.**
  - Sur Android TV, le récepteur Cast est souvent rendu en 1280×720, puis agrandi par la box ; sur une box 4K, il peut l'être en 1920×1080.
  - Le panneau `?perf=1` (lot 1) affichera `innerWidth × innerHeight` et `devicePixelRatio` : c'est la mesure qui tranchera.
  - Un rendu en 1080p sur ce processeur coûte 2,25 fois plus de pixels à peindre qu'en 720p.

## 1. Instrumentation (lot 1, seul code autorisé après accord)

Panneau `?perf=1` sur la TV.

- Désactivé par défaut : **aucun coût sans le paramètre**.
- Fonctionne dans la vraie page Cast. Le paramètre est ajouté par le message de l'hôte (`{ "code": "ABCD", "perf": true }`) ou par la page `cast-sender.html`, car l'adresse Cast enregistrée ne porte pas de paramètre.
- En plan B, il suffit d'ajouter `&perf=1` à l'adresse.

### Mesures affichées (petit cadre en coin, rafraîchi 2 fois par seconde)

| Mesure | Comment |
|---|---|
| Images par seconde | Compteur de `requestAnimationFrame` sur 1 s (actif seulement avec `?perf=1`). |
| Tâches longues | `PerformanceObserver` `longtask` (disponible dans Chrome 92) : nombre et durée maximale sur 10 s. |
| Écarts du minuteur | Battement `setInterval` de 250 ms : écart maximal entre deux battements sur 10 s (attendu : 250 ms). |
| Latence d'un état | 1) **Écrit** : heure du serveur où l'hôte publie la phase (`phaseStartedAt`). 2) **Reçu** : heure du serveur estimée quand le champ arrive dans `onValue`. 3) **Affiché** : premier `requestAnimationFrame` après le rendu de React. Les trois écarts sont affichés. |
| Rendus par seconde | Compteur dans le composant racine de la TV. |
| Mémoire | `performance.memory` (Chrome) : tas utilisé et limite. |
| Écran | `innerWidth × innerHeight`, `devicePixelRatio`, version de Chrome. |

### Journal des incidents (30 derniers)

Les seuils sont fixés comme suit :
- battement en retard de plus de 1,5 s ;
- tâche de plus de 200 ms ;
- latence d'un état de plus de 1 s.

Chaque incident note l'heure, le type, la valeur, l'état en cours (`status`, question n°) et, si possible, ce qui tournait (décodage de musique, son, rendu).

- Le journal s'affiche dans le panneau.
- Il est aussi envoyé dans la console : lisible par `chrome://inspect` si la box le permet, sinon en plan B sur PC.

### Côté hôte (même lot, très léger)

Chaque transition écrit déjà `phaseStartedAt` (heure du serveur). En développement, le journal de l'hôte ajoute :
- l'heure locale prévue de la transition ;
- l'heure réelle de l'écriture.

Cela suffit à savoir si **l'hôte publie tard**.

## 2. Hypothèses classées, et comment les confirmer

### Trois retards à distinguer (B2, B3)

1. **L'hôte publie tard** : `phaseStartedAt` est déjà en retard sur l'échéance précédente (`phaseEndsAt`).
   - Test sans outil : les téléphones des joueurs changent d'écran en retard **eux aussi**.
2. **La TV reçoit tard** : grand écart entre « écrit » et « reçu ».
   - Causes possibles : réseau, Wi-Fi de la box, abonnements trop lourds.
3. **La TV affiche tard** : écart entre « reçu » et « affiché », avec des tâches longues dans le journal.

**Premier test, gratuit, à faire dès la prochaine partie** : regarder un téléphone de joueur et la TV en même temps.
- Si le téléphone change d'écran à l'heure et pas la TV, la cause est dans la TV (cas 2 ou 3).
- Si les deux sont en retard, la cause est chez l'hôte (cas 1).

### B2 et B3 : minuteur qui saute, transitions en retard

| Rang | Hypothèse | Pour | Comment confirmer |
|---|---|---|---|
| 1 | **Fil principal de la TV bloqué plusieurs secondes**. Causes probables : décodage des musiques (16,7 Mo pour `Salon_music`) ; ramasse-miettes sur 2 Go de RAM partagés avec Android TV. | Saut de 6 s égal au retard de 5 à 6 s : un seul blocage explique B2 et B3. | Journal : battement de plus de 1,5 s et tâche longue au même moment. Test A/B : même partie avec la musique coupée (réglage `music` à off). |
| 2 | **Rendus complets en rafale** : chaque champ reçu redessine toute la TV, et une transition écrit plusieurs champs. | Coût multiplié par le nombre de joueurs (avatars, `answeredBy`). | « Rendus par seconde » et « affiché − reçu » au moment des transitions, à 8 puis 20 joueurs. |
| 3 | **Page mise en pause par la box** (économie d'énergie, début de veille, B1). Les minuteurs sont alors gelés, puis reprennent. | Le saut a lieu pendant une question, comme la veille. | Battement de plus de 1,5 s **sans** tâche longue : la page était suspendue, pas occupée. |
| 4 | **L'hôte publie tard** : moteur sur le téléphone de l'hôte, `setTimeout` retardé (build de développement plus lent, téléphone qui économise l'énergie). | Les transitions dépendent du téléphone de l'hôte. | Test des téléphones ci-dessus, et journal de l'hôte. |
| 5 | **La TV reçoit tard** : Wi-Fi de la box, ou reconnexion de Firebase. | Rare : un retard réseau ne fait pas sauter le minuteur, qui est absolu. | « reçu − écrit » supérieur à 1 s et `.info/connected` passé à faux. |

Les points suivants sont déjà en place et n'expliquent pas le saut :
- échéance absolue avec l'écart du serveur ;
- minuteur dans un composant isolé.

**À ne pas toucher sans mesure.**

### B1 : veille de la TV

| Rang | Hypothèse | Pour | Comment confirmer |
|---|---|---|---|
| 1 | **Économiseur d'écran ou veille d'Android TV** (réglage de la box, souvent 15 à 30 min sans touche de télécommande). Notre page ne lit aucun média en `<audio>` / `<video>` : pour Android, rien ne « joue », donc l'appareil est inactif. Le son en Web Audio ne compte pas. | Arrive pendant une question, sans geste de l'hôte. Le blind test, lui, joue un `<audio>`. | Sur la box : Paramètres → Préférences de l'appareil → Économiseur d'écran / Veille. Noter les délais, puis voir si la veille arrive au bout de ce délai **depuis la dernière touche de télécommande**. |
| 2 | **Veille de la TV elle-même** (HDMI-CEC, « arrêt auto si aucun signal ou inactivité » du téléviseur). | Possible si la TV s'éteint plutôt que la box. | Écran noir et TV éteinte : réglage du téléviseur. Économiseur d'écran visible : box. |
| 3 | **Récepteur Cast fermé** (`maxInactivity`, `disableIdleTimeout`). | Peu probable : `disableIdleTimeout: true` est déjà en place, et une fermeture du Cast mettrait la partie en pause chez l'hôte (comportement 4.4). | Après la veille, l'hôte voit-il la partie en pause (session Cast terminée) ? Si non, le récepteur était toujours là. |

**Vérifiable sans TV** : le code (option déjà active, aucun média joué) et la documentation de Google ([CastReceiverOptions](https://developers.google.com/cast/docs/reference/web_receiver/cast.framework.CastReceiverOptions)).

**Test rapide sur la box (10 min)** :
1. Régler l'économiseur d'écran de la box sur son délai le plus court (par exemple 5 min).
2. Lancer une partie en Pas à pas, sans toucher la télécommande.
3. Noter si la veille arrive au bout de 5 min.
4. Recommencer avec un blind test (lecture `<audio>`) : si la veille n'arrive plus, l'hypothèse 1 est confirmée.

**Remèdes, selon le cas :**
- *Cas 1 (box)* :
  1. Tenter `navigator.wakeLock.request('screen')` (API Wake Lock, Chrome 84 et plus, page en https). Sa prise en compte par le moteur Cast d'Android TV **n'est pas garantie** : à mesurer.
  2. Si cela ne suffit pas : vidéo muette en boucle, minuscule et invisible, jouée pendant la partie, pour que la box voie un média en cours. C'est la méthode classique des pages « pas de veille ». Coût : un petit fichier vidéo, un peu de décodage.
  3. En dernier recours, message d'aide dans l'app de l'hôte : « Si la TV se met en veille, réglez l'économiseur d'écran de la box sur Jamais ».
- *Cas 2 (téléviseur)* : rien à faire côté code. Message d'aide sur le réglage du téléviseur.
- *Cas 3 (récepteur)* : passer `maxInactivity` à une valeur haute. Vérifier aussi que l'émetteur garde la session (l'app de l'hôte reste au premier plan).

### B4 : animation de fin à 20-24 images par seconde

| Rang | Hypothèse | Comment confirmer |
|---|---|---|
| 1 | **Surface repeinte trop grande** : projecteur `--spotlight` en dégradé plein écran animé, couronne et podium qui dansent, 30 confettis, sur un processeur faible, peut-être en 1080p. | Images par seconde avec et sans projecteur, puis avec et sans pluie (paramètres de démo du lot 4). Outil « Paint flashing » en plan B sur PC. |
| 2 | **Résolution de rendu en 1080p** (au lieu de 720p). | Panneau : `innerWidth × innerHeight × devicePixelRatio`. |
| 3 | **Son en même temps** : jingle de fin décodé ou mixé pendant l'animation. | Journal : tâche longue au début de la fin. Test avec le son coupé. |
| 4 | **Réseau** : écritures de fin de partie, scores. | Peu probable : un seul état. Journal « reçu ». |

## 3. Remèdes (à choisir après mesure)

| Remède | Correctif minimal | Risque de régression | Coût | Test |
|---|---|---|---|---|
| Décodage des musiques hors du moment critique | Décoder au salon seulement, garder une seule piste décodée à la fois, raccourcir ou rééchantillonner `Salon_music` | Musique absente si le décodage échoue (déjà géré : boucle témoin et silence) | Faible | Journal : plus de tâche > 200 ms aux transitions |
| Moins de rendus | Regrouper les champs reçus dans le même battement (un seul rendu par transition) ; isoler les avatars avec `memo` | Écran qui affiche un mélange d'ancien et de nouveau état si le regroupement est mal fait | Moyen | Rendus par seconde ; tests de l'écran à 20 joueurs |
| Veille | Wake Lock, sinon vidéo muette en boucle, puis message d'aide | Vidéo : consommation, compatibilité Chrome 92 (format WebM ou MP4 à valider sur la box) | Faible à moyen | Plus de 30 min sans veille, télécommande intouchée |
| **Mode léger automatique** | Si les images par seconde restent sous 40 pendant 3 s : classe `is-light` sur la page, qui coupe le projecteur, la pluie continue et la danse (salve de confettis gardée), et simplifie les transitions | Écran moins festif sur la box. Seuil mal réglé : mode léger déclenché à tort sur PC | Moyen | Images par seconde ≥ 30 en fin de partie à 20 joueurs ; démo `&light=1` |
| **Rendu en 1280×720 agrandi** | Si l'écran fait plus de 1280 px de large sur la box (Cast seulement) : page dessinée en 1280×720 dans un cadre agrandi par `transform: scale` | Textes un peu moins nets ; à vérifier sur QR code et petits textes. La mise en page est déjà proportionnelle | Faible à moyen | Images par seconde avant / après ; lisibilité à 3 m |
| Publication de l'hôte | Si l'hôte publie tard : transitions calculées sur l'heure du serveur, rattrapage au réveil du téléphone | Transitions sautées si mal fait | Moyen | Journal de l'hôte ; écart ≤ 1 s |

## 4. Protocole de test et seuils

**Conditions** : box « TV Salon » en Cast, APK *preview* de l'hôte (pas le build de développement), panneau `?perf=1`.

| Critère | Seuil |
|---|---|
| Veille | Aucune pendant **plus de 30 min** de partie, sans toucher la télécommande |
| Écart du minuteur | Battement maximal **≤ 1,2 s** |
| Transition | De « écrit » à « affiché » : **≤ 1 s** |
| Animation | **≥ 30 images par seconde** à la fin, à **8** et **20** joueurs |

**Simuler 20 joueurs** :
- `npm run test-session` (dans `receiver/`) génère une session figée à importer : nombre de joueurs fixe et aucune partie qui avance. Il ne suffit donc pas pour mesurer.
- Prévu dans le lot 1 : un petit script de « faux joueurs » sur le PC, qui se connecte en anonyme N fois et répond à chaque question. La TV et l'hôte vivent alors une vraie partie à 20.
- À défaut, 3 ou 4 vrais téléphones et des onglets de navigateur (chaque onglet privé compte pour un joueur).

**Déroulé** :
1. Partie de 10 questions à 8 joueurs, puis à 20.
2. Relever le journal (photo de l'écran ou console).
3. Refaire avec la musique coupée, pour isoler le son.

## 5. Lots, dans l'ordre

1. **Lot 1, instrumentation** : panneau `?perf=1`, journal des incidents, transmission par le message Cast, journal de l'hôte en développement, faux joueurs.
   - *Validation* : le panneau s'affiche sur la box ; une partie à 8 puis 20 joueurs donne un journal ; les hypothèses sont classées avec des chiffres.
2. **Lot 2, minuteur et transitions** : remède choisi d'après le journal (décodage de la musique, regroupement des rendus, ou publication de l'hôte).
   - *Validation* : écart du minuteur ≤ 1,2 s et transition ≤ 1 s, à 20 joueurs.
3. **Lot 3, veille** : test rapide de la box, puis Wake Lock ou vidéo muette, ou message d'aide.
   - *Validation* : plus de 30 min sans veille.
4. **Lot 4, images par seconde** : mesure de la résolution, puis rendu en 720p et mode léger si nécessaire.
   - *Validation* : ≥ 30 images par seconde en fin de partie à 8 et 20 joueurs, et rendu toujours lisible à 3 m.

Chaque lot : un commit, typage, lint, tests ; déploiement de la TV (`firebase deploy --only hosting:tv`) proposé au développeur ; mesure sur la box avant le lot suivant.
