<script setup lang="ts">
import BigBet from '@/cityhoops/assets/bigbet.png'
import BigBetFooter from '@/cityhoops/assets/bigbet-footer.png'
import CityHoopsLogo from '@/cityhoops/assets/cityhoops.png'
import ImageComp from '@/components/ImageComp.vue'
import HoopsYardLogo from '@/assets/images/hoops-yard.png'
</script>

<template>
  <div class="wrapper">
    <div class="container-xl hstack gap-4 p-3">
      <a href="//www.cityhoopspty.com" target="_blank"><ImageComp :src="CityHoopsLogo" :width="100" fluid /></a>
      <div class="vr"></div>
      <a href="//bigbet.pa" target="_blank"><ImageComp :src="BigBet" :width="200" fluid /></a>
    </div>
    <main>
      <section class="py-4 container-xl">
        <RouterView />
      </section>
    </main>
    <div class="container vstack gap-3 align-items-center">
      <ImageComp :src="BigBetFooter" :width="300" fluid />
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
