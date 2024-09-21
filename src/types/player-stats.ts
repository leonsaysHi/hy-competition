import type { CompetitionId } from './competitions'
import type { GameId } from './games'
import type { PlayerId } from './player'

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

// Player single stat Line
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

// Player merged stat lines
export interface PlayerGamesStats extends PlayerStatLine {
  gp: number
}
export type PlayerGamesStatsKey = keyof PlayerGamesStats

// Player calculated stat line
export interface PlayerCalculatedStats extends PlayerGamesStats {
  pts: number
  reb: number
  ftprc: number
  fgprc: number
  fg3prc: number
}
export type PlayerCalculatedStatsKey = keyof PlayerCalculatedStats
