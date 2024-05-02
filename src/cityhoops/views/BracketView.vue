<script setup lang="ts">
import CityHoopsLogo from '@/cityhoops/assets/cityhoops.png'
import ImageComp from '@/components/ImageComp.vue'
import HoopsYardLogo from '@/assets/images/hoops-yard.png'
</script>

<template>
  <div class="wrapper">
    <div class="container-xl text-center py-3">
      <ImageComp :src="CityHoopsLogo" :width="100" fluid />
    </div>
    <main>
      <section class="py-4 container-xl">
        <RouterView />
      </section>
    </main>
    <div class="container text-center">
      <p class="mb-0">City Hoops PTY © 2024. Todos los derechos reservados.</p>
      <p>Powered by <ImageComp :src="HoopsYardLogo" title="Hoops Yard" :width="35" /></p>
    </div>
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
