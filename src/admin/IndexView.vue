<script lang="ts" setup>
import { RouterLink, RouterView } from 'vue-router'
import useLibs from '@/composable/useLibs'
import SpinnerComp from '@/components/SpinnerComp.vue'

const {
  isReady: isLibsReady,
  isPlayersLibReady,
  isCompetitionsLibReady,
  isTeamsLibReady
} = useLibs()
</script>
<template>
  <header class="d-flex flex-wrap justify-content-center py-3 mb-4 border-bottom">
    <RouterLink
      :to="{ name: 'admin' }"
      class="mb-3 mb-md-0 ms-3 me-md-auto link-body-emphasis text-decoration-none"
    >
      <span class="fs-4">Admin</span>
    </RouterLink>

    <ul class="nav col-12 col-md-auto mb-2 justify-content-center mb-md-0">
      <li class="nav-item">
        <RouterLink :to="{ name: 'admin-teams' }" class="nav-link">Teams</RouterLink>
      </li>
      <li class="nav-item">
        <RouterLink :to="{ name: 'admin-players' }" class="nav-link">Players</RouterLink>
      </li>
    </ul>
  </header>
  <main>
    <section class="py-5 container">
      <template v-if="isLibsReady">
        <RouterView />
      </template>
      <template v-else>
        <SpinnerComp />
        <p>...Loading libraries</p>
        <p>
          Players: {{ isPlayersLibReady ? 'Ok' : 'Loading...' }} <br />Teams:
          {{ isTeamsLibReady ? 'Ok' : 'Loading...' }} <br />Competitions:
          {{ isCompetitionsLibReady ? 'Ok' : 'Loading...' }}
        </p>
      </template>
    </section>
  </main>
</template>
