<script lang="ts" setup>
import { RouterView } from 'vue-router'
import { useRoute } from 'vue-router'
import useCompetitions from '@/composable/useCompetitions'

import type { CompetitionTeam, TeamId } from '@/types/teams'
import type { CompetitionPlayer } from '@/types/players'
import { CompetitionsLibKey, CompetitionKey } from '@/types/symbols'
import { provide, inject, computed, type Ref } from 'vue'
import type { Competition, CompetitionId } from '@/types/competitions'
import type { Game } from '@/types/games'
import SpinnerComp from '@/components/SpinnerComp.vue'

const route = useRoute()
const { competitionId } = route.params

const competitionsLib = inject(CompetitionsLibKey)

const {
  getRowGames: getCompetitionGames,
  getRowTeams: getCompetitionTeams,
  getRowTeamPlayers: getCompetitionTeamPlayers
} = useCompetitions()

const games = getCompetitionGames(competitionId as CompetitionId) as Ref<Game[] | undefined>
const teams = getCompetitionTeams(competitionId as CompetitionId) as Ref<
  CompetitionTeam[] | undefined
>
const playersList = computed((): { [key: TeamId]: Ref<CompetitionPlayer[]> } => {
  return teams.value
    ? teams.value?.reduce((acc, team: CompetitionTeam) => {
        return {
          ...acc,
          [team.id]: getCompetitionTeamPlayers(
            competitionId as CompetitionId,
            team.id as TeamId
          ) as Ref<CompetitionPlayer[] | undefined>
        }
      }, {})
    : []
})
const computedCompetition: Ref<Competition | undefined> = computed((): Competition | undefined => {
  const allPlayersList = Object.values(playersList.value).map((row) => row.value)
  if (!games.value || !teams.value || !allPlayersList.every(Boolean)) {
    return undefined
  }
  const row = competitionsLib?.value?.find((r) => r.id === competitionId)
  return {
    ...row,
    teams: teams.value?.map((team: CompetitionTeam) => {
      return {
        ...team,
        players: playersList.value?.[team.id]?.value || []
      }
    }),
    games: games?.value || []
  } as Competition
})

const providedCompetition: Ref<Competition> = computed(
  (): Competition => (computedCompetition.value as Competition) || ({} as Competition)
)
provide(CompetitionKey, providedCompetition)
</script>
<template>
  <h1>Competition admin</h1>
  <h5>{{ computedCompetition?.title || '...' }}</h5>
  <ul class="nav nav-tabs mb-4">
    <li class="nav-item">
      <RouterLink
        class="nav-link"
        :class="{ active: route.name?.includes('game'), disabled: !computedCompetition }"
        :to="{ ...route, name: 'admin-competition-games' }"
        >Games</RouterLink
      >
    </li>
    <li class="nav-item">
      <RouterLink
        class="nav-link"
        :class="{ active: route.name?.includes('team'), disabled: !computedCompetition }"
        :to="{ ...route, name: 'admin-competition-teams' }"
        >Teams</RouterLink
      >
    </li>
    <li class="nav-item">
      <RouterLink
        class="nav-link"
        :class="{ active: route.name?.includes('configuration'), disabled: !computedCompetition }"
        :to="{ ...route, name: 'admin-competition-configuration' }"
        >Configuration</RouterLink
      >
    </li>
  </ul>
  <template v-if="computedCompetition">
    <RouterView />
  </template>
  <template v-else>
    <SpinnerComp />
  </template>
</template>
