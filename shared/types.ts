// Types communs à l'app hôte, au client joueur et au récepteur TV (spec, sections 5, 7 et 8).
import type { QuizIconName } from './themeIcons';

export type GameStatus =
  | 'lobby'
  | 'starting'
  | 'question'
  // Bluff : vote pour la proposition que l'on croit vraie (spec 16).
  | 'vote'
  | 'reveal'
  | 'validation'
  | 'scores'
  | 'paused'
  | 'ended';

// bluff : chaque joueur invente une fausse réponse, puis vote (spec 16) ; imposé par un quiz Bluff.
// draw : Dessine-moi, un joueur dessine un mot secret que les autres devinent (plan-dessine-moi.md).
export type AnswerMode = 'free' | 'choice' | 'bluff' | 'draw';

// 1 = Facile, 2 = Moyen, 3 = Difficile.
export type Difficulty = 1 | 2 | 3;

// Niveau d'un quiz, déduit de la moyenne des difficultés de ses questions (spec 8).
export type DifficultyLevel = 'easy' | 'medium' | 'hard';

// Type de jeu d'un quiz : questions classiques, blind test (extraits musicaux joués par la TV), ou
// Bluff (fausses réponses inventées par les joueurs, spec 16).
export type QuizGameType = 'quiz' | 'blindTest' | 'bluff' | 'draw';

// Source des extraits audio (interchangeable : seule l'app de l'hôte sait l'interroger).
export type AudioSourceId = 'deezer';

// Public visé par un quiz (pastille de la fiche, rangée « Pour les experts »).
export type QuizAudience = 'all' | 'kids' | 'experts';

// Palette du dégradé de l'affiche d'un quiz ; les couleurs sont définies par l'app (appTheme).
export type PosterPalette = 'pink' | 'blue' | 'green' | 'orange' | 'red' | 'cyan' | 'violet' | 'gold';

// Fiche d'un quiz dans le catalogue (nœud quizzes/{quizId}, spec 7).
export interface QuizSummary {
  title: string;
  theme: string;
  gameType: QuizGameType;
  language: 'fr';
  difficulty: number;
  difficultyLabel: string;
  // Niveau choisi par l'auteur (tri « Plus faciles », rangées, fiche) ; absent : déduit de difficulty.
  level?: DifficultyLevel;
  questionCount: number;
  estimatedMinutes: number;
  description: string;
  audience: QuizAudience;
  poster: PosterPalette;
  // Date d'ajout AAAA-MM-JJ (rangée « Nouveautés ») ; vide si inconnue.
  addedAt: string;
  // Place dans le Top 10, choisie à la main (1 à 10) ; absente si le quiz n'y figure pas.
  featuredRank?: number;
  // Icône propre au quiz (affiches) ; absente : celle de son thème.
  icon?: QuizIconName;
}

export type ChoiceOptions = [string, string, string, string];

// Blind test : ce que la question demande (spec 15). En Réponse libre, « both » demande deux champs
// (titre et artiste), chacun rapportant la moitié des points.
export type BlindTestAsk = 'title' | 'artist' | 'both';

// Question complète, lisible uniquement par l'hôte.
export interface Question {
  id: string;
  text: string;
  options: ChoiceOptions;
  correctIndex: number;
  acceptedAnswers: string[];
  difficulty: Difficulty;
  explanation?: string;
  timeLimit?: number;
  // Blind test : morceau dont un extrait est joué par la TV pendant la question.
  music?: MusicTrack;
  // Blind test : ce que la question demande (obligatoire dans content/ pour un blind test).
  ask?: BlindTestAsk;
}

// Question de Bluff (spec 16), lisible uniquement par l'hôte : réponse courte, ses autres écritures
// (une proposition qui s'en approche est refusée) et 2 ou 3 leurres écrits d'avance.
export interface BluffQuestion {
  id: string;
  text: string;
  answer: string;
  acceptedAnswers: string[];
  decoys: string[];
  difficulty: Difficulty;
  explanation?: string;
  timeLimit?: number;
}

// Dessine-moi : une manche, un mot à dessiner (lisible par l'hôte ; le dessinateur le reçoit dans
// drawSecret). La catégorie est publique (indice affiché sur la TV).
export interface DrawQuestion {
  id: string;
  word: string;
  category: string;
  difficulty: Difficulty;
  timeLimit?: number;
}

// Question d'une partie : toutes classiques, toutes de Bluff, ou toutes des manches de Dessine-moi.
export type GameQuestion = Question | BluffQuestion | DrawQuestion;

// Dessine-moi : manche en cours (public). round : numéro de la manche (currentIndex).
export interface DrawTurn {
  drawer: PlayerId;
  round: number;
  wordLength: number;
  category: string;
  // Le dessinateur a changé de mot (une fois par manche, avant son premier trait).
  changedWord?: true;
}

// Dessine-moi : dernier essai d'un devineur (réécrit à chaque essai ; lisible par l'hôte seulement).
export interface DrawGuess {
  text: string;
  // Numéro de l'essai dans la manche (1 à DRAW_MAX_GUESSES).
  count: number;
  // Heure du serveur.
  at: number;
}

// Verdict de l'hôte sur l'essai numéro count (lisible par ce joueur seulement).
export type DrawVerdict = 'wrong' | 'close' | 'found';
export interface DrawHint {
  count: number;
  verdict: DrawVerdict;
}

// Mot de la manche en cours : lisible par l'hôte et le dessinateur seulement.
export interface DrawSecret {
  word: string;
  category: string;
}

// Morceau d'une question de blind test (lisible uniquement par l'hôte, comme toute la question).
export interface MusicTrack {
  source: AudioSourceId;
  // Identifiant du morceau chez la source (Deezer : identifiant numérique, en texte).
  id: string;
  title: string;
  artist: string;
  // Début de l'extrait dans la preview, en secondes (défaut : AUDIO_EXTRACT_START_S). L'extrait dure
  // le temps du timer de la question : début + timer ≤ 30 s.
  startS?: number;
  // Réponse libre : autres écritures acceptées du titre (« Satisfaction ») et de l'artiste (« Gims »).
  titleAliases?: string[];
  artistAliases?: string[];
}

// Extrait publié pendant QUESTION : seulement une adresse temporaire, jamais l'identifiant ni le titre.
export interface PublicAudio {
  url: string;
  startS: number;
  // Durée de l'extrait : celle du timer de la question (sans jamais dépasser la preview).
  durationS: number;
}

// Question telle que publiée pendant l'état QUESTION : jamais la bonne réponse.
export interface PublicQuestion {
  text: string;
  options?: ChoiceOptions;
  difficulty: Difficulty;
  timeLimit: number;
  audio?: PublicAudio;
  // Blind test en Réponse libre : ce qu'il faut écrire (titre, artiste, ou les deux).
  ask?: BlindTestAsk;
  // Bluff, pendant VOTE : propositions mélangées (vraie réponse, propositions des joueurs, leurres),
  // sans auteur ni type.
  choices?: string[];
}

// Résultat d'un joueur ou d'un groupe de réponses : juste, à moitié juste (blind test « both »), faux.
export type AnswerVerdict = 'correct' | 'partial' | 'wrong';

// Réponse libre : réponses identiques (après normalisation) regroupées pour la TV. Le texte est
// filtré par l'hôte avant publication (« ••• » pour un mot interdit ou un groupe masqué).
export interface FreeAnswerGroup {
  value: string;
  playerIds: PlayerId[];
  verdict: AnswerVerdict;
}

// Bluff : un choix du vote. authors : joueurs dont la proposition a été retenue (plusieurs si elles
// étaient identiques) ; vide pour la vraie réponse et les leurres.
export type BluffChoiceKind = 'truth' | 'bluff' | 'decoy';

export interface BluffChoice {
  text: string;
  kind: BluffChoiceKind;
  authors?: PlayerId[];
}

// Bluff, à la révélation : chaque choix avec ses auteurs et ses votants.
export interface RevealedBluffChoice extends BluffChoice {
  voters?: PlayerId[];
}

export interface RevealStats {
  // Choix multiples : nombre de réponses par proposition (même ordre que options).
  choiceCounts?: number[];
  // Réponse libre : groupes de réponses, les plus nombreux d'abord (FREE_ANSWER_GROUPS_MAX au plus).
  freeAnswers?: FreeAnswerGroup[];
  // Bluff : les choix du vote, dans leur ordre (lettres A, B, C…), avec auteurs et votants.
  bluffChoices?: RevealedBluffChoice[];
  // Dessine-moi : manche annulée (par l'hôte, ou dessinateur parti) ; aucun point.
  drawCancelled?: true;
}

export interface Reveal {
  correctAnswer: string;
  explanation?: string;
  // Blind test : titre et artiste, affichés à la révélation avec la mention de la source.
  music?: RevealMusic;
  stats: RevealStats;
  // Résultat de chaque joueur ayant répondu ; un joueur absent n'a pas répondu (0 point).
  results?: Record<PlayerId, PlayerResult>;
}

export interface RevealMusic {
  title: string;
  artist: string;
  source: AudioSourceId;
}

export interface PlayerResult {
  correct: boolean;
  points: number;
  // Blind test « both » : une seule des deux parties juste (la moitié des points). Absent sinon.
  partial?: true;
  // Blind test « both » en Réponse libre : titre et artiste jugés justes ou non (écran du joueur).
  parts?: { title: boolean; artist: boolean };
}

export interface SessionSettings {
  answerMode: AnswerMode;
  speedBonus: boolean;
  control: boolean;
  teams: boolean;
  // Pas à pas : après la révélation, la partie attend que l'hôte appuie sur « Question suivante ».
  // Absent dans les parties créées avant ce réglage : désactivé.
  stepByStep?: boolean;
  // Suspense : pas de classement en cours de partie ; la révélation mène directement à la question
  // suivante, et le classement n'apparaît qu'à la fin. Absent : désactivé.
  suspense?: boolean;
  // Groupe (teams) : formation des équipes (tirage, placement par l'hôte, choix des joueurs) et nombre
  // d'équipes (2 à 4). Absents : tirage au sort, nombre suggéré d'après les joueurs.
  teamMode?: TeamMode;
  teamCount?: number;
  // Dessine-moi : catégories de mots choisies dans le catalogue (identifiants de drawCategoryId, voir
  // shared/drawWords.ts). Absent ou vide : « Mélange », toutes les catégories.
  drawCategories?: string[];
  // Dessine-moi : nombre de manches choisi dans les réglages du salon (4, 6 ou 8). Absent : 8.
  drawRounds?: number;
}

// Groupe : 4 équipes fixes (Rose, Cyan, Or, Vert), chacune avec un symbole dessiné (étoile, rond,
// triangle, carré) pour que la couleur ne porte jamais seule l'information.
export type TeamId = 'pink' | 'cyan' | 'gold' | 'green';
export type TeamMode = 'random' | 'host' | 'players';

// Score d'une équipe (somme, question par question, de la moyenne des points de ses joueurs
// présents) et son rang (égalités comme pour les joueurs).
export interface TeamStanding {
  score: number;
  rank: number;
}

export interface Player {
  name: string;
  avatar: string;
  score: number;
  rank: number;
  connected: boolean;
  // Groupe : équipe du joueur, modifiable en LOBBY seulement.
  team?: TeamId;
  // Série de bonnes réponses d'affilée (spec 18), écrite par l'hôte à chaque révélation ; absente : 0.
  streak?: number;
}

export interface Answer {
  // Texte saisi en Réponse libre (blind test « both » : le titre, éventuellement vide), index de la
  // proposition en Choix multiples.
  value: string | number;
  // Blind test « both » en Réponse libre : l'artiste saisi (absent si le joueur ne l'a pas écrit).
  artist?: string;
  submittedAt: number;
  // Écrits par l'hôte : à la fin de la question (correction automatique), puis à la révélation.
  correct?: boolean;
  points?: number;
  partial?: true;
  // Points d'une réponse entièrement juste, calculés à la fin de la question (Rapidité comprise) :
  // l'hôte peut accepter une réponse pendant la validation sans connaître l'heure de fin.
  fullPoints?: number;
}

export type PlayerId = string;

// Bluff : proposition d'un joueur (réécrite après un refus, 3 essais au plus).
export interface BluffEntry {
  text: string;
  submittedAt: number;
}

// Bluff : verdict de l'hôte sur la dernière proposition (submittedAt l'identifie). truth : trop proche
// de la vraie réponse ; forbidden : mot interdit ; empty : rien d'écrit. refusals : refus déjà reçus.
export type BluffVerdict = 'ok' | 'truth' | 'forbidden' | 'empty';

export interface BluffCheck {
  verdict: BluffVerdict;
  refusals: number;
  submittedAt: number;
}

// Bluff : vote d'un joueur (index du choix dans currentQuestion.choices).
export interface BluffVote {
  value: number;
  submittedAt: number;
}

// Partie de la session lisible par les joueurs et la TV : tout sauf answers.
export interface PublicSession {
  hostUid: PlayerId;
  quizId: string;
  status: GameStatus;
  settings: SessionSettings;
  currentIndex: number;
  // Nombre de questions de la partie : écrit par l'hôte au lancement, absent en lobby.
  questionCount?: number;
  phaseStartedAt: number;
  phaseEndsAt: number;
  // Renseignés en PAUSED : état à reprendre et temps restant de la phase interrompue.
  pausedFrom?: GameStatus;
  remainingMs?: number;
  // Heure serveur du départ de l'hôte (coupure), écrite par son onDisconnect ; effacée à son retour.
  hostLeftAt?: number;
  currentQuestion?: PublicQuestion;
  reveal?: Reveal;
  players: Record<PlayerId, Player>;
  // Qui a répondu à chaque question, jamais quoi.
  answeredBy?: Record<number, Record<PlayerId, true>>;
  // Groupe : classement des équipes, points d'équipe de chaque question (moyenne des joueurs
  // présents), joueurs comptés à la fin de chaque question, et heure du dernier tirage (animation TV).
  teams?: Partial<Record<TeamId, TeamStanding>>;
  teamPoints?: Record<number, Partial<Record<TeamId, number>>>;
  teamPresence?: Record<number, Record<PlayerId, true>>;
  teamDrawAt?: number;
  // Groupe : heure à laquelle l'hôte a validé les équipes (son « équipes validées » de la TV).
  teamsValidatedAt?: number;
  // Bluff : qui a une proposition acceptée, et qui a voté (jamais quoi).
  bluffedBy?: Record<number, Record<PlayerId, true>>;
  votedBy?: Record<number, Record<PlayerId, true>>;
  // Son de la TV (spec 17), réglé par l'hôte à tout moment ; absent dans les parties créées avant.
  sound?: SoundSettings;
  // TV ouvertes sur la partie (Cast ou plan B) : chaque TV écrit son propre nœud, retiré par son
  // onDisconnect. Absent : aucune TV, ou partie créée avant ce champ.
  tvPresence?: Record<string, true>;
  // Dessine-moi : manche en cours, et dessin envoyé par le dessinateur (paquets « seq:ops », clés 0 à
  // 399 ; la base peut les rendre sous forme de tableau). Effacés à chaque nouvelle manche.
  drawTurn?: DrawTurn;
  drawing?: Record<string, string> | (string | null)[];
  // Dessine-moi : qui a trouvé le mot, et quand (heure du serveur) ; jamais ce qui a été proposé.
  drawFound?: Record<PlayerId, number>;
}

// Son de la TV : musique d'ambiance et effets activés ou non, volume général de 0 à 100.
export interface SoundSettings {
  music: boolean;
  effects: boolean;
  volume: number;
}

// Session complète, lisible uniquement par l'hôte.
export interface Session extends PublicSession {
  // Joueurs exclus par l'hôte (salon) : ils ne peuvent plus rejoindre cette partie ; chacun ne lit que le sien.
  banned?: Record<PlayerId, true>;
  answers?: Record<number, Record<PlayerId, Answer>>;
  // Dessine-moi : ordre des dessinateurs (tiré au lancement) et mot de la manche en cours.
  drawOrder?: PlayerId[];
  drawSecret?: DrawSecret;
  drawGuess?: Record<PlayerId, DrawGuess>;
  drawHint?: Record<PlayerId, DrawHint>;
  // Demande de changement de mot du dessinateur (une fois par manche, avant son premier trait).
  drawWordChange?: true;
  // Points de chaque joueur à chaque manche (les réponses classiques les gardent dans answers).
  drawPoints?: Record<number, Record<PlayerId, number>>;
  // Bluff (spec 16). bluffChecks et bluffOwn sont lisibles aussi par le joueur concerné, pour lui seul.
  bluffs?: Record<number, Record<PlayerId, BluffEntry>>;
  bluffChecks?: Record<number, Record<PlayerId, BluffCheck>>;
  // Choix du vote avec leurs auteurs, et index du choix de chaque auteur (il ne peut pas le voter).
  bluffChoices?: Record<number, BluffChoice[]>;
  bluffOwn?: Record<number, Record<PlayerId, number>>;
  votes?: Record<number, Record<PlayerId, BluffVote>>;
  // Points de chaque joueur à chaque question (les réponses classiques les gardent dans answers).
  bluffPoints?: Record<number, Record<PlayerId, number>>;
}
