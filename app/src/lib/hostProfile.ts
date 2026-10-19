import AsyncStorage from '@react-native-async-storage/async-storage';
import { cleanPlayerName, isValidPlayerName } from '@shared/playerName';

// Prénom et avatar de l'hôte qui joue (« Je joue aussi »), gardés sur ce téléphone seulement (même forme
// que les profils des joueurs : { name, avatar }) : réactiver l'option dans une autre partie l'inscrit tout
// de suite. Rien n'est écrit dans la base en dehors de l'inscription elle-même.
const STORAGE_KEY = 'quizin:hostProfile';

export interface HostProfile {
  name: string;
  avatar: string;
}

function parseHostProfile(value: unknown): HostProfile | null {
  if (typeof value !== 'object' || value === null) return null;
  const { name, avatar } = value as Record<string, unknown>;
  if (typeof name !== 'string' || typeof avatar !== 'string' || avatar === '') return null;
  const cleaned = cleanPlayerName(name);
  return isValidPlayerName(cleaned) ? { name: cleaned, avatar } : null;
}

export async function loadHostProfile(): Promise<HostProfile | null> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    return stored ? parseHostProfile(JSON.parse(stored)) : null;
  } catch {
    return null;
  }
}

export async function saveHostProfile(profile: HostProfile): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // Non mémorisé : la feuille du prénom s'ouvrira de nouveau à la prochaine activation.
  }
}
