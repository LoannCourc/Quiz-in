import AsyncStorage from '@react-native-async-storage/async-storage';

// Questions déjà lancées sur ce téléphone (« quizId/questionId » → heure du dernier lancement), pour tirer
// d'abord celles jamais jouées (shared/questionPool.ts). Comme « déjà fait » : perdues à la réinstallation.
const STORAGE_KEY = 'quizin:playedQuestions';

export async function loadPlayedQuestions(): Promise<Record<string, number>> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    const parsed: unknown = stored ? JSON.parse(stored) : {};
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return {};
    return Object.fromEntries(Object.entries(parsed).filter((entry): entry is [string, number] => typeof entry[1] === 'number'));
  } catch {
    return {};
  }
}

export async function markQuestionsPlayed(refs: readonly string[], now = Date.now()): Promise<void> {
  try {
    const played = await loadPlayedQuestions();
    for (const ref of refs) played[ref] = now;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(played));
  } catch {
    // Non mémorisé : ces questions pourront simplement revenir plus tôt.
  }
}
