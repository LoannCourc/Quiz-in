import { earnedBadges, emptyBadgeState, type BadgeCounters, type BadgeId, type BadgeState } from '@shared/badges';
import { StyleSheet, Text, View } from 'react-native';

import { BigButton } from '@/components/ui/BigButton';
import { textStyles } from '@/components/ui/textStyles';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import { writeBadgeStateForDev } from '@/lib/badgeStore';

const texts = strings.trophies.dev;

// État de la maquette G1 : 15 badges débloqués sur 39 (Touche-à-tout : chacun des trois jeux ouverts).
function sampleState(): BadgeState {
  const empty = emptyBadgeState();
  const counters: BadgeCounters = {
    ...empty.counters,
    completed: 112,
    wins: 9,
    losses: 14,
    winStreak: 2,
    bestWinStreak: 4,
    maxPlayers: 12,
    perGame: { quiz: 100, blindTest: 0, bluff: 6, draw: 6 },
    maxQuizQuestions: 10,
    fastestCorrectMs: 4100,
    bluffFooled: 14,
    drawGuessed: 3,
    playedDays: ['2026-10-01', '2026-10-05', '2026-10-12', '2026-10-19', '2026-10-23'],
    perfect: 1,
    shared: 1,
  };
  const now = Date.now();
  const unlocked = Object.fromEntries(earnedBadges(counters, ['quiz', 'bluff', 'draw']).map((id) => [id, now]));
  return { ...empty, counters, unlocked };
}

interface DevBadgeToolsProps {
  onChanged: () => void;
  onPreview: (badges: BadgeId[]) => void;
}

// Développement seulement (chargé sous __DEV__ par l'écran « Mes badges ») : remplace les badges de ce téléphone
// par l'exemple ou les remet à zéro, et montre la notification ou la fenêtre du badge ultime sans jouer.
export function DevBadgeTools({ onChanged, onPreview }: DevBadgeToolsProps) {
  async function write(state: BadgeState) {
    await writeBadgeStateForDev(state);
    onChanged();
  }
  return (
    <View style={styles.box}>
      <Text style={textStyles.label}>{texts.title}</Text>
      <BigButton label={texts.sample} variant="secondary" size="compact" onPress={() => void write(sampleState())} />
      <BigButton label={texts.reset} variant="secondary" size="compact" onPress={() => void write(emptyBadgeState())} />
      <BigButton label={texts.notice} variant="secondary" size="compact" onPress={() => onPreview(['lightning.1'])} />
      <BigButton label={texts.ultimate} variant="secondary" size="compact" onPress={() => onPreview(['played.3', 'lightning.1'])} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    gap: Spacing.two,
    marginTop: Spacing.four,
  },
});
