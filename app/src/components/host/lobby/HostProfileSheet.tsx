import { PLAYER_NAME_MAX_LENGTH } from '@shared/constants';
import { cleanPlayerName, isValidPlayerName } from '@shared/playerName';
import type { Session } from '@shared/types';
import { useEffect, useRef, useState } from 'react';
import { Keyboard, StyleSheet, Text, TextInput, View } from 'react-native';

import { AvatarPicker } from '@/components/player/AvatarPicker';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { AppColors, AppFonts, AppSizes } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import { useKeyboardInset } from '@/hooks/useKeyboardInset';
import { saveHostProfile, type HostProfile } from '@/lib/hostProfile';
import { firstFreeAvatar, getJoinRefusal, registerPlayer, updateProfile } from '@/lib/joinGame';

interface HostProfileSheetProps {
  code: string;
  session: Session;
  isOpen: boolean;
  onClose: () => void;
  // Préremplissage : le profil de l'hôte dans la partie, sinon celui gardé sur le téléphone.
  initial: HostProfile | null;
  // Refus déjà connu à l'ouverture (activation : prénom gardé déjà pris par un joueur).
  initialError?: string | null;
  // Ouverte par l'interrupteur « Je joue aussi » : le champ du prénom prend le focus, clavier ouvert.
  focusName?: boolean;
}

const texts = strings.hostLobby.playAlso;
// Délai entre l'affichage de la feuille et le focus : la fenêtre doit être prête pour recevoir le clavier.
const FOCUS_DELAY_MS = 150;

// Prénom et avatar de l'hôte qui joue : première activation de « Je joue aussi » (inscription, mêmes
// écritures et mêmes refus qu'un joueur), ou « Modifier » (mise à jour, comme « Modifier mon profil » d'un
// joueur, en salon seulement). Le profil est gardé sur le téléphone pour les prochaines parties.
export function HostProfileSheet({ isOpen, ...props }: HostProfileSheetProps) {
  // Monté à chaque ouverture : le formulaire repart du profil à jour.
  return isOpen ? <OpenSheet {...props} /> : null;
}

function OpenSheet({ code, session, onClose, initial, initialError = null, focusName = false }: Omit<HostProfileSheetProps, 'isOpen'>) {
  const uid = session.hostUid;
  const isPlaying = session.players[uid] !== undefined;
  const [rawName, setRawName] = useState(initial?.name ?? '');
  const [avatar, setAvatar] = useState(() => initial?.avatar ?? firstFreeAvatar(session.players));
  const [error, setError] = useState<string | null>(initialError);
  const [isSaving, setIsSaving] = useState(false);
  const nameInput = useRef<TextInput>(null);
  const focusTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (focusTimer.current) clearTimeout(focusTimer.current);
  }, []);
  // Clavier ouvert : la phrase d'introduction laisse sa place au champ (petit écran, grande police).
  const isTyping = useKeyboardInset() > 0;
  const name = cleanPlayerName(rawName);

  function focusNameInput() {
    if (!focusName) return;
    focusTimer.current = setTimeout(() => nameInput.current?.focus(), FOCUS_DELAY_MS);
  }

  // Fermeture sans valider (fond, retour d'Android) : rien n'est enregistré, le clavier se ferme.
  function close() {
    Keyboard.dismiss();
    onClose();
  }

  // Prénom refusé : le message s'affiche sous le champ, le clavier reste ouvert pour corriger.
  async function save() {
    if (isSaving) return;
    if (!isValidPlayerName(name)) {
      setError(texts.nameRequired);
      return;
    }
    const refusal = getJoinRefusal(session.status, session.players, uid, name);
    if (refusal) {
      setError(strings.join.refusals[refusal]);
      return;
    }
    setError(null);
    setIsSaving(true);
    try {
      if (isPlaying) await updateProfile(code, uid, name, avatar);
      else await registerPlayer(code, uid, name, avatar);
      await saveHostProfile({ name, avatar });
      close();
    } catch {
      // Partie lancée entre-temps : les règles refusent l'écriture.
      setError(isPlaying ? strings.profile.submitFailed : strings.join.submitFailed);
      setIsSaving(false);
    }
  }

  const label = isSaving ? texts.saving : isPlaying ? texts.saveButton : texts.joinButton;
  return (
    <BottomSheet
      isOpen
      onClose={close}
      onShow={focusNameInput}
      title={texts.sheetTitle}
      footer={<SubmitButton label={label} onPress={save} disabled={isSaving} />}>
      {!isTyping && <Text style={styles.intro}>{texts.sheetIntro}</Text>}
      <TextInput
        ref={nameInput}
        value={rawName}
        onChangeText={(text) => {
          setRawName(text);
          setError(null);
        }}
        onSubmitEditing={save}
        submitBehavior="submit"
        placeholder={texts.namePlaceholder}
        placeholderTextColor={AppColors.textMuted}
        maxLength={PLAYER_NAME_MAX_LENGTH}
        autoCorrect={false}
        autoComplete="off"
        returnKeyType="done"
        accessibilityLabel={strings.join.nameLabel}
        style={[styles.nameInput, error !== null && styles.nameInputError]}
      />
      {error && <Text style={styles.error}>{error}</Text>}
      <View style={styles.avatars}>
        <AvatarPicker layout="row" selected={avatar} onSelect={setAvatar} fadeColor={AppColors.inkSurface} />
        <Text style={styles.hint}>{texts.scrollHint}</Text>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  intro: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.bold,
    fontSize: 15,
  },
  nameInput: {
    minHeight: 52,
    paddingHorizontal: Spacing.three,
    borderRadius: AppSizes.radius,
    borderWidth: 2,
    borderColor: AppColors.lobbyPanel,
    // La feuille est encre : le champ prend le violet des cartes du salon.
    backgroundColor: AppColors.lobbyPanel,
    color: AppColors.text,
    fontFamily: AppFonts.black,
    fontSize: 18,
  },
  nameInputError: {
    borderColor: AppColors.wrong,
  },
  avatars: {
    gap: Spacing.one,
  },
  hint: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.bold,
    fontSize: 13,
  },
  error: {
    color: AppColors.wrong,
    fontFamily: AppFonts.bold,
    fontSize: 14,
  },
});
