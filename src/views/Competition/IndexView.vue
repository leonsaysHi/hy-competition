<script lang="ts" setup>
import useCompetitions from '@/composable/useCompetitions'
import useGames from '@/composable/useGames'
import type { Competition, CompetitionId } from '@/types/competitions'
import type { Game } from '@/types/games'
import type { Ref } from 'vue'
import { useRoute } from 'vue-router'
import { provide } from 'vue'
import { CompetitionKey, GamesKey } from '@/types/symbols'

const route = useRoute()
const { competitionId } = route.params

const { getRow: getCompetitionDetails } = useCompetitions()
const { getCompetitionRows: getCompetitionGames } = useGames()
const competition = getCompetitionDetails(competitionId as CompetitionId) as Ref<
  Competition | undefined
>
const games = getCompetitionGames(competitionId as CompetitionId) as Ref<Game[] | undefined>
provide(CompetitionKey, competition)
provide(GamesKey, games)
</script>
<template>
  <template v-if="!competition?.id || !Array.isArray(games)">
    Loading competition details...
  </template>
  <template v-else>
    <RouterView></RouterView>
  </template>
</template>
