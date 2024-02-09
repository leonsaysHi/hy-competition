import type { Awards } from './stats'
import type { PlayerId, PlayerBoxScore } from './players'
import type { CompetitionId } from './competitions'
import type { TeamId } from './teams'

export type GameId = string

// data
export type GamePeriodScore = { [key: TeamId]: number }[]
export interface Game {
  id: string
  competitionId: CompetitionId
  date: string
  teams: TeamId[]
  scores?: GamePeriodScore[]
  boxscore: { [key: PlayerId]: PlayerBoxScore }
  awards: Awards[]
}
