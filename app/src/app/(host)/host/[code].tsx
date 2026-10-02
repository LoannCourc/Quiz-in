import { isValidRoomCode, normalizeRoomCode } from '@shared/roomCode';
import type { Session } from '@shared/types';
import * as Clipboard from 'expo-clipboard';
import { useKeepAwake } from 'expo-keep-awake';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BigButton } from '@/components/player/BigButton';
import { PlayerList } from '@/components/player/PlayerList';
import { PlayerScreen } from '@/components/player/PlayerScreen';
import { playerTextStyles } from '@/components/player/playerTextStyles';
import { PlayerColors, PlayerSizes } from '@/constants/playerTheme';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';
import { useLiveValue } from '@/hooks/useLiveValue';
import { receiverUrl } from '@/lib/createGame';

// Lobby de l'hôte : code, lien de l'écran TV, joueurs en direct. Servira aussi pendant la partie.
export default function HostLobbyScreen() {
  // L'hôte est l'autorité de la partie : son téléphone ne doit pas se mettre en veille (spec 7).
  // L'écran reste allumé tant que cette page est affichée.
  useKeepAwake();
  const params = useLocalSearchParams<{ code: string }>();
  const code = normalizeRoomCode(params.code ?? '');

  return (
    <PlayerScreen>
      {isValidRoomCode(code) ? <HostLobby code={code} /> : <Text style={playerTextStyles.error}>{strings.hostLobby.notHost}</Text>}
    </PlayerScreen>
  );
}

function HostLobby({ code }: { code: string }) {
  // Seul l'hôte peut lire sa session d'un bloc : un refus signifie « pas l'hôte » ou « introuvable ».
  const session = useLiveValue<Session>(`sessions/${code}`);

  if (session.kind === 'loading') return <Text style={playerTextStyles.body}>{strings.hostLobby.loading}</Text>;
  if (session.kind === 'error' || session.value === null) {
    return <Text style={playerTextStyles.error}>{strings.hostLobby.notHost}</Text>;
  }

  const players = session.value.players ?? {};
  return (
    <>
      <View style={styles.codeBlock}>
        <Text style={playerTextStyles.muted}>{strings.hostLobby.codeLabel}</Text>
        <Text style={styles.code}>{code}</Text>
      </View>

      <ReceiverLink code={code} />

      {Object.keys(players).length === 0 ? (
        <Text style={playerTextStyles.muted}>{strings.hostLobby.noPlayers}</Text>
      ) : (
        <PlayerList players={players} />
      )}

      {/* Le lancement (étape 3.7) vérifiera MIN_PLAYERS. */}
      <BigButton label={strings.hostLobby.launchButton} onPress={() => {}} disabled />
      <Text style={[playerTextStyles.muted, styles.centered]}>{strings.hostLobby.launchSoon}</Text>
    </>
  );
}

type CopyStatus = 'idle' | 'copied' | 'failed';

function ReceiverLink({ code }: { code: string }) {
  const url = receiverUrl(code);
  const [copyStatus, setCopyStatus] = useState<CopyStatus>('idle');

  async function copy() {
    try {
      await Clipboard.setStringAsync(url);
      setCopyStatus('copied');
    } catch {
      setCopyStatus('failed');
    }
  }

  return (
    <View style={styles.linkBlock}>
      <Text style={playerTextStyles.muted}>{strings.hostLobby.receiverLabel}</Text>
      <Text selectable style={styles.url}>
        {url}
      </Text>
      <BigButton label={strings.hostLobby.copyButton} variant="secondary" onPress={copy} />
      {copyStatus === 'copied' && <Text style={playerTextStyles.body}>{strings.hostLobby.copied}</Text>}
      {copyStatus === 'failed' && <Text style={playerTextStyles.error}>{strings.hostLobby.copyFailed}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  codeBlock: {
    alignItems: 'center',
  },
  code: {
    color: PlayerColors.accent,
    fontSize: 64,
    fontWeight: '900',
    letterSpacing: 12,
  },
  linkBlock: {
    gap: Spacing.two,
  },
  url: {
    color: PlayerColors.text,
    fontSize: PlayerSizes.textBody,
    padding: Spacing.three,
    borderRadius: PlayerSizes.radius,
    backgroundColor: PlayerColors.surface,
  },
  centered: {
    textAlign: 'center',
  },
});
