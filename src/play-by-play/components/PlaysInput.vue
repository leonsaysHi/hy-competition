<script lang="ts" setup>
import SelectAction from '@/play-by-play/components/actions/SelectAction.vue'
import SelectPlayer from '@/play-by-play/components/actions/SelectPlayer.vue'
import { computed, ref, onMounted, defineComponent, type Component} from 'vue'
import type { LineUpItem, LineUps, Play, PlayByPlay, PlayKey, RosterPlayer, Rosters } from '../GameInput.vue';
import type { PlayerId } from '@/types/players';
import type { TeamId } from '@/types/teams';

import { useI18n } from 'vue-i18n'
import type { PlayerStatKey } from '@/types/stats';
const { t } = useI18n()

interface ActionMapItem {
  actionKey: PlayKey,
  from?: PlayKey[] ,
  getPlayer?: 'team' | 'opp' | 'roster'
  timeOffset?: number
}
interface IProps {
    modelValue: PlayByPlay
    time: number
    lineups: LineUps
    rosters: Rosters
    disabled?: boolean
}

export interface PlayersOptions  {
  value: PlayerId
  text: string
  row: RosterPlayer
  disabled: boolean
}
export type ActionsOptions = { [key: TeamId]: ActionsOptionItem[] }
export interface ActionsOptionItem { value: PlayKey, text: string }

interface UIStackItem {
  is: Component
  options: (ActionsOptions | PlayersOptions[])
  onSelect: (reason?: any) => void
  onCancel: (reason?: any) => void
}

const props = withDefaults(defineProps<IProps>(), {
  disabled: false
})

const getTeamIdFromPlayerId = (playerId: PlayerId): TeamId => {
  return Object.keys(props.lineups)
    .find((teamId: TeamId) => props.lineups[teamId].includes(playerId)) as TeamId
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

  { actionKey: 'subout' },
    { actionKey: 'subin', getPlayer: 'roster', from: ['subout'] },
]
const actionsStack = ref<Play[]>([])
const uiStack = ref<UIStackItem[]>([])

const prevAction = computed<Play | undefined>(() =>
actionsStack.value.length > 0 ? actionsStack.value[actionsStack.value.length - 1] : undefined
)

const pushAction = async () => {
  const { teamId, actionKey } = await selectActionKey()
  const action: ActionMapItem = actionsMap.find((action) => action.actionKey === actionKey) as ActionMapItem
  const time = props.time + (action.timeOffset || 0)
  const playerId: PlayerId = prevAction.value?.playerId && !action.getPlayer
    ? prevAction.value.playerId
    : await selectPlayer(teamId)
  const playObj: Play = { actionKey, time, playerId }
  actionsStack.value.push(playObj)
  if (getActionsOptions(actionKey)){
    pushAction()
    }
}
onMounted(() => {
  pushAction()
})

const getActionsOptions = (fromKey: (PlayKey | undefined) = undefined): (ActionsOptions | undefined) => {
  const teamId = prevAction.value?.playerId ? getTeamIdFromPlayerId(prevAction.value.playerId) : undefined
  const options = Object.keys(props.lineups)
    .reduce((result: ActionsOptions, tId: TeamId) => {
      result[tId] = actionsMap
        .filter((action) => {
            if (!fromKey) {
              return !action.from
            }
            return (
              action.from?.includes(fromKey) &&
              (
                (tId === teamId && (!action.getPlayer || action.getPlayer === 'team')) ||
                (tId !== teamId && action.getPlayer === 'opp')

              )
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
const selectActionKey = (): Promise<{ actionKey: PlayKey, teamId?: TeamId }> => {
  return new Promise((res, rej) => {
    const row: UIStackItem = {
      is: SelectAction,
      options: getActionsOptions(prevAction.value?.actionKey) as ActionsOptions,
      onSelect: res,
      onCancel: rej
    }
    uiStack.value.push(row)
  })
}
const getPlayersOption = (teamId: TeamId, excludeId: PlayerId | undefined = undefined): PlayersOptions[] => props.lineups[teamId]
  .map((playerId: LineUpItem) => {
    return {
      value: playerId as PlayerId,
      text: `${props.rosters[teamId][playerId].fname} ${props.rosters[teamId][playerId].lname}`,
      row: props.rosters[teamId][playerId],
      disabled: !excludeId && playerId === excludeId
    }
  })
const selectPlayer = (teamId: TeamId, excludeId: PlayerId | undefined = undefined): Promise<PlayerId> => {
  return new Promise((res, rej) => {
    uiStack.value.push({
      is: SelectPlayer,
      options: getPlayersOption(teamId, excludeId),
      onSelect: res,
      onCancel: rej
    } as UIStackItem)
  })
}
</script>
<template>
  <div class="vstack gap-3">
    <template v-for="(ui, idx) in uiStack" :key="idx">
      <component
        :is="{ ...ui.is }"
        :lineups="lineups"
        :options="ui.options"
        @select="ui.onSelect"
        @cancel="ui.onCancel"
      />
    </template>
    {{ actionsStack }}
  </div>
</template>
