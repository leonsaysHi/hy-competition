import type { PlayerId } from './players'
import type { PlayerStatKey } from './stats'
import type { TeamId } from './teams'

export type GetPlayerKey =
  | 'team' // roster
  | 'teammate' // roster but player
  | 'opp' // opponent roster
export interface PlayMapItem {
  playKey: PlayerStatKey
  from?: PlayerStatKey[]
  getPlayer?: GetPlayerKey
  force?: boolean // force next action selection
}

export type PlayKey = PlayerStatKey
export interface Play {
  playerId: PlayerId
  playKey: PlayerStatKey
}

export interface PlayersOptions {
  value: PlayerId
  text: string
  number: string
  disabled: boolean
}
export type PlayOptions = { [key: TeamId]: PlayOption[] }
export interface PlayOption {
  value: PlayerStatKey
  text: string
  disabled?: boolean
  variant?: 'success' | 'warning' | 'danger'
}

export interface SelectComponent {
  key: 'playKey' | 'playerId'
  onSelect: (payload?: any) => void
  onCancel: (reason?: any) => void
  onSubmit?: () => void
  hideSubmit?: boolean
  hideCancel?: boolean
}
export interface SelectPlayKey extends SelectComponent {
  options: PlayOptions
}
export interface SelectPlayerId extends SelectComponent {
  teamId: TeamId
  options: PlayersOptions[]
}
