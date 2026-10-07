import type { PublicSession } from '@shared/types';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ChoiceChips, type Choice } from '@/components/host/ChoiceChips';
import { PlayerGame } from '@/components/player/game/PlayerGame';
import { NextQuestionBar } from '@/components/player/game/NextQuestionBar';
import type { PhaseTiming } from '@/components/player/game/phaseTiming';
import { QuestionHeader } from '@/components/player/game/QuestionHeader';
import { PlaceBand } from '@/components/player/game/PlaceBand';
import { TransitionSteps } from '@/components/player/game/TransitionSteps';
import { HostControlsBar } from '@/components/host/HostControls';
import { JoinHeader } from '@/components/player/JoinHeader';
import { PlayerLobby } from '@/components/player/PlayerLobby';
import { BigButton } from '@/components/ui/BigButton';
import { Screen } from '@/components/ui/Screen';
import { textStyles } from '@/components/ui/textStyles';
import { AppColors, AppFonts, AppSizes } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import type { PlayerBluff } from '@/lib/playerBluff';
import type { GivenAnswer } from '@/lib/playerGame';
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

// Délai simulé entre l'appui et la confirmation de l'écriture.
const SIMULATED_WRITE_MS = 800;

const SCENARIO_CHOICES: Choice<ScenarioId>[] = (Object.keys(SCENARIO_LABELS) as ScenarioId[]).map((id) => ({
  value: id,
  label: SCENARIO_LABELS[id],
}));

const DEMO_TV_UID = 'demo-tv';

// &streak=N : série du joueur de la démo (spec 18).
function withDemoStreak(session: PublicSession, streak: number): PublicSession {
  const me = session.players[DEMO_UID];
  if (streak <= 0 || !me) return session;
  return { ...session, players: { ...session.players, [DEMO_UID]: { ...me, streak } } };
}

// Démo des écrans du joueur (développement seulement, route /debug/player).
// Adresse : /debug/player?s=revealCorrect pour ouvrir un scénario ; &capture=1 masque le
// bouton de démo (captures d'écran) ; &host=1 ajoute la barre des contrôles de l'hôte ; &tv=1 : une
// TV est présente (Bluff : pas d'énoncé sur le téléphone) ; &streak=4 : série du joueur (badge flamme sur
// l'écran de résultat à partir de 3, après une bonne réponse) ;
// ?bands=1 : bandes « Ta place » de 1 à 20 et avec changement de rang, étapes, en-tête et compte à
// rebours (textes ajustés à leur contenu, voir TEXT_FIT_SAFETY).
export default function PlayerDemoScreen() {
  const params = useLocalSearchParams<{ s?: string; capture?: string; host?: string; bands?: string; tv?: string; streak?: string }>();
  const initialId: ScenarioId = isScenarioId(params.s) ? params.s : 'questionShort';
  const isCapture = params.capture === '1';
  // Barre « Contrôles de l'hôte » (sans action) : vérifier la mise en page de l'écran de l'hôte.
  const hostFooter = params.host === '1' ? <HostControlsBar onPress={() => {}} /> : undefined;
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
  function answer(given: GivenAnswer) {
    setScenario((current) => ({ ...current, answer: { kind: 'sending', given } }));
  }

  const sendingGiven = scenario.answer.kind === 'sending' ? scenario.answer.given : null;
  useEffect(() => {
    if (sendingGiven === null) return;
    const timeoutId = setTimeout(
      () => setScenario((current) => ({ ...current, answer: { kind: 'sent', given: sendingGiven } })),
      SIMULATED_WRITE_MS,
    );
    return () => clearTimeout(timeoutId);
  }, [sendingGiven]);

  // Bluff : proposition acceptée et vote confirmé après le même délai simulé.
  function updateBluff(change: Partial<NonNullable<Scenario['bluff']>>) {
    setScenario((current) => (current.bluff ? { ...current, bluff: { ...current.bluff, ...change } } : current));
  }
  const bluff: PlayerBluff | null = scenario.bluff
    ? {
        ...scenario.bluff,
        onSubmit: (text) => {
          updateBluff({ send: { kind: 'sending', text } });
          setTimeout(() => {
            const submittedAt = Date.now();
            updateBluff({ send: { kind: 'idle' }, entry: { text, submittedAt }, check: { verdict: 'ok', refusals: 0, submittedAt } });
          }, SIMULATED_WRITE_MS);
        },
        onVote: (choice) => {
          updateBluff({ vote: { kind: 'sending', choice } });
          setTimeout(() => updateBluff({ vote: { kind: 'sent', choice } }), SIMULATED_WRITE_MS);
        },
      }
    : null;

  if (params.bands === '1') return <PlaceBandGallery />;

  return (
    <View style={styles.root}>
      {scenario.session.status === 'lobby' ? (
        <Screen footer={<BigButton label={strings.profile.editButton} variant="secondary" onPress={() => {}} />}>
          <JoinHeader code={DEMO_CODE} />
          <PlayerLobby
            uid={DEMO_UID}
            players={scenario.session.players}
            teams={
              scenario.session.settings.teams
                ? {
                    settings: scenario.session.settings,
                    // Démo : le choix s'applique sur place.
                    onChoose: (team) =>
                      setScenario((current) => ({
                        ...current,
                        session: {
                          ...current.session,
                          players: { ...current.session.players, [DEMO_UID]: { ...current.session.players[DEMO_UID], team } },
                        },
                      })),
                    error: null,
                  }
                : undefined
            }
          />
        </Screen>
      ) : (
        <PlayerGame
          // Nouvelle clé à chaque scénario : les écrans repartent de leur état initial.
          key={scenario.session.phaseStartedAt}
          session={withDemoStreak(params.tv === '1' ? { ...scenario.session, tvPresence: { [DEMO_TV_UID]: true } } : scenario.session, Number(params.streak) || 0)}
          uid={DEMO_UID}
          serverOffsetMs={0}
          answer={scenario.answer}
          onAnswer={answer}
          bluff={bluff}
          draw={scenario.draw ? { word: scenario.draw.word, onChunk: () => {} } : null}
          footer={hostFooter}
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

// Rangs dans l'équipe de 1 à 10 (au plus 20 joueurs en 2 équipes).
const BAND_RANKS = Array.from({ length: 10 }, (_, index) => index + 1);

// Textes qui épousent leur contenu, tous au même endroit : sur Android 15+, le dernier mot de l'un
// d'eux pouvait disparaître (« TA » au lieu de « TA PLACE », voir TEXT_FIT_SAFETY). Page à ouvrir sur
// le téléphone (build de développement), aussi avec une taille de police système agrandie.
function PlaceBandGallery() {
  // Compte à rebours de 9 s, fixé au premier affichage.
  const [countdown] = useState<PhaseTiming>(() => {
    const now = Date.now();
    return { phaseStartedAt: now, phaseEndsAt: now + 9_000, serverOffsetMs: 0 };
  });
  return (
    <Screen>
      <View style={styles.gallery}>
        <QuestionHeader index={2} questionCount={10} score={1242} />
        <TransitionSteps active={0} />
        <TransitionSteps active={1} />
        <TransitionSteps active={0} withRanking={false} />
        <NextQuestionBar timing={countdown} isLastQuestion={false} />
        {BAND_RANKS.map((rank) => (
          <PlaceBand key={rank} label={strings.teams.game.inYourTeam} rank={rank} suffix={strings.teams.game.outOf(10)} />
        ))}
      </View>
    </Screen>
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
  gallery: {
    gap: Spacing.two,
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
