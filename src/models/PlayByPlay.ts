import type { LineUps, Play, PlayByPlay, PlayStack, Rosters } from '@/play-by-play/GameInput.vue'
import type { CompetitionConfig } from '@/types/competitions'
import type { GameDocBoxScore, GameDocScores, GameId } from '@/types/games'
import type { Player, PlayerId } from '@/types/players'
import type { PlayerStatKey } from '@/types/stats'
import type { TeamId } from '@/types/teams'
import { differenceInMilliseconds } from 'date-fns'

export default class PlayByPlayModel {
  id: GameId
  config: CompetitionConfig
  data: PlayByPlay
  rosters: Rosters

  constructor(
    id: GameId,
    competitionConfig: CompetitionConfig,
    playByPlay: PlayByPlay,
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

  get time(): number {
    let result:number = 0
    this.data
      .forEach((stack: PlayStack) => {
        stack.forEach((play: Play) => {
          result = Math.max(result, play.time)
        })
      })
    return result
  }

  get lineups(): LineUps {
    const lineups = Object.keys(this.rosters).reduce((result: LineUps, teamId: TeamId) => {
      result[teamId] = []
      return result
    }, {})
    this.data
      .forEach((stack: PlayStack) => {
        if (['subout', 'subin'].includes(stack[0].actionKey)) {
          stack.forEach((play: Play) => {
            const { playerId, actionKey } = play
            const teamId = this.getTeamIdFromPlayerId(playerId)
            if (actionKey === 'subin') {
              lineups[teamId].push(playerId)
            } else if (actionKey === 'subout') {
              const idx = lineups[teamId].findIndex((pId: PlayerId) => pId === playerId)
              idx > -1 && lineups[teamId].splice(idx, 1, subinId)
            }
          })
        }
      })
    return lineups
  }

  get boxScore(): GameDocBoxScore {
    const boxscores = this.data.reduce((boxscores: GameDocBoxScore, stack: PlayStack) => {
      stack.forEach((play: Play) => {
        const { playerId, actionKey } = play
        if (!['subout', 'subin'].includes(actionKey)) {
          const statKey = actionKey as PlayerStatKey
          boxscores[playerId] = boxscores[playerId] || {}
          boxscores[playerId][statKey] = boxscores[playerId][statKey] || 0
          boxscores[playerId][statKey] += 1
          if (statKey === 'blk') {
            boxscores[stack[0].playerId].blka = boxscores[stack[0].playerId].blka || 0
            boxscores[stack[0].playerId].blka += 1
          }
        }
      })
      return boxscores
    }, {})
    // min
    const subs = this.data.reduce((subs: { [key: PlayerId]: number[] }, stack: PlayStack) => {
      if (['subout', 'subin'].includes(stack[0].actionKey)) {
        stack.forEach((play: Play) => {
          const { playerId, time } = play
          subs[playerId] = subs[playerId] || []
          subs[playerId].push(time)
        })
      }
      return subs
    }, {})
    const lastTimeStamp = this.data[this.data.length - 1][0].time
    Object.keys(subs).forEach((playerId: PlayerId) => {
      const subsList = subs[playerId]
      if (subsList.length % 2 === 0) subsList.push(lastTimeStamp)
      const playerTime = subsList
        .flatMap((_: any, idx: number, arr: []) => (idx % 2 ? [] : [arr.slice(idx, idx + 2)]))
        .reduce(
          (time: number, arr: number[]) => (time += differenceInMilliseconds(arr[0], arr[1])),
          0
        )
      boxscores[playerId].time = playerTime
    })
    return boxscores
  }

  get scores(): GameDocScores {
    const emptyValue = Object.keys(this.rosters).reduce((result: GameDocScores, teamId: TeamId) => {
      result[teamId] = []
      return result
    }, {})
    return this.data.reduce((score: GameDocScores, stack: PlayStack) => {
      stack
        .forEach((play: Play) => {
          if (['ftm', 'fgm', 'fg3m'].includes(play.actionKey)) {
              const { playerId, actionKey, time } = play
              const periodIdx = this.getPeriodIdxFromTime(time)
              const teamId = this.getTeamIdFromPlayerId(playerId)
              score[teamId][periodIdx] = score[teamId][periodIdx] || 0
              score[teamId][periodIdx] += actionKey === 'fg3m' ? 3 : actionKey === 'fgm' ? 2 : 1
            
          }
        })
      return score
    }, emptyValue)
  }

  getPeriodIdxFromTime = (time: number): number => {
    const { gameLength, nbPeriods, oTLength } = this.config
    return time <= gameLength
      ? Math.floor(time / (gameLength / nbPeriods))
      : nbPeriods + Math.floor((time - gameLength) / oTLength)
  }
  getTeamIdFromPlayerId = (playerId: PlayerId): TeamId => {
    return Object.keys(this.rosters).find((teamId: TeamId) =>
      Object.keys(this.rosters[teamId]).includes(playerId)
    ) as TeamId
  }
}
