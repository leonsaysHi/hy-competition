<script lang="ts" setup>
import { useRoute } from 'vue-router'
import useLibs from '@/composable/useLibs'
import SpinnerComp from '@/components/SpinnerComp.vue'
import { computed } from 'vue'
import type { PlayerId } from '@/types/players';

const route = useRoute()
const { playerId } = route.params as { playerId: PlayerId }

const { isReady, getPlayer } = useLibs()
const row = computed(() => getPlayer(playerId))
</script>
<template>
  <div>
    <template v-if="!isReady">
      <SpinnerComp />
    </template>
    <template v-else>
      <h1>{{ row?.fname }} {{ row?.lname }}</h1>
      <h2>Competitions</h2>
      <p>List current and past competitions w/ avg, awards</p>
      {{ row }}
    </template>
  </div>
</template>
