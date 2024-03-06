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
import type { CompetitionStandingComputed } from '@/types/computed'
import useOptionsLib from '@/composable/useOptionsLib'
import type { TableField, TableItem } from '@/types/comp-table'
import type { Option } from '@/types/comp-fields'
import LastGames from '@/components/games/LastGames.vue'
import type { CompetitionTeam } from '@/types/teams'

import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const route = useRoute()
const { competitionId, teamId } = route.params as { competitionId: string; teamId: string }

const { getTeamName } = useLibs()
const { teamStandingKeys } = useOptionsLib()
const { isReady, games, teams, competitionStandings } = useCompetition(competitionId)

const competitionComputed = computed<CompetitionStandingComputed | undefined>(() => {
  return competitionStandings.value?.find(
    (stand: CompetitionStandingComputed) => stand.teamId === teamId
  )
})
const statsItem = computed<TableItem[]>(() => {
  return competitionComputed.value ? [competitionComputed.value as unknown as TableItem] : []
})

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
  ...teamStandingKeys.map(
    (opt: Option): TableField => ({
      key: opt.value,
      label: opt.text,
      thClass: 'text-end',
      tdClass: 'text-end'
    })
  ),
  {
    label: t('options.standingStats.text.hist'),
    key: 'hist',
    thClass: 'text-center',
    tdClass: 'text-end'
  }
]
</script>
<template>
  <div>
    <template v-if="!isReady">
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
      <TableComp :fields="statsFields" :items="statsItem">
        <template #hist="{ value }">
          <LastGames :items="value" :length="5" />
        </template>
      </TableComp>
      <hr />
      <h3>{{ t('global.game', 2) }}</h3>
      <GamesList :items="teamGames" />
    </template>
  </div>
</template>
<style lang="scss" scoped></style>
