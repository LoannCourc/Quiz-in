import { describe, expect, test } from 'vitest'

import { TEAM_DRAW_ARRIVAL_MS, TEAM_DRAW_ARRIVALS_MAX_MS, TEAM_DRAW_HOLD_MS, teamDrawTimeline } from '../../shared/teamDraw'
import { drawTeams } from '../../shared/teams'
import type { Player, PublicSession } from '../../shared/types'
import { makeSession, player } from './engineFixtures'

const SIZES = [4, 8, 13, 17, 19, 20]

// Salon en Groupe après un tirage : n joueurs répartis en teamCount équipes (tailles inégales si n ne
// tombe pas juste : 13 en 3 équipes = 5/4/4, 17 en 4 = 5/4/4/4…).
function drawnSession(playerCount: number, teamCount: number): PublicSession {
  const ids = Array.from({ length: playerCount }, (_, index) => `p${index}`)
  const draw = drawTeams(ids, teamCount)
  const players: Record<string, Player> = Object.fromEntries(ids.map((id, index) => [id, player(`Joueur ${index}`, { team: draw[id] })]))
  return makeSession({ status: 'lobby', settings: { answerMode: 'choice', speedBonus: true, control: false, teams: true, teamCount }, players, teamDrawAt: 1_000 })
}

describe('Tirage des équipes : tous les joueurs placés à la fin de l’animation', () => {
  for (const teamCount of [2, 3, 4]) {
    for (const playerCount of SIZES) {
      test(`${playerCount} joueurs en ${teamCount} équipes`, () => {
        const timeline = teamDrawTimeline(drawnSession(playerCount, teamCount))
        // Chaque joueur arrive une fois, dans l'ordre, sans trou.
        expect(new Set(timeline.arrivals.map((arrival) => arrival.playerId)).size).toBe(playerCount)
        timeline.arrivals.forEach((arrival, index) => expect(arrival.atMs).toBe(index * timeline.stepMs))
        // Le dernier est posé avant le gong, le gong avant la fin de l'écran du tirage.
        const lastAt = timeline.arrivals[playerCount - 1].atMs
        expect(timeline.gongAtMs).toBe(lastAt + TEAM_DRAW_ARRIVAL_MS)
        expect(timeline.endMs).toBe(timeline.gongAtMs + TEAM_DRAW_HOLD_MS)
        // Durée raisonnable : arrivées en 6 s au plus.
        expect(lastAt).toBeLessThanOrEqual(TEAM_DRAW_ARRIVALS_MAX_MS)
      })
    }
  }

  test('une arrivée toutes les 0,45 s pour peu de joueurs, plus vite pour 20 (toutes en 6 s)', () => {
    expect(teamDrawTimeline(drawnSession(4, 2)).stepMs).toBe(450)
    expect(teamDrawTimeline(drawnSession(20, 4)).stepMs).toBe(315)
  })
})
