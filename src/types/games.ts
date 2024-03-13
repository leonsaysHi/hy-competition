import type { AwardItem, PlayerStats } from './stats'
import type { PlayerId } from './players'
import type { TeamId } from './teams'

export type GameId = string

// GameDoc
export type GameDocBoxScore = { [key: PlayerId]: PlayerStats & { dnp: boolean } }
export type GameDocScores = { [key: TeamId]: number[] }

export interface GameDoc {
  id?: GameId
  datetime: string
  teams: TeamId[]
  scores: GameDocScores
  boxscore: GameDocBoxScore
  awards: AwardItem[]
  isFinished: boolean
}
export interface Game extends GameDoc {
  id: GameId
}
