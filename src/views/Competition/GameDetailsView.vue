<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import useCompetition from '@/composable/useCompetition'
import SpinnerComp from '@/components/SpinnerComp.vue'

const route = useRoute()
const { competitionId, gameId } = route.params

const { isReady, row: competition } = useCompetition(competitionId)
const row = computed(() => competition.value?.games?.find((game) => game.id === gameId))
</script>
<template>
  <div>
    <h1>Game home</h1>
    <template v-if="!isReady">
      <SpinnerComp />
    </template>
    <template v-else>
      <p>
        {{ row }}
      </p>
    </template>
  </div>
</template>
