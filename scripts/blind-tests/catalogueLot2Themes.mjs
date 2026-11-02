// Lot 2, tests à thème (décision du 2 novembre 2026) : Disney, génériques de dessins animés, musiques de films et
// séries, Noël. La mesure Deezer juge l'interprète (une version française de Disney, un chanteur de génériques), pas
// l'œuvre : levelExempt accepte les titres de ce catalogue quel que soit leur niveau mesuré, s'ils ont un extrait
// (exception limitée à ces quatre tests). noDiscovery : jamais de remplaçant trouvé automatiquement (il était hors
// sujet). decoyList : leurres choisis à la main dans le thème, mesurés et vérifiés chez Deezer, seule source de leurres.
// Bonnes réponses : les titres demandés, interprètes de la version d'origine trouvés chez Deezer ; Pokémon et Olive et
// Tom (aucune version française d'origine chez Deezer, seulement des reprises) remplacés par Signé Cat's Eyes et Nicky
// Larson. displayTitles : titre affiché quand celui de Deezer est mal écrit (« L' air Du Vent »).
const F = 'F'
const LOT = { lot: 'BT-9', addedAt: '2026-11-02' }
const THEMED = { themed: true, levelExempt: true, noDiscovery: true }
const fr = (rows) => rows.map(([artist, title]) => [artist, title, 'fr'])
const en = (rows) => rows.map(([artist, title]) => [artist, title, 'en'])

export const TESTS_LOT2_THEMES = [
  { ...LOT, ...THEMED, id: 'disney-facile', prefix: 'dsn', title: 'Disney : les chansons cultes', description: 'Dix chansons de dessins animés Disney que toute la famille connaît par cœur.', level: 'easy', decade: 'all', genre: 'pop', poster: 'blue', icon: 'star', lang: 'fr',
    playlists: ['disney chansons françaises', 'disney en français', 'chansons disney'],
    candidates: [[F, 'Anaïs Delva', 'Libérée, délivrée'], [F, 'Dimitri Rougeul', 'Hakuna Matata'], [F, 'Karine Costa', 'Ce rêve bleu'], [F, 'Lucie Dolène', 'Histoire éternelle'], [F, 'Henri Salvador', "Sous l'océan"], [F, 'Jean Stout', 'Il en faut peu pour être heureux'], [F, 'Cerise Calixte', 'Le bleu lumière'], [F, 'Sharon Laloum', 'Ne parlons pas de Bruno'], [F, 'Laura Mayne', "L'air du vent"], [F, 'José Germain', 'Tout le monde veut devenir un cat']],
    reserves: [],
    displayTitles: { "L'air du vent": "L'air du vent" },
    aliases: {
      'Libérée, délivrée': { artist: ['La Reine des Neiges'] }, 'Hakuna Matata': { artist: ['Le Roi Lion'] }, 'Ce rêve bleu': { artist: ['Aladdin'] },
      'Histoire éternelle': { artist: ['La Belle et la Bête'] }, "Sous l'océan": { artist: ['La Petite Sirène'] }, 'Il en faut peu pour être heureux': { artist: ['Le Livre de la jungle'] },
      'Le bleu lumière': { artist: ['Vaiana'] }, 'Ne parlons pas de Bruno': { artist: ['Encanto'], title: ['On ne parle pas de Bruno'] }, "L'air du vent": { artist: ['Pocahontas'], title: ['Les couleurs du vent'] },
      'Tout le monde veut devenir un cat': { artist: ['Les Aristochats'] },
    },
    decoyList: fr([
      ['Maïdi Roth', "L'Amour Brille Sous Les Étoiles"], ['Maéva Méline', 'Où est la vraie vie?'], ['Coralie Thuilier', 'Je Voudrais un Bonhomme de Neige'], ['CharlElie Couture', 'Je Suis Ton Ami'],
      ['Charlotte Hervieux', 'Dans un autre monde'], ['Emmylou Homs', 'Le Renouveau'], ['Debbie Davis', "L'histoire de la vie"], ['Patrick Fiori', 'Comme un homme'],
      ['Kelly Marot', 'Nous Sommes Un'], ['Richard Darbois', 'Prince Ali'], ['Mimi Félixine', 'De Zéro En Héros'],
      ['Camille', 'Le Festin'], ['Claire Guyot', 'Partir là-bas'], ['Emmanuel Curtil', 'En Été'],
      ['Donald Reignoux', "J'ai perdu le nord"], ['Bernard Alane', "Nuits d'Arabie"], ['Sophie Delmas', "N'écoute que moi"],
      ['Marie Galey', 'Réflexion'], ['Rachel Pignot', 'Sifflez en travaillant'], ['Jean-Claude Donda', 'Heigh-Ho!'], ['Jean-Claude Corbel', 'Gaston'],
      ['Maurice Chevalier', 'Les Aristochats'], ['China Moses', 'Au Bout du Rêve'], ['Francis Lalanne', "Rien qu'un Jour"], ['Pierre Marret', 'La patrouille des éléphants'],
      ['Jean Piat', 'Soyez Prêtes'], ['Guillaume Beaujolais', "L'Amour Est un Cadeau"],
      ['Bénédicte Lecroard', 'Je ne savais pas'], ['Emmanuel Dahl', 'Le Monde Qui Est Le Mien'], ['Michel Roux', 'Chem-chem Cheminée'],
      ['Marie-Thérèse Orain', 'Honneur à tous'],
    ]) },
  { ...LOT, ...THEMED, id: 'generiques-dessins-animes-facile', prefix: 'gen', title: 'Génériques de dessins animés', description: 'Dix génériques de dessins animés qui ont bercé les mercredis après-midi.', level: 'easy', decade: 'all', era: [1975, 2005], genre: 'pop', poster: 'orange', icon: 'cassette', lang: 'fr',
    maxPerArtist: 2,
    playlists: ['génériques dessins animés', 'génériques club dorothée', 'génériques années 80'],
    candidates: [[F, 'Bernard Minet', 'Dragon Ball et Dragon Ball Z'], [F, 'Bernard Minet', 'Les chevaliers du zodiaque'], [F, 'Isabelle Guillard', "Signé Cat's Eyes"], [F, 'Jacques Cardona', "Les mystérieuses cités d'or"], [F, 'Les Goldies', "Goldorak : La légende d'Actarus"], [F, 'Jacques Cardona', 'Inspecteur Gadget'], [F, 'Éric Charden', "Albator, le corsaire de l'espace"], [F, 'Lionel Leroy', 'Ulysse 31'], [F, 'Jean-Paul Césari', 'Nicky Larson'], [F, 'Dominique Poulain', 'Au pays de Candy']],
    reserves: [],
    aliases: {
      'Dragon Ball et Dragon Ball Z': { artist: ['Dragon Ball Z', 'Dragon Ball'] }, 'Les chevaliers du zodiaque': { artist: ['Les Chevaliers du Zodiaque'] },
      "Signé Cat's Eyes": { artist: ["Cat's Eyes"] }, "Les mystérieuses cités d'or": { artist: ["Les Mystérieuses Cités d'or"] },
      "Goldorak : La légende d'Actarus": { artist: ['Goldorak'], title: ['Goldorak'] }, 'Inspecteur Gadget': { artist: ['Inspecteur Gadget'] }, "Albator, le corsaire de l'espace": { artist: ['Albator'], title: ['Albator'] },
      'Ulysse 31': { artist: ['Ulysse 31'] }, 'Nicky Larson': { artist: ['Nicky Larson'] }, 'Au pays de Candy': { artist: ['Candy'] },
    },
    decoyList: fr([
      ['Ricet Barrier', 'Voici venir les Barbapapa'], ['Nick Carr', 'Jayce et les conquérants de la lumière'], ['Richard Simon', 'Capitaine Flam: La chevauchée du Capitaine Flam'], ['Les Minipouss', 'Les Minipouss'],
      ['Marie Dauphin', 'Clémentine'], ['Stephanie', 'Les bisous des Bisounours'], ['Peter Lorne', 'Denver, le dernier dinosaure'], ['Olivier Constantin', 'Cobra'],
      ['Elfie', 'Tom Sawyer: Le petit monde de Tom Sawyer'], ['Michel Legrand', "Il était une fois...l'espace"], ['Bernard Denimal', 'Ken le survivant'], ['Francine Chantereau', 'La chanson de Lamu'],
      ['Stéphanie Barre', 'La chanson de mon petit poney'], ['Vladimir Cosma', 'Les mondes engloutis'], ['Noam', 'Les entrechats sont là!'], ['Dorothée', 'Les Schtroumpfs'],
      ['Alexandra', "La chanson d'Heidi"], ['Claude Lombard', 'Flo et les Robinson Suisses'], ['Céline Pouzet', 'Rahan'], 
      ['Junior Family', 'But pour Rudy'], ['Daniele Hazan', "L'ours Gabby et les Petits Malins"], ['Marie Dauphin', 'Lady Oscar'], ['H. Saban', "Les maîtres de l'univers"],
      ['The Edwin Davids Jazz Band', 'La panthère rose'], ['Noam', 'Les quatre fantastiques'], ['Paolo Tuci', 'Creamy, Merveilleuse Creamy'], ['Valérie Barouille', 'BécéBégé'],
      ['Emmanuelle', 'Poupée de bois'], ['Charlotte', 'Mes tendres années'], ['Bernard Denimal', 'Galaxy Express'],
    ]) },
  { ...LOT, ...THEMED, id: 'musiques-films-series-facile', prefix: 'bof', title: 'Musiques de films et séries', description: 'Dix thèmes de films et de séries que tu reconnais en trois notes.', level: 'easy', decade: 'all', genre: 'pop', poster: 'gold', icon: 'clapper', lang: 'en',
    playlists: ['musiques de films cultes', 'movie themes', 'génériques séries tv', 'bandes originales films'],
    candidates: [[F, 'John Williams', 'Star Wars: Main Title'], [F, 'Klaus Badelt', "He's a Pirate"], [F, 'Ramin Djawadi', 'Game of Thrones (Main Title)'], [F, 'Lalo Schifrin', 'Mission: Impossible'], [F, 'Monty Norman', 'James Bond Theme'], [F, 'Bill Conti', 'Gonna Fly Now'], [F, 'Ray Parker Jr.', 'Ghostbusters'], [F, 'Yann Tiersen', "Comptine d'un autre été, l'après-midi", 'fr'], [F, 'Bruno Coulais', 'Vois sur ton chemin', 'fr'], [F, 'Nino Rota', 'Love Theme From "The Godfather"']],
    reserves: [],
    aliases: {
      'Star Wars: Main Title': { artist: ['Star Wars'], title: ['Star Wars'] }, "He's a Pirate": { artist: ['Pirates des Caraïbes'], title: ['Pirates des Caraïbes'] },
      'Game of Thrones': { artist: ['Game of Thrones'] }, 'Mission: Impossible': { artist: ['Mission: Impossible'] },
      'James Bond Theme': { artist: ['James Bond'], title: ['James Bond'] }, 'Gonna Fly Now': { artist: ['Rocky'], title: ['Rocky'] },
      Ghostbusters: { artist: ['SOS Fantômes'], title: ['SOS Fantômes'] }, "Comptine d'un autre été, l'après-midi": { artist: ['Amélie Poulain', "Le Fabuleux Destin d'Amélie Poulain"], title: ['Amélie Poulain', "Comptine d'un autre été"] },
      'Vois sur ton chemin': { artist: ['Les Choristes'], title: ['Les Choristes'] }, 'Love Theme From "The Godfather"': { artist: ['Le Parrain'], title: ['Le Parrain', 'Parle plus bas', 'The Godfather'] },
    },
    displayTitles: { 'Game of Thrones (Main Title)': 'Game of Thrones' },
    decoyList: [
      ...en([
        ['Hans Zimmer', 'Time'], ['Kyle Dixon & Michael Stein', 'Stranger Things'], ['Vangelis', 'Conquest of Paradise'], ['Lisa Gerrard', 'Now We Are Free'],
        ['Alan Silvestri', 'The Avengers'], ['Justin Hurwitz', 'Mia & Sebastian’s Theme'], ['Kenny Loggins', 'Footloose'],
        ['John Travolta', "You're The One That I Want"], ['Ludovico Einaudi', 'Fly'], ['Harold Faltermeyer', 'Axel F'], ['John Carpenter', 'Halloween Theme'],
        ['Mike Oldfield', 'Tubular Bells'], ['Henry Mancini', 'The Pink Panther Theme'], ['Jan Hammer', 'Miami Vice Theme'],
        ['Howard Shore', 'Concerning Hobbits'], ['Will Smith', 'Men In Black'], ['Smash Mouth', 'All Star'], ['Simple Minds', "Don't You (Forget About Me)"],
        ['Irene Cara', 'Flashdance...What a Feeling'], ['Berlin', 'Take My Breath Away'], ['Enya', 'May It Be'], ['Bryan Adams', '(Everything I Do) I Do It for You'],
        ['Bee Gees', 'Night Fever'], ['James Newton Howard', 'The Hanging Tree'], ['Lana Del Rey', 'Young And Beautiful'], ['Lady Gaga', 'Shallow'],
        ['Nancy Sinatra', 'Bang Bang (My Baby Shot Me Down)'], ['Stealers Wheel', 'Stuck In The Middle With You'], ['Michael Andrews', 'Mad World'],
      ]),
      ...fr([
        ['Vladimir Cosma', 'Le grand blond'], ['Francis Lai', 'Un homme et une femme'], ['Ennio Morricone', 'Chi Mai'], ['Debbie Davis', "L'histoire de la vie"],
        ['CharlElie Couture', 'Je Suis Ton Ami'], ['Alabina', 'Alabina'],
      ]),
    ] },
  { ...LOT, ...THEMED, id: 'chansons-de-noel-facile', prefix: 'noel', title: 'Chansons de Noël', description: 'Dix chansons de Noël que tout le monde fredonne dès décembre.', level: 'easy', decade: 'all', genre: 'pop', poster: 'red', icon: 'star', lang: 'en',
    playlists: ['chansons de noël', 'christmas hits', 'christmas classics', 'chansons de noël françaises'],
    candidates: [[F, 'Mariah Carey', 'All I Want for Christmas Is You'], [F, 'Wham!', 'Last Christmas'], [F, 'Tino Rossi', 'Petit papa Noël', 'fr'], [F, 'Brenda Lee', "Rockin' Around the Christmas Tree"], [F, 'Slade', 'Merry Xmas Everybody'], [F, 'José Feliciano', 'Feliz Navidad'], [F, 'Chris Rea', 'Driving Home for Christmas'], [F, 'Band Aid', "Do They Know It's Christmas? (1984 Version)"], [F, 'Andy Williams', "It's the Most Wonderful Time of the Year"], [F, 'John Lennon', 'Happy Xmas (War Is Over)']],
    reserves: [],
    aliases: { 'Merry Xmas Everybody': { title: ['Merry Christmas Everybody'] }, 'Happy Xmas (War Is Over)': { title: ['Happy Christmas', 'Happy Xmas'] } },
    decoyList: [
      ...en([
        ['Sia', 'Snowman'], ['Dean Martin', 'Let It Snow! Let It Snow! Let It Snow!'], ['Michael Bublé', "It's Beginning to Look a Lot like Christmas"], ['Kelly Clarkson', 'Underneath the Tree'],
        ['Nat King Cole', 'The Christmas Song'], ['The Ronettes', 'Sleigh Ride'], ['Bobby Helms', 'Jingle Bell Rock'], ["Shakin' Stevens", 'Merry Christmas Everyone'],
        ['Gene Autry', 'Rudolph the Red-Nosed Reindeer'], ['Burl Ives', 'A Holly Jolly Christmas'], ['Darlene Love', 'Christmas (Baby Please Come Home)'], ['Leona Lewis', 'One More Sleep'],
        ['Paul McCartney', 'Wonderful Christmastime'], ['Chuck Berry', 'Run Rudolph Run'], ['Eartha Kitt', 'Santa Baby'], ['Elvis Presley', 'Blue Christmas'],
 ['Ariana Grande', 'Santa Tell Me'], ['Justin Bieber', 'Mistletoe'], ['Bing Crosby', 'White Christmas'],
        ['Frank Sinatra', 'Jingle Bells'], ['Coldplay', 'Christmas Lights'], ['Train', 'Shake Up Christmas'], ['Elton John', 'Step Into Christmas'],
        ['Wizzard', 'I Wish It Could Be Christmas Everyday'], ['Stevie Wonder', 'Someday at Christmas'], ['The Jackson 5', 'I Saw Mommy Kissing Santa Claus'],
        ['Judy Garland', 'Have Yourself a Merry Little Christmas'], ['Gwen Stefani', 'You Make It Feel Like Christmas'], ['Taylor Swift', 'Christmas Tree Farm'],
        ['The Waitresses', 'Christmas Wrapping'], ['Sabrina Carpenter', 'A Nonsense Christmas'], ['Ella Fitzgerald', 'Frosty the Snowman'],
      ]),
      ...fr([
        ['Dalida', 'Vive le vent'], ['Johnny Hallyday', 'Mon plus beau Noël'], ['La Compagnie Créole', 'Bons baisers de Fort-de-France'],
      ]),
    ] },
]
