import type { PlayerId } from './players'

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

export interface PlayerBoxScore extends Stats {
  dnp: boolean
}
export type PlayerBoxScoreKey = keyof PlayerBoxScore
