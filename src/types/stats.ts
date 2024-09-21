import type { CompetitionId } from './competitions'
import type { GameId } from './games'
import type { PlayerId } from './players'

export type StatsGroupValue = 'dnp' | 'fga' | 'oreb' | 'tov' | 'blka' | 'f'
export interface StatsGroupDef {
  keys: PlayerStatLineKey[]
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
export interface PlayerStatLine {
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
  dnp: number
}
export type PlayerStatLineKey = keyof PlayerStatLine

// Player Stats Game Computed (calculated pts, reb, perc)
export interface PlayerGamesStats extends PlayerStatLine {
  gp: number
}
export type PlayerGamesStatsKey = keyof PlayerGamesStats

export interface PlayerCalculatedStats extends PlayerGamesStats {
  pts: number
  reb: number
  ftprc: number
  fgprc: number
  fg3prc: number
}
export type PlayerCalculatedStatsKey = keyof PlayerCalculatedStats


// Players Competition Ranking Table
export interface PlayerRankingStats extends PlayerGamesStats {
  awards?: AwardItem[]
}

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
