import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { textStyles } from '@/components/ui/textStyles';
import { AppColors, AppFonts, AppSizes, DISPLAY_LINE_HEIGHT } from '@/constants/appTheme';
import { strings, type GameType } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

import { GameTile } from './GameTile';

const GAMES: readonly GameType[] = ['quiz', 'blindTest', 'bluff', 'draw'];
const TITLE_SIZE = 28;

// « Bientôt » si l'interrupteur à distance du jeu est coupé.
function isGameOff(game: GameType, isBlindTestEnabled: boolean, isDrawEnabled: boolean): boolean {
  return (game === 'blindTest' && !isBlindTestEnabled) || (game === 'draw' && !isDrawEnabled);
}

interface HomeViewProps {
  onOpenGame: (game: GameType) => void;
  // Affiché sous le titre (« Reprendre la partie »).
  banner?: ReactNode;
  // Interrupteurs à distance : la tuile reste visible mais « Bientôt » si son jeu est coupé.
  isBlindTestEnabled: boolean;
  isDrawEnabled: boolean;
}

// Accueil de l'hôte (maquette H1, « grille 2 × 2 ») : logo, « À quoi on joue ? », une tuile par jeu, qui
// ouvre le catalogue de ce jeu. Pas de recherche ici : elle reste dans chaque catalogue.
export function HomeView({ onOpenGame, banner, isBlindTestEnabled, isDrawEnabled }: HomeViewProps) {
  return (
    <View style={styles.column}>
      <Text style={styles.brand}>{strings.join.appName}</Text>
      <View style={styles.titles}>
        <Text style={styles.title}>{strings.home.title}</Text>
        <Text style={[textStyles.body, styles.subtitle]}>{strings.home.subtitle}</Text>
      </View>
      {banner}
      <View style={styles.grid}>
        {GAMES.map((game) => (
          <GameTile
            key={game}
            game={game}
            isSoon={isGameOff(game, isBlindTestEnabled, isDrawEnabled)}
            onPress={() => onOpenGame(game)}
          />
        ))}
      </View>
      <Text style={[textStyles.muted, styles.footer]}>{strings.home.footer}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  column: {
    gap: Spacing.four,
  },
  brand: {
    color: AppColors.accent,
    fontFamily: AppFonts.display,
    fontSize: AppSizes.textLarge,
    lineHeight: Math.round(AppSizes.textLarge * DISPLAY_LINE_HEIGHT),
    textTransform: 'uppercase',
  },
  titles: {
    gap: Spacing.one,
  },
  title: {
    color: AppColors.text,
    fontFamily: AppFonts.display,
    fontSize: TITLE_SIZE,
    lineHeight: Math.round(TITLE_SIZE * DISPLAY_LINE_HEIGHT),
    textTransform: 'uppercase',
  },
  subtitle: {
    color: AppColors.textMuted,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  footer: {
    textAlign: 'center',
  },
});
