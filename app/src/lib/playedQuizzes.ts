import AsyncStorage from '@react-native-async-storage/async-storage';

// Quiz « déjà faits » (lot E) : mémorisés sur ce téléphone seulement, au lancement d'une partie. Une
// réinstallation, l'effacement des données de l'app ou un autre téléphone repartent de zéro.
const STORAGE_KEY = 'quizin:played';

export async function loadPlayedQuizzes(): Promise<Set<string>> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    const parsed: unknown = stored ? JSON.parse(stored) : [];
    return new Set(Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : []);
  } catch {
    return new Set();
  }
}

export async function markQuizPlayed(quizId: string): Promise<void> {
  try {
    const played = await loadPlayedQuizzes();
    if (played.has(quizId)) return;
    played.add(quizId);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...played]));
  } catch {
    // Non mémorisé : le quiz ne portera simplement pas le repère « déjà fait ».
  }
}
