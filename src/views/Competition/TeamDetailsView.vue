<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import SpinnerComp from '@/components/SpinnerComp.vue'
import TableComp from '@/components/TableComp.vue'
import type { Game } from '@/types/games'
import TeamLogo from '@/components/teams/TeamLogo.vue'
import useLibs from '@/composable/useLibs'
import useCompetitionComputed from '@/composable/useCompetitionComputed'
import GamesList from '@/components/games/GamesList.vue'
import { getTeamStatsFromGames } from '@/models/CompetitionComputed'
import type { TeamStats } from '@/types/stats'
import useOptionsLib from '@/composable/useOptionsLib'
import type { TableField, TableItem } from '@/types/comp-table'
import LastGames from '@/components/games/LastGames.vue'

const route = useRoute()
const { competitionId, teamId } = route.params

const { getTeamName } = useLibs()
const { teamStatsKeys } = useOptionsLib()
const { isReady, row, games } = useCompetitionComputed(competitionId)

const teamGames = computed<Game[]>(() =>
  Array.isArray(games.value)
    ? games.value
        .filter((game: Game) => game.teams.includes(teamId))
        .filter((game: Game) => game.isFinished)
    : []
)
const statsFields: TableField[] = teamStatsKeys.map((opt: Option) => ({
  key: opt.value,
  label: opt.text
}))
const statsItems = computed<TableItem[]>(() => {
  return [getTeamStatsFromGames(teamId, teamGames.value) as unknown as TableItem]
})
</script>
<template>
  <div>
    <template v-if="!isReady || !row?.id">
      <SpinnerComp />
    </template>
    <template v-else>
      <div class="pt-5 pb-3 d-flex flex-column align-items-center gap-3">
        <TeamLogo :team-id="teamId" :size="150" />
        <h1>{{ getTeamName(teamId) }}</h1>
      </div>
      <TableComp :fields="statsFields" :items="statsItems">
        <template #hist="{ value }">
          <LastGames :value="value" />
        </template>
      </TableComp>
      <hr />
      <GamesList :items="teamGames" />
    </template>
  </div>
</template>
<style lang="scss" scoped></style>
