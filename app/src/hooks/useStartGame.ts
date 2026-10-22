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
}

// « Choisir ce quiz » (fiche d'un quiz ou d'une partie tirée dans des thèmes) : crée la partie et ouvre son
// salon ; room (Changer de jeu) : le jeu choisi remplace celui de cette partie, puis retour à son salon.
// Cause connue : son message ; sinon, l'erreur telle quelle.
function createErrorMessage(error: unknown): string {
  if (error instanceof CreateGameError && error.failure !== 'unknown') return strings.quizSetup.createFailures[error.failure];
  const cause = error instanceof CreateGameError ? error.cause : error;
  return `${strings.quizSetup.createFailed} ${toErrorMessage(cause)}`;
}

export function useStartGame(room: string | undefined): GameStarter {
  const serverOffsetMs = useServerTimeOffset();
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create(quizId: string, settings: SessionSettings, sound: SoundSettings, questionRefs?: readonly string[]) {
    try {
      const code = await createGame(quizId, settings, sound, questionRefs);
      // Mémorisé sur l'appareil : « Reprendre la partie » si l'app est relancée en pleine partie.
      await saveHostedGameCode(code);
      // replace : le retour arrière depuis le lobby ramène au catalogue, pas à cette fiche.
      router.replace({ pathname: '/host/[code]', params: { code } });
    } catch (createError) {
      setError(createErrorMessage(createError));
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
    if (room) await changeGame(room, quizId, settings, questionRefs);
    else await create(quizId, settings, sound, questionRefs);
  }

  return { start, isStarting, error };
}
