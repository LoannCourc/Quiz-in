import {
  DEV_SHORT_GAME_QUESTIONS,
  MAX_PLAYERS,
  MIN_PLAYERS,
  MIN_TEAM_GAME_PLAYERS,
  MIN_TEAM_SIZE,
  PLAYER_NAME_MAX_LENGTH,
  PLAYER_NAME_MIN_LENGTH,
} from '@shared/constants';
import type { CatalogRowId, CatalogSortId } from '@shared/catalogRows';
import type { QuizSortId } from '@shared/quizFilters';
import type { AwaitingNext, LaunchRefusal, SkipTarget } from '@shared/hostEngine';
import type { GameOption } from '@shared/quizCatalog';
import type { ReviewBadge } from '@shared/validationReview';
import type { BluffSortId } from '@shared/bluffCatalog';
import type { CreateGameFailure } from '@shared/gameCreation';
import type { AnswerMode, BlindTestAsk, BluffVerdict, DifficultyLevel, QuestionLevel, QuizAudience, TeamId, TeamMode } from '@shared/types';

import type { JoinRefusal } from '@/lib/joinGame';
import type { AnswerRefusal, RevealOutcome } from '@/lib/playerGame';

// Types de jeu de l'accueil (une tuile chacun).
export type GameType = 'quiz' | 'blindTest' | 'bluff' | 'draw';

// Textes affichés à l'écran, regroupés ici pour faciliter la traduction.
export const strings = {
  // Nom de l'app, écrit par le logo (components/ui/Logo.tsx) et lu par les lecteurs d'écran.
  appName: "Quiz'in",
  // Flèche retour en haut à gauche (BackButton), sur tous les écrans qui ont un écran précédent.
  back: 'Retour',
  join: {
    // Maquette J : rejoindre avec un code (appli et site des joueurs).
    topTitle: 'Rejoindre une partie',
    back: 'Retour',
    codeQuestion: 'Quel est le code de la partie ?',
    codeWhere: 'Tu le trouves sur la TV ou sur l’écran de l’hôte.',
    codeHint: '4 caractères : lettres et chiffres',
    codeBoxAccessibility: (position: number, char: string | undefined) =>
      char ? `Caractère ${position} : ${char}. Toucher pour le corriger` : `Caractère ${position}, vide`,
    codeAccessibility: 'Code de la partie, 4 caractères',
    codeButton: 'Continuer',
    gameCard: {
      room: (code: string) => `Partie ${code}`,
      host: (name: string) => `Hôte : ${name}`,
      players: (count: number) => `${count} joueur${count > 1 ? 's' : ''} connecté${count > 1 ? 's' : ''}`,
    },
    invalidCode: 'Ce code n’est pas valide. Vérifie les 4 caractères affichés sur la TV.',
    loading: 'Connexion à la partie…',
    nameLabel: 'Ton prénom',
    namePlaceholder: 'Ex. : Léa',
    nameHint: `${PLAYER_NAME_MIN_LENGTH} à ${PLAYER_NAME_MAX_LENGTH} caractères`,
    avatarLabel: 'Ton avatar',
    submitButton: 'Rejoindre la partie',
    // Sous le formulaire (règles des stores sur les contenus des joueurs).
    respectNotice: 'En jouant, tu t’engages à rester respectueux.',
    privacyLink: 'Confidentialité',
    submitting: 'Inscription…',
    roomLabel: (code: string) => `Partie ${code}`,
    otherCodeButton: 'Saisir un autre code',
    refusals: {
      notFound: 'Partie introuvable. Vérifie le code affiché sur la TV.',
      alreadyStarted: 'Cette partie a déjà commencé. Il n’est plus possible de la rejoindre.',
      ended: 'Cette partie est terminée.',
      choosingNextGame: 'L’hôte choisit le prochain jeu. Tu pourras rejoindre dans un instant.',
      full: `Cette partie est complète (${MAX_PLAYERS} joueurs maximum).`,
      nameTaken: 'Ce pseudo est déjà pris dans cette partie. Choisis-en un autre.',
      nameNotAllowed: 'Ce pseudo n’est pas accepté. Choisis-en un autre, sympa pour tout le monde !',
      // Exclu par l'hôte : ne peut plus rejoindre cette partie (règles de la base).
      removed: 'Tu as été retiré de la partie par l’hôte.',
    } satisfies Record<JoinRefusal, string>,
    gameOver: 'La partie est terminée. Merci d’avoir joué !',
    submitFailed: 'L’inscription a échoué. Réessaie dans un instant.',
  },
  lobby: {
    inLobbyTitle: 'Tu es dans la partie !',
    waiting: 'En attente du lancement…',
    // Changer de jeu : fin de partie, l'hôte choisit le prochain jeu dans le catalogue.
    choosingNextGame: 'L’hôte choisit le prochain jeu…',
  },
  about: {
    link: 'À propos et crédits',
    // Lien de l'accueil : ouvre la page de confidentialité du site des joueurs dans le navigateur.
    privacyShortLink: 'Confidentialité',
    title: 'À propos',
    version: (version: string) => `Quiz’in, version ${version}`,
    tagline: 'Le quiz des soirées entre amis et en famille : l’hôte affiche la partie sur la TV, chacun répond sur son téléphone.',
    creditsTitle: 'Crédits',
    credits: [
      'Questions et quiz : écrits par l’auteur de Quiz’in ; les questions de Bluff reprennent en partie celles de son jeu JAJA.',
      'Blind test : extraits audio de 30 s et informations sur les morceaux fournis par Deezer (deezer.com). Extrait audio et informations : Deezer.',
      'Polices : Bowlby One et Nunito, sous licence SIL Open Font License.',
      'Avatars : emojis du système de l’appareil.',
    ],
    // Musiques de la TV (spec 17) : artistes de Pixabay (pixabay.com), détail dans docs/sons-licences.md.
    musicTitle: 'Musiques',
    music: [
      'Attente du salon : CRUMBLE-AUX-POMMES05 (Pixabay).',
      'Questions à choix multiples : lG_g (Pixabay).',
      'Saisie libre et écriture du Bluff : Dvir Silverstone (Pixabay).',
      'Vote du Bluff : Nikita Kondrashev (Pixabay).',
      'Jingle de fin de partie : Bomb Sound (Pixabay).',
      'Effets sonores : créés pour Quiz’in.',
    ],
    back: 'Retour au catalogue',
    privacyLink: 'Politique de confidentialité',
  },
  // Badges (spec 20). Jamais le nom d'un jeu fermé : Touche-à-tout dit « chacun des jeux ».
  trophies: {
    categories: {
      played: { title: 'Parties jouées', goal: (n: number) => `Termine ${n} parties` },
      wins: { title: 'Parties gagnées', goal: (n: number) => `Gagne ${n} parties` },
      losses: { title: 'Parties perdues', goal: (n: number) => `Perds ${n} parties (ça arrive aux meilleurs)` },
      gathering: { title: 'Joueurs réunis', goal: (n: number) => `Termine une partie à ${n} joueurs ou plus` },
      winStreak: { title: 'Série de victoires', goal: (n: number) => `Gagne ${n} parties d’affilée` },
      loyal: { title: 'Fidèle', goal: (n: number) => `Joue ${n} jours différents` },
      allRounder: {
        title: 'Touche-à-tout',
        goal: (n: number) => (n === 1 ? 'Joue à chacun des jeux' : `Joue ${n} parties de chacun des jeux`),
      },
      marathon: { title: 'Marathon', goal: (n: number) => `Termine un quiz de ${n} questions ou plus` },
      lightning: {
        title: 'Rapide comme l’éclair',
        goal: (ms: number) => `Donne une bonne réponse en moins de ${ms / 1000} s`,
      },
      liar: { title: 'Menteur ultime', goal: (n: number) => `Piège ${n} joueurs avec tes fausses réponses au Bluff` },
      artist: { title: 'Artiste', goal: (n: number) => `Fais deviner tes dessins ${n} fois à Dessine-moi` },
    },
    // Paliers 1, 2, 3 : médaille, coupe, grand trophée.
    tiers: ['médaille', 'coupe', 'trophée'],
    singles: {
      perfect: { title: 'Sans faute', goal: 'Termine un quiz d’au moins 10 questions sans une seule erreur' },
      comeback: { title: 'Comeback', goal: 'Gagne une partie après avoir été dernier à la moitié' },
      christmas: { title: 'Noël', goal: 'Termine une partie le 24 ou le 25 décembre' },
      newYear: { title: 'Réveillon', goal: 'Termine une partie le 31 décembre ou le 1er janvier' },
      share: { title: 'Partager l’app', goal: 'Fais découvrir Quiz’in à quelqu’un' },
      rate: { title: 'Noter l’app', goal: 'Donne ton avis sur Quiz’in' },
    },
    // Notification de fin de partie (provisoire, avant les maquettes).
    unlockedOne: 'Badge débloqué !',
    unlockedMany: (count: number) => `${count} badges débloqués !`,
    andMore: (count: number) => `et ${count} de plus`,
    close: 'Fermer',
    shareMessage: (url: string) => `Ta TV devient le plateau de la soirée : joue à Quiz’in avec moi ! ${url}`,
  },
  // Aide « Je ne trouve pas ma TV » (même texte que la page /aide-tv du site des joueurs).
  tvHelp: {
    title: 'Je ne trouve pas ma TV',
    intro: 'Pour afficher le jeu, ton téléphone doit voir ta TV. Voici quoi vérifier, dans l’ordre.',
    steps: {
      wifi: {
        title: 'Même Wi-Fi',
        text: 'Ton téléphone et ta TV (ou ta box, ou ta clé Chromecast) doivent être sur le même réseau Wi-Fi. Pas en 4G/5G, pas sur un réseau « invité », sans VPN.',
      },
      power: {
        title: 'TV allumée',
        text: 'Allume la TV et sa box. Si tu utilises une clé Chromecast, vérifie qu’elle est bien branchée.',
      },
      restart: {
        title: 'Redémarre',
        text: 'Coupe et rallume le Wi-Fi de ton téléphone. Si ça ne change rien, débranche ta box ou ta clé 30 secondes, puis rebranche-la.',
      },
      localNetwork: {
        title: 'Autorise le réseau local',
        ios: 'Va dans Réglages → Quiz’in → Réseau local et active-le.',
        android: 'Dans Réglages → Applications → Quiz’in → Autorisations, active « Appareils à proximité » s’il est proposé.',
      },
      youtube: {
        title: 'Fais le test YouTube',
        text: 'Ouvre YouTube et touche l’icône de diffusion. Si ta TV n’y apparaît pas non plus, le souci vient du réseau ou de la TV, pas de Quiz’in.',
      },
      elsewhere: {
        title: 'La TV est chez quelqu’un d’autre ?',
        text: 'Le propriétaire doit autoriser la diffusion pour tout le réseau Wi-Fi : dans l’app Google Home, touche la TV, puis Paramètres et le réglage de diffusion. Il peut aussi t’inviter dans son foyer Google Home.',
      },
      compatible: {
        title: 'Ta TV est-elle compatible ?',
        text: 'Il faut une TV avec Chromecast intégré (Google TV, Android TV, Freebox Pop…) ou une clé Chromecast. Une TV sans Chromecast, une Apple TV, ou certaines TV Samsung ou LG ne fonctionnent pas.',
      },
    },
    contactStart: 'Toujours rien ? Écris-nous : ',
    contactEmail: 'quizinsupport@gmail.com',
    retry: 'Réessayer',
    back: 'Retour',
    // iPhone : carte en tête de l'aide (les deux causes les plus fréquentes sur iOS).
    ios: {
      title: 'Ton iPhone ne trouve pas ta TV',
      localNetwork: 'Autorise le réseau local : Réglages → Quiz’in → Réseau local.',
      wifi: 'Sois sur le même Wi-Fi que ton Chromecast : pas de réseau invité, pas de VPN.',
      openSettings: 'Ouvrir les réglages',
    },
  },
  // Règles du Bluff (spec 16) : feuille de l'hôte (catalogue, fiche) et carte du salon d'attente des joueurs.
  bluffRules: {
    title: 'Comment jouer au Bluff',
    link: 'Comment jouer ?',
    lines: [
      'La question s’affiche sur la TV : invente une fausse réponse crédible (60 s).',
      'Toutes les fausses réponses sont mélangées avec la vraie.',
      'Vote pour celle que tu crois vraie (jamais la tienne).',
      'Vraie réponse trouvée : 1 000 points.',
      'Chaque joueur piégé par ta fausse réponse : 500 points pour toi.',
      'Si tu écris la vraie réponse, elle est refusée : invente-en une autre (3 essais).',
    ],
    close: 'Fermer',
    hide: 'Masquer',
  },
  // « Sur un ordinateur » (maquette « Pas de TV · C ») : lien de l'écran TV de la partie, puis 3 étapes.
  tvComputer: {
    title: 'Sur un ordinateur',
    linkLabel: 'Lien de l’écran TV',
    copy: 'Copier',
    copied: 'Copié !',
    send: 'M’envoyer',
    shareMessage: (url: string) => `Écran TV Quiz’in. Ouvre ce lien sur l’ordinateur branché à ta TV : ${url}`,
    stepsLabel: 'À faire sur l’ordinateur',
    steps: [
      { lead: 'Ouvre le lien', text: ' dans le navigateur du PC relié à la TV (HDMI) ou de ta Smart TV' },
      // Espaces insécables avant les deux-points : jamais un « : » seul en début de ligne.
      { lead: 'Plein écran :', text: ' touche F11 (sur Mac : ctrl + cmd + F)' },
      { lead: 'Reviens sur ton téléphone :', text: ' les joueurs rejoignent, tu lances la partie' },
    ],
    done: 'J’ai compris',
    back: 'Retour',
  },
  catalog: {
    loading: 'Chargement du catalogue…',
    errorPrefix: 'Erreur de chargement :',
    emptyCatalog: 'Aucun quiz disponible.',
    noMatch: 'Aucun quiz pour ce thème.',
    allThemes: 'Tout',
    // Catalogue du Bluff (maquette BL4).
    bluff: {
      title: 'Bluff',
      searchPlaceholder: (count: number) => `Chercher parmi ${count} quiz…`,
      surprise: 'Surprends-moi',
      surpriseHint: 'Un mélange au hasard',
      sorts: { popular: 'Populaires', new: 'Nouveautés', alphabetical: 'A–Z', questionCount: 'Nombre de questions' } satisfies Record<BluffSortId, string>,
      sortTitle: 'Trier',
      quizCount: (count: number) => `${count} quiz`,
      rowMeta: (theme: string, questions: number) => `${theme} · ${questions} questions`,
      add: (title: string) => `Ajouter « ${title} » à mon mélange`,
      remove: (title: string) => `Retirer « ${title} » de mon mélange`,
      chooseQuiz: 'Choisis un quiz',
      mixSummary: (quizzes: number, questions: number) => `${quizzes} quiz · ${questions} questions`,
      // Barre « Nombre de questions » : le périmètre seul (le total est dans « Voir » et sous les options grisées).
      mixScope: (quizzes: number) => `${quizzes} quiz`,
      mixTitle: 'Mon mélange',
      clearMix: 'Tout vider',
      mixTooSmall: (total: number) => `Ce mélange n’a que ${total} questions.`,
      noResult: 'Aucun quiz pour ce choix.',
    },
    // Catalogue du Blind test (maquette BT5).
    blindTest: {
      title: 'Blind test',
      tabs: { genre: 'Genre', decade: 'Années', level: 'Difficulté' },
      searchPlaceholder: 'Chercher un blind test…',
      genres: { pop: 'Pop', rock: 'Rock', rap: 'Rap', chanson: 'Chanson', discoFunk: 'Disco/Funk', electro: 'Électro' },
      decades: { 1960: '60s', 1970: '70s', 1980: '80s', 1990: '90s', 2000: '2000s', 2010: '2010s', 2020: '2020s', all: 'Toutes époques' },
      decadeTitles: { 1960: 'Années 60', 1970: 'Années 70', 1980: 'Années 80', 1990: 'Années 90', 2000: 'Années 2000', 2010: 'Années 2010', 2020: 'Années 2020', all: 'Toutes époques' },
      count: (count: number) => `${count} blind test${count > 1 ? 's' : ''}`,
      played: (count: number) => `${count} joué${count > 1 ? 's' : ''}`,
      ofTotal: (shown: number, total: number) => `${shown} sur ${total} blind test${total > 1 ? 's' : ''}`,
      genreFilter: 'Genre',
      levelFilter: 'Difficulté',
      sort: 'Trier',
      removeFilter: (label: string) => `Retirer le filtre ${label}`,
      noResult: 'Aucun blind test pour ce choix.',
    },
    // Bluff, Mon mélange : fiche de la partie tirée dans les quiz choisis (route /pool).
    mixGame: {
      description: (count: number, total: number) =>
        `${count} questions tirées au hasard parmi les ${total} des quiz choisis, en commençant par celles jamais jouées sur ce téléphone.`,
    },
    // Fiche d'une partie tirée dans des thèmes du Quiz (route /pool, maquette QN1-F).
    themesGame: {
      unavailable: 'Cette sélection de thèmes n’est plus disponible.',
      loading: 'Préparation des questions…',
      drawFailed: 'Impossible de préparer les questions.',
      meta: (count: number, minutes: number | null) =>
        `${count} questions · ${minutes === null ? 'à votre rythme' : `environ ${minutes} min`} · ${MIN_PLAYERS} à ${MAX_PLAYERS} joueurs`,
      mixedLevels: 'Niveaux mélangés',
      programme: 'Au programme',
      byTheme: 'Par thème',
      byLevel: 'Par niveau',
      share: (label: string, count: number) => `${label} · ${count}`,
      unplayedFirst: 'Les questions que tu n’as jamais jouées passent en premier.',
      modify: 'Modifier mon choix',
      modifyLabel: 'Modifier mon choix : thèmes, nombre de questions et difficulté',
      create: 'Créer la partie',
      creating: 'Création…',
      help: 'Tu auras ensuite le code et le QR code pour inviter les joueurs.',
    },
    // Catalogue Quiz (maquette QN1-A) : thème à la une et tuiles des thèmes.
    themesHome: {
      weekTheme: 'Thème de la semaine',
      heroMeta: (questions: number, quizzes: number, played: number) =>
        `${questions} questions · ${quizzes} quiz${played > 0 ? ` · ${played} déjà joué${played > 1 ? 's' : ''}` : ''}`,
      play: 'Jouer',
      playLabel: (theme: string, count: number) => `Jouer ${count} questions, thème ${theme}`,
      countOption: (count: number) => `${count} questions`,
      allThemes: 'Tous les thèmes',
      seeAll: 'Tout voir',
      seeAllLabel: 'Voir tous les thèmes',
      tileCount: (count: number) => `${count} questions`,
    },
    // Feuille d'un thème (maquette QN1-A, V1) : nombre de questions et mélange avec d'autres thèmes.
    themeSheet: {
      available: (count: number) => `${count} questions disponibles`,
      close: 'Fermer',
      howMany: 'Combien de questions ?',
      questions: 'questions',
      // Nom de chaque carte, selon son nombre de questions.
      cardNames: { 10: 'Express', 20: 'Classique', 30: 'Marathon' } as Record<number, string>,
      recommended: 'Conseillé',
      // Espaces insécables : « ≈ 11 min » ne se coupe jamais.
      minutes: (minutes: number) => `≈ ${minutes} min`,
      cardLabel: (count: number, name: string, minutes: number | null, isRecommended: boolean) =>
        `${count} questions, ${name}${minutes === null ? '' : `, environ ${minutes} minutes`}${isRecommended ? ', conseillé' : ''}`,
      mixTitle: 'Mélanger avec un autre thème ?',
      addTheme: (theme: string) => `Ajouter le thème ${theme}`,
      removeTheme: (theme: string) => `Retirer le thème ${theme}`,
      continue: (count: number) => `Continuer · ${count} questions`,
    },
    // « Ta partie » (maquette QN1-G), ouvert par « Modifier mon choix » sur la fiche.
    themePicker: {
      title: 'Ta partie',
      back: 'Revenir à la fiche sans rien changer',
      subtitle: 'Change ce que tu veux, tout se met à jour.',
      themes: 'Thèmes',
      themesCount: (count: number, max: number) => `${count} sur ${max} max`,
      // Noms courts des thèmes dans les tuiles (les autres gardent leur nom).
      shortNames: { 'Cinéma et séries': 'Cinéma', 'Culture générale': 'Culture gé.' } as Record<string, string>,
      themeLabel: (theme: string, isChecked: boolean) => `${theme}${isChecked ? ', choisi' : ''}`,
      questionCount: 'Nombre de questions',
      difficulty: 'Difficulté',
      allLevels: 'Tous niveaux',
      summary: (themes: string[], count: number, minutes: number | null) =>
        `${themes.join(' + ')} · ${count} questions${minutes === null ? '' : ` · ≈ ${minutes} min`}`,
      validate: (count: number) => `Valider · ${count} questions`,
      // Avertissement quand il manque des questions : nombre réel, niveaux, thèmes, conseil.
      levelAdjectives: { easy: 'faciles', medium: 'moyennes', hard: 'difficiles' } satisfies Record<QuestionLevel, string>,
      themeList: (themes: string[]) => (themes.length === 1 ? themes[0] : `${themes.slice(0, -1).join(', ')} et ${themes.at(-1)}`),
      shortage: (available: number, levels: string, themes: string, advice: string) =>
        `Seulement ${available} question${available > 1 ? 's' : ''}${levels === '' ? '' : ` ${levels}`} en ${themes} : ${advice}`,
      advice: {
        addTheme: 'ajoute un thème pour en avoir plus.',
        widenLevels: 'choisis un autre niveau pour en avoir plus.',
        fewerQuestions: 'choisis moins de questions.',
      },
    },
    // Barre « Nombre de questions » du Bluff (Mon mélange).
    questionCount: {
      title: 'Nombre de questions',
      option: (count: number) => `${count} questions`,
      continue: 'Continuer',
      show: 'Voir',
    },
    // Dessine-moi : catégories des mots de la partie.
    drawCategories: {
      title: 'Quels mots dessiner ?',
      subtitle: 'Choisis une ou plusieurs catégories.',
      mix: 'Mélange',
      mixHint: 'Toutes les catégories',
      count: (count: number) => `${count} catégorie${count > 1 ? 's' : ''}`,
      none: 'Aucune catégorie',
      noneHint: 'Choisis au moins une catégorie.',
      continue: 'Continuer',
    },
    search: 'Rechercher un quiz',
    searchPlaceholder: 'Chercher un quiz…',
    clearSearch: 'Effacer la recherche',
    noSearchResult: 'Aucun quiz ne porte ce titre.',
    // Lot E : tris du catalogue et repère des quiz déjà joués sur ce téléphone.
    sorts: {
      new: 'Nouveautés',
      notPlayed: 'Pas encore faits',
      easiest: 'Plus faciles',
      alphabetical: 'A à Z',
    } satisfies Record<CatalogSortId, string>,
    // Tri et filtres du Quiz (maquette QT1) ; même vocabulaire que le Bluff.
    filters: {
      button: 'Filtres',
      buttonCount: (count: number) => `Filtres · ${count}`,
      buttonLabel: (count: number) =>
        count === 0 ? 'Trier et filtrer' : `Trier et filtrer, ${count} filtre${count > 1 ? 's' : ''} actif${count > 1 ? 's' : ''}`,
      sheetTitle: 'Trier et filtrer',
      clearAll: 'Tout effacer',
      sortTitle: 'Trier par',
      levelTitle: 'Difficulté',
      audienceTitle: 'Pour qui ?',
      themeTitle: 'Thème',
      allThemesChip: 'Tous les thèmes',
      hidePlayed: 'Cacher ceux déjà faits',
      hidePlayedChip: 'Pas encore faits',
      removeChip: (label: string) => `Retirer le filtre ${label}`,
      apply: (count: number) => `Voir ${count} quiz`,
      summary: (count: number, sort: string) => `${count} quiz · triés par ${sort}`,
      noMatch: 'Aucun quiz ne correspond à ces filtres.',
      sorts: {
        popular: 'Populaires',
        new: 'Nouveautés',
        easiest: 'Plus faciles',
        hardest: 'Plus difficiles',
        alphabetical: 'A–Z',
      } satisfies Record<QuizSortId, string>,
    },
    played: 'Déjà fait',
    playedLabel: (title: string) => `${title}, déjà fait`,
    withLevel: (label: string, level: string) => `${label}, difficulté : ${level}`,
    gameTypes: { quiz: 'Quiz', blindTest: 'Blind test', bluff: 'Bluff', draw: 'Dessine-moi' } satisfies Record<GameType, string>,
    soon: 'bientôt',
    gameTypeSoon: (label: string) => `${label}, bientôt disponible`,
    rows: {
      featured: 'Top 10 cette semaine',
      new: 'Nouveautés',
      easy: 'Faciles, pour tout le monde',
      experts: 'Pour les experts',
    } satisfies Record<CatalogRowId, string>,
    posterLabel: (title: string, rank?: number) => (rank === undefined ? title : `${rank}. ${title}`),
    // Démos (développement seulement), sur une ligne en bas de l'accueil.
    demoCatalogLink: 'Démo catalogue',
    difficultyLevels: { easy: 'Facile', medium: 'Moyen', hard: 'Difficile', impossible: 'Impossible' } satisfies Record<DifficultyLevel, string>,
    // Quiz joué (salon, salle d'attente, fin) : « Électro des années 80 · Moyen ».
    playedQuiz: (title: string, level: string) => `${title} · ${level}`,
    playerDemoLink: 'Démo joueur',
    // Un seul lien « Démos » sur la ligne d'À propos : l'accueil garde la mise en page du build publié.
    demosLink: 'Démos',
    demosTitle: 'Démos',
    resumeGame: (code: string) => `Reprendre la partie ${code}`,
  },
  quizSetup: {
    loading: 'Chargement du quiz…',
    changeGameFailed: 'Impossible de changer de jeu : la partie n’attend plus de nouveau jeu.',
    notFound: 'Ce quiz n’existe pas.',
    backToCatalog: 'Retour au catalogue',
    answerModeLabel: 'Comment répond-on ?',
    answerModes: {
      choice: 'Choix multiples',
      free: 'Réponse libre',
      bluff: 'Bluff',
      draw: 'Dessin',
    } satisfies Record<AnswerMode, string>,
    answerModeHints: {
      choice: '4 propositions',
      free: 'On tape la réponse',
      bluff: 'On invente une fausse réponse',
      draw: 'On dessine, les autres devinent',
    } satisfies Record<AnswerMode, string>,
    optionsLabel: 'Options',
    rhythmLabel: 'Rythme',
    stepByStep: { title: 'Pas à pas', hint: 'Tu passes à la suite' },
    suspense: { title: 'Suspense', hint: 'Classement à la fin' },
    options: {
      speedBonus: { title: 'Rapidité', hint: 'Points bonus' },
      control: { title: 'Contrôle', hint: 'Tu valides les réponses' },
      teams: { title: 'Groupe', hint: 'En équipes' },
    } satisfies Record<GameOption, { title: string; hint: string }>,
    comingSoon: 'bientôt',
    incompatible: 'incompatible avec ces réglages',
    // minutes null : Pas à pas, la durée dépend de l'hôte.
    // isRound : Dessine-moi (des manches, pas des questions).
    meta: (questionCount: number, minutes: number | null, isRound = false) =>
      `${questionCount} ${isRound ? 'manches' : 'questions'} · ${minutes === null ? 'à votre rythme' : `environ ${minutes} min`} · jusqu’à ${MAX_PLAYERS} joueurs`,
    audiences: { all: 'Tout public', kids: 'Enfants', experts: 'Experts' } satisfies Record<QuizAudience, string>,
    settingsTitle: 'Réglages de la partie',
    audioCredit: 'Extrait audio et informations : Deezer',
    blindTestUnavailable: 'Le blind test n’est pas disponible pour le moment.',
    drawUnavailable: 'Dessine-moi n’est pas disponible pour le moment.',
    speedBonusOn: 'Rapidité activée',
    speedBonusOff: 'sans Rapidité',
    settingsCardLabel: (summary: string) => `Réglages de la partie : ${summary}. Modifier`,
    settingsDone: 'Terminé',
    createButton: 'Choisir ce quiz',
    createGameButton: 'Choisir ce jeu',
    // Dessine-moi : catégories choisies dans le catalogue (vide : toutes).
    drawCategories: (names: string[]) => `Catégories : ${names.length === 0 ? 'Mélange' : names.join(', ')}`,
    creating: 'Création…',
    // Création impossible, selon la cause (shared/gameCreation.ts).
    createFailures: {
      codeTaken: 'Pas de code de partie libre trouvé. Réessaie.',
      refused: 'Le serveur a refusé la création. Mets l’app à jour ou réessaie plus tard.',
      offline: 'Pas de connexion. Vérifie ton réseau et réessaie.',
    } satisfies Record<Exclude<CreateGameFailure, 'unknown'>, string>,
    createFailed: 'La partie n’a pas pu être créée :',
    createFailedUnknown: 'La partie n’a pas pu être créée. Réessaie.',
    createReference: (detail: string) => `Réf. : ${detail}`,
  },
  // Groupe (maquettes G1 à G4) : équipes Rose, Cyan, Or, Vert.
  teams: {
    names: { pink: 'Rose', cyan: 'Cyan', gold: 'Or', green: 'Vert' } satisfies Record<TeamId, string>,
    teamLabel: (name: string) => `Équipe ${name}`,
    playerCount: (count: number) => `${count} joueur${count > 1 ? 's' : ''}`,
    averageNote: 'Le score d’une équipe est la moyenne des points de ses joueurs.',
    composer: {
      title: 'Équipes',
      modes: { random: 'Au hasard', host: 'Je choisis', players: 'Ils choisissent' } satisfies Record<TeamMode, string>,
      countLabel: 'Nombre d’équipes',
      tooSmall: `Il faut au moins ${MIN_TEAM_SIZE} joueurs par équipe`,
      unassigned: 'Sans équipe',
      placeHint: 'touche une équipe',
      draw: 'Tirer au sort',
      redraw: 'Retirer au sort',
    },
    // Ligne « Équipes » du salon (maquette L1).
    row: {
      title: 'Équipes',
      teamCount: (count: number) => `${count} équipes`,
      summary: (parts: string[]) => parts.join(' · '),
      drawAtLaunch: 'tirage au lancement',
      ready: 'équipes prêtes',
      incomplete: 'à compléter',
      unassigned: (count: number) => `${count} sans équipe`,
    },
    // Page « Équipes » plein écran (maquette E1) : une consigne d'une phrase en haut, selon l'état.
    page: {
      back: 'Retour au salon',
      validate: 'Valider les équipes',
      // Pendant l'animation du tirage sur la TV (bouton grisé jusqu'au gong).
      drawing: 'Tirage en cours…',
      // Joueurs placés et sans équipe, toujours visibles en tête de page.
      toAssign: (count: number) => `${count} joueur${count > 1 ? 's' : ''} à répartir`,
      assignment: (placed: number, unassigned: number) => `${placed} placé${placed > 1 ? 's' : ''} · ${unassigned} sans équipe`,
      unassignedAlert: (count: number) =>
        `${count} joueur${count > 1 ? 's n’ont' : ' n’a'} pas d’équipe : impossible de lancer la partie tant qu’ils ne sont pas placés.`,
      redrawNow: 'Refaire le tirage',
      // Aide toujours visible sous la consigne, quel que soit le nombre de joueurs.
      minimumHelp: `Le mode Groupe se joue à partir de ${MIN_TEAM_GAME_PLAYERS} joueurs.`,
      instructions: {
        chooseMode: 'Choisis comment former les équipes.',
        tooFewPlayers: `Il faut au moins ${MIN_TEAM_GAME_PLAYERS} joueurs pour jouer par équipes : attends que d’autres joueurs rejoignent la partie.`,
        drawFirst: 'Appuie sur TIRER AU SORT, puis VALIDER LES ÉQUIPES (sans tirage, il se fera au lancement).',
        drawn: 'Équipes tirées : appuie sur VALIDER LES ÉQUIPES, ou RETIRER AU SORT pour en changer.',
        lateJoiner: 'Un joueur est arrivé après le tirage : appuie sur RETIRER AU SORT, ou touche-le puis une équipe.',
        hostPlace: 'Touche un joueur, puis l’équipe où le placer.',
        playersChoose: 'Les joueurs choisissent leur équipe sur leur téléphone ; tu peux aussi en déplacer un.',
        tooSmall: `Une équipe a moins de ${MIN_TEAM_SIZE} joueurs : déplace un joueur, ou choisis moins d’équipes.`,
        ready: 'Équipes prêtes : appuie sur VALIDER LES ÉQUIPES.',
      },
    },
    // Téléphone : équipe reçue (tirage, ou placement d'un retardataire par l'hôte).
    joined: (team: string) => `Tu as rejoint l’équipe ${team}`,
    picker: {
      title: 'Choisis ton équipe',
      hint: 'Tu peux changer jusqu’au lancement de la partie.',
      yourTeam: 'Ton équipe',
      unused: (name: string) => `Équipe ${name} non utilisée`,
      waiting: 'En attente du lancement de la partie…',
      hostCanMove: 'L’hôte peut aussi te placer dans une autre équipe.',
      chooseFailed: 'Ton choix n’a pas été enregistré. Réessaie.',
    },
    // Pendant la partie (maquette G4).
    game: {
      yourTeam: 'Ton équipe',
      inYourTeam: 'Dans ton équipe',
      outOf: (size: number) => `sur ${size}`,
      rankingTitle: 'Classement des équipes',
      mine: ' · ton équipe',
      points: (points: number) => formatNumber(Math.round(points)),
      endWinner: 'Votre équipe gagne !',
      endPlace: (place: string) => `Votre équipe est ${place} !`,
      you: 'Toi',
      bestOfTeam: 'Meilleur joueur de ton équipe',
      playerDetail: (total: number, points: number) => `sur ${total} · ${formatNumber(points)} pts`,
      showPlayers: 'Classement des joueurs',
      showTeams: 'Classement des équipes',
    },
  },
  hostLobby: {
    loading: 'Chargement de la partie…',
    notHost: 'Partie introuvable, ou tu n’en es pas l’hôte.',
    codeLabel: 'Code de la partie',
    quizMeta: (questionCount: number, minutes: number) => `${questionCount} questions · environ ${minutes} min`,
    // Bluff, Mon mélange : partie tirée dans plusieurs quiz.
    mixTitle: (quizzes: number) => `Mon mélange · ${quizzes} quiz`,
    // Aide « Je ne trouve pas ma TV » (écran tvHelp) : lien sous « Afficher sur la TV », bandeau si aucune TV.
    playersTitle: 'Joueurs',
    connectedCount: (count: number) => `${count} connecté${count > 1 ? 's' : ''}`,
    // Exclure un joueur (bouton × sur son avatar, puis confirmation).
    removePlayer: (name: string) => `Exclure ${name}`,
    removeConfirm: (name: string) => ({
      title: `Exclure ${name} ?`,
      message: `${name} sera retiré de la partie et ne pourra plus la rejoindre.`,
      confirm: 'Exclure',
      cancel: 'Annuler',
    }),
    codeBoxAccessibility: (position: number, char: string | undefined) =>
      char ? `Caractère ${position} : ${char}. Toucher pour le corriger` : `Caractère ${position}, vide`,
    codeAccessibility: (code: string) => `Code de la partie : ${code.split('').join(' ')}`,
    // Sous « Afficher sur la TV » : un seul lien, qui ouvre la feuille des autres façons d'afficher.
    displayOptionsLink: 'Pas de Chromecast ? Autres façons d’afficher',
    displayOptions: {
      title: 'Autres façons d’afficher',
      tvHelp: 'Je ne trouve pas ma TV',
      tvHelpHint: 'Chromecast ou TV avec Google Cast : ce qu’il faut vérifier',
      computer: 'Afficher sur un ordinateur',
      computerHint: 'Un PC branché à la TV (HDMI), ou le navigateur d’une Smart TV',
      close: 'Fermer',
    },
    // Feuille « Inviter » (à droite de « Joueurs ») : QR code et lien des joueurs.
    inviteButton: 'Inviter',
    invite: {
      title: 'Inviter des joueurs',
      intro: 'Chacun scanne le QR code avec l’appareil photo de son téléphone.',
      typeCode: (host: string) => `ou tape le code sur ${host}`,
      share: 'Partager',
      copy: 'Copier le lien',
      close: 'Fermer',
      shareMessage: (code: string, url: string) => `Rejoins ma partie Quiz’in ! Code ${code} : ${url}`,
      qrLabel: (url: string) => `QR code du lien ${url}`,
    },
    noPlayersShort: 'Aucun joueur pour l’instant',
    waitingPlayers: 'En attente des joueurs…',
    // Dessine-moi : des manches, pas des questions.
    roundsMeta: (roundCount: number, minutes: number) => `${roundCount} manches · environ ${minutes} min`,
    // Carte « Je joue aussi » au-dessus de « Réglages », et la feuille du prénom et de l'avatar de l'hôte.
    playAlso: {
      title: 'Je joue aussi',
      hint: 'Tu réponds aux questions depuis ce téléphone.',
      playingAs: (avatar: string, name: string) => `Tu joues en tant que ${avatar} ${name}`,
      edit: 'Modifier',
      you: 'Toi',
      editLabel: 'Modifier ton prénom et ton avatar',
      sheetTitle: 'Ton profil de joueur',
      sheetIntro: 'Ton prénom et ton avatar, comme les autres joueurs.',
      namePlaceholder: 'Ton prénom',
      nameRequired: `Écris ton prénom : ${PLAYER_NAME_MIN_LENGTH} à ${PLAYER_NAME_MAX_LENGTH} caractères.`,
      scrollHint: 'Fais défiler pour voir tous les avatars.',
      joinButton: 'Rejoindre la partie',
      saveButton: 'Enregistrer',
      saving: 'Enregistrement…',
      cancel: 'Annuler',
    },
    // Ligne « Réglages » et sa feuille.
    settings: {
      title: 'Réglages',
      summary: 'équipes',
      playerCount: (count: number) => `${count} joueur${count > 1 ? 's' : ''}`,
      // Dessine-moi.
      roundsTitle: 'Nombre de manches',
      roundsHint: 'À tour de rôle.',
      roundsChoice: (rounds: number) => `${rounds} manches`,
      teamsTitle: 'Jouer en équipes',
      teamsHint: 'Le score d’une équipe est la moyenne de ses joueurs.',
      teamsMinPlayers: `Disponible dès ${MIN_TEAM_GAME_PLAYERS} joueurs.`,
      // Bloc réservé au développement (absent de l'app publiée).
      devTitle: 'Développement',
      devHint: 'Partie courte, un seul dessinateur. Absent de l’app publiée.',
      singleDrawerTitle: 'Un seul dessinateur : toutes les manches',
      singleDrawerHint: 'Développement uniquement : un même joueur dessine chaque manche.',
    },
    copied: 'Lien copié !',
    copyFailed: 'Copie impossible : sélectionne le lien à la main.',
    // TV connectée : le bloc code, QR et lien se réduit à une barre (maquette L1).
    tvBar: {
      connected: 'TV connectée',
      codeLabel: 'Code de la partie : ',
      details: 'Détails',
    },
    launchButton: 'Lancer la partie',
    launching: 'Lancement…',
    loadingQuestions: 'Chargement des questions…',
    preparingAudio: 'Préparation des extraits audio…',
    questionsError: 'Impossible de charger les questions du quiz. Vérifie ta connexion.',
    launchFailed: 'Le lancement a échoué. Réessaie dans un instant.',
    // Joueurs sans équipe, avec le nombre exact (à la place du motif général du refus).
    unassignedLaunch: (count: number) => `${count} joueur${count > 1 ? 's' : ''} sans équipe : ouvre Équipes et refais le tirage.`,
    launchRefusals: {
      notLobby: 'La partie est déjà lancée.',
      notEnoughPlayers: `Il faut au moins ${MIN_PLAYERS} joueurs connectés, toi compris.`,
      tooManyPlayers: `${MAX_PLAYERS} joueurs au maximum dans une partie.`,
      noQuestions: 'Ce quiz n’a pas de question jouable.',
      blindTestDisabled: 'Le blind test n’est pas disponible pour le moment.',
      audioUnavailable: 'Extraits audio indisponibles. Vérifie ta connexion, puis réessaie.',
      teamsTooFewPlayers: `Il faut au moins ${MIN_TEAM_GAME_PLAYERS} joueurs pour jouer par équipes.`,
      teamsUnassigned: 'Chaque joueur doit être dans une équipe.',
      teamTooSmall: `Il faut au moins ${MIN_TEAM_SIZE} joueurs par équipe.`,
    } satisfies Record<LaunchRefusal, string>,
    // Dessine-moi à deux : l'hôte ne dessine jamais, l'autre joueur dessine toutes les manches.
    shortGame: {
      title: `Partie courte (${DEV_SHORT_GAME_QUESTIONS} questions)`,
      hint: 'Développement uniquement, absent de l’app publiée.',
    },
  },
  // Cast de l'hôte vers la TV (spec 4.1 et 6.6).
  cast: {
    showButton: 'Afficher sur la TV',
    iconLabel: 'Choisir la TV',
    // iOS, avant la première recherche des TV (demande d'accès au réseau local).
    localNetworkTitle: 'Afficher sur la TV',
    localNetworkText: 'Pour afficher le jeu sur ta TV, autorise l’accès au réseau local dans la fenêtre qui va s’afficher.',
    localNetworkContinue: 'CONTINUER',
    localNetworkLater: 'Plus tard',
    // iOS : la pilule pendant l'attente des TV, puis la feuille si aucune TV n'est vue.
    searching: 'Recherche des TV…',
    noTvFound: {
      title: 'Aucune TV trouvée',
      text: 'Ton iPhone doit pouvoir voir les appareils de ton Wi-Fi. Ouvre Réglages → Quiz’in et active « Réseau local ». Vérifie aussi que la TV est allumée et sur le même Wi-Fi que ton iPhone.',
      openSettings: 'OUVRIR LES RÉGLAGES',
      retry: 'Réessayer',
      help: 'Voir l’aide',
    },
  },
  // Partie impossible à ouvrir (« Reprendre la partie », lien, code) : hôte et joueurs.
  gameUnavailable: {
    goneTitle: 'Partie introuvable ou terminée',
    goneText: 'Elle a peut-être été supprimée, ou l’hôte l’a terminée.',
    connectionTitle: 'Connexion impossible',
    connectionText: 'Vérifie ta connexion internet, puis réessaie.',
    retry: 'Réessayer',
    home: 'Retour à l’accueil',
    // Ligne grise pour les retours des testeurs : cause technique, jamais de donnée personnelle.
    reference: (detail: string) => `Réf. : ${detail}`,
    timeout: (seconds: number) => `délai de ${seconds} s dépassé`,
    readRefused: 'lecture refusée',
    networkError: 'erreur réseau',
    signInFailed: 'connexion anonyme impossible',
    // Champs de la partie sans réponse (3 au plus), après le délai.
    noAnswer: (fields: string[]) => `sans réponse : ${fields.slice(0, 3).join(', ')}${fields.length > 3 ? '…' : ''}`,
    missing: 'partie absente',
    otherHost: 'autre hôte',
  },
  hostGame: {
    inProgressTitle: 'Partie en cours',
    spectatorHint: 'Tu ne joues pas cette partie : suis-la sur la TV.',
    returnedFromAbsence: 'Tu étais absent : la partie est en pause. Reprends quand tout le monde est prêt.',
    gameDeleted: 'La partie a été supprimée : tu as été absent trop longtemps.',
    connectionLost: 'Connexion perdue… la partie est en attente',
    castInterrupted: 'Cast interrompu : reconnecte la TV, puis reprends',
    // Règles de la base plus anciennes que l'app (déploiement oublié) : la partie ne peut plus avancer.
    writeRefused: 'La base a refusé une écriture de la partie : ses règles de sécurité ne sont peut-être pas à jour.',
    connectionLostHint: 'Elle sera mise en pause dès le retour du réseau.',
    backToCatalog: 'Retour au catalogue',
  },
  // Joueurs : phase bloquée depuis plus de 5 s (coupure de l'hôte pas encore détectée).
  waitingHost: {
    title: 'En attente de l’hôte…',
    message: 'La partie va reprendre.',
  },
  // Joueurs pendant l'absence de l'hôte (départ ou coupure), spec 6.6.
  hostAway: {
    title: 'En attente de l’hôte…',
    message: 'La partie va reprendre.',
    deletionIn: (time: string) => `Sans retour de l’hôte, la partie sera supprimée dans ${time}.`,
  },
  // Contrôle (maquette V1) : validation des réponses libres par l'hôte avant la révélation.
  hostValidation: {
    steps: ['Question', 'Validation', 'Réponse'],
    blindTest: {
      title: 'Blind test · titre',
      artist: 'Blind test · artiste',
      both: 'Blind test · titre et artiste',
    } satisfies Record<BlindTestAsk, string>,
    expected: 'Réponse attendue',
    alsoAccepted: (variants: string[]) => `Aussi acceptés : ${variants.join(', ')}`,
    received: 'Réponses reçues',
    receivedCount: (answered: number, total: number) => `${answered} joueur${answered > 1 ? 's' : ''} sur ${total}`,
    playerCount: (count: number) => `${count} joueur${count > 1 ? 's' : ''}`,
    noAnswer: 'Aucune réponse reçue : personne ne marque de points.',
    badges: {
      exact: 'Exact',
      alias: 'Alias',
      typo: 'Faute de frappe ?',
      close: 'À vérifier',
      allInTitle: 'Tout dans le titre',
      wrong: 'Faux',
      hidden: 'Masqué',
    } satisfies Record<ReviewBadge, string>,
    parts: { title: 'Titre', artist: 'Artiste' },
    emptyPart: '(vide)',
    counts: ({ accepted, partial, refused }: { accepted: number; partial: number; refused: number }) =>
      [
        `${accepted} acceptée${accepted > 1 ? 's' : ''}`,
        partial > 0 ? `${partial} à moitié` : null,
        `${refused} refusée${refused > 1 ? 's' : ''}`,
      ]
        .filter(Boolean)
        .join(' · '),
    eyeHint: 'Un appui sur l’œil masque la réponse sur la TV.',
    accept: 'Accepter',
    refuse: 'Refuser',
    hide: 'Masquer sur la TV',
    show: 'Afficher sur la TV',
    filtered: 'Masquée automatiquement : mot interdit',
  },
  // Son de la TV (spec 17) : réglages de l'hôte, avant la partie et pendant.
  sound: {
    sectionLabel: 'Son de la TV',
    music: { title: 'Musique', hint: 'Ambiance en boucle' },
    effects: { title: 'Effets', hint: 'Bruitages du jeu' },
    volumeLabel: 'Volume',
    volumeA11y: 'Volume du son de la TV',
    volumeValue: (volume: number) => `${volume} sur 100`,
    quickTitle: 'Son',
    // Ligne du salon : « Musique, effets · 60 », « Effets · 60 », « Son coupé ».
    summary: (music: boolean, effects: boolean, volume: number) => {
      if (!music && !effects) return 'Son coupé';
      const parts = music && effects ? 'Musique, effets' : music ? 'Musique seule' : 'Effets seuls';
      return `${parts} · ${volume}`;
    },
    publishFailed: 'Réglage du son non transmis à la TV. Vérifie la connexion.',
  },
  hostControls: {
    open: '⚙ Contrôles de l’hôte',
    title: 'Contrôles de l’hôte',
    close: 'Fermer',
    skip: {
      firstQuestion: 'Passer à la question 1',
      vote: 'Passer au vote',
      validation: 'Passer à la validation',
      reveal: 'Révéler la réponse',
      scores: 'Voir le classement',
      nextQuestion: 'Question suivante',
      finalRanking: 'Voir le classement final',
    } satisfies Record<SkipTarget, string>,
    // Pas à pas : gros bouton pendant l'attente, nommé d'après sa destination (même action que Passer).
    // Contrôle : gros bouton de la validation (avec les coches de l'hôte).
    validate: 'Valider les réponses',
    // Bluff, vote sans minuteur : l'hôte clôt le vote ; ceux qui n'ont pas voté n'ont pas de point de vote.
    closeVote: 'Clore le vote',
    closeVoteConfirm: (missing: number) => ({
      title: 'Clore le vote ?',
      message: `${missing} joueur${missing > 1 ? 's n’ont' : ' n’a'} pas voté. Clore quand même ?`,
      confirm: 'Clore',
      cancel: 'Attendre',
    }),
    // Joueurs connectés qui n'ont pas encore voté (« Léa, Tom et 3 autres »).
    voteMissing: (names: string[]) => {
      if (names.length === 0) return 'Tout le monde a voté.';
      const shown = names.length > 3 ? [...names.slice(0, 2), `${names.length - 2} autres`] : names;
      const list = shown.length > 1 ? `${shown.slice(0, -1).join(', ')} et ${shown[shown.length - 1]}` : shown[0];
      return `Pas encore voté : ${list}`;
    },
    next: {
      ranking: 'Voir le classement',
      nextQuestion: 'Question suivante',
      finalRanking: 'Classement final',
    } satisfies Record<AwaitingNext, string>,
    // Dessine-moi : la manche s'arrête, la réponse est donnée, personne ne marque de point.
    cancelDraw: 'Annuler la manche',
    cancelDrawConfirm: {
      title: 'Annuler la manche ?',
      message: 'Le mot sera donné et personne ne marquera de point pour cette manche.',
      confirm: 'Annuler la manche',
      cancel: 'Continuer',
    },
    pause: 'Pause',
    resume: 'Reprendre',
    end: 'Terminer la partie',
    // Bluff : masquer une proposition de joueur sur la TV et les téléphones (modération).
    bluffProposalsTitle: 'Propositions des joueurs',
    bluffProposalsHint: 'Masquée, une proposition s’affiche « ••• » sur la TV et les téléphones.',
    bluffAuthors: (names: string) => `par ${names}`,
    hideProposal: 'Masquer',
    showProposal: 'Afficher',
    endConfirm: {
      title: 'Terminer la partie ?',
      message: 'Le classement actuel sera le classement final.',
      confirm: 'Terminer',
      cancel: 'Continuer',
    },
    // Fin de partie : autre quiz ou autre jeu, sans nouveau salon (mêmes joueurs, même code).
    changeGame: 'Changer de jeu',
    quit: 'Quitter',
    quitConfirm: {
      title: 'Quitter la partie ?',
      message: 'Elle sera supprimée pour tous les joueurs.',
      confirm: 'Quitter',
      cancel: 'Rester',
    },
    actionFailed: 'L’action n’a pas pu être enregistrée. Réessaie.',
  },
  leaveGame: {
    title: 'Quitter la partie ?',
    message: 'Elle sera interrompue.',
    stay: 'Rester',
    leave: 'Quitter',
  },
  profile: {
    editButton: 'Modifier mon profil',
    submitButton: 'Enregistrer',
    submitting: 'Enregistrement…',
    cancelButton: 'Annuler',
    submitFailed: 'La modification n’a pas pu être enregistrée. La partie vient peut-être d’être lancée.',
    // Le profil affiché est celui lu dans la partie : il est exact même si l'écriture a échoué.
    editInterrupted: (avatar: string, name: string) =>
      `La partie a été lancée pendant la modification. Tu joues en tant que ${avatar} ${name}.`,
  },
  game: {
    awaitingHost: 'En attente de l’hôte pour la suite…',
    // Joueur dans l'appli : quitter la partie depuis un écran d'attente (jamais pendant une question).
    quit: {
      link: 'Quitter la partie',
      title: 'Quitter la partie ?',
      message: (code: string) => `Tu pourras revenir avec le code ${code}.`,
      confirm: 'Quitter',
      cancel: 'Rester',
    },
    // Site resté ouvert depuis une version plus ancienne que le jeu de la partie.
    outdated: {
      title: 'Nouveau jeu !',
      message: 'Cette partie utilise un jeu que cette page ne connaît pas encore. Recharge la page pour jouer.',
      reload: 'Recharger la page',
    },
    choiceLetters: ['A', 'B', 'C', 'D'],
    questionPill: (index: number, count: number | undefined) =>
      count ? `Question ${index + 1}/${count}` : `Question ${index + 1}`,
    // Dessine-moi : une manche plutôt qu'une question.
    roundPill: (index: number, count: number | undefined) =>
      count ? `Manche ${index + 1}/${count}` : `Manche ${index + 1}`,
    score: (points: number) => `${formatNumber(points)} pts`,
    // En-tête des questions (maquette S1) : « Question 3 / 10 » à gauche, « 18 s » à droite.
    questionProgress: (index: number, count: number | undefined, isRound: boolean) =>
      `${isRound ? 'Manche' : 'Question'} ${index + 1}${count ? ` / ${count}` : ''}`,
    secondsShort: (seconds: number) => `${seconds} s`,
    secondsLeft: (seconds: number) => `${seconds} seconde${seconds > 1 ? 's' : ''} restante${seconds > 1 ? 's' : ''}`,
    points: (points: number) => `${formatNumber(points)} point${points > 1 ? 's' : ''}`,
    formatNumber,
    ordinal: (rank: number) => (rank === 1 ? '1er' : `${rank}e`),
    starting: {
      title: 'Prêt ?',
      subtitle: 'Les questions s’affichent sur la télé',
      // Fin du 3-2-1 (même instant que sur la TV).
      go: 'GO !',
    },
    // Réponse libre (S1) : un champ, ou deux (titre et artiste) pour un blind test « both ».
    freeQuestion: {
      answerLabel: 'Ta réponse',
      titleLabel: 'Titre',
      artistLabel: 'Artiste',
      answerPlaceholder: 'Ta réponse ?',
      titlePlaceholder: 'Le titre ?',
      artistPlaceholder: 'L’artiste ?',
      counter: (length: number, max: number) => `${length} / ${max}`,
      hint: 'Un ou deux mots suffisent. Les majuscules et les accents n’ont pas d’importance.',
      bothHint: 'Un seul champ rempli suffit : tu gagnes la moitié des points pour chaque bonne partie.',
      asks: {
        title: 'Trouve le titre',
        artist: 'Trouve l’artiste',
        both: 'Trouve le titre ET l’artiste',
      } satisfies Record<BlindTestAsk, string>,
      submit: 'Valider',
    },
    question: {
      sending: 'Envoi de ta réponse…',
      refusals: {
        tooLate: 'Trop tard : ta réponse n’a pas été prise en compte, le temps était écoulé.',
        failed: 'Réseau coupé : ta réponse n’a pas été envoyée. Vérifie ta connexion et réessaie.',
      } satisfies Record<AnswerRefusal, string>,
    },
    // Attente entre deux questions : étapes, compte à rebours et annonce de la question suivante.
    transition: {
      steps: ['Réponse', 'Classement', 'Question suivante'],
      // Dernière question : la révélation mène directement au classement final.
      finalStep: 'Classement final',
      nextQuestionIn: (seconds: number) => `Prochaine question dans ${seconds} s`,
      // Dessine-moi : manches au lieu de questions.
      roundSteps: ['Réponse', 'Classement', 'Manche suivante'],
      nextRoundIn: (seconds: number) => `Prochaine manche dans ${seconds} s`,
      announceRound: (roundNumber: number, roundCount: number) => `Manche ${roundNumber}/${roundCount}`,
      finalRankingIn: (seconds: number) => `Classement final dans ${seconds} s`,
      announce: (questionNumber: number, questionCount: number) => `Question ${questionNumber}/${questionCount}`,
      announceHint: 'Prépare-toi !',
    },
    // Bluff (maquettes B1, B2, B3) : écrire une fausse réponse, attendre, voter, résultat.
    bluff: {
      // Consignes en tête de l'écriture et du vote (l'énoncé n'est pas affiché quand une TV est présente).
      writeInstruction: 'Bluff · Invente une fausse réponse',
      voteInstruction: 'Bluff · Quelle est la vraie réponse ?',
      // Vote sans minuteur (joueurs connectés et ceux qui ont déjà voté).
      votedCount: (count: number, total: number) => `${count}/${total} ont voté`,
      fieldLabel: 'Ta fausse réponse',
      placeholder: 'Une réponse crédible…',
      counter: (length: number, max: number) => `${length} / ${max}`,
      hint: 'Rends-la crédible : chaque joueur qui la choisira te rapporte des points.',
      send: 'Envoyer',
      sending: 'Envoi…',
      checking: 'Vérification de ta proposition…',
      refusals: {
        truth: 'Tu as trouvé la vraie réponse !',
        forbidden: 'Ce mot n’est pas autorisé.',
        empty: 'Écris une vraie réponse.',
      } satisfies Record<Exclude<BluffVerdict, 'ok'>, string>,
      retry: (left: number) => `Invente-en une fausse à la place. Il te reste ${left} essai${left > 1 ? 's' : ''}.`,
      sendFailed: 'Envoi impossible. Vérifie ta connexion, puis réessaie.',
      tooLate: 'Trop tard : le temps d’écriture est écoulé.',
      sentTitle: 'Proposition envoyée',
      exhaustedTitle: 'Plus d’essai',
      exhaustedText: 'Pas de proposition pour toi à cette question, mais tu pourras voter.',
      waiting: 'En attente des autres joueurs…',
      quoted: (text: string) => `« ${text} »`,
      mine: 'Ta proposition',
      voteButton: 'Je vote pour celle-ci',
      voteSentTitle: 'Vote envoyé',
      voteRefusals: {
        tooLate: 'Trop tard : le vote est terminé.',
        failed: 'Vote non envoyé. Vérifie ta connexion, puis réessaie.',
      } satisfies Record<AnswerRefusal, string>,
      found: 'Bien vu !',
      trapped: 'Piégé !',
      noVote: 'Pas de vote',
      points: (points: number) => `+${formatNumber(points)}`,
      foundText: 'Tu as trouvé la vraie réponse.',
      votedFor: (name: string) => `Tu as voté pour la proposition de ${name}.`,
      votedDecoy: 'Tu as voté pour un leurre.',
      noVoteText: 'Tu n’as pas voté.',
      butTrapped: (count: number) => `Mais ta proposition a piégé ${count} joueur${count > 1 ? 's' : ''}.`,
      truthLabel: 'La vraie réponse',
      ownTrappedStart: (text: string) => `Ta proposition « ${text} » a piégé `,
      ownTrappedEnd: (points: number) => ` : +${formatNumber(points)}`,
      ownNobody: 'Personne n’a voté pour ta proposition.',
      names: (names: string[]) => (names.length > 1 ? `${names.slice(0, -1).join(', ')} et ${names[names.length - 1]}` : (names[0] ?? '')),
    },
    answerSent: {
      title: 'Réponse envoyée !',
      // Saisie libre (maquette S2) : sans point d'exclamation, sur une ligne.
      freeTitle: 'Réponse envoyée',
      answeredProgress: (answered: number, total: number) => `${answered}/${total} ont répondu`,
      unknownChoice: 'Ta réponse est bien enregistrée.',
      waiting: 'En attente des autres joueurs…',
      // Réponse libre (S2) : rappel de la réponse tapée, qui ne peut plus changer.
      yourAnswer: 'Ta réponse',
      freeWaiting: 'Plus qu’à attendre les autres joueurs…',
      locked: 'Tu ne peux plus la modifier.',
      bothAnswer: (title: string, artist: string) => [title, artist].filter(Boolean).join(' – '),
    },
    // Série de bonnes réponses d'affilée (spec 18), sur l'écran de résultat, à partir de 3.
    streak: {
      notice: (count: number) => `Série de ${count} !`,
      badge: (count: number) => `Série de ${count}`,
    },
    reveal: {
      titles: {
        correct: 'Bonne réponse !',
        partial: 'À moitié !',
        wrong: 'Raté…',
        noAnswer: 'Trop tard',
      } satisfies Record<RevealOutcome, string>,
      correctAnswerLabel: 'La bonne réponse',
      // Réponse libre : bonne réponse et rappel de ce que le joueur a écrit (S2).
      partLabels: { title: 'Titre', artist: 'Artiste' },
      youWrote: (label: string, text: string) => `${label} · tu as écrit « ${text} »`,
      partPoints: (points: number) => `+${formatNumber(points)}`,
      speedIncluded: 'Bonus de rapidité compris dans les points.',
      coinPoints: (points: number) => `+${formatNumber(points)}`,
      coinLabel: 'points',
      speedBonus: (bonus: number) => `Bonus rapidité : +${bonus}`,
    },
    scores: {
      title: 'Classement',
      afterQuestion: (index: number) => `après la question ${index + 1}`,
      afterRound: (index: number) => `après la manche ${index + 1}`,
      me: 'Toi',
    },
    paused: {
      title: 'Pause',
      message: 'La partie va reprendre.',
    },
    ended: {
      title: 'Partie terminée !',
      myResult: 'Tu termines',
      finalRanking: 'Classement final',
      // Suspense : pendant le roulement de tambour de la TV, avant le classement final.
      suspense: 'Et le grand gagnant est…',
      suspenseTeams: 'Et l’équipe gagnante est…',
      suspenseHint: 'Regarde la TV !',
    },
    // Contrôle : pendant que l'hôte valide les réponses.
    validation: {
      title: 'L’hôte valide les réponses…',
      hint: 'Les points arrivent avec la réponse.',
    },
    waiting: 'Patiente un instant, la partie continue…',
  },
  // Accueil de l'hôte (maquette H1) : choix du jeu, puis son catalogue.
  home: {
    title: 'À quoi on joue ?',
    // Changer de jeu : accueil ouvert depuis la fin d'une partie, le salon reste ouvert.
    roomBanner: (code: string) => `Partie ${code} : choisis le prochain jeu. Les joueurs restent connectés.`,
    roomCancel: 'Annuler, revenir à la partie',
    subtitle: 'Choisis un jeu pour commencer.',
    // Maquette J1 : rejoindre la partie d'un autre hôte avec son code.
    joinWithCode: 'J’ai un code : rejoindre une partie',
    games: {
      quiz: { name: 'Quiz', hint: 'Réponds vite, marque plus.' },
      blindTest: { name: 'Blind test', hint: 'Titre et artiste, à l’oreille.' },
      bluff: { name: 'Bluff', hint: 'Invente la fausse réponse.' },
      draw: { name: 'Dessine-moi', hint: 'Dessine, les autres devinent.' },
    } satisfies Record<GameType, { name: string; hint: string }>,
    soonBadge: 'Bientôt',
    back: 'Retour à l’accueil',
  },
  // Dessine-moi (plan docs/plan-dessine-moi.md) : outils du dessinateur.
  draw: {
    // Maquette E1 : cinq outils ronds avec leur nom dessous.
    tools: { pen: 'Crayon', eraser: 'Gomme', bucket: 'Pot' },
    undoLabel: 'Annuler',
    clearLabel: 'Effacer',
    widths: ['Trait fin', 'Trait moyen', 'Trait épais'],
    widthTitle: 'Épaisseur',
    // App trop ancienne (sans le module de dessin) : rien à dessiner, on le dit.
    canvasMissing: 'Cette version de l’app ne sait pas encore dessiner : mets-la à jour.',
    // Zoom (maquettes E1 à E3) : affichage seulement, la TV voit toujours le dessin entier.
    zoomIn: 'Zoomer',
    zoomOut: 'Dézoomer',
    zoomFit: 'Voir tout le dessin',
    zoomPercent: (percent: number) => `${percent} %`,
    zoomHint: 'Deux doigts pour zoomer ou déplacer · un doigt pour dessiner',
    zoomHintShort: 'Deux doigts : zoomer et déplacer.',
    zoomBadge: (scale: number) => `Zoom ×${scale.toLocaleString('fr-FR')}`,
    zoomTvNote: 'La TV voit toujours le dessin en entier.',
    zoomTvNoteShort: 'La TV voit tout le dessin.',
    color: (index: number) => `Couleur ${index}`,
    undo: 'Annuler le dernier trait',
    clear: 'Tout effacer',
    // En-tête du dessinateur (E1) : manche, temps, carte « TON MOT ».
    youDraw: 'Tu dessines · ',
    yourWord: 'Ton mot',
    // Dessinateur : le mot, en grand au-dessus du canvas, masquable d'un tap sur l'œil.
    wordMask: '••••',
    hideWord: 'Masquer le mot',
    showWord: 'Afficher le mot',
    noLetters: 'Ni lettres ni chiffres !',
    wordLoading: '…',
    // Dessinateur : une fois par manche, avant le premier trait.
    changeWord: 'Changer de mot',
    // Les devineurs : un mot à la fois, jugé par l'hôte.
    drawing: (name: string) => `${name} dessine !`,
    hint: (category: string, letters: number) => `${category} · ${letters} lettres`,
    guessLabel: 'Ton idée',
    guessPlaceholder: 'Un mot…',
    send: 'Valider',
    checking: 'Vérification…',
    wrong: (text: string | null) => (text ? `« ${text} » : pas ça…` : 'Pas ça…'),
    close: (text: string | null) => (text ? `« ${text} » : tu es proche !` : 'Tu es proche !'),
    failed: 'Essai non envoyé : réessaie.',
    triesLeft: (left: number) => (left > 1 ? `Encore ${left} essais` : 'Dernier essai !'),
    exhausted: 'Plus d’essai pour cette manche.',
    found: 'Trouvé !',
    foundHint: 'Bravo ! Les points arrivent avec la réponse.',
    // Groupe : seule l'équipe du dessinateur devine.
    teamGuesses: (team: string) => `L’équipe ${team} devine. Regarde la TV !`,
    // Révélation.
    itWas: 'C’était…',
    drawnBy: (name: string) => `Dessiné par ${name}`,
    cancelled: 'Manche annulée : aucun point.',
    guessPoints: (points: number) => `Trouvé : +${formatNumber(points)} pts`,
    notFound: 'Pas trouvé cette fois.',
    // Groupe : le joueur d'une autre équipe regardait.
    otherTeamRound: (team: string) => `Manche de l’équipe ${team} : ton équipe joue à son tour.`,
    drawerPoints: (points: number) =>
      points > 0 ? `Ton dessin te rapporte +${formatNumber(points)} pts` : 'Personne n’a trouvé ton dessin.',
    // App de l'hôte : l'hôte qui joue ne dessine pas (décision D1).
  },
  // Prototype du dessin (lot 1, développement seulement) : /debug/draw.
  drawDemo: {
    title: 'Dessine-moi · prototype',
    hint: 'Rien n’est envoyé : le dessin est enregistré sur ce téléphone, pour le banc d’essai de la TV.',
    stats: (ops: number, chunks: number, kilobytes: string) => `${ops} opérations · ${chunks} paquets · ${kilobytes} Ko`,
    export: 'Exporter le dessin',
    exportHint: 'Tout sélectionner, copier, puis coller dans un fichier (receiver/src/lib/drawing/benchRecording.json).',
    restart: 'Recommencer',
  },
  playerDemo: {
    title: 'Démo : écrans du joueur',
    hint: 'Données factices, sans Firebase. Les appuis sur les propositions sont simulés.',
    open: 'Démo',
    close: 'Fermer',
    validated: 'Démo : réponses validées (rien n’est écrit dans la base).',
  },
};

// Nombres à la française : espace fine insécable entre les milliers (1 242).
function formatNumber(value: number): string {
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}
