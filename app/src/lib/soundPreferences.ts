import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_SOUND_SETTINGS, parseSoundSettings } from '@shared/sound';
import type { SoundSettings } from '@shared/types';
import { ref, set } from 'firebase/database';

import { db } from './firebase';

// Réglages du son de la TV (spec 17) : mémorisés sur le téléphone de l'hôte (repris à chaque nouvelle
// partie) et publiés dans sessions/{code}/sound, que la TV applique aussitôt.
const STORAGE_KEY = 'quizin:sound';

export async function loadSoundPreferences(): Promise<SoundSettings> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    return (stored && parseSoundSettings(JSON.parse(stored))) || DEFAULT_SOUND_SETTINGS;
  } catch {
    return DEFAULT_SOUND_SETTINGS;
  }
}

export async function saveSoundPreferences(sound: SoundSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sound));
  } catch {
    // Préférence non mémorisée : les réglages par défaut reviendront à la prochaine partie.
  }
}

export async function publishSound(code: string, sound: SoundSettings): Promise<void> {
  await set(ref(db, `sessions/${code}/sound`), sound);
}
