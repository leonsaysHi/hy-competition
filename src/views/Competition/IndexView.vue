<script lang="ts" setup>
import SpinnerComp from '@/components/SpinnerComp.vue'
import useCompetition from '@/composable/useCompetition'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const { competitionId } = route.params
const { isReady, row } = useCompetition(competitionId)
const deepPage = computed(() => {
  const { teamId, gameId, playerId } = route.params
  return !!(teamId || gameId || playerId)
})
</script>
<template>
  <template v-if="!isReady">
    <SpinnerComp />
  </template>
  <template v-else>
    <template v-if="deepPage">
      <div class="mb-4">
        <RouterLink
          class="icon-link align-items-baseline"
          :to="{ name: 'competition', params: { competitionId } }"
        >
          <i class="bi bi-arrow-left-circle"></i>
          <span>{{ row?.title }}</span>
        </RouterLink>
      </div>
    </template>
    <RouterView></RouterView>
  </template>
</template>
