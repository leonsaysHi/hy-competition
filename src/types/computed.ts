import type GameComputedClass from '@/models/GameComputed'
import type { Bracket, CompetitionId, PhaseType } from './competitions'
import type { PlayerId } from './player'
import type { PlayerCalculatedStats, PlayerGamesStats } from './player-stats'
import type { TeamId } from './team'
import type { TeamStandingStats } from './team-stats'

export interface CompetitionGroupComputed {
  title: string
  games: GameComputedClass[]
  standing: CompetitionStanding[]
  stats: CompetitionPlayerStats[]
  bracket?: Bracket
}
export interface CompetitionPhaseComputed {
  title: string
  type: PhaseType
  groups: CompetitionGroupComputed[]
}
// Teams standinds
export interface CompetitionStanding extends TeamStandingStats {
  teamId: TeamId
  pos?: number
  playin?: 'pass' | 'elim'
  playoff?: number // 1: winner, 2: final, 4: semi, 8: quarter ...
}
export interface CompetitionStandingComputed extends CompetitionStanding {
  // to save as computed
  id: CompetitionId
}
// BoxScore
export type GameBoxScoreComputed = { [key: PlayerId]: PlayerCalculatedStats }

export interface CompetitionPlayerStats extends PlayerGamesStats {
  datetime?: string
  isWin?: boolean
  playerId: PlayerId
  teamId: TeamId
  number: string
}

// 
export interface CompetitionPlayerCalculatedStats extends CompetitionPlayerStats, PlayerCalculatedStats {}

// Players rankings
export interface CompetitionPlayerComputed extends CompetitionPlayerStats {
  // to save as computed
  id: CompetitionId
}
