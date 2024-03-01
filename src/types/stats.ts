import type { PlayerId } from './players'

// Player
export type Award = 'mvp' | 'def'
export interface AwardItem {
  id: PlayerId
  value: Award
}

export interface Stats {
  pts: number
  reb: number
  ast: number
  stl: number
  blk: number
  to: number
  pf: number
  m3pts: number
}
export type StatKey = keyof Stats

export interface PlayerRankingStats extends Stats {
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
  hist: (1 | -1 | 0)[]
}
export type TeamStandingKey = keyof TeamStats
