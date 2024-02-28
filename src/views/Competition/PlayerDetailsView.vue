<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import useCompetition from '@/composable/useCompetition'
import SpinnerComp from '@/components/SpinnerComp.vue'
import type { Game } from '@/types/games'
import useOptionsLib from '@/composable/useOptionsLib'

const route = useRoute()
const { competitionId, gameId } = route.params

const { statsKeys: statsOptions } = useOptionsLib()
const { isReady, row: competition } = useCompetition(competitionId)
const row = computed<Game | undefined>(() =>
  competition.value?.games?.find((game) => game.id === gameId)
)
</script>
<template>
  <div>
    <template v-if="!isReady || !row?.id || !gameComputed">
      <SpinnerComp />
    </template>
    <template v-else> Team details </template>
  </div>
</template>
<style lang="scss" scoped></style>
