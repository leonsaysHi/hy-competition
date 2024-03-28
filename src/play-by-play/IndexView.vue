<script lang="ts" setup>
import { RouterView } from 'vue-router'
import { useRoute } from 'vue-router'
import SpinnerComp from '@/components/SpinnerComp.vue'
import usePlayByPlay from '@/composable/usePlayByPlay'
import type { GameId } from '@/types/games'
import type { CompetitionId } from '@/types/competitions'

const route = useRoute()
const { competitionId, gameId } = route.params as { competitionId: CompetitionId; gameId: GameId }
const {
  isReady: isPlayByPlayReady,
  competition,
  game,
  rosters,
  config,
  model
} = usePlayByPlay(competitionId, gameId)
</script>
<template>
  <div class="wrapper vstack justify-content-around">
    <template v-if="!isPlayByPlayReady || !game || !rosters || !config">
      <SpinnerComp />
    </template>
    <template v-else>
      <RouterView :competition="competition" :game="game" :model="model" />
    </template>
  </div>
</template>

<style scoped lang="scss">
.wrapper {
  min-height: 100vh;
}
</style>
