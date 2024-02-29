<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import SpinnerComp from '@/components/SpinnerComp.vue'
import TableComp from '@/components/TableComp.vue'
import ImageComp from '@/components/ImageComp.vue'
import type { Game } from '@/types/games'
import TeamLogo from '@/components/teams/TeamLogo.vue'
import useLibs from '@/composable/useLibs'
import useCompetition from '@/composable/useCompetition'
import GamesList from '@/components/games/GamesList.vue'
import { getTeamStatsFromGames } from '@/models/CompetitionComputed'
import useOptionsLib from '@/composable/useOptionsLib'
import type { TableField, TableItem } from '@/types/comp-table'
import LastGames from '@/components/games/LastGames.vue'
import type { CompetitionTeam } from '@/types/teams'

const route = useRoute()
const { competitionId, teamId } = route.params

const { getTeamName } = useLibs()
const { teamStandingKeys } = useOptionsLib()
const { isReady, row, games, teams } = useCompetition(competitionId)

const competitionTeam = computed(() => {
  return teams.value?.find((team: CompetitionTeam) => team.id === teamId)
})
const teamGames = computed<Game[]>(() =>
  Array.isArray(games.value)
    ? games.value
        .filter((game: Game) => game.teams.includes(teamId))
        .filter((game: Game) => game.isFinished)
    : []
)
const statsFields: TableField[] = [
  ...teamStandingKeys.map((opt: Option) => ({
    key: opt.value,
    label: opt.text
  }))
]
const statsItems = computed<TableItem[]>(() => {
  return [
    {
      pos: '?',
      ...(getTeamStatsFromGames(teamId, teamGames.value) as unknown as TableItem)
    }
  ]
})
</script>
<template>
  <div>
    <template v-if="!isReady || !row?.id">
      <SpinnerComp />
    </template>
    <template v-else>
      <div class="position-relative mt-4 pb-3 d-flex flex-column align-items-center">
        <div class="position-absolute top-0 end-0">
          <ImageComp :src="competitionTeam?.sponsor" :width="100" />
        </div>
        <TeamLogo :team-id="teamId" :size="150" />
        <div class="display-3 fw-bold jersey-team">{{ getTeamName(teamId) }}</div>
      </div>
      <TableComp :fields="statsFields" :items="statsItems">
        <template #hist="{ value }">
          <LastGames :value="value" :length="5" />
        </template>
      </TableComp>
      <hr />
      <GamesList :items="teamGames" />
    </template>
  </div>
</template>
<style lang="scss" scoped></style>
