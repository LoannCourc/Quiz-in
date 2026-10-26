import { createAnswerClock } from '@shared/badgeTracking';

// Chronomètre des réponses du badge « Rapide comme l'éclair » (spec 20) : un seul pour l'app, en mémoire.
export const answerClock = createAnswerClock(() => Date.now());
