<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<template>
  <header class="bd-header bg-primary py-3 d-flex align-items-stretch text-bg-dark shadow">
    <div class="container-xl d-flex align-items-center">
      <a class="navbar-brand d-flex align-items-center gap-3" href="/">Logo </a>
      <nav class="nav nav-masthead justify-content-center ms-auto">
        <RouterLink :to="{ name: 'home' }" class="nav-link text-white fw-bold text-uppercase">{{
          t('sections.home')
        }}</RouterLink>
        <RouterLink :to="{ name: 'teams' }" class="nav-link text-white fw-bold text-uppercase">{{
          t('sections.team', 2)
        }}</RouterLink>
        <RouterLink :to="{ name: 'players' }" class="nav-link text-white fw-bold text-uppercase">{{
          t('sections.player', 2)
        }}</RouterLink>
      </nav>
    </div>
  </header>
</template>
