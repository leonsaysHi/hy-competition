<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router'
import useCompetition from '@/composable/useCompetition'

import useLibs from '@/composable/useLibs'
import SpinnerComp from '@/components/SpinnerComp.vue'
import GameForm from '@/admin/Competitions/forms/GameForm.vue'
import { computed, ref } from 'vue'
import useCompetitionAdmin from '@/composable/useCompetitionAdmin'
import type { CompetitionId } from '@/types/competitions'
import type { Game, GameId } from '@/types/games'
const { isReady: isLibsReady, getTeamName } = useLibs()

const route = useRoute()
const router = useRouter()
const { competitionId, gameId } = route.params as { competitionId: CompetitionId, gameId: GameId }
const { isReady, row: competition, getGame } = useCompetition(competitionId)
const { writeGame: updateCompetitionGameDoc } = useCompetitionAdmin(competitionId)

const data = computed<Game>(() => ({
  ...getGame(gameId) as Game
}))

const isBusy = ref(false)
const handleSubmit = async (payload) => {
  isBusy.value = true
  await updateCompetitionGameDoc(payload)
  router.push({ ...route, name: 'admin-competition-games' })
}
</script>
<template>
  <nav aria-label="breadcrumb">
    <ol class="breadcrumb">
      <li class="breadcrumb-item" aria-current="page">
        <RouterLink :to="{ name: 'admin-competition-games' }">Games list</RouterLink>
      </li>
      <li class="breadcrumb-item active" aria-current="page">Edit game</li>
    </ol>
  </nav>
  <template v-if="!isLibsReady || !isReady">
    <SpinnerComp />
  </template>
  <template v-else>
    <div class="mb-3 lh-1">
      <h4 class="mb-0">{{ data.teams?.map(getTeamName).join(' &times; ') || '?' }}</h4>
      <small class="text-muted">{{ data.id || 'n/a' }}</small>
    </div>
    <GameForm
      :value="data"
      :competitionTeams="competition?.teams"
      :is-busy="isBusy"
      @submit="handleSubmit"
    />
  </template>
</template>
