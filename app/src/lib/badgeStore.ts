import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  applyBadgeAction,
  applyFinishedGame,
  parseBadgeState,
  type BadgeAction,
  type BadgeGame,
  type BadgeState,
  type BadgeId,
  type BadgeUpdate,
  type FinishedGame,
  type ParsedBadgeState,
} from '@shared/badges';
import { parseTrackedGame, type TrackedGame } from '@shared/badgeTracking';

// Badges (spec 20) : sur ce téléphone seulement. Une réinstallation ou l'effacement des données de l'app
// repartent de zéro. Les accès passent par une file : jamais deux lectures-écritures en même temps (deux
// rendus de l'écran de fin ne peuvent pas compter deux fois la même partie).
const BADGES_KEY = 'quizin:badges';
const TRACKED_GAME_KEY = 'quizin:badgesGame';

let queue: Promise<unknown> = Promise.resolve();

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task, task);
  queue = run.catch(() => undefined);
  return run;
}

async function readJson(key: string): Promise<unknown> {
  const stored = await AsyncStorage.getItem(key);
  return stored ? (JSON.parse(stored) as unknown) : null;
}

async function readBadges(): Promise<ParsedBadgeState> {
  try {
    return parseBadgeState(await readJson(BADGES_KEY));
  } catch {
    return parseBadgeState(null);
  }
}

export function loadBadges(): Promise<ParsedBadgeState> {
  return enqueue(readBadges);
}

// Lecture, changement, écriture. Données d'une version plus récente de l'app : jamais réécrites, rien de débloqué.
async function update(change: (parsed: ParsedBadgeState) => BadgeUpdate): Promise<BadgeId[]> {
  const parsed = await readBadges();
  if (!parsed.writable) return [];
  const result = change(parsed);
  if (result.state !== parsed.state) await AsyncStorage.setItem(BADGES_KEY, JSON.stringify(result.state));
  return result.unlocked;
}

// Partie terminée : comptée (une seule fois), puis la partie suivie est oubliée. Échec du stockage : rien de
// débloqué, la partie suivie est gardée.
export function recordFinishedGame(game: FinishedGame, openGames: readonly BadgeGame[]): Promise<BadgeId[]> {
  return enqueue(async () => {
    try {
      const unlocked = await update(({ state }) => applyFinishedGame(state, game, openGames, Date.now()));
      await AsyncStorage.removeItem(TRACKED_GAME_KEY);
      return unlocked;
    } catch (error) {
      console.warn('[badges] Partie non comptée', error);
      return [];
    }
  });
}

export function recordBadgeAction(action: BadgeAction, openGames: readonly BadgeGame[]): Promise<BadgeId[]> {
  return enqueue(async () => {
    try {
      return await update(({ state }) => applyBadgeAction(state, action, openGames, Date.now()));
    } catch (error) {
      console.warn('[badges] Action non comptée', error);
      return [];
    }
  });
}

export function loadTrackedGame(): Promise<TrackedGame | null> {
  return enqueue(async () => {
    try {
      return parseTrackedGame(await readJson(TRACKED_GAME_KEY));
    } catch {
      return null;
    }
  });
}

// Partie suivie gardée à chaque révélation (reprise après une app tuée) ; null : oubliée.
export function saveTrackedGame(tracked: TrackedGame | null): Promise<void> {
  return enqueue(async () => {
    try {
      if (tracked) await AsyncStorage.setItem(TRACKED_GAME_KEY, JSON.stringify(tracked));
      else await AsyncStorage.removeItem(TRACKED_GAME_KEY);
    } catch {
      // Non gardée : après une relance de l'app en pleine partie, le suivi repart de la question en cours.
    }
  });
}

// Développement seulement (écran « Mes badges », outils de développement) : remplace les badges de ce
// téléphone. Sans effet dans un build publié.
export function writeBadgeStateForDev(state: BadgeState): Promise<void> {
  if (!__DEV__) return Promise.resolve();
  return enqueue(() => AsyncStorage.setItem(BADGES_KEY, JSON.stringify(state)));
}
