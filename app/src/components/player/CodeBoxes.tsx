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

interface Selection {
  start: number;
  end: number;
}

// Case en cyan : le caractère sélectionné (à remplacer), sinon la prochaine case vide ; aucune si le code
// est complet et rien n'est sélectionné.
function currentBox(code: string, selection: Selection): number | null {
  if (selection.end - selection.start === 1) return selection.start;
  return code.length < ROOM_CODE_LENGTH ? Math.min(selection.start, code.length) : null;
}

// Code de la partie en quatre cases (maquette J2) : un seul champ invisible, sous les cases, reçoit la
// saisie ; les cases montrent les caractères. Toucher une case remplie sélectionne son caractère dans le
// champ : le prochain caractère tapé le remplace, sans effacer les autres. Toucher une case vide place
// la saisie à la suite.
export function CodeBoxes({ code, onChangeText, onSubmit }: CodeBoxesProps) {
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(true);
  // Sélection imposée par un appui sur une case ; retirée dès la saisie suivante (le champ reprend la main).
  const [forcedSelection, setForcedSelection] = useState<Selection | undefined>(undefined);
  const [selection, setSelection] = useState<Selection>({ start: code.length, end: code.length });
  const current = isFocused ? currentBox(code, forcedSelection ?? selection) : null;

  function selectBox(index: number) {
    const start = Math.min(index, code.length);
    const next = { start, end: Math.min(start + 1, code.length) };
    setForcedSelection(next);
    setSelection(next);
    inputRef.current?.focus();
  }

  return (
    <View style={styles.row}>
      <TextInput
        ref={inputRef}
        value={code}
        selection={forcedSelection}
        onSelectionChange={(event) => setSelection(event.nativeEvent.selection)}
        onChangeText={(text) => {
          setForcedSelection(undefined);
          onChangeText(text);
        }}
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
      {Array.from({ length: ROOM_CODE_LENGTH }, (_, index) => (
        <Pressable
          key={index}
          accessibilityRole="button"
          accessibilityLabel={strings.join.codeBoxAccessibility(index + 1, code[index])}
          onPress={() => selectBox(index)}
          style={[styles.box, index === current && styles.boxCurrent]}>
          <Text style={styles.char} allowFontScaling={false}>
            {code[index] ?? ''}
          </Text>
        </Pressable>
      ))}
    </View>
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
  // Champ réel, transparent, sous les cases (elles reçoivent les appuis) : il reçoit la saisie sans se voir.
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
