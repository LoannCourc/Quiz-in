// Catalogue des 15 blind tests de la refonte (annexe de la demande du 1er novembre 2026) : candidats et réserves.
// Niveaux : F facile (1), M moyen (2), D difficile (3), I impossible (4). Langue chantée (fr, en, es…) : celle du
// test, sauf précision en 4e colonne ; les leurres sont pris dans la même langue.
import { TESTS_LOT2 } from './catalogueLot2.mjs'
import { TESTS_LOT3 } from './catalogueLot3.mjs'
import { TESTS_LOT4 } from './catalogueLot4.mjs'

const F = 'F', M = 'M', D = 'D', I = 'I'

export const TESTS = [
  { id: 'annees-80-facile', prefix: 'a80f', title: 'Années 80 : les tubes', description: 'Synthés, brushings et refrains cultes : dix tubes des années 80 que tout le monde reconnaît dès les premières notes.', level: 'easy', decade: 1980, genre: 'pop', poster: 'pink', icon: 'cassette', featuredRank: 2, lang: 'en',
    candidates: [[F, 'Michael Jackson', 'Billie Jean'], [F, 'a-ha', 'Take On Me'], [F, 'Cyndi Lauper', 'Girls Just Want to Have Fun'], [F, 'Europe', 'The Final Countdown'], [F, 'Toto', 'Africa'], [F, 'Survivor', 'Eye of the Tiger'], [F, 'Desireless', 'Voyage, voyage', 'fr'], [F, 'Wham!', 'Wake Me Up Before You Go-Go'], [F, 'Indochine', "L'Aventurier", 'fr'], [F, 'Bon Jovi', "Livin' on a Prayer"]],
    reserves: [[F, 'Queen', 'I Want to Break Free'], [F, 'Prince', 'Kiss'], [F, 'Duran Duran', 'Hungry Like the Wolf'], [F, 'Dire Straits', 'Money for Nothing']] },
  { id: 'annees-90-facile', prefix: 'a90f', title: 'Années 90 : les tubes', description: 'Dance, boys bands et grandes ballades : dix tubes des années 90 que tout le monde a chantés.', level: 'easy', decade: 1990, genre: 'pop', poster: 'cyan', icon: 'cd', featuredRank: 6, lang: 'en',
    candidates: [[F, 'Spice Girls', 'Wannabe'], [F, 'Backstreet Boys', 'I Want It That Way'], [F, 'Oasis', 'Wonderwall'], [F, 'Nirvana', 'Smells Like Teen Spirit'], [F, 'Céline Dion', 'My Heart Will Go On'], [F, 'Whitney Houston', 'I Will Always Love You'], [F, 'Britney Spears', '...Baby One More Time'], [F, 'Aqua', 'Barbie Girl'], [F, 'Ricky Martin', "Livin' la Vida Loca"], [F, 'Haddaway', 'What Is Love']],
    reserves: [[F, 'Cher', 'Believe'], [F, 'Ace of Base', 'The Sign'], [F, 'Lou Bega', 'Mambo No. 5'], [F, 'Alanis Morissette', 'Ironic']] },
  { id: 'annees-2000-facile', prefix: 'a00f', title: 'Années 2000 : les tubes', description: 'Pop, électro et refrains de soirée : dix succès des années 2000 que tout le monde connaît.', level: 'easy', decade: 2000, genre: 'pop', poster: 'green', icon: 'headphones', featuredRank: 4, lang: 'en',
    candidates: [[F, 'Shakira', "Hips Don't Lie"], [F, 'Britney Spears', 'Toxic'], [F, 'The Black Eyed Peas', 'I Gotta Feeling'], [F, 'Coldplay', 'Viva la Vida'], [F, 'Daft Punk', 'One More Time'], [F, 'Rihanna', 'Umbrella'], [F, 'Linkin Park', 'In the End'], [F, 'Christophe Maé', "On s'attache", 'fr'], [F, 'OutKast', 'Hey Ya!'], [F, 'Las Ketchup', 'Aserejé', 'es']],
    reserves: [[F, 'Kylie Minogue', "Can't Get You Out of My Head"], [F, 'Beyoncé', 'Crazy in Love'], [F, 'Christina Aguilera', 'Beautiful'], [F, 'Alizée', 'Moi... Lolita', 'fr']] },
  { id: 'annees-2010-facile', prefix: 'a10f', title: 'Années 2010 : les tubes', description: 'Dix tubes des années 2010, des stades aux réseaux sociaux : le titre ou l’artiste, à vous de jouer.', level: 'easy', decade: 2010, genre: 'pop', poster: 'violet', icon: 'smartphone', featuredRank: 5, lang: 'en',
    candidates: [[F, 'Pharrell Williams', 'Happy'], [F, 'Adele', 'Rolling in the Deep'], [F, 'Ed Sheeran', 'Shape of You'], [F, 'Avicii', 'Wake Me Up'], [F, 'Luis Fonsi', 'Despacito', 'es'], [F, 'Imagine Dragons', 'Believer'], [F, 'GIMS', "Est-ce que tu m'aimes ? (Pilule bleue)", 'fr'], [F, 'Daft Punk', 'Get Lucky'], [F, 'PSY', 'Gangnam Style', 'ko'], [F, 'Stromae', 'Papaoutai', 'fr']],
    reserves: [[F, 'Katy Perry', 'Roar'], [F, 'Mark Ronson', 'Uptown Funk'], [F, 'Maroon 5', 'Sugar'], [F, 'Louane', 'Jour 1', 'fr']] },
  { id: 'chanson-francaise-classiques', prefix: 'cfc', title: 'Chanson française : les classiques', description: 'Piaf, Brel, Brassens et les autres : dix classiques que tous les Français connaissent.', level: 'easy', decade: 'all', genre: 'chanson', poster: 'violet', icon: 'accordion', featuredRank: 10, lang: 'fr',
    candidates: [[F, 'Édith Piaf', 'La Vie en rose'], [F, 'Jacques Brel', 'Ne me quitte pas'], [F, 'Charles Aznavour', 'La Bohème'], [F, 'Joe Dassin', 'Les Champs-Élysées'], [F, 'Claude François', "Comme d'habitude"], [F, 'Michel Sardou', 'Les Lacs du Connemara'], [F, 'Renaud', 'Mistral gagnant'], [F, 'Dalida', 'Paroles, paroles'], [F, 'Jacques Dutronc', "Il est cinq heures, Paris s'éveille"], [F, 'Georges Brassens', "Les Copains d'abord"]],
    reserves: [[F, 'Édith Piaf', 'Non, je ne regrette rien'], [F, 'Francis Cabrel', "Je l'aime à mourir"], [F, 'Joe Dassin', "L'Été indien"]] },
  { id: 'rap-francais-facile', prefix: 'rff', title: 'Rap français : les tubes', description: 'Dix tubes du rap français, de MC Solaar à PNL : les sons que tout le monde a entendus.', level: 'easy', decade: 'all', genre: 'rap', poster: 'red', icon: 'microphone', lang: 'fr',
    candidates: [[F, 'MC Solaar', 'Bouge de là'], [F, 'Booba', 'DKR'], [F, 'Nekfeu', 'On verra'], [F, 'PNL', 'Le monde ou rien'], [F, 'Soprano', 'Mon Everest'], [F, 'Niska', 'Réseaux'], [F, 'Orelsan', 'Basique'], [F, 'Lomepal', 'Trop beau'], [F, 'Naps', 'La kiffance'], [F, '13 Organisé', 'Bande organisée']],
    reserves: [[F, "Sexion d'Assaut", 'Wati by Night'], [F, 'Kaaris', 'Zoo'], [F, 'Black M', 'Sur ma route'], [F, 'Maes', 'Madrina']] },
  { id: 'chansons-de-fete-facile', prefix: 'fete', title: 'Chansons de fête', description: 'Bandas, bals et refrains de fin de banquet : dix chansons à reprendre en chœur, toutes époques.', level: 'easy', decade: 'all', genre: 'chanson', poster: 'orange', icon: 'accordion', lang: 'fr',
    candidates: [[F, 'Les Quatre Barbus', 'Chevaliers de la table ronde'], [F, 'Georges Brassens', 'Le gorille'], [F, 'Pierre Perret', 'Les jolies colonies de vacances'], [F, 'Patrick Sébastien', 'Les sardines'], [F, 'Annie Cordy', 'Tata Yoyo'], [F, 'Claude François', 'Alexandrie Alexandra'], [F, 'Plastic Bertrand', 'Ça plane pour moi'], [F, 'La Compagnie Créole', 'Ça fait rire les oiseaux'], [F, 'Gipsy Kings', 'Bamboléo', 'es'], [F, 'Gloria Gaynor', 'I Will Survive', 'en']],
    reserves: [[F, 'Sacha Distel', 'Scoubidou'], [F, 'Bourvil', 'La Tactique du gendarme'], [F, 'Les Charlots', 'Merci patron'], [F, 'Vengaboys', 'We Like to Party', 'en']],
    // Leurres de ce test, choisis à la main parmi les tubes de bal et de fête (les playlists « fête » donnaient des
    // titres récents hors sujet), puis mesurés chez Deezer : seuls ceux « Facile », ou 1er ou 2e titre de leur
    // artiste, sont gardés. Seule source de leurres pour ce test. [artiste, titre, langue]
    decoyList: [
      ['Patrick Sébastien', 'Tourner les serviettes', 'fr'], ['Gilbert Montagné', "On va s'aimer", 'fr'], ['Images', 'Les démons de minuit', 'fr'],
      ['Peter & Sloane', 'Besoin de rien, envie de toi', 'fr'], ['Gold', 'Capitaine abandonné', 'fr'], ['Magic System', 'Premier Gaou', 'fr'],
      ['Zebda', 'Tomber la chemise', 'fr'], ['Michel Sardou', 'En chantant', 'fr'], ['Jean-Pierre Mader', 'Macumba', 'fr'],
      ['Lio', 'Le banana split', 'fr'], ['Claude François', 'Cette année-là', 'fr'], ['Joe Dassin', 'Siffler sur la colline', 'fr'],
      ['Hugues Aufray', 'Santiano', 'fr'], ['Annie Cordy', 'La Bonne Du Curé', 'fr'], ['Licence IV', "Viens boire un p'tit coup à la maison", 'fr'],
      ['Les Forbans', 'Chante', 'fr'], ['Gilles Dreu', 'Alouette', 'fr'], ['Les Charlots', 'Merci Patron', 'fr'], ['Les Musclés', 'La fête au village', 'fr'],
      ['Michel Fugain', "Fais comme l'oiseau", 'fr'], ['Il Etait Une Fois', "J'ai encore rêvé d'elle", 'fr'], ['Les Négresses Vertes', "Voilà l'été", 'fr'],
      ['Tri Yann', 'La Jument De Michao', 'fr'], ['Manau', 'La tribu de Dana', 'fr'], ['Matmatah', 'Lambé An Dro', 'fr'],
      ['Jean-Jacques Goldman', 'Quand la musique est bonne', 'fr'], ['Cookie Dingler', 'Femme libérée', 'fr'], ['Jean-Luc Lahaye', "Femme que j'aime", 'fr'],
      ['François Feldman', 'Les valses de Vienne', 'fr'], ['Partenaire Particulier', 'Partenaire Particulier', 'fr'], ['Les Rita Mitsouko', 'Marcia Baïla', 'fr'],
      ['Corynne Charby', 'Boule de flipper', 'fr'], ['Philippe Lavil', 'Il tape sur des bambous', 'fr'],
      ['Village People', 'YMCA', 'en'], ['Boney M.', 'Rasputin', 'en'], ['Kool & The Gang', 'Celebration', 'en'], ['ABBA', 'Dancing Queen', 'en'],
      ['Bee Gees', "Stayin' Alive", 'en'], ['Sister Sledge', 'We Are Family', 'en'], ['Earth, Wind & Fire', 'September', 'en'],
      ['Los Del Rio', 'Macarena', 'es'], ['Los Lobos', 'La Bamba', 'es'], ['Manu Chao', 'Me Gustas Tu', 'es'], ['Ricky Martin', 'María', 'es'], ['Chayanne', 'Torero', 'es'],
    ] },
  { id: 'annees-80-mixte', prefix: 'a80m', title: 'Années 80 : tous niveaux', description: 'Du tube à la pépite : dix morceaux des années 80, du plus évident au plus pointu.', level: 'mixed', decade: 1980, genre: 'pop', poster: 'pink', icon: 'cassette', lang: 'en',
    candidates: [[F, 'Queen', 'Another One Bites the Dust'], [F, 'Bonnie Tyler', 'Total Eclipse of the Heart'], [M, 'Michael Jackson', 'The Way You Make Me Feel'], [M, 'Madonna', "Papa Don't Preach"], [M, 'Depeche Mode', 'Everything Counts'], [D, 'Opus', 'Live Is Life'], [D, 'Men Without Hats', 'The Safety Dance'], [D, 'Falco', 'Rock Me Amadeus', 'de'], [I, 'Real Life', "Catch Me I'm Falling"], [I, 'Gazebo', 'Masterpiece']],
    reserves: [[M, 'Eurythmics', 'There Must Be an Angel'], [M, 'U2', 'Pride (In the Name of Love)'], [M, 'Phil Collins', 'Sussudio'], [D, 'Nena', '99 Luftballons', 'de'], [D, 'Kajagoogoo', 'Too Shy'], [I, 'Kajagoogoo', 'Hang On Now'], [I, 'Men Without Hats', 'Pop Goes the World']] },
  { id: 'annees-90-mixte', prefix: 'a90m', title: 'Années 90 : tous niveaux', description: 'Du tube à la pépite : dix morceaux des années 90, du plus évident au plus pointu.', level: 'mixed', decade: 1990, genre: 'pop', poster: 'cyan', icon: 'cd', lang: 'en',
    candidates: [[F, 'Eiffel 65', 'Blue (Da Ba Dee)'], [F, 'Chumbawamba', 'Tubthumping'], [M, 'Spice Girls', 'Mama'], [M, 'Britney Spears', 'Sometimes'], [M, 'Red Hot Chili Peppers', 'Give It Away'], [D, 'Whigfield', 'Saturday Night'], [D, 'Scatman John', 'Scatman (Ski-Ba-Bop-Ba-Dop-Bop)'], [D, 'Dr. Alban', "It's My Life"], [I, 'Corona', 'Baby Baby'], [I, 'Culture Beat', 'Crying in the Rain']],
    reserves: [[M, 'Oasis', 'Live Forever'], [M, 'Backstreet Boys', 'As Long as You Love Me'], [M, 'Whitney Houston', "I'm Every Woman"], [D, 'Culture Beat', 'Mr. Vain'], [D, 'La Bouche', 'Be My Lover'], [I, 'Dr. Alban', 'Sing Hallelujah'], [I, 'La Bouche', 'Sweet Dreams']] },
  { id: 'annees-2000-mixte', prefix: 'a00m', title: 'Années 2000 : tous niveaux', description: 'Du tube à la pépite : dix morceaux des années 2000, du plus évident au plus pointu.', level: 'mixed', decade: 2000, genre: 'pop', poster: 'green', icon: 'headphones', lang: 'en',
    candidates: [[F, 'Gnarls Barkley', 'Crazy'], [F, 'Avril Lavigne', 'Complicated'], [M, 'Coldplay', 'In My Place'], [M, 'Linkin Park', 'Faint'], [M, 'Rihanna', "Don't Stop the Music"], [D, 'Sophie Ellis-Bextor', 'Murder on the Dancefloor'], [D, 'Daniel Powter', 'Bad Day'], [D, 'Just Jack', 'Starz in Their Eyes'], [I, 'Jamelia', 'Thank You'], [I, 'The Feeling', 'Sewn']],
    reserves: [[M, 'P!nk', 'Get the Party Started'], [M, 'Beyoncé', 'Baby Boy'], [D, 'Natasha Bedingfield', 'These Words'], [D, 'Vanessa Carlton', 'A Thousand Miles'], [I, 'Vanessa Carlton', 'White Houses'], [I, 'Natasha Bedingfield', 'Single']] },
  { id: 'annees-2010-mixte', prefix: 'a10m', title: 'Années 2010 : tous niveaux', description: 'Du tube à la pépite : dix morceaux des années 2010, du plus évident au plus pointu.', level: 'mixed', decade: 2010, genre: 'pop', poster: 'violet', icon: 'smartphone', lang: 'en',
    candidates: [[F, 'Lorde', 'Royals'], [F, 'Carly Rae Jepsen', 'Call Me Maybe'], [M, 'Ed Sheeran', 'Lego House'], [M, 'Adele', 'Set Fire to the Rain'], [M, 'Imagine Dragons', 'On Top of the World'], [D, 'Foster The People', 'Pumped Up Kicks'], [D, 'Walk The Moon', 'Shut Up and Dance'], [D, 'Of Monsters and Men', 'Little Talks'], [I, 'Gotye', 'Eyes Wide Open'], [I, 'Lilly Wood and The Prick', "Hey It's Ok"]],
    reserves: [[M, 'Bruno Mars', 'Treasure'], [M, 'Sia', 'Cheap Thrills'], [D, 'Passenger', 'Let Her Go'], [D, 'Mumford & Sons', 'I Will Wait'], [I, 'Of Monsters and Men', 'Mountain Sound'], [I, 'Bastille', 'Flaws']] },
  { id: 'chanson-francaise-mixte', prefix: 'cfm', title: 'Chanson française : tous niveaux', description: 'Du classique à la pépite oubliée : dix chansons françaises, du plus évident au plus pointu.', level: 'mixed', decade: 'all', genre: 'chanson', poster: 'violet', icon: 'accordion', lang: 'fr',
    candidates: [[F, 'Charles Trenet', 'La Mer'], [F, 'Johnny Hallyday', "Que je t'aime"], [M, 'Jacques Brel', 'Mathilde'], [M, 'Serge Gainsbourg', 'Couleur café'], [M, 'Michel Sardou', 'Être une femme'], [D, 'Hervé Vilard', "Capri c'est fini"], [D, 'Mort Shuman', 'Le Lac Majeur'], [D, 'Pierre Bachelet', 'Les Corons'], [I, 'Nicolas Peyrac', 'Et mon père'], [I, 'Gérard Lenorman', "Si j'étais Président"]],
    reserves: [[M, 'Michel Polnareff', 'Lettre à France'], [M, 'Serge Reggiani', 'Les loups sont entrés dans Paris'], [D, 'Nicolas Peyrac', 'So Far Away from L.A.'], [D, 'Michel Delpech', 'Pour un flirt'], [I, 'Hervé Vilard', 'Fais-la rire'], [I, 'Pierre Bachelet', "Elle est d'ailleurs"]] },
  { id: 'rap-francais-mixte', prefix: 'rfm', title: 'Rap français : tous niveaux', description: 'Du tube à la pépite : dix morceaux de rap français, du plus évident au plus pointu.', level: 'mixed', decade: 'all', genre: 'rap', poster: 'blue', icon: 'microphone', lang: 'fr',
    candidates: [[F, 'IAM', 'Je danse le MIA'], [F, 'Ninho', "La vie qu'on mène"], [M, 'Damso', 'Autotune'], [M, 'Vald', 'Superman'], [M, 'Orelsan', 'Jour meilleur'], [D, 'La Fève', 'Loyal'], [D, 'Ino Casablanca', 'Oranj'], [D, 'Ben PLG', 'Chaque jour un peu plus'], [I, 'Juice', 'Sans toi'], [I, 'Dakeez', 'Adrénaline']],
    reserves: [] },
  { id: 'chanson-francaise-impossible', prefix: 'cfi', title: 'Chanson française : faces cachées', description: 'Des chansons que presque personne ne connaît, chez des artistes confidentiels : réservé aux vrais curieux.', level: 'impossible', decade: 'all', genre: 'chanson', poster: 'green', icon: 'accordion', lang: 'fr',
    candidates: [[I, 'Karpatt', 'Pétales'], [I, 'Alexis HK', 'Nous'], [I, 'Yves Jamait', 'Les mêmes'], [I, 'Les Wriggles', 'Le complot'], [I, 'Volo', 'Pas de requiem'], [I, 'Marcel et son Orchestre', 'Cerf-volant'], [I, 'Carmen Maria Vega', 'Aigre-doux'], [I, 'Pauline Croze', 'Quelle heure est-il ?'], [I, 'Archimède', 'Hendaye'], [I, "Les Tit' Nassels", "J'écris"]],
    reserves: [[I, "Les Yeux d'la Tête", 'Les pompiers'], [I, 'Soan', "À tire d'ailes"], [I, 'Blankass', 'Toi tu marches'], [I, 'Suarez', 'Mon insuline'], [I, "Pep's", "J'te serre"], [I, 'Ycare', "J'ai un secret"], [I, 'Rose', 'Prends soin de moi'], [I, 'Java', 'La carte bleue'], [I, 'Anaïs', 'Schizophrenia'], [I, 'Tété', 'Bye Bye']] },
  { id: 'rap-francais-impossible', prefix: 'rfi', title: 'Rap français : faces cachées', description: 'Rap français : artistes confidentiels, morceaux cachés. Bon courage.', level: 'impossible', decade: 'all', genre: 'rap', poster: 'gold', icon: 'microphone', lang: 'fr',
    candidates: [[I, 'Krisy', 'Sisyphe']],
    reserves: [],
    // Artistes de départ pour la découverte par l'API (artistes liés).
    seeds: ['Krisy', 'Juice', 'Dakeez', 'Ino Casablanca', 'La Fève', 'Ben PLG'] },
  ...TESTS_LOT2,
  ...TESTS_LOT3,
  ...TESTS_LOT4,
]

export const LEVEL_OF = { F: 1, M: 2, D: 3, I: 4 }
