# Tests à la main de la 1.2.3

Ce que les tests automatiques ne peuvent pas prouver. À cocher avant les builds de production.

## Comment tester avant la publication

- **Site des joueurs, canal d'essai :** https://quizin-play--essai-joueurs-sktpp304.web.app (expire le 12 novembre 2026). Il utilise la vraie base : une partie d'essai est une partie normale.
- **Rejoindre sur le canal :** taper l'adresse du canal suivie de `/join/CODE`, par exemple https://quizin-play--essai-joueurs-sktpp304.web.app/join/ABCD. **Le QR code de la TV et le lien « Partager » de l'app mènent au site publié**, donc à l'ancienne version : ne pas les utiliser pour tester le canal.
- **Application hôte :** APK Android preview (profil `preview`, installation directe). Il remplace le build de développement sur le téléphone. Son Cast ouvre le récepteur de production, donc les anciens écrans TV.
- **TV, nouveaux écrans :** canal `essai-tv` avec le récepteur de test `0D978EA2` et `receiver/cast-sender.html`, ou https://quiz-in-7dbd6--essai-tv-bkjhmkt1.web.app/?code=CODE dans un navigateur en plein écran.
- **Règles de la base :** déployées le 5 novembre 2026 (30 essais à Gribouille). Rien à faire.

## TV (Bbox, récepteur de test)

- [ ] Réglage auto : allégé bien actif (`?perf=1` ou étape 5), fluidité, QR lisible à 3 m.
- [ ] Réglage forcé sur off : jauge, couronne, barres, balayage, et images/s avec `?perf=1`.
- [ ] Partie Quiz, Blind test et Bluff, en Pas à pas et en Automatique.
- [ ] Bluff à 4 choix et à plus de 4.
- [ ] Bandeau : absent avant 20 s, présent après 20 s en Pas à pas, disparition dès que l'hôte avance, jamais en Automatique.
- [ ] Classement à 2 joueurs, 5, plus de 5, égalité en tête, montées et descentes de rang.
- [ ] TV rechargée en plein classement : le mouvement de rang reste juste.
- [ ] Mode équipes : classement entre deux questions.
- [ ] Gribouille : révélation et classement ; indice « Objet – 10 lettres ».
- [ ] Son calé sur les lignes du classement et les cartes du Bluff.
- [ ] En-tête au même endroit de la question au classement : phrase « Déconnecté ? » et QR, sans saut.

## Téléphone hôte

- [ ] Blind test mené au bout : pastille « ✓ JOUÉ » et compteur +1.
- [ ] Blind test abandonné ou arrêté par « Terminer » avant la fin : aucun repère.
- [ ] Relance de l'app en pleine partie, « Reprendre », fin : repère présent.
- [ ] Gribouille : « gâteau » refusé pour « bateau », une vraie faute de frappe acceptée.
- [ ] Mise à jour : `/debug/update`, puis feuille et écran bloquant avec le projet Firebase de test, jamais en production.
- [ ] Accueil sans changement visible quand le nœud de mise à jour est vide.

## Bluff

- [ ] Style des bluffs en vraie partie (`BLUFF_ANSWER_STYLE_LEVEL` à `light`, par défaut) : joueurs qui écrivent vite, puis joueurs soigneux. La vraie réponse ne doit plus se repérer à son orthographe, et rester lisible. Comparer avec `clean`.
- [ ] Vote : réponses du jeu adaptées ; révélation : texte d'origine.
- [ ] Bluff identique ou trop proche d'un leurre (« Toy Story ») : un seul choix, celui du joueur.
- [ ] Bluff trop proche de la vraie réponse : refusé avec « Trop proche de la vraie réponse. »
- [ ] Modération : « Masquer un bluff » replié par défaut, aucun nom affiché ; bluff masqué en « ••• » sur la TV et les téléphones, au vote et à la révélation ; « Afficher » le rétablit.
- [ ] Écriture : « Écris une phrase, comme la vraie réponse. » sous la question, avec et sans TV, clavier ouvert sur un petit téléphone.
- [ ] Résultat : le total affiché est bien celui ajouté au classement.
- [ ] Écriture : 75 s partout (téléphone, TV, règles affichées).

## Gribouille

- [ ] Saisie compacte, clavier ouvert, sur un petit téléphone Android : tout tient, sans défilement.
- [ ] Même chose sur iPhone (clavier avec barre de suggestions).
- [ ] 30 essais : le 30e passe, le 31e non, aucun compteur affiché. Règles déployées avant : sinon le 16e est refusé.
- [ ] Mots non répétés sur 3 parties de suite avec « Changer de jeu », puis avec une nouvelle salle.
- [ ] Points : la dernière seconde donne 200 ; dessinateur 3 sur 5 → 600.

## QR code

- [ ] Le QR de la TV ouvre le site publié, sans le correctif tant que le site n'est pas déployé. Sur le canal, tester `/join/CODE` tapé à la main, et `/join/code` en minuscules.
- [ ] Pour tester le scan sur le canal : créer un QR vers l'adresse du canal suivie de `/join/CODE` (générateur sur le PC), le scanner avec l'appareil photo natif de l'iPhone, première ouverture dans Safari : le formulaire s'affiche.
- [ ] Même scan une deuxième fois, page déjà chargée une fois.
- [ ] Après le déploiement du site des joueurs : refaire le scan du vrai QR de la TV avec un iPhone.
- [ ] En cas d'erreur : noter le titre et la ligne grise « Réf. » (elle dit « lien » ou « code saisi »).

## Écran « Bonne réponse » (téléphone)

- [ ] Hôte : ni phrase d'attente, bouton touchable dès le premier instant. Joueur : la phrase reste.
- [ ] Toutes les animations, sans saccade, sur le téléphone le plus modeste disponible et sur le site des joueurs.
- [ ] Mauvaise réponse et pas de réponse : animations sobres, ni rayons ni confettis.
- [ ] « Réduire les animations » actif (Android et iPhone) : tout est fixe et complet tout de suite.

## Classement (téléphone)

- [ ] Hôte et joueur, à 2, 5, 6 et plus de joueurs ; dans le top 5, hors du top 5, en tête, à égalité.
- [ ] Même rang et même mouvement que la TV, à chaque question.
- [ ] Tout tient sans défilement sur le plus petit téléphone disponible (360×640), avec le pied d'écran de l'hôte.
- [ ] Mode Automatique : annonce de la question suivante après le classement.
- [ ] « Réduire les animations » actif.

## Connexion requise

- [ ] Mode avion au lancement : panneau, puis désactivation : il se ferme seul.
- [ ] Wi-Fi sans accès internet (partage de connexion sans données) : panneau en moins de 30 s environ.
- [ ] Coupure en pleine partie, hôte : panneau par-dessus l'écran ; retour du réseau : même écran, partie qui reprend.
- [ ] Coupure en pleine partie, joueur (app et site des joueurs) : même chose ; sa réponse après retour reste acceptée si le temps n'est pas écoulé.
- [ ] Hôte coupé plus de 5 minutes : la partie peut être supprimée, message au retour.
- [ ] « Réessayer » sans réseau : indicateur puis « Toujours pas de réseau ».
- [ ] « Ouvrir les réglages » : réglages réseau sur Android, page de l'app sur iPhone ; lien absent du site des joueurs.
- [ ] Coupure d'une seconde : pas de panneau.
- [ ] Panneau affiché avec une feuille déjà ouverte, surtout sur iPhone.
- [ ] Tuile Blind test en « Bientôt » sans réseau : aucun changement une fois le réseau revenu.
- [ ] « Réduire les animations » actif.
