import type { CompetitionPlayer, CompetitionPlayerDoc, PlayerId } from './players'

export type TeamId = string
export type TeamRoster = PlayerId[]

// data
export interface TeamDoc {
  title: string
  logo?: string
}
export interface Team extends TeamDoc {
  id: TeamId
}

//data
export interface CompetitionTeamDoc {
  sponsor: string
  players: { [key: PlayerId]: CompetitionPlayerDoc } // collection
}
// front
export interface CompetitionTeam {
  id: TeamId
  sponsor: string
  players: CompetitionPlayer[]
}
