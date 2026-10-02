import { Redirect, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ChoiceChips, type Choice } from '@/components/host/ChoiceChips';
import { PlayerGame } from '@/components/player/game/PlayerGame';
import { JoinHeader } from '@/components/player/JoinHeader';
import { PlayerLobby } from '@/components/player/PlayerLobby';
import { BigButton } from '@/components/ui/BigButton';
import { Screen } from '@/components/ui/Screen';
import { textStyles } from '@/components/ui/textStyles';
import { AppColors, AppFonts, AppSizes } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import {
  buildScenario,
  DEMO_CODE,
  DEMO_UID,
  isScenarioId,
  SCENARIO_LABELS,
  type Scenario,
  type ScenarioId,
} from '@/debug/playerScenarios';
import { isPublishedWeb } from '@/lib/platform';

// Délai simulé entre l'appui et la confirmation de l'écriture.
const SIMULATED_WRITE_MS = 800;

const SCENARIO_CHOICES: Choice<ScenarioId>[] = (Object.keys(SCENARIO_LABELS) as ScenarioId[]).map((id) => ({
  value: id,
  label: SCENARIO_LABELS[id],
}));

// Démo des écrans du joueur, absente du site des joueurs (redirigé vers /join).
// Adresse : /debug/player?s=revealCorrect pour ouvrir un scénario ; &capture=1 masque le
// bouton de démo (captures d'écran).
export default function PlayerDemoRoute() {
  return isPublishedWeb ? <Redirect href="/join" /> : <PlayerDemoScreen />;
}

function PlayerDemoScreen() {
  const params = useLocalSearchParams<{ s?: string; capture?: string }>();
  const initialId: ScenarioId = isScenarioId(params.s) ? params.s : 'questionShort';
  const isCapture = params.capture === '1';
  const [scenarioId, setScenarioId] = useState<ScenarioId>(initialId);
  // Reconstruit à chaque choix (même scénario re-choisi) : les chronos repartent de maintenant.
  const [scenario, setScenario] = useState<Scenario>(() => buildScenario(initialId, Date.now()));
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  function selectScenario(id: ScenarioId) {
    setScenarioId(id);
    setScenario(buildScenario(id, Date.now()));
    setIsPanelOpen(false);
  }

  // Simule l'écriture : « envoi » immédiat, puis confirmation après un court délai.
  function answer(choice: number) {
    setScenario((current) => ({ ...current, answer: { kind: 'sending', choice } }));
  }

  const sendingChoice = scenario.answer.kind === 'sending' ? scenario.answer.choice : null;
  useEffect(() => {
    if (sendingChoice === null) return;
    const timeoutId = setTimeout(
      () => setScenario((current) => ({ ...current, answer: { kind: 'sent', choice: sendingChoice } })),
      SIMULATED_WRITE_MS,
    );
    return () => clearTimeout(timeoutId);
  }, [sendingChoice]);

  return (
    <View style={styles.root}>
      {scenarioId === 'lobby' ? (
        <Screen footer={<BigButton label={strings.profile.editButton} variant="secondary" onPress={() => {}} />}>
          <JoinHeader code={DEMO_CODE} />
          <PlayerLobby uid={DEMO_UID} players={scenario.session.players} />
        </Screen>
      ) : (
        <PlayerGame
          // Nouvelle clé à chaque scénario : les écrans repartent de leur état initial.
          key={scenario.session.phaseStartedAt}
          session={scenario.session}
          uid={DEMO_UID}
          serverOffsetMs={0}
          answer={scenario.answer}
          onAnswer={answer}
        />
      )}

      {!isCapture && (
        <DemoPanel
          isOpen={isPanelOpen}
          selected={scenarioId}
          onToggle={() => setIsPanelOpen(!isPanelOpen)}
          onSelect={selectScenario}
        />
      )}
    </View>
  );
}

interface DemoPanelProps {
  isOpen: boolean;
  selected: ScenarioId;
  onToggle: () => void;
  onSelect: (id: ScenarioId) => void;
}

// Bouton flottant discret ; ouvert, il affiche la liste des scénarios par-dessus l'écran.
function DemoPanel({ isOpen, selected, onToggle, onSelect }: DemoPanelProps) {
  return (
    <>
      {isOpen && (
        <View style={styles.panel}>
          <ScrollView contentContainerStyle={styles.panelContent}>
            <Text style={textStyles.label}>{strings.playerDemo.title}</Text>
            <Text style={textStyles.muted}>{strings.playerDemo.hint}</Text>
            <ChoiceChips choices={SCENARIO_CHOICES} selected={selected} onSelect={onSelect} />
          </ScrollView>
        </View>
      )}
      <Pressable accessibilityRole="button" onPress={onToggle} style={styles.toggle}>
        <Text style={styles.toggleText}>{isOpen ? strings.playerDemo.close : strings.playerDemo.open}</Text>
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  panel: {
    position: 'absolute',
    left: Spacing.three,
    right: Spacing.three,
    bottom: 80,
    maxHeight: '70%',
    borderRadius: AppSizes.radiusCard,
    backgroundColor: AppColors.inkSurface,
  },
  panelContent: {
    gap: Spacing.two,
    padding: Spacing.three,
  },
  toggle: {
    position: 'absolute',
    right: Spacing.three,
    bottom: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: AppSizes.radiusPill,
    backgroundColor: AppColors.inkSurface,
    opacity: 0.85,
  },
  toggleText: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.black,
    fontSize: 14,
  },
});
