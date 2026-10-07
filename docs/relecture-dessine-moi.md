# Relecture : Dessine-moi

210 mots en 12 catégories, dans `shared/drawWords.ts` (liste lisible, versionnée). À relire avant
la publication (spec 19). Répartition des niveaux : 121 faciles, 69 moyens, 20 difficiles.

## Ce qu'il faut vérifier

- **Le mot se dessine** sans lettres ni chiffres, en moins de 75 s, par un enfant comme par un adulte.
- **Le niveau** est la difficulté **à dessiner** (pas le vocabulaire) : 1 facile, 2 moyen, 3 difficile.
- **Pas de double sens** (souris, glace, bureau…), rien de gênant pour un public famille, pas de nom propre ni de marque.
- **Synonymes acceptés** : seulement de vrais synonymes courants, de longueur proche. Les pluriels, accents et
  fautes de frappe (une faute dès 5 lettres) sont acceptés automatiquement : ne pas les ajouter.
- **Le nombre de lettres** affiché ne compte ni les tirets ni les espaces (« arc-en-ciel » : 9 lettres).

Après une correction : modifier `shared/drawWords.ts`, puis `npm test` dans `tests/unit/` (le contrôle de la liste
vérifie doublons, longueurs, catégories, niveaux et synonymes). Aucun import dans la base : les mots sont dans le code de
l'app de l'hôte (seule à tirer les mots et à juger les essais) : rechargement à chaud avec le build de développement,
nouvel APK pour les testeurs.

Colonne « OK ? » : à remplir pendant la relecture (« oui », ou la correction voulue).

## Animal (28)

| Mot | Niveau | Synonymes acceptés | OK ? |
|---|---|---|---|
| chat | facile | minou |  |
| chien | facile | toutou |  |
| poisson | facile | — |  |
| oiseau | facile | — |  |
| lapin | facile | — |  |
| cochon | facile | — |  |
| vache | facile | — |  |
| mouton | facile | — |  |
| canard | facile | — |  |
| serpent | facile | — |  |
| girafe | facile | — |  |
| éléphant | facile | — |  |
| escargot | facile | — |  |
| tortue | facile | — |  |
| papillon | facile | — |  |
| araignée | facile | — |  |
| abeille | facile | — |  |
| coccinelle | facile | — |  |
| baleine | facile | — |  |
| cheval | moyen | — |  |
| lion | moyen | — |  |
| crocodile | moyen | — |  |
| pingouin | moyen | manchot |  |
| kangourou | moyen | — |  |
| dauphin | moyen | — |  |
| pieuvre | moyen | poulpe |  |
| hérisson | moyen | — |  |
| caméléon | difficile | — |  |

## Nourriture (26)

| Mot | Niveau | Synonymes acceptés | OK ? |
|---|---|---|---|
| pomme | facile | — |  |
| banane | facile | — |  |
| poire | facile | — |  |
| cerise | facile | — |  |
| fraise | facile | — |  |
| carotte | facile | — |  |
| pizza | facile | — |  |
| gâteau | facile | — |  |
| sucette | facile | — |  |
| bonbon | facile | — |  |
| hamburger | facile | burger |  |
| frites | facile | — |  |
| ananas | facile | — |  |
| pastèque | facile | — |  |
| citron | facile | — |  |
| champignon | facile | — |  |
| tomate | facile | — |  |
| croissant | moyen | — |  |
| fromage | moyen | — |  |
| raisin | moyen | — |  |
| saucisse | moyen | — |  |
| brocoli | moyen | — |  |
| crêpe | moyen | — |  |
| spaghetti | moyen | pâtes |  |
| chocolat | difficile | — |  |
| café | difficile | — |  |

## Objet (24)

| Mot | Niveau | Synonymes acceptés | OK ? |
|---|---|---|---|
| parapluie | facile | pépin |  |
| lunettes | facile | — |  |
| ciseaux | facile | — |  |
| clé | facile | — |  |
| crayon | facile | — |  |
| bougie | facile | — |  |
| cadeau | facile | — |  |
| téléphone | facile | portable |  |
| montre | facile | — |  |
| couteau | facile | — |  |
| fourchette | facile | — |  |
| cuillère | facile | — |  |
| marteau | facile | — |  |
| ampoule | facile | — |  |
| enveloppe | facile | — |  |
| sac | facile | — |  |
| tasse | facile | — |  |
| valise | moyen | — |  |
| loupe | moyen | — |  |
| échelle | moyen | — |  |
| cadenas | moyen | — |  |
| brosse à dents | moyen | — |  |
| appareil photo | moyen | — |  |
| boussole | difficile | — |  |

## Maison (17)

| Mot | Niveau | Synonymes acceptés | OK ? |
|---|---|---|---|
| maison | facile | — |  |
| lit | facile | — |  |
| chaise | facile | — |  |
| table | facile | — |  |
| fenêtre | facile | — |  |
| porte | facile | — |  |
| lampe | facile | — |  |
| escalier | facile | — |  |
| horloge | facile | pendule |  |
| télévision | facile | téléviseur |  |
| canapé | moyen | sofa |  |
| baignoire | moyen | — |  |
| douche | moyen | — |  |
| cheminée | moyen | — |  |
| armoire | moyen | — |  |
| robinet | moyen | — |  |
| aspirateur | difficile | — |  |

## Nature (17)

| Mot | Niveau | Synonymes acceptés | OK ? |
|---|---|---|---|
| soleil | facile | — |  |
| lune | facile | — |  |
| étoile | facile | — |  |
| nuage | facile | — |  |
| arbre | facile | — |  |
| fleur | facile | — |  |
| montagne | facile | — |  |
| arc-en-ciel | facile | — |  |
| pluie | facile | — |  |
| cactus | facile | — |  |
| flocon | facile | — |  |
| palmier | facile | — |  |
| volcan | moyen | — |  |
| vague | moyen | — |  |
| rocher | moyen | — |  |
| île | moyen | — |  |
| tornade | difficile | — |  |

## Lieu (16)

| Mot | Niveau | Synonymes acceptés | OK ? |
|---|---|---|---|
| château | facile | — |  |
| pyramide | facile | — |  |
| igloo | facile | — |  |
| tente | facile | — |  |
| pont | facile | — |  |
| phare | moyen | — |  |
| école | moyen | — |  |
| église | moyen | — |  |
| plage | moyen | — |  |
| cabane | moyen | — |  |
| moulin | moyen | — |  |
| piscine | moyen | — |  |
| ferme | moyen | — |  |
| hôpital | difficile | — |  |
| gare | difficile | — |  |
| zoo | difficile | — |  |

## Transport (15)

| Mot | Niveau | Synonymes acceptés | OK ? |
|---|---|---|---|
| voiture | facile | auto, bagnole |  |
| vélo | facile | bicyclette, bike |  |
| avion | facile | — |  |
| bateau | facile | — |  |
| train | facile | — |  |
| fusée | facile | — |  |
| camion | facile | — |  |
| moto | facile | — |  |
| hélicoptère | moyen | hélico |  |
| sous-marin | moyen | — |  |
| montgolfière | moyen | — |  |
| trottinette | moyen | — |  |
| tracteur | moyen | — |  |
| ambulance | moyen | — |  |
| parachute | difficile | — |  |

## Métier (12)

| Mot | Niveau | Synonymes acceptés | OK ? |
|---|---|---|---|
| clown | facile | — |  |
| pompier | moyen | — |  |
| policier | moyen | gendarme |  |
| cuisinier | moyen | chef |  |
| astronaute | moyen | cosmonaute |  |
| magicien | moyen | — |  |
| médecin | difficile | docteur |  |
| facteur | difficile | — |  |
| coiffeur | difficile | — |  |
| peintre | difficile | — |  |
| jardinier | difficile | — |  |
| boulanger | difficile | — |  |

## Sport (13)

| Mot | Niveau | Synonymes acceptés | OK ? |
|---|---|---|---|
| football | facile | foot |  |
| tennis | facile | — |  |
| basketball | facile | basket |  |
| ski | moyen | — |  |
| natation | moyen | — |  |
| boxe | moyen | — |  |
| surf | moyen | — |  |
| rugby | moyen | — |  |
| bowling | moyen | — |  |
| pétanque | moyen | boules |  |
| judo | difficile | — |  |
| plongée | difficile | — |  |
| escalade | difficile | — |  |

## Loisir (15)

| Mot | Niveau | Synonymes acceptés | OK ? |
|---|---|---|---|
| guitare | facile | — |  |
| tambour | facile | — |  |
| ballon | facile | — |  |
| cerf-volant | facile | — |  |
| robot | facile | — |  |
| poupée | facile | — |  |
| nounours | facile | peluche |  |
| piano | moyen | — |  |
| trompette | moyen | — |  |
| violon | moyen | — |  |
| puzzle | moyen | — |  |
| toboggan | moyen | — |  |
| balançoire | moyen | — |  |
| château de sable | moyen | — |  |
| marionnette | difficile | — |  |

## Vêtement (15)

| Mot | Niveau | Synonymes acceptés | OK ? |
|---|---|---|---|
| chaussette | facile | — |  |
| chaussure | facile | soulier |  |
| chapeau | facile | — |  |
| pantalon | facile | — |  |
| robe | facile | — |  |
| jupe | facile | — |  |
| écharpe | facile | — |  |
| gant | facile | — |  |
| bonnet | facile | — |  |
| cravate | facile | — |  |
| botte | facile | — |  |
| casquette | facile | — |  |
| ceinture | moyen | — |  |
| manteau | moyen | — |  |
| pyjama | moyen | — |  |

## Corps (12)

| Mot | Niveau | Synonymes acceptés | OK ? |
|---|---|---|---|
| main | facile | — |  |
| pied | facile | — |  |
| nez | facile | — |  |
| oreille | facile | — |  |
| bouche | facile | — |  |
| dent | facile | — |  |
| doigt | facile | — |  |
| bras | facile | — |  |
| jambe | facile | — |  |
| tête | facile | — |  |
| genou | moyen | — |  |
| squelette | moyen | — |  |
