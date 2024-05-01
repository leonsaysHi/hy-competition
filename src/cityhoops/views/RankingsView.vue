<script lang="ts" setup>
import { useRoute } from 'vue-router'
import SpinnerComp from '@/components/SpinnerComp.vue'
import useCompetition from '@/composable/useCompetition'
import CompetitionStanding from '@/components/competitions/CompetitionStanding.vue'
import CompetitionRanking from '@/components/competitions/CompetitionRanking.vue'
import ViewHero from '../components/layout/ViewHero.vue'

const route = useRoute()
const { competitionId } = route.params as { competitionId: string }
const { isReady, competitionRankings, competitionStandings } = useCompetition(competitionId)
</script>
<template>
  <div>
    <template v-if="!isReady">
      <div class="py-5"><SpinnerComp /></div>
    </template>
    <template v-else>
      <ViewHero>
        <h1>Tabla y estadística</h1>
      </ViewHero>
      <h2>Tabla</h2>
      <CompetitionStanding :value="competitionStandings" />
      <h2>Líderes por categorías</h2>
      <CompetitionRanking :value="competitionRankings" :limit="25" />
    </template>
  </div>
</template>
