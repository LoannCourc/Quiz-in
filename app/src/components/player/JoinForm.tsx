import { AVATARS } from '@shared/avatars';
import { PLAYER_NAME_MAX_LENGTH } from '@shared/constants';
import { cleanPlayerName, isValidPlayerName } from '@shared/playerName';
import type { GameStatus, PlayerId } from '@shared/types';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { strings } from '@/constants/strings';
import { AppColors } from '@/constants/appTheme';
import { Spacing } from '@/constants/theme';
import { getJoinRefusal, registerPlayer, updateProfile, type LobbyPlayers } from '@/lib/joinGame';

import { AvatarPicker } from './AvatarPicker';
import { BigButton } from '@/components/ui/BigButton';
import { textStyles } from '@/components/ui/textStyles';

interface JoinFormProps {
  code: string;
  uid: PlayerId;
  status: GameStatus;
  players: LobbyPlayers;
  // Présent : modification du profil d'un joueur déjà inscrit (formulaire prérempli).
  edit?: { onDone: () => void };
}

// Premier avatar encore libre : chacun a ainsi un avatar différent sans avoir à chercher.
function firstFreeAvatar(players: LobbyPlayers): string {
  const used = new Set(Object.values(players).map((player) => player.avatar));
  return AVATARS.find((avatar) => !used.has(avatar)) ?? AVATARS[0];
}

export function JoinForm({ code, uid, status, players, edit }: JoinFormProps) {
  const current = edit ? players[uid] : undefined;
  const [rawName, setRawName] = useState(current?.name ?? '');
  const [avatar, setAvatar] = useState(() => current?.avatar ?? firstFreeAvatar(players));
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        <Text style={textStyles.label}>{strings.join.nameLabel}</Text>
        <TextInput
          value={rawName}
          onChangeText={(text) => {
            setRawName(text);
            setError(null);
          }}
          onSubmitEditing={submit}
          placeholder={strings.join.namePlaceholder}
          placeholderTextColor={AppColors.textMuted}
          maxLength={PLAYER_NAME_MAX_LENGTH}
          autoCorrect={false}
          autoComplete="off"
          returnKeyType="done"
          style={textStyles.input}
        />
        <Text style={textStyles.muted}>{strings.join.nameHint}</Text>
      </View>

      <View style={styles.field}>
        <Text style={textStyles.label}>{strings.join.avatarLabel}</Text>
        <AvatarPicker selected={avatar} onSelect={setAvatar} />
      </View>

      {error && <Text style={textStyles.error}>{error}</Text>}

      <BigButton
        label={isSubmitting ? texts.submitting : texts.submitButton}
        onPress={submit}
        disabled={!canSubmit}
      />
      {edit && (
        <BigButton
          label={strings.profile.cancelButton}
          variant="secondary"
          onPress={edit.onDone}
          disabled={isSubmitting}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: Spacing.four,
  },
  field: {
    gap: Spacing.two,
  },
});
