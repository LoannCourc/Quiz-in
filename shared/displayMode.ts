// Mode allégé de la TV pour les petites box (plan de fiabilité, lots b et d). Logique pure, testée.
// Plus d'animation sans fin, transitions instantanées, fonds unis, pas de pluie de confettis.
// Réglage auto (par défaut), on (forcé) ou off ; envoyé par cast-sender.html ({ "light": "on" }) ou par
// l'adresse en plan B (?light=on), et gardé par la TV.

export type DisplaySetting = 'auto' | 'on' | 'off'

const DISPLAY_SETTINGS: readonly DisplaySetting[] = ['auto', 'on', 'off']

// Automatique : la TV compte ses images seconde par seconde. Allégée après LIGHT_SLOW_WINDOWS secondes de
// suite sous LIGHT_FPS_THRESHOLD images par seconde (ou figée LIGHT_STALL_MS dans la seconde), ou dès un
// gel de LIGHT_FREEZE_MS (la page n'a rien affiché pendant ce temps).
export const LIGHT_FPS_THRESHOLD = 40
export const LIGHT_WINDOW_MS = 1_000
export const LIGHT_SLOW_WINDOWS = 3
export const LIGHT_STALL_MS = 1_000
export const LIGHT_FREEZE_MS = 2_000
// Au-delà, la page était masquée ou suspendue (onglet en arrière-plan) : la seconde ne compte pas.
export const LIGHT_PAUSED_GAP_MS = 10_000
// Navigateur des box Android TV mesurées (Bbox 4K : Chrome 92) : allégé dès le départ en automatique.
export const LIGHT_OLD_CHROME_MAX = 92

// Valeur d'adresse ou de message : « 1 » et « 0 » valent on et off.
export function readDisplaySetting(value: unknown): DisplaySetting | null {
  if (value === '1' || value === true) return 'on'
  if (value === '0' || value === false) return 'off'
  return DISPLAY_SETTINGS.find((setting) => setting === value) ?? null
}

export interface CastLightMessage {
  light: DisplaySetting
}

// Message Cast de cast-sender.html ({ "light": "auto" }) : null sinon (le code de la partie passe ailleurs).
export function readCastLight(data: unknown): DisplaySetting | null {
  if (typeof data !== 'object' || data === null || !('light' in data)) return null
  return readDisplaySetting(data.light)
}

// Version de Chrome lue dans l'agent du navigateur, null si ce n'est pas Chrome.
export function chromeMajorVersion(userAgent: string): number | null {
  const match = /Chrome\/(\d+)/.exec(userAgent)
  return match ? Number(match[1]) : null
}

export function isOldChrome(major: number | null): boolean {
  return major !== null && major <= LIGHT_OLD_CHROME_MAX
}

// Une seconde mesurée : images affichées, durée réelle, plus long écart entre deux images.
export interface FrameWindow {
  frames: number
  elapsedMs: number
  maxGapMs: number
  at: number
}

export type AutoLightReason = 'oldChrome' | 'slow' | 'freeze' | 'remembered'

export interface AutoLightState {
  // Secondes lentes de suite.
  slowStreak: number
  // Dernière seconde comptée : images par seconde et heure (ms, horloge de la page).
  lastFps: number | null
  lastAt: number | null
  triggeredAt: number | null
  reason: AutoLightReason | null
}

export const INITIAL_AUTO_LIGHT: AutoLightState = { slowStreak: 0, lastFps: null, lastAt: null, triggeredAt: null, reason: null }

// Décision de l'automatique après une seconde mesurée. Une fois déclenché, il le reste.
export function nextAutoLight(state: AutoLightState, window: FrameWindow): AutoLightState {
  if (state.reason !== null) return state
  if (window.frames === 0 || window.maxGapMs >= LIGHT_PAUSED_GAP_MS) return state
  const fps = (window.frames * 1000) / window.elapsedMs
  const measured = { ...state, lastFps: Math.round(fps), lastAt: window.at }
  if (window.maxGapMs >= LIGHT_FREEZE_MS) return { ...measured, triggeredAt: window.at, reason: 'freeze' }
  const isSlow = fps < LIGHT_FPS_THRESHOLD || window.maxGapMs >= LIGHT_STALL_MS
  const slowStreak = isSlow ? state.slowStreak + 1 : 0
  if (slowStreak >= LIGHT_SLOW_WINDOWS) return { ...measured, slowStreak, triggeredAt: window.at, reason: 'slow' }
  return { ...measured, slowStreak }
}

export function isLightActive(setting: DisplaySetting, auto: AutoLightState): boolean {
  return setting === 'on' || (setting === 'auto' && auto.reason !== null)
}
