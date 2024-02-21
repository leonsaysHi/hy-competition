import type { Stats, AwardItem } from './stats'
import type { GameId } from './games'
import type { CompetitionId } from './competitions'

export type PlayerId = string

// data
export interface Player {
  id: PlayerId
  fname: string
  lname: string
  identification: string
  dob: string
}

// computed data
export interface CompetitionPlayer {
  id: PlayerId
  number: string
}
// computed
export interface PlayerAdverages extends Stats {
  gp: number
}
export interface PlayerAwards {
  games: { [key: GameId]: AwardItem[] }
  competitions: { [key: CompetitionId]: AwardItem[] }
}
