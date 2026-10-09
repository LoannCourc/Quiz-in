import { PLAYER_NAME_MAX_LENGTH, PRIVACY_URL } from '@shared/constants';
import { cleanPlayerName, isValidPlayerName } from '@shared/playerName';
import type { GameStatus, PlayerId } from '@shared/types';
import { useState } from 'react';
import { Linking, StyleSheet, Text, TextInput, View } from 'react-native';

import { strings } from '@/constants/strings';
import { AppColors, AppFonts, AppSizes } from '@/constants/appTheme';
import { Spacing } from '@/constants/theme';
import { firstFreeAvatar, getJoinRefusal, registerPlayer, rememberedProfile, updateProfile, type LobbyPlayers } from '@/lib/joinGame';

import { AvatarPicker } from './AvatarPicker';
import { BigButton } from '@/components/ui/BigButton';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { textStyles } from '@/components/ui/textStyles';

interface JoinFormProps {
  code: string;
  uid: PlayerId;
  status: GameStatus;
  players: LobbyPlayers;
  // Présent : modification du profil d'un joueur déjà inscrit (formulaire prérempli).
  edit?: { onDone: () => void };
}

// Maquette J3 : « TON PRÉNOM » (champ blanc, contour cyan avec le focus), « TON AVATAR » sur une ligne
// qui défile, puis « REJOINDRE LA PARTIE » en bas de l'écran, au-dessus du clavier.
export function JoinForm({ code, uid, status, players, edit }: JoinFormProps) {
  // Modification : profil enregistré. Réinscription après un retrait du lobby : dernier profil connu.
  const current = edit ? players[uid] : rememberedProfile(code);
  const [rawName, setRawName] = useState(current?.name ?? '');
  const [avatar, setAvatar] = useState(() => current?.avatar ?? firstFreeAvatar(players));
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNameFocused, setIsNameFocused] = useState(false);

  const name = cleanPlayerName(rawName);
  const canSubmit = isValidPlayerName(name) && !isSubmitting;
  const texts = edit ? strings.profile : strings.join;

  // Les vérifications portent sur les joueurs lus en direct dans la partie, sans compter
  // le joueur lui-même ; l'hôte vérifiera aussi de son côté. Après une inscription réussie,
  // la liste reçue contient notre entrée et l'écran parent bascule tout seul sur le lobby.
  async function submit() {
    if (!canSubmit) return;
    const refusal = getJoinRefusal(status, players, uid, name);
    if (refusal) {
      setError(strings.join.refusals[refusal]);
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      if (edit) {
        await updateProfile(code, uid, name, avatar);
        edit.onDone();
      } else {
        await registerPlayer(code, uid, name, avatar);
      }
    } catch {
      // Cas typique : la partie vient d'être lancée et les règles refusent l'écriture.
      setError(texts.submitFailed);
      setIsSubmitting(false);
    }
  }

  return (
    <View style={styles.form}>
      <View style={styles.field}>
        <Text style={styles.label}>{strings.join.nameLabel}</Text>
        <TextInput
          value={rawName}
          onChangeText={(text) => {
            setRawName(text);
            setError(null);
          }}
          onSubmitEditing={submit}
          onFocus={() => setIsNameFocused(true)}
          onBlur={() => setIsNameFocused(false)}
          placeholder={strings.join.namePlaceholder}
          placeholderTextColor={AppColors.textMuted}
          maxLength={PLAYER_NAME_MAX_LENGTH}
          autoCorrect={false}
          autoComplete="off"
          returnKeyType="done"
          accessibilityLabel={strings.join.nameLabel}
          style={[styles.input, isNameFocused && styles.inputFocused]}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>{strings.join.avatarLabel}</Text>
        <AvatarPicker selected={avatar} onSelect={setAvatar} layout="row" />
      </View>

      <View style={styles.footer}>
        {error && <Text style={textStyles.error}>{error}</Text>}
        {!edit && (
          <Text style={styles.respect}>
            {strings.join.respectNotice}{' '}
            <Text accessibilityRole="link" style={styles.respectLink} onPress={() => void Linking.openURL(PRIVACY_URL)}>
              {strings.join.privacyLink}
            </Text>
          </Text>
        )}
        <SubmitButton label={isSubmitting ? texts.submitting : texts.submitButton} onPress={submit} disabled={!canSubmit} />
        {edit && (
          <BigButton
            label={strings.profile.cancelButton}
            variant="secondary"
            onPress={edit.onDone}
            disabled={isSubmitting}
          />
        )}
      </View>
    </View>
  );
}

const FIELD_BORDER = 3;
const NAME_SIZE = 22;

const styles = StyleSheet.create({
  // Occupe la hauteur restante : le bouton descend en bas de l'écran.
  form: {
    flexGrow: 1,
    gap: Spacing.four,
  },
  field: {
    gap: Spacing.two,
  },
  label: {
    color: AppColors.questionMeta,
    fontFamily: AppFonts.black,
    fontSize: 12,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  input: {
    minHeight: AppSizes.fieldHeight,
    paddingHorizontal: Spacing.three,
    borderRadius: AppSizes.radius,
    borderWidth: FIELD_BORDER,
    borderColor: AppColors.fieldIdleBorder,
    backgroundColor: AppColors.card,
    color: AppColors.ink,
    fontFamily: AppFonts.black,
    fontSize: NAME_SIZE,
    // Web : pas de contour du navigateur, le cadre cyan indique le focus.
    outlineWidth: 0,
    outlineColor: 'transparent',
  },
  inputFocused: {
    borderColor: AppColors.link,
  },
  respect: {
    color: AppColors.textMuted,
    fontFamily: AppFonts.bold,
    fontSize: 12,
    textAlign: 'center',
  },
  respectLink: {
    color: AppColors.link,
    textDecorationLine: 'underline',
  },
  footer: {
    marginTop: 'auto',
    gap: Spacing.two,
  },
});
