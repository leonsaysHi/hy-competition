import type { PlayerId } from './players'

export type Award = 'mvp' | 'def'
export interface AwardItem {
  id: PlayerId
  value: Award
}

export type StatKey = 'pts' | 'reb' | 'ast' | 'stl' | 'blk' | 'to' | 'pf' | 'm3pts' | 'mvp'
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

export interface PlayerBoxScore extends Stats {
  dnp: boolean
}
