<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header class="d-flex flex-wrap justify-content-center py-3 mb-4 border-bottom">
    <a
      href="/"
      class="d-flex align-items-center mb-3 mb-md-0 me-md-auto link-body-emphasis text-decoration-none"
    >
      <svg class="bi me-2" width="40" height="32"><use xlink:href="#bootstrap"></use></svg>
      <span class="fs-4">Simple header</span>
    </a>

    <ul class="nav col-12 col-md-auto mb-2 justify-content-center mb-md-0">
      <li class="nav-item">
        <RouterLink :to="{ name: 'home' }" class="nav-link">Home</RouterLink>
      </li>
      <li class="nav-item">
        <RouterLink :to="{ name: 'about' }" class="nav-link">About</RouterLink>
      </li>
      <li class="nav-item">
        <RouterLink :to="{ name: 'teams' }" class="nav-link">Teams</RouterLink>
      </li>
      <li class="nav-item">
        <RouterLink :to="{ name: 'players' }" class="nav-link">Players</RouterLink>
      </li>
    </ul>
  </header>
  <main>
    <section class="py-5 container">
      <RouterView />
    </section>
  </main>
</template>
