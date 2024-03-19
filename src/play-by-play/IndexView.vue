<script lang="ts" setup>
import { RouterView } from 'vue-router'
import { useRoute } from 'vue-router'
import SpinnerComp from '@/components/SpinnerComp.vue'
import usePlayByPlay from '@/composable/usePlayByPlay'

const route = useRoute()
const { competitionId, gameId } = route.params
const {
  isReady: isPlayByPlayReady,
  competition,
  game,
  rosters,
  config,
  row: playByPlay
} = usePlayByPlay(competitionId, gameId)
</script>
<template>
  <div class="wrapper vstack justify-content-around">
    <template v-if="!isPlayByPlayReady || !game || !rosters || !config">
      <SpinnerComp />
    </template>
    <template v-else>
      <RouterView
        :competition="competition"
        :rosters="rosters"
        :competition-config="config"
        :game="game"
        :data="playByPlay"
      />
    </template>
  </div>
</template>

<style scoped lang="scss">
.wrapper {
  min-height: 100vh;
}
</style>
