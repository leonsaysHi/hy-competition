import type { GameId, Game } from './games'
import type { CompetitionTeamComputed, CompetitionTeamRankComputed } from './competitions'
import type { PlayerId } from './players'

export type TeamId = string
export type TeamRoster = PlayerId[]

// data
export interface TeamDoc {
  title: string
  logo?: string
}
export interface Team extends TeamDoc {
  id: string
}

// computed data
export interface TeamCompetition extends CompetitionTeamComputed {
  stand: CompetitionTeamRankComputed
}
export interface TeamComputed extends Team {
  games: { [key: GameId]: Game } // on game update
  competitions: TeamCompetition[] // on competition update
}
