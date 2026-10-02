import { isValidRoomCode, normalizeRoomCode } from '@shared/roomCode';
import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { JoinForm } from '@/components/player/JoinForm';
import { PlayerLobby } from '@/components/player/PlayerLobby';
import { PlayerNotice } from '@/components/player/PlayerNotice';
import { PlayerScreen } from '@/components/player/PlayerScreen';
import { playerTextStyles } from '@/components/player/playerTextStyles';
import { PlayerColors } from '@/constants/playerTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import { usePlayerSession, type PlayerSessionState } from '@/hooks/usePlayerSession';
import { usePresence } from '@/hooks/usePresence';
import { getEntryRefusal } from '@/lib/joinGame';

// Adresse encodée dans le QR code de la TV : /join/CODE (spec 6.6).
export default function JoinRoomScreen() {
  const params = useLocalSearchParams<{ code: string }>();
  const code = normalizeRoomCode(params.code ?? '');

  return (
    <PlayerScreen>
      <View style={styles.header}>
        <Text style={playerTextStyles.title}>{strings.join.appName}</Text>
        {isValidRoomCode(code) && <Text style={styles.roomCode}>{strings.join.roomLabel(code)}</Text>}
      </View>
      {/* Code validé avant toute lecture dans la base. */}
      {isValidRoomCode(code) ? (
        <JoinRoom code={code} />
      ) : (
        <PlayerNotice message={strings.join.invalidCode} tone="error" showOtherCode />
      )}
    </PlayerScreen>
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
    return state.status === 'lobby' ? (
      <PlayerLobby uid={state.uid} players={state.players} />
    ) : (
      <PlayerNotice message={strings.lobby.inGame} />
    );
  }

  const refusal = getEntryRefusal(state.status, state.players);
  if (refusal) {
    return <PlayerNotice message={strings.join.refusals[refusal]} tone="error" showOtherCode />;
  }
  return <JoinForm code={code} uid={state.uid} status={state.status} players={state.players} />;
}

const styles = StyleSheet.create({
  header: {
    gap: Spacing.one,
  },
  roomCode: {
    color: PlayerColors.accent,
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 2,
  },
});
