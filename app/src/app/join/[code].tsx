import { isValidRoomCode, normalizeRoomCode } from '@shared/roomCode';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PlayerGame } from '@/components/player/game/PlayerGame';
import { JoinForm } from '@/components/player/JoinForm';
import { PlayerLobby } from '@/components/player/PlayerLobby';
import { PlayerNotice } from '@/components/player/PlayerNotice';
import { Screen } from '@/components/ui/Screen';
import { textStyles } from '@/components/ui/textStyles';
import { AppColors } from '@/constants/appTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import { usePlayerSession, type PlayerSessionState } from '@/hooks/usePlayerSession';
import { usePresence } from '@/hooks/usePresence';
import { useServerTimeOffset } from '@/hooks/useServerTimeOffset';
import { getEntryRefusal } from '@/lib/joinGame';
import { IDLE_ANSWER } from '@/lib/playerGame';

// Adresse encodée dans le QR code de la TV : /join/CODE (spec 6.6).
export default function JoinRoomScreen() {
  const params = useLocalSearchParams<{ code: string }>();
  const code = normalizeRoomCode(params.code ?? '');

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={textStyles.title}>{strings.join.appName}</Text>
        {isValidRoomCode(code) && <Text style={styles.roomCode}>{strings.join.roomLabel(code)}</Text>}
      </View>
      {/* Code validé avant toute lecture dans la base. */}
      {isValidRoomCode(code) ? (
        <JoinRoom code={code} />
      ) : (
        <PlayerNotice message={strings.join.invalidCode} tone="error" showOtherCode />
      )}
    </Screen>
  );
}

function isRegistered(state: PlayerSessionState): boolean {
  return state.kind === 'ready' && state.players[state.uid] !== undefined;
}

function JoinRoom({ code }: { code: string }) {
  const state = usePlayerSession(code);
  const registered = isRegistered(state);
  usePresence(code, registered && state.kind === 'ready' ? state.uid : null);

  switch (state.kind) {
    case 'loading':
      return <PlayerNotice message={strings.join.loading} />;
    case 'error':
      return <PlayerNotice message={`${strings.join.errorPrefix} ${state.detail}`} tone="error" />;
    case 'notFound':
      return <PlayerNotice message={strings.join.refusals.notFound} tone="error" showOtherCode />;
  }

  // Reprise : même session anonyme (même navigateur) = même uid, donc on retrouve son entrée.
  if (registered) {
    return <RegisteredPlayer code={code} state={state} />;
  }

  const refusal = getEntryRefusal(state.status, state.players, state.uid);
  if (refusal) {
    return <PlayerNotice message={strings.join.refusals[refusal]} tone="error" showOtherCode />;
  }
  return <JoinForm code={code} uid={state.uid} status={state.status} players={state.players} />;
}

interface RegisteredPlayerProps {
  code: string;
  state: Extract<PlayerSessionState, { kind: 'ready' }>;
}

// Joueur déjà inscrit : lobby, modification du profil, ou partie en cours.
function RegisteredPlayer({ code, state }: RegisteredPlayerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const serverOffsetMs = useServerTimeOffset();
  const { uid, status, players } = state;

  if (status !== 'lobby') {
    // Partie lancée pendant la modification : le formulaire disparaît (les règles refuseraient
    // l'écriture) et on rappelle le profil réellement enregistré.
    const me = players[uid];
    return (
      <>
        {isEditing && <PlayerNotice message={strings.profile.editInterrupted(me.avatar, me.name)} />}
        {/* L'envoi de la réponse est branché à l'étape C. */}
        <PlayerGame session={state.session} uid={uid} serverOffsetMs={serverOffsetMs} answer={IDLE_ANSWER} onAnswer={() => {}} />
      </>
    );
  }

  return isEditing ? (
    <JoinForm code={code} uid={uid} status={status} players={players} edit={{ onDone: () => setIsEditing(false) }} />
  ) : (
    <PlayerLobby uid={uid} players={players} onEditProfile={() => setIsEditing(true)} />
  );
}

const styles = StyleSheet.create({
  header: {
    gap: Spacing.one,
  },
  roomCode: {
    color: AppColors.accent,
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 2,
  },
});
