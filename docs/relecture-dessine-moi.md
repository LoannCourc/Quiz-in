# Relecture : Dessine-moi

569 mots en 12 catégories, dans `shared/drawWords.ts` (liste lisible, versionnée). À relire avant
la publication (spec 19). Répartition des niveaux : 318 faciles, 204 moyens, 47 difficiles.

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

## Animal (58)

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
| taureau | facile | — |  |
| coq | facile | — |  |
| âne | facile | — |  |
| grenouille | facile | — |  |
| hibou | facile | — |  |
| singe | facile | — |  |
| ours | facile | — |  |
| renard | facile | — |  |
| requin | facile | — |  |
| crabe | facile | — |  |
| phoque | facile | — |  |
| fourmi | facile | — |  |
| ver de terre | facile | — |  |
| tigre | facile | — |  |
| zèbre | facile | — |  |
| panda | facile | — |  |
| chauve-souris | facile | — |  |
| méduse | facile | — |  |
| dinosaure | facile | — |  |
| perroquet | facile | — |  |
| cheval | moyen | — |  |
| lion | moyen | — |  |
| crocodile | moyen | — |  |
| pingouin | moyen | manchot |  |
| kangourou | moyen | — |  |
| dauphin | moyen | — |  |
| pieuvre | moyen | poulpe |  |
| hérisson | moyen | — |  |
| chèvre | moyen | — |  |
| lama | moyen | — |  |
| dromadaire | moyen | — |  |
| rhinocéros | moyen | — |  |
| hippopotame | moyen | — |  |
| écureuil | moyen | — |  |
| cygne | moyen | — |  |
| homard | moyen | — |  |
| paon | moyen | — |  |
| caméléon | difficile | — |  |
| castor | difficile | — |  |

## Nourriture (56)

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
| orange | facile | — |  |
| kiwi | facile | — |  |
| noix de coco | facile | — |  |
| salade | facile | — |  |
| maïs | facile | — |  |
| pain | facile | — |  |
| sandwich | facile | — |  |
| hot-dog | facile | — |  |
| beignet | facile | — |  |
| tarte | facile | — |  |
| biscuit | facile | — |  |
| melon | facile | — |  |
| poulet | facile | — |  |
| sushi | facile | — |  |
| gaufre | facile | — |  |
| radis | facile | — |  |
| poivron | facile | — |  |
| framboise | facile | — |  |
| chips | facile | — |  |
| aubergine | facile | — |  |
| croissant | moyen | — |  |
| fromage | moyen | — |  |
| raisin | moyen | — |  |
| saucisse | moyen | — |  |
| brocoli | moyen | — |  |
| crêpe | moyen | — |  |
| spaghetti | moyen | pâtes |  |
| concombre | moyen | — |  |
| petit pois | moyen | — |  |
| oignon | moyen | — |  |
| jambon | moyen | — |  |
| omelette | moyen | — |  |
| pop-corn | moyen | — |  |
| bretzel | moyen | — |  |
| courgette | moyen | — |  |
| chocolat | difficile | — |  |
| café | difficile | — |  |
| miel | difficile | — |  |
| riz | difficile | — |  |

## Objet (54)

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
| trousse | facile | — |  |
| livre | facile | — |  |
| bouteille | facile | — |  |
| assiette | facile | — |  |
| casserole | facile | — |  |
| balai | facile | — |  |
| seau | facile | — |  |
| pelle | facile | — |  |
| clou | facile | — |  |
| scie | facile | — |  |
| peigne | facile | — |  |
| miroir | facile | — |  |
| savon | facile | — |  |
| drapeau | facile | — |  |
| panier | facile | — |  |
| sifflet | facile | — |  |
| couronne | facile | — |  |
| cloche | facile | — |  |
| aiguille | facile | — |  |
| épée | facile | — |  |
| cartable | facile | — |  |
| valise | moyen | — |  |
| loupe | moyen | — |  |
| échelle | moyen | — |  |
| cadenas | moyen | — |  |
| brosse à dents | moyen | — |  |
| appareil photo | moyen | — |  |
| sablier | moyen | — |  |
| cintre | moyen | — |  |
| tournevis | moyen | — |  |
| ordinateur | moyen | ordi |  |
| éponge | moyen | — |  |
| arrosoir | moyen | — |  |
| télécommande | moyen | — |  |
| brouette | moyen | — |  |
| boussole | difficile | — |  |
| ventilateur | difficile | — |  |

## Maison (46)

| Mot | Niveau | Synonymes acceptés | OK ? |
|---|---|---|---|
| lit | facile | — |  |
| chaise | facile | — |  |
| table | facile | — |  |
| fenêtre | facile | — |  |
| porte | facile | — |  |
| lampe | facile | — |  |
| escalier | facile | — |  |
| horloge | facile | pendule |  |
| télévision | facile | téléviseur |  |
| tapis | facile | — |  |
| rideau | facile | — |  |
| matelas | facile | — |  |
| coussin | facile | — |  |
| tabouret | facile | — |  |
| étagère | facile | — |  |
| frigo | facile | réfrigérateur |  |
| four | facile | — |  |
| évier | facile | — |  |
| toilettes | facile | wc |  |
| plante verte | facile | — |  |
| poubelle | facile | — |  |
| volet | facile | — |  |
| toit | facile | — |  |
| garage | facile | — |  |
| vase | facile | — |  |
| table de nuit | facile | — |  |
| canapé | moyen | sofa |  |
| baignoire | moyen | — |  |
| douche | moyen | — |  |
| cheminée | moyen | — |  |
| armoire | moyen | — |  |
| robinet | moyen | — |  |
| couverture | moyen | — |  |
| radiateur | moyen | — |  |
| paillasson | moyen | — |  |
| grille-pain | moyen | — |  |
| micro-ondes | moyen | — |  |
| lave-linge | moyen | machine à laver |  |
| lustre | moyen | — |  |
| berceau | moyen | — |  |
| cadre | moyen | — |  |
| sonnette | moyen | — |  |
| portemanteau | moyen | — |  |
| aspirateur | difficile | — |  |
| interrupteur | difficile | — |  |
| bouilloire | difficile | — |  |

## Nature (47)

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
| feuille | facile | — |  |
| herbe | facile | — |  |
| tulipe | facile | — |  |
| tournesol | facile | — |  |
| marguerite | facile | — |  |
| coquillage | facile | — |  |
| lac | facile | — |  |
| rivière | facile | — |  |
| cascade | facile | — |  |
| désert | facile | — |  |
| forêt | facile | — |  |
| neige | facile | — |  |
| branche | facile | — |  |
| buisson | facile | — |  |
| planète | facile | — |  |
| trèfle | facile | — |  |
| pissenlit | facile | — |  |
| nid | facile | — |  |
| feu | facile | — |  |
| épi de blé | facile | — |  |
| bambou | facile | — |  |
| volcan | moyen | — |  |
| vague | moyen | — |  |
| rocher | moyen | — |  |
| île | moyen | — |  |
| comète | moyen | — |  |
| grotte | moyen | — |  |
| pomme de pin | moyen | — |  |
| racine | moyen | — |  |
| algue | moyen | — |  |
| iceberg | moyen | — |  |
| tronc | moyen | — |  |
| nénuphar | moyen | — |  |
| ruche | moyen | — |  |
| tornade | difficile | — |  |

## Lieu (46)

| Mot | Niveau | Synonymes acceptés | OK ? |
|---|---|---|---|
| château | facile | — |  |
| pyramide | facile | — |  |
| igloo | facile | — |  |
| tente | facile | — |  |
| pont | facile | — |  |
| cirque | facile | — |  |
| stade | facile | — |  |
| gratte-ciel | facile | — |  |
| jardin | facile | — |  |
| tunnel | facile | — |  |
| fontaine | facile | — |  |
| parking | facile | — |  |
| village | facile | — |  |
| aéroport | facile | — |  |
| phare | moyen | — |  |
| école | moyen | — |  |
| église | moyen | — |  |
| plage | moyen | — |  |
| cabane | moyen | — |  |
| moulin | moyen | — |  |
| piscine | moyen | — |  |
| ferme | moyen | — |  |
| cinéma | moyen | — |  |
| restaurant | moyen | — |  |
| théâtre | moyen | — |  |
| gymnase | moyen | — |  |
| supermarché | moyen | — |  |
| usine | moyen | — |  |
| pharmacie | moyen | — |  |
| banque | moyen | — |  |
| fête foraine | moyen | — |  |
| mairie | moyen | — |  |
| caserne | moyen | — |  |
| bibliothèque | moyen | — |  |
| camping | moyen | — |  |
| aquarium | moyen | — |  |
| patinoire | moyen | — |  |
| aire de jeux | moyen | — |  |
| hôpital | difficile | — |  |
| gare | difficile | — |  |
| zoo | difficile | — |  |
| boulangerie | difficile | — |  |
| autoroute | difficile | — |  |
| rond-point | difficile | — |  |
| laboratoire | difficile | — |  |
| station-service | difficile | — |  |

## Transport (45)

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
| bus | facile | autobus |  |
| taxi | facile | — |  |
| métro | facile | — |  |
| scooter | facile | — |  |
| voilier | facile | — |  |
| skateboard | facile | skate |  |
| rollers | facile | — |  |
| luge | facile | — |  |
| traîneau | facile | — |  |
| caravane | facile | — |  |
| pirogue | facile | — |  |
| canoë | facile | — |  |
| pédalo | facile | — |  |
| tandem | facile | — |  |
| tramway | facile | — |  |
| charrette | facile | — |  |
| hélicoptère | moyen | hélico |  |
| sous-marin | moyen | — |  |
| montgolfière | moyen | — |  |
| trottinette | moyen | — |  |
| tracteur | moyen | — |  |
| ambulance | moyen | — |  |
| paquebot | moyen | — |  |
| téléphérique | moyen | — |  |
| pelleteuse | moyen | — |  |
| dépanneuse | moyen | — |  |
| camping-car | moyen | — |  |
| bulldozer | moyen | — |  |
| remorque | moyen | — |  |
| calèche | moyen | — |  |
| hydravion | moyen | — |  |
| quad | moyen | — |  |
| planeur | moyen | — |  |
| deltaplane | moyen | — |  |
| parachute | difficile | — |  |
| cargo | difficile | — |  |
| navette spatiale | difficile | — |  |

## Métier (42)

| Mot | Niveau | Synonymes acceptés | OK ? |
|---|---|---|---|
| clown | facile | — |  |
| pilote | facile | — |  |
| chanteur | facile | — |  |
| cow-boy | facile | — |  |
| pompier | moyen | — |  |
| policier | moyen | gendarme |  |
| cuisinier | moyen | chef |  |
| astronaute | moyen | cosmonaute |  |
| magicien | moyen | — |  |
| dentiste | moyen | — |  |
| pêcheur | moyen | — |  |
| agriculteur | moyen | fermier |  |
| maçon | moyen | — |  |
| plombier | moyen | — |  |
| danseur | moyen | — |  |
| photographe | moyen | — |  |
| sculpteur | moyen | — |  |
| bûcheron | moyen | — |  |
| maître-nageur | moyen | — |  |
| jongleur | moyen | — |  |
| acrobate | moyen | — |  |
| détective | moyen | — |  |
| arbitre | moyen | — |  |
| dompteur | moyen | — |  |
| éboueur | moyen | — |  |
| mécanicien | moyen | — |  |
| serveur | moyen | — |  |
| apiculteur | moyen | — |  |
| médecin | difficile | docteur |  |
| facteur | difficile | — |  |
| coiffeur | difficile | — |  |
| peintre | difficile | — |  |
| jardinier | difficile | — |  |
| boulanger | difficile | — |  |
| vétérinaire | difficile | — |  |
| infirmier | difficile | — |  |
| professeur | difficile | prof |  |
| électricien | difficile | — |  |
| musicien | difficile | — |  |
| fleuriste | difficile | — |  |
| couturier | difficile | — |  |
| architecte | difficile | — |  |

## Sport (43)

| Mot | Niveau | Synonymes acceptés | OK ? |
|---|---|---|---|
| football | facile | foot |  |
| tennis | facile | — |  |
| basketball | facile | basket |  |
| golf | facile | — |  |
| ping-pong | facile | tennis de table |  |
| danse | facile | — |  |
| hockey | facile | — |  |
| handball | facile | hand |  |
| volley-ball | facile | volley |  |
| baseball | facile | — |  |
| ski | moyen | — |  |
| natation | moyen | — |  |
| boxe | moyen | — |  |
| surf | moyen | — |  |
| rugby | moyen | — |  |
| bowling | moyen | — |  |
| pétanque | moyen | boules |  |
| badminton | moyen | — |  |
| équitation | moyen | — |  |
| patinage | moyen | — |  |
| snowboard | moyen | — |  |
| planche à voile | moyen | — |  |
| billard | moyen | — |  |
| trampoline | moyen | — |  |
| fléchettes | moyen | — |  |
| karaté | moyen | — |  |
| escrime | moyen | — |  |
| haltérophilie | moyen | — |  |
| saut à la perche | moyen | — |  |
| cyclisme | moyen | — |  |
| gymnastique | moyen | — |  |
| parapente | moyen | — |  |
| javelot | moyen | — |  |
| sumo | moyen | — |  |
| lancer de poids | moyen | — |  |
| judo | difficile | — |  |
| plongée | difficile | — |  |
| escalade | difficile | — |  |
| marathon | difficile | — |  |
| saut en hauteur | difficile | — |  |
| randonnée | difficile | — |  |
| curling | difficile | — |  |
| yoga | difficile | — |  |

## Loisir (45)

| Mot | Niveau | Synonymes acceptés | OK ? |
|---|---|---|---|
| guitare | facile | — |  |
| tambour | facile | — |  |
| ballon | facile | — |  |
| cerf-volant | facile | — |  |
| robot | facile | — |  |
| poupée | facile | — |  |
| nounours | facile | peluche |  |
| yoyo | facile | — |  |
| toupie | facile | — |  |
| dominos | facile | — |  |
| flûte | facile | — |  |
| billes | facile | — |  |
| marelle | facile | — |  |
| corde à sauter | facile | — |  |
| manège | facile | — |  |
| boule de neige | facile | — |  |
| harpe | facile | — |  |
| pinceau | facile | — |  |
| cartes à jouer | facile | — |  |
| bulle de savon | facile | — |  |
| boomerang | facile | — |  |
| masque | facile | — |  |
| piano | moyen | — |  |
| trompette | moyen | — |  |
| violon | moyen | — |  |
| puzzle | moyen | — |  |
| toboggan | moyen | — |  |
| balançoire | moyen | — |  |
| château de sable | moyen | — |  |
| saxophone | moyen | — |  |
| accordéon | moyen | — |  |
| harmonica | moyen | — |  |
| xylophone | moyen | — |  |
| maracas | moyen | — |  |
| échecs | moyen | — |  |
| jumelles | moyen | — |  |
| labyrinthe | moyen | — |  |
| confettis | moyen | — |  |
| tricot | moyen | — |  |
| pique-nique | moyen | — |  |
| karaoké | moyen | — |  |
| origami | moyen | — |  |
| manette | moyen | — |  |
| marionnette | difficile | — |  |
| clarinette | difficile | — |  |

## Vêtement (45)

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
| tee-shirt | facile | t-shirt |  |
| short | facile | — |  |
| pull | facile | — |  |
| chemise | facile | — |  |
| veste | facile | — |  |
| maillot de bain | facile | — |  |
| sandale | facile | — |  |
| pantoufle | facile | chausson |  |
| blouse | facile | — |  |
| cape | facile | — |  |
| capuche | facile | — |  |
| salopette | facile | — |  |
| gilet | facile | — |  |
| collier | facile | — |  |
| béret | facile | — |  |
| sombrero | facile | — |  |
| kimono | facile | — |  |
| tutu | facile | — |  |
| collant | facile | — |  |
| bracelet | facile | — |  |
| poncho | facile | — |  |
| tongs | facile | — |  |
| bandana | facile | — |  |
| sac à dos | facile | — |  |
| ceinture | moyen | — |  |
| manteau | moyen | — |  |
| pyjama | moyen | — |  |
| imperméable | moyen | — |  |
| bretelles | moyen | — |  |
| costume | moyen | — |  |
| uniforme | moyen | — |  |
| turban | moyen | — |  |
| combinaison | moyen | — |  |

## Corps (42)

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
| cheveux | facile | — |  |
| barbe | facile | — |  |
| moustache | facile | — |  |
| sourcil | facile | — |  |
| langue | facile | — |  |
| hanche | facile | — |  |
| joue | facile | — |  |
| menton | facile | — |  |
| front | facile | — |  |
| cou | facile | — |  |
| épaule | facile | — |  |
| coude | facile | — |  |
| cheville | facile | — |  |
| talon | facile | — |  |
| orteil | facile | — |  |
| ongle | facile | — |  |
| pouce | facile | — |  |
| muscle | facile | — |  |
| nombril | facile | — |  |
| ventre | facile | — |  |
| dos | facile | — |  |
| paupière | facile | — |  |
| cil | facile | — |  |
| poumon | facile | — |  |
| cuisse | facile | — |  |
| genou | moyen | — |  |
| squelette | moyen | — |  |
| cerveau | moyen | — |  |
| mâchoire | moyen | — |  |
| narine | moyen | — |  |
| mollet | moyen | — |  |
| poignet | moyen | — |  |
