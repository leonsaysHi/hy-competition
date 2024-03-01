import type { CompetitionPlayer, PlayerId } from './players'

export type TeamId = string
export type TeamRoster = PlayerId[]

// data
export interface TeamDoc {
  id?: TeamId
  title: string
  short: string
  logo: string
  color: string
}
export interface Team extends TeamDoc {
  id: TeamId
}

//data
export interface CompetitionTeamDoc {
  id?: TeamId
  sponsor: string
}
// front
export interface CompetitionTeam {
  id: TeamId
  sponsor: string
  players: CompetitionPlayer[]
}
