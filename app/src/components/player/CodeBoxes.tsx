import { ROOM_CODE_LENGTH } from '@shared/constants';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppColors, AppFonts, AppShadows, DISPLAY_LINE_HEIGHT } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

const BOX_WIDTH = 60;
const BOX_HEIGHT = 72;
const BOX_RADIUS = 16;
const BOX_BORDER = 3;
const CHAR_SIZE = 34;

interface CodeBoxesProps {
  // Code déjà normalisé (majuscules, caractères permis).
  code: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
}

// Code de la partie en quatre cases (maquette J2) : un seul champ invisible posé sur les cases reçoit la
// saisie (clavier, collage, saisie automatique) ; les cases montrent les caractères, la case en cours en
// cyan. Un appui n'importe où sur les cases rouvre le clavier.
export function CodeBoxes({ code, onChangeText, onSubmit }: CodeBoxesProps) {
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(true);
  const current = Math.min(code.length, ROOM_CODE_LENGTH - 1);
  return (
    <Pressable accessible={false} onPress={() => inputRef.current?.focus()} style={styles.row}>
      {Array.from({ length: ROOM_CODE_LENGTH }, (_, index) => (
        <View key={index} style={[styles.box, isFocused && index === current && styles.boxCurrent]}>
          <Text style={styles.char} allowFontScaling={false}>
            {code[index] ?? ''}
          </Text>
        </View>
      ))}
      <TextInput
        ref={inputRef}
        value={code}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        maxLength={ROOM_CODE_LENGTH}
        autoFocus
        autoCapitalize="characters"
        autoCorrect={false}
        autoComplete="off"
        spellCheck={false}
        returnKeyType="go"
        caretHidden
        accessibilityLabel={strings.join.codeAccessibility}
        style={styles.hiddenInput}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.three,
  },
  box: {
    width: BOX_WIDTH,
    height: BOX_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BOX_RADIUS,
    borderWidth: BOX_BORDER,
    borderColor: AppColors.fieldIdleBorder,
    backgroundColor: AppColors.card,
    boxShadow: AppShadows.hard,
  },
  boxCurrent: {
    borderColor: AppColors.link,
  },
  char: {
    color: AppColors.ink,
    fontFamily: AppFonts.display,
    fontSize: CHAR_SIZE,
    lineHeight: Math.round(CHAR_SIZE * DISPLAY_LINE_HEIGHT),
  },
  // Champ réel, transparent, sur toute la rangée : il reçoit la saisie sans se voir.
  hiddenInput: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    color: 'transparent',
    opacity: 0.01,
    outlineWidth: 0,
    outlineColor: 'transparent',
  },
});
