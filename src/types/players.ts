export type PlayerId = string
export type Gender = 'm' | 'f'

// data
export interface Player {
  id: PlayerId
  fname: string
  lname: string
  gender: Gender
  identification: string
  dob: string
}

// computed data
export interface CompetitionPlayer {
  id: PlayerId
  number: string
}
