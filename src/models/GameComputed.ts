import useLibs from '@/composable/useLibs'
import type { CompetitionId } from '@/types/competitions'
import type { Game, GameId } from '@/types/games'
import type { PlayerBoxScore, PlayerStatKey, PlayerStats } from '@/types/stats'
import type { Team, TeamId } from '@/types/teams'
import { add, getPerc } from '@/utils/maths'
import type { RouteLocationRaw } from 'vue-router'
import { parseISO } from 'date-fns'
import { formatDate } from '@/utils/dates'
import type { DateFormats } from '@/types/utils'
import useOptionsLib from '@/composable/useOptionsLib'
import type { PlayerId } from '@/types/players'
import type { GameBoxScoreComputed } from '@/types/computed'
import type { Option } from '@/types/comp-fields'

const { playerStatsKeys, playerRankingKeys, isPercStatsKey } = useOptionsLib()
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

  get boxScore(): GameBoxScoreComputed {
    const getEmptyBoxScore = (): PlayerStats =>
      playerStatsKeys.reduce((stats: PlayerStats, opt: Option) => {
        const key = opt.value as PlayerStatKey
        stats[key] = 0
        return stats
      }, {} as PlayerStats)
    return Object.keys(this.row.boxscore).reduce(
      (boxscore: GameBoxScoreComputed, playerId: PlayerId) => {
        const bsDoc = {
          ...getEmptyBoxScore(),
          ...this.row.boxscore[playerId]
        } as PlayerBoxScore
        const { fta, ftm, fga, fgm, fg3a, fg3m, oreb, dreb, ast, stl, blk, blka, fdr, fcm, tov } =
          bsDoc
        const ftprc = getPerc(fta, ftm)
        const fgprc = getPerc(fga, fgm)
        const fg3prc = getPerc(fg3a, fg3m)
        const pts = ftm + 2 * fgm + 3 * fg3m
        const reb = oreb + dreb
        const pir =
          pts +
          reb +
          ast +
          stl +
          blk +
          fdr -
          (fga - fgm + (fg3a - fg3m) + (fta - ftm) + tov + blka + fcm)
        boxscore[playerId] = {
          ...bsDoc,
          ftprc,
          fgprc,
          fg3prc,
          pts,
          reb,
          pir
        }
        return boxscore
      },
      {}
    )
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
    if (result[0].finalScore > result[1].finalScore) {
      result[0].winner = true
    } else {
      result[1].winner = true
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
