<script lang="ts" setup>
import SelectAction from './actions/SelectAction.vue'
import SelectPlayer from './actions/SelectPlayer.vue'
import { computed, ref, onMounted } from 'vue'
import type { PlayerId } from '@/types/players'
import type { TeamId } from '@/types/teams'
import type { PlayerStatKey } from '@/types/stats'
import type { Rosters } from '@/types/games'
import type {
  Play,
  PlayMapItem,
  SelectPlayKey,
  SelectPlayerId,
  PlayKey,
  PlayOptions,
  PlayOption
} from '@/types/box-score-recoder'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

interface IProps {
  rosters: Rosters
  trackedStats: PlayerStatKey[]
  disabled?: boolean
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

const playsMap = computed(() => {
  const map: PlayMapItem[] = [
    { playKey: 'fta', from: ['fta', 'fdr', 'ftm'] },
    { playKey: 'ftm', from: ['fta'] },
    { playKey: 'fga' },
    { playKey: 'fgm', from: ['fga'] },
    { playKey: 'fg3a' },
    { playKey: 'fg3m', from: ['fg3a'] },
    { playKey: 'ast', getPlayer: 'teammate', from: ['fgm', 'fg3m'] },
    { playKey: 'oreb', getPlayer: 'team', from: ['fta', 'fga', 'fg3a'] },
    { playKey: 'dreb', getPlayer: 'opp', from: ['fta', 'fga', 'fg3a'] },
    { playKey: 'blk', getPlayer: 'opp', from: ['fga', 'fg3a'] },

    { playKey: 'fcm' },
    { playKey: 'fdr', getPlayer: 'opp', from: ['fcm'] },

    { playKey: 'tov' },
    { playKey: 'stl', getPlayer: 'opp', from: ['tov'] }
  ]
  return map
    .filter((item: PlayMapItem) => props.trackedStats.includes(item.playKey))
    .map((item: PlayMapItem) => ({
      ...item,
      from: item.from?.filter((key: PlayKey) => props.trackedStats.includes(key))
    }))
})

const currentPlayStack = ref<Play[] | undefined>(undefined)
const selectComponent = ref<SelectPlayKey | SelectPlayerId | undefined>()

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
    const selection = await selectPlayKey()
    if (!currentPlayStack.value) {
      currentPlayStack.value = []
    }
    const { teamId, playKey } = selection
    const action: PlayMapItem = playsMap.value.find(
      (action) => action.playKey === playKey
    ) as PlayMapItem
    try {
      const playerId: PlayerId =
        prevAction.value?.playerId && !action.getPlayer
          ? prevAction.value.playerId
          : await selectPlayer(teamId, action)
      const playObj: Play = {
        playKey,
        playerId
      }
      currentPlayStack.value.push(playObj)
      if (getPlayOptions(playKey)) {
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

const getPlayOptions = (fromKey: PlayKey | undefined = undefined): PlayOptions | undefined => {
  const teamId = prevAction.value?.playerId
    ? getTeamIdFromPlayerId(prevAction.value.playerId)
    : undefined
  const options = Object.keys(props.rosters).reduce((result: PlayOptions, tId: TeamId) => {
    result[tId] = playsMap.value
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
        (act): PlayOption => ({
          value: act.playKey,
          text: t(`options.scoreboxRecorder.${act.playKey}`),
          variant: ['ftm', 'fgm', 'fg3m'].includes(act.playKey) ? 'success' : undefined
        })
      )
    return result
  }, {})
  return Object.keys(options).some((teamId: TeamId) => options[teamId].length) ? options : undefined
}

const selectPlayKey = (): Promise<{ playKey: PlayKey; teamId?: TeamId }> => {
  const action = playsMap.value.find(
    (action: PlayMapItem) => action.playKey === prevAction.value?.playKey
  )
  const hideCancel = !currentPlayStack.value || !currentPlayStack.value.length
  const hideSubmit = hideCancel || !!action?.force
  return new Promise((res, rej) => {
    selectComponent.value = {
      key: 'playKey',
      options: getPlayOptions(prevAction.value?.playKey) as PlayOptions,
      hideSubmit,
      hideCancel,
      onSelect: res,
      onCancel: rej
    }
  })
}

const selectPlayer = (teamId: TeamId, playItem: PlayMapItem): Promise<PlayerId> => {
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
    <template v-if="selectComponent && selectComponent.key === 'playKey'">
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
