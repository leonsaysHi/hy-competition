import type { AwardItem } from './stats'
import type { CompetitionTeam, TeamId } from './teams'
import type { Game } from './games'
import type { GenderKey } from './players'
export type CompetitionId = string
export type CompetitionSport = 'basketball5x5' | 'basketball3x3'
export type CompetitionCategorie = 'u17' | 'u21' | 'senior' | '+35'

export type PhaseType = 'groups' | 'playins' | 'playoffs' | undefined
export type StatsInputType = 'sheet' | 'play-by-play' | undefined
export interface Phase {
  type: PhaseType
  groups: TeamId[][]
  datetime: Date
}

export interface CompetitionConfig {
  gameLength: number
  nbPeriods: number
  otLength: number
  lineupLength: number
}
// data
export interface CompetitionDoc {
  id?: CompetitionId
  title: string
  date: string
  sport: CompetitionSport
  category: CompetitionCategorie
  gender: GenderKey
  awards: AwardItem[]
  isActive: boolean
  isOver: boolean
  phases: Phase[]
  statsInput: StatsInputType
  lastUpdate: Date
}

export interface Competition extends CompetitionDoc {
  id: CompetitionId
  teams: CompetitionTeam[] // collection
  games: Game[] // collection
}
