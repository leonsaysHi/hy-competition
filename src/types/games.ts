import type { Awards } from './stats'
import type { PlayerId, PlayerBoxScore } from './players'
import type { TeamId } from './teams'

export type GameId = string

// data
export type GamePeriodScore = { [key: TeamId]: number }[]
export interface GameDoc {
  date: string
  teams: TeamId[]
  scores?: GamePeriodScore[]
  boxscore: { [key: PlayerId]: PlayerBoxScore }
  awards: Awards[]
}
// front
export interface Game extends GameDoc {
  id: GameId
}

