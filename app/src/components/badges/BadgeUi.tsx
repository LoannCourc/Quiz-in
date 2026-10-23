// Interface des badges qui utilise react-native-svg (module natif) : jamais importée en tête d'un fichier chargé
// au démarrage, seulement par lib/badgeUi.ts, à la demande.
export { EmblemArt } from './BadgeArt';
export { BadgesScreen } from './BadgesScreen';
export { BadgeUnlockedToast } from './BadgeUnlockedToast';
