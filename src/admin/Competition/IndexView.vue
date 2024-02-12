<script lang="ts" setup>
import { RouterView } from 'vue-router'
import { useRoute } from 'vue-router'
import useCompetitions from '@/composable/useCompetitions'

import type { CompetitionTeam, TeamId } from '@/types/teams'
import type { CompetitionPlayer } from '@/types/players'
import { CompetitionsKey, TeamsKey, PlayersKey } from '@/types/symbols'
import { inject, computed, type Ref } from 'vue'
import CompetitionClass from '@/models/Competition'
import type { Competition, CompetitionId } from '@/types/competitions'
import type { Game } from '@/types/games'

const route = useRoute()
const { competitionId } = route.params
const competitions = inject(CompetitionsKey)
const teamsLib = inject(TeamsKey)
const playersLib = inject(PlayersKey)

const { 
  getRowGames: getCompetitionGames, 
  getRowTeams: getCompetitionTeams,
  getRowTeamPlayers: getCompetitionTeamPlayers
} = useCompetitions()
const row = competitions?.value?.find(r => r.id === competitionId) as Competition
const games = getCompetitionGames(competitionId as CompetitionId) as Ref<Game[] | undefined>
const teams = getCompetitionTeams(competitionId as CompetitionId) as Ref<CompetitionTeam[] | undefined>

const competitionClass = computed((): CompetitionClass | null => {
  return row && teams.value && games.value 
  ? new CompetitionClass(
    row,
    teams.value, 
    games.value, 
    { playersLib: playersLib.value, teamsLib: teamsLib.value }
  )
  : null
})
</script>
<template>
  <h1>Competition admin</h1>
  <template v-if="!competitionClass">
    ...loading

  </template>
  <template v-else>
    <ul class="nav nav-tabs">
      <li class="nav-item">
        <RouterLink class="nav-link" :class="{ active: route.name === 'admin-competition-home'}" :to="{ ...route, name: 'admin-competition-home' }">Games</RouterLink>
      </li>
      <li class="nav-item">
        <RouterLink class="nav-link" :class="{ active: route.name === 'admin-competition-teams'}" :to="{ ...route, name: 'admin-competition-teams' }">Teams</RouterLink>
      </li>
      <li class="nav-item">
        <RouterLink class="nav-link" :class="{ active: route.name === 'admin-competition-configuration'}" :to="{ ...route, name: 'admin-competition-configuration' }">Configuration</RouterLink>
      </li>
    </ul>
    <RouterView
      :item="competitionClass"
    />
  </template>
</template>
