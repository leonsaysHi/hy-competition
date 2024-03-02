<script lang="ts" setup>
import { useRoute } from 'vue-router'
import useLibs from '@/composable/useLibs'
import SpinnerComp from '@/components/SpinnerComp.vue'
import { computed } from 'vue'
import type { TeamId } from '@/types/teams'

const route = useRoute()
const { teamId } = route.params as { teamId: TeamId }
const { isReady, getTeam } = useLibs()
const row = computed(() => getTeam(teamId))
</script>
<template>
  <div>
    <template v-if="!isReady">
      <SpinnerComp />
    </template>
    <template v-else>
      <h1>{{ row?.title }}</h1>
      <h2>Competitions</h2>
      <p>List current and past competitions w/ results</p>
      {{ row }}
    </template>
  </div>
</template>
