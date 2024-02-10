<script lang="ts" setup>
import { RouterLink, RouterView } from 'vue-router'
import { computed, provide, type Ref } from 'vue'
import useTeams from '@/composable/useTeams'
import usePlayers from '@/composable/usePlayers'
import useCompetitions from '@/composable/useCompetitions'
import { TeamsKey, PlayersKey, CompetitionsKey } from '@/types/symbols'
import type { Player } from '@/types/players'
import type { Team } from '@/types/teams'
import type { Competition } from '@/types/competitions'

const { getAdminRows: getTeams } = useTeams()
const { getRows: getPlayers } = usePlayers()
const { getAdminRows: getCompetitions } = useCompetitions()
const teams = getTeams() as Ref<Team[] | undefined>
const players = getPlayers() as Ref<Player[] | undefined>
const competitions = getCompetitions() as Ref<Competition[] | undefined>
provide(TeamsKey, teams)
provide(PlayersKey, players)
provide(CompetitionsKey, competitions)
const isBusy = computed(() => {
  return (
    !Array.isArray(teams.value) ||
    !Array.isArray(players.value) ||
    !Array.isArray(competitions.value)
  )
})
</script>
<template>
  <header class="d-flex flex-wrap justify-content-center py-3 mb-4 border-bottom">
    <RouterLink
      :to="{ name: 'admin' }"
      class="mb-3 mb-md-0 ms-3 me-md-auto link-body-emphasis text-decoration-none"
    >
      <span class="fs-4">Admin</span>
    </RouterLink>

    <ul class="nav col-12 col-md-auto mb-2 justify-content-center mb-md-0">
      <li class="nav-item">
        <RouterLink :to="{ name: 'admin-teams' }" class="nav-link">Teams</RouterLink>
      </li>
      <li class="nav-item">
        <RouterLink :to="{ name: 'admin-players' }" class="nav-link">Players</RouterLink>
      </li>
    </ul>
  </header>
  <main>
    <section class="py-5 container">
      <template v-if="isBusy">...loading</template>
      <template v-else>
        <RouterView />
      </template>
    </section>
  </main>
</template>
