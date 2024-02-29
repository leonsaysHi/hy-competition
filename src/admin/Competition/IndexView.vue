<script lang="ts" setup>
import { RouterView } from 'vue-router'
import { useRoute } from 'vue-router'
import useCompetition from '@/composable/useCompetition'
import SpinnerComp from '@/components/SpinnerComp.vue'
import { computed } from 'vue'
import AlertComp from '@/components/AlertComp.vue'
import ButtonComp from '@/components/ButtonComp.vue'

const route = useRoute()
const { competitionId } = route.params
const { isReady, row } = useCompetition(competitionId)
const teamsListMinLength = computed(
  () => Array.isArray(row?.value?.teams) && row.value.teams.length >= 2
)
const hasCurrentPhase = computed(() => Array.isArray(row?.value?.phases) && row.value.phases.length)
</script>
<template>
  <h1>{{ row?.title || '...' }}</h1>
  <template v-if="isReady && !teamsListMinLength">
    <AlertComp variant="warning"> You should add at least 2 teams to the competition. </AlertComp>
  </template>
  <template v-if="isReady && teamsListMinLength && !hasCurrentPhase">
    <AlertComp variant="warning"> You should initiate a competition phase. </AlertComp>
  </template>
  <ul class="nav nav-tabs mb-4">
    <li class="nav-item">
      <RouterLink
        class="nav-link"
        :class="{ active: route.name?.includes('team'), disabled: !isReady }"
        :to="{ ...route, name: 'admin-competition-teams' }"
        >Teams</RouterLink
      >
    </li>
    <li class="nav-item">
      <RouterLink
        class="nav-link"
        :class="{ active: route.name?.includes('phase'), disabled: !isReady }"
        :to="{ ...route, name: 'admin-competition-phases' }"
        >Phases</RouterLink
      >
    </li>
    <li class="nav-item">
      <RouterLink
        class="nav-link"
        :class="{
          active: route.name?.includes('game'),
          disabled: !isReady || !teamsListMinLength || !hasCurrentPhase
        }"
        :to="{ ...route, name: 'admin-competition-games' }"
        >Games</RouterLink
      >
    </li>
    <li class="nav-item">
      <RouterLink
        class="nav-link"
        :class="{ active: route.name?.includes('configuration'), disabled: !isReady }"
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
