<script setup lang="ts">
import ImageComp from '@/components/ImageComp.vue'
import { RouterLink, RouterView } from 'vue-router'

import { useI18n } from "vue-i18n"
const { t } = useI18n()
</script>

<template>
  <header class="d-flex flex-wrap justify-content-center py-3 mb-4 border-bottom">
    <a
      href="/"
      class="d-flex align-items-center gap-3 mb-3 mb-md-0 ps-3 me-md-auto link-body-emphasis text-decoration-none"
    >
      <ImageComp src="https://www.cityhoopspty.com/season4/wp-content/uploads/logo-form-1.png" :width="30" fluid />
      <span class="fs-4 fw-lighter text-uppercase">Cityhoops</span>
    </a>

    <ul class="nav col-12 col-md-auto mb-2 justify-content-center mb-md-0">
      <li class="nav-item">
        <RouterLink :to="{ name: 'home' }" class="nav-link">{{ t('sections.home') }}</RouterLink>
      </li>
      <li class="nav-item">
        <RouterLink :to="{ name: 'about' }" class="nav-link">{{ t('sections.about')}}</RouterLink>
      </li>
      <li class="nav-item">
        <RouterLink :to="{ name: 'teams' }" class="nav-link">{{ t('sections.team', 2) }}</RouterLink>
      </li>
      <li class="nav-item">
        <RouterLink :to="{ name: 'players' }" class="nav-link">{{ t('sections.player', 2) }}</RouterLink>
      </li>
    </ul>
  </header>
  <main>
    <section class="py-4 container">
      <RouterView />
    </section>
  </main>
</template>
