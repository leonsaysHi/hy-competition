<script lang="ts" setup>
import SpinnerComp from '@/components/SpinnerComp.vue'
import usePlayersLib from '@/composable/usePlayersLib'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const { isReady } = usePlayersLib()
const deepPage = computed(() => {
  const { playerId } = route.params
  return !!playerId
})
</script>
<template>
  <template v-if="!isReady"><SpinnerComp /></template>
  <template v-else>
    <template v-if="deepPage">
      <div class="mb-4">
        <RouterLink class="icon-link align-items-baseline" :to="{ name: 'players' }">
          <i class="bi bi-arrow-left-circle"></i>
          <span>Players list</span>
        </RouterLink>
      </div>
    </template>
    <RouterView></RouterView>
  </template>
</template>
