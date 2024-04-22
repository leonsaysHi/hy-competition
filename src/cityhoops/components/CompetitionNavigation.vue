<script lang="ts" setup>
  import { useRoute } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  const { t } = useI18n()
  const route = useRoute()
  const { competitionId } = route.params as { competitionId: string | undefined }
</script>
<template>
  <template v-if="!competitionId">
    No competition.
  </template>
  <template v-else>
    <nav class="nav">
      <RouterLink :to="{ name: 'competition', params: { competitionId } }" class="nav-link text-white fw-bold">Inicio</RouterLink>
      <RouterLink :to="{ name: 'competition-standing', params: { competitionId } }" class="nav-link text-white fw-bold">Tablas</RouterLink>
      <RouterLink :to="{ name: 'competition-games', params: { competitionId } }" class="nav-link text-white fw-bold">Resultdos</RouterLink>
    </nav>
  </template>
</template>
