import type { Stats, AwardItem } from './stats'
import type { GameId } from './games'
import type { CompetitionId } from './competitions'

export type PlayerId = string

// data
export interface PlayerDoc {
  fname: string
  lname: string
  identification: string
  dob: string
}
export interface Player extends PlayerDoc {
  id: string
}

// computed data
export interface CompetitionPlayerDoc {
  number: string
}
export interface CompetitionPlayer extends CompetitionPlayerDoc {
  id: PlayerId
}
// computed
export interface PlayerAdverages extends Stats {
  gp: number
}
export interface PlayerAwards {
  games: { [key: GameId]: AwardItem[] }
  competitions: { [key: CompetitionId]: AwardItem[] }
}
