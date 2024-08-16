import type { CompetitionId } from './competitions'
import type { GameId } from './games'
import type { PlayerId } from './players'

export type StatsGroupValue = 'dnp' | 'fga' | 'oreb' | 'tov' | 'blka' | 'f'
export interface StatsGroupDef {
  keys: PlayerTrackedStatKey[]
  value?: StatsGroupValue
  text?: string
}

// Player
export type AwardKey = 'mvp' | 'def'
export interface AwardItem {
  gameId?: GameId
  competitionId?: CompetitionId
  id: PlayerId
  value: AwardKey
}

// Player Stats
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

// Player Tracked stats
export interface PlayerTrackedStats extends PlayerStats {
  dnp: number
}
export type PlayerTrackedStatKey = keyof PlayerTrackedStats

// Player Status Input Sheet
export interface PlayerStatSheet extends PlayerStats {
  dnp: boolean
}
export type PlayerStatSheetKey = keyof PlayerStatSheet

// Player Stats Game Computed (calculated pts, reb, perc)
export interface PlayerBoxScore extends PlayerTrackedStats {
  pts: number
  reb: number
  ftprc: number
  fgprc: number
  fg3prc: number
  awards: AwardItem[]
}


// Players Competition Ranking Table
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
