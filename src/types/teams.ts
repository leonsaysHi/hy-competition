import type { PlayerId } from './players'

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
  roster: PlayerId[]
}
// front
export interface CompetitionTeam extends CompetitionTeamDoc {
  id: TeamId
}

// computed data
export interface CompetitionTeamComputed {
  id: TeamId
  sponsor: string
  team: Team
  gp: number
  wins: number
  pos: number
  last3: boolean[]
}