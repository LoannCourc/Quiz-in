import {
  DEV_SHORT_GAME_QUESTIONS,
  MAX_PLAYERS,
  MIN_PLAYERS,
  MIN_TEAM_GAME_PLAYERS,
  MIN_TEAM_SIZE,
  PLAYER_NAME_MAX_LENGTH,
  PLAYER_NAME_MIN_LENGTH,
} from '@shared/constants';
import type { CatalogRowId } from '@shared/catalogRows';
import type { AwaitingNext, LaunchRefusal, SkipTarget } from '@shared/hostEngine';
import type { GameOption } from '@shared/quizCatalog';
import type { ReviewBadge } from '@shared/validationReview';
import type { AnswerMode, BlindTestAsk, BluffVerdict, DifficultyLevel, QuizAudience, TeamId, TeamMode } from '@shared/types';

import type { JoinRefusal } from '@/lib/joinGame';
import type { AnswerRefusal, RevealOutcome } from '@/lib/playerGame';

// Types de jeu du sélecteur du catalogue : seul le quiz est jouable au MVP.
export type GameType = 'quiz' | 'blindTest' | 'bluff';

// Textes affichés à l'écran, regroupés ici pour faciliter la traduction.
export const strings = {
  counter: {
    title: 'Compteur partagé',
    loading: 'Connexion…',
    incrementButton: '+1',
    errorPrefix: 'Erreur :',
  },
  join: {
    appName: "Quiz'in",
    codeTitle: 'Rejoindre une partie',
    codeLabel: 'Code affiché sur la TV',
    codePlaceholder: 'ABCD',
    codeButton: 'Continuer',
    invalidCode: 'Ce code n’est pas valide. Vérifie les 4 caractères affichés sur la TV.',
    loading: 'Connexion à la partie…',
    nameLabel: 'Ton pseudo',
    namePlaceholder: 'Ex. : Léa',
    nameHint: `${PLAYER_NAME_MIN_LENGTH} à ${PLAYER_NAME_MAX_LENGTH} caractères`,
    avatarLabel: 'Ton avatar',
    submitButton: 'Rejoindre',
    submitting: 'Inscription…',
    roomLabel: (code: string) => `Partie ${code}`,
    otherCodeButton: 'Saisir un autre code',
    refusals: {
      notFound: 'Partie introuvable. Vérifie le code affiché sur la TV.',
      alreadyStarted: 'Cette partie a déjà commencé. Il n’est plus possible de la rejoindre.',
      ended: 'Cette partie est terminée.',
      full: `Cette partie est complète (${MAX_PLAYERS} joueurs maximum).`,
      nameTaken: 'Ce pseudo est déjà pris dans cette partie. Choisis-en un autre.',
    } satisfies Record<JoinRefusal, string>,
    joinFailed: 'Impossible de rejoindre la partie, réessaie.',
    gameOver: 'La partie est terminée. Merci d’avoir joué !',
    submitFailed: 'L’inscription a échoué. Réessaie dans un instant.',
  },
  lobby: {
    inLobbyTitle: 'Tu es dans la partie !',
    waiting: 'En attente du lancement…',
  },
  about: {
    link: 'À propos et crédits',
    title: 'À propos',
    version: (version: string) => `Quiz’in, version ${version}`,
    tagline: 'Le quiz des soirées entre amis et en famille : l’hôte affiche la partie sur la TV, chacun répond sur son téléphone.',
    creditsTitle: 'Crédits',
    credits: [
      'Questions et quiz : originaux, rédigés pour Quiz’in.',
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
      'Jingles du classement et de la fin : Bomb Sound (Pixabay).',
      'Effets sonores : créés pour Quiz’in.',
    ],
    back: 'Retour au catalogue',
  },
  catalog: {
    loading: 'Chargement du catalogue…',
    errorPrefix: 'Erreur de chargement :',
    emptyCatalog: 'Aucun quiz disponible.',
    noMatch: 'Aucun quiz pour ce thème.',
    allThemes: 'Tout',
    search: 'Rechercher un quiz',
    searchPlaceholder: 'Titre du quiz',
    closeSearch: 'Fermer la recherche',
    noSearchResult: 'Aucun quiz ne porte ce titre.',
    gameTypes: { quiz: 'Quiz', blindTest: 'Blind test', bluff: 'Bluff' } satisfies Record<GameType, string>,
    soon: 'bientôt',
    gameTypeSoon: (label: string) => `${label}, bientôt disponible`,
    rows: {
      featured: 'Top 10 cette semaine',
      new: 'Nouveautés',
      easy: 'Faciles, pour tout le monde',
      experts: 'Pour les experts',
    } satisfies Record<CatalogRowId, string>,
    posterLabel: (title: string, rank?: number) => (rank === undefined ? title : `${rank}. ${title}`),
    demoCatalogLink: 'Outils de développement : catalogue fictif',
    difficultyLevels: { easy: 'Facile', medium: 'Moyen', hard: 'Difficile' } satisfies Record<DifficultyLevel, string>,
    debugLink: 'Outils de développement : compteur partagé',
    playerDemoLink: 'Outils de développement : écrans du joueur',
    resumeGame: (code: string) => `Reprendre la partie ${code}`,
  },
  quizSetup: {
    loading: 'Chargement du quiz…',
    notFound: 'Ce quiz n’existe pas.',
    backToCatalog: 'Retour au catalogue',
    answerModeLabel: 'Comment répond-on ?',
    answerModes: {
      choice: 'Choix multiples',
      free: 'Réponse libre',
      bluff: 'Bluff',
    } satisfies Record<AnswerMode, string>,
    answerModeHints: {
      choice: '4 propositions',
      free: 'On tape la réponse',
      bluff: 'On invente une fausse réponse',
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
    meta: (questionCount: number, minutes: number | null) =>
      `${questionCount} questions · ${minutes === null ? 'à votre rythme' : `environ ${minutes} min`} · jusqu’à ${MAX_PLAYERS} joueurs`,
    audiences: { all: 'Tout public', kids: 'Enfants', experts: 'Experts' } satisfies Record<QuizAudience, string>,
    settingsTitle: 'Réglages de la partie',
    audioCredit: 'Extrait audio et informations : Deezer',
    blindTestUnavailable: 'Le blind test n’est pas disponible pour le moment.',
    speedBonusOn: 'Rapidité activée',
    speedBonusOff: 'sans Rapidité',
    settingsCardLabel: (summary: string) => `Réglages de la partie : ${summary}. Modifier`,
    settingsDone: 'Terminé',
    createButton: 'Choisir ce quiz',
    creating: 'Création…',
    noFreeCode: 'Impossible de trouver un code de partie libre. Réessaie.',
    createFailed: 'La partie n’a pas pu être créée :',
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
    },
    // Page « Équipes » plein écran (maquette E1) : une consigne d'une phrase en haut, selon l'état.
    page: {
      back: 'Retour au salon',
      validate: 'Valider les équipes',
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
    noTvLink: 'Je n’ai pas de TV',
    playersTitle: 'Joueurs',
    connectedCount: (count: number) => `${count} connecté${count > 1 ? 's' : ''}`,
    hostBadge: 'Hôte',
    editProfileLink: 'Modifier',
    codeAccessibility: (code: string) => `Code de la partie : ${code.split('').join(' ')}`,
    noTv: {
      title: 'Rejoindre sans TV',
      hide: 'Masquer',
      linkLabel: 'Lien',
      shareButton: 'Partager',
      shareMessage: (url: string) => `Rejoins ma partie Quiz’in : ${url}`,
      qrLabel: (url: string) => `QR code du lien ${url}`,
      planBLink: 'Écran sur un PC : copier le lien de l’écran',
      planBCopied: 'Lien de l’écran copié : ouvre-le en plein écran sur le PC.',
    },
    copyButton: 'Copier le lien',
    copied: 'Lien copié !',
    copyFailed: 'Copie impossible : sélectionne le lien à la main.',
    noPlayers: 'Aucun joueur pour l’instant. Ils rejoignent en scannant le QR code de la TV.',
    hostJoinTitle: 'Toi aussi, tu joues !',
    // TV connectée : le bloc code, QR et lien se réduit à une barre (maquette L1).
    tvBar: {
      connected: 'TV connectée',
      codeLabel: 'Code de la partie : ',
      details: 'Détails',
      hide: 'Masquer',
      // Sans TV connectée : bloc du code réductible en une ligne « Code B9CX · Détails ».
      collapse: 'Réduire',
      codeShort: 'Code ',
      intro: 'Les joueurs scannent le QR code ou ouvrent le lien.',
    },
    // Hôte pas encore inscrit (maquette L1).
    hostCard: {
      title: 'Tu n’es pas dans la partie',
      hint: 'Pseudo et avatar, comme les autres joueurs',
      button: 'Je joue aussi',
    },
    launchButton: 'Lancer la partie',
    launching: 'Lancement…',
    loadingQuestions: 'Chargement des questions…',
    preparingAudio: 'Préparation des extraits audio…',
    questionsError: 'Impossible de charger les questions du quiz. Vérifie ta connexion.',
    launchFailed: 'Le lancement a échoué. Réessaie dans un instant.',
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
    shortGame: {
      title: `Partie courte (${DEV_SHORT_GAME_QUESTIONS} questions)`,
      hint: 'Développement uniquement, absent de l’app publiée.',
    },
  },
  // Cast de l'hôte vers la TV (spec 4.1 et 6.6).
  cast: {
    showButton: 'Afficher sur la TV',
    iconLabel: 'Choisir la TV',
  },
  hostGame: {
    inProgressTitle: 'Partie en cours',
    spectatorHint: 'Tu ne joues pas cette partie : suis-la sur la TV.',
    returnedFromAbsence: 'Tu étais absent : la partie est en pause. Reprends quand tout le monde est prêt.',
    gameDeleted: 'La partie a été supprimée : tu as été absent trop longtemps.',
    connectionLost: 'Connexion perdue… la partie est en attente',
    castInterrupted: 'Cast interrompu : reconnecte la TV, puis reprends',
    connectionLostHint: 'Elle sera mise en pause dès le retour du réseau.',
    backToCatalog: 'Retour au catalogue',
  },
  // Joueurs : phase bloquée depuis plus de 5 s (coupure de l'hôte pas encore détectée).
  waitingHost: {
    title: 'En attente de l’hôte…',
    message: 'La partie va reprendre.',
  },
  // Joueurs pendant l'absence de l'hôte (coupure), spec 6.6.
  hostAway: {
    title: 'L’hôte a perdu la connexion…',
    message: 'La partie va reprendre.',
    deletionIn: (time: string) => `Sans retour de l’hôte, la partie sera supprimée dans ${time}.`,
  },
  // Contrôle (maquette V1) : validation des réponses libres par l'hôte avant la révélation.
  hostValidation: {
    steps: ['Question', 'Validation', 'Révélation'],
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
    next: {
      ranking: 'Voir le classement',
      nextQuestion: 'Question suivante',
      finalRanking: 'Classement final',
    } satisfies Record<AwaitingNext, string>,
    pause: 'Pause',
    resume: 'Reprendre',
    end: 'Terminer la partie',
    endConfirm: {
      title: 'Terminer la partie ?',
      message: 'Le classement actuel sera le classement final.',
      confirm: 'Terminer',
      cancel: 'Continuer',
    },
    replay: 'Rejouer',
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
    choiceLetters: ['A', 'B', 'C', 'D'],
    questionPill: (index: number, count: number | undefined) =>
      count ? `Question ${index + 1}/${count}` : `Question ${index + 1}`,
    score: (points: number) => `${formatNumber(points)} pts`,
    secondsLeft: (seconds: number) => `${seconds} seconde${seconds > 1 ? 's' : ''} restante${seconds > 1 ? 's' : ''}`,
    points: (points: number) => `${formatNumber(points)} point${points > 1 ? 's' : ''}`,
    formatNumber,
    ordinal: (rank: number) => (rank === 1 ? '1er' : `${rank}e`),
    starting: {
      title: 'Prêt ?',
      subtitle: 'Les questions s’affichent sur la télé',
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
      steps: ['Révélation', 'Classement', 'Question suivante'],
      nextQuestionIn: (seconds: number) => `Prochaine question dans ${seconds} s`,
      finalRankingIn: (seconds: number) => `Classement final dans ${seconds} s`,
      announce: (questionNumber: number, questionCount: number) => `Question ${questionNumber}/${questionCount}`,
      announceHint: 'Prépare-toi !',
    },
    // Bluff (maquettes B1, B2, B3) : écrire une fausse réponse, attendre, voter, résultat.
    bluff: {
      writeBadge: 'Bluff · Invente une fausse réponse',
      voteBadge: 'Bluff · Quelle est la vraie réponse ?',
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
      pickHint: 'Touche la réponse que tu crois vraie.',
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
      answeredProgress: (answered: number, total: number) => `${answered}/${total} ont répondu`,
      unknownChoice: 'Ta réponse est bien enregistrée.',
      waiting: 'En attente des autres joueurs…',
      // Réponse libre (S2) : rappel de la réponse tapée, qui ne peut plus changer.
      yourAnswer: 'Ta réponse',
      freeWaiting: 'Plus qu’à attendre les autres joueurs…',
      locked: 'Tu ne peux plus la modifier.',
      bothAnswer: (title: string, artist: string) => [title, artist].filter(Boolean).join(' – '),
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
    },
    // Contrôle : pendant que l'hôte valide les réponses.
    validation: {
      title: 'L’hôte valide les réponses…',
      hint: 'Les points arrivent à la révélation.',
    },
    waiting: 'Patiente un instant, la partie continue…',
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
