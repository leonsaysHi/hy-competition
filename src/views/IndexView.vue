<script setup lang="ts">
import ImageComp from '@/components/ImageComp.vue'
import { RouterLink, RouterView } from 'vue-router'

import { useI18n } from 'vue-i18n'
import CityHoopsLogo from '@/assets/images/cityhoops.png'
import HoopsYardLogo from '@/assets/images/hoops-yard.png'
import CompetitionNavigation from '@/cityhoops/components/CompetitionNavigation.vue'

const { t } = useI18n()
</script>

<template>
  <div class="wrapper">
    <header class="bd-header bg-primary py-3 d-flex align-items-stretch text-bg-dark shadow">
      <div class="container-xl d-flex align-items-center">
        <a class="navbar-brand d-flex align-items-center gap-3" href="/"
          ><ImageComp :src="CityHoopsLogo" :width="150" fluid />
        </a>
        <nav class="nav nav-masthead justify-content-center ms-auto">
          <RouterLink :to="{ name: 'home' }" class="nav-link text-white fw-bold text-uppercase">{{
            t('sections.home')
          }}</RouterLink>

          <RouterLink :to="{ name: 'teams' }" class="nav-link text-white fw-bold text-uppercase">{{
            t('sections.team', 2)
          }}</RouterLink>
          <RouterLink
            :to="{ name: 'players' }"
            class="nav-link text-white fw-bold text-uppercase"
            >{{ t('sections.player', 2) }}</RouterLink
          >
        </nav>
      </div>
    </header>

    <main>
      <section class="py-4 container-xl">
        <RouterView />
      </section>
    </main>
    <footer class="text-body-secondary py-4 border-top">
      <div class="container-xl">
        <div class="row">
        <div class="col col-12 col-lg-2"><h1>CITY HOOPS</h1></div>
        <div class="col col-12 col-lg-5">
          <h6>Sobre nosotros</h6>
          <p>
            City Hoops es una liga de baloncesto profesional nivel amateur.
            <br />Estamos a tus órdenes si requieres más información. ¡Contáctanos!
          </p>
        </div>
        <div class="col col-12 col-lg-5">
          <h6>Contáctanos</h6>
          <p>
            Nuestros datos de contacto son:
            <br />Cel/WhatsApp: 507 6611-6363 / 507 6616-2625
            <br />E-mail: contacto@cityhoopspty.com
          </p>
        </div>
      </div>
      <hr />
      <div class="d-flex justify-content-between">
        <CompetitionNavigation />
        <div>
          <p>
            Powered by <ImageComp :src="HoopsYardLogo" title="Hoops Yard" :width="35" />
          </p>
          <p class="mb-0">City Hoops PTY © 2024. Todos los derechos reservados.</p>
        </div>
      </div>
      </div>
    </footer>
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
