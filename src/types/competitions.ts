import type { AwardItem, StatKey } from './stats'
import type { CompetitionTeam, Team, TeamId } from './teams'
import type { Game } from './games'
import type { PlayerAdverages, PlayerAwards, PlayerId } from './players'
export type CompetitionId = string
export type CompetitionSport = 'basketball5x5' | 'basketball3x3'
export type CompetitionCategorie = 'u17' | 'u21' | 'senior' | '+35'

export type CompetitionGender = 'm' | 'f'
export type PhaseType = 'groups' | 'playins' | 'playoffs' | undefined
export interface Phase {
  type: PhaseType
  groups: TeamId[][]
  datetime: Date
}
// data
export interface CompetitionDoc {
  id?: CompetitionId
  title: string
  date: string
  sport: CompetitionSport
  category: CompetitionCategorie
  gender: CompetitionGender
  awards: AwardItem[]
  isActive: boolean
  isOver: boolean
  phases: Phase[]
  trackedStats: StatKey[]
  lastUpdate: string
}

export interface Competition extends CompetitionDoc {
  id: CompetitionId
  teams?: CompetitionTeam[] // collection
  games?: Game[] // collection
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
export interface CompetitionPlayerComputed {
  id: PlayerId
  avg: PlayerAdverages // on game update
  awards: PlayerAwards // on game/competition update
}
