import AsyncStorage from '@react-native-async-storage/async-storage';
import { CHOICE_COUNT, FREE_ANSWER_MAX_LENGTH } from '@shared/constants';

import type { GivenAnswer } from './playerGame';

// Réponse du joueur gardée sur l'appareil, pour la réafficher après un rechargement de la page.
// Web : localStorage du navigateur ; Android : stockage natif d'AsyncStorage.
// Simple confort d'affichage : answeredBy reste la seule référence pour savoir si on a répondu.
// Si le stockage est indisponible (navigation privée, stockage plein…), les erreurs sont ignorées
// et l'écran affiche « Réponse envoyée » sans rappeler la réponse.

function storageKey(code: string, index: number): string {
  return `quizin:answer:${code}:${index}`;
}

export async function saveGiven(code: string, index: number, given: GivenAnswer): Promise<void> {
  try {
    await AsyncStorage.setItem(storageKey(code, index), JSON.stringify(given));
  } catch {
    // Stockage indisponible : sans conséquence sur la réponse envoyée.
  }
}

function isShortText(value: unknown): value is string {
  return typeof value === 'string' && value.length <= FREE_ANSWER_MAX_LENGTH;
}

// Index de proposition (aussi l'ancien format, un simple nombre) ou texte saisi ; null si illisible.
function parseGiven(raw: string): GivenAnswer | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof parsed === 'number') return Number.isInteger(parsed) && parsed >= 0 && parsed < CHOICE_COUNT ? parsed : null;
  if (typeof parsed !== 'object' || parsed === null) return null;
  const { value, artist } = parsed as Record<string, unknown>;
  if (!isShortText(value) || (artist !== undefined && !isShortText(artist))) return null;
  return artist === undefined ? { value } : { value, artist };
}

export async function loadGiven(code: string, index: number): Promise<GivenAnswer | null> {
  try {
    const raw = await AsyncStorage.getItem(storageKey(code, index));
    return raw === null ? null : parseGiven(raw);
  } catch {
    return null;
  }
}
