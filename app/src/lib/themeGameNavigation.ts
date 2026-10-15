import { router } from 'expo-router';

// Fiche d'une partie tirée dans des thèmes du Quiz (route /pool, thèmes séparés par « | »). room : Changer
// de jeu (salon gardé ouvert), transmis jusqu'à la fiche.
export function openThemesGame(themes: readonly string[], questionCount: number, room: string | undefined) {
  router.push({ pathname: '/pool', params: { themes: themes.join('|'), count: String(questionCount), ...(room && { room }) } });
}

// Grille de tous les thèmes du Quiz (« Tout voir »).
export function openAllThemes(room: string | undefined) {
  router.push({ pathname: '/themes', params: room ? { room } : {} });
}
