import type { SoundEngineState } from './lib/sound/soundEngine'
import type { AnswerVerdict, AudioSourceId, BlindTestAsk, Difficulty, GameStatus, TeamId } from '@shared/types'

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
  // Groupe : équipes Rose, Cyan, Or, Vert (maquettes G2 et G3).
  teams: {
    names: { pink: 'Rose', cyan: 'Cyan', gold: 'Or', green: 'Vert' } satisfies Record<TeamId, string>,
    drawTitle: 'Tirage des équipes',
    drawSummary: (players: number, teams: number) => `${players} joueurs · ${teams} équipes`,
    drawFooter: 'Les joueurs rejoignent leur équipe…',
    unassigned: (count: number) => `Sans équipe (${count})`,
    // Membres d'une équipe qui ne tiennent pas dans sa colonne (garde-fou, nombre exact).
    moreMembers: (count: number) => `+${count}`,
    rankingTitle: 'Classement des équipes',
    afterQuestion: (index: number, total: number | undefined) => (total ? `Après la question ${index} / ${total}` : `Après la question ${index}`),
    averagePoints: (points: number) => `${points} pts de moyenne`,
    averageUnit: 'pts de moyenne',
    bestPlayer: 'Meilleur joueur',
    bestPlayerScore: (name: string, points: number) => `${name} · ${points}`,
    averageNote: 'Moyenne des points des joueurs de chaque équipe',
    winner: (name: string) => `L’équipe ${name} gagne !`,
    tie: 'Égalité entre les équipes !',
    bestPlayers: 'Meilleurs joueurs',
    bestPlayerRank: (rank: number, name: string, points: number) => `${rank}. ${name} · ${points}`,
  },
  header: {
    joinAt: (host: string) => `${host} · code`,
  },
  starting: {
    getReady: 'Prêts ?',
    firstQuestion: 'La première question arrive…',
    // Fin du 3-2-1, avec le son GO.
    go: 'GO !',
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
  // Bluff (maquettes B4 et B5) : écriture des fausses réponses, vote, révélation.
  bluff: {
    writeHint: 'Inventez une fausse réponse sur votre téléphone !',
    voteHint: 'Votez pour la vraie réponse !',
    writtenCount: (count: number, total: number) => `${count}/${total} ont écrit`,
    // Vote sans minuteur : « 7/12 » en gros, « ont voté » dessous, à la place de l'anneau du chrono.
    voteCountNumber: (count: number, total: number) => `${count}/${total}`,
    voteCountLabel: 'ont voté',
    revealTitle: 'Les propositions se retournent…',
    truthTitle: 'La vraie réponse',
    suspense: 'Suspense… la vraie réponse arrive',
    truthTag: 'Vraie réponse',
    decoyTag: 'Leurre',
    writtenBy: (names: string) => `écrite par ${names}`,
    noVote: 'aucun vote',
    otherChoices: (count: number) => `+ ${count} autre${count > 1 ? 's' : ''} proposition${count > 1 ? 's' : ''} sans vote`,
    moreVoters: (count: number) => `+${count}`,
    // Liste de pseudos : « Léa », « Léa et Tom », « Léa, Tom et Max », puis « et N autres ».
    names: (names: string[]) => {
      const shown = names.length > 3 ? [...names.slice(0, 2), `${names.length - 2} autres`] : names
      return shown.length > 1 ? `${shown.slice(0, -1).join(', ')} et ${shown[shown.length - 1]}` : (shown[0] ?? '')
    },
  },
  // Attente entre deux questions : étapes, compte à rebours et annonce de la question suivante.
  transition: {
    steps: ['Révélation', 'Classement', 'Question suivante'],
    // Dernière question : la révélation mène directement à l'écran de fin.
    finalStep: 'Classement final',
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
    // Suspense : pendant le roulement de tambour, avant le podium.
    suspense: 'Et le grand gagnant est…',
    suspenseTeams: 'Et l’équipe gagnante est…',
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
  // Test du son de la TV (cast-sender.html, spec 17) : moteur des effets et des musiques.
  soundTest: {
    title: 'Test des effets et musiques',
    engineState: (state: SoundEngineState) =>
      state === 'running'
        ? 'Son démarré sans geste : oui'
        : state === 'suspended'
          ? 'Son démarré sans geste : non (le navigateur attend un geste)'
          : `Son indisponible (${state})`,
    effect: (id: string, isPlayed: boolean) => `Effet ${id} : ${isPlayed ? 'joué' : 'non joué'}`,
    canPlay: (mimeType: string, answer: string) => `${mimeType} : ${answer === '' ? 'non pris en charge' : answer}`,
    decoded: (ms: number, bytes: number, durationS: number, sampleRate: number, channels: number, memory: number) =>
      `Décodé en ${ms} ms : ${Math.round(bytes / 1024)} Ko, ${durationS.toFixed(1)} s, ${sampleRate} Hz, ${channels} canal(aux), ${(memory / 1_048_576).toFixed(1)} Mo en mémoire`,
    decodeFailed: (detail: string) => `Fichier illisible : ${detail}`,
    looping: (seconds: number) => `Boucle en cours pendant ${seconds} s : écoutez le raccord à chaque tour`,
    ducking: (seconds: number) => `Ducking : musique baissée pendant ${seconds} s, avec un effet`,
    loopDone: 'Boucle arrêtée (fondu de sortie)',
    done: 'Test terminé.',
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
    // Liste compacte (fin de partie à 13 joueurs et plus) : le nombre seul, le nom garde la place.
    compactPoints: (points: number) => `${points}`,
    gained: (points: number) => `+${points}`,
  },
  // Série de bonnes réponses d'affilée (spec 18) : badge flamme, lu par les lecteurs d'écran.
  streak: (count: number) => `Série de ${count}`,
  // Panneau de mesures (?perf=1, plan de fiabilité) : outil de diagnostic, affiché par-dessus la partie.
  perf: {
    title: 'Mesures de la TV',
    fps: (fps: number, min: number | null) => `Images/s : ${fps} (min. 10 s : ${min ?? '–'})`,
    longTasks: (count: number, maxMs: number, isSupported: boolean) =>
      isSupported ? `Tâches longues 10 s : ${count} (max. ${maxMs} ms)` : 'Tâches longues : non mesurables',
    tickGap: (maxMs: number) => `Battement max. 10 s : ${maxMs} ms (attendu 250)`,
    renders: (perSecond: number) => `Rendus/s : ${perSecond}`,
    memory: (usedMb: number, limitMb: number) => `Mémoire JS : ${usedMb} / ${limitMb} Mo`,
    memoryUnknown: 'Mémoire JS : non mesurable',
    screen: (screen: string, chrome: string) => `Écran : ${screen} · Chrome ${chrome}`,
    // Groupe : équipe reçus/affichés (capacité) ; en rouge si un membre n'est pas affiché.
    streaks: (active: { name: string; streak: number }[], zero: number, missing: number) =>
      `Séries reçues : ${active.length > 0 ? active.map((entry) => `${entry.name} ${entry.streak}`).join(' · ') : 'aucune en cours'} (${zero} à 0, ${missing} sans le champ)`,
    teamColumns: (scale: string, teams: { team: string; received: number; shown: number; capacity: number }[]) =>
      `Équipes (échelle ${scale}) : ${teams.map((team) => `${team.team} ${team.received} reçus, ${team.shown} affichés, capacité ${team.capacity}`).join(' · ')}`,
    sound: (music: boolean, forcedOff: boolean, effects: boolean) =>
      `Musique : ${music ? 'ACTIVE' : forcedOff ? 'coupée par les mesures' : 'coupée'} · effets : ${effects ? 'oui' : 'non'}`,
    musicMemory: (tracks: number, decodedMb: number, fileMb: number, decoding: number) =>
      `Pistes décodées : ${tracks} (${decodedMb.toFixed(1)} Mo ; fichiers ${fileMb.toFixed(1)} Mo)${decoding > 0 ? ` · décodage en cours` : ''}`,
    lastDecode: (track: string, ms: number) => `Dernier décodage : ${track}, ${ms} ms`,
    keepAwake: (video: string, wakeLock: string) => `Anti-veille : vidéo ${video} · Wake Lock ${wakeLock}`,
    transition: (status: string, host: number | null, network: number, display: number) =>
      `Dernière transition (${status}) : hôte ${host === null ? '–' : `+${host}`} · réseau ${network} · affichage ${display} ms`,
    noTransition: 'Dernière transition : aucune encore',
    compareTitle: 'Musique active / coupée (depuis l’ouverture)',
    compareHead: ['', 'active', 'coupée'],
    compareRows: {
      duration: 'Durée',
      fps: 'Images/s moy. (min.)',
      longTasks: 'Tâches longues (max.)',
      tickGap: 'Battement max.',
      transitions: 'Transitions TV moy. (max.)',
      host: 'Retard hôte max.',
      incidents: 'Incidents',
    },
    incidentsTitle: (count: number) => `Incidents (${count}/30, le plus récent en haut)`,
    noIncident: 'Aucun incident',
    incidentKinds: { tick: 'minuteur', task: 'tâche', state: 'transition', host: 'hôte', decode: 'décodage' },
    incidentContext: (status: string | null, index: number | null, music: boolean, decoding: boolean) =>
      `${status ?? '?'}${index === null ? '' : ` Q${index + 1}`} · musique ${music ? 'oui' : 'non'}${decoding ? ' · décodage' : ''}`,
  },
  dev: {
    title: 'Démo',
    statuses: {
      lobby: 'Lobby',
      starting: '3-2-1',
      question: 'Question',
      vote: 'Vote',
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
    // Galerie des sons (?sounds=1).
    sounds: {
      title: 'Sons de la TV',
      hint: 'Cliquez une fois dans la page pour autoriser le son.',
      state: (state: SoundEngineState) => `Moteur : ${state}`,
      music: (isOn: boolean) => `Musique : ${isOn ? 'oui' : 'non'}`,
      effects: (isOn: boolean) => `Effets : ${isOn ? 'oui' : 'non'}`,
      volume: (volume: number) => `Volume ${volume}`,
      loop: (isPlaying: boolean) => (isPlaying ? 'Arrêter la boucle témoin' : 'Boucle témoin (musique)'),
      duck: 'Ducking 2 s',
      track: (id: string) => `Musique : ${id}`,
      stopMusic: 'Couper la musique',
      musicMemory: (bytes: number) => `Musiques décodées : ${(bytes / 1_048_576).toFixed(1)} Mo`,
      selfTestRunning: 'Auto-test en cours…',
      selfTestRow: (id: string, durationS: number, peak: number, rms: number) =>
        `${id} : ${durationS.toFixed(2)} s, crête ${peak.toFixed(2)}, moyenne ${rms.toFixed(3)}${peak > 1 ? ' — SATURÉ' : peak < 0.01 ? ' — MUET' : ''}`,
      selfTestError: (id: string, detail: string) => `${id} : ERREUR ${detail}`,
    },
  },
}
