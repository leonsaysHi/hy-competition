import type { Awards, Stats } from './stats'
import type { TeamId, CompetitionTeamDoc, CompetitionTeamComputed, CompetitionTeam } from './teams'
import type { CompetitionPlayerComputed } from './players'
import type { GameId, GameDoc, Game } from './games'
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
export interface CompetitionDoc {
  title: string
  date: string
  sport: CompetitionSport
  category: CompetitionCategorie
  gender: CompetitionGender
  awards: Awards[]
  isActive: boolean
}

export interface Competition extends CompetitionDoc {
  id: CompetitionId
  teams?: CompetitionTeam[] // collection
  games?: Game[] // collection
}

// computed data
export interface CompetitionTeamStandComputed extends Stats {
  gp: number
  wins: number
  pos: number
  last3: boolean | null[]
}
