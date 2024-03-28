<script lang="ts" setup>
import SelectAction from '@/box-score/components/actions/SelectAction.vue'
import SelectPlayer from '@/box-score/components/actions/SelectPlayer.vue'
import { computed, ref, onMounted } from 'vue'
import type { PlayerId } from '@/types/players'
import type { TeamId } from '@/types/teams'
import type { PlayerStatKey } from '@/types/stats'

import { useI18n } from 'vue-i18n'
import type { Rosters } from '../../box-score-record/GameInput.vue'
const { t } = useI18n()

type GetPlayerKey =
  | 'team' // roster
  | 'teammate' // roster but player
  | 'opp' // opponent roster
interface ActionMapItem {
  actionKey: PlayerStatKey
  from?: PlayerStatKey[]
  getPlayer?: GetPlayerKey
  timeOffset?: number
  force?: boolean // force next action selection
}

export type PlayKey = PlayerStatKey
export interface Play {
  playerId: PlayerId
  actionKey: PlayerStatKey
}

interface IProps {
  rosters: Rosters
  trackedStats: PlayerStatKey[]
}

export interface PlayersOptions {
  value: PlayerId
  text: string
  number: string
  disabled: boolean
}
export type ActionsOptions = { [key: TeamId]: ActionsOptionItem[] }
export interface ActionsOptionItem {
  value: PlayerStatKey
  text: string
  disabled?: boolean
  variant?: 'success' | 'warning' | 'danger'
}

interface SelectComponent {
  key: 'actionKey' | 'playerId'
  onSelect: (payload?: any) => void
  onCancel: (reason?: any) => void
  onSubmit?: () => void
  hideSubmit?: boolean
  hideCancel?: boolean
}
interface SelectActionKey extends SelectComponent {
  options: ActionsOptions
}
interface SelectPlayerId extends SelectComponent {
  teamId: TeamId
  options: PlayersOptions[]
}

const props = withDefaults(defineProps<IProps>(), {
  disabled: false
})

const emit = defineEmits(['add-play-stack'])

const getTeamIdFromPlayerId = (playerId: PlayerId): TeamId => {
  return Object.keys(props.rosters).find(
    (teamId: TeamId) => playerId in props.rosters[teamId]
  ) as TeamId
}

const _actionsMap: ActionMapItem[] = [
  { actionKey: 'fga' },
  { actionKey: 'fgm', from: ['fga'] },
  { actionKey: 'fg3a' },
  { actionKey: 'oreb', getPlayer: 'team', from: ['fta', 'fga', 'fg3a'] },
  { actionKey: 'dreb', getPlayer: 'opp', from: ['fta', 'fga', 'fg3a'] },
  { actionKey: 'blk', getPlayer: 'opp', from: ['fga', 'fg3a'] },
  { actionKey: 'fg3m', from: ['fg3a'] },
  { actionKey: 'ast', getPlayer: 'teammate', from: ['fgm', 'fg3m'] },

  { actionKey: 'fcm' },
  { actionKey: 'fdr', getPlayer: 'opp', from: ['fcm'] },
  { actionKey: 'fta', from: ['fta', 'fdr', 'ftm'] },
  { actionKey: 'ftm', from: ['fta'] },

  { actionKey: 'tov' },
  { actionKey: 'stl', getPlayer: 'opp', from: ['tov'] }
]
const actionsMap = computed(() =>
  _actionsMap
    .filter((item: ActionMapItem) => props.trackedStats.includes(item.actionKey))
    .map((item: ActionMapItem) => ({
      ...item,
      from: item.from?.filter((key: PlayKey) => props.trackedStats.includes(key))
    }))
)

const currentPlayStack = ref<Play[] | undefined>(undefined)
const selectComponent = ref<SelectActionKey | SelectPlayerId | undefined>()

const prevAction = computed<Play | undefined>(() =>
  currentPlayStack.value?.length && currentPlayStack.value?.length > 0
    ? currentPlayStack.value[currentPlayStack.value.length - 1]
    : undefined
)
const endAction = () => {
  if (currentPlayStack.value) {
    emit('add-play-stack', currentPlayStack.value)
    currentPlayStack.value = undefined
    selectComponent.value = undefined
    pushAction()
  }
}
const pushAction = async () => {
  try {
    const selection = await selectActionKey()
    if (!currentPlayStack.value) {
      currentPlayStack.value = []
    }
    const { teamId, actionKey } = selection
    const action: ActionMapItem = actionsMap.value.find(
      (action) => action.actionKey === actionKey
    ) as ActionMapItem
    try {
      const playerId: PlayerId =
        prevAction.value?.playerId && !action.getPlayer
          ? prevAction.value.playerId
          : await selectPlayer(teamId, action)
      const playObj: Play = {
        actionKey,
        playerId
      }
      currentPlayStack.value.push(playObj)
      if (getActionsOptions(actionKey)) {
        pushAction()
      } else {
        endAction()
      }
    } catch (val) {
      console.log('Canceled Player', val)
      pushAction()
    }
  } catch (val) {
    if (val === 'submit') {
      endAction()
    } else {
      console.log('Canceled Action', val)
      handleRemovelAction(undefined)
    }
  }
}
const handleRemovelAction = (idx: number | undefined) => {
  if (!currentPlayStack.value?.length) return
  const startIdx = typeof idx === 'number' ? idx : currentPlayStack.value.length - 1
  currentPlayStack.value.splice(startIdx, currentPlayStack.value.length)
  pushAction()
}
onMounted(() => {
  pushAction()
})

const getActionsOptions = (
  fromKey: PlayKey | undefined = undefined
): ActionsOptions | undefined => {
  const teamId = prevAction.value?.playerId
    ? getTeamIdFromPlayerId(prevAction.value.playerId)
    : undefined
  const options = Object.keys(props.rosters).reduce((result: ActionsOptions, tId: TeamId) => {
    result[tId] = actionsMap.value
      .filter((action) => {
        if (!fromKey) {
          return !action.from?.length
        }
        return (
          action.from?.includes(fromKey) &&
          ((tId === teamId &&
            (!action.getPlayer ||
              action.getPlayer === 'team' ||
              action.getPlayer === 'teammate')) ||
            (tId !== teamId && action.getPlayer === 'opp'))
        )
      })
      .map(
        (act): ActionsOptionItem => ({
          value: act.actionKey,
          text: t(`options.playByPlay.text.${act.actionKey}`),
          variant: ['ftm', 'fgm', 'fg3m'].includes(act.actionKey) ? 'success' : undefined
        })
      )
    return result
  }, {})
  return Object.keys(options).some((teamId: TeamId) => options[teamId].length) ? options : undefined
}

const selectActionKey = (): Promise<{ actionKey: PlayKey; teamId?: TeamId }> => {
  const action = actionsMap.value.find(
    (action: ActionMapItem) => action.actionKey === prevAction.value?.actionKey
  )
  const hideCancel = !currentPlayStack.value || !currentPlayStack.value.length
  const hideSubmit = hideCancel || !!action?.force
  return new Promise((res, rej) => {
    selectComponent.value = {
      key: 'actionKey',
      options: getActionsOptions(prevAction.value?.actionKey) as ActionsOptions,
      hideSubmit,
      hideCancel,
      onSelect: res,
      onCancel: rej
    }
  })
}

const selectPlayer = (teamId: TeamId, playItem: ActionMapItem): Promise<PlayerId> => {
  const { getPlayer } = playItem
  const prevPlayerId: PlayerId = prevAction.value?.playerId as PlayerId
  const options = Object.keys(props.rosters[teamId]).map((playerId: PlayerId) => {
    return {
      value: playerId as PlayerId,
      text: `${props.rosters[teamId][playerId].fname} ${props.rosters[teamId][playerId].lname}`,
      number: props.rosters[teamId][playerId].number,
      disabled: getPlayer === 'teammate' && playerId === prevPlayerId
    }
  })
  return new Promise((res, rej) => {
    selectComponent.value = {
      key: 'playerId',
      options,
      teamId,
      hideSubmit: true,
      hideCancel: false,
      onSelect: res,
      onCancel: rej
    }
  })
}
</script>
<template>
  <div class="vstack gap-3">
    <template v-if="selectComponent && selectComponent.key === 'actionKey'">
      <SelectAction
        :options="selectComponent.options"
        :hide-submit="selectComponent.hideSubmit"
        :hide-cancel="selectComponent.hideCancel"
        @select="selectComponent.onSelect"
        @cancel="selectComponent.onCancel"
      />
    </template>
    <template v-else-if="selectComponent && selectComponent.key === 'playerId'">
      <SelectPlayer
        :team-id="selectComponent.teamId"
        :options="selectComponent.options"
        :hide-submit="selectComponent.hideSubmit"
        :hide-cancel="selectComponent.hideCancel"
        @select="selectComponent.onSelect"
        @cancel="selectComponent.onCancel"
      />
    </template>
  </div>
</template>
