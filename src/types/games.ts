import type { AwardItem, PlayerStats } from './stats'
import type { PlayerId } from './players'
import type { TeamId } from './teams'

export type GameId = string

export interface PlayerBoxScore extends PlayerStats {
  dnp: boolean
}
export type PlayerBoxScoreKey = keyof PlayerBoxScore
export type GameBoxScore = { [key: PlayerId]: PlayerBoxScore }
export type GameScores = { [key: TeamId]: number[] }

export interface Game {
  id?: GameId
  datetime: string
  teams: TeamId[]
  scores: GameScores
  boxscore: GameBoxScore
  awards: AwardItem[]
  isFinished: boolean
}
