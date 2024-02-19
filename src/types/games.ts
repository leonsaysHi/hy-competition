import type { AwardItem, PlayerBoxScore } from './stats'
import type { PlayerId } from './players'
import type { TeamId } from './teams'

export type GameId = string

export type GameBoxScore = { [key: PlayerId]: PlayerBoxScore }
export type GameScores = { [key: TeamId]: number[] }

export interface GameDoc {
  datetime: string
  teams: TeamId[]
  scores: GameScores
  boxscore: GameBoxScore
  awards: AwardItem[]
}

export interface Game extends GameDoc {
  id: GameId
}
