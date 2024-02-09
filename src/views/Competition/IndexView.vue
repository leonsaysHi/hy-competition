<script lang="ts" setup>
import { useCompetitionDetails } from '@/stores/competitions'
import { useCompetitionGames } from '@/stores/games'
import { useRoute } from 'vue-router'
import { provide } from 'vue'
const route = useRoute()
const { competitionId } = route.params
const competition = useCompetitionDetails(competitionId as string)
const games = useCompetitionGames(competitionId as string)
provide('competition', competition)
provide('games', games)
</script>
<template>
  <template v-if="!competition?.id || !Array.isArray(games)">
    Loading competition details...
  </template>
  <template v-else>
    <RouterView></RouterView>
  </template>
</template>
