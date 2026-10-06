import { describe, expect, test } from 'vitest'

import { launchUpdate, replayUpdate, transitionUpdate, validateUpdate, type SessionUpdate } from '../../shared/hostEngine'
import {
  assignTeamUpdate,
  bestPlayerByTeam,
  drawsAtLaunch,
  drawTeams,
  launchTeamDraw,
  lobbyTeamRefusal,
  lateJoinerUpdate,
  rankInTeam,
  teamAssignment,
  suggestedTeamCount,
  teamCountUpdate,
  teamDrawUpdate,
  teamsValidatedUpdate,
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

  test('« Valider les équipes » : heure publiée seulement en lobby avec Groupe et des équipes complètes', () => {
    const ready = makeSession({ settings: { ...TEAMS, teamMode: 'host', teamCount: 2 }, players: players([['a', 'pink'], ['b', 'pink'], ['c', 'cyan'], ['d', 'cyan']]) })
    expect(teamsValidatedUpdate(ready, NOW)).toEqual({ teamsValidatedAt: NOW })
    expect(teamsValidatedUpdate({ ...ready, status: 'question' }, NOW)).toBeNull()
    expect(teamsValidatedUpdate({ ...ready, settings: { ...ready.settings, teams: false } }, NOW)).toBeNull()
    // Une équipe d'un seul joueur : pas de validation.
    const incomplete = { ...ready, players: players([['a', 'pink'], ['b', 'pink'], ['c', 'pink'], ['d', 'cyan']]) }
    expect(teamsValidatedUpdate(incomplete, NOW)).toBeNull()
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

describe('Au hasard : tirage au lancement', () => {
  const lobby = (entries: [PlayerId, TeamId | undefined][], settings: Partial<SessionSettings> = {}): Session =>
    ({ ...makeSession({ status: 'lobby', players: players(entries) }), settings: { ...TEAMS, teamMode: 'random', ...settings } })
  const four: [PlayerId, TeamId | undefined][] = [['a', undefined], ['b', undefined], ['c', undefined], ['d', undefined]]

  test('seulement en « Au hasard », en lobby, tant que personne n’a d’équipe', () => {
    expect(drawsAtLaunch(lobby(four))).toBe(true)
    expect(drawsAtLaunch(lobby(four, { teamMode: undefined }))).toBe(true)
    expect(drawsAtLaunch(lobby(four, { teamMode: 'host' }))).toBe(false)
    expect(drawsAtLaunch(lobby([...four.slice(1), ['a', 'pink']]))).toBe(false)
    expect(drawsAtLaunch({ ...lobby(four), status: 'starting' })).toBe(false)
  })

  test('tirage équilibré, écrit avant le lancement ; le lancement accepte la session tirée', () => {
    const draw = launchTeamDraw(lobby(four), sequence([0.3, 0.7]))
    expect(draw).not.toBeNull()
    expect(teamLaunchRefusal(draw!.session)).toBeNull()
    expect(Object.keys(draw!.update).filter((path) => path.endsWith('/team'))).toHaveLength(4)
    expect(draw!.update.teamDrawAt).toBeUndefined()
    expect(launchUpdate(draw!.session, [makeQuestion(0)], NOW).ok).toBe(true)
    expect(launchTeamDraw(lobby(four, { teamMode: 'host' }))).toBeNull()
  })

  test('salon : refus calculé sur les équipes que tirera le lancement', () => {
    expect(lobbyTeamRefusal(lobby(four))).toBeNull()
    expect(lobbyTeamRefusal(lobby(four.slice(1)))).toBe('teamsTooFewPlayers')
    expect(lobbyTeamRefusal(lobby(four, { teamCount: 3 }))).toBe('teamTooSmall')
    expect(lobbyTeamRefusal(lobby(four, { teamMode: 'host' }))).toBe('teamsUnassigned')
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
  test('lignes triées par rang, avec le meilleur joueur', () => {
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
  })
})

describe('Tirage : tous les joueurs placés, équipes équilibrées', () => {
  const ids = (count: number) => Array.from({ length: count }, (_, index) => `p${index}`)
  const sizes = (draw: Record<string, string>) =>
    Object.values(draw)
      .reduce<Record<string, number>>((count, team) => ({ ...count, [team]: (count[team] ?? 0) + 1 }), {})

  test('20 joueurs : 10/10 en 2 équipes, 7/7/6 en 3, 5 par équipe en 4 ; personne sans équipe', () => {
    for (const [teamCount, expected] of [[2, [10, 10]], [3, [7, 7, 6]], [4, [5, 5, 5, 5]]] as const) {
      const draw = drawTeams(ids(20), teamCount)
      expect(Object.keys(draw)).toHaveLength(20)
      expect(Object.values(sizes(draw)).sort((a, b) => b - a)).toEqual(expected)
    }
  })
})

describe('Joueurs sans équipe : toujours comptés, lancement refusé', () => {
  const TEAM_SETTINGS: SessionSettings = { answerMode: 'choice', speedBonus: true, control: false, teams: true, teamMode: 'random', teamCount: 4 }
  // 20 joueurs tirés au sort, puis des arrivées tardives (sans équipe).
  function drawnLobby(lateCount: number): Session {
    const ids = Array.from({ length: 20 }, (_, index) => `p${index}`)
    const draw = drawTeams(ids, 4)
    const players: Record<PlayerId, Player> = Object.fromEntries(ids.map((id) => [id, player(id, { team: draw[id] })]))
    for (let index = 0; index < lateCount; index++) players[`late${index}`] = player(`late${index}`)
    return makeSession({ status: 'lobby', settings: TEAM_SETTINGS, players })
  }

  for (const late of [1, 3, 10]) {
    test(`${late} joueur(s) arrivé(s) après le tirage : ${late} sans équipe, lancement refusé, pas de nouveau tirage automatique`, () => {
      const session = drawnLobby(late)
      expect(teamAssignment(session)).toEqual({ placed: 20, unassigned: late })
      expect(lobbyTeamRefusal(session)).toBe('teamsUnassigned')
      expect(drawsAtLaunch(session)).toBe(false)
    })
  }

  test('départ d’un joueur après le tirage : il n’est plus compté, les autres restent placés', () => {
    const session = drawnLobby(0)
    const [leaving] = Object.keys(session.players)
    const players = { ...session.players }
    delete players[leaving]
    expect(teamAssignment({ ...session, players })).toEqual({ placed: 19, unassigned: 0 })
    expect(lobbyTeamRefusal({ ...session, players })).toBeNull()
  })

  test('avant tout tirage : tous à répartir, tirage au lancement possible', () => {
    const players = Object.fromEntries(Array.from({ length: 8 }, (_, index) => [`p${index}`, player(`p${index}`)]))
    const session = makeSession({ status: 'lobby', settings: TEAM_SETTINGS, players })
    expect(teamAssignment(session)).toEqual({ placed: 0, unassigned: 8 })
    expect(drawsAtLaunch(session)).toBe(true)
  })
})

describe('Retardataires : placés par l’hôte dans l’équipe la moins nombreuse, après la validation', () => {
  const SETTINGS: SessionSettings = { answerMode: 'choice', speedBonus: true, control: false, teams: true, teamMode: 'random', teamCount: 4 }
  // 12 joueurs tirés (3 par équipe), équipes validées après le tirage, puis des arrivées.
  function validatedLobby(late: number, overrides: Partial<Session> = {}): Session {
    const ids = Array.from({ length: 12 }, (_, index) => `p${String(index).padStart(2, '0')}`)
    const teams: TeamId[] = ['pink', 'cyan', 'gold', 'green']
    const players: Record<PlayerId, Player> = Object.fromEntries(ids.map((id, index) => [id, player(id, { team: teams[index % 4] })]))
    for (let index = 0; index < late; index++) players[`z${String(index).padStart(2, '0')}`] = player(`late${index}`)
    return makeSession({ status: 'lobby', settings: SETTINGS, players, teamDrawAt: 1_000, teamsValidatedAt: 2_000, ...overrides })
  }
  function apply(session: Session, update: SessionUpdate | null): Session {
    const players = structuredClone(session.players)
    for (const [path, value] of Object.entries(update ?? {})) {
      const [root, id, field] = path.split('/')
      if (root === 'players' && field === 'team') players[id] = { ...players[id], team: value as TeamId }
    }
    return { ...session, players }
  }
  const sizes = (session: Session) => (['pink', 'cyan', 'gold', 'green'] as const).map((team) => teamMembers(session.players, team).length)

  for (const late of [1, 3, 10]) {
    test(`${late} arrivée(s) : tous placés, équipes équilibrées (écart d’un joueur au plus), lancement de nouveau possible`, () => {
      const placed = apply(validatedLobby(late), lateJoinerUpdate(validatedLobby(late)))
      const counts = sizes(placed)
      expect(counts.reduce((sum, count) => sum + count, 0)).toBe(12 + late)
      expect(Math.max(...counts) - Math.min(...counts)).toBeLessThanOrEqual(1)
      expect(lobbyTeamRefusal(placed)).toBeNull()
      expect(lateJoinerUpdate(placed)).toBeNull()
    })
  }

  test('arrivées simultanées : réparties une à une (égalité : Rose, Cyan, Or, Vert)', () => {
    expect(lateJoinerUpdate(validatedLobby(3))).toEqual({
      'settings/teamCount': 4,
      'players/z00/team': 'pink',
      'players/z01/team': 'cyan',
      'players/z02/team': 'gold',
    })
  })

  test('équipes inégales : le retardataire va dans la moins nombreuse', () => {
    const session = validatedLobby(1)
    const players = { ...session.players }
    delete players.p01 // une équipe Cyan de 2
    expect(lateJoinerUpdate({ ...session, players })).toMatchObject({ 'players/z00/team': 'cyan' })
  })

  test('joueur parti puis revenu : il garde son équipe, rien à placer', () => {
    const session = validatedLobby(0)
    const gone = { ...session, players: { ...session.players, p05: { ...session.players.p05, connected: false } } }
    expect(lateJoinerUpdate(gone)).toBeNull()
    const back = { ...gone, players: { ...gone.players, p05: { ...gone.players.p05, connected: true } } }
    expect(back.players.p05.team).toBe('cyan')
    expect(lateJoinerUpdate(back)).toBeNull()
  })

  test('hôte qui joue et s’inscrit après la validation : placé comme les autres', () => {
    const session = validatedLobby(0)
    const withHost = { ...session, players: { ...session.players, [session.hostUid]: player('Hôte') } }
    expect(lateJoinerUpdate(withHost)).toMatchObject({ [`players/${session.hostUid}/team`]: 'pink' })
  })

  test('aucun placement avant la validation, après un nouveau tirage non validé, ni hors du salon', () => {
    expect(lateJoinerUpdate(validatedLobby(2, { teamsValidatedAt: undefined }))).toBeNull()
    expect(lateJoinerUpdate(validatedLobby(2, { teamDrawAt: 3_000 }))).toBeNull()
    expect(lateJoinerUpdate(validatedLobby(2, { status: 'question' }))).toBeNull()
  })
})
