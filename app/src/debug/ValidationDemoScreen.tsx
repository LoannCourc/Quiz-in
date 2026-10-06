import type { ValidationDecisions } from '@shared/freeAnswers';
import type { Answer, Player, PlayerId, Question, Session } from '@shared/types';
import { expectedAnswer, reviewCounts, reviewGroups } from '@shared/validationReview';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { HostControlsBar } from '@/components/host/HostControls';
import { HostValidation } from '@/components/host/validation/HostValidation';
import { BigButton } from '@/components/ui/BigButton';
import { Screen } from '@/components/ui/Screen';
import { textStyles } from '@/components/ui/textStyles';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

// Démo de la validation de l'hôte (Contrôle, maquette V1), en développement seulement :
// /debug/validation (quiz) ou /debug/validation?both=1 (blind test, titre et artiste).
// Les coches, l'œil et « Valider » sont actifs ; rien n'est écrit dans la base.

const NAMES: [PlayerId, string, string][] = [
  ['lea', 'Léa', '🦊'],
  ['paul', 'Paul', '🐸'],
  ['chloe', 'Chloé', '🐙'],
  ['ines', 'Inès', '🐼'],
  ['noe', 'Noé', '🦖'],
  ['sam', 'Sam', '🦄'],
  ['max', 'Max', '🐯'],
];

const PLAYERS: Record<PlayerId, Player> = Object.fromEntries(
  NAMES.map(([id, name, avatar]) => [id, { name, avatar, score: 0, rank: 1, connected: true }]),
);

const QUIZ_QUESTION: Question = {
  id: 'demo-waterloo',
  text: 'Qui a perdu la bataille de Waterloo en 1815 ?',
  options: ['Wellington', 'Napoléon Ier', 'Blücher', 'Nelson'],
  correctIndex: 1,
  acceptedAnswers: ['napoléon ier', 'napoléon', 'bonaparte'],
  difficulty: 2,
};

const BLIND_TEST_QUESTION: Question = {
  id: 'demo-satisfaction',
  text: 'Quel est ce morceau ?',
  options: ['Satisfaction – The Rolling Stones', 'Hey Jude – The Beatles', 'My Generation – The Who', 'Gloria – Them'],
  correctIndex: 0,
  acceptedAnswers: ['satisfaction', 'satisfaction – the rolling stones'],
  difficulty: 1,
  ask: 'both',
  music: { source: 'deezer', id: '0', title: 'Satisfaction', artist: 'The Rolling Stones', artistAliases: ['Stones'] },
};

function answer(value: string, artist?: string): Answer {
  return artist === undefined ? { value, submittedAt: 0 } : { value, artist, submittedAt: 0 };
}

const QUIZ_ANSWERS: Record<PlayerId, Answer> = {
  lea: answer('Napoléon'),
  paul: answer('napoleon'),
  chloe: answer('Napoléon'),
  ines: answer('Napoléonn'),
  noe: answer('Napoleon Bonaparte'),
  sam: answer('Wellington'),
  max: answer('Merde alors'),
};

const BLIND_TEST_ANSWERS: Record<PlayerId, Answer> = {
  lea: answer('Satisfaction', 'Rolling Stones'),
  paul: answer('satisfaction', 'rolling stones'),
  chloe: answer('Satisfaction', 'Stones'),
  ines: answer('Paint it black', 'Rolling Stones'),
  noe: answer('Satisfaction Rolling Stones'),
};

function demoSession(isBlindTest: boolean): Session {
  return {
    hostUid: 'lea',
    quizId: 'demo',
    status: 'validation',
    settings: { answerMode: 'free', speedBonus: true, control: true, teams: false },
    currentIndex: isBlindTest ? 3 : 2,
    questionCount: 10,
    phaseStartedAt: 0,
    phaseEndsAt: 0,
    players: PLAYERS,
    answers: { [isBlindTest ? 3 : 2]: isBlindTest ? BLIND_TEST_ANSWERS : QUIZ_ANSWERS },
  };
}

export default function ValidationDemoScreen() {
  const params = useLocalSearchParams<{ both?: string }>();
  const isBlindTest = params.both === '1';
  const [session] = useState(() => demoSession(isBlindTest));
  const [decisions, setDecisions] = useState<ValidationDecisions>({});
  const [validated, setValidated] = useState(false);
  const question = isBlindTest ? BLIND_TEST_QUESTION : QUIZ_QUESTION;
  const groups = reviewGroups(question, session.answers?.[session.currentIndex] ?? {}, Object.keys(session.players), decisions);

  const footer = (
    <View style={styles.footer}>
      {validated && <Text style={[textStyles.muted, styles.centered]}>{strings.playerDemo.validated}</Text>}
      <Text style={[textStyles.muted, styles.centered]}>{strings.hostValidation.counts(reviewCounts(groups))}</Text>
      <BigButton label={strings.hostControls.validate} onPress={() => setValidated(true)} />
      <HostControlsBar onPress={() => {}} />
    </View>
  );

  return (
    <Screen footer={footer}>
      <HostValidation
        session={session}
        question={question}
        expected={expectedAnswer(question)}
        groups={groups}
        decisions={decisions}
        onChange={setDecisions}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  footer: {
    gap: Spacing.two,
  },
  centered: {
    textAlign: 'center',
  },
});
