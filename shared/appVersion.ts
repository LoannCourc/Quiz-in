// Mise à jour disponible (spec 21) : versions de l'app comparées nombre par nombre, jamais comme du texte
// (« 1.10.0 » est plus récente que « 1.9.0 »). Logique pure, testée.

// Version lisible : un à trois nombres séparés par des points (« 1 », « 1.1 », « 1.1.0 ») ; sinon null.
// Les nombres manquants valent 0 : « 1.1 » et « 1.1.0 » sont la même version.
export function parseVersion(value: unknown): [number, number, number] | null {
  if (typeof value !== 'string' || !/^\d{1,4}(\.\d{1,4}){0,2}$/.test(value.trim())) return null
  const parts = value.trim().split('.').map(Number)
  return [parts[0], parts[1] ?? 0, parts[2] ?? 0]
}

// Négatif si a est plus ancienne que b, 0 si égales, positif si plus récente ; null si l'une est illisible.
export function compareVersions(a: unknown, b: unknown): number | null {
  const left = parseVersion(a)
  const right = parseVersion(b)
  if (!left || !right) return null
  for (let index = 0; index < 3; index++) {
    if (left[index] !== right[index]) return left[index] - right[index]
  }
  return 0
}

export type AppPlatform = 'android' | 'ios'

// Seules adresses de fiche acceptées : jamais une adresse inconnue ouverte depuis la config.
const STORE_URL_PREFIX: Record<AppPlatform, string> = {
  android: 'https://play.google.com/',
  ios: 'https://apps.apple.com/',
}
const MAX_STORE_URL_LENGTH = 300

// Config d'une plateforme (config/appVersion/{android|ios}), modifiée dans la console Firebase seulement.
export interface PlatformUpdateConfig {
  latest: string
  minimum: string
  storeUrl: string
}

// Config utilisable, ou null (rien n'est affiché) : enabled différent de true, version illisible,
// minimum supérieure à latest, adresse hors de la fiche du store de la plateforme.
export function parsePlatformUpdateConfig(raw: unknown, platform: AppPlatform): PlatformUpdateConfig | null {
  if (typeof raw !== 'object' || raw === null) return null
  const { enabled, latest, minimum, storeUrl } = raw as Record<string, unknown>
  if (enabled !== true) return null
  const order = compareVersions(minimum, latest)
  if (order === null || order > 0) return null
  if (typeof storeUrl !== 'string' || storeUrl.length > MAX_STORE_URL_LENGTH || !storeUrl.startsWith(STORE_URL_PREFIX[platform])) return null
  return { latest: (latest as string).trim(), minimum: (minimum as string).trim(), storeUrl }
}

// Rappels du popup doux, gardés sur le téléphone : pour quelle valeur de latest, combien de fois, quel jour.
export interface UpdateReminders {
  latest: string
  count: number
  lastDay: string
}

// Au plus une fois par jour et trois fois par valeur de latest (une nouvelle valeur remet le compte à zéro).
export const MAX_UPDATE_REMINDERS = 3

export function parseUpdateReminders(raw: unknown): UpdateReminders | null {
  if (typeof raw !== 'object' || raw === null) return null
  const { latest, count, lastDay } = raw as Record<string, unknown>
  if (parseVersion(latest) === null || !Number.isInteger(count) || (count as number) < 0 || typeof lastDay !== 'string') return null
  return { latest: latest as string, count: count as number, lastDay }
}

function remindersFor(reminders: UpdateReminders | null, latest: string): UpdateReminders | null {
  return reminders && compareVersions(reminders.latest, latest) === 0 ? reminders : null
}

export function canRemindUpdate(reminders: UpdateReminders | null, latest: string, today: string): boolean {
  const current = remindersFor(reminders, latest)
  return current === null || (current.count < MAX_UPDATE_REMINDERS && current.lastDay !== today)
}

// Rappels après un popup doux affiché aujourd'hui.
export function remindedUpdate(reminders: UpdateReminders | null, latest: string, today: string): UpdateReminders {
  const current = remindersFor(reminders, latest)
  return { latest, count: (current?.count ?? 0) + 1, lastDay: today }
}

// Ce que l'accueil affiche : rien, la feuille « Une mise à jour est disponible » (doux), ou l'écran qui
// remplace l'accueil (obligatoire, version sous minimum). Version de l'app illisible ou config absente : rien.
export type UpdatePrompt =
  | { kind: 'none' }
  | { kind: 'soft'; latest: string; storeUrl: string }
  | { kind: 'required'; storeUrl: string }

export function updatePromptFor(
  appVersion: unknown,
  config: PlatformUpdateConfig | null,
  reminders: UpdateReminders | null,
  today: string,
): UpdatePrompt {
  if (!config) return { kind: 'none' }
  const belowMinimum = compareVersions(appVersion, config.minimum)
  const belowLatest = compareVersions(appVersion, config.latest)
  if (belowMinimum === null || belowLatest === null) return { kind: 'none' }
  if (belowMinimum < 0) return { kind: 'required', storeUrl: config.storeUrl }
  if (belowLatest < 0 && canRemindUpdate(reminders, config.latest, today)) {
    return { kind: 'soft', latest: config.latest, storeUrl: config.storeUrl }
  }
  return { kind: 'none' }
}
