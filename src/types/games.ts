import type { Awards, PlayerBoxScore } from './stats'
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
  awards: Awards[]
}

export interface Game extends GameDoc {
  id: GameId
}
