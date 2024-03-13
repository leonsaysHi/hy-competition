<script lang="ts" setup>
import { RouterView } from 'vue-router'
import { useRoute } from 'vue-router'
import useCompetition from '@/composable/useCompetition'
import SpinnerComp from '@/components/SpinnerComp.vue'
import type { Game } from '@/types/games'
import { computed } from 'vue'

const route = useRoute()
const { competitionId, gameId } = route.params
const { isReady, row } = useCompetition(competitionId)
const game = computed(() => row.value?.games.find((game: Game) => game.id === gameId))
</script>
<template>
  <template v-if="!isReady || !game">
    <SpinnerComp />
  </template>
  <template v-else>
    <RouterView />
  </template>
</template>
