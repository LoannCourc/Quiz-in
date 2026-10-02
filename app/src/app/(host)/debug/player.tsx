import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ChoiceChips, type Choice } from '@/components/host/ChoiceChips';
import { PlayerGame } from '@/components/player/game/PlayerGame';
import { Screen } from '@/components/ui/Screen';
import { textStyles } from '@/components/ui/textStyles';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import { buildScenario, DEMO_UID, SCENARIO_LABELS, type Scenario, type ScenarioId } from '@/debug/playerScenarios';
import { isPublishedWeb } from '@/lib/platform';

// Délai simulé entre l'appui et la confirmation de l'écriture.
const SIMULATED_WRITE_MS = 800;

const SCENARIO_CHOICES: Choice<ScenarioId>[] = (Object.keys(SCENARIO_LABELS) as ScenarioId[]).map((id) => ({
  value: id,
  label: SCENARIO_LABELS[id],
}));

// Démo des écrans du joueur, absente du site des joueurs (redirigé vers /join).
export default function PlayerDemoRoute() {
  return isPublishedWeb ? <Redirect href="/join" /> : <PlayerDemoScreen />;
}

function PlayerDemoScreen() {
  const [scenarioId, setScenarioId] = useState<ScenarioId>('questionShort');
  // Reconstruit à chaque choix (même scénario re-choisi) : les chronos repartent de maintenant.
  const [scenario, setScenario] = useState<Scenario>(() => buildScenario('questionShort', Date.now()));

  function selectScenario(id: ScenarioId) {
    setScenarioId(id);
    setScenario(buildScenario(id, Date.now()));
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
    <Screen>
      <View style={styles.header}>
        <Text style={textStyles.label}>{strings.playerDemo.title}</Text>
        <Text style={textStyles.muted}>{strings.playerDemo.hint}</Text>
        <ChoiceChips choices={SCENARIO_CHOICES} selected={scenarioId} onSelect={selectScenario} />
      </View>

      <PlayerGame
        // Nouvelle clé à chaque scénario : les écrans repartent de leur état initial.
        key={scenario.session.phaseStartedAt}
        session={scenario.session}
        uid={DEMO_UID}
        serverOffsetMs={0}
        answer={scenario.answer}
        onAnswer={answer}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: Spacing.two,
  },
});
