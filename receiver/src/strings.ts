import type { AnswerVerdict, AudioSourceId, BlindTestAsk, Difficulty, GameStatus } from '@shared/types'

// Textes affichés sur la TV, regroupés ici pour faciliter la traduction.
export const strings = {
  appName: "Quiz'in",
  // Pas à pas : révélation et classement restent affichés jusqu'à l'action de l'hôte.
  awaitingHost: 'En attente de l’hôte pour la suite…',
  lobby: {
    scanToJoin: 'Scannez pour rejoindre',
    orEnterCode: 'ou saisissez le code',
    playerCount: (count: number, max: number) => `${count}/${max} joueurs`,
    waitingForPlayers: 'En attente des joueurs…',
  },
  header: {
    joinAt: (host: string) => `${host} · code`,
  },
  starting: {
    getReady: 'Prêts ?',
    firstQuestion: 'La première question arrive…',
  },
  question: {
    progress: (index: number, total: number | undefined) => (total ? `Question ${index}/${total}` : `Question ${index}`),
    answeredCount: (count: number, total: number) => `${count}/${total} ont répondu`,
    noConnectedPlayers: '—',
    // Réponse libre : à la place des propositions, ce qu'il faut écrire (blind test : selon ask).
    freeAnswerHint: {
      answer: 'Écrivez votre réponse sur votre téléphone',
      title: 'Écrivez le titre sur votre téléphone',
      artist: 'Écrivez l’artiste sur votre téléphone',
      both: 'Écrivez le titre et l’artiste sur votre téléphone',
    } satisfies Record<BlindTestAsk | 'answer', string>,
  },
  difficulty: {
    1: 'Facile',
    2: 'Moyen',
    3: 'Difficile',
  } satisfies Record<Difficulty, string>,
  choiceLetters: ['A', 'B', 'C', 'D'],
  // Contrôle : l'hôte valide les réponses (aucun texte de joueur avant la révélation).
  validation: {
    title: 'L’hôte valide les réponses…',
    received: (count: number) => `${count} réponse${count > 1 ? 's' : ''} reçue${count > 1 ? 's' : ''}`,
  },
  reveal: {
    title: 'La bonne réponse',
    // Nombre de joueurs ayant choisi chaque proposition.
    choiceCount: (count: number) => String(count),
    noAnswer: 'Personne n’a répondu',
    // Réponse libre : réponses des joueurs regroupées, à côté de la bonne réponse.
    freeAnswersTitle: 'Vos réponses',
    verdictMarks: { correct: '✓', partial: '½', wrong: '✕' } satisfies Record<AnswerVerdict, string>,
  },
  // Attente entre deux questions : étapes, compte à rebours et annonce de la question suivante.
  transition: {
    steps: ['Révélation', 'Classement', 'Question suivante'],
    nextQuestionIn: (seconds: number) => `Prochaine question dans ${seconds}…`,
    finalRankingIn: (seconds: number) => `Classement final dans ${seconds}…`,
    announce: (questionNumber: number, questionCount: number) => `Question ${questionNumber}/${questionCount}`,
    announceHint: 'Préparez-vous !',
  },
  scores: {
    title: 'Classement',
    afterQuestion: (index: number) => `après la question ${index}`,
  },
  end: {
    title: 'Partie terminée !',
  },
  paused: {
    title: 'Pause',
    subtitle: 'La partie va reprendre.',
  },
  // Pendant l'absence de l'hôte (coupure), spec 6.6.
  waitingHost: {
    title: 'En attente de l’hôte…',
    message: 'La partie va reprendre.',
  },
  // Mode Cast : la TV attend le code envoyé par l’app de l’hôte.
  cast: {
    waitingTitle: 'En attente de la partie…',
    waitingHint: 'Sur le téléphone de l’hôte, appuyez sur « Afficher sur la TV ».',
    errorTitle: 'Impossible de démarrer l’affichage',
    errorHint: 'Relancez l’affichage depuis le téléphone de l’hôte.',
  },
  // Blind test : le son n'est joué que par la TV ; rien ne révèle le morceau avant la révélation.
  blindTest: {
    listening: 'Écoutez bien…',
    unavailable: 'Extrait indisponible',
    unavailableHint: 'L’hôte peut passer la question.',
    unlockTitle: 'Cliquez sur cet écran pour activer le son',
    unlockHint: 'Un seul clic suffit pour toute la partie.',
    credits: { deezer: 'Extrait audio et informations : Deezer' } satisfies Record<AudioSourceId, string>,
  },
  // Diagnostic du son (cast-sender.html) : la lecture démarre-t-elle sans geste sur cette TV ?
  audioTest: {
    title: 'Test du son',
    loading: 'Chargement de l’extrait…',
    playing: (delayMs: number) => `Lecture en cours (démarrée en ${delayMs} ms)`,
    finished: (seconds: number) => `Lecture terminée (${seconds} s)`,
    blocked: 'Lecture bloquée : la TV demande un geste de l’utilisateur.',
    failed: 'Lecture impossible : adresse expirée, réseau ou format.',
  },
  hostAway: {
    title: 'L’hôte a perdu la connexion…',
    message: 'La partie va reprendre.',
    deletionIn: (time: string) => `Sans retour de l’hôte, la partie sera supprimée dans ${time}.`,
  },
  status: {
    loadingTitle: 'Connexion à la partie…',
    notFoundTitle: 'Partie introuvable',
    gameOverTitle: 'La partie est terminée',
    gameOverHint: 'Merci d’avoir joué !',
    notFoundHint: (code: string) =>
      `Aucune partie en cours avec le code ${code}. Vérifiez le code affiché dans l’app de l’hôte.`,
    invalidCodeTitle: 'Code de salle invalide',
    invalidCodeHint: (code: string) => `« ${code} » n’est pas un code de salle valide.`,
    connectionLostTitle: 'Connexion perdue',
    connectionLostHint: 'Reconnexion en cours…',
    errorTitle: 'Impossible d’afficher la partie',
    errorHints: {
      missingConfig: 'La configuration Firebase du récepteur est incomplète.',
      permissionDenied: 'La base de données refuse la lecture de cette partie.',
      other: 'Une erreur inattendue est survenue.',
    },
  },
  ranking: {
    points: (points: number) => `${points} pts`,
    gained: (points: number) => `+${points}`,
  },
  dev: {
    title: 'Démo',
    statuses: {
      lobby: 'Lobby',
      starting: '3-2-1',
      question: 'Question',
      validation: 'Validation',
      reveal: 'Révélation',
      scores: 'Classement',
      paused: 'Pause',
      ended: 'Fin',
    } satisfies Record<GameStatus, string>,
    modeChoice: 'Mode : choix multiples',
    modeFree: 'Mode : réponse libre',
    addAnswer: (count: number, max: number) => `+1 réponse (${count}/${max})`,
    resetAnswers: 'Réinitialiser les réponses',
    playerConnection: (name: string, isConnected: boolean) =>
      `${name} : ${isConnected ? 'connecté' : 'déconnecté'}`,
  },
}
