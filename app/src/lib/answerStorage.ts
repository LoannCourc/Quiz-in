import AsyncStorage from '@react-native-async-storage/async-storage';
import { CHOICE_COUNT } from '@shared/constants';

// Choix du joueur gardé sur l'appareil, pour le réafficher après un rechargement de la page.
// Web : localStorage du navigateur ; Android : stockage natif d'AsyncStorage.
// Simple confort d'affichage : answeredBy reste la seule référence pour savoir si on a répondu.
// Si le stockage est indisponible (navigation privée, stockage plein…), les erreurs sont ignorées
// et l'écran affiche « Réponse envoyée » sans rappeler la proposition.

function storageKey(code: string, index: number): string {
  return `quizin:answer:${code}:${index}`;
}

export async function saveChoice(code: string, index: number, choice: number): Promise<void> {
  try {
    await AsyncStorage.setItem(storageKey(code, index), String(choice));
  } catch {
    // Stockage indisponible : sans conséquence sur la réponse envoyée.
  }
}

export async function loadChoice(code: string, index: number): Promise<number | null> {
  try {
    const raw = await AsyncStorage.getItem(storageKey(code, index));
    const choice = Number(raw);
    return raw !== null && Number.isInteger(choice) && choice >= 0 && choice < CHOICE_COUNT ? choice : null;
  } catch {
    return null;
  }
}
