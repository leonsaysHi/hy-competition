<script lang="ts" setup>
import { RouterView } from 'vue-router'
import { useRoute } from 'vue-router'
import useCompetition from '@/composable/useCompetition'
import SpinnerComp from '@/components/SpinnerComp.vue'
import type { Game } from '@/types/games'
import { computed } from 'vue'

const route = useRoute()
const { competitionId, gameId } = route.params
const { isReady, row: competition } = useCompetition(competitionId)
const game = computed(() => competition.value?.games.find((game: Game) => game.id === gameId))
</script>
<template>
  <div class="wrapper vstack justify-content-around">
    <template v-if="!isReady || !game">
      <SpinnerComp />
    </template>
    <template v-else>
      <RouterView :competition="competition" :game="game" />
    </template>
  </div>
</template>

<style scoped lang="scss">
.wrapper {
  min-height: 100vh;
}
</style>
