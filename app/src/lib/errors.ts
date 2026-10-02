export function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

// Écriture refusée par les règles de sécurité (database.rules.json).
export function isPermissionDenied(error: unknown): boolean {
  return /permission[_ ]denied/i.test(toErrorMessage(error));
}
