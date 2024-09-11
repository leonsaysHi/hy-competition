import type { AwardItem, PlayerCalculatedStats } from './stats'
import type { CompetitionPlayer, PlayerDoc, PlayerId } from './players'
import type { TeamId } from './teams'

export type GameId = string

export type RosterPlayer = CompetitionPlayer & PlayerDoc
export interface Roster {
  [key: PlayerId]: RosterPlayer
}
export interface Rosters {
  [key: TeamId]: Roster
}

// GameDoc
export type GameDocBoxScore = { [key: PlayerId]: PlayerCalculatedStats }
export type GameDocScores = { [key: TeamId]: number[] }

export interface GameDoc {
  id?: GameId
  datetime: string
  teams: TeamId[]
  scores: GameDocScores
  boxscore: GameDocBoxScore
  awards: AwardItem[]
  isFinished: boolean
  isLive: boolean
}
export interface Game extends GameDoc {
  id: GameId
}
