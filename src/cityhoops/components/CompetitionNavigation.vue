<script lang="ts" setup>
import { useRoute } from 'vue-router'
import SocialsNav from './SocialsNav.vue'
const route = useRoute()
const { competitionId } = route.params as { competitionId: string | undefined }
const handleAboutUs = () => {
  window.scrollTo(0, document.body.scrollHeight);
}
</script>
<template>
  <template v-if="!competitionId"> No competition. </template>
  <template v-else>
    <div class="hstack align-items-start">
      <nav class="nav flex-column flex-lg-row">
        <RouterLink
          :to="{ name: 'competition', params: { competitionId } }"
          class="nav-link text-white fw-bold"
          >Inicio</RouterLink
        >
        <RouterLink
          :to="{ name: 'competition-standing', params: { competitionId } }"
          class="nav-link text-white fw-bold"
          >Tabla</RouterLink
        >
        <RouterLink
          :to="{ name: 'competition-games', params: { competitionId } }"
          class="nav-link text-white fw-bold"
          >Resultados</RouterLink
        >
        <a
          @click="handleAboutUs"
          class="nav-link text-white fw-bold"
          >Sobre la liga</a
        >
      </nav>
      <div class="ms-auto d-lg-none"><SocialsNav /></div>
    </div>
    
  </template>
</template>
