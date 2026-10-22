import { changeGameUpdate } from '@shared/hostEngine';
import type { SessionSettings, SoundSettings } from '@shared/types';
import { router } from 'expo-router';
import { useState } from 'react';

import { strings } from '@/constants/strings';
import { useServerTimeOffset } from '@/hooks/useServerTimeOffset';
import { createGame, CreateGameError } from '@/lib/createGame';
import { toErrorMessage } from '@/lib/errors';
import { applyHostAction } from '@/lib/hostGame';
import { saveHostedGameCode } from '@/lib/hostedGameStorage';

export interface GameStarter {
  // questionRefs : questions déjà tirées sur la fiche (thèmes du Quiz), écrites avec la partie.
  start: (quizId: string, settings: SessionSettings, sound: SoundSettings, questionRefs?: readonly string[]) => Promise<void>;
  isStarting: boolean;
  error: string | null;
  // Ligne grise « Réf. : … » sous l'erreur de création (étape et code technique).
  errorReference: string | null;
}

// Cause connue : son message ; création échouée pour une autre raison : message général (le détail est dans la
// référence) ; autre erreur locale : son texte.
function createErrorMessage(error: unknown): string {
  if (error instanceof CreateGameError) {
    return error.failure === 'unknown' ? strings.quizSetup.createFailedUnknown : strings.quizSetup.createFailures[error.failure];
  }
  return `${strings.quizSetup.createFailed} ${toErrorMessage(error)}`;
}

// « Choisir ce quiz » (fiche d'un quiz ou d'une partie tirée dans des thèmes) : crée la partie et ouvre son
// salon ; room (Changer de jeu) : le jeu choisi remplace celui de cette partie, puis retour à son salon.
export function useStartGame(room: string | undefined): GameStarter {
  const serverOffsetMs = useServerTimeOffset();
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorReference, setErrorReference] = useState<string | null>(null);

  async function create(quizId: string, settings: SessionSettings, sound: SoundSettings, questionRefs?: readonly string[]) {
    try {
      const code = await createGame(quizId, settings, sound, questionRefs);
      // Mémorisé sur l'appareil : « Reprendre la partie » si l'app est relancée en pleine partie.
      await saveHostedGameCode(code);
      // replace : le retour arrière depuis le lobby ramène au catalogue, pas à cette fiche.
      router.replace({ pathname: '/host/[code]', params: { code } });
    } catch (createError) {
      setError(createErrorMessage(createError));
      setErrorReference(createError instanceof CreateGameError ? strings.quizSetup.createReference(createError.reference) : null);
      setIsStarting(false);
    }
  }

  async function changeGame(code: string, quizId: string, settings: SessionSettings, questionRefs?: readonly string[]) {
    try {
      const applied = await applyHostAction(code, (session, now) => changeGameUpdate(session, quizId, settings, now, questionRefs ?? null), Date.now() + serverOffsetMs);
      if (applied) {
        router.dismissTo({ pathname: '/host/[code]', params: { code } });
        return;
      }
      setError(strings.quizSetup.changeGameFailed);
    } catch (changeError) {
      setError(`${strings.quizSetup.changeGameFailed} ${toErrorMessage(changeError)}`);
    }
    setIsStarting(false);
  }

  async function start(quizId: string, settings: SessionSettings, sound: SoundSettings, questionRefs?: readonly string[]) {
    setIsStarting(true);
    setError(null);
    setErrorReference(null);
    if (room) await changeGame(room, quizId, settings, questionRefs);
    else await create(quizId, settings, sound, questionRefs);
  }

  return { start, isStarting, error, errorReference };
}
