import useLibs from '@/composable/useLibs'
import type { CompetitionId } from '@/types/competitions'
import type { Game, GameBoxScore, GameId } from '@/types/games'
import type { PlayerStatKey } from '@/types/stats'
import type { Team, TeamId } from '@/types/teams'
import { add } from '@/utils/maths'
import type { RouteLocationRaw } from 'vue-router'
import { format } from 'date-fns'
export interface ScoresComputed extends Team {
  id: TeamId
  title: string
  finalScore: number
  periods: number[]
  winner: boolean
}

export type StatsLeadersComputed = {
  [key in PlayerStatKey]: []
}
const { getTeam } = useLibs()

export default class GameComputedClass {
  id: GameId
  competitionId: CompetitionId
  row: Game
  to: RouteLocationRaw

  constructor(competitionId: CompetitionId, game: Game) {
    this.id = game.id as GameId
    this.competitionId = competitionId
    this.row = game
    this.to = {
      name: 'competition-game',
      params: { gameId: this.row.id, competitionId: this.competitionId }
    }
  }
  get isFinished(): boolean {
    return this.row.isFinished
  }
  get boxScore(): GameBoxScore {
    return this.row.boxscore
  }
  get date(): { num: string; short: string; long: string; time: string } {
    const value = this.row.datetime
    const min = format(value, 'mm')
    const time = format(value, 'h') + (min !== '00' ? ':' + min : '') + format(value, 'aa')
    return {
      num: format(value, 'P'),
      short: format(value, 'do LLL'),
      long: format(value, 'iii, do LLL'),
      time
    }
  }

  get scores(): ScoresComputed[] {
    const result = this.row.teams.map((teamId: TeamId): ScoresComputed => {
      const periods: number[] = this.row.scores[teamId] ? this.row.scores[teamId] : [0]
      return {
        ...getTeam(teamId),
        finalScore: periods.reduce(add, 0),
        periods,
        winner: false
      }
    })
    if (result[0].finalScore > result[1].finalScore) {
      result[0].winner = true
    } else {
      result[1].winner = true
    }
    return result
  }
}
