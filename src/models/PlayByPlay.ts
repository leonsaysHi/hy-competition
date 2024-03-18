import type { Play, PlayByPlay, PlayStack, Rosters } from '@/play-by-play/GameInput.vue'
import type { CompetitionConfig } from '@/types/competitions'
import type { GameDocBoxScore, GameDocScores, GameId } from '@/types/games'
import type { PlayerId } from '@/types/players'
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

  get boxScore(): GameDocBoxScore {
    const boxscores = this.data.reduce((boxscores: GameDocBoxScore, stack: PlayStack) => {
      stack.forEach((play: Play) => {
        const { playerId, actionKey } = play
        if (!['subout', 'subin'].includes(actionKey)) {
          const statKey = actionKey as PlayerStatKey
          boxscores[playerId] = boxscores[playerId] || {}
          boxscores[playerId][statKey] = boxscores[playerId][statKey] || 0
          boxscores[playerId][statKey] += 1
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
    return this.data.reduce((score: GameDocScores, stack: PlayStack) => {
      const idx = stack.findIndex((play: Play) => ['ftm', 'fgm', 'fg3m'].includes(play.actionKey))
      if (idx > -1) {
        const { playerId, actionKey, time } = stack[idx]
        const periodIdx = this.getPeriodIdxFromTime(time)
        const teamId = this.getTeamIdFromPlayerId(playerId)
        score[teamId] = score[teamId] || []
        score[teamId][periodIdx] = score[teamId][periodIdx] || 0
        score[teamId][periodIdx] += actionKey === 'fg3m' ? 1 : actionKey === 'fgm' ? 2 : 1
      }
      return score
    }, {})
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
