import { MAX_PLAYERS, MIN_PLAYERS, PLAYER_NAME_MAX_LENGTH, PLAYER_NAME_MIN_LENGTH } from '@shared/constants';
import type { GameOption } from '@shared/quizCatalog';
import type { AnswerMode, Difficulty, DifficultyLevel } from '@shared/types';

import type { JoinRefusal } from '@/lib/joinGame';
import type { AnswerRefusal } from '@/lib/playerGame';

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
    errorPrefix: 'Erreur de connexion :',
    submitFailed: 'L’inscription a échoué. Réessaie dans un instant.',
  },
  lobby: {
    playerCount: (count: number) => `${count} joueur${count > 1 ? 's' : ''} connecté${count > 1 ? 's' : ''}`,
    you: '(toi)',
    waiting: 'En attente du lancement…',
  },
  catalog: {
    title: 'Choisis un quiz',
    loading: 'Chargement du catalogue…',
    errorPrefix: 'Erreur de chargement :',
    emptyCatalog: 'Aucun quiz disponible.',
    noMatch: 'Aucun quiz ne correspond à ces filtres.',
    themeFilter: 'Thème',
    difficultyFilter: 'Difficulté',
    all: 'Tous',
    difficultyLevels: { easy: 'Facile', medium: 'Moyen', hard: 'Difficile' } satisfies Record<DifficultyLevel, string>,
    difficulty: (level: string, average: number) => `${level} (${String(average).replace('.', ',')})`,
    details: (questionCount: number, minutes: number) => `${questionCount} questions · environ ${minutes} min`,
    debugLink: 'Outils de développement : compteur partagé',
    playerDemoLink: 'Outils de développement : écrans du joueur',
  },
  quizSetup: {
    loading: 'Chargement du quiz…',
    notFound: 'Ce quiz n’existe pas.',
    backToCatalog: 'Retour au catalogue',
    answerModeLabel: 'Mode de réponse',
    answerModes: {
      choice: 'Choix multiples',
      free: 'Réponse libre',
    } satisfies Record<AnswerMode, string>,
    answerModeHints: {
      choice: 'Les joueurs choisissent parmi 4 propositions.',
      free: 'Les joueurs écrivent leur réponse.',
    } satisfies Record<AnswerMode, string>,
    optionsLabel: 'Options',
    options: {
      speedBonus: { title: 'Rapidité', hint: 'Plus de points pour les réponses rapides.' },
      control: { title: 'Contrôle', hint: 'Les joueurs valident les réponses libres.' },
      teams: { title: 'Groupe', hint: 'On joue en équipes.' },
    } satisfies Record<GameOption, { title: string; hint: string }>,
    comingSoon: 'bientôt',
    incompatible: 'incompatible avec ces réglages',
    createButton: 'Créer la partie',
    creating: 'Création…',
    noFreeCode: 'Impossible de trouver un code de partie libre. Réessaie.',
    createFailed: 'La partie n’a pas pu être créée :',
  },
  hostLobby: {
    loading: 'Chargement de la partie…',
    notHost: 'Partie introuvable, ou tu n’en es pas l’hôte.',
    codeLabel: 'Code de la partie',
    receiverLabel: 'Écran TV : ouvre ce lien sur la TV ou un navigateur',
    copyButton: 'Copier le lien',
    copied: 'Lien copié !',
    copyFailed: 'Copie impossible : sélectionne le lien à la main.',
    noPlayers: 'Aucun joueur pour l’instant. Ils rejoignent en scannant le QR code de la TV.',
    hostJoinTitle: 'Toi aussi, tu joues !',
    launchButton: 'Lancer la partie',
    launchSoon: 'Le lancement arrivera à la prochaine étape.',
    notEnoughPlayers: `Il faut au moins ${MIN_PLAYERS} joueurs connectés, toi compris.`,
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
    choiceLetters: ['A', 'B', 'C', 'D'],
    questionLabel: (index: number) => `Question ${index + 1}`,
    difficulties: { 1: 'Facile', 2: 'Moyen', 3: 'Difficile' } satisfies Record<Difficulty, string>,
    secondsLeft: (seconds: number) => `${seconds} seconde${seconds > 1 ? 's' : ''} restante${seconds > 1 ? 's' : ''}`,
    points: (points: number) => `${points} point${points > 1 ? 's' : ''}`,
    ordinal: (rank: number) => (rank === 1 ? '1er' : `${rank}e`),
    starting: {
      title: 'Prépare-toi !',
      subtitle: 'La première question arrive…',
    },
    question: {
      sending: 'Envoi de ta réponse…',
      refusals: {
        tooLate: 'Trop tard : ta réponse n’a pas été prise en compte, le temps était écoulé.',
        failed: 'Réseau coupé : ta réponse n’a pas été envoyée. Vérifie ta connexion et réessaie.',
      } satisfies Record<AnswerRefusal, string>,
    },
    answerSent: {
      title: 'Réponse envoyée',
      yourChoice: 'Ton choix',
      unknownChoice: 'Ta réponse est bien enregistrée.',
      waiting: 'En attente des autres joueurs…',
    },
    reveal: {
      correctAnswerLabel: 'La bonne réponse',
      correct: 'Bonne réponse',
      wrong: 'Raté',
      noAnswer: 'Pas de réponse',
      pointsWon: (points: number) => `+${points} point${points > 1 ? 's' : ''}`,
      rank: (rank: string, playerCount: number) => `Tu es ${rank} sur ${playerCount}`,
      total: (points: string) => `Total : ${points}`,
    },
    scores: {
      title: 'Classement',
    },
    paused: {
      title: 'Pause',
      message: 'L’hôte a mis la partie en pause. Elle reprendra là où elle s’est arrêtée.',
    },
    ended: {
      title: 'Partie terminée',
      myResult: (rank: string, points: string) => `Tu termines ${rank} avec ${points}.`,
      finalRanking: 'Classement final',
    },
    // État de l'option Contrôle (P1), pas encore développée.
    waiting: 'Patiente un instant, la partie continue…',
  },
  playerDemo: {
    title: 'Démo : écrans du joueur',
    hint: 'Données factices, sans Firebase. Les appuis sur les propositions sont simulés.',
  },
};
