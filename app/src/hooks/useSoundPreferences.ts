import { DEFAULT_SOUND_SETTINGS } from '@shared/sound';
import type { SoundSettings } from '@shared/types';
import { useEffect, useState } from 'react';

import { loadSoundPreferences, saveSoundPreferences } from '@/lib/soundPreferences';

// Réglages du son choisis avant la création de la partie : lus sur le téléphone, mémorisés à chaque
// changement.
export function useSoundPreferences(): [SoundSettings, (sound: SoundSettings) => void] {
  const [sound, setSound] = useState<SoundSettings>(DEFAULT_SOUND_SETTINGS);

  useEffect(() => {
    let isActive = true;
    void loadSoundPreferences().then((stored) => {
      if (isActive) setSound(stored);
    });
    return () => {
      isActive = false;
    };
  }, []);

  function change(next: SoundSettings) {
    setSound(next);
    void saveSoundPreferences(next);
  }

  return [sound, change];
}
