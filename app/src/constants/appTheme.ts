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
} as const;

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
} as const;

// Fond : dégradé radial centré en haut, en syntaxe CSS (Android et web).
export const AppBackground = `radial-gradient(ellipse 120% 90% at 50% 0%, ${Palette.bgTop} 0%, ${Palette.bgMiddle} 45%, ${Palette.bgBottom} 100%)`;

// Une famille par graisse : sur Android, fontWeight ne choisit pas la graisse d'une police
// chargée à part. Les noms sont ceux enregistrés au chargement (app/_layout.tsx).
export const AppFonts = {
  display: 'BowlbyOne',
  bold: 'Nunito-Bold',
  extraBold: 'Nunito-ExtraBold',
  black: 'Nunito-Black',
} as const;

// Bowlby One a des accents hauts : hauteur de ligne d'au moins 1,3 fois la taille.
export const DISPLAY_LINE_HEIGHT = 1.3;

// Tailles pensées pour un téléphone tenu à une main.
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
  // Compte à rebours et chiffres mis en avant (3-2-1, points gagnés).
  textHuge: 64,
} as const;

// Ombre dure décalée, sans flou.
export const AppShadows = {
  hard: '0px 7px 0px rgba(0, 0, 0, 0.35)',
  pressed: '0px 3px 0px rgba(0, 0, 0, 0.35)',
} as const;
