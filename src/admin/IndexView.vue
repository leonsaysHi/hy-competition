<script lang="ts" setup>
import { RouterLink, RouterView } from 'vue-router'
import useLibs from '@/composable/useLibs'
import SpinnerComp from '@/components/SpinnerComp.vue'
import useAuthentification from '@/composable/useAuthentification';
import ButtonComp from '@/components/ButtonComp.vue';
const { logOut } = useAuthentification()
const { isReady: isLibsReady } = useLibs()
const handleLogOut = () => {
  console.log('log out')
  logOut()
}
</script>
<template>
  <header class="bd-header bg-primary py-3 d-flex align-items-stretch text-bg-dark">
    <div class="container d-flex align-items-center">
      <nav class="nav nav-masthead justify-content-center ms-auto">
        <RouterLink :to="{ name: 'admin' }" class="nav-link text-white">Competitions</RouterLink>
        <RouterLink :to="{ name: 'admin-teams' }" class="nav-link text-white">Teams</RouterLink>
        <RouterLink :to="{ name: 'admin-players' }" class="nav-link text-white">Players</RouterLink>
        <RouterLink :to="{ name: 'logout' }" class="nav-link text-white">Logout</RouterLink>
      </nav>
    </div>
  </header>
  <main>
    <section class="py-5 container-xl">
      <template v-if="!isLibsReady">
        <SpinnerComp />
      </template>
      <template v-else>
        <RouterView />
      </template>
    </section>
  </main>
</template>
