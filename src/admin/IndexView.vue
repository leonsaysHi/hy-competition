<script lang="ts" setup>
import { RouterLink, RouterView } from 'vue-router'
import { provide, type Ref } from 'vue'
import useTeams from '@/composable/useTeams'
import usePlayers from '@/composable/usePlayers'
import useCompetitions from '@/composable/useCompetitions'
import { TeamsLibKey, PlayersLibKey, CompetitionsLibKey } from '@/types/symbols'
import type { Player } from '@/types/players'
import type { Team } from '@/types/teams'
import type { Competition } from '@/types/competitions'
import SpinnerComp from '@/components/SpinnerComp.vue'

const { getRows: getTeams } = useTeams()
const { getRows: getPlayers } = usePlayers()
const { getAdminRows: getCompetitions } = useCompetitions()
const teamsLib = getTeams() as Ref<Team[] | undefined>
const playersLib = getPlayers() as Ref<Player[] | undefined>
const competitionsLib = getCompetitions() as Ref<Competition[] | undefined>
provide(TeamsLibKey, teamsLib)
provide(PlayersLibKey, playersLib)
provide(CompetitionsLibKey, competitionsLib)
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
      <template v-if="teamsLib && playersLib && competitionsLib">
        <RouterView />
      </template>
      <template v-else>
        <SpinnerComp />
        <p>...Loading libraries</p>
        <p>
          Players: {{ playersLib ? 'Ok' : 'Loading...' }} <br />Teams:
          {{ teamsLib ? 'Ok' : 'Loading...' }} <br />Competitions:
          {{ competitionsLib ? 'Ok' : 'Loading...' }}
        </p>
      </template>
    </section>
  </main>
</template>
