import AsyncStorage from '@react-native-async-storage/async-storage';

// Règles du Bluff déjà montrées sur ce téléphone (ou ce navigateur) : la carte du salon d'attente s'ouvre la
// première fois seulement, puis reste repliée en une ligne « Comment jouer ? ».
const STORAGE_KEY = 'quizin:bluffRulesSeen';

export async function loadBluffRulesSeen(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(STORAGE_KEY)) === '1';
  } catch {
    return false;
  }
}

export async function saveBluffRulesSeen(): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, '1');
  } catch {
    // Non mémorisé : la carte s'ouvrira encore à la prochaine partie de Bluff.
  }
}
