import { useEffect, useState } from 'react';

import { AppFontNames } from '@/constants/appTheme';

// Attente maximale avant d'afficher le site : au-delà, la page s'affiche avec la police de repli et
// les vraies polices la remplacent dès qu'elles arrivent (font-display: swap).
const WEB_FONT_WAIT_MS = 1500;

// Web (site des joueurs) : les polices sont déclarées et préchargées dans public/index.html (woff2
// servis par le site, @font-face en font-display: swap), pas par expo-font. Le chargement commence
// donc avec la page, sans attendre le JavaScript, et ne peut jamais finir sur la police système pour
// de bon. Ce hook attend seulement un court instant pour éviter un changement de police à l'écran.
export function useAppFonts(): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    const loads = Object.values(AppFontNames).map((name) => document.fonts.load(`16px "${name}"`));
    const timeout = new Promise((resolve) => setTimeout(resolve, WEB_FONT_WAIT_MS));
    Promise.race([Promise.all(loads), timeout])
      .catch(() => {})
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  return ready;
}
