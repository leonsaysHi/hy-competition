import type { CompetitionId } from './competitions'
import type { GameId } from './games'
import type { PlayerId } from './players'

// Player
export type AwardKey = 'mvp' | 'def'
export interface AwardItem {
  gameId?: GameId
  competitionId?: CompetitionId
  id: PlayerId
  value: AwardKey
}

export interface PlayerStats {
  ftm: number
  fta: number
  fgm: number
  fga: number
  fg3m: number
  fg3a: number
  dreb: number
  oreb: number
  ast: number
  stl: number
  blk: number
  blka: number
  tov: number
  fcm: number
  fdr: number
}
export type PlayerStatKey = keyof PlayerStats

export interface PlayerBoxScore extends PlayerStats {
  dnp: boolean
  pts: number
  reb: number
  ftprc: number
  fgprc: number
  fg3prc: number
  pir: number
  awards: AwardItem[]
}

export interface PlayerRankingStats extends PlayerBoxScore {
  gp: number
}
export type PlayerRankingKey = keyof PlayerRankingStats

// Team
export interface TeamStats {
  gp: number
  wins: number
  ptsfv: number
  ptsag: number
}
export type TeamStatKey = keyof TeamStats

export type GamesHist = (1 | -1 | 0)[]
export interface TeamStandingStats extends TeamStats {
  hist: GamesHist
}
