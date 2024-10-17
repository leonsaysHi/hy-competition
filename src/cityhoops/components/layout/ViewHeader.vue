<script setup lang="ts">
import ImageComp from '@/components/ImageComp.vue'
import CityHoopsLogo from '@/cityhoops/assets/cityhoops.png'
import CompetitionNavigation from '../CompetitionNavigation.vue'
import SocialsNav from '../SocialsNav.vue'
import { useRoute } from 'vue-router';
import { computed } from 'vue';
const route = useRoute()
const competitionId = computed(() => {
  const { competitionId } = route.params as { competitionId: string | undefined }
  return competitionId
})
</script>

<template>
  <header class="py-4 shadow">
    <div class="container-xl">
      <nav class="navbar navbar-expand-lg">
        <a class="navbar-brand d-flex align-items-center gap-3" href="/"
          ><ImageComp :src="CityHoopsLogo" :width="60" fluid />
        </a>
        <template v-if="competitionId">
          <button
            class="ms-auto navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarNav">
            <CompetitionNavigation />
          </div>
          <SocialsNav class="ms-auto d-none d-lg-flex" />
        </template>
      </nav>
    </div>
  </header>
</template>
