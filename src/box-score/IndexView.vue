<script lang="ts" setup>
import { RouterView } from 'vue-router'
import { useRoute } from 'vue-router'
import SpinnerComp from '@/components/SpinnerComp.vue'
import useGame from '@/composable/useGame'
import type { GameId } from '@/types/games'
import type { CompetitionId } from '@/types/competitions'

const route = useRoute()
const { competitionId, gameId } = route.params as { competitionId: CompetitionId; gameId: GameId }
const { isReady, row, competition, config, rosters } = useGame(competitionId, gameId)
</script>
<template>
  <div class="wrapper vstack justify-content-around">
    <template v-if="!isReady">
      <SpinnerComp />
    </template>
    <template v-else>
      <RouterView :competition="competition" :config="config" :rosters="rosters" :game="row" />
    </template>
  </div>
</template>

<style scoped lang="scss">
.wrapper {
  min-height: 100vh;
}
</style>
