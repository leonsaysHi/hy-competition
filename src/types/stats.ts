import type { CompetitionId } from './competitions'
import type { GameId } from './games'
import type { PlayerId } from './players'

// Player
export type AwardKey = 'mvp' | 'def'
export interface AwardItem {
  gameId?: GameId
  competitionId?: CompetitionId
  id: PlayerId
  value: Award
}

export interface PlayerStats {
  pts: number
  reb: number
  ast: number
  stl: number
  blk: number
  to: number
  pf: number
  m3pts: number
}
export type PlayerStatKey = keyof PlayerStats

export interface PlayerRankingStats extends PlayerStats {
  gp: number
  awards: AwardItem[]
}
export type PlayerRankingKey = keyof PlayerRankingStats

// Team
export interface TeamStats {
  gp: number
  wins: number
  ptspos: number
  ptsneg: number
}
export type TeamStatKey = keyof TeamStats

export type GamesHist = (1 | -1 | 0)[]
export interface TeamStandingStats extends TeamStats {
  hist: GamesHist
}
