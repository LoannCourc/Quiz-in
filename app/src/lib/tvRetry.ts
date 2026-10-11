// « Réessayer » de l'aide « Je ne trouve pas ma TV » : l'aide se ferme et le salon, revenu à l'écran,
// rouvre la liste des TV (elle exige l'icône Cast native affichée, présente dans le salon, pas dans l'aide).
let isRetryRequested = false;

export function requestTvRetry(): void {
  isRetryRequested = true;
}

// Vrai une seule fois après une demande.
export function consumeTvRetry(): boolean {
  const requested = isRetryRequested;
  isRetryRequested = false;
  return requested;
}
