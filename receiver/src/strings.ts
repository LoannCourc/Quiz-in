import type { DisplaySettingSource } from '@shared/displayMode'
import { drawHintText } from '@shared/drawGame'
import type { SoundEngineState } from './lib/sound/soundEngine'
import type { EmojiSupport } from './lib/emojiSupport'
import type { AnswerVerdict, AudioSourceId, BlindTestAsk, Difficulty, DifficultyLevel, GameStatus, TeamId } from '@shared/types'

const LEVEL_LABELS: Record<DifficultyLevel, string> = { easy: 'Facile', medium: 'Moyen', hard: 'Difficile', impossible: 'Impossible', mixed: 'Tous niveaux' }

// Textes affichés sur la TV, regroupés ici pour faciliter la traduction.
export const strings = {
  appName: "Quiz'in",
  // Pas à pas : révélation et classement restent affichés jusqu'à l'action de l'hôte (bandeau du bas).
  hostWait: {
    message: 'L’hôte doit passer à la suite depuis son téléphone',
  },
  lobby: {
    scanToJoin: 'Scannez pour rejoindre',
    orEnterCode: 'ou saisissez le code',
    playerCount: (count: number, max: number) => `${count}/${max} joueurs`,
    waitingForPlayers: 'En attente des joueurs…',
    choosingNextGame: 'L’hôte choisit le prochain jeu…',
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
    afterRound: (index: number, total: number | undefined) => (total ? `Après la manche ${index} / ${total}` : `Après la manche ${index}`),
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
    // Pendant la partie, à côté du QR code : il ne sert qu'à revenir (pas de nouveau joueur après le lancement).
    rejoin: 'Déconnecté ? Scanne pour revenir dans la partie.',
  },
  starting: {
    getReady: 'Prêts ?',
    firstQuestion: 'La première question arrive…',
    // Pas à pas : 3-2-1 avant chaque question suivante.
    nextQuestion: (number: number, total: number) => `Question ${number} / ${total}`,
    nextRound: (number: number, total: number) => `Manche ${number} / ${total}`,
    // Fin du 3-2-1, avec le son GO.
    go: 'GO !',
  },
  question: {
    progress: (index: number, total: number | undefined) => (total ? `Question ${index}/${total}` : `Question ${index}`),
    // Dessine-moi : une manche plutôt qu'une question.
    roundProgress: (index: number, total: number | undefined) => (total ? `Manche ${index}/${total}` : `Manche ${index}`),
    blindTestProgress: (index: number, total: number | undefined) => (total ? `Blind test ${index}/${total}` : `Blind test ${index}`),
    bluffProgress: (index: number, total: number | undefined) => (total ? `Bluff ${index}/${total}` : `Bluff ${index}`),
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
    4: 'Impossible',
  } satisfies Record<Difficulty, string>,
  // Quiz fixe ou blind test joué (salon, bandeau en jeu, fin) : « Électro des années 80 · Moyen ».
  playedQuiz: (title: string, level: DifficultyLevel) => `${title} · ${LEVEL_LABELS[level]}`,
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
    maskedNote: 'Les réponses refusées ou masquées par l’hôte s’affichent en •••',
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
    // Écran de la bonne réponse : libellés au-dessus du texte, en capitales.
    truthLabel: 'La vraie réponse',
    bluffOf: (names: string) => `Bluff ${/^[aeiouy]/i.test(names.normalize('NFD')) ? 'd’' : 'de '}${names}`,
    // « Lola a piégé 2 joueurs, Hugo 1. » ; 3 noms au plus, puis « et N autres ».
    trapSummary: (entries: { name: string; trapped: number }[]) => {
      const [first, ...others] = entries
      if (!first) return ''
      const parts = [`${first.name} a piégé ${first.trapped} joueur${first.trapped > 1 ? 's' : ''}`, ...others.slice(0, 2).map(({ name, trapped }) => `${name} ${trapped}`)]
      const more = others.length - 2
      return `${parts.join(', ')}${more > 0 ? ` et ${more} autre${more > 1 ? 's' : ''}` : ''}.`
    },
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
  // Attente entre deux questions : compte à rebours et annonce de la question suivante.
  transition: {
    nextQuestionIn: (seconds: number) => `Prochaine question dans ${seconds}…`,
    // Dessine-moi : des manches.
    nextRoundIn: (seconds: number) => `Prochaine manche dans ${seconds}…`,
    finalRankingIn: (seconds: number) => `Classement final dans ${seconds}…`,
    announce: (questionNumber: number, questionCount: number) => `Question ${questionNumber}/${questionCount}`,
    announceRound: (roundNumber: number, roundCount: number) => `Manche ${roundNumber}/${roundCount}`,
    announceHint: 'Préparez-vous !',
  },
  scores: {
    title: 'Classement',
  },
  // Classement entre deux questions : carte du 1er, puis barres.
  interim: {
    leads: 'en tête',
    holds: 'reste en tête',
    takes: 'passe en tête',
    tied: 'à égalité en tête',
    // Espace insécable entre les milliers (aucune des polices n'a l'espace fine insécable).
    points: (points: number) => String(points).replace(/\B(?=(\d{3})+$)/g, ' '),
    others: (count: number) => `et ${count} autre${count > 1 ? 's' : ''}`,
    moveSame: 'même place',
    moveUp: (places: number) => `${places} place${places > 1 ? 's' : ''} gagnée${places > 1 ? 's' : ''}`,
    moveDown: (places: number) => `${places} place${places > 1 ? 's' : ''} perdue${places > 1 ? 's' : ''}`,
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
  // Dessine-moi (plan docs/plan-dessine-moi.md) : manche et révélation.
  draw: {
    // Espace insécable : le « ! » ne passe jamais seul à la ligne.
    drawing: (name: string) => `${name} dessine !`,
    hint: drawHintText,
    itWas: 'C’était…',
    drawnBy: (name: string) => `Dessiné par ${name}`,
    // Espace insécable : le « ! » ne passe jamais seul à la ligne.
    found: (name: string) => `${name} a trouvé !`,
    foundCount: (found: number, guessers: number) => `${found}/${guessers} ont trouvé`,
    // Groupe : seule l'équipe du dessinateur devine.
    teamGuesses: (team: string) => `L’équipe ${team} devine`,
    cancelled: 'Manche annulée : aucun point.',
    // Manche annulée par l'hôte : le dessin n'est plus montré.
    hiddenDrawing: 'Dessin masqué',
  },
  // Banc d'essai du dessin (Dessine-moi, lot 1, ?drawbench=1 ou cast-sender.html) : outil de mesure.
  drawBench: {
    title: 'Banc d’essai du dessin',
    loading: 'Chargement du dessin enregistré…',
    error: 'Dessin enregistré illisible.',
    phases: { replay: 'Rejeu en temps réel', stress: 'Annuler × 20 (tout repeindre)', pause: 'Pause, puis on recommence' },
    cycle: (cycle: number, phase: string) => `Tour ${cycle} · ${phase}`,
    chunks: (applied: number, total: number, kilobytes: string) => `Paquets : ${applied} / ${total} (${kilobytes} Ko)`,
    ops: (ops: number, fills: number) => `Opérations affichées : ${ops}, dont ${fills} seaux`,
    render: (last: string, max: string) => `Rendu d’un paquet : ${last} ms (max. ${max} ms)`,
    repaint: (average: string, max: string) => `Tout repeindre : ${average} ms en moyenne (max. ${max} ms)`,
    canvas: (width: number, height: number) => `Canvas : ${width} × ${height}`,
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
    title: 'En attente de l’hôte…',
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
  },
  // Série de bonnes réponses d'affilée (spec 18) : badge flamme, lu par les lecteurs d'écran.
  streak: (count: number) => `Série de ${count}`,
  // Séries des joueurs absents du classement affiché.
  streakExtra: {
    label: 'Aussi en série :',
    more: (count: number) => `+${count}`,
  },
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
    // Mode allégé (lib/displayMode.ts) : réglage (auto, on, off), ce qui est appliqué, et dernière décision
    // de l'automatique (images par seconde de la dernière seconde comptée, seuil, il y a combien de temps).
    // Blind test : délai entre l'ordre de jouer l'extrait et le son, et s'il était préchargé (nextAudio).
    extractStart: (ms: number, isPreloaded: boolean) => `Extrait : son en ${ms} ms après play() (${isPreloaded ? 'préchargé' : 'pas préchargé'})`,
    noExtractStart: 'Extrait : pas encore joué',
    lightMode: (setting: string, isLight: boolean, source: DisplaySettingSource) =>
      `Allégé : ${isLight ? 'OUI' : 'non'} (${setting}, ${{ address: 'par l’adresse, gardé', stored: 'gardé par cette TV', cast: 'envoyé par Cast, gardé', default: 'par défaut' }[source]})`,
    lightAuto: {
      // Réglage forcé (on ou off) : l'automatique ne décide rien ; « Automatique » (étape 5 de cast-sender) le rétablit.
      ignored: (wouldBeLight: boolean) => `Auto : non appliqué, réglage forcé (en automatique : ${wouldBeLight ? 'allégé d’office' : 'selon la mesure'})`,
      waiting: 'Auto : pas encore de mesure',
      measuring: (fps: number, threshold: number, agoS: number, slowStreak: number, needed: number) =>
        `Auto : ${fps} images/s (seuil ${threshold}) il y a ${agoS} s · lentes de suite : ${slowStreak}/${needed}`,
      oldChrome: (agoS: number) => `Auto : allégé d’office (Chrome 92 ou plus ancien) depuis ${agoS} s`,
      remembered: (agoS: number) => `Auto : allégé (lenteur mesurée sur une page précédente) depuis ${agoS} s`,
      slow: (fps: number, threshold: number, agoS: number) => `Auto : allégé il y a ${agoS} s (${fps} images/s, sous ${threshold})`,
      freeze: (agoS: number) => `Auto : allégé il y a ${agoS} s (affichage figé plus de 2 s)`,
    },
    // Police emoji de la TV : sans elle, les avatars ne s'affichent que grâce à leurs images.
    emoji: (support: EmojiSupport) =>
      `Emoji : ${{ color: 'oui', mono: 'oui, en noir et blanc', none: 'non', unknown: 'non mesurable' }[support]} (avatars en images)`,
    // Groupe : équipe reçus/affichés (capacité) ; en rouge si un membre n'est pas affiché.
    build: (builtAt: Date, commit: string) =>
      `Version de la TV : construite le ${builtAt.toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })} · commit ${commit}`,
    drawing: (chunks: number, kilobytes: string, last: string, max: string, repaint: string) =>
      `Dessin reçu : ${chunks} paquets (${kilobytes} Ko) · rendu d’une image ${last} ms (max. ${max} ms) · tout repeindre ${repaint} ms`,
    // Rejeu lissé : arrivée réelle des paquets pendant le dessin, et ce que la TV en fait.
    drawingFlow: (gapAverage: number, gapMax: number, points: number, chars: number, delay: number, catchUps: number) =>
      `Paquets en direct : écart moyen ${gapAverage} ms (max. ${gapMax} ms) · ${points} points et ${chars} caractères par paquet · retard d’affichage ${delay} ms · rattrapages ${catchUps}`,
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
      reveal: 'Réponse',
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
