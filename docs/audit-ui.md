# Audit de conformité UI aux maquettes

Octobre 2026. Référence : `docs/design/`. Statut : **corrigé** (dans ce lot), **à corriger** (lot suivant, après accord), **voulu** (écart décidé, à garder), **à voir** (maquette manquante).

Contrôle à chaque lot : captures du téléphone (`/debug/player?s=…&capture=1` à 320 et 360 px) et de la TV (`npm run captures` dans `receiver/`), comparées à ce tableau.

## Téléphone du joueur

| Écran | Maquette | Écart | Statut |
|---|---|---|---|
| Toutes les questions (choix, saisie, Bluff, Dessine-moi devine, vote) | S1, S2, B1 | En-tête : pastille or « QUESTION 3/10 », score, gros chiffre et barre de 15 au lieu de « Question 3 / 10 » (14, `#a99ee0`) et « 18 s » (14, blanc), barre de 10 (`#5a45a8`, rose `#ff3d8b`, marges 8 / 18) | corrigé |
| Saisie libre (Quiz, Blind test) | S1 | Bouton VALIDER : `BigButton` (Bowlby, 64, ombre grise) au lieu de la pilule or de 58, Nunito, ombre encre 0 5 0 | corrigé |
| Saisie libre, Bluff, Dessine-moi | S1 | Bouton caché par le clavier (rien ne le remontait, bord à bord sur Android 15) ; il doit rester 12 au-dessus | corrigé (à vérifier sur téléphone) |
| Champ de saisie | S1 | Hauteur 64 et ombre dure, libellé 13 en `#c9b8ff`, contour lavande sans focus, au lieu de 60, sans ombre, libellé 12 espacé `#a99ee0`, contour violet sans focus et cyan avec | corrigé |
| Bluff, écrire | B1 | Champ sur 4 lignes au lieu d'une ligne ; consigne en texte or au lieu de la pastille « BLUFF · INVENTE UNE FAUSSE RÉPONSE » ; rangée d'avatars en plus | corrigé |
| Dessine-moi, deviner | S1 | ENVOYER au lieu de VALIDER ; nombre d'essais sous le bouton (le pousse sous le clavier) | corrigé |
| Dessine-moi, mot (dessinateur, révélation) | — | Taille d'après la longueur totale : un mot de 12 lettres pouvait se couper à 320 px | corrigé |
| Bluff, attente | B2 | Pas encore comparé en détail | à corriger |
| Envoyé (saisie libre) | S2 | La maquette garde l'en-tête et la barre ; « Tu ne peux plus la modifier. » en bas | à corriger |
| Révélation (saisie libre) | S2 | La maquette montre « TA PLACE » ; la règle « une fonction par écran » (spec 4) l'interdit | voulu |
| Choix multiples | Q3 | Maquette Q3 non reçue (absente des Téléchargements) ; l'en-tête S1 est appliqué en attendant | à voir |
| Dessinateur | E1, E2 | Écran actuel provisoire (outils petits, sans libellés, sans zoom) | à corriger (plan 5) |

## TV

| Écran | Maquette | Écart | Statut |
|---|---|---|---|
| Logo (tous les écrans) | L5 | Contour encre autour des lettres en plus du relief | corrigé |
| Dessine-moi, révélation | — | Mot coupé (« BOUSSOL ») et onglets sur deux lignes dans la colonne de droite | corrigé |
| Saisie libre, validation | T1 | Carte blanche de la question et cadre en pointillés au lieu du titre blanc seul, des trois points et de « Validation en cours » en haut à droite | à corriger |
| Saisie libre, révélation | T2 | À comparer (carte « LA BONNE RÉPONSE » cyan, « VOS RÉPONSES ») | à corriger |
| Pastille « QUESTION 3/10 » | plateau-tv | Rose adouci et texte encre au lieu du rose vif et texte blanc | voulu (décision d'octobre 2026) |
