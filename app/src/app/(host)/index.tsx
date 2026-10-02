import { Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { strings } from '@/constants/strings';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useSharedCounter } from '@/hooks/useSharedCounter';

export default function HomeScreen() {
  const { value, error, incrementCounter } = useSharedCounter();
  const isReady = value !== null;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="subtitle">{strings.counter.title}</ThemedText>

        <ThemedText type="title">{isReady ? value : strings.counter.loading}</ThemedText>

        <Pressable
          onPress={incrementCounter}
          disabled={!isReady}
          style={({ pressed }) => [
            styles.button,
            (pressed || !isReady) && styles.buttonDimmed,
          ]}>
          <ThemedText type="subtitle" style={styles.buttonLabel}>
            {strings.counter.incrementButton}
          </ThemedText>
        </Pressable>

        {error && (
          <ThemedText type="small" style={styles.error}>
            {strings.counter.errorPrefix} {error}
          </ThemedText>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
  button: {
    backgroundColor: '#208AEF',
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.four,
  },
  buttonDimmed: {
    opacity: 0.5,
  },
  buttonLabel: {
    color: '#ffffff',
  },
  error: {
    color: '#D93025',
    textAlign: 'center',
  },
});
