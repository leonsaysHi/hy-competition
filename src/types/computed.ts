import type GameComputedClass from '@/models/GameComputed'
import type { Bracket, CompetitionId, PhaseType } from './competitions'
import type { PlayerId } from './players'
import type { PlayerBoxScore, PlayerRankingStats, TeamStandingStats } from './stats'
import type { TeamId } from './teams'

export interface CompetitionGroupComputed {
  games: GameComputedClass[]
  standing: CompetitionStanding[]
  ranking: CompetitionRanking[]
}
export interface CompetitionPhaseComputed {
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
export type GameBoxScoreComputed = { [key: PlayerId]: PlayerBoxScore }

// Players rankings
export interface CompetitionRanking extends PlayerRankingStats {
  playerId: PlayerId
  teamId: TeamId
  id?: CompetitionId
  number: string
}
export interface CompetitionRankingComputed extends CompetitionRanking {
  // to save as computed
  id: CompetitionId
}
