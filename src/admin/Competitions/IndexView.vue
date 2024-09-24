<script lang="ts" setup>
import { RouterView } from 'vue-router'
import { useRoute, useRouter } from 'vue-router'
import useCompetition from '@/composable/useCompetition'
import SpinnerComp from '@/components/SpinnerComp.vue'
import { computed, watch } from 'vue'
import AlertComp from '@/components/AlertComp.vue'
import useCompetitionAdmin from '@/composable/useCompetitionAdmin'
import type { CompetitionTeam } from '@/types/team'

const route = useRoute()
const router = useRouter()
const { competitionId } = route.params
const rName: String = route.params.name?.toString() || ''
const { isReady, row } = useCompetition(competitionId)
const { updateCompetitionComputeds } = useCompetitionAdmin(competitionId)
const currentPhaseValid = computed(
  () => Array.isArray(row?.value?.phases) && row.value.phases.length
)
const teamsValid = computed(() => row.value?.teams && row.value.teams.length > 1)
const rostersValid = computed(
  () =>
    teamsValid.value && row.value?.teams.every((team: CompetitionTeam) => team.players.length >= 5)
)

watch(
  () => row.value,
  (val) => {
    if (val && (!teamsValid.value || !rostersValid.value)) {
      router.push({ ...route, name: 'admin-competition-teams' })
    }
  }
)

// Updates computed on competition update
watch(
  () => row.value?.lastUpdate,
  (val, oldVal) => {
    if (row.value && val && oldVal && val !== oldVal) {
      console.log('Update computed...')
      updateCompetitionComputeds(row.value)
    }
  }
)
</script>
<template>
  <template v-if="isReady">
    <div class="d-flex align-items-start justify-content-between gap-3">
      <h1>{{ row?.title }}</h1>
      <RouterLink
        class="btn btn-light"
        :to="{ name: 'competition', params: { competitionId } }"
        >View</RouterLink
      >
    </div>
    
  </template>
  <template v-if="isReady">
    <template v-if="!teamsValid">
      <AlertComp variant="warning"
        >You should add at least 2 teams to the competition.</AlertComp>
    </template>
    <template v-else-if="!rostersValid">
      <AlertComp variant="warning"
        >All teams should have at least 5 players.</AlertComp>
    </template>
    <template v-else-if="!currentPhaseValid">
      <AlertComp variant="warning">You should initiate a first competition phase.</AlertComp>
    </template>
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
      </RouterLink>
    </li>
    <li class="nav-item">
      <RouterLink
        class="nav-link"
        :class="{ active: rName?.includes('team'), disabled: !isReady }"
        :to="{ ...route, name: 'admin-competition-teams' }"
      >
        Teams
        <template v-if="isReady && !rostersValid">
          <span class="text-danger"><i class="bi bi-exclamation-triangle-fill"></i></span>
        </template>
      </RouterLink>
    </li>
    <li class="nav-item">
      <RouterLink
        class="nav-link"
        :class="{
          active: rName?.includes('phase'),
          disabled: !isReady || !teamsValid || !rostersValid
        }"
        :to="{ ...route, name: 'admin-competition-phases' }"
      >
        Phases
        <template v-if="isReady && !currentPhaseValid">
          <span class="text-danger"><i class="bi bi-exclamation-triangle-fill"></i></span>
        </template>
      </RouterLink
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
