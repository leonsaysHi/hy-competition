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
    <nav class="nav nav-masthead justify-content-center ms-auto">
      <RouterLink :to="{ name: 'competition-home', params: { competitionId } }" class="nav-link text-white fw-bold">{{
        t('competitionNav.home')
      }}</RouterLink>
      <RouterLink :to="{ name: 'competition', params: { competitionId } }" class="nav-link text-white fw-bold text-uppercase">{{
        t('competitionNav.ranking')
      }}</RouterLink>
      <RouterLink :to="{ name: 'competition-games', params: { competitionId } }" class="nav-link text-white fw-bold text-uppercase">{{
        t('competitionNav.games')
      }}</RouterLink>
    </nav>
  </template>
</template>
