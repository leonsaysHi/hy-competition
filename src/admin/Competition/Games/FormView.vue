<script lang="ts" setup>
import { useRoute } from 'vue-router'
import useCompetition from '@/composable/useCompetition'

import useLibs from '@/composable/useLibs'
import SpinnerComp from '@/components/SpinnerComp.vue'
import GameForm from '@/admin/competition/forms/GameForm.vue'
import { computed } from 'vue'
const { isReady: isLibsReady } = useLibs()

const route = useRoute()
const { competitionId, gameId } = route.params

const {
  isReady,
  row: competition,
  getGame,
  addGame: updateCompetitionGameDoc
} = useCompetition(competitionId)

const data = computed(() => ({
  ...getGame(gameId)
}))

const handleSubmit = async (payload) => {
  console.log(payload)
  await updateCompetitionGameDoc(payload)
}
</script>
<template>
  <h5>Edit</h5>
  <template v-if="!isLibsReady || !isReady">
    <SpinnerComp />
  </template>
  <template v-else>
    <h4>{{ data.teams.join(' &times; ') }}</h4>
    <p class="small text-muted">{{ data.id || 'n/a' }}</p>
    <GameForm :value="data" :competitionTeams="competition?.teams" @submit="handleSubmit" />
  </template>
</template>
@/composable/useTeams
