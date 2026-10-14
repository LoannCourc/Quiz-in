import { HOME_ROWS_GAP, HOME_TILE_MAX_HEIGHT, type HomeTileDensity } from '@shared/homeLayout';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Logo } from '@/components/ui/Logo';
import { ButtonLabel } from '@/components/ui/ButtonLabel';
import { KeyboardIcon } from '@/components/ui/KeyboardIcon';
import { textStyles } from '@/components/ui/textStyles';
import { AppColors, AppFonts, AppSizes, DISPLAY_LINE_HEIGHT } from '@/constants/appTheme';
import { strings, type GameType } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

import { GameTile } from './GameTile';

const GAMES: readonly GameType[] = ['quiz', 'blindTest', 'bluff', 'draw'];
const TITLE_SIZE = 28;
const TITLE_SIZE_COMPACT = 22;
const JOIN_HEIGHT_COMPACT = 48;
const JOIN_ICON_SIZE = 22;

// « Bientôt » si l'interrupteur à distance du jeu est coupé.
function isGameOff(game: GameType, isBlindTestEnabled: boolean, isDrawEnabled: boolean): boolean {
  return (game === 'blindTest' && !isBlindTestEnabled) || (game === 'draw' && !isDrawEnabled);
}

interface HomeViewProps {
  onOpenGame: (game: GameType) => void;
  // Bandeau en haut (« Reprendre la partie », choix du prochain jeu) ; il remplace « À quoi on joue ? » et
  // son sous-titre, pour que les tuiles tiennent sans défilement.
  banner?: ReactNode;
  // Interrupteurs à distance : la tuile reste visible mais « Bientôt » si son jeu est coupé.
  isBlindTestEnabled: boolean;
  isDrawEnabled: boolean;
  // Maquette J1 : rejoindre la partie d'un autre hôte avec son code (absent : pas de bouton).
  onJoinWithCode?: () => void;
  // Sans défilement : les tuiles prennent la hauteur restante (deux rangées, densité donnée), les blocs sont
  // espacés de gap ; la hauteur de leur zone est mesurée (onGridHeight) pour choisir la densité.
  // isCompact : écran bas (sous-titre effacé, logo, titre et bouton plus petits).
  fit?: { density: HomeTileDensity; gap: number; isCompact: boolean; onGridHeight: (height: number) => void };
}

// Accueil de l'hôte (maquette H1, « grille 2 × 2 ») : logo, « À quoi on joue ? », une tuile par jeu, qui
// ouvre le catalogue de ce jeu. Pas de recherche ici : elle reste dans chaque catalogue.
export function HomeView({ onOpenGame, banner, isBlindTestEnabled, isDrawEnabled, onJoinWithCode, fit }: HomeViewProps) {
  const isCompact = fit?.isCompact ?? false;
  const tile = (game: GameType) => (
    <GameTile
      key={game}
      game={game}
      isSoon={isGameOff(game, isBlindTestEnabled, isDrawEnabled)}
      onPress={() => onOpenGame(game)}
      density={fit?.density}
      fill={fit !== undefined}
    />
  );
  return (
    <View style={[styles.column, fit && { flex: 1, gap: fit.gap }]}>
      <Logo size={isCompact ? 'small' : 'medium'} align="start" />
      {banner ?? (
        <View style={styles.titles}>
          <Text style={[styles.title, isCompact && styles.titleCompact]}>{strings.home.title}</Text>
          {!isCompact && <Text style={[textStyles.body, styles.subtitle]}>{strings.home.subtitle}</Text>}
        </View>
      )}
      {fit ? (
        <View style={styles.fitGrid} onLayout={(event) => fit.onGridHeight(event.nativeEvent.layout.height)}>
          {[GAMES.slice(0, 2), GAMES.slice(2)].map((row) => (
            <View key={row.join()} style={styles.fitRow}>
              {row.map(tile)}
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.grid}>{GAMES.map(tile)}</View>
      )}
      {onJoinWithCode && (
        <Pressable
          accessibilityRole="button"
          onPress={onJoinWithCode}
          style={({ pressed }) => [styles.joinButton, isCompact && styles.joinCompact, pressed && styles.joinPressed]}>
          <KeyboardIcon size={JOIN_ICON_SIZE} color={AppColors.link} />
          <ButtonLabel inRow style={styles.joinLabel}>
            {strings.home.joinWithCode}
          </ButtonLabel>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  column: {
    gap: Spacing.four,
  },
  joinButton: {
    minHeight: AppSizes.submitHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: AppSizes.radiusPill,
    borderWidth: 3,
    borderColor: AppColors.link,
  },
  joinPressed: {
    opacity: 0.7,
  },
  joinLabel: {
    color: AppColors.link,
    fontFamily: AppFonts.black,
    fontSize: 14,
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
  // Sans défilement : la zone des tuiles prend la place restante ; deux rangées, plafonnées sur grand écran.
  fitGrid: {
    flex: 1,
    minHeight: 0,
    justifyContent: 'center',
    gap: HOME_ROWS_GAP,
  },
  fitRow: {
    flex: 1,
    maxHeight: HOME_TILE_MAX_HEIGHT,
    flexDirection: 'row',
    gap: Spacing.three,
  },
  titleCompact: {
    fontSize: TITLE_SIZE_COMPACT,
    lineHeight: Math.round(TITLE_SIZE_COMPACT * DISPLAY_LINE_HEIGHT),
  },
  joinCompact: {
    minHeight: JOIN_HEIGHT_COMPACT,
  },
});
