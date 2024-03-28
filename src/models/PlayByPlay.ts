import useOptionsLib from '@/composable/useOptionsLib'
import type { LineUps, Play, PlayStack, Rosters } from '@/play-by-play/GameInput.vue'
import type { CompetitionConfig } from '@/types/competitions'
import type { GameDocBoxScore, GameDocScores, GameId } from '@/types/games'
import type { PlayerId } from '@/types/players'
import type { PlayerStatKey, PlayerStats } from '@/types/stats'
import type { TeamId } from '@/types/teams'
import { differenceInMilliseconds } from 'date-fns'

const { playerStatsKeys } = useOptionsLib()
export default class PlayByPlayModel {
  id: GameId
  config: CompetitionConfig
  data: PlayStack[]
  rosters: Rosters

  constructor(
    id: GameId,
    competitionConfig: CompetitionConfig,
    playByPlay: PlayStack[],
    rosters: Rosters
  ) {
    this.id = id as GameId
    this.config = competitionConfig
    this.data = playByPlay
    this.rosters = rosters
  }

  get isFinished(): boolean {
    return false
  }

  get playStacks(): PlayStack[] {
    return Array.isArray(this.data) ? this.data : []
  }

  get time(): number {
    let result: number = 0
    this.data.forEach((stack: PlayStack) => {
      result = Math.max(result, stack.time)
    })
    return result
  }

  get lineups(): LineUps {
    const lineups = Object.keys(this.rosters).reduce((result: LineUps, teamId: TeamId) => {
      result[teamId] = []
      return result
    }, {})
    this.data.forEach((stack: PlayStack) => {
      if (['subout', 'subin'].includes(stack.playStack[0].actionKey)) {
        stack.playStack.forEach((play: Play) => {
          const { playerId, actionKey } = play
          const teamId = this.getTeamIdFromPlayerId(playerId)
          if (actionKey === 'subin') {
            lineups[teamId].push(playerId)
          } else if (actionKey === 'subout') {
            const idx = lineups[teamId].findIndex((pId: PlayerId) => pId === playerId)
            idx > -1 && lineups[teamId].splice(idx, 1)
          }
        })
      }
    })
    return lineups
  }

  get boxScore(): GameDocBoxScore {
    const getEmptyBoxScore = (): PlayerStats =>
      playerStatsKeys.reduce((stats: PlayerStats, opt: Option) => {
        const key = opt.value as PlayerStatKey
        stats[key] = 0
        return stats
      }, {} as PlayerStats)
    const boxscores = Object.keys(this.rosters).reduce(
      (boxscores: GameDocBoxScore, teamId: TeamId) => {
        Object.keys(this.rosters[teamId]).forEach((playerId: PlayerId) => {
          boxscores[playerId] = {
            ...getEmptyBoxScore(),
            dnp: true
          }
        })
        return boxscores
      },
      {}
    )
    // fill stats
    this.data.forEach((stack: PlayStack) => {
      stack.playStack.forEach((play: Play) => {
        const { playerId, actionKey } = play
        if (!['subout', 'subin'].includes(actionKey)) {
          const statKey = actionKey as PlayerStatKey
          boxscores[playerId][statKey] = boxscores[playerId][statKey] || 0
          boxscores[playerId][statKey] += 1
          if (statKey === 'blk') {
            boxscores[stack.playStack[0].playerId].blka =
              boxscores[stack.playStack[0].playerId].blka || 0
            boxscores[stack.playStack[0].playerId].blka += 1
          }
        }
      })
    })
    // fill time
    const subsByPlayers = this.data.reduce(
      (subs: { [key: PlayerId]: number[] }, stack: PlayStack) => {
        if (['subout', 'subin'].includes(stack.playStack[0].actionKey)) {
          stack.playStack.forEach((play: Play) => {
            const { playerId } = play
            subs[playerId] = subs[playerId] || []
            subs[playerId].push(stack.time)
          })
        }
        return subs
      },
      {}
    )
    const lastTimeStamp = Math.max(...this.data.map((stack: PlayStack) => stack.time))
    Object.keys(subsByPlayers).forEach((playerId: PlayerId) => {
      const subsList = subsByPlayers[playerId]
      if (subsList.length % 2 === 0) subsList.push(lastTimeStamp)
      const playerTime = subsList
        .flatMap((_: any, idx: number, arr: []) => (idx % 2 ? [] : [arr.slice(idx, idx + 2)]))
        .reduce((time: number, arr: number[]) => {
          if (arr.length === 1) {
            arr.push(lastTimeStamp)
          }
          time += arr.length === 2 ? differenceInMilliseconds(arr[1], arr[0]) : 0
          return time
        }, 0)
      boxscores[playerId] = boxscores[playerId] || {}
      boxscores[playerId].time = playerTime
      boxscores[playerId].dnp = false
    })
    return boxscores
  }

  get scores(): GameDocScores {
    const emptyValue = Object.keys(this.rosters).reduce((result: GameDocScores, teamId: TeamId) => {
      result[teamId] = []
      return result
    }, {})
    return this.data.reduce((score: GameDocScores, stack: PlayStack) => {
      stack.playStack.forEach((play: Play) => {
        if (['ftm', 'fgm', 'fg3m'].includes(play.actionKey)) {
          const { playerId, actionKey } = play
          const periodIdx = this.getPeriodIdxFromTime(stack.time)
          const teamId = this.getTeamIdFromPlayerId(playerId)
          score[teamId][periodIdx] = score[teamId][periodIdx] || 0
          score[teamId][periodIdx] += actionKey === 'fg3m' ? 3 : actionKey === 'fgm' ? 2 : 1
        }
      })
      return score
    }, emptyValue)
  }

  getPeriodIdxFromTime = (time: number): number => {
    const { gameLength, nbPeriods, otLength } = this.config
    return time <= gameLength
      ? Math.floor(time / (gameLength / nbPeriods))
      : nbPeriods + Math.floor((time - gameLength) / otLength)
  }
  getTeamIdFromPlayerId = (playerId: PlayerId): TeamId => {
    return Object.keys(this.rosters).find((teamId: TeamId) =>
      Object.keys(this.rosters[teamId]).includes(playerId)
    ) as TeamId
  }
}
