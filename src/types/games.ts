import type { AwardItem, PlayerStatLine } from './player-stats'
import type { CompetitionPlayer, PlayerDoc, PlayerId } from './player'
import type { TeamId } from './team'

export type GameId = string

export type RosterPlayer = CompetitionPlayer & PlayerDoc
export interface Roster {
  [key: PlayerId]: RosterPlayer
}
export interface Rosters {
  [key: TeamId]: Roster
}

// GameDoc
export type GameDocBoxScore = { [key: PlayerId]: PlayerStatLine }
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
