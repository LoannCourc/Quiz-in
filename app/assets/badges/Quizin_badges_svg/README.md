# Pack SVG des badges Quiz'in

Dessins vectoriels des trophées et des emblèmes, tels que dans les maquettes (écran « Mes badges »).
Rien n'est à redessiner : on assemble une forme de palier + un emblème de catégorie.

## Contenu
- `trophees/palier1_medaille_cyan.svg` : médaille sur ruban (palier 1), cyan #35d8f2
- `trophees/palier2_coupe_rose.svg` : coupe (palier 2), rose #f48aae
- `trophees/palier3_trophee_or.svg` : grand trophée doré avec étoile (palier 3), jaune #ffd23f
- `trophees/verrouille_medaille.svg` et `trophees/verrouille_coupe.svg` : silhouettes pointillées avec cadenas pour les paliers non atteints (la coupe sert aussi de silhouette au palier 3)
- `emblemes/*.svg` : 18 icônes d'emblème de 24x24 (une par catégorie ou badge unique, plus le verrou)
- `trophees/exemple_*.svg` : deux exemples avec l'emblème déjà inséré

## Assemblage
- Chaque trophée a le viewBox `0 -6 80 106` (taille de référence 160x212, à mettre à l'échelle).
- Chaque trophée contient `<g id="emblem" transform="translate(28 Y)">` : c'est l'emplacement de l'emblème (24x24). Y vaut 50 pour la médaille, 26 pour la coupe et le trophée.
- Couleur de l'emblème sur un trophée débloqué : #14064a (trait de 2,6, bouts arrondis).
- Les couleurs dépendent du palier, jamais de la catégorie : palier 1 cyan, palier 2 rose, palier 3 or.
- Le fond de la tuile d'icône à gauche de chaque carte a sa propre couleur d'accent par catégorie (voir le message de l'étape 3), pas ces couleurs de palier.

## Éléments animables (palier 3, `palier3_trophee_or.svg`)
Les éléments ont des identifiants pour être animés séparément :
- `#shine` : bande blanche inclinée, déjà clippée par `#cup-clip` à la forme de la coupe. Animation prévue : translation en x d'environ -70 à +90 unités sur un cycle de 2,4 s (balayage pendant les premiers 45 %, puis pause).
- `#sparkle-1`, `#sparkle-2` : étincelles. Scintillement de 1,2 s (opacité 0, 1, 0 et échelle 0,3, 1, 0,3), la seconde décalée de 0,6 s.
- `#star` : l'étoile du dessus, fixe.
- Le flottement s'applique à tout le trophée (translation verticale de 0 à -3 px, 2,4 s).

## Utilisation dans l'app
Ces fichiers sont du SVG. Il faut un moyen de les afficher en React Native :
- soit `react-native-svg` s'il est déjà installé (vérifie, sans l'ajouter sans m'en parler), en convertissant les SVG en composants ;
- soit une autre solution que tu me proposes avant de coder (par exemple des images PNG exportées de ces SVG, avec perte de l'animation du reflet clippé).

Les dessins sont originaux (créés pour Quiz'in), sans élément protégé.
