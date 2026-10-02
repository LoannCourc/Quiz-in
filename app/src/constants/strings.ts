import { MAX_PLAYERS, PLAYER_NAME_MAX_LENGTH, PLAYER_NAME_MIN_LENGTH } from '@shared/constants';

import type { JoinRefusal } from '@/lib/joinGame';

// Textes affichés à l'écran, regroupés ici pour faciliter la traduction.
export const strings = {
  counter: {
    title: 'Compteur partagé',
    loading: 'Connexion…',
    incrementButton: '+1',
    errorPrefix: 'Erreur :',
  },
  join: {
    appName: "Quiz'in",
    codeTitle: 'Rejoindre une partie',
    codeLabel: 'Code affiché sur la TV',
    codePlaceholder: 'ABCD',
    codeButton: 'Continuer',
    invalidCode: 'Ce code n’est pas valide. Vérifie les 4 caractères affichés sur la TV.',
    loading: 'Connexion à la partie…',
    nameLabel: 'Ton pseudo',
    namePlaceholder: 'Ex. : Léa',
    nameHint: `${PLAYER_NAME_MIN_LENGTH} à ${PLAYER_NAME_MAX_LENGTH} caractères`,
    avatarLabel: 'Ton avatar',
    joinButton: 'Rejoindre',
    joining: 'Inscription…',
    roomLabel: (code: string) => `Partie ${code}`,
    otherCodeButton: 'Saisir un autre code',
    refusals: {
      notFound: 'Partie introuvable. Vérifie le code affiché sur la TV.',
      alreadyStarted: 'Cette partie a déjà commencé. Il n’est plus possible de la rejoindre.',
      ended: 'Cette partie est terminée.',
      full: `Cette partie est complète (${MAX_PLAYERS} joueurs maximum).`,
      nameTaken: 'Ce pseudo est déjà pris dans cette partie. Choisis-en un autre.',
    } satisfies Record<JoinRefusal, string>,
    errorPrefix: 'Erreur de connexion :',
    joinFailed: 'L’inscription a échoué. Réessaie dans un instant.',
  },
  lobby: {
    playerCount: (count: number) => `${count} joueur${count > 1 ? 's' : ''} connecté${count > 1 ? 's' : ''}`,
    you: '(toi)',
    waiting: 'En attente du lancement…',
    inGame: 'Tu as retrouvé ta place. La partie est en cours.',
  },
};
