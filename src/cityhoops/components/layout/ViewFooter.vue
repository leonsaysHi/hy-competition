<script setup lang="ts">
import ImageComp from '@/components/ImageComp.vue'
import HoopsYardLogo from '@/assets/images/hoops-yard.png'
import CompetitionNavigation from '../CompetitionNavigation.vue'
</script>

<template>
  <footer class="py-4 border-top">
    <div class="container-xl">
      <div class="row">
        <div class="col col-12 col-lg-2"><h1>CITY HOOPS</h1></div>
        <div class="col col-12 col-lg-5">
          <h5>Sobre nosotros</h5>
          <p>
            City Hoops es una liga de baloncesto profesional nivel amateur.
            <br />Estamos a tus órdenes si requieres más información. ¡Contáctanos!
          </p>
        </div>
        <div class="col col-12 col-lg-5">
          <h5>Contáctanos</h5>
          <p>
            Nuestros datos de contacto son:
            <br />Cel/WhatsApp: 507 6611-6363 / 507 6616-2625 <br />E-mail:
            contacto@cityhoopspty.com
          </p>
        </div>
      </div>
      <hr />
      <div class="d-flex justify-content-between">
        <CompetitionNavigation />
        <div class="small">
          <p>Powered by <ImageComp :src="HoopsYardLogo" title="Hoops Yard" :width="35" /></p>
          <p class="mb-0">City Hoops PTY © 2024. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  </footer>
</template>
