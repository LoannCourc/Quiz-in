// Exclusions à la main après relecture (artiste – titre, comparés sans casse ni accents) : époque fausse malgré
// les dates Deezer, titre d'une autre langue, reprise, titre vulgaire non détecté.
export const EXCLUDED_DECOYS = [
  ['Michael Jackson', 'Beat It'], // 1982, proposé dans les années 90
  ['U2', 'With Or Without You'], // 1987, proposé dans les années 2000
  ['Dua Lipa', 'Levitating'], // 2020, proposé dans les années 2010
  ['MIKA', 'Elle me dit'], // titre français au milieu de titres anglais
  ['Naughty Boy', 'La La La'], // titre anglais au milieu de titres français
  ['Scissor Sisters', 'Comfortably Numb'], // reprise de Pink Floyd
  ['Django Django', 'Wor'], // 2012, proposé dans les années 2000
  ['a-ha', 'Crying in the Rain'], // même titre qu'une bonne réponse (Culture Beat)
  ['Craig David', 'Walking Away'], // 2000, proposé dans les années 90
  ['Craig David', '7 Days'], // 2000, proposé dans les années 90
  ['As de Trêfle', "Si t'es bonne"], // titre suggestif
  ['Myth Syzer', 'Sans toi'], // même titre qu'une bonne réponse (Juice)
  ['Tryo', "L'hymne de nos campagnes 2019"], // pas du rap
  ['Tove Lo', 'Des fleurs x stromae'], // pas du rap
  ['Stromae', 'Ma Meilleure Ennemie ft. Coldplay'], // pas du rap
  ['Garou', 'La rivière de notre enfance'], // duo avec Michel Sardou, bonne réponse de la même question
  ['Vanessa Paradis', 'La Seine'], // 2011, au milieu de classiques des années 60-70
  ['Chic', 'Le Freak'], // titre anglais au milieu de titres français
  ['Kofs', 'Bande organisée'], // même morceau que la bonne réponse de 13 Organisé (rap-francais-facile)
  ['Reik', 'Inolvidable'], // titre espagnol avec un tube chanté en anglais
  ['Aventura', 'Obsesion'], // titre espagnol avec un tube chanté en anglais
  ['U2', "I Still Haven't Found What I'm Looking For"], // 1987, proposé dans les années 2000
  ['U2', "New Year's Day"], // 1983, proposé dans les années 2000
  ['U2', 'Pride (In The Name Of Love)'], // 1984, proposé dans les années 2000
  ['Django Django', "Love's Dart"], // 2018, proposé dans les années 2000
  ['Florent Pagny', 'Chanter'], // titre français au milieu de titres anglais
  ['Outlines', 'Waiting In Line'], // introuvable par npm run music:decoys
  ['David Guetta', 'Titanium'], // 2011, proposé dans les années 2000
  ['Outlines', 'Show Me'], // introuvable par npm run music:decoys
  ['Black Rebel Motorcycle Club', "Whatever Happened To My Rock 'N' Roll (Punk Song)"], // introuvable par npm run music:decoys
  ['Santigold', 'God from the Machine'], // introuvable par npm run music:decoys
  ['Batlik', 'Le mal est fait'], // introuvable par npm run music:decoys
]

export const EXCLUDED_CORRECT = [
  ['Kris Kristofferson', 'Me And Bobby McGee'], // 1970, découvert pour les années 2010
  ['Françoise Hardy', 'V.I.P.'], // titre français, artiste des années 60, découvert pour les années 80 (anglais)
  ['Ptite Soeur', '34% 33% 33%'], // caractères absents des polices
  ['Atomic Kitten', 'Ladies Night'], // reprise de Kool & the Gang
  ['Calexico', 'The Bitter Suite (Pájaro / Evil Eye / Tennessee Train)'], // titre composite, illisible à l'écran
]

// Exceptions de niveau, limitées à un test (décision du 1er novembre 2026, option b) : titres acceptés comme bonnes
// réponses « Facile » malgré leur mesure Deezer. Chansons de fête anciennes ou d'artistes peu suivis sur Deezer, mais
// refrains connus de tous. Mesure du 1er novembre 2026 en commentaire (fans, position chez l'artiste, rang).
export const LEVEL_EXCEPTIONS = {
  'chansons-de-fete-facile': [
    ['Les Quatre Barbus', 'Chevaliers de la table ronde'], // non classé : 1 595 fans, 3e, rang 310 735
    ['Georges Brassens', 'Le gorille'], // Moyen : 662 189 fans, 7e, rang 636 613
    ['Pierre Perret', 'Les jolies colonies de vacances'], // non classé : 77 510 fans, 4e, rang 485 387
    ['Patrick Sébastien', 'Les sardines'], // Difficile : 54 793 fans, 2e, rang 725 990
    ['Annie Cordy', 'Tata Yoyo'], // Difficile : 30 590 fans, 2e, rang 659 104
    ['Plastic Bertrand', 'Ça plane pour moi'], // Difficile : 10 084 fans, 1er, rang 734 114
    ['La Compagnie Créole', 'Ça fait rire les oiseaux'], // Difficile : 81 091 fans, 2e, rang 744 592
    ['Gipsy Kings', 'Bamboléo'], // Difficile : 259 358 fans, 2e, rang 780 144
  ],
}

// Leurres rendus aux tests du lot 2 (décision du 2 novembre 2026) : retirés des tests figés en mode patch
// (generate.mjs --patch --decoys-only), remplacés à la même place par un titre du même genre et de la même époque, pour
// redevenir bonnes réponses dans les nouveaux tests.
export const RELEASED_DECOYS = [
  ['Los Del Rio', 'Macarena'], // chansons-de-fete-facile → tubes-d-ete-facile
  ['Magic System', 'Premier Gaou'], // chansons-de-fete-facile → tubes-d-ete-facile
  ["Guns N' Roses", "Sweet Child O' Mine"], // annees-80-facile → rock-hymnes-facile
  ['Red Hot Chili Peppers', 'Californication'], // annees-90-facile → rock-hymnes-facile
  ['Scorpions', 'Wind Of Change'], // annees-90-facile → rock-hymnes-facile
  ['Francis Cabrel', 'Encore et encore'], // annees-80-facile → variete-francaise-80-90-facile
  ['Mariah Carey', 'All I Want for Christmas Is You'], // annees-90-facile → chansons-de-noel-facile
]
