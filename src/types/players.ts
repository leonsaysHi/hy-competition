import type { Stats, Award } from './stats'
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
export interface PlayerBoxScore extends Stats {
  dnp: boolean
}
export interface PlayerAdverages extends Stats {
  gp: number
}
export interface PlayerAwards {
  games: { [key: GameId]: Award }
  competitions: { [key: CompetitionId]: Award }
}
export interface CompetitionPlayerDoc {
  number: string
}
export interface CompetitionPlayer extends CompetitionPlayerDoc {
  id: PlayerId
}
// computed
export interface CompetitionPlayerComputed extends Player {
  avg: PlayerAdverages // on game update
  awards: PlayerAwards // on game/competition update
}
