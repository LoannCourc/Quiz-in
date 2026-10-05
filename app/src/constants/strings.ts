import {
  DEV_SHORT_GAME_QUESTIONS,
  MAX_PLAYERS,
  MIN_PLAYERS,
  PLAYER_NAME_MAX_LENGTH,
  PLAYER_NAME_MIN_LENGTH,
} from '@shared/constants';
import type { CatalogRowId } from '@shared/catalogRows';
import type { AwaitingNext, LaunchRefusal, SkipTarget } from '@shared/hostEngine';
import type { GameOption } from '@shared/quizCatalog';
import type { AnswerMode, DifficultyLevel, QuizAudience } from '@shared/types';

import type { JoinRefusal } from '@/lib/joinGame';
import type { AnswerRefusal, RevealOutcome } from '@/lib/playerGame';

// Types de jeu du sélecteur du catalogue : seul le quiz est jouable au MVP.
export type GameType = 'quiz' | 'blindTest' | 'lyrics';

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
    playerCount: (count: number) => `${count} joueur${count > 1 ? 's' : ''} connecté${count > 1 ? 's' : ''}`,
    you: '(toi)',
    inLobbyTitle: 'Tu es dans la partie !',
    questionsOnTv: 'Les questions s’affichent sur la télé',
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
    gameTypes: { quiz: 'Quiz', blindTest: 'Blind test', lyrics: 'Paroles' } satisfies Record<GameType, string>,
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
    } satisfies Record<AnswerMode, string>,
    answerModeHints: {
      choice: '4 propositions',
      free: 'On tape la réponse',
    } satisfies Record<AnswerMode, string>,
    optionsLabel: 'Options',
    rhythmLabel: 'Rythme',
    stepByStep: { title: 'Pas à pas', hint: 'Tu passes à la suite' },
    suspense: { title: 'Suspense', hint: 'Classement à la fin' },
    options: {
      speedBonus: { title: 'Rapidité', hint: 'Points bonus' },
      control: { title: 'Contrôle', hint: 'Valider' },
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
    launchButton: 'Lancer la partie',
    launching: 'Lancement…',
    loadingQuestions: 'Chargement des questions…',
    preparingAudio: 'Préparation des extraits audio…',
    questionsError: 'Impossible de charger les questions du quiz. Vérifie ta connexion.',
    launchFailed: 'Le lancement a échoué. Réessaie dans un instant.',
    launchRefusals: {
      notLobby: 'La partie est déjà lancée.',
      freeAnswerSoon: 'Réponse libre : bientôt. Choisis Choix multiples pour jouer.',
      notEnoughPlayers: `Il faut au moins ${MIN_PLAYERS} joueurs connectés, toi compris.`,
      tooManyPlayers: `${MAX_PLAYERS} joueurs au maximum dans une partie.`,
      noQuestions: 'Ce quiz n’a pas de question jouable.',
      blindTestDisabled: 'Le blind test n’est pas disponible pour le moment.',
      audioUnavailable: 'Extraits audio indisponibles. Vérifie ta connexion, puis réessaie.',
    } satisfies Record<LaunchRefusal, string>,
    shortGame: {
      title: `Partie courte (${DEV_SHORT_GAME_QUESTIONS} questions)`,
      hint: 'Développement uniquement, absent de l’app publiée.',
    },
  },
  // Cast de l'hôte vers la TV (spec 4.1 et 6.6).
  cast: {
    showButton: 'Afficher sur la TV',
    connectedButton: 'TV connectée',
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
  hostControls: {
    open: '⚙ Contrôles de l’hôte',
    title: 'Contrôles de l’hôte',
    close: 'Fermer',
    skip: {
      firstQuestion: 'Passer à la question 1',
      validation: 'Valider les réponses',
      reveal: 'Révéler la réponse',
      scores: 'Voir le classement',
      nextQuestion: 'Question suivante',
      finalRanking: 'Voir le classement final',
    } satisfies Record<SkipTarget, string>,
    // Pas à pas : gros bouton pendant l'attente, nommé d'après sa destination (même action que Passer).
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
    answerSent: {
      title: 'Réponse envoyée !',
      answeredProgress: (answered: number, total: number) => `${answered}/${total} ont répondu`,
      unknownChoice: 'Ta réponse est bien enregistrée.',
      waiting: 'En attente des autres joueurs…',
    },
    reveal: {
      titles: {
        correct: 'Bonne réponse !',
        wrong: 'Raté…',
        noAnswer: 'Trop tard',
      } satisfies Record<RevealOutcome, string>,
      correctAnswerLabel: 'La bonne réponse',
      coinPoints: (points: number) => `+${formatNumber(points)}`,
      coinLabel: 'points',
      speedBonus: (bonus: number) => `Bonus rapidité : +${bonus}`,
      placeLabel: 'Ta place',
      placeChange: (before: string, after: string, arrow: string) => `${before} → ${after} ${arrow}`,
      arrows: { up: '▲', down: '▼' },
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
    // État de l'option Contrôle (P1), pas encore développée.
    waiting: 'Patiente un instant, la partie continue…',
  },
  playerDemo: {
    title: 'Démo : écrans du joueur',
    hint: 'Données factices, sans Firebase. Les appuis sur les propositions sont simulés.',
    open: 'Démo',
    close: 'Fermer',
  },
};

// Nombres à la française : espace fine insécable entre les milliers (1 242).
function formatNumber(value: number): string {
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}
