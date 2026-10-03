import AsyncStorage from '@react-native-async-storage/async-storage';

// Code de la dernière partie créée sur cet appareil, pour proposer de la reprendre après une
// relance de l'app. Simple confort : la partie elle-même est entièrement dans la session.
// Stockage indisponible : on ne propose simplement pas de reprise.
const STORAGE_KEY = 'quizin:hostedGame';

export async function saveHostedGameCode(code: string): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, code);
  } catch {
    // Pas de reprise possible, sans conséquence sur la partie.
  }
}

export async function loadHostedGameCode(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export async function clearHostedGameCode(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    // Rien à faire : le code sera vérifié (et ignoré) à la prochaine ouverture.
  }
}
