<script setup lang="ts">
import ViewHeader from '@/cityhoops/components/layout/ViewHeader.vue'
import ViewFooter from '@/cityhoops/components/layout/ViewFooter.vue'

import { useRoute } from 'vue-router';
import { computed } from 'vue';
const route = useRoute()
const competitionId = computed(() => {
  const { competitionId } = route.params as { competitionId: string | undefined }
  return competitionId
})
</script>

<template>
  <div class="wrapper">
    <ViewHeader :key="competitionId" />
    <main>
      <section class="py-4 container-xl">
        <RouterView />
      </section>
    </main>
    <ViewFooter :key="competitionId" />
  </div>
</template>
<style lang="scss" scoped>
.wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  main {
    flex: 1 0 0;
  }
}
</style>
