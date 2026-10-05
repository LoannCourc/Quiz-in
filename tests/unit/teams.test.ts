import { describe, expect, test } from 'vitest'

import { launchUpdate, replayUpdate, transitionUpdate, validateUpdate, type SessionUpdate } from '../../shared/hostEngine'
import {
  assignTeamUpdate,
  bestPlayerByTeam,
  drawTeams,
  previousTeamRank,
  rankInTeam,
  suggestedTeamCount,
  teamCountUpdate,
  teamDrawUpdate,
  teamLaunchRefusal,
  teamMembers,
  teamModeUpdate,
  teamQuestionPoints,
  teamRanking,
  teamStandings,
} from '../../shared/teams'
import type { Answer, Player, PlayerId, Session, SessionSettings, TeamId } from '../../shared/types'
import { makeQuestion, makeSession, player } from './engineFixtures'

const NOW = 2_000_000
const TEAMS: SessionSettings = { answerMode: 'choice', speedBonus: false, control: false, teams: true }

// Générateur déterministe pour les tirages (suite fixe de valeurs dans [0, 1[).
function sequence(values: number[]): () => number {
  let index = 0
  return () => values[index++ % values.length]
}

function players(entries: [PlayerId, TeamId | undefined, number?, boolean?][]): Record<PlayerId, Player> {
  return Object.fromEntries(
    entries.map(([id, team, score = 0, connected = true]) => [id, { ...player(id), team, score, connected }]),
  )
}

// Applique un update multi-chemins (chemins imbriqués compris), comme Firebase.
function apply(session: Session, update: SessionUpdate | null): Session {
  expect(update).not.toBeNull()
  const next = structuredClone(session) as unknown as Record<string, unknown>
  for (const [path, value] of Object.entries(update as SessionUpdate)) {
    const keys = path.split('/')
    let node = next
    for (const key of keys.slice(0, -1)) {
      if (typeof node[key] !== 'object' || node[key] === null) node[key] = {}
      node = node[key] as Record<string, unknown>
    }
    const last = keys[keys.length - 1]
    if (value === null) delete node[last]
    else node[last] = structuredClone(value)
  }
  return next as unknown as Session
}

describe('Formation des équipes', () => {
  test('nombre proposé : le plus grand qui laisse 2 joueurs par équipe, de 2 à 4', () => {
    expect([4, 5, 6, 7, 8, 20].map(suggestedTeamCount)).toEqual([2, 2, 3, 3, 4, 4])
  })

  test('tirage équilibré : 7 joueurs en 3 équipes de 3, 2 et 2, tout le monde placé', () => {
    const ids = ['a', 'b', 'c', 'd', 'e', 'f', 'g']
    const draw = drawTeams(ids, 3, sequence([0.1, 0.7, 0.3, 0.9, 0.5]))
    expect(Object.keys(draw).sort()).toEqual(ids)
    const sizes = (['pink', 'cyan', 'gold'] as TeamId[]).map((team) => Object.values(draw).filter((t) => t === team).length)
    expect(sizes).toEqual([3, 2, 2])
    expect(Object.values(draw)).not.toContain('green')
  })

  test('« Tirer au sort » : équipes, nombre d’équipes et heure du tirage ; seulement en lobby avec Groupe', () => {
    const session = makeSession({ settings: TEAMS, players: players([['a', undefined], ['b', undefined], ['c', undefined], ['d', undefined]]) })
    const update = teamDrawUpdate(session, NOW, sequence([0.2]))
    expect(update).toMatchObject({ teamDrawAt: NOW, 'settings/teamCount': 2 })
    expect(Object.keys(update ?? {}).filter((path) => path.endsWith('/team'))).toHaveLength(4)
    expect(teamDrawUpdate({ ...session, status: 'question' }, NOW)).toBeNull()
    expect(teamDrawUpdate({ ...session, settings: { ...TEAMS, teams: false } }, NOW)).toBeNull()
  })

  test('placement par l’hôte : seulement dans une équipe de la partie, ou retrait avec null', () => {
    const session = makeSession({ settings: { ...TEAMS, teamCount: 2 }, players: players([['a', undefined], ['b', 'pink']]) })
    expect(assignTeamUpdate(session, 'a', 'cyan')).toEqual({ 'settings/teamCount': 2, 'players/a/team': 'cyan' })
    expect(assignTeamUpdate(session, 'b', null)).toEqual({ 'settings/teamCount': 2, 'players/b/team': null })
    expect(assignTeamUpdate(session, 'a', 'gold')).toBeNull()
    expect(assignTeamUpdate(session, 'inconnu', 'pink')).toBeNull()
  })

  test('moins d’équipes : les joueurs d’une équipe supprimée redeviennent sans équipe', () => {
    const session = makeSession({ settings: { ...TEAMS, teamCount: 3 }, players: players([['a', 'pink'], ['b', 'gold']]) })
    expect(teamCountUpdate(session, 2)).toEqual({ 'settings/teamCount': 2, 'players/b/team': null })
    expect(teamModeUpdate(session, 'players')).toEqual({ 'settings/teamCount': 3, 'settings/teamMode': 'players' })
  })
})

describe('Lancement en Groupe', () => {
  test('refus : moins de 4 joueurs, joueur sans équipe, équipe d’un seul joueur ou vide', () => {
    const base = { settings: { ...TEAMS, teamCount: 2 } }
    expect(teamLaunchRefusal({ ...base, players: players([['a', 'pink'], ['b', 'pink'], ['c', 'cyan']]) })).toBe('teamsTooFewPlayers')
    expect(teamLaunchRefusal({ ...base, players: players([['a', 'pink'], ['b', 'pink'], ['c', 'cyan'], ['d', undefined]]) })).toBe('teamsUnassigned')
    expect(teamLaunchRefusal({ ...base, players: players([['a', 'pink'], ['b', 'pink'], ['c', 'pink'], ['d', 'cyan']]) })).toBe('teamTooSmall')
    const three = { settings: { ...TEAMS, teamCount: 3 }, players: players([['a', 'pink'], ['b', 'pink'], ['c', 'cyan'], ['d', 'cyan']]) }
    expect(teamLaunchRefusal(three)).toBe('teamTooSmall')
    expect(teamLaunchRefusal({ ...base, players: players([['a', 'pink'], ['b', 'pink'], ['c', 'cyan'], ['d', 'cyan']]) })).toBeNull()
  })

  test('launchUpdate : refus avec la raison ; accepté, nombre d’équipes figé et scores d’équipe effacés', () => {
    const ready = makeSession({ settings: TEAMS, players: players([['a', 'pink'], ['b', 'pink'], ['c', 'cyan'], ['d', 'cyan']]) })
    const launch = launchUpdate(ready, [makeQuestion(0)], NOW)
    expect(launch).toMatchObject({ ok: true, update: { 'settings/teamCount': 2, teams: null, teamPoints: null, teamPresence: null } })
    const alone = makeSession({ settings: TEAMS, players: players([['a', 'pink'], ['b', 'pink'], ['c', 'cyan'], ['d', undefined]]) })
    expect(launchUpdate(alone, [makeQuestion(0)], NOW)).toEqual({ ok: false, reason: 'teamsUnassigned' })
  })
})

describe('Score des équipes', () => {
  const roster = players([
    ['a', 'pink'],
    ['b', 'pink'],
    ['c', 'pink', 0, false],
    ['d', 'cyan'],
    ['e', 'cyan'],
  ])

  test('moyenne des joueurs présents ; présent sans réponse = 0 ; absent ignoré', () => {
    const presence = { a: true, b: true, d: true, e: true } as const
    const results = { a: { correct: true, points: 150 }, c: { correct: true, points: 200 }, d: { correct: true, points: 100 }, e: { correct: true, points: 120 } }
    expect(teamQuestionPoints(roster, presence, results, ['pink', 'cyan'])).toEqual({ pink: 75, cyan: 110 })
  })

  test('équipe sans joueur présent : 0 point', () => {
    expect(teamQuestionPoints(roster, {}, {}, ['pink'])).toEqual({ pink: 0 })
  })

  test('score cumulé question par question, rangs avec égalités', () => {
    const points = { 0: { pink: 100, cyan: 50, gold: 80 }, 1: { pink: 0, cyan: 50, gold: 20 } }
    expect(teamStandings(points, ['pink', 'cyan', 'gold'], 1)).toEqual({
      pink: { score: 100, rank: 1 },
      cyan: { score: 100, rank: 1 },
      gold: { score: 100, rank: 1 },
    })
    expect(teamStandings(points, ['pink', 'cyan', 'gold'], 0)).toMatchObject({ pink: { rank: 1 }, gold: { rank: 2 }, cyan: { rank: 3 } })
  })

  test('rang dans l’équipe et meilleur joueur de chaque équipe', () => {
    const scored = players([['a', 'pink', 300], ['b', 'pink', 500], ['c', 'cyan', 200], ['d', 'cyan', 200]])
    expect(rankInTeam(scored, 'a')).toEqual({ rank: 2, size: 2 })
    expect(rankInTeam(players([['z', undefined]]), 'z')).toBeNull()
    expect(bestPlayerByTeam(scored)).toEqual({ pink: 'b', cyan: 'c' })
    expect(teamMembers(scored, 'cyan')).toEqual(['c', 'd'])
  })
})

describe('Moteur : équipes pendant la partie', () => {
  const question = makeQuestion(0)
  const roster = players([['a', 'pink'], ['b', 'pink'], ['c', 'cyan'], ['d', 'cyan']])

  function questionSession(settings: SessionSettings, answers: Record<PlayerId, Answer>): Session {
    return makeSession({
      status: 'question',
      settings: { ...settings, teamCount: 2 },
      questionCount: 2,
      phaseStartedAt: NOW - 20_000,
      phaseEndsAt: NOW,
      players: roster,
      answers: { 0: answers },
    })
  }

  test('révélation : joueurs comptés, points d’équipe de la question, score et rang de chaque équipe', () => {
    const session = questionSession(TEAMS, { a: { value: 1, submittedAt: NOW - 5_000 }, c: { value: 1, submittedAt: NOW - 5_000 }, d: { value: 0, submittedAt: NOW - 5_000 } })
    const reveal = apply(session, transitionUpdate(session, [question], { status: 'question', currentIndex: 0 }, NOW + 2_000))
    expect(reveal.teamPresence?.[0]).toEqual({ a: true, b: true, c: true, d: true })
    expect(reveal.teamPoints?.[0]).toEqual({ pink: 50, cyan: 50 })
    expect(reveal.teams).toEqual({ pink: { score: 50, rank: 1 }, cyan: { score: 50, rank: 1 } })
  })

  test('Contrôle : joueurs comptés figés à la fin de la question, même s’ils partent pendant la validation', () => {
    const control: SessionSettings = { ...TEAMS, answerMode: 'free', control: true }
    const free = makeQuestion(0, { acceptedAnswers: ['juste'] })
    const session = questionSession(control, { a: { value: 'juste', submittedAt: NOW - 5_000 }, c: { value: 'juste', submittedAt: NOW - 5_000 } })
    let current = apply(session, transitionUpdate(session, [free], { status: 'question', currentIndex: 0 }, NOW + 2_000))
    expect(current.status).toBe('validation')
    expect(current.teamPresence?.[0]).toEqual({ a: true, b: true, c: true, d: true })
    // b se déconnecte pendant la validation : il compte toujours (0 point) pour Rose.
    current = { ...current, players: { ...current.players, b: { ...current.players.b, connected: false } } }
    current = apply(current, validateUpdate(current, [free], {}, NOW + 30_000))
    expect(current.teamPoints?.[0]).toEqual({ pink: 50, cyan: 50 })
  })

  test('Rejouer : équipes des joueurs gardées, scores d’équipe effacés', () => {
    const ended = makeSession({ status: 'ended', settings: TEAMS, players: roster, teams: { pink: { score: 10, rank: 1 } }, teamPoints: { 0: { pink: 10 } } })
    const replayed = apply(ended, replayUpdate(ended, NOW))
    expect(replayed.players.a.team).toBe('pink')
    expect(replayed.teams).toBeUndefined()
    expect(replayed.teamPoints).toBeUndefined()
  })

  test('sans Groupe : aucun chemin d’équipe écrit', () => {
    const session = questionSession({ ...TEAMS, teams: false }, {})
    const update = transitionUpdate(session, [question], { status: 'question', currentIndex: 0 }, NOW + 2_000) ?? {}
    expect(Object.keys(update).some((path) => path.startsWith('team'))).toBe(false)
  })
})

describe('Classements d’équipe (écrans)', () => {
  test('lignes triées par rang, avec le meilleur joueur ; rang avant la question', () => {
    const session = {
      players: players([['a', 'pink', 300], ['b', 'pink', 100], ['c', 'cyan', 250], ['d', 'cyan', 250]]),
      teams: { pink: { score: 200, rank: 2 }, cyan: { score: 250, rank: 1 } },
      teamPoints: { 0: { pink: 150, cyan: 100 }, 1: { pink: 50, cyan: 150 } },
      currentIndex: 1,
    }
    expect(teamRanking(session)).toEqual([
      { team: 'cyan', score: 250, rank: 1, bestPlayerId: 'c' },
      { team: 'pink', score: 200, rank: 2, bestPlayerId: 'a' },
    ])
    expect(previousTeamRank(session, 'cyan')).toBe(2)
    expect(previousTeamRank({ ...session, currentIndex: 0 }, 'cyan')).toBeUndefined()
  })
})
