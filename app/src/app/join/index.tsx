import { ROOM_CODE_LENGTH } from '@shared/constants';
import { isValidRoomCode, normalizeRoomCode } from '@shared/roomCode';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { CodeBoxes } from '@/components/player/CodeBoxes';
import { JoinTopBar } from '@/components/player/JoinTopBar';
import { Screen } from '@/components/ui/Screen';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { textStyles } from '@/components/ui/textStyles';
import { AppColors, AppFonts } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import { useFixedPage } from '@/hooks/useFixedPage';
import { useKeyboardInset } from '@/hooks/useKeyboardInset';

const QUESTION_SIZE = 20;
// Hauteur visible (clavier déduit) sous laquelle l'en-tête et les lignes d'aide s'effacent : la page ne
// défile pas, la question, les cases et le bouton doivent tenir (petit iPhone, clavier ouvert : 300 points).
const SHORT_HEIGHT = 480;

// Saisie du code de la partie (maquette J2), pour ceux qui n'ont pas scanné le QR code : ouvert depuis
// l'accueil de l'hôte (« J'ai un code ») ou sur le site des joueurs. « Continuer » mène à J3.
export default function JoinCodeScreen() {
  const [rawCode, setRawCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const code = normalizeRoomCode(rawCode);
  useFixedPage();
  const isShort = useWindowDimensions().height - useKeyboardInset() < SHORT_HEIGHT;

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
    // Sans défilement (iPhone : plus d'espace vide en bas) ; clavier ouvert, Screen garde le bouton au-dessus.
    <Screen footer={footer} scrollable={false}>
      {!isShort && <JoinTopBar />}
      <View style={styles.texts}>
        <Text style={styles.question}>{strings.join.codeQuestion}</Text>
        {!isShort && <Text style={styles.where}>{strings.join.codeWhere}</Text>}
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
        {!isShort && <Text style={styles.hint}>{strings.join.codeHint}</Text>}
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
