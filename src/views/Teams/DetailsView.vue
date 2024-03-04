<script lang="ts" setup>
import { useRoute } from 'vue-router'
import useLibs from '@/composable/useLibs'
import SpinnerComp from '@/components/SpinnerComp.vue'
import TableComp from '@/components/TableComp.vue'
import { computed } from 'vue'
import type { TeamId } from '@/types/teams'
import useOptionsLib from '@/composable/useOptionsLib'
import useTeamComputed from '@/composable/useTeamComputed'
import TeamLogo from '@/components/teams/TeamLogo.vue'
import LastGames from '@/components/games/LastGames.vue'
import type { CompetitionStandingComputed } from '@/models/CompetitionComputed'

const route = useRoute()
const { teamId } = route.params as { teamId: TeamId }

const { teamStandingKeys, getCategory } = useOptionsLib()
const { isReady, getTeam, getCompetition } = useLibs()
const { isReady: isTeamComputedReady, rows } = useTeamComputed(teamId)
const team = computed(() => getTeam(teamId))
const fields = computed(() => [
  { key: 'competition', label: 'Competitions' },
  ...teamStandingKeys.map((opt: Option) => ({
    key: opt.value,
    label: opt.text,
    thClass: 'text-end',
    tdClass: 'text-end'
  })),
  { key: 'hist', label: 'L5', thClass: 'text-end', tdClass: 'text-end' }
])
const items = computed(() => {
  return rows.value?.map((row: CompetitionStandingComputed) => {
    const competition = getCompetition(row.id)

    return {
      competition,
      ...row
    }
  })
})
</script>
<template>
  <div>
    <template v-if="!isReady || !isTeamComputedReady">
      <SpinnerComp />
    </template>
    <template v-else>
      <div class="d-flex flex-column align-items-center gap-2">
        <TeamLogo :team-id="teamId" :size="150" />
        <h1 class="display-6 fw-bold jersey-team">{{ team?.title }}</h1>
      </div>
      <p>List current and past competitions w/ results</p>
      <TableComp :fields="fields" :items="items">
        <template #competition="{ value }">
          <RouterLink
            class="d-flex flex-column align-items-start"
            :to="{ name: 'competition', params: { competitionId: value.id } }"
          >
            <div>{{ value.title }}</div>
            <div class="d-flex gap-3 small text-body-secondary">
              <small>{{ value.date }}</small>
              <small>{{ getCategory(value.category)?.text }}</small>
            </div>
          </RouterLink>
        </template>
        <template #hist="{ value }">
          <LastGames :items="value" :length="5" />
        </template>
      </TableComp>
    </template>
  </div>
</template>
