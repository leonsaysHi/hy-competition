<script lang="ts" setup>
import type { Game } from '@/types/games'
import { computed, ref } from 'vue'
import useLibs from '@/composable/useLibs'
import GameClock from './components/GameClock.vue'
import LineupsSelect from './components/LineupsSelect.vue'
import PlaysInput from './components/PlaysInput.vue'
import type { CompetitionTeam, TeamId } from '@/types/teams'
import type { CompetitionPlayer, PlayerDoc, PlayerId } from '@/types/players'
import type { Competition } from '@/types/competitions'
import type { PlayerStatKey } from '@/types/stats'

export type LineUpItem = PlayerId | undefined
export interface LineUps {
  [key: TeamId]: LineUpItem[]
}
export type RosterPlayer = CompetitionPlayer & PlayerDoc
export interface Roster {
  [key: PlayerId]: RosterPlayer
}
export interface Rosters {
  [key: TeamId]: Roster
}
export interface Play {
  time: number,
  playerId: PlayerId, 
  actionKey: PlayerStatKey  
}
export type PlayByPlay = Play[]

interface IProps {
  competition: Competition
  game: Game
}
const props = withDefaults(defineProps<IProps>(), {})

const { getPlayer, getTeamName } = useLibs()
const sec = ref(0)
const lineups = ref<LineUps>({})
const rosters = computed(() => {
  return props.game.teams.reduce((rosters: Rosters, teamId: TeamId) => {
    const { players } = props.competition.teams.find(
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
  }, {})
})

const isLineupsReady = computed(() => {
  return Object.keys(lineups.value).length === 2 && Object.keys(lineups.value)
    .every(
      (teamId: TeamId) =>
        Array.isArray(lineups.value[teamId]) && lineups.value[teamId].length === 1 // props.length
    )
})
const isGameReady = computed(() => {
  return isLineupsReady.value
})

const handleClosePeriod = () => {
  console.log('stopped')
}

const data = ref<PlayByPlay>([])

</script>
<template>
  <div class="wrapper vstack">
    <div class="flex-grow-0 hstack justify-content-between border-bottom p-1">
      <div>
        <small>{{ competition?.title }}</small>
        <div class="jersey-team">{{ game.teams.map(getTeamName).join('&times;') }}</div>
      </div>
      <div>Score</div>
    </div>
    <div class="flex-grow-1 vstack gap-3 px-1 py-3">
      <template v-if="!isLineupsReady">
        <LineupsSelect 
          v-model="lineups" 
          :rosters="rosters"
          :length="5"
         />
        
      </template>
      <template v-if="isGameReady">
        <PlaysInput v-model="data" :sec="sec" :lineups="lineups" />
      </template>
    </div>
    <GameClock
      v-model="sec"
      class="p-1"
      :game-length="9 * 1000"
      :nb-periods="3"
      :disabled="!isGameReady"
      @stopped="handleClosePeriod"
    />
  </div>
</template>
<style scoped lang="scss">
.wrapper {
  min-height: 100vh;
}
</style>
./components/LineUpsSelect.vue
