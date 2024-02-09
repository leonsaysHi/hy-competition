import type { Stats, Award } from './stats'
import type { GameId } from './games'
import type { CompetitionId } from './competitions'

export type PlayerId = string

// data
export interface Player {
  id: string
  fname: string
  lname: string
  birthdate: string
}

// computed data
export interface PlayerBoxScore extends Stats {
  dnp: boolean
}
export interface PlayerAdverages extends Stats {
  gp: number
}
export interface PlayerAwards {
  games: { [key: GameId]: Award }[]
  competitions: { [key: CompetitionId]: Award }[]
}

export interface PlayerComputed extends Player {
  games: { [key: GameId]: PlayerBoxScore } // on game update
  avg: PlayerAdverages // on game update
  awards: PlayerAwards // on game/competition update
}
