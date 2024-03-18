<script lang="ts" setup>
import type { Game, GameId } from '@/types/games'
import { computed, ref, watch } from 'vue'
import useLibs from '@/composable/useLibs'
import GameClock from './components/GameClock.vue'
import GameScores from './components/GameScores.vue'
import LineupsSelect from './components/LineupsSelect.vue'
import PlaysInput from './components/PlaysInput.vue'
import type { CompetitionTeam, TeamId } from '@/types/teams'
import type { CompetitionPlayer, PlayerDoc, PlayerId } from '@/types/players'
import type { Competition, CompetitionConfig, CompetitionId } from '@/types/competitions'
import type { PlayerStatKey } from '@/types/stats'
import ActionsDisplay from './components/ActionsDisplay.vue'
import PlayByPlayModel from '@/models/PlayByPlay'
import usePlayByPlay from '@/composable/usePlayByPlay'
import { useRoute } from 'vue-router'

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
  time: number
  playerId: PlayerId
  actionKey: PlayKey
}
export interface PlayStackDoc { 
  id?: number,
  playStack: PlayStack
}
export type PlayStack = Play[]
export type PlayByPlay = PlayStack[]

interface IProps {
  competition: Competition
  competitionTeams: CompetitionTeam[]
  competitionConfig: CompetitionConfig
  game: Game
  data?: PlayByPlay
}
const props = withDefaults(defineProps<IProps>(), {
  data: () => ([]),
  time: 0
})

const route = useRoute()
const { competitionId, gameId } = route.params as { competitionId: CompetitionId, gameId: GameId }
const { writeStack } = usePlayByPlay(competitionId, gameId)
const { getPlayer, getTeamName } = useLibs()
const { gameLength, nbPeriods, oTLength, lineupLength } = props.competitionConfig

const data = ref<PlayByPlay>(props.data)

const rosters = ref(props.game.teams
  .reduce((rosters: Rosters, teamId: TeamId) => {
      const { players } = props.competitionTeams.find(
        (team: CompetitionTeam) => team.id === teamId
      ) as CompetitionTeam
      rosters[teamId] = players.reduce((result: Roster, player: CompetitionPlayer) => {
        const playerId: PlayerId = player.id
        result[playerId] = {
          ...player,
          ...getPlayer(playerId)
        } as RosterPlayer
        return result
      }, {})
      return rosters
    }, {}
  )
)

const playByPlay = ref<PlayByPlayModel>(
  new PlayByPlayModel(props.game.id, props.competitionConfig, data.value, rosters.value)
)

const time = ref(playByPlay.value?.time || 0)
const lineups = ref<LineUps>(playByPlay.value?.lineups || {})
const isLineupsReady = computed(() => {
  return (
    Object.keys(lineups.value).length === 2 &&
    Object.keys(lineups.value).every(
      (teamId: TeamId) => Array.isArray(lineups.value[teamId]) && lineups.value[teamId].length === lineupLength
    )
  )
})

const handleInitLineups = (payload: LineUps) => {
  const subins: Play[] = []
  Object.keys(payload).forEach((teamId: TeamId) => {
    payload[teamId].forEach((playerId: PlayerId) => {
      subins.push({ time: 0, playerId, actionKey: 'subin' })
    })
  })
  lineups.value = payload
  data.value.push(subins)
}


const isGameReady = computed(() => {
  return isLineupsReady.value
})

const handleClosePeriod = () => {
  console.log('stopped')
}

watch(
  () => data.value.length,
  (val: number, oldVal: number) => {
    if (val > oldVal) {
      const newStack = data.value[data.value.length - 1]
      if (newStack[0].actionKey === 'subout') {
        const outPlayerId = newStack[0].playerId
        const inPlayerId = newStack[1].playerId
        Object.values(lineups.value).forEach((lineup: PlayerId[]) => {
          const idx = lineup.findIndex((playerId: PlayerId) => playerId === outPlayerId)
          if (idx > -1) {
            lineup.splice(idx, 1, inPlayerId)
            return
          }
        })
      }
      writeStack(newStack)
    }
    playByPlay.value = new PlayByPlayModel(
      props.game.id,
      props.competitionConfig,
      data.value,
      rosters.value
    )
  }
)
</script>
<template>
  <div class="flex-grow-0 hstack justify-content-between border-bottom p-1">
    <div>
      <small>{{ competition?.title }}</small>
      <div class="jersey-team">{{ game.teams.map(getTeamName).join('&times;') }}</div>
    </div>
    <GameScores :scores="playByPlay?.scores" />
  </div>
  <GameClock
    v-model="time"
    class="p-1"
    :game-length="gameLength"
    :nb-periods="nbPeriods"
    :ot-length="oTLength"
    :disabled="!isGameReady"
    @stopped="handleClosePeriod"
  />
  <div class="pb-3 border-bottom">
    <ActionsDisplay :items="data" :rosters="rosters" :length="1" compact />
  </div>
  <div class="flex-grow-1 vstack gap-3 px-1 py-3">
    <template v-if="!isLineupsReady">
      <LineupsSelect :rosters="rosters" :length="lineupLength" @confirmed="handleInitLineups" />
    </template>
    <template v-if="isGameReady">
      <PlaysInput v-model="data" :time="time" :lineups="lineups" :rosters="rosters" />
    </template>
  </div>
</template>
