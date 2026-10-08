import { ROOM_CODE_LENGTH } from '@shared/constants';
import { isValidRoomCode, normalizeRoomCode } from '@shared/roomCode';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { CodeBoxes } from '@/components/player/CodeBoxes';
import { JoinTopBar } from '@/components/player/JoinTopBar';
import { Screen } from '@/components/ui/Screen';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { textStyles } from '@/components/ui/textStyles';
import { AppColors, AppFonts } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

const QUESTION_SIZE = 20;

// Saisie du code de la partie (maquette J2), pour ceux qui n'ont pas scanné le QR code : ouvert depuis
// l'accueil de l'hôte (« J'ai un code ») ou sur le site des joueurs. « Continuer » mène à J3.
export default function JoinCodeScreen() {
  const [rawCode, setRawCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const code = normalizeRoomCode(rawCode);

  function submit() {
    if (!isValidRoomCode(code)) {
      setError(strings.join.invalidCode);
      return;
    }
    router.push({ pathname: '/join/[code]', params: { code } });
  }

  const footer = (
    <SubmitButton label={strings.join.codeButton} onPress={submit} disabled={code.length !== ROOM_CODE_LENGTH} />
  );

  return (
    <Screen footer={footer}>
      <JoinTopBar />
      <View style={styles.texts}>
        <Text style={styles.question}>{strings.join.codeQuestion}</Text>
        <Text style={styles.where}>{strings.join.codeWhere}</Text>
      </View>
      <View style={styles.code}>
        <CodeBoxes
          code={code}
          onChangeText={(text) => {
            setRawCode(text);
            setError(null);
          }}
          onSubmit={submit}
        />
        <Text style={styles.hint}>{strings.join.codeHint}</Text>
      </View>
      {error && <Text style={[textStyles.error, styles.centered]}>{error}</Text>}
    </Screen>
  );
}

const styles = StyleSheet.create({
  texts: {
    gap: Spacing.one,
  },
  question: {
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: QUESTION_SIZE,
  },
  where: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.bold,
    fontSize: 14,
  },
  code: {
    gap: Spacing.three,
  },
  hint: {
    color: AppColors.questionMeta,
    fontFamily: AppFonts.bold,
    fontSize: 13,
    textAlign: 'center',
  },
  centered: {
    textAlign: 'center',
  },
});
