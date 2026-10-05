import type { PosterPalette, TeamId } from '@shared/types';
import { Platform } from 'react-native';

// Direction artistique « Plateau TV » : seul endroit où l'app définit couleurs, polices et formes.
// Mêmes valeurs que le récepteur TV (receiver/src/theme.css). Les écrans n'utilisent que ces tokens.

const Palette = {
  ink: '#1b0a45',
  white: '#ffffff',
  pink: '#ff3d8b',
  pinkLight: '#ff6fa8',
  cyan: '#3fe9ff',
  gold: '#ffd23d',
  green: '#7dff9a',
  lavender: '#c9b8ff',
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
  card: Palette.white,
  text: Palette.white,
  textMuted: Palette.lavender,
  ink: Palette.ink,
  accent: Palette.gold,
  onAccent: Palette.ink,
  highlight: Palette.pink,
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
  ring: Palette.pink,
  ringTrack: Palette.track,
  // Barre de temps mobile : même rose que l'anneau, sur blanc translucide.
  timebarTrack: 'rgba(255, 255, 255, 0.18)',
  // Pastille « encre » : lettre des réponses, centre de l'anneau, bandeau « Ta place ».
  inkSurface: Palette.ink,
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
  // Fond du QR code et de ses marges : contraste maximal avec les modules encre.
  qrBackground: Palette.white,
  qrModule: Palette.ink,
  // Groupe : couleur de chaque équipe (toujours accompagnée de son symbole), symbole en encre.
  teams: { pink: Palette.pink, cyan: Palette.cyan, gold: Palette.gold, green: Palette.green } satisfies Record<TeamId, string>,
  onTeam: Palette.ink,
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
// chargée à part. Les noms sont ceux enregistrés au chargement (app/_layout.tsx).
export const AppFontNames = {
  display: 'BowlbyOne',
  bold: 'Nunito-Bold',
  extraBold: 'Nunito-ExtraBold',
  black: 'Nunito-Black',
} as const;

// Famille utilisée par les écrans. Web : pile CSS avec repli sans-serif, si un fichier de police ne se
// charge pas (sinon le navigateur affiche sa police à empattements). Android : le nom seul, obligatoire.
function withWebFallback(name: string): string {
  return Platform.OS === 'web' ? `${name}, sans-serif` : name;
}

export const AppFonts = {
  display: withWebFallback(AppFontNames.display),
  bold: withWebFallback(AppFontNames.bold),
  extraBold: withWebFallback(AppFontNames.extraBold),
  black: withWebFallback(AppFontNames.black),
};

// Bowlby One a des accents hauts : hauteur de ligne d'au moins 1,3 fois la taille.
export const DISPLAY_LINE_HEIGHT = 1.3;

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
  timebarHeight: 15,
  timebarDigits: 40,
  // Barre des contrôles de l'hôte (pied d'écran).
  hostBarHeight: 52,
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
  // Salon : chiffres du code, avatars de la liste, QR code (scanné de près, de téléphone à téléphone).
  lobbyCode: 56,
  lobbyAvatar: 40,
  qrSize: 152,
  qrQuietZone: 4,
} as const;

// Ombre dure décalée, sans flou.
export const AppShadows = {
  hard: '0px 7px 0px rgba(0, 0, 0, 0.35)',
  pressed: '0px 3px 0px rgba(0, 0, 0, 0.35)',
  textColor: 'rgba(0, 0, 0, 0.35)',
} as const;
