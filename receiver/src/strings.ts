import type { Difficulty, GameStatus } from '@shared/types'

// Textes affichés sur la TV, regroupés ici pour faciliter la traduction.
export const strings = {
  appName: "Quiz'in",
  lobby: {
    scanToJoin: 'Scannez pour rejoindre',
    orEnterCode: 'ou saisissez le code',
    playerCount: (count: number, max: number) => `${count} / ${max} joueurs`,
    waitingForPlayers: 'En attente des joueurs…',
  },
  starting: {
    getReady: 'Préparez-vous !',
  },
  question: {
    progress: (index: number, total: number) => `Question ${index} / ${total}`,
    answeredCount: (count: number, total: number) => `${count} / ${total} ont répondu`,
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
    answerCount: (count: number) => (count > 1 ? `${count} réponses` : `${count} réponse`),
    noAnswer: 'Personne n’a répondu',
  },
  scores: {
    title: 'Classement',
  },
  end: {
    title: 'Classement final',
  },
  paused: {
    title: 'Pause',
    subtitle: 'La partie reprendra dans un instant',
  },
  status: {
    loadingTitle: 'Connexion à la partie…',
    notFoundTitle: 'Partie introuvable',
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
    rank: (rank: number) => (rank === 1 ? '1er' : `${rank}e`),
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
