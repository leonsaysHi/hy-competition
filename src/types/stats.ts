import type { PlayerId } from './players'

export type Award = 'mvp' | 'def'
export interface Awards {
  [key: PlayerId]: Award
}
;[]

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