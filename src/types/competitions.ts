import type { Awards, Stats } from './stats'
import type { TeamId, Team } from './teams'
import type { PlayerId, Player } from './players'
import type { GameId, Game } from './games'
export type CompetitionId = string
export type CompetitionSport = 'basketball'
export type CompetitionCategorie =
  | 'U6'
  | 'U8'
  | 'U9'
  | 'U10'
  | 'U11'
  | 'U12'
  | 'U13'
  | 'U14'
  | 'U15'
  | 'U16'
  | 'U17'
  | 'U18'
  | 'Senior'
  | '+30'
  | '+35'
  | '+40'
  | '+45'

export type CompetitionGender = 'm' | 'f' | 'mf'

// data
export interface CompetitionTeam {
  sponsor: string
  roster: PlayerId[]
}
export interface Competition {
  id: string
  title: string
  date: string
  sport: CompetitionSport
  category: CompetitionCategorie
  gender: CompetitionGender
  teams: { [key: TeamId]: CompetitionTeam[] }
  awards: Awards[]
  isActive: boolean
}

// computed data
export interface CompetitionTeamComputed {
  team: Team
  roster: Player[]
}
export interface CompetitionTeamRankComputed extends Stats {
  gp: number
  wins: number
  pos: number
  last3: boolean | null[]
}
export interface CompetitionComputed {
  id: CompetitionId
  name: string
  date: string
  sport: CompetitionSport
  category: CompetitionCategorie
  gender: CompetitionGender
  awards: Awards[]
  teams: { [key: TeamId]: CompetitionTeamComputed[] } // on competition update
  games: { [key: GameId]: Game[] } // on game update
  stand: { [key: TeamId]: CompetitionTeamRankComputed } // on competition/game update
}
