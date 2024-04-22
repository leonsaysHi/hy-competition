<script setup lang="ts">
import ImageComp from '@/components/ImageComp.vue'
import CityHoopsLogo from '@/cityhoops/assets/cityhoops.png'
import CompetitionNavigation from '../CompetitionNavigation.vue'
import SocialsNav from '../SocialsNav.vue'
</script>

<template>
  <header class="py-4 d-flex align-items-stretch shadow">
    <div class="container-xl d-flex align-items-center">
      <a class="navbar-brand d-flex align-items-center gap-3" href="/"
        ><ImageComp :src="CityHoopsLogo" :width="60" fluid />
      </a>
      <CompetitionNavigation />
      <SocialsNav class="ms-auto" />
    </div>
  </header>
</template>
