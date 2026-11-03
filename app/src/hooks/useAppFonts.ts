// Android et iOS : polices intégrées au build par le plugin expo-font (app.json : Bowlby One, Nunito 700,
// 800 et 900), disponibles dès le premier affichage, sans chargement au démarrage. Une police absente (build
// plus ancien que ce plugin, comme un build de développement à refaire) est remplacée par la police du
// système, sans erreur. Web : useAppFonts.web.ts (polices du site, préchargées par index.html).
export function useAppFonts(): boolean {
  return true;
}
