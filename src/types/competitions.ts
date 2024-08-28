import type { AwardItem, PlayerTrackedStatKey } from './stats'
import type { CompetitionTeam, TeamId } from './teams'
import type { Game } from './games'
import type { GenderKey } from './players'
import type GameComputedClass from '@/models/GameComputed'
export type CompetitionId = string
export type CompetitionSport = 'basketball5x5' | 'basketball3x3'
export type CompetitionCategorie = 'u17' | 'u21' | 'senior' | '+35'

export type PhaseType = 'groups' | 'playins' | 'playoffs' | undefined
export type StatsInputType = 'sheet' | undefined
export type PhaseGroup = {
  title: string
  teams: TeamId[]
}
export interface Phase {
  title: string
  type: PhaseType
  groups: PhaseGroup[]
  datetime: Date
}
export interface BracketMatchup {
  game?: GameComputedClass
  roundIdx: number
  roundGameIdx: number
  isFinal: boolean
  winnersFrom: BracketMatchup[] | undefined
  matchupId: number
  matchupStyleObj?: { [key: string]: string }
  vrStyleObj?: { [key: string]: string }
}
export type BracketRound = BracketMatchup[]
export type Bracket = BracketRound[]

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
  trackedStats: PlayerTrackedStatKey[]
  lastUpdate: Date
}

export interface Competition extends CompetitionDoc {
  id: CompetitionId
  teams: CompetitionTeam[] // collection
  games: Game[] // collection
}
