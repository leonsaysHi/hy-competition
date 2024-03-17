<script lang="ts" setup>
import SelectAction from '@/play-by-play/components/actions/SelectAction.vue'
import SelectPlayer from '@/play-by-play/components/actions/SelectPlayer.vue'
import ActionsDisplay from '@/play-by-play/components/ActionsDisplay.vue'
import { computed, ref, onMounted } from 'vue'
import type { Component } from 'vue'
import type {
  LineUpItem,
  LineUps,
  Play,
  PlayByPlay,
  PlayKey,
  RosterPlayer,
  Rosters
} from '../GameInput.vue'
import type { PlayerId } from '@/types/players'
import type { TeamId } from '@/types/teams'

import { useI18n } from 'vue-i18n'
const { t } = useI18n()

interface ActionMapItem {
  actionKey: PlayKey
  from?: PlayKey[]
  getPlayer?: 'team' | 'opp' | 'roster'
  timeOffset?: number
  force?: boolean // force next action selection
}
interface IProps {
  modelValue: PlayByPlay
  time: number
  lineups: LineUps
  rosters: Rosters
  disabled?: boolean
}

export interface PlayersOptions {
  value: PlayerId
  text: string
  row: RosterPlayer
  disabled: boolean
}
export type ActionsOptions = { [key: TeamId]: ActionsOptionItem[] }
export interface ActionsOptionItem {
  value: PlayKey
  text: string
}

interface SelectComponent {
  is: Component
  options: ActionsOptions | PlayersOptions[]
  onSelect: (payload?: any) => void
  onCancel: (reason?: any) => void
  onSubmit?: () => void
  hideSubmit?: boolean
  hideCancel?: boolean
}

const props = withDefaults(defineProps<IProps>(), {
  disabled: false
})

const getTeamIdFromPlayerId = (playerId: PlayerId): TeamId => {
  return Object.keys(props.lineups).find((teamId: TeamId) =>
    props.lineups[teamId].includes(playerId)
  ) as TeamId
}

const emit = defineEmits(['update:modelValue'])
const model = computed({
  get: (): PlayByPlay => props.modelValue,
  set: (val: PlayByPlay) => emit('update:modelValue', val)
})
const actionsMap: ActionMapItem[] = [
  { actionKey: 'fga' },
  { actionKey: 'fgm', from: ['fga'] },
  { actionKey: 'fg3a' },
  { actionKey: 'oreb', getPlayer: 'team', from: ['fta', 'fga', 'fg3a'], timeOffset: 1 },
  { actionKey: 'dreb', getPlayer: 'opp', from: ['fta', 'fga', 'fg3a'], timeOffset: 1 },
  { actionKey: 'blk', getPlayer: 'opp', from: ['fga', 'fg3a'], timeOffset: 1 },
  { actionKey: 'fg3m', from: ['fg3a'] },
  { actionKey: 'ast', getPlayer: 'team', from: ['fgm', 'fg3m'] },

  { actionKey: 'fcm' },
  { actionKey: 'fdr', getPlayer: 'opp', from: ['fcm'] },
  { actionKey: 'fta', from: ['fdr'] },
  { actionKey: 'ftm', from: ['fta'] },

  { actionKey: 'tov' },
  { actionKey: 'stl', getPlayer: 'opp', from: ['tov'] },

  { actionKey: 'subout', force: true },
  { actionKey: 'subin', getPlayer: 'roster', from: ['subout'] }
]
const actionsStack = ref<Play[]>([])
const selectComponent = ref<SelectComponent>()

const prevAction = computed<Play | undefined>(() =>
  actionsStack.value.length > 0 ? actionsStack.value[actionsStack.value.length - 1] : undefined
)
const endAction = () => {
  const plays = actionsStack.value.splice(0, actionsStack.value.length)
  selectComponent.value = undefined
  model.value.push(plays)
  pushAction()
}
const pushAction = async () => {
  try {
    const time = props.time
    const selection = await selectActionKey()
    const { teamId, actionKey } = selection
    const action: ActionMapItem = actionsMap.find(
      (action) => action.actionKey === actionKey
    ) as ActionMapItem
    try {
      const playerId: PlayerId =
        prevAction.value?.playerId && !action.getPlayer
          ? prevAction.value.playerId
          : await selectPlayer(teamId)
      const playObj: Play = {
        actionKey,
        time: time + (action.timeOffset ? action.timeOffset * 750 : 0),
        playerId
      }
      actionsStack.value.push(playObj)
      if (getActionsOptions(actionKey)) {
        pushAction()
      } else {
        endAction()
      }
    } catch (val) {
      console.log('Canceled Player', val)
      handleRemovelAction()
    }
  } catch (val) {
    if (val === 'submit') {
      endAction()
    } else {
      console.log('Canceled Action', val)
      handleRemovelAction()
    }
  }
}
const handleRemovelAction = (idx: number | undefined) => {
  const startIdx = typeof idx === 'number' ? idx : actionsStack.value.length - 1
  actionsStack.value.splice(startIdx, actionsStack.value.length)
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
  const options = Object.keys(props.lineups).reduce((result: ActionsOptions, tId: TeamId) => {
    result[tId] = actionsMap
      .filter((action) => {
        if (!fromKey) {
          return !action.from
        }
        return (
          action.from?.includes(fromKey) &&
          ((tId === teamId && (!action.getPlayer || action.getPlayer === 'team')) ||
            (tId !== teamId && action.getPlayer === 'opp'))
        )
      })
      .map((act) => ({
        value: act.actionKey,
        text: t(`options.playerStats.text.${act.actionKey}`)
      }))
    return result
  }, {})
  return Object.keys(options).some((teamId: TeamId) => options[teamId].length) ? options : undefined
}
const selectActionKey = (): Promise<{ actionKey: PlayKey; teamId?: TeamId }> => {
  const hideCancel = !actionsStack.value.length
  const hideSubmit =
    hideCancel ||
    actionsMap.find((action: ActionMapItem) => action.actionKey === prevAction.value?.actionKey)
      ?.force
  return new Promise((res, rej) => {
    selectComponent.value = {
      is: SelectAction,
      options: getActionsOptions(prevAction.value?.actionKey) as ActionsOptions,
      hideSubmit,
      hideCancel,
      onSelect: res,
      onCancel: rej
    }
  })
}
const getPlayersOption = (
  teamId: TeamId,
  excludeId: PlayerId | undefined = undefined
): PlayersOptions[] =>
  props.lineups[teamId].map((playerId: LineUpItem) => {
    return {
      value: playerId as PlayerId,
      text: `${props.rosters[teamId][playerId].fname} ${props.rosters[teamId][playerId].lname}`,
      row: props.rosters[teamId][playerId],
      disabled: !excludeId && playerId === excludeId
    }
  })
const selectPlayer = (
  teamId: TeamId,
  excludeId: PlayerId | undefined = undefined
): Promise<PlayerId> => {
  return new Promise((res, rej) => {
    selectComponent.value = {
      is: SelectPlayer,
      options: getPlayersOption(teamId, excludeId),
      hideSubmit: true,
      hideCancel: false,
      onSelect: res,
      onCancel: rej
    }
  })
}

const currentAction = computed(() => [actionsStack.value])
</script>
<template>
  <ActionsDisplay
    :items="currentAction"
    :rosters="rosters"
    show-remove
    @remove="handleRemovelAction"
  />
  <div class="vstack gap-3">
    <template v-if="selectComponent">
      <component
        :is="{ ...selectComponent.is }"
        :lineups="lineups"
        :options="selectComponent.options"
        :hide-submit="selectComponent.hideSubmit"
        :hide-cancel="selectComponent.hideCancel"
        @resolve="selectComponent.onSelect"
        @reject="selectComponent.onCancel"
      />
    </template>
  </div>
</template>
