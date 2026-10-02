import { AVATARS } from '@shared/avatars';
import { PLAYER_NAME_MAX_LENGTH } from '@shared/constants';
import { cleanPlayerName, isValidPlayerName } from '@shared/playerName';
import type { GameStatus, PlayerId } from '@shared/types';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { strings } from '@/constants/strings';
import { PlayerColors } from '@/constants/playerTheme';
import { Spacing } from '@/constants/theme';
import { getJoinRefusal, registerPlayer, type LobbyPlayers } from '@/lib/joinGame';

import { AvatarPicker } from './AvatarPicker';
import { BigButton } from './BigButton';
import { playerTextStyles } from './playerTextStyles';

interface JoinFormProps {
  code: string;
  uid: PlayerId;
  status: GameStatus;
  players: LobbyPlayers;
}

// Premier avatar encore libre : chacun a ainsi un avatar différent sans avoir à chercher.
function firstFreeAvatar(players: LobbyPlayers): string {
  const used = new Set(Object.values(players).map((player) => player.avatar));
  return AVATARS.find((avatar) => !used.has(avatar)) ?? AVATARS[0];
}

export function JoinForm({ code, uid, status, players }: JoinFormProps) {
  const [rawName, setRawName] = useState('');
  const [avatar, setAvatar] = useState(() => firstFreeAvatar(players));
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const name = cleanPlayerName(rawName);
  const canSubmit = isValidPlayerName(name) && !isSubmitting;

  // Les vérifications portent sur les joueurs lus en direct dans la partie ; l'hôte vérifiera
  // aussi de son côté. En cas de succès, la liste des joueurs reçue contient notre entrée
  // et l'écran parent bascule tout seul sur le lobby.
  async function submit() {
    if (!canSubmit) return;
    const refusal = getJoinRefusal(status, players, name);
    if (refusal) {
      setError(strings.join.refusals[refusal]);
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await registerPlayer(code, uid, name, avatar);
    } catch {
      setError(strings.join.joinFailed);
      setIsSubmitting(false);
    }
  }

  return (
    <View style={styles.form}>
      <View style={styles.field}>
        <Text style={playerTextStyles.label}>{strings.join.nameLabel}</Text>
        <TextInput
          value={rawName}
          onChangeText={(text) => {
            setRawName(text);
            setError(null);
          }}
          onSubmitEditing={submit}
          placeholder={strings.join.namePlaceholder}
          placeholderTextColor={PlayerColors.textMuted}
          maxLength={PLAYER_NAME_MAX_LENGTH}
          autoCorrect={false}
          autoComplete="off"
          returnKeyType="done"
          style={playerTextStyles.input}
        />
        <Text style={playerTextStyles.muted}>{strings.join.nameHint}</Text>
      </View>

      <View style={styles.field}>
        <Text style={playerTextStyles.label}>{strings.join.avatarLabel}</Text>
        <AvatarPicker selected={avatar} onSelect={setAvatar} />
      </View>

      {error && <Text style={playerTextStyles.error}>{error}</Text>}

      <BigButton
        label={isSubmitting ? strings.join.joining : strings.join.joinButton}
        onPress={submit}
        disabled={!canSubmit}
      />
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
