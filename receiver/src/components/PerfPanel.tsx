import { useEffect, useState } from 'react'

import { perfMonitor, type MusicBucket, type PerfIncident, type PerfSnapshot } from '../lib/perf/perfMonitor'
import { strings } from '../strings'
import './PerfPanel.css'

const REFRESH_MS = 500
const MEGABYTE = 1024 * 1024
const texts = strings.perf

interface PerfPanelProps {
  serverOffsetMs: number
}

// Panneau de mesures (?perf=1) : lance le moniteur tant qu'il est affiché et se rafraîchit deux fois par
// seconde (son propre état : la partie n'est pas redessinée pour lui).
export function PerfPanel({ serverOffsetMs }: PerfPanelProps) {
  const [snapshot, setSnapshot] = useState<PerfSnapshot>(() => perfMonitor.snapshot())

  useEffect(() => {
    perfMonitor.start()
    const intervalId = setInterval(() => setSnapshot(perfMonitor.snapshot()), REFRESH_MS)
    return () => {
      clearInterval(intervalId)
      perfMonitor.stop()
    }
  }, [])

  useEffect(() => perfMonitor.setServerOffset(serverOffsetMs), [serverOffsetMs])

  return (
    <>
      <div className="perf-panel perf-panel-stats">
        <div className="perf-title">{texts.title}</div>
        <LiveStats snapshot={snapshot} />
        <CompareTable on={snapshot.buckets.on} off={snapshot.buckets.off} />
      </div>
      <div className="perf-panel perf-panel-incidents">
        <div className="perf-title">{texts.incidentsTitle(snapshot.incidents.length)}</div>
        {snapshot.incidents.length === 0 && <div>{texts.noIncident}</div>}
        {snapshot.incidents.map((incident) => (
          <IncidentRow key={`${incident.at}-${incident.kind}-${incident.valueMs}`} incident={incident} />
        ))}
      </div>
    </>
  )
}

function LiveStats({ snapshot }: { snapshot: PerfSnapshot }) {
  const { music, memory, lastTransition, keepAwake } = snapshot
  return (
    <>
      <div className={snapshot.musicOn ? 'perf-strong' : undefined}>{texts.sound(snapshot.musicOn, snapshot.musicForcedOff, snapshot.effectsOn)}</div>
      <div>{texts.fps(snapshot.fps, snapshot.minFps)}</div>
      <div>{texts.longTasks(snapshot.longTasks, snapshot.longTaskMaxMs, snapshot.supportsLongTasks)}</div>
      <div>{texts.tickGap(snapshot.tickGapMaxMs)}</div>
      <div>{texts.renders(snapshot.rendersPerSecond)}</div>
      <div>{memory ? texts.memory(memory.usedMb, memory.limitMb) : texts.memoryUnknown}</div>
      <div>{texts.musicMemory(music.decodedTracks, music.decodedBytes / MEGABYTE, music.fileBytes / MEGABYTE, music.decodingCount)}</div>
      {music.lastDecode && <div>{texts.lastDecode(music.lastDecode.track, music.lastDecode.ms)}</div>}
      <div>
        {lastTransition
          ? texts.transition(lastTransition.status, lastTransition.hostMs, lastTransition.networkMs, lastTransition.displayMs)
          : texts.noTransition}
      </div>
      <div>{texts.keepAwake(keepAwake.video, keepAwake.wakeLock)}</div>
      <div>{texts.screen(snapshot.screen, snapshot.chromeVersion)}</div>
      <div>{texts.build(new Date(__BUILD_TIME__), __BUILD_COMMIT__)}</div>
      <div>{texts.streaks(snapshot.streaks.active, snapshot.streaks.zero, snapshot.streaks.missing)}</div>
      {snapshot.teamColumns && (
        <div className={snapshot.teamColumns.teams.some((team) => team.shown < team.received) ? 'perf-alert' : undefined}>
          {texts.teamColumns(snapshot.teamColumns.scale, snapshot.teamColumns.teams)}
        </div>
      )}
    </>
  )
}

function duration(seconds: number): string {
  const total = Math.round(seconds)
  return `${Math.floor(total / 60)} min ${String(total % 60).padStart(2, '0')} s`
}

function averageFps(bucket: MusicBucket): string {
  if (bucket.seconds === 0) return '–'
  const min = bucket.minFps === null ? '–' : Math.round(bucket.minFps)
  return `${Math.round(bucket.frames / bucket.seconds)} (${min})`
}

function transitions(bucket: MusicBucket): string {
  if (bucket.transitions === 0) return '–'
  return `${Math.round(bucket.tvLatencySumMs / bucket.transitions)} (${bucket.tvLatencyMaxMs}) ms`
}

// Une ligne par mesure, une colonne par état de la musique.
function CompareTable({ on, off }: { on: MusicBucket; off: MusicBucket }) {
  const rows: [string, (bucket: MusicBucket) => string][] = [
    [texts.compareRows.duration, (bucket) => duration(bucket.seconds)],
    [texts.compareRows.fps, averageFps],
    [texts.compareRows.longTasks, (bucket) => `${bucket.longTasks} (${Math.round(bucket.longTaskMaxMs)} ms)`],
    [texts.compareRows.tickGap, (bucket) => `${Math.round(bucket.tickGapMaxMs)} ms`],
    [texts.compareRows.transitions, transitions],
    [texts.compareRows.host, (bucket) => `${bucket.hostLatencyMaxMs} ms`],
    [texts.compareRows.incidents, (bucket) => String(bucket.incidents)],
  ]
  return (
    <table className="perf-table">
      <caption>{texts.compareTitle}</caption>
      <thead>
        <tr>
          {texts.compareHead.map((label) => (
            <th key={label}>{label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map(([label, format]) => (
          <tr key={label}>
            <th>{label}</th>
            <td>{format(on)}</td>
            <td>{format(off)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function clock(at: number): string {
  return new Date(at).toLocaleTimeString('fr-FR')
}

function IncidentRow({ incident }: { incident: PerfIncident }) {
  const context = texts.incidentContext(incident.status, incident.index, incident.music, incident.decoding)
  return (
    <div className={incident.kind === 'decode' ? 'perf-incident perf-info' : 'perf-incident'}>
      {clock(incident.at)} {texts.incidentKinds[incident.kind]} {incident.valueMs} ms · {incident.detail} · {context}
    </div>
  )
}
