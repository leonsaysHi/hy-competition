<script lang="ts" setup>
import SpinnerComp from '@/components/SpinnerComp.vue'
import useTeamsLib from '@/composable/useTeamsLib'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const { isReady } = useTeamsLib()
const deepPage = computed(() => {
  const { teamId } = route.params
  return !!teamId
})
</script>
<template>
  <template v-if="!isReady"><SpinnerComp /></template>
  <template v-else
    ><template v-if="deepPage">
      <div class="mb-4">
        <RouterLink class="icon-link align-items-baseline" :to="{ name: 'teams' }">
          <i class="bi bi-arrow-left-circle"></i>
          <span>Teams list</span>
        </RouterLink>
      </div>
    </template>
    <RouterView></RouterView>
  </template>
</template>
@/composable/useTeamsLib
