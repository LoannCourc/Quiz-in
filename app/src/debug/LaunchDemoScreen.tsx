import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { LaunchView } from '@/components/LaunchScreen';
import { Logo, type LogoSize } from '@/components/ui/Logo';
import { Screen } from '@/components/ui/Screen';
import { textStyles } from '@/components/ui/textStyles';
import { Spacing } from '@/constants/theme';

const SIZES: readonly LogoSize[] = ['small', 'medium', 'large'];

// Démo (développement) : /debug/launch montre la page de démarrage telle quelle ; ?logos=1, le logo dans
// ses trois tailles.
export default function LaunchDemoScreen() {
  const { logos } = useLocalSearchParams<{ logos?: string }>();
  if (logos !== '1') return <LaunchView />;
  return (
    <Screen>
      {SIZES.map((size) => (
        <View key={size} style={styles.row}>
          <Text style={textStyles.muted}>{size}</Text>
          <Logo size={size} />
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: Spacing.two,
  },
});
