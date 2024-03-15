<script lang="ts" setup>
import { useRoute } from 'vue-router'
import useCompetition from '@/composable/useCompetition'
import SpinnerComp from '@/components/SpinnerComp.vue'
import type { Game } from '@/types/games'
import { computed, ref } from 'vue'
import useLibs from '@/composable/useLibs'
import Clock from './components/ClockComp.vue'

const route = useRoute()
const { competitionId, gameId } = route.params
const { isReady, row } = useCompetition(competitionId)
const { getTeamName } = useLibs()
const game = computed(() => row.value?.games.find((game: Game) => game.id === gameId))
const milli = ref(0)

const handleClosePeriod = () => {
  console.log('stopped')
}
</script>
<template>
  <template v-if="!isReady || !game">
    <SpinnerComp />
  </template>
  <template v-else>
    <div class="wrapper vstack">
      <div class="flex-grow-0 vstack border-bottom">
        <small>{{ row?.title }}</small>
        <div class="jersey-team">{{ game.teams.map(getTeamName).join('&times;') }}</div>
      </div>
      <div class="flex-grow-1 vstack justify-content-center align-items-center">
        <small>{{ Math.floor(milli / 1000) }}</small>
      </div>
      <div>
        <Clock
          v-model="milli"
          :game-length="9 * 1000"
          :nb-periods="3"
          @stopped="handleClosePeriod"
        />
      </div>
    </div>
  </template>
</template>
<style scoped lang="scss">
.wrapper {
  min-height: 100vh;
}
</style>
./components/ClockComp.vue
