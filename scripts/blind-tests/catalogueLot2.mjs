// Lot 2 de la refonte (demande du 2 novembre 2026, tests 16 à 27, tout « Facile ») : candidats de la demande,
// interprètes trouvés chez Deezer pour Disney et les génériques (la demande donnait le film ou la série).
// Champs propres au lot : lot, addedAt ; era : années acceptées quand la décennie du contenu ne suffit pas (le champ
// decade du contenu n'accepte que 1960 à 2020 ou « all ») ; themed : remplaçants et leurres pris seulement dans les
// playlists du thème (pas d'artistes liés : un film Disney appelle des chansons Disney, pas de la variété) ;
// aliases : réponses acceptées en plus, par titre du catalogue ({ artist, title }) ; playlists : réservoir.
import { TESTS_LOT2_THEMES } from './catalogueLot2Themes.mjs'

const F = 'F'
export const LOT = { lot: 'BT-9', addedAt: '2026-11-02' }

export const TESTS_LOT2 = [
  { ...LOT, id: 'rock-hymnes-facile', prefix: 'rkh', title: 'Rock : les hymnes', description: 'Dix hymnes du rock que tout le monde a déjà entendus, des riffs aux refrains.', level: 'easy', decade: 'all', genre: 'rock', poster: 'red', icon: 'guitar', lang: 'en',
    playlists: ['rock classics', 'hymnes rock', 'classic rock hits', 'rock français'],
    candidates: [[F, 'Queen', 'Bohemian Rhapsody'], [F, 'AC/DC', 'Highway to Hell'], [F, 'Led Zeppelin', 'Whole Lotta Love'], [F, "Guns N' Roses", "Sweet Child O' Mine"], [F, 'The Rolling Stones', "(I Can't Get No) Satisfaction"], [F, 'Deep Purple', 'Smoke on the Water'], [F, 'Red Hot Chili Peppers', 'Californication'], [F, 'Pink Floyd', 'Another Brick in the Wall, Pt. 2'], [F, 'Scorpions', 'Wind of Change'], [F, 'Noir Désir', 'Le vent nous portera', 'fr']],
    reserves: [[F, 'Nirvana', 'Come As You Are'], [F, 'The Police', 'Every Breath You Take'], [F, 'Bon Jovi', "It's My Life"], [F, 'Téléphone', 'Un autre monde', 'fr']] },
  { ...LOT, id: 'tubes-d-ete-facile', prefix: 'ete', title: "Tubes d'été", description: "Dix tubes de l'été, toutes époques et tous styles : la bande-son des vacances.", level: 'easy', decade: 'all', genre: 'pop', poster: 'orange', icon: 'sun', lang: 'en',
    excludedDecoys: [['Tito El Bambino', 'Siente El Boom']], // introuvable par npm run music:decoys
    playlists: ["tubes de l'été", 'summer hits', 'tubes été années 2000', 'hits de l été', 'reggaeton classics', 'latino hits'],
    candidates: [[F, 'Los Del Rio', 'Macarena', 'es'], [F, 'Magic System', 'Premier Gaou', 'fr'], [F, 'Mika', 'Relax, Take It Easy'], [F, 'Bob Sinclar', 'Love Generation'], [F, 'Daddy Yankee', 'Gasolina', 'es'], [F, 'Shaggy', 'Boombastic'], [F, 'Kungs', 'This Girl'], [F, 'DJ Snake', 'Taki Taki', 'es'], [F, 'Wejdene', 'Anissa', 'fr'], [F, 'Ottawan', 'D.I.S.C.O.']],
    reserves: [[F, 'Enrique Iglesias', 'Bailando (Spanish Version)', 'es'], [F, 'Kungs', "This Girl (Kungs Vs. Cookin' On 3 Burners)"], [F, 'Kaoma', 'Lambada', 'es'], [F, 'Don Omar', 'Danza Kuduro', 'es'], [F, 'Shakira', 'Waka Waka (This Time for Africa)'], [F, 'Lou Bega', 'Mambo No. 5'], [F, 'Sean Paul', 'Temperature'], [F, 'OMI', 'Cheerleader'], [F, 'Major Lazer', 'Lean On'], [F, 'Collectif Métissé', 'Laisse tomber tes problèmes', 'fr'], [F, 'Tal', 'Le sens de la vie', 'fr'], [F, 'Willy William', 'Ego', 'fr'], [F, 'Zebda', 'Tomber la chemise', 'fr']] },
  { ...LOT, id: 'variete-francaise-80-90-facile', prefix: 'vf89', title: 'Variété française des années 80-90', description: "Dix tubes de la variété française des années 80 et 90, ceux qu'on chante en famille.", level: 'easy', decade: 1980, era: [1980, 1999], genre: 'chanson', poster: 'violet', icon: 'accordion', lang: 'fr',
    playlists: ['variété française années 80', 'variété française années 90', 'tubes français 80 90'],
    candidates: [[F, 'Jean-Jacques Goldman', 'Je te donne'], [F, 'Mylène Farmer', 'Désenchantée'], [F, 'Francis Cabrel', 'Encore et encore'], [F, 'Daniel Balavoine', "SOS d'un terrien en détresse"], [F, 'Patricia Kaas', 'Mon mec à moi'], [F, 'Céline Dion', "Pour que tu m'aimes encore"], [F, 'Alain Souchon', 'Foule sentimentale'], [F, 'France Gall', 'Ella, elle l’a'], [F, 'Laurent Voulzy', 'Belle-Île-en-Mer Marie-Galante'], [F, 'Alain Bashung', 'Osez Joséphine']],
    reserves: [[F, 'Jean-Jacques Goldman', 'Encore un matin'], [F, 'Étienne Daho', 'Week-end à Rome'], [F, 'Indochine', "J'ai demandé à la lune"], [F, 'Florent Pagny', 'Savoir aimer'], [F, 'Michel Berger', 'Quelques mots d’amour']] },
  { ...LOT, id: 'rap-us-classiques-facile', prefix: 'rus', title: 'Rap US : les classiques', description: 'Dix classiques du rap américain, de 2Pac à Kendrick Lamar.', level: 'easy', decade: 'all', era: [1988, 2018], genre: 'rap', poster: 'blue', icon: 'microphone', lang: 'en',
    // Rap français des playlists « hip hop classics » (titres sans langue visible : « En feu », « Samuraï ») et titres mal formés.
    excludedDecoyArtists: ["Diam's", 'Soprano', "Shurik'N", 'IAM', 'MC Solaar', 'Booba', 'Suprême NTM', 'NTM', 'Oxmo Puccino', 'Rohff', 'Sinik', 'Kery James', "Sexion d'Assaut", 'Akhenaton', 'Lunatic', "Mafia K'1 Fry", 'Psy 4 de la Rime', 'Fonky Family', 'Disiz', 'Nekfeu', 'Orelsan', 'PNL', 'Ninho', 'Jul', 'SCH', 'Niska', 'Damso', 'Lacrim', 'Kaaris', 'Saïan Supa Crew', 'Sniper', 'Tunisiano', 'Assassin', 'Ärsenik', 'Busta Flex', 'Doc Gynéco', 'Passi', 'Stomy Bugsy'],
    excludedDecoys: [['Eazy-E', "No More ?'s"]],
    playlists: ['hip hop classics', 'rap us classiques', '90s hip hop', '2000s hip hop'],
    candidates: [[F, 'Eminem', 'Lose Yourself'], [F, '2Pac', 'California Love'], [F, 'The Notorious B.I.G.', 'Juicy'], [F, 'Dr. Dre', 'Still D.R.E.'], [F, 'Snoop Dogg', "Drop It Like It's Hot"], [F, 'Kanye West', 'Stronger'], [F, 'JAY-Z', 'Empire State Of Mind'], [F, '50 Cent', 'In Da Club'], [F, 'Coolio', "Gangsta's Paradise"], [F, 'Kendrick Lamar', 'HUMBLE.']],
    reserves: [[F, 'OutKast', 'Ms. Jackson'], [F, 'Nelly', 'Hot In Herre'], [F, 'Missy Elliott', 'Get Ur Freak On'], [F, 'Wu-Tang Clan', 'C.R.E.A.M.']] },
  { ...LOT, id: 'annees-70-facile', prefix: 'a70f', title: 'Années 70 : les tubes', description: 'Disco, rock et pop : dix tubes des années 70 que tout le monde connaît.', level: 'easy', decade: 1970, genre: 'pop', poster: 'gold', icon: 'discoBall', lang: 'en',
    excludedDecoyArtists: ['Laurent Voulzy', 'Michel Sardou', 'Claude François', 'Joe Dassin', 'Michel Polnareff', 'Alain Souchon', 'Véronique Sanson', 'Michel Berger', 'France Gall', 'Patrick Hernandez', 'Ottawan', 'Sheila', 'Umberto Tozzi', 'Gérard Lenorman', 'Mike Brant', 'Dalida'],
    playlists: ['tubes années 70', '70s hits', 'disco 70s'],
    candidates: [[F, 'ABBA', 'Dancing Queen'], [F, 'Bee Gees', "Stayin' Alive"], [F, 'Eagles', 'Hotel California'], [F, 'Village People', 'Y.M.C.A.'], [F, 'Earth, Wind & Fire', 'September'], [F, 'Boney M.', 'Daddy Cool'], [F, 'Donna Summer', 'Hot Stuff'], [F, 'Chic', 'Le Freak'], [F, 'Fleetwood Mac', 'Dreams'], [F, 'Elton John', 'Your Song']],
    reserves: [[F, 'Queen', "Don't Stop Me Now"], [F, 'Gloria Gaynor', 'Never Can Say Goodbye'], [F, 'Supertramp', 'The Logical Song'], [F, 'David Bowie', 'Heroes'], [F, 'Kool & The Gang', 'Celebration'], [F, 'The Jackson 5', 'ABC']] },
  { ...LOT, id: 'annees-60-facile', prefix: 'a60f', title: 'Années 60 : les tubes', description: 'Beatles, Stones, soul et folk : dix tubes des années 60.', level: 'easy', decade: 1960, genre: 'pop', poster: 'pink', icon: 'note', lang: 'en',
    // Artistes français des playlists « années 60 » : leurs titres sans langue visible (« Aline », « Amsterdam »,
    // « Vesoul ») passaient pour de l'anglais.
    excludedDecoyArtists: ['Jacques Brel', 'Christophe', 'Charles Aznavour', 'Jean Ferrat', 'Joe Dassin', 'Serge Gainsbourg', 'Hugues Aufray', 'Georges Brassens', 'Barbara', 'Françoise Hardy', 'Johnny Hallyday', 'Sylvie Vartan', 'France Gall', 'Jacques Dutronc', 'Claude François', 'Michel Polnareff', 'Dalida', 'Nino Ferrer', 'Salvatore Adamo', 'Sheila'],
    playlists: ['tubes années 60', '60s hits', 'sixties classics', 'motown classics', '60s soul', 'british invasion', '60s rock', 'oldies 60s', 'summer of love', 'sixties pop', 'woodstock', '60s girl groups', 'rock n roll 60s'],
    candidates: [[F, 'The Beatles', 'Hey Jude'], [F, 'The Rolling Stones', 'Paint It, Black'], [F, 'The Beach Boys', 'Good Vibrations'], [F, 'Elvis Presley', 'Suspicious Minds'], [F, 'Simon & Garfunkel', 'The Sound of Silence'], [F, 'Aretha Franklin', 'Respect'], [F, 'Nancy Sinatra', "These Boots Are Made for Walkin'"], [F, 'The Doors', 'Light My Fire'], [F, 'Ben E. King', 'Stand By Me'], [F, 'Otis Redding', "(Sittin' On) The Dock of the Bay"]],
    reserves: [[F, 'The Animals', 'The House of the Rising Sun'], [F, 'The Kinks', 'You Really Got Me'], [F, 'Louis Armstrong', 'What a Wonderful World'], [F, 'The Mamas & The Papas', "California Dreamin'"]] },
  { ...LOT, id: 'annees-2020-facile', prefix: 'a20f', title: 'Années 2020 : les tubes', description: 'Dix tubes des années 2020 que tout le monde a entendus sur les réseaux et à la radio.', level: 'easy', decade: 2020, genre: 'pop', poster: 'cyan', icon: 'smartphone', lang: 'en',
    excludedDecoys: [['PinkPantheress', 'Stateside + Zara Larsson']],
    playlists: ['tubes 2020', 'hits 2021', 'hits 2022', 'hits 2023'],
    candidates: [[F, 'The Weeknd', 'Blinding Lights'], [F, 'Dua Lipa', 'Levitating'], [F, 'Harry Styles', 'As It Was'], [F, 'Miley Cyrus', 'Flowers'], [F, 'Tones And I', 'Dance Monkey'], [F, 'Glass Animals', 'Heat Waves'], [F, 'Måneskin', 'Beggin'], [F, 'Stromae', "L'enfer", 'fr'], [F, 'Soolking', 'Suavemente', 'fr'], [F, 'Taylor Swift', 'Anti-Hero']],
    reserves: [[F, 'Olivia Rodrigo', 'drivers license'], [F, 'Ed Sheeran', 'Bad Habits'], [F, 'Angèle', 'Bruxelles je t’aime', 'fr'], [F, 'Aya Nakamura', 'Djadja', 'fr']] },
  { ...LOT, id: 'electro-dance-hymnes-facile', prefix: 'edh', title: 'Électro et dance : les hymnes', description: 'Dix hymnes électro et dance qui font lever les mains en soirée.', level: 'easy', decade: 'all', genre: 'electro', poster: 'green', icon: 'headphones', lang: 'en',
    playlists: ['electro hits', 'dance anthems', 'edm classics'],
    candidates: [[F, 'Daft Punk', 'Around the World'], [F, 'David Guetta', 'Titanium'], [F, 'Calvin Harris', 'Summer'], [F, 'Swedish House Mafia', "Don't You Worry Child"], [F, 'Martin Garrix', 'Animals'], [F, 'Darude', 'Sandstorm'], [F, 'Alan Walker', 'Faded'], [F, 'Mr. Oizo', 'Flat Beat'], [F, 'Benny Benassi', 'Satisfaction'], [F, 'Eric Prydz', 'Call on Me']],
    reserves: [[F, 'Avicii', 'Levels'], [F, 'The Prodigy', 'Firestarter'], [F, 'Modjo', 'Lady (Hear Me Tonight)'], [F, 'Stardust', 'Music Sounds Better with You']] },
  ...TESTS_LOT2_THEMES,
]
