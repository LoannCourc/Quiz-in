import type { ThemeIconName } from '@shared/themeIcons';
import type { DrawCategory } from '@shared/drawWords';
import type { PosterPalette, TeamId } from '@shared/types';

import type { GameType } from './strings';
import { Platform } from 'react-native';

// Direction artistique « Plateau TV » : seul endroit où l'app définit couleurs, polices et formes.
// Mêmes valeurs que le récepteur TV (receiver/src/theme.css). Les écrans n'utilisent que ces tokens.

const Palette = {
  ink: '#1b0a45',
  white: '#ffffff',
  pink: '#ff3d8b',
  pinkLight: '#ff6fa8',
  // Rose adouci (octobre 2026) : moins agressif que pink ; texte encre dessus (7,8:1).
  pinkSoft: '#f58aae',
  // Violet des panneaux pleins du salon (ligne « Réglages », maquette N2).
  violetPanel: '#2a1460',
  cyan: '#3fe9ff',
  gold: '#ffd23d',
  green: '#7dff9a',
  lavender: '#c9b8ff',
  // Maquette S1 : libellés discrets (« Question 3 / 10 », « TA RÉPONSE », compteur) et piste de la barre.
  lavenderMuted: '#a99ee0',
  violetTrack: '#5a45a8',
  bgTop: '#7a35d9',
  bgMiddle: '#3a1280',
  bgBottom: '#170646',
  glowOrange: '#f0884a',
  goldLight: '#fff2a6',
  goldDeep: '#f2b31c',
  glowMagenta: '#c42d8a',
  track: 'rgba(201, 184, 255, 0.35)',
} as const;

// Affiches du catalogue : début et fin du dégradé de chaque palette (fichiers de contenu, champ poster).
const PosterColors: Record<PosterPalette, readonly [string, string]> = {
  pink: ['#ff4f9a', '#a8268f'],
  blue: ['#3f8cff', '#2b3fc4'],
  green: ['#2fd08a', '#137a63'],
  orange: ['#ffb02e', '#ff5a3d'],
  red: ['#f0484f', '#8f1f4a'],
  cyan: ['#22c8e8', '#1f5fd1'],
  violet: ['#a56bff', '#5b2bd1'],
  gold: ['#ffc53d', '#f0761c'],
};

export const AppPosterGradients = Object.fromEntries(
  Object.entries(PosterColors).map(([palette, [from, to]]) => [palette, `linear-gradient(160deg, ${from} 0%, ${to} 100%)`]),
) as Record<PosterPalette, string>;

export const AppColors = {
  // Couleur unie sous le dégradé (avant son affichage, et partout où un dégradé n'a pas de sens).
  background: Palette.bgBottom,
  surface: 'rgba(255, 255, 255, 0.12)',
  // Salon (maquette N2) : panneau plein de la ligne « Réglages ».
  lobbyPanel: Palette.violetPanel,
  // Poignée des feuilles du bas.
  sheetHandle: Palette.track,
  card: Palette.white,
  text: Palette.white,
  textMuted: Palette.lavender,
  ink: Palette.ink,
  accent: Palette.gold,
  onAccent: Palette.ink,
  // Rose décoratif (anneaux, cadres, pastilles) : rose adouci. Le rose vif (wrong) est réservé aux alertes.
  highlight: Palette.pinkSoft,
  // Texte sur le rose (pastilles) : encre, contraste 5,4:1 (le blanc n'atteint que 3,3:1).
  onHighlight: Palette.ink,
  correct: Palette.green,
  onCorrect: Palette.ink,
  wrong: Palette.pink,
  selection: Palette.white,
  // Réponses A, B, C, D : la lettre accompagne toujours la couleur.
  choices: [Palette.pinkLight, Palette.cyan, Palette.gold, Palette.green],
  onChoice: Palette.ink,
  // Podium : 1er or, 2e cyan, 3e rose (maquette).
  podium: [Palette.gold, Palette.cyan, Palette.pinkLight],
  // Anneau du compte à rebours : temps restant en rose, temps écoulé en lavande translucide.
  ring: Palette.pinkSoft,
  ringTrack: Palette.track,
  // Barre de temps mobile : même rose que l'anneau, sur blanc translucide.
  // Barre de temps des questions (maquette S1) : piste violette, remplissage rose vif (choix de la maquette).
  timebarTrack: Palette.violetTrack,
  timebarFill: Palette.pink,
  // En-tête des questions, libellés et compteur des champs (maquette S1).
  questionMeta: Palette.lavenderMuted,
  // Champ de saisie sans le focus (maquette S1, champ « ARTISTE »).
  fieldIdleBorder: Palette.violetTrack,
  // Pastille « encre » : lettre des réponses, centre de l'anneau, bandeau « Ta place ».
  inkSurface: Palette.ink,
  // Badge flamme d'une série (spec 18) : goutte rose, goutte or dedans, nombre à l'encre (comme la TV).
  streakOuter: Palette.pinkSoft,
  streakInner: Palette.gold,
  onStreak: Palette.ink,
  // Voile derrière un panneau (contrôles de l'hôte).
  backdrop: 'rgba(23, 6, 70, 0.7)',
  confetti: [Palette.cyan, Palette.gold, Palette.green, Palette.white, Palette.pinkLight],
  // Catalogue : puces de thème (contour, puce choisie en blanc), badge « bientôt », pastilles de la fiche.
  chipBorder: 'rgba(201, 184, 255, 0.45)',
  chipSelected: Palette.white,
  onChipSelected: Palette.ink,
  soonBadge: Palette.cyan,
  onSoonBadge: Palette.ink,
  tags: { difficulty: Palette.gold, audience: Palette.green, gameType: Palette.cyan },
  onTag: Palette.ink,
  // Salon de l'hôte : panneaux sombres (carte du code, liste des joueurs), liens et bloc « sans TV ».
  panel: 'rgba(23, 6, 70, 0.55)',
  // Tuile de réglage inactive (l'active est en accent, texte encre).
  tileIdle: 'rgba(255, 255, 255, 0.08)',
  link: Palette.cyan,
  // Zoom du dessinateur : partie visible sur la mini-carte (maquette E3).
  zoomViewport: Palette.pink,
  // Pastille des boutons de zoom posée sur le dessin (maquettes E1, E2).
  zoomPill: 'rgba(27, 10, 69, 0.85)',
  // Fond du QR code et de ses marges : contraste maximal avec les modules encre.
  qrBackground: Palette.white,
  qrModule: Palette.ink,
  // Groupe : couleur de chaque équipe (toujours accompagnée de son symbole), symbole en encre.
  teams: { pink: Palette.pinkSoft, cyan: Palette.cyan, gold: Palette.gold, green: Palette.green } satisfies Record<TeamId, string>,
  onTeam: Palette.ink,
  // Icônes de thème (maquette I2) : traits blancs, ombre bleu nuit ; pastille de couleur fixe par thème
  // dans les puces de filtre (Culture générale, ou thème inconnu, sur « ? »).
  // Accueil (maquette H1) : couleur de chaque tuile de jeu, texte encre dessus, bord blanc.
  gameTiles: { quiz: Palette.pinkSoft, blindTest: Palette.cyan, bluff: Palette.green, draw: Palette.gold } satisfies Record<GameType, string>,
  // Dessine-moi, affiches des catégories (maquette D1) : couleurs de la charte et des affiches du catalogue,
  // texte et icône encre. Rose vif (alertes) jamais utilisé : Sport prend le rose des affiches.
  drawCategories: {
    Animal: Palette.pinkSoft,
    Nourriture: Palette.glowOrange,
    Objet: PosterColors.blue[0],
    Maison: Palette.goldDeep,
    Nature: Palette.green,
    Lieu: PosterColors.violet[0],
    Transport: Palette.cyan,
    Métier: PosterColors.green[0],
    Sport: PosterColors.pink[0],
    Loisir: Palette.gold,
    Vêtement: Palette.pinkLight,
    Corps: Palette.cyan,
  } satisfies Record<DrawCategory, string>,
  onGameTile: Palette.ink,
  // Logo L5 : face or, relief rose vif (choix du logo, pas une alerte), ombre encre sous le relief.
  logoFace: Palette.gold,
  logoRelief: Palette.pink,
  logoShadow: Palette.ink,
  // Page de démarrage : trois points rose vif, cyan, or sous le logo.
  launchDots: [Palette.pink, Palette.cyan, Palette.gold],
  gameTileBorder: Palette.white,
  themeIcon: Palette.white,
  themeIconShadow: Palette.ink,
  themeChips: {
    question: Palette.pink,
    clapper: '#3a9cff',
    globe: '#22b573',
    columns: '#ff9a3d',
    gamepad: Palette.pinkLight,
    note: Palette.cyan,
    flask: '#9b5cff',
    ball: Palette.pink,
  } satisfies Record<ThemeIconName, string>,
} as const;

// Fonds : dégradés radiaux en syntaxe CSS (Android et web).
export const AppBackgrounds = {
  main: `radial-gradient(ellipse 120% 90% at 50% 0%, ${Palette.bgTop} 0%, ${Palette.bgMiddle} 45%, ${Palette.bgBottom} 100%)`,
  // Révélation d'une bonne réponse : halo orangé et rose derrière la pièce (maquette).
  celebration: `radial-gradient(ellipse 90% 70% at 50% 35%, ${Palette.glowOrange} 0%, ${Palette.glowMagenta} 45%, ${Palette.bgMiddle} 100%)`,
} as const;

// Pièce de la révélation : reflet clair au centre, or plus soutenu sur les bords (maquette).
export const AppCoinGradient = `radial-gradient(circle at 50% 40%, ${Palette.goldLight} 0%, ${Palette.gold} 55%, ${Palette.goldDeep} 100%)`;

export type AppBackgroundName = keyof typeof AppBackgrounds;

// Une famille par graisse : sur Android, fontWeight ne choisit pas la graisse d'une police
// chargée à part. Les noms sont ceux enregistrés au chargement (hooks/useAppFonts.ts) et, sur le web,
// ceux des @font-face de public/index.html.
export const AppFontNames = {
  display: 'BowlbyOne',
  bold: 'Nunito-Bold',
  extraBold: 'Nunito-ExtraBold',
  black: 'Nunito-Black',
} as const;

// Famille utilisée par les écrans. Web : pile CSS ; en attendant la police (ou si elle manque), une
// police système aux métriques ajustées sur la vraie (« -fallback », public/index.html) pour que le
// texte ne change ni de largeur ni de hauteur, puis sans-serif. Android : le nom seul, obligatoire.
function withWebFallback(name: string): string {
  return Platform.OS === 'web' ? `${name}, ${name}-fallback, sans-serif` : name;
}

export const AppFonts = {
  display: withWebFallback(AppFontNames.display),
  bold: withWebFallback(AppFontNames.bold),
  extraBold: withWebFallback(AppFontNames.extraBold),
  black: withWebFallback(AppFontNames.black),
};

// Bowlby One a des accents hauts : la police déclare 1,11 em au-dessus de la ligne de base et 0,46 em
// en dessous (1,57 em en tout), le « É » monte à 1,10 em. Avec une hauteur de ligne plus petite, le
// manque est retiré à parts égales en haut et en bas (web, et Android depuis React Native 0.86) : le
// haut des accents dépasse de la ligne et Android le rogne. 1,58 contient tous les accents.
export const DISPLAY_LINE_HEIGHT = 1.58;

// Tailles pensées pour un téléphone tenu à une main.
// Android 15+ avec React Native 0.86 : un texte dimensionné à son contenu (pastille, bande, badge,
// bouton) est mesuré par la somme des avances de ses glyphes, mais dessiné selon leurs contours
// visibles, parfois une fraction de pixel plus larges (useBoundsForWidth, Android 15). Son dernier mot
// passe alors sur une ligne que la boîte masque (« TA » au lieu de « TA PLACE »). Correctif React Native
// pas encore publié (PR #57117) : marge de fin d'un point, sur Android seulement, sur ces textes.
export const TEXT_FIT_SAFETY = Platform.OS === 'android' ? { paddingRight: 1 } : {};

export const AppSizes = {
  contentMaxWidth: 480,
  buttonHeight: 64,
  avatarCell: 52,
  radius: 26,
  radiusCard: 30,
  radiusPill: 44,
  selectionWidth: 4,
  textBody: 18,
  textLarge: 24,
  textTitle: 32,
  textHero: 40,
  // Compte à rebours et chiffres mis en avant (3-2-1, points gagnés).
  textHuge: 64,
  // Écrans de partie (maquette mobile).
  choiceHeight: 82,
  choiceLetter: 54,
  cardBorder: 5,
  ringSize: 112,
  ringWidth: 12,
  timebarHeight: 10,
  submitHeight: 58,
  fieldHeight: 60,
  timebarDigits: 40,
  // Barre des contrôles de l'hôte (pied d'écran).
  hostBarHeight: 52,
  // Pendant que l'hôte dessine : barre plus basse, le dessin garde la place.
  hostBarCompactHeight: 40,
  // Icône Cast native de l'hôte (zone tactile).
  castIconSize: 48,
  // Écran de question mobile : hauteur des pilules selon la place disponible (plancher, plafond).
  choiceHeightLarge: 116,
  choiceHeightMin: 72,
  coinSize: 224,
  coinBorder: 8,
  podiumWidth: 100,
  // Catalogue : affiches portrait (hauteur = largeur × ratio), gros chiffres du Top 10.
  posterRatio: 1.5,
  posterRadius: 14,
  posterMinWidth: 96,
  posterMaxWidth: 132,
  featuredNumber: 108,
  chipHeight: 40,
  tabUnderline: 3,
  // Salon sans TV (maquette N2) : le code en très grand (« MMMM » tient à 320 px).
  lobbyHeroCode: 64,
  // Salon : icône ronde « Son » de l'en-tête.
  roundIconButton: 44,
  // Salon : grille des joueurs (cercle de l'avatar, largeur d'une case).
  lobbyGridAvatar: 52,
  // 76 : un pseudo de 12 caractères tient sur une ligne (PlayerName) ; 4 cases par ligne dès 360 px.
  lobbyGridCell: 76,
  // Salon : QR code (scanné de près, de téléphone à téléphone).
  qrSize: 152,
  qrQuietZone: 4,
} as const;

// Ombre dure décalée, sans flou.
export const AppShadows = {
  hard: '0px 7px 0px rgba(0, 0, 0, 0.35)',
  // Ombre dure encre (tuiles de l'accueil).
  hardInk: `0px 7px 0px ${Palette.ink}`,
  // Bouton d'envoi des réponses écrites (maquette S1).
  submit: `0px 5px 0px ${Palette.ink}`,
  submitPressed: `0px 2px 0px ${Palette.ink}`,
  pressed: '0px 3px 0px rgba(0, 0, 0, 0.35)',
  textColor: 'rgba(0, 0, 0, 0.35)',
} as const;
