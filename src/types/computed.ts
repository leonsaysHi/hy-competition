import type { CompetitionId, PhaseType } from './competitions'
import type { Game } from './games'
import type { PlayerId } from './players'
import type { PlayerRankingStats, TeamStandingStats } from './stats'
import type { TeamId } from './teams'

export interface CompetitionGroupComputed {
  games: Game[]
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
