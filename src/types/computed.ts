import type { CompetitionId, PhaseType } from './competitions'
import type { GameId } from './games'
import type { PlayerId } from './players'
import type { PlayerRankingStats, TeamStats } from './stats'
import type { TeamId } from './teams'

// Team
export interface TeamCompetitionPhaseComputed {
  type: PhaseType
  pos?: number
  playin?: 'pass' | 'elim'
  playoff?: 'winner' | number // 'winner', 2: final, 4: semi, 8: quarter ...
}
export interface TeamCompetitionComputed {
  id: CompetitionId
  sponsor: string
  phase: TeamCompetitionPhaseComputed
  stats: TeamStats
}

// Players
export interface PlayerCompetitionComputed extends PlayerRankingStats {
  id: CompetitionId
  teamId: TeamId
}

// Competition
export interface CompetitionStanding extends TeamStats {
  id: TeamId
  pos: number
}
export interface CompetitionRanking extends PlayerRankingStats {
  id: PlayerId
  teamId: TeamId
  number: string
}
export interface CompetitionGroupComputed {
  games: GameId[]
  standing: CompetitionStanding[]
  ranking: CompetitionRanking[]
}
export interface CompetitionPhaseComputed {
  type: PhaseType
  groups: CompetitionGroupComputed[]
}
export interface CompetitionPlayerComputed extends PlayerRankingStats {
  number: string
}
export interface CompetitionComputed {
  id: CompetitionId
  phases: CompetitionPhaseComputed[]
  lastUpdate: Date
}
