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
const sec = ref(0)

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
      <div class="vstack border-bottom">
        <small>{{ row?.title }}</small>
        <div class="jersey-team">{{ game.teams.map(getTeamName).join('&times;') }}</div>
      </div>
      <div>
        <Clock
          v-model="sec"
          :game-length="20 * 1000"
          :nb-periods="2"
          @stopped="handleClosePeriod"
        />
      </div>
      <small>{{ sec }}</small>
    </div>
  </template>
</template>
<style scoped lang="scss">
.wrapper {
  min-height: 100vh;
}
</style>
./components/ClockComp.vue
