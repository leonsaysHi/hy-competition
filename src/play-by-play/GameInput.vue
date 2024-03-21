<script lang="ts" setup>
import type { Game, GameId } from '@/types/games'
import { computed, ref } from 'vue'
import useLibs from '@/composable/useLibs'
import GameClock from './components/GameClock.vue'
import GameScores from './components/GameScores.vue'
import LineupsSelect from './components/LineupsSelect.vue'
import PlaysInput from './components/PlaysInput.vue'
import type { TeamId } from '@/types/teams'
import type { CompetitionPlayer, PlayerDoc, PlayerId } from '@/types/players'
import type { Competition, CompetitionConfig, CompetitionId } from '@/types/competitions'
import type { PlayerStatKey } from '@/types/stats'
import ActionsDisplay from './components/ActionsDisplay.vue'
import PlayByPlayModel from '@/models/PlayByPlay'
import usePlayByPlay from '@/composable/usePlayByPlay'
import { useRoute } from 'vue-router'
import { add } from '@/utils/maths'

export interface LineUps {
  [key: TeamId]: PlayerId[]
}
export type RosterPlayer = CompetitionPlayer & PlayerDoc
export interface Roster {
  [key: PlayerId]: RosterPlayer
}
export interface Rosters {
  [key: TeamId]: Roster
}
export type PlayKey = PlayerStatKey | 'subout' | 'subin'
export interface Play {
  playerId: PlayerId
  actionKey: PlayKey
}
export interface PlayStack {
  id?: string
  time: number
  playStack: Play[]
}

interface IProps {
  competition: Competition
  game: Game
  model: PlayByPlayModel
}
const props = withDefaults(defineProps<IProps>(), {})

const route = useRoute()
const { competitionId, gameId } = route.params as { competitionId: CompetitionId; gameId: GameId }
const { writePlayStack  } = usePlayByPlay(competitionId, gameId)
const { getTeamName } = useLibs()
const { gameLength, nbPeriods, otLength, lineupLength } = props.model.config

const time = ref<number>(props.model.time || 0)
const periodIdx = ref<number>(
  props.model.time <= gameLength 
  ? Math.floor(props.model.time / (gameLength / nbPeriods))
  : props.model.time <= gameLength
  ? Math.floor((props.model.time - gameLength) / otLength)
  : 0
)
const periodsLength = computed<number[]>(() => {
  return new Array(Math.max(nbPeriods, periodIdx.value + 1))
    .fill(null)
    .map((length: number, idx: number) => {
      return idx < nbPeriods ? gameLength / nbPeriods : otLength
    })
})
const isGameTied = computed<boolean>(() => {
  const scores = Object.values(props.model.scores).map((scores: number[]) =>
    scores.reduce(add, 0)
  )
  return scores[0] === scores[1]
})
const isGameOver = computed<boolean>(() => periodIdx.value === periodsLength.value.length - 1)

const lineups = computed<LineUps>(() => props.model.lineups || {})
const isLineupsReady = computed(() => {
  return (
    Object.keys(lineups.value).length === 2 &&
    Object.keys(lineups.value).every(
      (teamId: TeamId) =>
        Array.isArray(lineups.value[teamId]) && lineups.value[teamId].length === lineupLength
    )
  )
})
const handleNextPeriod = () => {
  periodIdx.value += 1
}
const handleEndOfPeriod = () => {
  if (isGameOver.value) {
    if (isGameTied.value) {
      handleNextPeriod()
    }
    else {
      const time = periodsLength.value.reduce(add, 0)
      const subouts: Play[] = []
      Object.values(lineups.value).forEach((lineup: PlayerId[]) => {
        lineup.forEach((playerId: PlayerId) => {
          subouts.push({ playerId, actionKey: 'subout' })
        })
      })
      writePlayStack({ time, playStack: subouts })
    }
  }
}

const handleInitLineups = (payload: LineUps) => {
  const subins: Play[] = []
  Object.keys(payload).forEach((teamId: TeamId) => {
    payload[teamId].forEach((playerId: PlayerId) => {
      subins.push({ playerId, actionKey: 'subin' })
    })
  })
  writePlayStack({ time: 0, playStack: subins})
}

const handleNewPlayStack = (playStack: PlayStack) => {
  writePlayStack(playStack)
}

const isGameReady = computed(() => {
  return isLineupsReady.value
})

</script>
<template>
  <div class="flex-grow-0 hstack justify-content-between border-bottom p-1">
    <div>
      <small>{{ competition?.title }}</small>
      <div class="jersey-team">{{ game.teams.map(getTeamName).join('&times;') }}</div>
    </div>
    <GameScores :scores="model.scores" />
  </div>
  <GameClock
    v-model="time"
    class="p-1"
    :period-idx="periodIdx"
    :periods-length="periodsLength"
    :disabled="!isGameReady"
    @end-of-period="handleEndOfPeriod"
    @next-period="handleNextPeriod"
  />
  <div class="flex-grow-1 vstack gap-3 px-1 py-3">
    <template v-if="!isLineupsReady">
      <LineupsSelect :rosters="model.rosters" :length="lineupLength" @confirmed="handleInitLineups" />
    </template>
    <template v-if="isGameReady">
      <PlaysInput 
        :play-stacks="model.playStacks" 
        :time="time" 
        :lineups="lineups" 
        :rosters="model.rosters" 
        @new-play-stack="handleNewPlayStack"
      />
    </template>
  </div>
  <div class="pb-3 border-bottom">
    <ActionsDisplay :play-stacks="model.playStacks" :rosters="model.rosters" :length="1" compact />
  </div>
</template>
