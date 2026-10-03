import type { Difficulty, GameStatus } from '@shared/types'

// Textes affichés sur la TV, regroupés ici pour faciliter la traduction.
export const strings = {
  appName: "Quiz'in",
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
    freeAnswerHint: 'Écrivez votre réponse sur votre téléphone',
  },
  difficulty: {
    1: 'Facile',
    2: 'Moyen',
    3: 'Difficile',
  } satisfies Record<Difficulty, string>,
  choiceLetters: ['A', 'B', 'C', 'D'],
  reveal: {
    title: 'La bonne réponse',
    // Nombre de joueurs ayant choisi chaque proposition.
    choiceCount: (count: number) => String(count),
    noAnswer: 'Personne n’a répondu',
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
    subtitle: 'La partie reprendra dans un instant',
  },
  // Pendant l'absence de l'hôte (coupure), spec 6.6.
  waitingHost: {
    title: 'En attente de l’hôte…',
    message: 'La partie reprendra dès qu’il sera de retour.',
  },
  hostAway: {
    title: 'L’hôte a perdu la connexion…',
    message: 'La partie reprendra à son retour.',
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
      reveal: 'Révélation',
      scores: 'Classement',
      paused: 'Pause',
      ended: 'Fin',
    } satisfies Record<Exclude<GameStatus, 'validation'>, string>,
    modeChoice: 'Mode : choix multiples',
    modeFree: 'Mode : réponse libre',
    addAnswer: (count: number, max: number) => `+1 réponse (${count}/${max})`,
    resetAnswers: 'Réinitialiser les réponses',
    playerConnection: (name: string, isConnected: boolean) =>
      `${name} : ${isConnected ? 'connecté' : 'déconnecté'}`,
  },
}
