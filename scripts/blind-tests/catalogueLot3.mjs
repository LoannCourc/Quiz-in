// Lot 3 de la refonte (demande du 2 novembre 2026, tests 28 à 42 sauf 35, tous « Tous niveaux » ; « Classique et opéra »
// retiré le 2 novembre 2026, option b : remplacé plus tard par un test que le développeur fournira) : candidats de la demande,
// réserves ajoutées pour chaque niveau. Genres du contenu limités à pop, rock, rap, chanson, discoFunk, electro (décision
// du lot 2 : aucun genre ajouté) ; deezerGenre : genre Deezer exigé des remplaçants et des leurres (contrôle du
// générateur, jamais publié). lang 'any' : langue du titre non contrôlée (titres d'œuvres classiques en plusieurs
// langues). Tests à thème (films et séries, Disney) : même méthode qu'au lot 2 (catalogueLot2Themes.mjs).
const F = 'F', M = 'M', D = 'D', I = 'I'
const LOT = { lot: 'BT-10', addedAt: '2026-11-02' }
const THEMED = { themed: true, levelExempt: true, noDiscovery: true }
const tag = (lang) => (rows) => rows.map(([artist, title]) => [artist, title, lang])
const fr = tag('fr')
const en = tag('en')
const mixed = { level: 'mixed', audience: 'all' }

export const TESTS_LOT3 = [
  { ...LOT, ...mixed, id: 'le-grand-melange', prefix: 'gm', title: 'Le grand mélange', description: 'Tous les genres, toutes les époques, tous les niveaux : le blind test qui ne prévient pas.', decade: 'all', genre: 'pop', poster: 'violet', icon: 'note', lang: 'en',
    excludedDecoyArtists: ['Heinz Rudolf Kunze', 'Herbert Grönemeyer', 'Nena', 'Peter Maffay', 'Falco', 'Westernhagen'],
    playlists: ['greatest hits of all time', '80s hits', 'pop classics', 'one hit wonders'],
    candidates: [[F, 'Michael Jackson', 'Thriller'], [F, 'Adele', 'Someone Like You'], [M, 'Amy Winehouse', "You Know I'm No Good"], [M, 'David Bowie', 'Ashes to Ashes'], [M, 'Stevie Wonder', 'Sir Duke'], [D, 'Soft Cell', 'Tainted Love'], [D, 'Alphaville', 'Forever Young'], [D, "Dexys Midnight Runners", 'Come On Eileen'], [I, 'Nena', 'Nur geträumt', 'de'], [I, 'The Korgis', 'If I Had You']],
    reserves: [[F, 'Queen', 'We Will Rock You'], [F, 'Bruno Mars', 'Uptown Funk'], [M, 'Prince', 'When Doves Cry'], [M, 'Elton John', 'Tiny Dancer'], [D, 'Cutting Crew', '(I Just) Died in Your Arms'], [D, 'Nik Kershaw', 'Wouldn’t It Be Good'], [D, 'Kim Wilde', 'Kids in America'], [I, 'The Korgis', 'Everybody’s Got to Learn Sometime']] },
  { ...LOT, ...mixed, id: 'rock-mixte', prefix: 'rkm', title: 'Rock : tous niveaux', description: 'Du tube à la pépite : dix morceaux, du plus évident au plus pointu.', decade: 'all', genre: 'rock', poster: 'red', icon: 'guitar', lang: 'en',
    playlists: ['rock classics', 'classic rock hits', '70s rock', 'deep cuts classic rock'],
    candidates: [[F, 'AC/DC', 'Back In Black'], [F, 'Led Zeppelin', 'Stairway to Heaven'], [M, 'Deep Purple', 'Highway Star'], [M, 'Foo Fighters', 'Monkey Wrench'], [M, 'Aerosmith', 'Dude (Looks Like a Lady)'], [D, 'Kansas', 'Carry on Wayward Son'], [D, 'Steppenwolf', 'Born To Be Wild'], [D, 'Free', 'All Right Now'], [I, 'Cheap Trick', 'Surrender'], [I, 'Blue Öyster Cult', "Burnin' for You"]],
    reserves: [[F, 'Queen', 'Another One Bites the Dust'], [F, 'The Rolling Stones', 'Paint It, Black'], [M, 'Queen', 'Tie Your Mother Down'], [M, 'The Who', 'My Generation'], [D, 'Boston', 'More Than a Feeling'], [D, 'Thin Lizzy', 'The Boys Are Back in Town'], [D, 'Survivor', 'Eye of the Tiger'], [I, 'Bachman-Turner Overdrive', 'Takin’ Care of Business']] },
  { ...LOT, ...mixed, id: 'rap-us-mixte', prefix: 'rum', title: 'Rap US : tous niveaux', description: 'Du tube à la pépite : dix morceaux, du plus évident au plus pointu.', decade: 'all', era: [1985, 2015], genre: 'rap', poster: 'blue', icon: 'microphone', lang: 'en',
    playlists: ['hip hop classics', '90s hip hop', '2000s hip hop', 'old school hip hop'],
    excludedDecoyArtists: ["Diam's", 'Soprano', "Shurik'N", 'IAM', 'MC Solaar', 'Booba', 'Suprême NTM', 'NTM', 'Oxmo Puccino', 'Rohff', 'Sinik', 'Kery James', "Sexion d'Assaut", 'Akhenaton', 'Lunatic', "Mafia K'1 Fry", 'Psy 4 de la Rime', 'Fonky Family', 'Disiz', 'Saïan Supa Crew', 'Sniper', 'Ärsenik', 'Passi', 'Doc Gynéco', 'The 2 Live Crew'],
    candidates: [[F, 'Kanye West', 'Gold Digger'], [F, '2Pac', 'Changes'], [M, 'JAY-Z', 'Dirt Off Your Shoulder'], [M, '50 Cent', 'Many Men (Wish Death)'], [M, 'Ludacris', 'Stand Up'], [D, 'House Of Pain', 'Jump Around'], [D, 'Kris Kross', 'Jump'], [D, 'Naughty By Nature', 'O.P.P.'], [I, 'Vanilla Ice', 'Play That Funky Music'], [I, 'Tone-Loc', 'Funky Cold Medina']],
    // Retouche du 2 novembre 2026 : reprise de « Play That Funky Music » (Wild Cherry, bonne réponse des années 70).
    replaceCorrect: [['Vanilla Ice', 'Play That Funky Music']],
    reserves: [[F, 'Eminem', 'The Real Slim Shady'], [F, 'Snoop Dogg', 'Young, Wild & Free'], [M, 'Eminem', 'Sing for the Moment'], [M, 'Nas', 'If I Ruled the World'], [D, 'Sir Mix-A-Lot', 'Baby Got Back'], [D, 'Young MC', 'Bust a Move'], [D, 'Digital Underground', 'The Humpty Dance'], [I, 'Tone-Loc', 'Wild Thing']] },
  { ...LOT, ...mixed, id: 'rnb-soul-mixte', prefix: 'rnb', title: 'RnB et soul : tous niveaux', description: 'Du tube à la pépite : dix morceaux, du plus évident au plus pointu.', decade: 'all', genre: 'pop', deezerGenre: /r&b|soul|funk/i, poster: 'pink', icon: 'microphone', lang: 'en',
    displayTitles: { 'Back to Life (However Do You Want Me)': 'Back to Life' },
    playlists: ['rnb classics', 'soul classics', '90s rnb', 'motown'],
    candidates: [[F, 'Alicia Keys', "Fallin'"], [F, 'Beyoncé', 'Single Ladies (Put a Ring on It)'], [M, 'Usher', 'U Got It Bad'], [M, 'Marvin Gaye', 'Mercy Mercy Me (The Ecology)'], [M, 'Mary J. Blige', 'Real Love'], [D, 'Soul II Soul', 'Back to Life (However Do You Want Me)'], [D, 'Lisa Stansfield', 'All Around the World'], [D, 'Rose Royce', 'Car Wash'], [I, 'Joyce Sims', 'Come into My Life'], [I, 'Surface', 'Happy']],
    reserves: [[F, 'Rihanna', 'Diamonds'], [F, 'John Legend', 'All of Me'], [M, 'Alicia Keys', 'No One'], [M, 'Aretha Franklin', 'Think'], [D, 'En Vogue', 'Free Your Mind'], [D, 'Shai', 'If I Ever Fall in Love'], [I, 'Surface', 'Shower Me with Your Love']] },
  { ...LOT, ...mixed, id: 'electro-french-touch-mixte', prefix: 'eft', title: 'Électro et French touch : tous niveaux', description: 'Du tube à la pépite : dix morceaux, du plus évident au plus pointu.', decade: 'all', genre: 'electro', poster: 'green', icon: 'headphones', lang: 'en',
    playlists: ['french touch', 'french touch classics', 'electro hits', 'filter house'],
    // Retouche du 2 novembre 2026 : bonne réponse hors thème remplacée en patch (generate.mjs --patch --replace-listed).
    replaceCorrect: [['Mosimann', 'Soon']],
    candidates: [[F, 'David Guetta', 'When Love Takes Over'], [F, 'Daft Punk', 'Harder, Better, Faster, Stronger'], [M, 'Air', 'Kelly Watch the Stars'], [M, 'Justice', 'Genesis'], [M, 'Martin Solveig', 'Everybody'], [D, 'Modjo', 'Lady (Hear Me Tonight)'], [D, 'Stardust', 'Music Sounds Better With You'], [D, 'Cassius', 'Toop Toop'], [I, 'Étienne de Crécy', 'Prix Choc'], [I, 'Alex Gopher', 'Brain Leech']],
    reserves: [[F, 'Daft Punk', 'Digital Love'], [F, 'Kavinsky', 'Nightcall'], [F, 'Daft Punk', 'Instant Crush'], [F, 'Petit Biscuit', 'Sunset Lover'], [F, 'Breakbot', "Baby I'm Yours"], [M, 'Justice', 'D.A.N.C.E.'], [M, 'Air', 'Sexy Boy'], [D, 'Bob Sinclar', 'Gym Tonic'], [D, 'Superfunk', 'Lucky Star'], [D, 'Benjamin Diamond', 'In Your Arms (We Gonna Make It)'], [I, 'Alex Gopher', 'The Child']] },
  { ...LOT, ...mixed, id: 'variete-francaise-mixte', prefix: 'vfm', title: 'Variété française : tous niveaux', description: 'Du tube à la pépite : dix chansons de variété française, du plus évident au plus pointu.', decade: 'all', era: [1970, 2026], genre: 'chanson', poster: 'violet', icon: 'accordion', lang: 'fr',
    excludedDecoyArtists: ['Corsu - Mezu Mezu', 'The Frenchy Family', 'Pat Benesta'], // titre corse, reprises
    playlists: ['variété française', 'variété française années 80', 'tubes français', 'chanson française années 2010'],
    candidates: [[F, 'Aya Nakamura', 'Djadja'], [F, 'Angèle', 'Balance ton quoi'], [M, 'Jean-Jacques Goldman', 'Quand la musique est bonne'], [M, 'Mylène Farmer', 'Libertine'], [M, 'Francis Cabrel', 'Octobre'], [D, 'Images', 'Les démons de minuit'], [D, 'Début De Soirée', 'Nuit de folie'], [D, 'Axelle Red', 'Sensualité'], [I, 'Jean-Pierre Mader', 'Disparue'], [I, 'Gilbert Montagné', 'The Fool']],
    reserves: [[F, 'Stromae', 'Alors on danse'], [F, 'Indila', 'Dernière danse'], [M, 'Céline Dion', 'On ne change pas'], [M, 'Patrick Bruel', 'Casser la voix'], [D, 'Gold', 'Capitaine abandonné'], [D, 'Émile et Images', 'Jusqu’au bout de la nuit'], [D, 'Pauvres Martins', 'Mama Lova'], [I, 'Jean-Pierre Mader', 'Jalousie']] },
  { ...LOT, ...mixed, id: 'annees-70-mixte', prefix: 'a70m', title: 'Années 70 : tous niveaux', description: 'Du tube à la pépite : dix morceaux des années 70, du plus évident au plus pointu.', decade: 1970, genre: 'pop', poster: 'gold', icon: 'discoBall', lang: 'en',
    playlists: ['tubes années 70', '70s hits', '70s one hit wonders', 'disco 70s'],
    excludedDecoyArtists: ['Laurent Voulzy', 'Michel Sardou', 'Claude François', 'Joe Dassin', 'Michel Polnareff', 'Alain Souchon', 'Véronique Sanson', 'Michel Berger', 'France Gall', 'Patrick Hernandez', 'Ottawan', 'Sheila', 'Umberto Tozzi', 'Gérard Lenorman', 'Mike Brant', 'Dalida'],
    candidates: [[F, 'ABBA', 'Mamma Mia'], [F, 'Elton John', 'Rocket Man (I Think It’s Going to Be a Long, Long Time)'], [M, 'Eagles', 'Take It Easy'], [M, 'Fleetwood Mac', 'Rhiannon'], [M, 'David Bowie', 'Rebel Rebel'], [D, 'Wild Cherry', 'Play That Funky Music'], [D, 'Hot Chocolate', 'You Sexy Thing'], [D, 'Looking Glass', "Brandy (You're a Fine Girl)"], [I, 'Racey', 'Some Girls'], [I, 'Showaddywaddy', 'Under the Moon of Love']],
    reserves: [[F, 'Queen', 'We Are the Champions'], [F, 'ABBA', 'Waterloo'], [M, 'Eagles', 'Lyin’ Eyes'], [M, 'Rod Stewart', 'Sailing'], [D, 'Sweet', 'Ballroom Blitz'], [D, 'Mungo Jerry', 'In the Summertime'], [D, 'Lipps Inc.', 'Funkytown'], [I, 'Racey', 'Lay Your Love on Me']] },
  { ...LOT, ...mixed, id: 'annees-2020-mixte', prefix: 'a20m', title: 'Années 2020 : tous niveaux', description: 'Du tube à la pépite : dix morceaux des années 2020, du plus évident au plus pointu.', decade: 2020, genre: 'pop', poster: 'cyan', icon: 'smartphone', lang: 'en',
    // Titres sans langue visible d'artistes français ou allemands : jamais dans une question en anglais.
    excludedDecoyArtists: ['Camélia Jordana', 'MilleniumKid', 'Mauvais djo', 'Hoshi', 'Julien Doré', 'Grand Corps Malade'],
    excludedCorrect: [['Mauvais djo', '12'], ['Ritt Momney', 'Put Your Records On']], // « Put Your Records On » : reprise de Corinne Bailey Rae
    // Retouche du 2 novembre 2026 : « Material Lover » (position 7, Difficile seulement par le rang) → un vrai Difficile.
    replaceCorrect: [['SIENNA SPIRO', 'Material Lover']],
    excludedDecoys: [['Gaullin', 'Seven Nation Army'], ['Twocolors', 'Lovefool']], // reprises (The White Stripes, The Cardigans)
    strictHard: true,
    playlists: ['tubes 2020', 'hits 2021', 'hits 2022', 'tiktok hits'],
    candidates: [[F, 'Doja Cat', 'Say So'], [F, 'Olivia Rodrigo', 'good 4 u'], [M, 'Dua Lipa', 'Physical'], [M, 'Harry Styles', 'Adore You'], [M, 'Stromae', 'Santé', 'fr'], [D, 'Surf Mesa', 'ily (i love you baby)'], [D, 'Jawsh 685', 'Savage Love (Laxed - Siren Beat)'], [D, 'Imanbek', 'Roses (Imanbek Remix)'], [I, 'BENEE', 'Glitter'], [I, 'Wejdene', 'Coco']],
    reserves: [[F, 'The Weeknd', 'Save Your Tears'], [F, 'Lewis Capaldi', 'Before You Go'], [M, 'Billie Eilish', 'Happier Than Ever'], [M, 'Ed Sheeran', 'Shivers'], [D, 'Topic', 'Breaking Me'], [D, 'Riton', 'Friday'], [D, 'Joel Corry', 'Head & Heart'], [D, 'Nathan Evans', 'Wellerman'], [D, 'CKay', 'love nwantiti (ah ah ah)'], [D, 'Masked Wolf', 'Astronaut in the Ocean'], [D, 'SAINt JHN', 'Roses'], [D, '24kGoldn', 'Mood'], [I, 'BENEE', 'Snail']] },
  { ...LOT, ...mixed, ...THEMED, id: 'films-series-mixte', prefix: 'fsm', title: 'Films et séries : tous niveaux', description: 'Du thème culte à la musique oubliée : dix thèmes de films et de séries, du plus évident au plus pointu.', decade: 'all', genre: 'pop', poster: 'gold', icon: 'clapper', lang: 'en',
    playlists: ['musiques de films cultes', 'movie themes', '80s movie soundtracks'],
    // Écarts à la demande, titres déjà utilisés dans un autre test (règle du lot 3) : « Time » → « Cornfield Chase »
    // (Hans Zimmer), « Concerning Hobbits » → « Light of the Seven » (Game of Thrones), « Axel F » → « The Heat Is On »
    // (Le Flic de Beverly Hills), « Take My Breath Away » → « Danger Zone » (Top Gun), lui-même leurre de « Le grand
    // mélange » → « Never Ending Story » (L'Histoire sans fin).
    candidates: [[F, 'Hans Zimmer', 'Cornfield Chase'], [F, 'Ennio Morricone', 'The Good, The Bad And The Ugly'], [M, 'Ramin Djawadi', 'Light of the Seven'], [M, 'John Williams', 'Duel of the Fates'], [M, 'Danny Elfman', 'This is Halloween'], [D, 'Vangelis', 'Chariots of Fire'], [D, 'Glenn Frey', 'The Heat Is On'], [D, 'Limahl', 'Never Ending Story'], [I, 'Stan Bush', 'Dare'], [I, 'Jan Hammer', "Crockett's Theme"]],
    reserves: [],
    aliases: {
      'Cornfield Chase': { artist: ['Interstellar'], title: ['Interstellar'] }, 'The Good, The Bad And The Ugly': { artist: ['Le Bon, la Brute et le Truand'], title: ['Le Bon, la Brute et le Truand'] },
      'Light of the Seven': { artist: ['Game of Thrones'], title: ['Game of Thrones'] }, 'Duel of the Fates': { artist: ['Star Wars'], title: ['Star Wars'] },
      'This is Halloween': { artist: ["L'Étrange Noël de monsieur Jack"], title: ["L'Étrange Noël de monsieur Jack"] }, 'Chariots of Fire': { artist: ['Les Chariots de feu'], title: ['Les Chariots de feu'] },
      'The Heat Is On': { artist: ['Le Flic de Beverly Hills'] }, 'Never Ending Story': { artist: ["L'Histoire sans fin"], title: ["L'Histoire sans fin"] },
      Dare: { artist: ['Transformers', 'Transformers, le film'] }, "Crockett's Theme": { artist: ['Miami Vice', 'Deux flics à Miami'], title: ['Miami Vice'] },
    },
    decoyList: en([
      ['Alan Silvestri', 'The Avengers'], ['James Horner', 'For the Love of a Princess'], ['Clint Mansell', 'Lux Aeterna'], ['Joe Hisaishi', 'One Summer’s Day'],
      ['John Powell', 'Test Drive'], ['Michael Giacchino', 'Married Life'], ['Hildur Guðnadóttir', 'Bathroom Dance'], ['Ludwig Göransson', 'Can You Hear The Music'],
      ['Steve Jablonsky', 'Arrival to Earth'], ['Huey Lewis & The News', 'The Power of Love'], ['Bonnie Tyler', 'Holding Out for a Hero'],
      ['Survivor', 'Eye of the Tiger'], ['Tina Turner', "We Don't Need Another Hero (Thunderdome)"],
      ['Michael Sembello', 'Maniac'], ['Deniece Williams', "Let's Hear It for the Boy"], ['Peter Cetera', 'Glory of Love'], ['Starship', "Nothing's Gonna Stop Us Now"],
      ['John Parr', "St. Elmo's Fire (Man in Motion)"], ['Klaus Doldinger', 'Das Boot'], ['Giorgio Moroder', 'Chase'],
      ['Thomas Newman', 'Any Other Name'], ['Harold Faltermeyer', 'Top Gun Anthem'],
      ['Ennio Morricone', 'Chi Mai'], ['Danny Elfman', 'Batman Theme'], ['Alexandre Desplat', 'Lily’s Theme'], ['Howard Shore', 'The Breaking of the Fellowship'],
      ['Lisa Gerrard', 'Now We Are Free'], ['Justin Hurwitz', 'Mia & Sebastian’s Theme'], ['John Carpenter', 'Halloween Theme'], ['Mike Oldfield', 'Tubular Bells'],
      ['Henry Mancini', 'The Pink Panther Theme'], ['Ludovico Einaudi', 'Fly'], ['Kyle Dixon & Michael Stein', 'Stranger Things'], ['Irene Cara', 'Flashdance...What a Feeling'],
      ['Simple Minds', "Don't You (Forget About Me)"], ['Berlin', 'Take My Breath Away'], ['Enya', 'May It Be'],
    ]) },
  { ...LOT, ...mixed, ...THEMED, id: 'disney-mixte', prefix: 'dsm', title: 'Disney : tous niveaux', description: 'Du classique que tous les enfants chantent au titre que seuls les fans connaissent : dix chansons Disney, du plus évident au plus pointu.', decade: 'all', genre: 'pop', poster: 'blue', icon: 'star', lang: 'fr',
    playlists: ['disney chansons françaises', 'disney en français', 'chansons disney'],
    // Écarts à la demande : « L'histoire de la vie », « Dans un autre monde », « Comme un homme » et « Rien qu'un jour »
    // (Le Bossu de Notre-Dame), puis « Le monde qui est le mien » (Hercule) déjà utilisés dans un autre test (règle du
    // lot 3) ; « Not in Nottingham » absent en français chez Deezer, « Il vit en toi » (Le Roi Lion 2) introuvable. Remplacés par d'autres chansons des mêmes films ou de la même époque.
    candidates: [[F, 'Dimitri Rougeul', 'Je Voudrais Déjà être Roi'], [F, 'Maéva Méline', 'Je veux y croire'], [M, 'Anthony Kavanagh', 'Pour les hommes'], [M, 'Richard Darbois', 'Je suis ton meilleur ami'], [M, 'Jean Stout', 'Être un homme comme vous'], [D, 'Mimi Félixine', "Jamais Je N'avouerai"], [D, 'Marie Galey', 'Une belle fille à aimer'], [D, 'Bernard Alane', 'Les Cloches de Notre-Dame'], [I, 'Phil Collins', 'Jungle Jazz'], [I, 'MARCEL BOUNGOU', 'Á Upendi']],
    reserves: [],
    aliases: {
      'Je Voudrais Déjà être Roi': { artist: ['Le Roi Lion'] }, 'Je veux y croire': { artist: ['Raiponce'] }, 'Pour les hommes': { artist: ['Vaiana'] },
      'Je suis ton meilleur ami': { artist: ['Aladdin'] }, 'Être un homme comme vous': { artist: ['Le Livre de la jungle'] }, "Jamais Je N'avouerai": { artist: ['Hercule'] },
      'Une belle fille à aimer': { artist: ['Mulan'] }, 'Les Cloches de Notre-Dame': { artist: ['Le Bossu de Notre-Dame'] }, 'Jungle Jazz': { artist: ['Tarzan'] },
      'Á Upendi': { artist: ['Le Roi Lion 2', 'Le Roi Lion'] },
    },
    decoyList: fr([
      ['Emmylou Homs', "Point d'avenir sans nous"], ['Jean-Luc Guizonne', 'Notre terre'], ['Frédérique Tirmont', 'Toujours Dans Mon Coeur'], 
      ['Rachel Pignot', 'Un jour, mon prince viendra'], ['Assitan Dembele', 'Le Gospel Pur II'],
      ['Henri Salvador', 'Embrasse-la'], ['Debbie Davis', "L'histoire de la vie"], ['Michel Roux', 'Chem-chem Cheminée'],
      ['Bénédicte Lecroard', 'Je ne savais pas'], ['Maïdi Roth', "L'Amour Brille Sous Les Étoiles"], ['Coralie Thuilier', 'Je Voudrais un Bonhomme de Neige'], ['CharlElie Couture', 'Je Suis Ton Ami'],
      ['Camille', 'Le Festin'], ['Kelly Marot', 'Nous Sommes Un'], ['Claire Guyot', 'Partir là-bas'],
      ['Emmanuel Curtil', 'En Été'], ['Donald Reignoux', "J'ai perdu le nord"], ['Sophie Delmas', "N'écoute que moi"], ['Jean-Claude Donda', 'Heigh-Ho!'],
      ['Jean-Claude Corbel', 'Gaston'], ['Maurice Chevalier', 'Les Aristochats'], ['China Moses', 'Au Bout du Rêve'], ['Pierre Marret', 'La patrouille des éléphants'],
      ['Jean Piat', 'Soyez Prêtes'], ['Guillaume Beaujolais', "L'Amour Est un Cadeau"], ['Emmylou Homs', 'Le Renouveau'], ['Patrick Fiori', 'Comme un homme'],
      ['Francis Lalanne', "Rien qu'un Jour"], ['Charlotte Hervieux', 'Dans un autre monde'], ['Emmanuel Dahl', 'Le Monde Qui Est Le Mien'],
      ['Alan Menken', 'Le vaurien'], ['Cast of Frozen', 'Le Cœur de Glace'],
    ]) },
  { ...LOT, ...mixed, id: 'latino-reggaeton-mixte', prefix: 'lat', title: 'Latino et reggaeton : tous niveaux', description: 'Du tube à la pépite : dix morceaux, du plus évident au plus pointu.', decade: 'all', genre: 'pop', deezerGenre: /latin|reggaeton/i, poster: 'orange', icon: 'sun', lang: 'es',
    // Retouches du 2 novembre 2026 : hors thème (Marshmello) ; « Papi Chulo » d'un profil « Lorna » à 108 fans (single de
    // 2016, autre enregistrement) → single original de Lorna (profil à 10 246 fans). « Yo Voy A Legar » (faute du titre
    // Deezer) gardé : l'édition titrée « Yo Voy a Llegar » est 5e chez DJ Nelson (pas « Impossible ») ; « Yo Voy A
    // Llegar » accepté en réponse libre (titleAliases).
    replaceCorrect: [['Marshmello', 'El Merengue'], ['Lorna', 'Papi Chulo']],
    displayTitles: { 'Papi Chulo... (Te traigo el Mmmm)': 'Papi Chulo', 'Papi Chulo... Te Traigo El Mmmm (Radio Version)': 'Papi Chulo... Te Traigo El Mmmm' },
    excludedDecoys: [['Tito El Bambino', 'Siente El Boom'], ['Boy Wonder Cf', 'Siente El Boom'], ['Divan', 'Te Amo (Versos Gastados)']], // seulement explicite ; titre illisible
    playlists: ['reggaeton classics', 'latino hits', 'reggaeton old school', 'latin hits 2000s', 'salsa classics', 'tropical hits', 'bachata hits'],
    candidates: [[F, 'J Balvin', 'Mi Gente'], [F, 'Enrique Iglesias', 'Bailando (Spanish Version)'], [M, 'Maluma', 'Felices los 4'], [M, 'Don Omar', 'Dale Don Dale'], [M, 'Wisin & Yandel', 'Sexy Movimiento'], [D, 'Lorna', 'Papi Chulo... (Te traigo el Mmmm)'], [D, 'Gente De Zona', 'La Gozadera'], [D, 'Chino & Nacho', 'Andas En Mi Cabeza'], [I, 'Zion & Lennox', 'Yo Voy'], [I, 'Tito El Bambino', 'El Amor']],
    reserves: [[F, 'Luis Fonsi', 'Échame la Culpa'], [F, 'Shakira', 'Chantaje'], [F, 'KAROL G', 'Tusa'], [F, 'Nicky Jam', 'El Perdón'], [F, 'Becky G', 'Mayores'], [F, 'Rauw Alejandro', 'Todo de Ti'], [M, 'Daddy Yankee', 'Lo Que Pasó, Pasó'], [M, 'J Balvin', 'Ginza'], [D, 'Lorna', 'Papi Chulo... Te Traigo El Mmmm (Radio Version)'], [D, 'Juan Magan', 'Bailando por ahí'], [D, 'Elvis Crespo', 'Suavemente'], [D, 'Nicky Jam', 'Travesuras'], [I, 'Tito El Bambino', 'Siente El Boom']] },
  { ...LOT, ...mixed, id: 'reggae-ska-mixte', prefix: 'rgs', title: 'Reggae et ska : tous niveaux', description: 'Du tube à la pépite : dix morceaux, du plus évident au plus pointu.', decade: 'all', genre: 'pop', deezerGenre: /reggae|ska|dancehall/i, poster: 'green', icon: 'sun', lang: 'en',
    excludedDecoyArtists: ['Jack Johnson'], // version dub d'un titre pop
    playlists: ['reggae classics', 'ska classics', 'roots reggae', 'two tone ska'],
    candidates: [[F, 'Bob Marley & The Wailers', 'Three Little Birds'], [F, 'UB40', 'Red Red Wine'], [M, 'Jimmy Cliff', 'Many Rivers to Cross'], [M, 'Sean Paul', 'Like Glue'], [M, 'Toots & The Maytals', 'Pressure Drop'], [D, 'Inner Circle', 'Bad Boys'], [D, 'Desmond Dekker', 'Israelites'], [D, 'Musical Youth', 'Pass the Dutchie'], [I, 'Eddy Grant', 'Living on the Front Line'], [I, 'Bad Manners', 'Lip Up Fatty']],
    reserves: [[F, 'Bob Marley & The Wailers', 'Is This Love'], [F, 'UB40', "(I Can't Help) Falling in Love with You"], [M, 'Jimmy Cliff', 'The Harder They Come'], [M, 'Madness', 'Our House'], [D, 'Shaggy', 'Oh Carolina'], [D, 'The Specials', 'Ghost Town'], [D, 'Althea & Donna', 'Uptown Top Ranking'], [I, 'Bad Manners', 'Special Brew']] },
  { ...LOT, ...mixed, id: 'metal-hard-rock-mixte', prefix: 'mhr', title: 'Metal et hard rock : tous niveaux', description: 'Du tube à la pépite : dix morceaux, du plus évident au plus pointu.', decade: 'all', genre: 'rock', deezerGenre: /metal|hard|rock/i, poster: 'red', icon: 'guitar', lang: 'en',
    replaceCorrect: [['Poppy', 'End of You']],
    excludedDecoyArtists: ['Till Lindemann', 'Slipknot'], // reprise en espagnol ; titres refusés par npm run music:decoys
    playlists: ['metal classics', 'hard rock classics', '80s hair metal', 'heavy metal hits'],
    candidates: [[F, 'Metallica', 'Enter Sandman'], [F, 'Iron Maiden', 'The Trooper'], [M, 'Rammstein', 'Mein Herz brennt', 'de'], [M, 'Black Sabbath', 'Children of the Grave'], [M, 'Judas Priest', 'Living After Midnight'], [D, 'Twisted Sister', "We're Not Gonna Take It"], [D, 'Dio', 'Holy Diver'], [D, 'Ratt', 'Round and Round'], [I, 'Quiet Riot', 'Metal Health (Bang Your Head)'], [I, 'Skid Row', 'Monkey Business']],
    reserves: [[F, 'Metallica', 'Master of Puppets'], [F, 'System Of A Down', 'Toxicity'], [M, 'Iron Maiden', 'Aces High'], [M, 'Motörhead', 'Ace of Spades'], [D, 'Europe', 'Rock the Night'], [D, 'W.A.S.P.', 'I Wanna Be Somebody'], [D, 'Mötley Crüe', 'Kickstart My Heart'], [D, 'Accept', 'Balls to the Wall'], [D, 'Saxon', 'Princess of the Night'], [D, 'Dokken', 'In My Dreams'], [D, 'Warrant', 'Cherry Pie'], [D, 'Manowar', 'Warriors of the World United'], [D, 'Steelheart', "She's Gone"], [D, 'Drowning Pool', 'Bodies'], [I, 'Quiet Riot', 'Mama Weer All Crazee Now']] },
  { ...LOT, ...mixed, id: 'jazz-swing-mixte', prefix: 'jzz', title: 'Jazz et swing : tous niveaux', description: 'Du standard que tout le monde connaît à la pièce de connaisseurs : dix morceaux de jazz, du plus évident au plus pointu.', decade: 'all', genre: 'pop', deezerGenre: /jazz|swing|blues/i, poster: 'blue', icon: 'note', lang: 'en',
    // Dates Deezer des rééditions de jazz peu fiables : écart d'époque toléré entre bonne réponse et leurres élargi.
    eraGap: 30,
    excludedCorrect: [['Robert Glasper', 'Maiden Voyage / Everything In Its Right Place']], // médley
    playlists: ['jazz classics', 'jazz standards', 'swing classics', 'essential jazz', 'bebop', 'cool jazz', 'hard bop', 'vocal jazz', 'blue note classics'],
    seeds: ['John Coltrane', 'Thelonious Monk', 'Charles Mingus', 'Count Basie', 'Billie Holiday', 'Sarah Vaughan', 'Oscar Peterson', 'Art Blakey', 'Cannonball Adderley', 'Sonny Rollins', 'Dizzy Gillespie', 'Charlie Parker', 'Benny Goodman', 'Nat King Cole', 'Dinah Washington', 'Herbie Hancock', 'Stan Getz', 'Ahmad Jamal', 'Horace Silver', 'Lee Morgan', 'Quincy Jones', 'Ray Charles'],
    candidates: [[F, 'Louis Armstrong', 'What A Wonderful World'], [F, 'Frank Sinatra', 'Fly Me To The Moon'], [M, 'Ella Fitzgerald', 'Cheek To Cheek'], [M, 'Miles Davis', 'Freddie Freeloader'], [M, 'Nina Simone', 'Sinnerman'], [D, 'The Dave Brubeck Quartet', 'Take Five'], [D, 'Chet Baker', 'My Funny Valentine'], [D, 'Vince Guaraldi Trio', 'Linus and Lucy'], [I, 'Bill Evans', 'Peace Piece'], [I, 'Wes Montgomery', 'Four On Six']],
    reserves: [[F, 'Louis Armstrong', 'La vie en rose'], [F, 'Frank Sinatra', 'My Way'], [M, 'Miles Davis', 'So What'], [M, 'Duke Ellington', 'Take the "A" Train'], [D, 'Glenn Miller', 'In the Mood'], [D, 'Stan Getz', 'The Girl from Ipanema'], [D, 'Herbie Hancock', 'Cantaloupe Island'], [I, 'Wes Montgomery', 'Bumpin’ on Sunset']] },
  // Test 35 bis (demande du 2 novembre 2026), à la place de « Classique et opéra » : artistes de départ seulement, titre
  // choisi chez l'artiste dans la zone du niveau (pickFromArtist) ; réserves dans l'ordre de la demande.
  { ...LOT, ...mixed, id: 'rock-francais-mixte', prefix: 'rkf', title: 'Rock français : tous niveaux', description: 'Du tube à la pépite : dix morceaux de rock français, du plus évident au plus pointu.', decade: 'all', genre: 'rock', deezerGenre: /rock|alternative|punk|metal|chanson/i, poster: 'red', icon: 'guitar', lang: 'fr',
    // Genres Deezer peu fiables pour le rock français (Matmatah et Kyo en « Chanson française », Trust en « Pop »).
    eraGap: 25, // rock français de 1978 à 2010 : écart d'époque toléré entre bonne réponse et leurres
    seedTracks: true, // titres des artistes de départ eux-mêmes dans le réservoir (leurres « Moyen »)
    decoyLevels: { M: ['F', 'D'] }, // titres « Moyen » de rock français : ceux des groupes déjà bonnes réponses
    // Variété et chanson passées par le genre « Chanson française » : hors genre face à des bonnes réponses rock.
    excludedDecoyArtists: ['Francis Cabrel', 'Julien Doré', 'Tryo', 'Laurent Voulzy', 'Boulevard des airs', 'Jean-Jacques Goldman', 'Christophe Willem', 'Olivia Ruiz', 'Gaëtan Roussel', 'Bénabar', 'Calogero', 'Pascal Obispo', 'Vianney', 'Renaud', 'Zazie', 'Cali', 'Raphael', 'Bénabar', 'Grand Corps Malade', 'Zebda'],
    playlists: ['rock français', 'rock français années 80', 'rock alternatif français', 'punk français', 'rock français années 90', 'rock français années 2000', 'rock français classiques'],
    seeds: ['Trust', 'Les Rita Mitsouko', 'Kyo', 'Saez', 'Shaka Ponk', 'Matmatah', 'Mickey 3D', 'Eiffel', 'Superbus', 'Dolly', 'Hubert-Félix Thiéfaine', 'Jacques Higelin', 'Taxi Girl', 'Les Innocents', 'Marquis de Sade', 'BB Brunes', 'Skip the Use', 'No One Is Innocent', 'Lofofora', 'Les Négresses Vertes', 'Luke', 'Aston Villa'],
    candidates: [[F, 'Téléphone', null], [F, 'Noir Désir', null], [M, 'Alain Bashung', null], [M, 'Louise Attaque', null], [M, 'Mano Negra', null], [D, 'Les Wampas', null], [D, 'Dionysos', null], [D, 'Mass Hysteria', null], [I, 'Ludwig Von 88', null], [I, 'Les Garçons Bouchers', null]],
    reserves: [[F, 'Indochine', null], [M, 'Noir Désir', null], [M, 'Indochine', null], [I, 'Les Thugs', null], [I, 'Sheriff', null], [I, 'Pigalle', null]] },
]
