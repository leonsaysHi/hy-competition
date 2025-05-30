export type PlayerId = string
export type GenderKey = 'm' | 'f'

// data
export interface PlayerDoc {
  id?: PlayerId
  fname: string
  lname: string
  gender: GenderKey
  identification: string
  dob: string
}
// data
export interface Player {
  id: PlayerId
}

// computed data
export interface CompetitionPlayerDoc {
  id?: PlayerId
  number: string
}
export interface CompetitionPlayer extends CompetitionPlayerDoc {
  id: PlayerId
}
