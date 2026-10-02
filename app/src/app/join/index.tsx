import { ROOM_CODE_LENGTH } from '@shared/constants';
import { isValidRoomCode, normalizeRoomCode } from '@shared/roomCode';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { BigButton } from '@/components/ui/BigButton';
import { Screen } from '@/components/ui/Screen';
import { textStyles } from '@/components/ui/textStyles';
import { AppColors } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

// Saisie du code de salle, pour ceux qui n'ont pas scanné le QR code.
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

  return (
    <Screen>
      <Text style={textStyles.title}>{strings.join.appName}</Text>
      <Text style={[textStyles.label, styles.centered]}>{strings.join.codeTitle}</Text>

      <View style={styles.field}>
        <Text style={textStyles.muted}>{strings.join.codeLabel}</Text>
        <TextInput
          value={code}
          onChangeText={(text) => {
            setRawCode(text);
            setError(null);
          }}
          onSubmitEditing={submit}
          placeholder={strings.join.codePlaceholder}
          placeholderTextColor={AppColors.textMuted}
          maxLength={ROOM_CODE_LENGTH}
          autoCapitalize="characters"
          autoCorrect={false}
          autoComplete="off"
          returnKeyType="go"
          style={[textStyles.input, styles.codeInput]}
        />
      </View>

      {error && <Text style={textStyles.error}>{error}</Text>}

      <BigButton
        label={strings.join.codeButton}
        onPress={submit}
        disabled={code.length !== ROOM_CODE_LENGTH}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  centered: {
    textAlign: 'center',
  },
  field: {
    gap: Spacing.two,
  },
  codeInput: {
    textAlign: 'center',
    fontSize: 40,
    letterSpacing: 12,
  },
});
