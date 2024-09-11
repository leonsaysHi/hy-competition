import useLibs from '@/composable/useLibs'
import type { CompetitionId } from '@/types/competitions'
import type { Game, GameId } from '@/types/games'
import type { PlayerStatLineKey } from '@/types/stats'
import type { Team, TeamId } from '@/types/teams'
import { add } from '@/utils/maths'
import type { RouteLocationRaw } from 'vue-router'
import { parseISO } from 'date-fns'
import { formatDate } from '@/utils/dates'
import type { DateFormats } from '@/types/utils'

export interface ScoresComputed extends Team {
  id: TeamId
  title: string
  finalScore: number
  periods: number[]
  winner: boolean
}

export type StatsLeadersComputed = {
  [key in PlayerStatLineKey]: []
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
  get isLive(): boolean {
    return this.row.isLive
  }

  get date(): DateFormats {
    return formatDate(parseISO(this.row.datetime))
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
    if (this.isFinished) {
      result[result[0].finalScore > result[1].finalScore ? 0 : 1].winner = true
    }
    return result
  }

  getTeamScore(teamId: TeamId): ScoresComputed | undefined {
    return this.scores.find((score: ScoresComputed) => score.id === teamId)
  }
  getOppScore(teamId: TeamId): ScoresComputed | undefined {
    return this.scores.find((score: ScoresComputed) => score.id !== teamId)
  }
}
