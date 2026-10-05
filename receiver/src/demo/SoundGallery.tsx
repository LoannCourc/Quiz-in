import { DEFAULT_SOUND_SETTINGS, SOUND_EFFECT_IDS, SOUND_VOLUME_STEPS } from '@shared/sound'
import type { SoundSettings } from '@shared/types'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'

import { playLoop } from '../lib/sound/musicLoop'
import { soundEngine } from '../lib/sound/soundEngine'
import { strings } from '../strings'
import './DevPanel.css'
import { createPlaceholderLoop } from './placeholderLoop'
import { runSoundSelfTest, type EffectReport } from './soundSelfTest'

// Galerie des sons (?sounds=1, développement seulement) : chaque effet à la demande, les réglages de
// l'hôte, une boucle témoin sur le canal musique et un ducking, pour régler les volumes à l'oreille.
// &selftest=1 : auto-test de tous les effets, calculés hors ligne (erreurs, saturation, niveaux).
export function SoundGallery({ withSelfTest = false }: { withSelfTest?: boolean }) {
  const state = useSyncExternalStore(
    (listener) => soundEngine.subscribe(listener),
    () => soundEngine.state,
  )
  const [settings, setSettings] = useState<SoundSettings>(DEFAULT_SOUND_SETTINGS)
  const stopLoop = useRef<(() => void) | null>(null)
  const [isLooping, setIsLooping] = useState(false)
  const { sounds: texts } = strings.dev
  const [reports, setReports] = useState<EffectReport[] | null>(null)

  useEffect(() => {
    if (withSelfTest) void runSoundSelfTest().then(setReports)
  }, [withSelfTest])

  useEffect(() => {
    soundEngine.start()
    return () => stopLoop.current?.()
  }, [])

  useEffect(() => {
    soundEngine.applySettings(settings)
  }, [settings])

  function toggleLoop() {
    if (stopLoop.current) {
      stopLoop.current()
      stopLoop.current = null
      setIsLooping(false)
      return
    }
    const music = soundEngine.musicInput
    if (!music) return
    stopLoop.current = playLoop(music.context, music.input, createPlaceholderLoop(music.context), 1)
    setIsLooping(true)
  }

  return (
    <main className="screen status">
      <h1 className="status-title">{texts.title}</h1>
      <p className="status-hint">{texts.hint}</p>
      <div className="dev-panel sound-gallery">
        <strong>{texts.state(state)}</strong>
        <button type="button" onClick={() => setSettings({ ...settings, music: !settings.music })}>
          {texts.music(settings.music)}
        </button>
        <button type="button" onClick={() => setSettings({ ...settings, effects: !settings.effects })}>
          {texts.effects(settings.effects)}
        </button>
        {SOUND_VOLUME_STEPS.map((volume) => (
          <button key={volume} type="button" disabled={volume === settings.volume} onClick={() => setSettings({ ...settings, volume })}>
            {texts.volume(volume)}
          </button>
        ))}
        <button type="button" onClick={toggleLoop}>
          {texts.loop(isLooping)}
        </button>
        <button type="button" onClick={() => soundEngine.duck(2)}>
          {texts.duck}
        </button>
        {SOUND_EFFECT_IDS.map((id) => (
          <button key={id} type="button" onClick={() => soundEngine.playEffect(id)}>
            {id}
          </button>
        ))}
      </div>
      {withSelfTest && (
        <ul className="status-lines">
          {reports === null ? (
            <li>{texts.selfTestRunning}</li>
          ) : (
            reports.map((report) => (
              <li key={report.id}>
                {report.error
                  ? texts.selfTestError(report.id, report.error)
                  : texts.selfTestRow(report.id, report.durationS, report.peak, report.rms)}
              </li>
            ))
          )}
        </ul>
      )}
    </main>
  )
}
