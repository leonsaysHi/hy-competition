<script lang="ts" setup>
import { RouterView, type RouteRecordName } from 'vue-router'
import { useRoute } from 'vue-router'
import useCompetition from '@/composable/useCompetition'
import SpinnerComp from '@/components/SpinnerComp.vue'
import { computed, watch } from 'vue'
import AlertComp from '@/components/AlertComp.vue'
import useCompetitionAdmin from '@/composable/useCompetitionAdmin'
import type { CompetitionTeam } from '@/types/teams'

const route = useRoute()
const { competitionId } = route.params
const rName: String = route.params.name?.toString() || ''
const { isReady, row } = useCompetition(competitionId)
const { updateCompetitionComputeds } = useCompetitionAdmin(competitionId)
const currentPhaseValid = computed(() => Array.isArray(row?.value?.phases) && row.value.phases.length)
const teamsValid = computed (() => row.value?.teams && 
  row.value.teams.length > 1)
const rostersValid = computed (() => teamsValid.value &&
  row.value?.teams.every((team: CompetitionTeam) => team.players.length >= 5)
)

// Updates computed on compatition update
watch(
  () => row.value?.lastUpdate,
  (val, oldVal) => {
    if (row.value && val && oldVal && val !== oldVal) {
      console.log('Update computed...')
      updateCompetitionComputeds(row.value)
    }
  },
  { deep: true }
)
</script>
<template>
  <template v-if="isReady">
    <h1>{{ row?.title }}</h1>
  </template>
  <template v-if="isReady && !rostersValid">
    <AlertComp variant="warning">You should add at least 2 teams to the competition. All teams should have at least 5 players.</AlertComp>
  </template>
  <template v-if="isReady && rostersValid && !currentPhaseValid">
    <AlertComp variant="warning"> You should initiate a competition phase. </AlertComp>
  </template>
  <ul class="nav nav-tabs mb-4">
    <li class="nav-item">
      <RouterLink
        class="nav-link"
        :class="{
          active: rName.includes('game'),
          disabled: !isReady || !teamsValid || !currentPhaseValid
        }"
        :to="{ ...route, name: 'admin-competition-games' }"
        >
        Games
        </RouterLink
      >
    </li>
    <li class="nav-item">
      <RouterLink
        class="nav-link"
        :class="{ active: rName?.includes('team'), disabled: !isReady }"
        :to="{ ...route, name: 'admin-competition-teams' }"
        >
        Teams
        <template v-if="!rostersValid">
          <span class="text-danger"><i class="bi bi-exclamation-triangle-fill"></i></span>
        </template>
        </RouterLink
      >
    </li>
    <li class="nav-item">
      <RouterLink
        class="nav-link"
        :class="{
          active: rName?.includes('phase'),
          disabled: !isReady || !teamsValid
        }"
        :to="{ ...route, name: 'admin-competition-phases' }"
        >Phases</RouterLink
      >
    </li>
    <li class="nav-item">
      <RouterLink
        class="nav-link"
        :class="{ active: rName?.includes('configuration'), disabled: !isReady }"
        :to="{ ...route, name: 'admin-competition-configuration' }"
        >Settings</RouterLink
      >
    </li>
  </ul>
  <template v-if="!isReady">
    <SpinnerComp />
  </template>
  <template v-else>
    <RouterView />
  </template>
</template>
