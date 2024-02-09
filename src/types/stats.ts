import type { PlayerId } from './players'

export type Award = 'mvp' | 'def'
export interface Awards {
  [key: PlayerId]: Award
}
;[]

export interface Stats {
  pts: number
  rbd: number
  ast: number
  stl: number
  blk: number
  to: number
  pf: number
  m3pts: number
}
