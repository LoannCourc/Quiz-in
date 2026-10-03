import { formatMinutesSeconds } from '@shared/hostAbsence';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { textStyles } from '@/components/ui/textStyles';
import { strings } from '@/constants/strings';
import { Spacing } from '@/constants/theme';

const TICK_MS = 1_000;

interface HostAwayNoticeProps {
  // Heure serveur de la suppression possible (hostLeftAt + délai).
  deletableAt: number;
  serverOffsetMs: number;
}

// Pendant l'absence de l'hôte : un seul message, et le temps restant avant suppression
// (un rendu par seconde).
export function HostAwayNotice({ deletableAt, serverOffsetMs }: HostAwayNoticeProps) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const intervalId = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(intervalId);
  }, []);
  const remaining = formatMinutesSeconds(deletableAt - (now + serverOffsetMs));

  return (
    <View style={styles.block}>
      <Text style={textStyles.hero}>{strings.hostAway.title}</Text>
      <Text style={[textStyles.label, styles.centered]}>{strings.hostAway.message}</Text>
      <Text style={[textStyles.muted, styles.centered]}>{strings.hostAway.deletionIn(remaining)}</Text>
    </View>
  );
}

// Phase bloquée depuis plus de 5 s (l'hôte ne la fait plus avancer) : un seul message.
export function WaitingHostNotice() {
  return (
    <View style={styles.block}>
      <Text style={textStyles.hero}>{strings.waitingHost.title}</Text>
      <Text style={[textStyles.label, styles.centered]}>{strings.waitingHost.message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: Spacing.four,
  },
  centered: {
    textAlign: 'center',
  },
});
