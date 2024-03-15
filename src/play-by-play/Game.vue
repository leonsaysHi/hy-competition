<script lang="ts" setup>
import type { Game } from '@/types/games'
import { computed, ref } from 'vue'
import useLibs from '@/composable/useLibs'
import GameClock from './components/GameClock.vue'
import PlayersInSelect from './components/PlayersInSelect.vue'
import type { CompetitionTeam, TeamId } from '@/types/teams'
import type { CompetitionPlayer, PlayerDoc, PlayerId } from '@/types/players'
import type { Competition } from '@/types/competitions'

export type PlayerIn = PlayerId | undefined
export interface PlayersIn { [key: TeamId]: PlayerIn[] }
export type RosterPlayer = CompetitionPlayer & PlayerDoc
export interface Roster { [key: PlayerId]: RosterPlayer }
export interface Rosters { [key: TeamId]: Roster }

interface IProps {
  competition: Competition
  game: Game
}
const props = withDefaults(defineProps<IProps>(), {
  
})

const { getPlayer, getTeamName } = useLibs()
const milli = ref(0)
const playersIn = ref<PlayersIn>(props.game.teams.reduce((result: PlayersIn, teamId: TeamId) => {
  result[teamId] = []
  return result
}, {} as PlayersIn))
const rosters = computed(() => {
  return props.game.teams  
    .reduce((rosters: Rosters, teamId: TeamId) => {
      const { players } = props.competition.teams.find((team: CompetitionTeam) => team.id === teamId) as CompetitionTeam
      rosters[teamId] = players.reduce((result: Roster, player: CompetitionPlayer) => {
        const playerId:PlayerId = player.id
        result[playerId] = {
          ...player,
          ...getPlayer(playerId)
        } as RosterPlayer
        return result
      }, {})
      return rosters
    }, {})
})
const playersReady = computed(() => props.game.teams.every((teamId: TeamId) => Array.isArray(playersIn.value[teamId]) && playersIn.value[teamId].length === 5))
const gameReady = computed(() => playersReady.value)

const handleClosePeriod = () => {
  console.log('stopped')
}
</script>
<template>
    <div class="wrapper vstack">
      <div class="flex-grow-0 hstack justify-content-between border-bottom p-1">
        <div>
          <small>{{ competition?.title }}</small>
          <div class="jersey-team">{{ game.teams.map(getTeamName).join('&times;') }}</div>
        </div>
        <div>
          Score
        </div>
      </div>
      <div class="flex-grow-1 vstack justify-content-center align-items-center p-1">
        <div class="hstack gap-3">
          <template v-for="teamId in game.teams" :key="teamId">
            <div class="flex-grow-1">
              <h2>{{ getTeamName(teamId) }}</h2>
              <PlayersInSelect 
                v-model="playersIn[teamId]" 
                :roster="rosters[teamId]" 
                :length="5"
              />
            </div>
          </template>
        </div>
      </div>
      <GameClock
        v-model="milli"
        class="p-1"
        :game-length="9 * 1000"
        :nb-periods="3"
        :disabled="!gameReady"
        @stopped="handleClosePeriod"
      />
    </div>
</template>
<style scoped lang="scss">
.wrapper {
  min-height: 100vh;
}
</style>./components/PlayersInSelect.vue
