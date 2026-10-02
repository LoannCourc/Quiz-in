import { isValidRoomCode, normalizeRoomCode } from '@shared/roomCode';
import type { Session } from '@shared/types';
import * as Clipboard from 'expo-clipboard';
import { useKeepAwake } from 'expo-keep-awake';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BigButton } from '@/components/ui/BigButton';
import { PlayerList } from '@/components/player/PlayerList';
import { Screen } from '@/components/ui/Screen';
import { textStyles } from '@/components/ui/textStyles';
import { AppColors, AppSizes } from '@/constants/appTheme';
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
    <Screen>
      {isValidRoomCode(code) ? <HostLobby code={code} /> : <Text style={textStyles.error}>{strings.hostLobby.notHost}</Text>}
    </Screen>
  );
}

function HostLobby({ code }: { code: string }) {
  // Seul l'hôte peut lire sa session d'un bloc : un refus signifie « pas l'hôte » ou « introuvable ».
  const session = useLiveValue<Session>(`sessions/${code}`);

  if (session.kind === 'loading') return <Text style={textStyles.body}>{strings.hostLobby.loading}</Text>;
  if (session.kind === 'error' || session.value === null) {
    return <Text style={textStyles.error}>{strings.hostLobby.notHost}</Text>;
  }

  const players = session.value.players ?? {};
  return (
    <>
      <View style={styles.codeBlock}>
        <Text style={textStyles.muted}>{strings.hostLobby.codeLabel}</Text>
        <Text style={styles.code}>{code}</Text>
      </View>

      <ReceiverLink code={code} />

      {Object.keys(players).length === 0 ? (
        <Text style={textStyles.muted}>{strings.hostLobby.noPlayers}</Text>
      ) : (
        <PlayerList players={players} />
      )}

      {/* Le lancement (étape 3.7) vérifiera MIN_PLAYERS. */}
      <BigButton label={strings.hostLobby.launchButton} onPress={() => {}} disabled />
      <Text style={[textStyles.muted, styles.centered]}>{strings.hostLobby.launchSoon}</Text>
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
      <Text style={textStyles.muted}>{strings.hostLobby.receiverLabel}</Text>
      <Text selectable style={styles.url}>
        {url}
      </Text>
      <BigButton label={strings.hostLobby.copyButton} variant="secondary" onPress={copy} />
      {copyStatus === 'copied' && <Text style={textStyles.body}>{strings.hostLobby.copied}</Text>}
      {copyStatus === 'failed' && <Text style={textStyles.error}>{strings.hostLobby.copyFailed}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  codeBlock: {
    alignItems: 'center',
  },
  code: {
    color: AppColors.accent,
    fontSize: 64,
    fontWeight: '900',
    letterSpacing: 12,
  },
  linkBlock: {
    gap: Spacing.two,
  },
  url: {
    color: AppColors.text,
    fontSize: AppSizes.textBody,
    padding: Spacing.three,
    borderRadius: AppSizes.radius,
    backgroundColor: AppColors.surface,
  },
  centered: {
    textAlign: 'center',
  },
});
