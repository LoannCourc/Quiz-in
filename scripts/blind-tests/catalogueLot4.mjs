// Lot 4 de la refonte (demande du 2 novembre 2026, tests 43 à 50, tous « Impossible ») : chaque ligne donne un
// artiste de départ ; titre null (« à choisir via l'API ») ou titre refusé : generate.mjs prend un autre titre de cet
// artiste, en position 6 ou plus de son top Deezer, qui passe le test (pickFromArtist) ; sinon une réserve (artiste
// seul), puis un artiste proche trouvé par l'API. Plafond de 100 000 fans (thresholds.json). Décennies du contenu :
// 1960 à 2020 ou « all » ; era : années acceptées par le générateur. Genres : pop, rock, rap, chanson, electro.
const I = 'I'
const LOT = { lot: 'BT-11', addedAt: '2026-11-02' }
const impossible = { level: 'impossible', audience: 'experts' }
const artists = (names) => names.map((name) => [I, name, null])
const FRENCH_RAPPERS = ["Diam's", 'Soprano', "Shurik'N", 'IAM', 'MC Solaar', 'Booba', 'Suprême NTM', 'NTM', 'Oxmo Puccino', 'Rohff', 'Sinik', 'Kery James', "Sexion d'Assaut", 'Akhenaton', 'Lunatic', "Mafia K'1 Fry", 'Psy 4 de la Rime', 'Fonky Family', 'Disiz', 'Saïan Supa Crew', 'Sniper', 'Ärsenik', 'Passi', 'Doc Gynéco']

export const TESTS_LOT4 = [
  { ...LOT, ...impossible, id: 'rock-indie-impossible', prefix: 'rii', title: 'Rock indé : faces cachées', description: 'Du rock indé confidentiel des années 2000 à 2020 : pour les vrais curieux.', decade: 'all', era: [2000, 2022], genre: 'rock', poster: 'red', icon: 'guitar', lang: 'en',
    playlists: ['indie rock deep cuts', 'indie rock 2010s', 'post-punk revival', 'lo-fi indie rock'],
    excludedDecoys: [['Whitney', 'Take Me Home, Country Roads']], // reprise de John Denver
    candidates: [[I, 'Ought', 'Beautiful Blue Sky'], [I, 'Viet Cong', 'Continental Shelf'], [I, 'Girlpool', 'Before the World Was Big'], [I, 'Yuck', 'Get Away'], [I, 'Cloud Nothings', 'Wasted Days'], [I, 'Real Estate', "It's Real"], [I, 'The Pains of Being Pure at Heart', 'Young Adult Friction'], [I, 'Wild Nothing', 'Shadow'], [I, 'Beach Fossils', 'Daydream'], [I, 'Surfer Blood', 'Swim']],
    reserves: [] },
  { ...LOT, ...impossible, id: 'pop-internationale-oubliee-impossible', prefix: 'pio', title: 'Pop internationale oubliée', description: "Les autres titres des artistes pop des années 2000 : ceux que presque personne n'a retenus.", decade: 2000, era: [1998, 2010], genre: 'pop', poster: 'pink', icon: 'headphones', lang: 'en',
    playlists: ['2000s pop', 'early 2000s pop', 'forgotten 2000s pop', 'pop 2000s', '2000s pop hits', 'girl bands 2000s', 'boy bands 2000s'],
    excludedCorrect: [['Delta Goodrem', 'Hopelessly Devoted to You'], ['BoA', 'Girls On Top']], // reprise (Grease) ; K-pop hors thème
    excludedDecoyArtists: ['Måns Zelmerlöw', '2PM', 'Shinhwa', 'BoA', 'Sistar', 'Mystikal', 'S Club Juniors', 'Yamandu Costa', 'Targino Gondim'], // reprises de Noël ; K-pop, rap, guitare brésilienne hors thème
    excludedDecoys: [['Geri Halliwell', "These Boots Are Made for Walkin'"]], // reprise
    seeds: ['S Club 7', 'Steps', 'Busted', 'McFly', 'Girls Aloud', 'Rachel Stevens', 'Holly Valance', 'Natasha Bedingfield', 'JoJo', 'The Veronicas', 'Jesse McCartney', 'Ashlee Simpson', 'Anastacia', 'Westlife', 'Sophie Ellis-Bextor', 'Sugababes', 'Kylie Minogue', 'Christina Milian'],
    candidates: [[I, 'Atomic Kitten', 'The Tide Is High'], [I, 'Natalie Imbruglia', 'Wishing I Was There'], [I, 'Mandy Moore', 'Candy'], [I, 'Michelle Branch', 'Goodbye to You'], [I, 'Blue', 'One Love'], [I, 'Liberty X', 'Thinking It Over'], [I, 'A1', 'Caught in the Middle'], [I, 'Mis-Teeq', 'Scandalous'], [I, 'Hilary Duff', 'Come Clean'], [I, 'Delta Goodrem', 'Lost Without You']],
    reserves: [] },
  { ...LOT, ...impossible, id: 'rap-us-underground-impossible', prefix: 'rui', title: 'Rap US underground', description: 'Du rap américain underground : pour les initiés uniquement.', decade: 'all', era: [1998, 2020], genre: 'rap', poster: 'blue', icon: 'microphone', lang: 'en',
    excludedDecoys: [['Felt', 'Through The Night']], // introuvable par npm run music:decoys
    playlists: ['underground hip hop', 'boom bap', 'backpack rap', 'rhymesayers'],
    excludedDecoyArtists: FRENCH_RAPPERS,
    candidates: [[I, 'Aesop Rock', 'None Shall Pass'], [I, 'Atmosphere', 'Trying to Find a Balance'], [I, 'Brother Ali', 'Forest Whitaker'], [I, 'Sage Francis', 'Makeshift Patriot'], [I, 'Cannibal Ox', 'Iron Galaxy'], [I, 'Jedi Mind Tricks', 'Heavy Metal Kings'], [I, 'Murs', 'The Science'], [I, 'Evidence', 'Mr. Slow Flow'], [I, 'Masta Ace', 'Born to Roll'], [I, 'Little Brother', 'Whatever You Say']],
    reserves: [] },
  { ...LOT, ...impossible, id: 'rap-francais-old-school-impossible', prefix: 'rfo', title: 'Rap français old school', description: 'Du rap français des années 90 et 2000, loin des tubes : pour les vrais connaisseurs.', decade: 1990, era: [1990, 2006], genre: 'rap', poster: 'gold', icon: 'microphone', lang: 'fr',
    excludedDecoys: [['Intouchable', 'Les points sur les i'], ['Chiens de Paille', "L'Encre de nos plumes"]], // introuvable par npm run music:decoys
    playlists: ['rap français années 90', 'rap fr old school', 'rap français 90s', 'rap français années 2000'],
    excludedDecoyArtists: ['Cut Killer', 'DJ Whoo Kid'], // mixtapes aux titres composites
    candidates: artists(['Fonky Family', 'Ideal J', 'Secteur Ä', 'Rocca', 'Lunatic', 'K-Mel', 'Les Sages Poètes de la Rue', 'Ménélik', 'X-Men', 'Busta Flex']),
    reserves: artists(['Ministère A.M.E.R.', 'Passi', 'Pit Baccardi', 'Alliance Ethnik', '3e Œil']),
    seeds: ['Fabe', 'La Rumeur', 'Assassin', 'Stomy Bugsy', 'Kool Shen', 'Zoxea', "Ol' Kainry", 'Le 3ème Œil', 'Driver', 'Lady Laistee', 'Mellowman', 'Freeman', 'Tandem', 'Kheops', 'La Brigade', 'Beat De Boul', 'KDD', 'ATK', 'Hifi', 'Mafia Trece', 'Expression Direkt'] },
  { ...LOT, ...impossible, id: 'variete-francaise-oubliee-impossible', prefix: 'vfo', title: 'Variété française oubliée', description: 'La variété française des années 80-90 que plus personne ne passe : pour les vrais connaisseurs.', decade: 1980, era: [1980, 1999], genre: 'chanson', poster: 'violet', icon: 'accordion', lang: 'fr',
    playlists: ['variété française années 80', 'tubes oubliés années 80', 'années 80 françaises', 'variété française années 90', 'chanson française années 90', 'tubes oubliés années 90', 'variété française 80 90'],
    candidates: artists(['Corynne Charby', 'Jakie Quartz', 'Phil Barney', 'Elli et Jacno', 'Kent', 'Gold', 'Cookie Dingler', 'Peter & Sloane', 'Lio', 'Jeanne Mas']),
    reserves: artists(['Joniece Jamison', 'Léopold Nord & Vous', 'Les Forbans', 'Étienne Daho', 'Richard Sanderson']),
    // Artistes de départ en plus pour la découverte des leurres (variété des années 80-90 peu suivie chez Deezer).
    excludedDecoyArtists: ['Elli Medeiros', 'Jacno'], // moitiés d'Elli et Jacno, bonne réponse du test
    seeds: ['Jean-Pierre Mader', 'Philippe Lavil', 'Partenaire Particulier', 'Début de Soirée', 'Sabine Paturel', 'Muriel Dacq', 'Desireless', 'Gérard Blanc', 'Bandolero', 'Pauline Ester', 'Caroline Loeb', 'Viktor Lazlo', 'Jean-Luc Lahaye', 'Images', 'Indochine'] },
  { ...LOT, ...impossible, id: 'electro-pointue-impossible', prefix: 'epi', title: 'Électro pointue', description: "De l'électro confidentielle : techno, IDM, ambient. Réservé aux initiés.", decade: 'all', genre: 'electro', deezerGenre: /electro|techno|dance|house|ambient/i, poster: 'green', icon: 'headphones', lang: 'any',
    excludedDecoys: [['Venetian Snares', 'Kétsarkú Mozgalom']], // introuvable par npm run music:decoys
    excludedDecoyArtists: ['Richie Hawtin'], // Plastikman est son pseudonyme
    playlists: ['idm', 'detroit techno', 'minimal techno', 'ambient electronic', 'warp records'],
    candidates: artists(['Autechre', 'Squarepusher', 'Plastikman', 'Jeff Mills', 'Carl Craig', 'Model 500', 'Aril Brikha', 'Andy Stott', 'Actress', 'Rival Consoles']),
    // Retouche du 2 novembre 2026 : « i4 » et « Mirror signal », sortis le 30 octobre 2026 (rang provisoire de 100 000)
    // → titres plus anciens des mêmes artistes (réserves en tête), position 6 ou plus, rang réel.
    replaceCorrect: [['Jeff Mills', 'i4'], ['Andy Stott', 'Mirror signal']],
    excludedCorrect: [['Jeff Mills', 'Late Night']], // seule édition retenue : extrait de la compilation mixée « Carl Cox: F.A.C.T. » (121 s)
    reserves: artists(['Jeff Mills', 'Andy Stott', 'Surgeon', 'Biosphere', 'Gas', 'Lone', 'Oneohtrix Point Never']) },
  { ...LOT, ...impossible, id: 'annees-80-oubliees-impossible', prefix: 'a80o', title: 'Années 80 oubliées', description: 'Les groupes des années 80 qui ont disparu des playlists : pour les vrais curieux.', decade: 1980, genre: 'pop', poster: 'pink', icon: 'cassette', lang: 'en',
    excludedDecoys: [['DEVO', 'Gates of Steel']], // introuvable par npm run music:decoys
    playlists: ['80s new wave', 'new wave deep cuts', 'synthpop 80s', '80s forgotten hits'],
    candidates: artists(['Nik Kershaw', 'Thompson Twins', 'Howard Jones', 'Heaven 17', 'Visage', 'Re-Flex', 'Classix Nouveaux', 'Naked Eyes', 'The Fixx', 'China Crisis']),
    reserves: artists(['Johnny Hates Jazz', 'Go West', 'Hue and Cry', 'Scritti Politti', 'A Flock of Seagulls']) },
  { ...LOT, ...impossible, id: 'nouvelle-scene-francaise-impossible', prefix: 'nsf', title: 'Nouvelle scène française', description: "La scène française récente, celle qui n'est pas encore sur toutes les playlists.", decade: 'all', era: [2012, 2026], genre: 'chanson', poster: 'cyan', icon: 'note', lang: 'fr',
    excludedDecoyArtists: ['Bagarre'], // titres sur l'album « CLUB 12345 », refusé par npm run music:verify (« club » = autre version)
    playlists: ['nouvelle scène française', 'pop française indé', 'scène française émergente', 'chanson française nouvelle génération'],
    excludedDecoys: [['Flora Fishbach', 'Tombe la neige - Le Grand Noël'], ['Clou', "Les copains d'abord"], ['Marie-Flore', "L'été indien - Souvenirs d'été"]], // titres composites ; reprise
    candidates: artists(['Grand Blanc', 'Terrenoire', 'Voyou', 'Kids Return', 'Mansfield.TYA', 'Bagarre', 'Last Train', 'La Maison Tellier', 'Sages Comme des Sauvages', 'Hervé']),
    reserves: artists(["L'Impératrice", 'La Femme', 'Jeanne Added', 'Lujipeka', 'Pierre de Maere']) },
]
