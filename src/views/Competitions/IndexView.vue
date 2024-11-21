<script lang="ts" setup>
import SpinnerComp from '@/components/SpinnerComp.vue'
import useCompetition from '@/composable/useCompetition'
import { logEv } from '@/firebase';
import { computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const { competitionId } = route.params as { competitionId: string }
const { isReady, row } = useCompetition(competitionId)
const deepPage = computed(() => {
  const { teamId, gameId, playerId } = route.params
  return !!(teamId || gameId || playerId)
})

watch(
  () => row.value?.title,
  (val, oldVal) => {
    if (val && val !== oldVal) {
      logEv(val, { competitionId })
    }
  },
  { immediate: true }
)

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
