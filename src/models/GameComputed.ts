import useLibs from '@/composable/useLibs'
import type { CompetitionId } from '@/types/competitions'
import type { Game, GameBoxScore, GameId } from '@/types/games'
import type { Team, TeamId } from '@/types/teams'
import { add } from '@/utils/maths'
import type { RouteLocationRaw } from 'vue-router'

interface ScoresComputed extends Team {
  title: string
  finalScore: number
  periods: number[]
  winner: boolean
}
const { getTeam } = useLibs()

export default class GameClass {
  id: GameId
  competitionId: CompetitionId
  row: Game
  to: RouteLocationRaw

  constructor(competitionId: CompetitionId, game: Game) {
    this.id = game.id
    this.competitionId = competitionId
    this.row = game
    this.to = {
      name: 'competition-game',
      params: { gameId: this.row.id, competitionId: this.competitionId }
    }
  }

  get boxScore(): GameBoxScore {
    return this.row.boxscore
  }

  get scores(): ScoresComputed[] {
    const result = Object.keys(this.row.scores).map((teamId: TeamId): ScoresComputed => {
      const periods: number[] = this.row.scores[teamId]
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
