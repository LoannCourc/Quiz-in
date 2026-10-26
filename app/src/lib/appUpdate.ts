import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  parsePlatformUpdateConfig,
  parseUpdateReminders,
  remindedUpdate,
  updatePromptFor,
  type AppPlatform,
  type UpdatePrompt,
} from '@shared/appVersion';
import { localDayOf } from '@shared/badges';
import { APP_VERSION_PATH } from '@shared/constants';
import { withTimeout } from '@shared/gameCreation';
import Constants from 'expo-constants';
import { get, ref } from 'firebase/database';
import { Platform } from 'react-native';

import { db, ensureSignedIn } from './firebase';

// Mise à jour disponible (spec 21) : une lecture de config/appVersion/{plateforme} par lancement, depuis l'accueil.
// Connexion comprise, 5 s au plus : au-delà, hors ligne ou en erreur, rien n'est affiché et rien n'est bloqué.
const READ_TIMEOUT_MS = 5_000;
// Rappels du popup doux (date et nombre), gardés sur ce téléphone seulement.
const REMINDERS_KEY = 'quizin:updatePrompt';

const NONE: UpdatePrompt = { kind: 'none' };

function appPlatform(): AppPlatform | null {
  return Platform.OS === 'android' || Platform.OS === 'ios' ? Platform.OS : null;
}

async function readPlatformConfig(platform: AppPlatform): Promise<unknown> {
  await ensureSignedIn();
  return (await get(ref(db, `${APP_VERSION_PATH}/${platform}`))).val();
}

async function loadReminders() {
  try {
    const stored = await AsyncStorage.getItem(REMINDERS_KEY);
    return stored === null ? null : parseUpdateReminders(JSON.parse(stored));
  } catch {
    return null;
  }
}

export async function readUpdatePrompt(): Promise<UpdatePrompt> {
  const platform = appPlatform();
  if (!platform) return NONE;
  try {
    const raw = await withTimeout(readPlatformConfig(platform), READ_TIMEOUT_MS);
    const config = parsePlatformUpdateConfig(raw, platform);
    return updatePromptFor(Constants.expoConfig?.version, config, await loadReminders(), localDayOf(new Date()));
  } catch (error) {
    if (__DEV__) console.warn('[maj] Config de mise à jour non lue', error);
    return NONE;
  }
}

// Popup doux affiché : compté pour aujourd'hui et pour cette valeur de latest.
export async function recordUpdateReminder(latest: string): Promise<void> {
  try {
    const next = remindedUpdate(await loadReminders(), latest, localDayOf(new Date()));
    await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(next));
  } catch {
    // Non mémorisé : le popup pourra revenir au prochain lancement.
  }
}
