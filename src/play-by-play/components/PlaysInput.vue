<script lang="ts" setup>
import SelectAction from '@/play-by-play/components/actions/SelectAction.vue'
import SelectPlayer from '@/play-by-play/components/actions/SelectPlayer.vue'
import ActionsDisplay from '@/play-by-play/components/ActionsDisplay.vue'
import { computed, ref, onMounted } from 'vue'
import type { LineUps, Play, PlayKey, PlayStack } from '../GameInput.vue'
import type { Rosters } from '@/types/games'
import type { PlayerId } from '@/types/players'
import type { TeamId } from '@/types/teams'

import { useI18n } from 'vue-i18n'
const { t } = useI18n()

type GetPlayerKey =
  | 'team' // lineupe
  | 'teammate' // lineup but player
  | 'opp' // opponent lineup
  | 'roster' // roster but lineup
interface ActionMapItem {
  actionKey: PlayKey
  from?: PlayKey[]
  getPlayer?: GetPlayerKey
  timeOffset?: number
  force?: boolean // force next action selection
}
interface IProps {
  playStacks: PlayStack[]
  time: number
  lineups: LineUps
  rosters: Rosters
  disabled?: boolean
}

export interface PlayersOptions {
  value: PlayerId
  text: string
  number: string
  disabled: boolean
}
export type ActionsOptions = { [key: TeamId]: ActionsOptionItem[] }
export interface ActionsOptionItem {
  value: PlayKey
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

const emit = defineEmits(['new-play-stack'])
const getTeamIdFromPlayerId = (playerId: PlayerId): TeamId => {
  return Object.keys(props.lineups).find((teamId: TeamId) =>
    props.lineups[teamId].includes(playerId)
  ) as TeamId
}

const actionsMap: ActionMapItem[] = [
  { actionKey: 'fga' },
  { actionKey: 'fgm', from: ['fga'] },
  { actionKey: 'fg3a' },
  { actionKey: 'oreb', getPlayer: 'team', from: ['fta', 'fga', 'fg3a'], timeOffset: 1 },
  { actionKey: 'dreb', getPlayer: 'opp', from: ['fta', 'fga', 'fg3a'], timeOffset: 1 },
  { actionKey: 'blk', getPlayer: 'opp', from: ['fga', 'fg3a'], timeOffset: 1 },
  { actionKey: 'fg3m', from: ['fg3a'] },
  { actionKey: 'ast', getPlayer: 'teammate', from: ['fgm', 'fg3m'] },

  { actionKey: 'fcm' },
  { actionKey: 'fdr', getPlayer: 'opp', from: ['fcm'] },
  { actionKey: 'fta', from: ['fta', 'fdr', 'ftm'] },
  { actionKey: 'ftm', from: ['fta'] },

  { actionKey: 'tov' },
  { actionKey: 'stl', getPlayer: 'opp', from: ['tov'] },

  { actionKey: 'subout', force: true },
  { actionKey: 'subin', getPlayer: 'roster', from: ['subout'] }
]

const currentPlayStack = ref<PlayStack | undefined>(undefined)
const selectComponent = ref<SelectActionKey | SelectPlayerId | undefined>()

const prevAction = computed<Play | undefined>(() =>
  currentPlayStack.value?.playStack?.length && currentPlayStack.value?.playStack?.length > 0
    ? currentPlayStack.value.playStack[currentPlayStack.value.playStack.length - 1]
    : undefined
)
const endAction = () => {
  if (currentPlayStack.value) {
    emit('new-play-stack', { ...currentPlayStack.value })
    currentPlayStack.value = undefined
    selectComponent.value = undefined
    pushAction()
  }
}
const pushAction = async () => {
  try {
    const selection = await selectActionKey()
    if (!currentPlayStack.value) {
      currentPlayStack.value = {
        time: props.time,
        playStack: []
      }
    }
    const { teamId, actionKey } = selection
    const action: ActionMapItem = actionsMap.find(
      (action) => action.actionKey === actionKey
    ) as ActionMapItem
    try {
      const playerId: PlayerId =
        prevAction.value?.playerId && !action.getPlayer
          ? prevAction.value.playerId
          : await selectPlayer(teamId, action.getPlayer)
      const playObj: Play = {
        actionKey,
        playerId
      }
      currentPlayStack.value.playStack.push(playObj)
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
  if (!currentPlayStack.value) return
  const startIdx = typeof idx === 'number' ? idx : currentPlayStack.value.playStack.length - 1
  currentPlayStack.value.playStack.splice(startIdx, currentPlayStack.value.playStack.length)
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
          ((tId === teamId &&
            (!action.getPlayer ||
              action.getPlayer === 'team' ||
              action.getPlayer === 'teammate' ||
              action.getPlayer === 'roster')) ||
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
  const action = actionsMap.find(
    (action: ActionMapItem) => action.actionKey === prevAction.value?.actionKey
  )
  const hideCancel = !currentPlayStack.value || !currentPlayStack.value.playStack.length
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

const selectPlayer = (teamId: TeamId, getPlayerKey: GetPlayerKey): Promise<PlayerId> => {
  const playerIdList =
    getPlayerKey === 'roster'
      ? Object.keys(props.rosters[teamId]).map((playerId: PlayerId) => playerId)
      : props.lineups[teamId]
  const prevPlayerId: PlayerId = prevAction.value?.playerId as PlayerId
  const options = playerIdList.map((playerId: PlayerId) => {
    return {
      value: playerId as PlayerId,
      text: `${props.rosters[teamId][playerId].fname} ${props.rosters[teamId][playerId].lname}`,
      number: props.rosters[teamId][playerId].number,
      disabled:
        (getPlayerKey === 'teammate' && playerId === prevPlayerId) ||
        (getPlayerKey === 'roster' && props.lineups[teamId].includes(playerId))
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

const currentPlayStacks = computed<PlayStack[]>(() =>
  currentPlayStack.value ? [currentPlayStack.value] : []
)
</script>
<template>
  <ActionsDisplay
    :play-stacks="currentPlayStacks"
    :rosters="rosters"
    show-remove
    @remove="handleRemovelAction"
  />
  <div class="vstack gap-3">
    <template v-if="selectComponent && selectComponent.key === 'actionKey'">
      <SelectAction
        :lineups="lineups"
        :options="selectComponent.options"
        :hide-submit="selectComponent.hideSubmit"
        :hide-cancel="selectComponent.hideCancel"
        @resolve="selectComponent.onSelect"
        @reject="selectComponent.onCancel"
      />
    </template>
    <template v-else-if="selectComponent && selectComponent.key === 'playerId'">
      <SelectPlayer
        :team-id="selectComponent.teamId"
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
