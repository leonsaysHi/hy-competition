<script setup lang="ts">
import ViewHeader from '@/cityhoops/components/layout/ViewHeader.vue'
import ViewFooter from '@/cityhoops/components/layout/ViewFooter.vue'

</script>

<template>
  <div class="wrapper">
    <ViewHeader />
    <main>
      <section class="py-4 container-xl">
        <RouterView />
      </section>
    </main>
    <ViewFooter />
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
