// Couleurs de l'app (hôte et joueurs) : mêmes valeurs que le récepteur TV (receiver/src/index.css).
export const AppColors = {
  background: '#0e1430',
  surface: '#1f2a55',
  text: '#ffffff',
  textMuted: '#b8c2e8',
  accent: '#ffd23f',
  onAccent: '#1a1300',
  wrong: '#ff5c6c',
} as const;

// Tailles pensées pour un téléphone tenu à une main.
export const AppSizes = {
  contentMaxWidth: 480,
  buttonHeight: 64,
  avatarCell: 52,
  radius: 16,
  textBody: 18,
  textLarge: 24,
  textTitle: 32,
} as const;
