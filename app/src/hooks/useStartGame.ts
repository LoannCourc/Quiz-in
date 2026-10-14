import { changeGameUpdate } from '@shared/hostEngine';
import type { SessionSettings, SoundSettings } from '@shared/types';
import { router } from 'expo-router';
import { useState } from 'react';

import { strings } from '@/constants/strings';
import { useServerTimeOffset } from '@/hooks/useServerTimeOffset';
import { createGame, NoFreeRoomCodeError } from '@/lib/createGame';
import { toErrorMessage } from '@/lib/errors';
import { applyHostAction } from '@/lib/hostGame';
import { saveHostedGameCode } from '@/lib/hostedGameStorage';

export interface GameStarter {
  start: (quizId: string, settings: SessionSettings, sound: SoundSettings) => Promise<void>;
  isStarting: boolean;
  error: string | null;
}

// « Choisir ce quiz » (fiche d'un quiz ou d'une partie tirée dans des thèmes) : crée la partie et ouvre son
// salon ; room (Changer de jeu) : le jeu choisi remplace celui de cette partie, puis retour à son salon.
export function useStartGame(room: string | undefined): GameStarter {
  const serverOffsetMs = useServerTimeOffset();
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create(quizId: string, settings: SessionSettings, sound: SoundSettings) {
    try {
      const code = await createGame(quizId, settings, sound);
      // Mémorisé sur l'appareil : « Reprendre la partie » si l'app est relancée en pleine partie.
      await saveHostedGameCode(code);
      // replace : le retour arrière depuis le lobby ramène au catalogue, pas à cette fiche.
      router.replace({ pathname: '/host/[code]', params: { code } });
    } catch (createError) {
      setError(createError instanceof NoFreeRoomCodeError ? strings.quizSetup.noFreeCode : `${strings.quizSetup.createFailed} ${toErrorMessage(createError)}`);
      setIsStarting(false);
    }
  }

  async function changeGame(code: string, quizId: string, settings: SessionSettings) {
    try {
      const applied = await applyHostAction(code, (session, now) => changeGameUpdate(session, quizId, settings, now), Date.now() + serverOffsetMs);
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

  async function start(quizId: string, settings: SessionSettings, sound: SoundSettings) {
    setIsStarting(true);
    setError(null);
    if (room) await changeGame(room, quizId, settings);
    else await create(quizId, settings, sound);
  }

  return { start, isStarting, error };
}
