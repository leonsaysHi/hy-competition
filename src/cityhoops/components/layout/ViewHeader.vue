<script setup lang="ts">
import ImageComp from '@/components/ImageComp.vue'
import CityHoopsLogo from '@/cityhoops/assets/cityhoops.png'
import CompetitionNavigation from '../CompetitionNavigation.vue'
import SocialsNav from '../SocialsNav.vue'
import { useRoute } from 'vue-router';
const route = useRoute()
const { competitionId } = route.params as { competitionId: string | undefined }
</script>

<template>
  <header class="py-4 shadow">
    <div class="container-xl">
      <nav class="navbar navbar-expand-lg">
        <a class="navbar-brand d-flex align-items-center gap-3" href="/"
          ><ImageComp :src="CityHoopsLogo" :width="60" fluid />
        </a>
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
          <template v-if="competitionId">
            <CompetitionNavigation />
          </template>
        </div>
        <template v-if="competitionId">
          <SocialsNav class="ms-auto d-none d-lg-flex" />
        </template>
      </nav>
    </div>
  </header>
</template>
